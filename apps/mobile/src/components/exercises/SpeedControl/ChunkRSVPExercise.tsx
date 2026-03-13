/**
 * ChunkRSVP Egzersizi
 * 3 aşama: İçerik Seç → Aktif Okuma → Seans Sonu
 */
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, TextInput, Platform,
} from 'react-native'
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSequence, Easing,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { useAppTheme } from '../../../theme/useAppTheme'
import type { AppTheme } from '../../../theme'
import { READING_THEMES } from '../../../constants/readingThemes'
import { useThemeStore } from '../../../stores/themeStore'
import ContentImportModal, { ImportedContent, saveRecentContent } from '../shared/ContentImportModal'
import {
  tokenizeToChunks, applyDurations, calculateRealTimeWPM,
  rollingAverageWPM, computeSessionARP, applyBionicReading,
  estimateRemainingSeconds, calculateXP, Chunk,
} from './ChunkRSVPEngine'
import type { SessionMetrics } from '../types'
import { QuestionModal } from '../../reading/QuestionModal'
import type { TextQuestion, QuestionAnswer } from '@sprinta/api'
import { supabase } from '../../../lib/supabase'
import { useAuthStore } from '../../../stores/authStore'

// ─── Tipler ────────────────────────────────────────────────────────

export interface ChunkRSVPMetrics extends SessionMetrics {
  avgWPM: number
  peakWPM: number
  totalWords: number
  totalChunks: number
  chunkSize: number
  readingMode: 'sprint' | 'cruise'
  bionicEnabled: boolean
  smartSlowingEnabled: boolean
  arpScore: number
  comprehensionScore: number
  regressionCount: number
  importSource: 'library' | 'text' | 'url'
}

interface Props {
  onComplete:       (metrics: ChunkRSVPMetrics) => void
  onExit:           () => void
  /** Kütüphaneden gelen metin — varsa seçim ekranını atla */
  initialContent?:  ImportedContent | null
  /** Wizard'dan gelen ön-ayarlar */
  initialSettings?: Settings
  /** Tekrar butonuna basıldığında çağrılır (wizard akışı için) */
  onRepeat?:        () => void
  /** Modül accent rengi — tüm okuma ekranında kullanılır */
  accentColor?:     string
}

interface Settings {
  chunkSize: 1 | 2 | 3 | 4 | 5
  bionicReading: boolean
  orpHighlight: boolean
  readingMode: 'sprint' | 'cruise'
  smartSlowing: boolean
  targetWPM: number
}

type Phase = 'select' | 'reading' | 'result'

const DEFAULT_SETTINGS: Settings = {
  chunkSize: 2,
  bionicReading: false,
  orpHighlight: true,
  readingMode: 'sprint',
  smartSlowing: true,
  targetWPM: 250,
}

// ─── Ana Bileşen ───────────────────────────────────────────────────

// ─── Color helpers ─────────────────────────────────────────────────
function hexToRgb(hex: string): [number, number, number] {
  const safe = hex.startsWith('#') ? hex : '#0891B2'
  return [parseInt(safe.slice(1,3),16), parseInt(safe.slice(3,5),16), parseInt(safe.slice(5,7),16)]
}
function darken(hex: string, f = 0.55): string {
  const [r,g,b] = hexToRgb(hex)
  return `rgb(${Math.round(r*f)},${Math.round(g*f)},${Math.round(b*f)})`
}
function lighten(hex: string): string {
  const [r,g,b] = hexToRgb(hex)
  return `rgb(${Math.min(255,Math.round(r*0.12+236))},${Math.min(255,Math.round(g*0.12+236))},${Math.min(255,Math.round(b*0.12+236))})`
}

const FONT_SIZES = [12, 14, 16, 18, 20, 22, 24] as const
type FontSizeVal = typeof FONT_SIZES[number]

export default function ChunkRSVPExercise({ onComplete, onExit, initialContent, initialSettings, onRepeat, accentColor = '#0891B2' }: Props) {
  const t            = useAppTheme()
  const readingTheme = useThemeStore((s) => s.readingTheme)
  const rt           = READING_THEMES[readingTheme]
  const navyBg       = darken(accentColor, 0.45)
  const deepBg       = darken(accentColor, 0.30)
  const lightBg      = lighten(accentColor)
  const s            = useMemo(() => ms(t, rt.background, rt.text, accentColor, navyBg, deepBg, lightBg), [t, readingTheme, accentColor])

  const mergedSettings = initialSettings
    ? { ...DEFAULT_SETTINGS, ...initialSettings }
    : DEFAULT_SETTINGS

  const [phase, setPhase]           = useState<Phase>(initialContent ? 'reading' : 'select')
  const [settings, setSettings]     = useState<Settings>(mergedSettings)
  const [showSettings, setShowSettings] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [content, setContent]       = useState<ImportedContent | null>(initialContent ?? null)

  // Okuma state
  const [chunks, setChunks]         = useState<Chunk[]>(() => {
    // Wizard'dan initialContent geliyorsa hemen tokenize et
    if (initialContent) {
      const raw = tokenizeToChunks(initialContent.text, mergedSettings.chunkSize)
      return applyDurations(raw, mergedSettings.targetWPM, mergedSettings.smartSlowing)
    }
    return []
  })
  const [chunkIdx, setChunkIdx]     = useState(0)
  const [isPlaying, setIsPlaying]   = useState(false)
  const [currentWPM, setCurrentWPM] = useState(mergedSettings.targetWPM)
  const [wpmHistory, setWpmHistory] = useState<number[]>([])
  const [regressionCount, setRegressionCount] = useState(0)
  const [elapsedMs, setElapsedMs]   = useState(0)
  const [startTime, setStartTime]   = useState<number | null>(null)

  // Seans sonu
  const [finalMetrics, setFinalMetrics] = useState<ChunkRSVPMetrics | null>(null)

  // Quiz
  const [showQuiz,   setShowQuiz]   = useState(false)
  const [questions,  setQuestions]  = useState<TextQuestion[]>([])

  const [fontSize, setFontSize] = useState<FontSizeVal>(14)

  const timerRef        = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intervalRef     = useRef<ReturnType<typeof setInterval> | null>(null)
  const fontWidthRef    = useRef(0)

  // Her render'da güncellenen ref'ler (stale closure'ı önler)
  const chunksRef      = useRef<typeof chunks>([])
  const isPlayingRef   = useRef(false)
  const chunkIdxRef    = useRef(0)
  const trackWidthRef  = useRef(0)

  // Animasyon
  const opacity   = useSharedValue(1)
  const chunkAnim = useAnimatedStyle(() => ({ opacity: opacity.value }))

  // ── İçerik seçimi ─────────────────────────────────────────────

  const handleContentSelected = useCallback((c: ImportedContent) => {
    setContent(c)
    setShowImport(false)
    const raw = tokenizeToChunks(c.text, settings.chunkSize)
    const withDurations = applyDurations(raw, currentWPM, settings.smartSlowing)
    setChunks(withDurations)
    setChunkIdx(0)
  }, [settings.chunkSize, settings.smartSlowing, currentWPM])

  const handleStart = () => {
    if (!content || chunks.length === 0) { setShowImport(true); return }
    setPhase('reading')
    setIsPlaying(true)
    setStartTime(Date.now())
    setElapsedMs(0)
    setWpmHistory([])
    setRegressionCount(0)
    setChunkIdx(0)
  }

  // ── Okuma döngüsü ─────────────────────────────────────────────

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
  }, [])

  const scheduleNext = useCallback((idx: number) => {
    if (idx >= chunksRef.current.length) { finishSession(); return }
    const chunk = chunksRef.current[idx]
    if (!chunk) return

    // Yeni chunk → animasyon
    opacity.value = 0
    opacity.value = withTiming(1, { duration: 80, easing: Easing.out(Easing.quad) })

    // WPM geçmişi güncelle
    const now = Date.now()
    const elapsed = startTime ? now - startTime : 0
    const wordsRead = chunksRef.current.slice(0, idx + 1).reduce((s, c) => s + c.words.length, 0)
    const instantWPM = calculateRealTimeWPM(wordsRead, elapsed)
    if (instantWPM > 0) setWpmHistory((h) => [...h.slice(-29), instantWPM])

    timerRef.current = setTimeout(() => {
      setChunkIdx((prev) => {
        const next = prev + 1
        if (next < chunksRef.current.length) scheduleNext(next)
        else finishSession()
        return next
      })
    }, chunk.displayDuration)
  }, [startTime, opacity])  // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isPlaying && phase === 'reading') {
      scheduleNext(chunkIdx)
    }
    return stopTimer
  }, [isPlaying]) // eslint-disable-line react-hooks/exhaustive-deps

  // Elapsed timer
  useEffect(() => {
    if (isPlaying && startTime) {
      intervalRef.current = setInterval(() => {
        setElapsedMs(Date.now() - startTime)
      }, 500)
    } else {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isPlaying, startTime])

  // adjustWPM: hem chunk sürelerini günceller hem oynarken timer'ı yeniden başlatır
  const adjustWPM = useCallback((newWPM: number) => {
    const clamped = Math.max(100, Math.min(800, Math.round(newWPM / 25) * 25))
    if (chunksRef.current.length === 0) { setCurrentWPM(clamped); return }
    const newChunks = applyDurations(chunksRef.current, clamped, settings.smartSlowing)
    chunksRef.current = newChunks  // ref'i hemen güncelle
    setChunks(newChunks)
    setCurrentWPM(clamped)
    Haptics.selectionAsync()
    if (isPlayingRef.current) {
      stopTimer()
      scheduleNext(chunkIdxRef.current)
    }
  }, [settings.smartSlowing, stopTimer, scheduleNext])

  const togglePause = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    if (isPlaying) {
      stopTimer()
      setIsPlaying(false)
    } else {
      setIsPlaying(true)
    }
  }

  const goBack = () => {
    if (chunkIdx <= 0) return
    stopTimer()
    setRegressionCount((r) => r + 1)
    Haptics.selectionAsync()
    const newIdx = Math.max(0, chunkIdx - 10)
    setChunkIdx(newIdx)
    if (isPlaying) scheduleNext(newIdx)
  }

  const goForward = () => {
    if (settings.readingMode !== 'sprint') return
    stopTimer()
    Haptics.selectionAsync()
    const newIdx = Math.min(chunks.length - 1, chunkIdx + 10)
    setChunkIdx(newIdx)
    if (isPlaying) scheduleNext(newIdx)
  }

  const finishSession = useCallback(() => {
    stopTimer()
    setIsPlaying(false)

    const totalDurationSec = startTime ? Math.round((Date.now() - startTime) / 1000) : 60
    const totalWords = chunks.reduce((s, c) => s + c.words.length, 0)
    const avgWPM = rollingAverageWPM(wpmHistory, 30) || currentWPM
    const peakWPM = wpmHistory.length > 0 ? Math.max(...wpmHistory) : avgWPM

    const { rei, csf, arp } = computeSessionARP(avgWPM, 70, regressionCount, totalDurationSec)
    const xp = calculateXP(arp, totalWords, settings.bionicReading, totalDurationSec)

    const metrics: ChunkRSVPMetrics = {
      moduleCode: 'speed_control',
      exerciseId: 'chunk_rsvp',
      difficultyLevel: 5,
      durationSeconds: totalDurationSec,
      wpm: avgWPM,
      comprehension: 70,
      accuracy: 85,
      score: Math.min(100, Math.round(arp / 4)),
      avgWPM,
      peakWPM,
      totalWords,
      totalChunks: chunks.length,
      chunkSize: settings.chunkSize,
      readingMode: settings.readingMode,
      bionicEnabled: settings.bionicReading,
      smartSlowingEnabled: settings.smartSlowing,
      arpScore: arp,
      comprehensionScore: 70,
      regressionCount,
      importSource: content?.source ?? 'text',
    }

    setFinalMetrics(metrics)
    setPhase('result')
    saveRecentContent(content!, avgWPM)
  }, [chunks, wpmHistory, currentWPM, regressionCount, settings, content, startTime, stopTimer])

  // ── AŞAMA 3: Seans Sonu (hook'lar erken return'den önce olmalı) ──
  const fetchAndShowQuiz = useCallback(async () => {
    const textId = content?.libraryTextId
    if (!textId) return
    try {
      const { data } = await (supabase as any)
        .from('text_questions')
        .select('*')
        .eq('text_id', textId)
        .order('order_index')
        .limit(5)
      setQuestions((data as TextQuestion[]) ?? [])
      setShowQuiz(true)
    } catch { /* sessiz */ }
  }, [content])

  // Kütüphane metni tamamlandığında quiz otomatik açılır (1 sn sonra)
  useEffect(() => {
    if (phase === 'result' && content?.source === 'library') {
      const timer = setTimeout(() => fetchAndShowQuiz(), 1000)
      return () => clearTimeout(timer)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  // ── Ref sync (her render'da güncellenir, erken return'lerden önce) ──
  chunksRef.current    = chunks
  isPlayingRef.current = isPlaying
  chunkIdxRef.current  = chunkIdx

  // ── Progress ───────────────────────────────────────────────────

  const progress = chunks.length > 0 ? chunkIdx / chunks.length : 0
  const wordsRead = chunks.slice(0, chunkIdx).reduce((s, c) => s + c.words.length, 0)
  const totalWords = chunks.reduce((s, c) => s + c.words.length, 0)
  const remainingChunks = chunks.slice(chunkIdx)
  const remainingSec = estimateRemainingSeconds(remainingChunks, currentWPM)
  const currentChunk = chunks[chunkIdx]
  const displayWPM = rollingAverageWPM(wpmHistory) || currentWPM

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
    const ss = sec % 60
    return `${m}dk ${ss.toString().padStart(2, '0')}sn`
  }

  // ── AŞAMA 1: İçerik Seç ───────────────────────────────────────

  if (phase === 'select') {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.topBar}>
          <TouchableOpacity onPress={onExit}
            hitSlop={{ top:10, bottom:10, left:10, right:10 }}
            style={s.closeBtn}>
            <Text style={s.closeBtnTxt}>✕</Text>
          </TouchableOpacity>
          <Text style={s.topTitle}>Chunk RSVP</Text>
          <TouchableOpacity onPress={() => setShowSettings(true)}><Text style={s.settingsIcon}>⚙️</Text></TouchableOpacity>
        </View>

        <View style={s.selectScroll}>
          <View style={s.heroBox}>
            <Text style={s.heroEmoji}>📦</Text>
            <Text style={s.heroTitle}>Chunk RSVP</Text>
            <Text style={s.heroSub}>Kelime gruplarını hızlıca işle — Bionic okuma destekli</Text>
          </View>

          {/* OKUMA HIZI kartı */}
          <View style={s.wpmCard}>
            <Text style={s.wpmCardLabel}>OKUMA HIZI</Text>
            <View style={s.wpmRow}>
              <TouchableOpacity
                style={s.wpmAdjBtnSelect}
                onPress={() => setCurrentWPM(w => Math.max(60, w - 25))}
              >
                <Text style={s.wpmAdjTxtSelect}>−</Text>
              </TouchableOpacity>
              <Text style={s.wpmDisplaySelect}>
                {currentWPM} <Text style={s.wpmUnitSelect}>WPM</Text>
              </Text>
              <TouchableOpacity
                style={s.wpmAdjBtnSelect}
                onPress={() => setCurrentWPM(w => Math.min(800, w + 25))}
              >
                <Text style={s.wpmAdjTxtSelect}>+</Text>
              </TouchableOpacity>
            </View>
            <View style={s.wpmPresetsSelect}>
              {([100, 150, 200, 250, 300, 400, 500] as const).map(w => (
                <TouchableOpacity
                  key={w}
                  style={[s.wpmPresetSelect, currentWPM === w && s.wpmPresetSelectActive]}
                  onPress={() => setCurrentWPM(w)}
                >
                  <Text style={[s.wpmPresetSelectTxt, currentWPM === w && s.wpmPresetSelectTxtActive]}>
                    {w}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Grup Boyutu */}
          <View style={s.chunkSizeCard}>
            <Text style={s.wpmCardLabel}>GRUP BOYUTU</Text>
            <View style={s.chunkSizeBtns}>
              {([1, 2, 3, 4, 5] as const).map(n => (
                <TouchableOpacity
                  key={n}
                  style={[s.chunkSizeBtn, settings.chunkSize === n && s.chunkSizeBtnActive]}
                  onPress={() => setSettings(prev => ({ ...prev, chunkSize: n }))}
                >
                  <Text style={[s.chunkSizeBtnTxt, settings.chunkSize === n && s.chunkSizeBtnTxtActive]}>
                    {n}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* İçerik kartı */}
          {content ? (
            <View style={s.contentCard}>
              <Text style={s.contentCardTitle}>{content.title}</Text>
              <Text style={s.contentCardMeta}>{content.wordCount} kelime · ~{content.estimatedMinutes} dk · {content.source}</Text>
              <TouchableOpacity onPress={() => setShowImport(true)} style={s.changeBtn}>
                <Text style={s.changeBtnTxt}>Değiştir</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={s.importBtn} onPress={() => setShowImport(true)}>
              <Text style={s.importBtnEmoji}>📚</Text>
              <Text style={s.importBtnTxt}>İçerik Seç</Text>
              <Text style={s.importBtnSub}>Kütüphane, metin gir veya URL</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[s.startBtn, !content && s.startBtnDisabled]}
            onPress={handleStart}
            disabled={!content}
          >
            <Text style={s.startBtnTxt}>▶ Başlat</Text>
          </TouchableOpacity>
        </View>

        {/* Settings Bottom Sheet */}
        {showSettings && (
          <SettingsSheet settings={settings} onUpdate={setSettings} onClose={() => setShowSettings(false)} t={t} s={s} currentWPM={currentWPM} onWPMChange={setCurrentWPM} />
        )}

        <ContentImportModal
          visible={showImport}
          onClose={() => setShowImport(false)}
          onContentSelected={handleContentSelected}
        />
      </SafeAreaView>
    )
  }

  // ── AŞAMA 2: Aktif Okuma ──────────────────────────────────────

  if (phase === 'reading') {
    return (
      <SafeAreaView style={[s.container, s.readingBg]}>
        {/* Header */}
        <View style={s.readingHeader}>
          <TouchableOpacity
            onPress={() => { stopTimer(); setIsPlaying(false); onExit() }}
            hitSlop={{ top:10, bottom:10, left:10, right:10 }}
            style={s.closeBtn}
          >
            <Text style={s.closeBtnTxt}>✕</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={togglePause}>
            <Text style={s.readingBack}>Chunk RSVP</Text>
          </TouchableOpacity>
          <View style={s.modeRow}>
            <TouchableOpacity
              style={[s.modePill, settings.readingMode === 'sprint' && s.modePillActive]}
              onPress={() => setSettings((p) => ({ ...p, readingMode: 'sprint' }))}
            >
              <Text style={[s.modePillTxt, settings.readingMode === 'sprint' && s.modePillTxtActive]}>Sprint</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.modePill, settings.readingMode === 'cruise' && s.modePillActive]}
              onPress={() => setSettings((p) => ({ ...p, readingMode: 'cruise' }))}
            >
              <Text style={[s.modePillTxt, settings.readingMode === 'cruise' && s.modePillTxtActive]}>Cruise</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => setShowSettings(true)}>
            <Text style={s.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View style={s.progressPanel}>
          <View style={s.progressTrack}>
            <View style={[s.progressFill, { width: `${progress * 100}%` as `${number}%` }]} />
          </View>
          <Text style={s.progressInfo}>
            {wordsRead}/{totalWords} kelime  ·  {formatTime(remainingSec)} kaldı
          </Text>
        </View>

        {/* Chunk Display */}
        <View style={s.chunkStage}>
          <Animated.View style={[s.chunkBox, chunkAnim]}>
            {currentChunk && settings.bionicReading ? (
              <View style={s.chunkWordsRow}>
                {currentChunk.words.map((w, i) => {
                  const b = applyBionicReading(w)
                  return (
                    <Text key={i} style={[s.chunkWord, { fontSize }]}>
                      <Text style={s.bionicBold}>{b.bold}</Text>
                      <Text style={s.bionicLight}>{b.light}</Text>
                      {i < currentChunk.words.length - 1 ? ' ' : ''}
                    </Text>
                  )
                })}
              </View>
            ) : (
              <Text style={[s.chunkText, { fontSize, lineHeight: fontSize * 1.4 }]}>
                {currentChunk?.rawText ?? ''}
              </Text>
            )}
          </Animated.View>
        </View>

        {/* ── Yeni Alt Bölüm (Hız Kontrolü stili) ───────────────── */}

        {/* Açık alan: geri pill + WPM göstergesi */}
        <View style={s.lightBottomRow}>
          <TouchableOpacity style={[s.backPill, { backgroundColor: navyBg }]} onPress={() => { stopTimer(); onExit() }}>
            <Text style={s.backPillTxt}>← Geri</Text>
          </TouchableOpacity>
          <Text style={[s.liveWPM, { color: navyBg }]}>⚡ {displayWPM} WPM</Text>
        </View>

        {/* Duraklat / Devam Et butonu */}
        <TouchableOpacity
          style={[s.pauseBtn, { borderColor: navyBg + '60' }]}
          onPress={togglePause}
          activeOpacity={0.8}
        >
          <Text style={[s.pauseBtnTxt, { color: navyBg }]}>
            {isPlaying ? '⏸  Duraklat' : '▶  Devam Et'}
          </Text>
        </TouchableOpacity>

        {/* Koyu panel: WPM slider + Yazı boyutu slider */}
        <View style={[s.darkSlidersPanel, { backgroundColor: navyBg }]}>
          {/* OKUMA HIZI */}
          <View style={s.sliderLabelRow}>
            <Text style={s.sliderLabel}>⚡ OKUMA HIZI</Text>
            <Text style={s.sliderValue}>{currentWPM} WPM</Text>
          </View>
          <View
            style={s.sliderTrack}
            onLayout={(e) => { trackWidthRef.current = e.nativeEvent.layout.width }}
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => true}
            onResponderGrant={(e) => {
              const pct = Math.max(0, Math.min(1, e.nativeEvent.locationX / trackWidthRef.current))
              adjustWPM(100 + pct * 700)
            }}
            onResponderMove={(e) => {
              const pct = Math.max(0, Math.min(1, e.nativeEvent.locationX / trackWidthRef.current))
              adjustWPM(100 + pct * 700)
            }}
          >
            <View style={[s.sliderFill, { width: `${((currentWPM - 100) / 700) * 100}%` as `${number}%` }]} />
            <View style={[s.sliderThumb, { left: `${((currentWPM - 100) / 700) * 100}%` as `${number}%` }]} />
          </View>

          {/* YAZI BOYUTU */}
          <View style={[s.sliderLabelRow, { marginTop: 10 }]}>
            <Text style={s.sliderLabel}>YAZI BOYUTU</Text>
            <Text style={s.sliderValue}>{fontSize}pt</Text>
          </View>
          <View
            style={s.sliderTrack}
            onLayout={(e) => { fontWidthRef.current = e.nativeEvent.layout.width }}
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => true}
            onResponderGrant={(e) => {
              const pct = Math.max(0, Math.min(1, e.nativeEvent.locationX / fontWidthRef.current))
              const idx = Math.round(pct * (FONT_SIZES.length - 1))
              setFontSize(FONT_SIZES[idx])
            }}
            onResponderMove={(e) => {
              const pct = Math.max(0, Math.min(1, e.nativeEvent.locationX / fontWidthRef.current))
              const idx = Math.round(pct * (FONT_SIZES.length - 1))
              setFontSize(FONT_SIZES[idx])
            }}
          >
            <View style={[s.sliderFill, { width: `${(FONT_SIZES.indexOf(fontSize) / (FONT_SIZES.length - 1)) * 100}%` as `${number}%` }]} />
            <View style={[s.sliderThumb, { left: `${(FONT_SIZES.indexOf(fontSize) / (FONT_SIZES.length - 1)) * 100}%` as `${number}%` }]} />
          </View>
        </View>

        {/* Settings Sheet */}
        {showSettings && (
          <SettingsSheet settings={settings} onUpdate={setSettings} onClose={() => setShowSettings(false)} t={t} s={s} currentWPM={currentWPM} onWPMChange={setCurrentWPM} />
        )}
      </SafeAreaView>
    )
  }

  if (phase === 'result' && finalMetrics) {
    return (
      <>
        <ResultScreen
          metrics={finalMetrics}
          content={content}
          accentColor={accentColor}
          onRepeat={() => {
            if (onRepeat) {
              onRepeat()
            } else {
              setPhase('select')
              setChunkIdx(0)
              setWpmHistory([])
              setRegressionCount(0)
            }
          }}
          onComplete={() => onComplete(finalMetrics)}
          onExit={onExit}
          onQuiz={fetchAndShowQuiz}
          hasQuiz={content?.source === 'library'}
          t={t}
          s={s}
        />
        <QuestionModal
          visible={showQuiz}
          questions={questions}
          textId={content?.libraryTextId ?? ''}
          chapterId={null}
          onComplete={(_answers: QuestionAnswer[]) => {
            setShowQuiz(false)
            onComplete(finalMetrics)
          }}
          onSkip={() => setShowQuiz(false)}
        />
      </>
    )
  }

  return null
}

// ─── Tier Helpers ──────────────────────────────────────────────────

function getSpeedTier(wpm: number) {
  if (wpm < 150) return { label: 'Yeni Başlayan',  icon: '🌱', color: '#6B7280', desc: '< 150 WPM — Temelleri öğreniyorsun' }
  if (wpm < 200) return { label: 'Geliştiriyor',   icon: '📈', color: '#3B82F6', desc: '150-200 WPM — İyi bir başlangıç' }
  if (wpm < 280) return { label: 'Orta Seviye',    icon: '⚡', color: '#0891B2', desc: '200-280 WPM — Ortalamanın üzerinde' }
  if (wpm < 350) return { label: 'Hızlı Okuyucu', icon: '🚀', color: '#7C3AED', desc: '280-350 WPM — İleri seviye' }
  return               { label: 'Uzman',            icon: '🏆', color: '#D97706', desc: '350+ WPM — Elit okuyucu' }
}

function getComprehensionTier(score: number) {
  if (score < 40) return { label: 'Geliştirilmeli', icon: '📚', color: '#EF4444', desc: 'Anlama odakla çalış' }
  if (score < 60) return { label: 'Orta Kavrama',   icon: '📖', color: '#F59E0B', desc: 'Daha fazla pratik yap' }
  if (score < 75) return { label: 'İyi Kavrama',    icon: '💡', color: '#10B981', desc: 'Dengeli okuma profili' }
  if (score < 90) return { label: 'Çok İyi',        icon: '🌟', color: '#3B82F6', desc: 'Yüksek anlama kapasitesi' }
  return               { label: 'Mükemmel',          icon: '💎', color: '#7C3AED', desc: 'Elit kavrama seviyesi' }
}

// ─── Result Screen ──────────────────────────────────────────────────

interface ResultProps {
  metrics:     ChunkRSVPMetrics
  content:     ImportedContent | null
  accentColor: string
  onRepeat:    () => void
  onComplete:  () => void
  onExit:      () => void
  onQuiz?:     () => void
  hasQuiz?:    boolean
  t:           AppTheme
  s:           ReturnType<typeof ms>
}

function ResultScreen({ metrics, content, accentColor, onRepeat, onComplete, onExit, onQuiz, hasQuiz, t, s }: ResultProps) {
  const xp         = calculateXP(metrics.arpScore, metrics.totalWords, metrics.bionicEnabled, metrics.durationSeconds)
  const speedTier  = getSpeedTier(metrics.avgWPM)
  const compTier   = getComprehensionTier(metrics.comprehensionScore)
  const { student } = useAuthStore()

  // ── Kişisel en iyi + sıralama ──────────────────────────────────
  const [weeklyBest,  setWeeklyBest]  = useState<number | null>(null)
  const [rank,        setRank]        = useState<number | null>(null)
  const [streak,      setStreak]      = useState<number>(0)
  const isNewRecord = weeklyBest !== null && metrics.arpScore >= weeklyBest

  useEffect(() => {
    if (!student?.id) return
    const sid = student.id

    // Haftalık en iyi ARP
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    (supabase as any)
      .from('reading_mode_sessions')
      .select('arp_score')
      .eq('student_id', sid)
      .gte('created_at', weekAgo)
      .order('arp_score', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }: any) => {
        if (data?.arp_score) setWeeklyBest(data.arp_score as number)
      })

    // Streak (daily_stats tablosundan)
    ;(supabase as any)
      .from('daily_stats')
      .select('streak_days')
      .eq('student_id', sid)
      .order('date', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }: any) => {
        if (data?.streak_days) setStreak(data.streak_days as number)
      })

    // Genel sıralama (approx)
    ;(supabase as any)
      .rpc('get_reading_rank', { p_arp: metrics.arpScore })
      .then(({ data }: any) => {
        if (typeof data === 'number') setRank(data)
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <SafeAreaView style={s.container}>
      {/* X Kapat */}
      <View style={{ paddingHorizontal:16, paddingTop:8, alignItems:'flex-end' }}>
        <TouchableOpacity onPress={onExit}
          hitSlop={{ top:10, bottom:10, left:10, right:10 }}
          style={{ width:38, height:38, borderRadius:19,
            backgroundColor: t.colors.surface, borderWidth:1, borderColor: t.colors.border,
            alignItems:'center', justifyContent:'center' }}>
          <Text style={{ fontSize:18, color: t.colors.textHint, fontWeight:'700' }}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={s.resultScroll} showsVerticalScrollIndicator={false}>
        <Text style={s.resultEmoji}>🎉</Text>
        <Text style={s.resultTitle}>Seans Tamamlandı!</Text>

        {/* ARP Kartı — tier inline */}
        <View style={[s.arpCard, { backgroundColor: accentColor }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Text style={s.arpLabel}>ARP Skoru</Text>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 2 }}>
              <Text style={{ fontSize: 11, color: '#fff', fontWeight: '800' }}>{speedTier.icon} {speedTier.label}</Text>
            </View>
          </View>
          <Text style={s.arpValue}>{metrics.arpScore}</Text>
          {isNewRecord && (
            <View style={{ backgroundColor: '#F59E0B', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 3, marginTop: 4 }}>
              <Text style={{ fontSize: 11, color: '#fff', fontWeight: '900' }}>🆕 Haftalık Rekor!</Text>
            </View>
          )}
        </View>

        {/* 4 Metrik */}
        <View style={s.metricsGrid}>
          {[
            { label: 'Ort. WPM',  value: String(metrics.avgWPM) },
            { label: 'Peak WPM',  value: String(metrics.peakWPM) },
            { label: 'Kelimeler', value: metrics.totalWords.toLocaleString('tr') },
            { label: 'Süre',      value: `${Math.floor(metrics.durationSeconds / 60)}dk ${metrics.durationSeconds % 60}sn` },
          ].map((m) => (
            <View key={m.label} style={s.metricCard}>
              <Text style={s.metricValue}>{m.value}</Text>
              <Text style={s.metricLabel}>{m.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Tier Rozetleri ─────────────────────────────────── */}
        <View style={s.badgeSection}>
          <Text style={s.badgeSectionTitle}>BAŞARILAR</Text>

          {/* SpeedTier */}
          <View style={[s.badgeRow, { borderLeftColor: speedTier.color }]}>
            <View style={[s.badgeIconWrap, { backgroundColor: speedTier.color + '18' }]}>
              <Text style={s.badgeIcon}>{speedTier.icon}</Text>
            </View>
            <View style={s.badgeInfo}>
              <Text style={[s.badgeLabel, { color: speedTier.color }]}>{speedTier.label}</Text>
              <Text style={s.badgeDesc}>{speedTier.desc}</Text>
            </View>
            <View style={[s.badgePill, { backgroundColor: speedTier.color }]}>
              <Text style={s.badgePillTxt}>{metrics.avgWPM} WPM</Text>
            </View>
          </View>

          {/* ComprehensionTier */}
          <View style={[s.badgeRow, { borderLeftColor: compTier.color }]}>
            <View style={[s.badgeIconWrap, { backgroundColor: compTier.color + '18' }]}>
              <Text style={s.badgeIcon}>{compTier.icon}</Text>
            </View>
            <View style={s.badgeInfo}>
              <Text style={[s.badgeLabel, { color: compTier.color }]}>{compTier.label}</Text>
              <Text style={s.badgeDesc}>{compTier.desc}</Text>
            </View>
            <View style={[s.badgePill, { backgroundColor: compTier.color }]}>
              <Text style={s.badgePillTxt}>%{metrics.comprehensionScore}</Text>
            </View>
          </View>

          {/* Streak */}
          {streak > 0 && (
            <View style={[s.badgeRow, { borderLeftColor: '#F59E0B' }]}>
              <View style={[s.badgeIconWrap, { backgroundColor: '#FEF3C7' }]}>
                <Text style={s.badgeIcon}>🔥</Text>
              </View>
              <View style={s.badgeInfo}>
                <Text style={[s.badgeLabel, { color: '#D97706' }]}>{streak} Günlük Seri</Text>
                <Text style={s.badgeDesc}>Her gün çalışmaya devam et!</Text>
              </View>
              <View style={[s.badgePill, { backgroundColor: '#F59E0B' }]}>
                <Text style={s.badgePillTxt}>{streak} gün</Text>
              </View>
            </View>
          )}
        </View>

        {/* ── Kişisel Kıyaslama ──────────────────────────────── */}
        <View style={s.statsRow}>
          <View style={s.statBox}>
            <Text style={s.statBoxIcon}>📊</Text>
            <Text style={s.statBoxValue}>
              {weeklyBest ? (isNewRecord ? 'Rekor!' : String(weeklyBest)) : '—'}
            </Text>
            <Text style={s.statBoxLabel}>Haftalık en iyi</Text>
          </View>
          <View style={[s.statBox, { borderLeftWidth: 1, borderLeftColor: '#E5E7EB' }]}>
            <Text style={s.statBoxIcon}>🏅</Text>
            <Text style={s.statBoxValue}>{rank ? `#${rank}` : '—'}</Text>
            <Text style={s.statBoxLabel}>Genel sıralama</Text>
          </View>
          <View style={[s.statBox, { borderLeftWidth: 1, borderLeftColor: '#E5E7EB' }]}>
            <Text style={s.statBoxIcon}>⭐</Text>
            <Text style={s.statBoxValue}>+{xp}</Text>
            <Text style={s.statBoxLabel}>XP kazanıldı</Text>
          </View>
        </View>

        {/* Quiz Butonu */}
        {hasQuiz && onQuiz && (
          <TouchableOpacity
            style={{ backgroundColor:'#10B981', borderRadius:14, paddingVertical:14,
              alignItems:'center', width:'100%' }}
            onPress={onQuiz}
          >
            <Text style={{ color:'#fff', fontWeight:'800', fontSize:16 }}>📝 Anlama Soruları</Text>
          </TouchableOpacity>
        )}

        {/* Butonlar */}
        <View style={s.resultBtns}>
          <TouchableOpacity style={s.repeatBtn} onPress={onRepeat}>
            <Text style={s.repeatBtnTxt}>Tekrar Yap</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.continueBtn, { backgroundColor: accentColor }]} onPress={onComplete}>
            <Text style={s.continueBtnTxt}>İleri →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

// ─── Settings Sheet ────────────────────────────────────────────────

interface SettingsSheetProps {
  settings: Settings
  onUpdate: React.Dispatch<React.SetStateAction<Settings>>
  onClose: () => void
  t: AppTheme
  s: ReturnType<typeof ms>
  currentWPM: number
  onWPMChange: (wpm: number) => void
}

function SettingsSheet({ settings, onUpdate, onClose, t, s, currentWPM, onWPMChange }: SettingsSheetProps) {
  const toggle = (key: keyof Settings) =>
    onUpdate((p) => ({ ...p, [key]: !p[key] }))

  const Row = ({ label, value, onToggle }: { label: string; value: boolean; onToggle: () => void }) => (
    <View style={s.settingRow}>
      <Text style={s.settingLabel}>{label}</Text>
      <TouchableOpacity
        style={[s.toggle, value && s.toggleOn]}
        onPress={() => { Haptics.selectionAsync(); onToggle() }}
      >
        <View style={[s.toggleThumb, value && s.toggleThumbOn]} />
      </TouchableOpacity>
    </View>
  )

  const ChunkBtn = ({ size }: { size: 1 | 2 | 3 | 4 | 5 }) => (
    <TouchableOpacity
      style={[s.chunkSizeBtn, settings.chunkSize === size && s.chunkSizeBtnActive]}
      onPress={() => onUpdate((p) => ({ ...p, chunkSize: size }))}
    >
      <Text style={[s.chunkSizeBtnTxt, settings.chunkSize === size && s.chunkSizeBtnTxtActive]}>{size}</Text>
    </TouchableOpacity>
  )

  return (
    <View style={s.settingsOverlay}>
      <TouchableOpacity style={s.settingsBackdrop} onPress={onClose} />
      <View style={s.settingsSheet}>
        <View style={s.settingsHandle} />
        <Text style={s.settingsTitle}>⚙️ Ayarlar</Text>

        <Text style={s.settingsSection}>Grup Boyutu</Text>
        <View style={s.chunkSizeRow}>
          {([1, 2, 3, 4, 5] as const).map((n) => <ChunkBtn key={n} size={n} />)}
        </View>

        <Text style={s.settingsSection}>WPM: {currentWPM}</Text>
        <View style={s.wpmPresetsRow}>
          {[100, 150, 200, 250, 300, 400, 500].map((w) => (
            <TouchableOpacity
              key={w}
              style={[s.wpmPreset, currentWPM === w && s.wpmPresetActive]}
              onPress={() => onWPMChange(w)}
            >
              <Text style={[s.wpmPresetTxt, currentWPM === w && s.wpmPresetTxtActive]}>{w}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.settingsSection}>Görünüm</Text>
        <Row label="Bionic Reading" value={settings.bionicReading} onToggle={() => toggle('bionicReading')} />
        <Row label="ORP Vurgusu" value={settings.orpHighlight} onToggle={() => toggle('orpHighlight')} />

        <Text style={s.settingsSection}>Okuma</Text>
        <Row label="Smart Slowing" value={settings.smartSlowing} onToggle={() => toggle('smartSlowing')} />

        <TouchableOpacity style={s.closeSheetBtn} onPress={onClose}>
          <Text style={s.closeSheetTxt}>Kapat</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

// ─── Stiller ───────────────────────────────────────────────────────

function ms(t: AppTheme, rtBg: string, rtText: string, accent = '#0891B2', navyBg = '#055a75', deepBg = '#044a62', lightBg = '#E8F6FB') {
  const SPEED_COLOR = accent
  return StyleSheet.create({
    container:    { flex: 1, backgroundColor: t.colors.background },

    // Top bar
    topBar:       {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 16, paddingVertical: 14,
      backgroundColor: t.colors.panel,
    },
    exitTxt:      { fontSize: 15, color: 'rgba(255,255,255,0.8)' },
    closeBtn:     { width:36, height:36, borderRadius:18,
      backgroundColor:'rgba(255,255,255,0.12)',
      alignItems:'center', justifyContent:'center' },
    closeBtnTxt:  { fontSize:18, color:'rgba(255,255,255,0.9)', fontWeight:'700' },
    topTitle:     { fontSize: 17, fontWeight: '800', color: '#fff' },
    settingsIcon: { fontSize: 20 },

    // Select
    selectScroll: { flex: 1, padding: 16, gap: 12 },
    heroBox:      { alignItems: 'center', paddingVertical: 10 },
    heroEmoji:    { fontSize: 56, marginBottom: 12 },
    heroTitle:    { fontSize: 26, fontWeight: '900', color: t.colors.text, marginBottom: 6 },
    heroSub:      { fontSize: 14, color: t.colors.textHint, textAlign: 'center' },

    // WPM kartı — select ekranı
    wpmCard: {
      backgroundColor: t.colors.surface, borderRadius: 16,
      padding: 16, borderWidth: 1, borderColor: t.colors.border, gap: 12,
    },
    wpmCardLabel: { fontSize: 11, fontWeight: '700', color: t.colors.textHint, letterSpacing: 1.5 },
    wpmRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    wpmAdjBtnSelect: {
      width: 44, height: 44, borderRadius: 12,
      backgroundColor: t.colors.background, borderWidth: 1, borderColor: t.colors.border,
      alignItems: 'center', justifyContent: 'center',
    },
    wpmAdjTxtSelect:  { fontSize: 20, fontWeight: '700', color: t.colors.text },
    wpmDisplaySelect: { fontSize: 32, fontWeight: '900', color: SPEED_COLOR },
    wpmUnitSelect:    { fontSize: 14, color: t.colors.textHint, fontWeight: '600' },
    wpmPresetsSelect: { flexDirection: 'row', justifyContent: 'space-evenly' },
    wpmPresetSelect:  {
      paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8,
      backgroundColor: t.colors.background, borderWidth: 1, borderColor: t.colors.border,
    },
    wpmPresetSelectActive:    { backgroundColor: SPEED_COLOR, borderColor: SPEED_COLOR },
    wpmPresetSelectTxt:       { fontSize: 12, fontWeight: '600', color: t.colors.textHint },
    wpmPresetSelectTxtActive: { color: '#fff' },

    // Grup boyutu kartı — select ekranı
    chunkSizeCard:    {
      backgroundColor: t.colors.surface, borderRadius: 16,
      padding: 16, borderWidth: 1, borderColor: t.colors.border, gap: 12,
    },
    chunkSizeBtns:        { flexDirection: 'row', justifyContent: 'space-evenly' },
    chunkSizeBtn:         {
      width: 44, height: 44, borderRadius: 12,
      backgroundColor: t.colors.background, borderWidth: 1, borderColor: t.colors.border,
      alignItems: 'center', justifyContent: 'center',
    },
    chunkSizeBtnActive:   { backgroundColor: SPEED_COLOR, borderColor: SPEED_COLOR },
    chunkSizeBtnTxt:      { fontSize: 15, fontWeight: '700', color: t.colors.textHint },
    chunkSizeBtnTxtActive:{ color: '#fff' },

    chipRow:      { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    chip:         {
      borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6,
      backgroundColor: t.colors.surface, borderWidth: 1, borderColor: t.colors.border,
    },
    chipActive:   { backgroundColor: SPEED_COLOR + '20', borderColor: SPEED_COLOR },
    chipTxt:      { fontSize: 12, fontWeight: '600', color: t.colors.textHint },
    chipTxtActive:{ color: SPEED_COLOR },

    contentCard:  {
      backgroundColor: t.colors.surface, borderRadius: 16, padding: 16,
      borderWidth: 1, borderColor: t.colors.border,
    },
    contentCardTitle: { fontSize: 16, fontWeight: '700', color: t.colors.text, marginBottom: 4 },
    contentCardMeta:  { fontSize: 12, color: t.colors.textHint, marginBottom: 12 },
    changeBtn:    {
      alignSelf: 'flex-start', borderRadius: 999,
      paddingHorizontal: 12, paddingVertical: 6,
      backgroundColor: t.colors.surface, borderWidth: 1, borderColor: t.colors.border,
    },
    changeBtnTxt: { fontSize: 12, color: t.colors.primary, fontWeight: '600' },

    importBtn:    {
      backgroundColor: t.colors.surface, borderRadius: 20, padding: 24,
      alignItems: 'center', borderWidth: 2, borderColor: SPEED_COLOR + '40',
      borderStyle: 'dashed',
    },
    importBtnEmoji: { fontSize: 40, marginBottom: 8 },
    importBtnTxt: { fontSize: 17, fontWeight: '700', color: t.colors.text, marginBottom: 4 },
    importBtnSub: { fontSize: 13, color: t.colors.textHint },

    startBtn:     {
      backgroundColor: SPEED_COLOR, borderRadius: 16,
      paddingVertical: 18, alignItems: 'center',
    },
    startBtnDisabled: { opacity: 0.4 },
    startBtnTxt:  { fontSize: 18, fontWeight: '800', color: '#fff' },

    // Reading — Hız Kontrolü stili: accent header + açık okuma alanı
    readingBg:    { backgroundColor: lightBg },

    readingHeader: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 16, paddingVertical: 10,
      backgroundColor: navyBg,
    },
    readingBack:  { fontSize: 14, color: 'rgba(255,255,255,0.85)' },
    modeRow:      { flexDirection: 'row', gap: 4 },
    modePill:     {
      borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4,
      backgroundColor: 'rgba(255,255,255,0.16)',
    },
    modePillActive: { backgroundColor: 'rgba(255,255,255,0.30)' },
    modePillTxt:   { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.75)' },
    modePillTxtActive: { color: '#fff', fontWeight: '800' },

    progressPanel: {
      backgroundColor: lightBg,
      paddingHorizontal: 16, paddingTop: 8, paddingBottom: 6,
    },
    progressTrack: { height: 4, backgroundColor: 'rgba(0,0,0,0.12)', borderRadius: 2 },
    progressFill:  { height: 4, backgroundColor: navyBg, borderRadius: 2 },
    progressInfo:  { fontSize: 11, color: navyBg, textAlign: 'center', marginTop: 6, fontWeight: '600' },

    chunkStage:   { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, backgroundColor: lightBg },
    chunkBox:     { alignItems: 'center', justifyContent: 'center' },
    chunkText:    { fontSize: 16, fontWeight: '800', color: navyBg, textAlign: 'center', lineHeight: 24 },
    chunkWordsRow:{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
    chunkWord:    { fontSize: 16, color: navyBg },
    bionicBold:   { fontWeight: '900' },
    bionicLight:  { fontWeight: '300' },

    // Yeni alt bölüm
    lightBottomRow: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 16, paddingVertical: 10,
      backgroundColor: lightBg,
    },
    backPill: {
      borderRadius: 999, paddingHorizontal: 18, paddingVertical: 8,
    },
    backPillTxt: { fontSize: 13, fontWeight: '700', color: '#fff' },
    liveWPM: { fontSize: 17, fontWeight: '800' },

    pauseBtn: {
      marginHorizontal: 16, marginBottom: 8,
      borderWidth: 1.5, borderRadius: 14,
      paddingVertical: 14,
      alignItems: 'center', justifyContent: 'center',
      backgroundColor: '#fff',
    },
    pauseBtnTxt: { fontSize: 16, fontWeight: '700' },

    darkSlidersPanel: {
      paddingHorizontal: 16, paddingVertical: 14,
      paddingBottom: Platform.OS === 'ios' ? 20 : 14,
    },
    sliderLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    sliderLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.75)', letterSpacing: 0.8 },
    sliderValue: { fontSize: 13, fontWeight: '800', color: '#fff' },
    sliderTrack: {
      height: 6, backgroundColor: 'rgba(255,255,255,0.20)',
      borderRadius: 3, position: 'relative',
    },
    sliderFill:  { height: 6, backgroundColor: '#fff', borderRadius: 3 },
    sliderThumb: {
      position: 'absolute', top: -7, width: 20, height: 20,
      borderRadius: 10, backgroundColor: '#fff', marginLeft: -10,
      shadowColor: '#000', shadowOpacity: 0.20, shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 }, elevation: 3,
    },

    // Keep unused refs for settings sheet / select phase
    bottomPanel:   { backgroundColor: navyBg },
    controls:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24, paddingVertical: 12 },
    controlBtn:    { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    controlBtnTxt: { fontSize: 22, color: 'rgba(255,255,255,0.7)' },
    playBtn:       { width: 60, height: 60, borderRadius: 30, backgroundColor: accent, alignItems: 'center', justifyContent: 'center' },
    playBtnTxt:    { fontSize: 24 },
    wpmSliderRow:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 8, paddingVertical: 4 },
    wpmLabel:      { fontSize: 11, color: 'rgba(255,255,255,0.6)', width: 30 },
    wpmSliderTrack:{ flex: 1, height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2, position: 'relative' },
    wpmSliderFill: { height: 4, backgroundColor: '#fff', borderRadius: 2 },
    wpmThumb:      { position: 'absolute', top: -6, width: 16, height: 16, borderRadius: 8, backgroundColor: '#fff', marginLeft: -8 },
    wpmBtnsRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, paddingVertical: 4, paddingBottom: 8 },
    wpmPresetsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', marginBottom: 8 },
    wpmAdjBtn:     { backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: 999, paddingHorizontal: 16, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
    wpmAdjTxt:     { fontSize: 14, fontWeight: '700', color: '#fff' },
    wpmDisplay:    { fontSize: 16, fontWeight: '800', color: '#fff', minWidth: 90, textAlign: 'center' },
    statsBar:      { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: deepBg, paddingVertical: 10, paddingHorizontal: 8 },
    statItem:      { alignItems: 'center' },
    statValue:     { fontSize: 14, fontWeight: '800', color: '#fff' },
    statLabel:     { fontSize: 10, color: 'rgba(255,255,255,0.65)', marginTop: 2 },

    // Result
    resultScroll: { padding: 16, gap: 12, paddingBottom: 32, alignItems: 'center' },
    resultEmoji:  { fontSize: 44 },
    resultTitle:  { fontSize: 22, fontWeight: '900', color: t.colors.text },
    arpCard:      {
      borderRadius: 16, paddingVertical: 18, paddingHorizontal: 32,
      alignItems: 'center', width: '100%', gap: 4,
    },
    arpLabel:     { fontSize: 13, color: 'rgba(255,255,255,0.80)', marginBottom: 2 },
    arpValue:     { fontSize: 52, fontWeight: '900', color: '#fff', lineHeight: 58 },
    metricsGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', width: '100%' },
    metricCard:   {
      backgroundColor: t.colors.surface, borderRadius: 12, padding: 14,
      alignItems: 'center', minWidth: '40%', flex: 1,
    },
    metricValue:  { fontSize: 20, fontWeight: '900', color: t.colors.text },
    metricLabel:  { fontSize: 11, color: t.colors.textHint, marginTop: 2 },
    xpBadge:      {
      backgroundColor: '#F59E0B20', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 20,
      borderWidth: 1, borderColor: '#F59E0B',
    },
    xpTxt:        { fontSize: 15, fontWeight: '700', color: '#F59E0B' },

    // Badge section
    badgeSection: {
      width: '100%', backgroundColor: t.colors.surface, borderRadius: 16,
      padding: 14, gap: 2,
      shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 }, elevation: 2,
    },
    badgeSectionTitle: {
      fontSize: 10, fontWeight: '800', color: t.colors.textHint,
      letterSpacing: 1.2, marginBottom: 8,
    },
    badgeRow: {
      flexDirection: 'row', alignItems: 'center', gap: 10,
      paddingVertical: 8, borderLeftWidth: 3, paddingLeft: 10,
      marginBottom: 4,
    },
    badgeIconWrap: {
      width: 38, height: 38, borderRadius: 10,
      alignItems: 'center', justifyContent: 'center',
    },
    badgeIcon:  { fontSize: 18 },
    badgeInfo:  { flex: 1, gap: 2 },
    badgeLabel: { fontSize: 13, fontWeight: '800' },
    badgeDesc:  { fontSize: 11, color: t.colors.textHint, fontWeight: '500' },
    badgePill:  {
      borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4,
    },
    badgePillTxt: { fontSize: 11, fontWeight: '800', color: '#fff' },

    // Stats row (personal best + rank + xp)
    statsRow: {
      width: '100%', flexDirection: 'row',
      backgroundColor: t.colors.surface, borderRadius: 14,
      overflow: 'hidden',
      shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6,
      shadowOffset: { width: 0, height: 1 }, elevation: 1,
    },
    statBox: {
      flex: 1, alignItems: 'center', paddingVertical: 12, gap: 3,
    },
    statBoxIcon:  { fontSize: 18 },
    statBoxValue: { fontSize: 16, fontWeight: '900', color: t.colors.text },
    statBoxLabel: { fontSize: 10, color: t.colors.textHint, fontWeight: '600' },

    resultBtns:   { flexDirection: 'row', gap: 12, width: '100%' },
    repeatBtn:    {
      flex: 1, backgroundColor: t.colors.surface, borderRadius: 14,
      paddingVertical: 16, alignItems: 'center',
      borderWidth: 1, borderColor: t.colors.border,
    },
    repeatBtnTxt: { fontSize: 15, fontWeight: '700', color: t.colors.text },
    continueBtn:  {
      flex: 2, borderRadius: 14,
      paddingVertical: 16, alignItems: 'center',
    },
    continueBtnTxt: { fontSize: 15, fontWeight: '700', color: '#fff' },

    // Settings
    settingsOverlay:  { position: 'absolute', inset: 0, zIndex: 100 },
    settingsBackdrop: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)' },
    settingsSheet:    {
      position: 'absolute', bottom: 0, left: 0, right: 0,
      backgroundColor: t.colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
      padding: 20, paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    },
    settingsHandle:   {
      width: 40, height: 4, backgroundColor: t.colors.border,
      borderRadius: 2, alignSelf: 'center', marginBottom: 16,
    },
    settingsTitle:    { fontSize: 18, fontWeight: '800', color: t.colors.text, marginBottom: 16 },
    settingsSection:  { fontSize: 12, fontWeight: '700', color: t.colors.textHint, letterSpacing: 1, marginTop: 12, marginBottom: 8 },
    settingRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
    settingLabel:     { fontSize: 15, color: t.colors.text },
    toggle:           { width: 44, height: 24, borderRadius: 12, backgroundColor: t.colors.border, justifyContent: 'center', paddingHorizontal: 2 },
    toggleOn:         { backgroundColor: SPEED_COLOR },
    toggleThumb:      { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' },
    toggleThumbOn:    { alignSelf: 'flex-end' },
    chunkSizeRow:     { flexDirection: 'row', gap: 8 },
    wpmPreset:        {
      paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8,
      backgroundColor: t.colors.background, borderWidth: 1, borderColor: t.colors.border,
    },
    wpmPresetActive:  { backgroundColor: SPEED_COLOR, borderColor: SPEED_COLOR },
    wpmPresetTxt:     { fontSize: 12, fontWeight: '600', color: t.colors.textHint },
    wpmPresetTxtActive: { color: '#fff' },
    closeSheetBtn:    {
      backgroundColor: t.colors.primary, borderRadius: 14,
      paddingVertical: 14, alignItems: 'center', marginTop: 16,
    },
    closeSheetTxt:    { fontSize: 15, fontWeight: '700', color: '#fff' },
  })
}
