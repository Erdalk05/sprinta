/**
 * Akış Okuma (Flow Reading / Pacing) Egzersizi
 * ChunkRSVP ile %100 tutarlı mimari.
 * 3 aşama: İçerik Seç → Aktif Okuma → Seans Sonu
 *
 * Cursor animasyonu: Reanimated v4 (Skia yok)
 * Satır yönetimi: 5 satır penceresi (aktif + 2 önce/sonra)
 */
import React, {
  useState, useEffect, useRef, useMemo, useCallback,
} from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, Platform,
} from 'react-native'
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withRepeat,
  withSequence, Easing, runOnJS, cancelAnimation,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { useAppTheme } from '../../../theme/useAppTheme'
import type { AppTheme } from '../../../theme'
import { READING_THEMES } from '../../../constants/readingThemes'
import { useThemeStore } from '../../../stores/themeStore'
import { ReadingThemePicker } from '../../ui/ReadingThemePicker'
import ContentImportModal, {
  ImportedContent, saveRecentContent,
} from '../shared/ContentImportModal'
import { QuestionModal } from '../../reading/QuestionModal'
import type { TextQuestion, QuestionAnswer } from '@sprinta/api'
import { supabase } from '../../../lib/supabase'
import { useAuthStore } from '../../../stores/authStore'
import {
  parseTextToLines, applyLineDurations, calculateRealTimeWPM,
  rollingAverageWPM, computeFlowSessionARP, calculateHighlightState,
  estimateRemainingSeconds, calculateXP, detectRegression,
  TextLine,
} from './FlowReadingEngine'
import { mmkvStorage } from '../../../stores/mmkvStorage'
import type { SessionMetrics } from '../types'

// ─── Tipler ────────────────────────────────────────────────────────

export interface FlowReadingMetrics extends SessionMetrics {
  avgWPM: number
  peakWPM: number
  totalWords: number
  totalLines: number
  readingMode: 'sprint' | 'cruise'
  cursorStyle: 'line' | 'dot' | 'highlight' | 'underline'
  smartSlowingEnabled: boolean
  arpScore: number
  comprehensionScore: number
  regressionCount: number
  importSource: 'library' | 'text' | 'url'
}

interface Props {
  onComplete:      (metrics: FlowReadingMetrics) => void
  onExit:          () => void
  /** Kütüphaneden gelen metin — varsa seçim ekranını atla */
  initialContent?: ImportedContent
  /** Modüle özgü vurgu rengi */
  accentColor?:    string
  /** Tekrar Yap — dışarıdan kontrol edilebilir (örn. setup'a dön) */
  onRepeat?:       () => void
}

interface Settings {
  wordsPerLine: 8 | 10 | 12
  fontSize: 'small' | 'medium' | 'large'
  lineSpacing: 'compact' | 'normal' | 'wide'
  cursorStyle: 'line' | 'dot' | 'highlight' | 'underline'
  readingMode: 'sprint' | 'cruise'
  smartSlowing: boolean
  targetWPM: number
}

type Phase = 'select' | 'reading' | 'result'

const SETTINGS_KEY = 'flow_reading_settings_v1'

const DEFAULT_SETTINGS: Settings = {
  wordsPerLine: 10,
  fontSize: 'medium',
  lineSpacing: 'normal',
  cursorStyle: 'line',
  readingMode: 'sprint',
  smartSlowing: true,
  targetWPM: 250,
}

const FONT_SIZES: Record<string, number>     = { small: 15, medium: 17, large: 20 }
const LINE_HEIGHTS: Record<string, number>   = { compact: 22, normal: 28, wide: 36 }
const LINE_OPACITIES = [0.12, 0.30, 1.0, 0.45, 0.22] // past2, past1, current, next1, next2

// ─── Ana Bileşen ───────────────────────────────────────────────────

export default function FlowReadingExercise({ onComplete, onExit, initialContent, accentColor, onRepeat }: Props) {
  const t            = useAppTheme()
  const accentClr    = accentColor ?? t.module.speed_control.color
  const readingTheme = useThemeStore((s) => s.readingTheme)
  const rt           = READING_THEMES[readingTheme]
  const s            = useMemo(() => ms(t, rt.background, rt.text), [t, readingTheme])

  // initialContent varsa 'select' ekranını atla, direkt 'reading'
  const initLines = React.useMemo(() => {
    if (!initialContent) return []
    const raw = parseTextToLines(initialContent.text, DEFAULT_SETTINGS.wordsPerLine)
    return applyLineDurations(raw, DEFAULT_SETTINGS.targetWPM, DEFAULT_SETTINGS.readingMode, DEFAULT_SETTINGS.smartSlowing)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const [phase, setPhase]               = useState<Phase>(initialContent ? 'reading' : 'select')
  const [settings, setSettings]         = useState<Settings>(DEFAULT_SETTINGS)
  const [showSettings, setShowSettings] = useState(false)
  const [showImport, setShowImport]     = useState(false)
  const [content, setContent]           = useState<ImportedContent | null>(initialContent ?? null)

  // Okuma state
  const [lines, setLines]               = useState<TextLine[]>(initLines)
  const [lineIdx, setLineIdx]           = useState(0)
  const [isPlaying, setIsPlaying]       = useState(!!initialContent)
  const [currentWPM, setCurrentWPM]     = useState(DEFAULT_SETTINGS.targetWPM)
  const [wpmHistory, setWpmHistory]     = useState<number[]>([])
  const [regressionCount, setRegressionCount] = useState(0)
  const [startTime, setStartTime]       = useState<number | null>(initialContent ? Date.now() : null)
  const [finalMetrics, setFinalMetrics] = useState<FlowReadingMetrics | null>(null)

  // Quiz
  const [showQuiz,  setShowQuiz]  = useState(false)
  const [questions, setQuestions] = useState<TextQuestion[]>([])

  // Cursor animasyonu
  const cursorX        = useSharedValue(0)   // 0 → 1 (satır genişliğinin yüzdesi)
  const cursorEndRatio = useSharedValue(1)   // kısa satırlarda < 1 → boşlukta akmaz
  const dotPulse       = useSharedValue(1)
  const lineWidth      = useRef(300)         // container genişliği (ölçülür)
  const textLineWidth  = useSharedValue(300) // SON satırın gerçek metin genişliği (onTextLayout ile)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Stale closure önleyici ref'ler
  const linesRef      = useRef<typeof lines>([])
  const isPlayingRef  = useRef(false)
  const lineIdxRef    = useRef(0)

  // ── Ayarları yükle ─────────────────────────────────────────────

  useEffect(() => {
    mmkvStorage.getItem(SETTINGS_KEY).then((raw) => {
      if (raw) {
        try { setSettings({ ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) }) }
        catch { /* varsayılan */ }
      }
    })
  }, [])

  const saveSettings = useCallback((s: Settings) => {
    mmkvStorage.setItem(SETTINGS_KEY, JSON.stringify(s)).catch(() => {})
    setSettings(s)
  }, [])

  // ── İçerik seçimi ─────────────────────────────────────────────

  const handleContentSelected = useCallback((c: ImportedContent) => {
    setContent(c)
    setShowImport(false)
    const raw = parseTextToLines(c.text, settings.wordsPerLine)
    const withDurations = applyLineDurations(raw, currentWPM, settings.readingMode, settings.smartSlowing)
    setLines(withDurations)
    setLineIdx(0)
  }, [settings.wordsPerLine, settings.readingMode, settings.smartSlowing, currentWPM])

  const handleStart = () => {
    if (!content || lines.length === 0) { setShowImport(true); return }
    setPhase('reading')
    setIsPlaying(true)
    setStartTime(Date.now())
    setWpmHistory([])
    setRegressionCount(0)
    setLineIdx(0)
  }

  // ── Cursor animasyonu ──────────────────────────────────────────

  const startCursorForLine = useCallback((line: TextLine) => {
    cursorX.value = 0
    // Yeni satır başlarken textLineWidth'i container genişliğine sıfırla
    // → onTextLayout henüz gelmeden önce underline taşmasın
    textLineWidth.value = lineWidth.current
    const dur = line.estimatedReadMs

    // Kısa/son satırlarda cursor kelimeler bitince durur — boşlukta akmaz
    // Tam satır (10 kelime) → endRatio=1.0, 4 kelimelik son satır → endRatio=0.4
    cursorEndRatio.value = Math.min(1, line.wordCount / settings.wordsPerLine)

    // Underline: kelime kelime atlayan adım animasyonu — kelimenin bittiği yerde durur
    // Line (kılavuz): doğrusal hareket — okunan konumu yumuşakça izler
    const easing = settings.cursorStyle === 'underline'
      ? Easing.steps(Math.max(1, line.wordCount), true)
      : Easing.linear

    cursorX.value = withTiming(1, { duration: dur, easing })

    // Dot pulse animasyonu
    if (settings.cursorStyle === 'dot') {
      dotPulse.value = withRepeat(
        withSequence(
          withTiming(1.35, { duration: 300 }),
          withTiming(1.0,  { duration: 300 }),
        ),
        -1,
        false,
      )
    }
  }, [settings.cursorStyle, settings.wordsPerLine, cursorX, cursorEndRatio, dotPulse])

  // ── Satır ilerlemesi ───────────────────────────────────────────

  const advanceToNext = useCallback((idx: number) => {
    const next = idx + 1
    if (next >= lines.length) {
      runOnJS(finishSession)()
      return
    }
    runOnJS(setLineIdx)(next)
  }, [lines.length]) // eslint-disable-line react-hooks/exhaustive-deps

  const scheduleNext = useCallback((idx: number) => {
    if (idx >= linesRef.current.length) { finishSession(); return }
    const line = linesRef.current[idx]
    if (!line) return

    // WPM geçmişi
    const now      = Date.now()
    const elapsed  = startTime ? now - startTime : 0
    const wordsRead = linesRef.current.slice(0, idx + 1).reduce((s, l) => s + l.wordCount, 0)
    const instWPM  = calculateRealTimeWPM(wordsRead, elapsed)
    if (instWPM > 0) setWpmHistory((h) => [...h.slice(-29), instWPM])

    // Cursor başlat
    startCursorForLine(line)

    timerRef.current = setTimeout(() => {
      setLineIdx((prev) => {
        const next = prev + 1
        if (next < linesRef.current.length) scheduleNext(next)
        else finishSession()
        return next
      })
    }, line.estimatedReadMs)
  }, [startTime, startCursorForLine]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isPlaying && phase === 'reading') {
      scheduleNext(lineIdx)
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Oynat/Duraklat ────────────────────────────────────────────

  const togglePlay = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    if (isPlaying) {
      setIsPlaying(false)
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
      cancelAnimation(cursorX)
    } else {
      setIsPlaying(true)
      scheduleNext(lineIdx)
    }
  }

  // ── Geri sar ──────────────────────────────────────────────────

  const goBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    const prev = Math.max(0, lineIdx - 1)
    if (detectRegression(lineIdx, prev)) {
      setRegressionCount((c) => c + 1)
    }
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
    cancelAnimation(cursorX)
    setLineIdx(prev)
    if (isPlaying) scheduleNext(prev)
  }

  // ── WPM kontrolü ──────────────────────────────────────────────

  const changeWPM = useCallback((delta: number) => {
    const next = Math.max(100, Math.min(600, currentWPM + delta))
    setCurrentWPM(next)
    if (content) {
      const raw = parseTextToLines(content.text, settings.wordsPerLine)
      const withDur = applyLineDurations(raw, next, settings.readingMode, settings.smartSlowing)
      linesRef.current = withDur  // ref'i hemen güncelle
      setLines(withDur)
      if (isPlayingRef.current) {
        if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
        cancelAnimation(cursorX)
        scheduleNext(lineIdxRef.current)
      }
    }
  }, [content, currentWPM, settings, cursorX, scheduleNext])

  const WPM_PRESETS = [100, 150, 200, 250, 300, 400, 500]

  // ── Sprint / Cruise toggle ────────────────────────────────────

  const toggleMode = () => {
    Haptics.selectionAsync()
    const next = settings.readingMode === 'sprint' ? 'cruise' : 'sprint'
    const newS = { ...settings, readingMode: next as 'sprint' | 'cruise' }
    saveSettings(newS)
    if (content) {
      const raw = parseTextToLines(content.text, newS.wordsPerLine)
      setLines(applyLineDurations(raw, currentWPM, newS.readingMode, newS.smartSlowing))
    }
  }

  // ── Seans bitişi ──────────────────────────────────────────────

  function finishSession() {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
    cancelAnimation(cursorX)

    const totalDurSec  = startTime ? Math.round((Date.now() - startTime) / 1000) : 60
    const totalWords   = lines.reduce((s, l) => s + l.wordCount, 0)
    const avgWPM       = rollingAverageWPM(wpmHistory, 30) || currentWPM
    const peakWPM      = wpmHistory.length > 0 ? Math.max(...wpmHistory) : avgWPM
    const { rei, csf, arp } = computeFlowSessionARP(avgWPM, 70, regressionCount, totalDurSec)
    const xp = calculateXP(arp, totalWords, totalDurSec)

    const metrics: FlowReadingMetrics = {
      moduleCode: 'speed_control',
      exerciseId: 'flow_reading',
      difficultyLevel: 5,
      durationSeconds: totalDurSec,
      wpm: avgWPM,
      comprehension: 70,
      accuracy: 85,
      score: Math.min(100, Math.round(arp / 4)),
      avgWPM,
      peakWPM,
      totalWords,
      totalLines: lines.length,
      readingMode: settings.readingMode,
      cursorStyle: settings.cursorStyle,
      smartSlowingEnabled: settings.smartSlowing,
      arpScore: arp,
      comprehensionScore: 70,
      regressionCount,
      importSource: content?.source ?? 'text',
    }

    setFinalMetrics(metrics)
    setIsPlaying(false)
    setPhase('result')
    if (content) saveRecentContent(content, avgWPM)
  }

  // ── Rehber animasyonlu stiller ─────────────────────────────────

  // LINE: soldan sağa kayan kılavuz çubuğu
  // cursorEndRatio → kısa/son satırlarda kelimeler bitince durur, boşlukta akmaz
  const cursorLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: cursorX.value * cursorEndRatio.value * Math.max(0, lineWidth.current - 28) }],
  }))

  // UNDERLINE: kelime kelime büyüyen alt çizgi — textLineWidth ile doğal sınır
  // textLineWidth, onTextLayout ile ölçülür → kısa satırlarda metni aşmaz
  const cursorUnderlineStyle = useAnimatedStyle(() => ({
    width: cursorX.value * textLineWidth.value,
  }))

  // DOT: nokta cursor — kısa satırlarda kelimelerin ötesine geçmez
  const cursorDotStyle = useAnimatedStyle(() => ({
    left: `${cursorX.value * cursorEndRatio.value * 92}%` as any,
    transform: [{ scale: dotPulse.value }],
  }))

  // ── Aktif satır hesabı (5 satır penceresi) ─────────────────────

  const visibleLines = useMemo(() => {
    const result: { line: TextLine | null; relIdx: number }[] = []
    for (let r = -2; r <= 2; r++) {
      const idx = lineIdx + r
      result.push({ line: lines[idx] ?? null, relIdx: r })
    }
    return result
  }, [lineIdx, lines])

  // ── İlerleme ──────────────────────────────────────────────────

  const totalWords   = lines.reduce((s, l) => s + l.wordCount, 0)
  const wordsRead    = lines.slice(0, lineIdx).reduce((s, l) => s + l.wordCount, 0)
  const progressPct  = totalWords > 0 ? (wordsRead / totalWords) * 100 : 0
  const remainSec    = estimateRemainingSeconds(lines.slice(lineIdx), currentWPM)
  const liveWPM      = rollingAverageWPM(wpmHistory, 10) || currentWPM
  const liveARP      = wpmHistory.length > 0
    ? computeFlowSessionARP(liveWPM, 70, regressionCount, 1).arp
    : 0

  // Ref sync — her render'da, erken return'lerden önce
  linesRef.current     = lines
  isPlayingRef.current = isPlaying
  lineIdxRef.current   = lineIdx

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  // ── AŞAMA 1: İçerik Seç ────────────────────────────────────────

  if (phase === 'select') {
    const accent = accentClr
    return (
      <SafeAreaView style={s.root}>

        {/* Header */}
        <View style={s.selectHeader}>
          <TouchableOpacity onPress={onExit} style={s.exitBtn}
            hitSlop={{ top:10, bottom:10, left:10, right:10 }}>
            <Text style={s.exitTxt}>✕</Text>
          </TouchableOpacity>
          <Text style={s.selectTitle}>🌊 Akış Okuma</Text>
          <Text style={s.selectSub}>Satır satır, rehber çizgiyle oku</Text>
        </View>

        <View style={s.selectBody}>

          {/* ── İçerik kartı ───────────────────── */}
          <TouchableOpacity style={s.contentCard} onPress={() => setShowImport(true)} activeOpacity={0.75}>
            {content ? (
              <>
                <Text style={s.contentIcon}>📄</Text>
                <View style={s.contentInfo}>
                  <Text style={s.contentTitle} numberOfLines={2}>{content.title}</Text>
                  <Text style={s.contentMeta}>{content.wordCount} kelime · ~{content.estimatedMinutes} dk</Text>
                </View>
                <View style={[s.changeBtn, { borderColor: accent }]}>
                  <Text style={[s.changeTxt, { color: accent }]}>Değiştir</Text>
                </View>
              </>
            ) : (
              <>
                <Text style={s.contentIcon}>📚</Text>
                <View style={s.contentInfo}>
                  <Text style={s.contentTitle}>İçerik Seç</Text>
                  <Text style={s.contentMeta}>Kütüphane, metin veya URL</Text>
                </View>
                <View style={[s.changeBtn, { borderColor: accent, backgroundColor: accent }]}>
                  <Text style={[s.changeTxt, { color: '#fff' }]}>Seç →</Text>
                </View>
              </>
            )}
          </TouchableOpacity>

          {/* ── OKUMA HIZI kartı ───────────────── */}
          <View style={s.wpmCard}>
            <Text style={s.cardLabel}>OKUMA HIZI</Text>
            <View style={s.wpmAdjRow}>
              <TouchableOpacity style={s.wpmAdjBtn} onPress={() => changeWPM(-25)}>
                <Text style={s.wpmAdjTxt}>−</Text>
              </TouchableOpacity>
              <Text style={[s.wpmDisplay, { color: accent }]}>
                {currentWPM}{' '}<Text style={s.wpmUnit}>WPM</Text>
              </Text>
              <TouchableOpacity style={s.wpmAdjBtn} onPress={() => changeWPM(+25)}>
                <Text style={s.wpmAdjTxt}>+</Text>
              </TouchableOpacity>
            </View>
            <View style={s.wpmPresetsRow}>
              {([100, 150, 200, 250, 300, 400, 500] as const).map(w => (
                <TouchableOpacity
                  key={w}
                  style={[s.wpmPreset, currentWPM === w && { backgroundColor: accent, borderColor: accent }]}
                  onPress={() => changeWPM(w - currentWPM)}
                >
                  <Text style={[s.wpmPresetTxt, currentWPM === w && s.wpmPresetTxtActive]}>{w}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ── REHBER STİLİ kartı ─────────────── */}
          <View style={s.cursorCard}>
            <Text style={s.cardLabel}>REHBER STİLİ</Text>
            <View style={s.cursorStyleRow}>
              {([
                { id: 'line',      icon: '—',  label: 'Çizgi'     },
                { id: 'dot',       icon: '●',  label: 'Nokta'     },
                { id: 'highlight', icon: '✨', label: 'Vurgu'     },
                { id: 'underline', icon: '_',  label: 'Alt Çizgi' },
              ] as const).map(cs => (
                <TouchableOpacity
                  key={cs.id}
                  style={[
                    s.cursorStyleBtn,
                    settings.cursorStyle === cs.id && { borderColor: accent, backgroundColor: accent + '20' },
                  ]}
                  onPress={() => saveSettings({ ...settings, cursorStyle: cs.id })}
                >
                  <Text style={s.cursorStyleIcon}>{cs.icon}</Text>
                  <Text style={[
                    s.cursorStyleLabel,
                    settings.cursorStyle === cs.id && { color: accent, fontWeight: '700' },
                  ]}>
                    {cs.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ── Başlat ─────────────────────────── */}
          <TouchableOpacity
            style={[s.startBtn, { backgroundColor: content ? accent : t.colors.border }]}
            onPress={handleStart}
          >
            <Text style={[s.startBtnTxt, !content && { color: t.colors.textHint }]}>
              {content ? 'Egzersizi Başlat →' : 'Önce İçerik Seç'}
            </Text>
          </TouchableOpacity>

        </View>

        <ContentImportModal
          visible={showImport}
          onClose={() => setShowImport(false)}
          onContentSelected={handleContentSelected}
        />
      </SafeAreaView>
    )
  }

  // ── AŞAMA 2: Aktif Okuma ───────────────────────────────────────

  if (phase === 'reading') {
    return (
      <SafeAreaView style={s.root}>
        {/* Header */}
        <View style={s.readHeader}>
          <TouchableOpacity
            onPress={() => { setIsPlaying(false); onExit() }}
            hitSlop={{ top:10, bottom:10, left:10, right:10 }}
            style={s.exitBtn}
          >
            <Text style={s.exitTxt}>✕</Text>
          </TouchableOpacity>
          <Text style={s.readTitle} numberOfLines={1}>{content?.title ?? 'Akış Okuma'}</Text>
          <TouchableOpacity onPress={toggleMode} style={s.modeBtn}>
            <Text style={[s.modeBtnTxt, { color: settings.readingMode === 'cruise' ? accentClr : t.colors.textHint }]}>
              {settings.readingMode === 'sprint' ? 'Sprint' : 'Cruise'}
            </Text>
          </TouchableOpacity>
          <ReadingThemePicker />
          <TouchableOpacity onPress={() => setShowSettings(true)} style={s.settingsBtn}>
            <Text style={s.settingsBtnTxt}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Progress */}
        <View style={s.progressWrap}>
          <View style={s.progressTrack}>
            <View style={[s.progressFill, { width: `${progressPct}%` as any, backgroundColor: accentClr }]} />
          </View>
          <Text style={s.progressTxt}>{wordsRead}/{totalWords} kelime · {Math.floor(remainSec / 60)}:{String(remainSec % 60).padStart(2, '0')} kaldı</Text>
        </View>

        {/* 5 Satır Penceresi */}
        <View style={s.textArea}>
          {visibleLines.map(({ line, relIdx }) => {
            if (!line) return <View key={relIdx} style={s.lineSlot} />
            const opacity      = LINE_OPACITIES[relIdx + 2]!
            const isActive     = relIdx === 0
            const fontSize     = FONT_SIZES[settings.fontSize]! + (isActive ? 2 : 0)
            const lineHeight   = LINE_HEIGHTS[settings.lineSpacing]! + (isActive ? 4 : 0)
            const fontWeight   = isActive ? '600' : '400'
            const highlightState = isActive && settings.cursorStyle === 'highlight'
              ? calculateHighlightState(lineIdx, cursorX.value * 100, line.words)
              : null

            return (
              <View key={line.id} style={[s.lineSlot, isActive && s.lineSlotActive]}>
                <View style={s.lineTextRow}>
                  {settings.cursorStyle === 'highlight' && isActive && highlightState
                    ? line.words.map((w, wi) => (
                        <Text
                          key={wi}
                          style={[
                            s.word,
                            { fontSize, lineHeight, opacity: 1, fontWeight },
                            wi < highlightState.endWord && { color: accentClr, fontWeight: '700' },
                          ]}
                        >
                          {w}{' '}
                        </Text>
                      ))
                    : (
                        <Text
                          style={[s.lineText, { fontSize, lineHeight, fontWeight, opacity }]}
                          onTextLayout={isActive ? (e) => {
                            // Son (wrapped) satırın gerçek piksel genişliğini ölç
                            const lns = e.nativeEvent.lines
                            if (lns.length > 0) {
                              const lastW = lns[lns.length - 1]?.width ?? lineWidth.current
                              textLineWidth.value = lastW
                            }
                          } : undefined}
                        >
                          {line.text}
                        </Text>
                      )}
                </View>

                {/* Rehber — sadece aktif satırda */}
                {isActive && (
                  <View
                    style={s.cursorContainer}
                    onLayout={(e) => { lineWidth.current = e.nativeEvent.layout.width }}
                  >
                    {settings.cursorStyle === 'line' && (
                      // Sabit genişlik kayan kılavuz — metnin sonunu geçmez
                      <Animated.View style={[s.cursorLine, { backgroundColor: accentClr }, cursorLineStyle]} />
                    )}
                    {settings.cursorStyle === 'underline' && (
                      // Kelime kelime büyüyen alt çizgi (Easing.steps)
                      <Animated.View style={[s.cursorUnderline, { backgroundColor: accentClr + 'AA' }, cursorUnderlineStyle]} />
                    )}
                    {settings.cursorStyle === 'dot' && (
                      <Animated.View style={[s.cursorDot, { backgroundColor: accentClr }, cursorDotStyle]} />
                    )}
                  </View>
                )}
              </View>
            )
          })}
        </View>

        {/* Kontrol çubuğu */}
        <View style={s.controls}>
          <TouchableOpacity onPress={goBack} style={s.ctrlBtn}>
            <Text style={s.ctrlBtnTxt}>←10</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={togglePlay} style={[s.playBtn, { backgroundColor: accentClr }]}>
            <Text style={s.playBtnTxt}>{isPlaying ? '⏸' : '▶'}</Text>
          </TouchableOpacity>
          <View style={s.wpmSlider}>
            <TouchableOpacity onPress={() => changeWPM(-25)} style={s.wpmStepBtn}>
              <Text style={s.wpmStepTxt}>−</Text>
            </TouchableOpacity>
            <Text style={[s.wpmValueLive, { color: accentClr }]}>{currentWPM} WPM</Text>
            <TouchableOpacity onPress={() => changeWPM(+25)} style={s.wpmStepBtn}>
              <Text style={s.wpmStepTxt}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* WPM presetleri */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.presetScroll} contentContainerStyle={s.presetContent}>
          {WPM_PRESETS.map((w) => (
            <TouchableOpacity
              key={w}
              style={[s.presetBtn, currentWPM === w && { backgroundColor: accentClr }]}
              onPress={() => changeWPM(w - currentWPM)}
            >
              <Text style={[s.presetTxt, currentWPM === w && s.presetTxtActive]}>{w}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Canlı istatistik */}
        <View style={s.statsBar}>
          {[
            { label: 'WPM', value: String(liveWPM) },
            { label: 'Satır', value: `${lineIdx}/${lines.length}` },
            { label: 'Süre', value: `${Math.floor((startTime ? (Date.now() - startTime) / 1000 : 0) / 60)}:${String(Math.round((startTime ? (Date.now() - startTime) / 1000 : 0) % 60)).padStart(2, '0')}` },
            { label: 'ARP', value: String(liveARP) },
          ].map((stat) => (
            <View key={stat.label} style={s.statCell}>
              <Text style={s.statValue}>{stat.value}</Text>
              <Text style={s.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Settings Sheet */}
        {showSettings && (
          <View style={s.settingsOverlay}>
            <TouchableOpacity style={s.settingsDim} onPress={() => setShowSettings(false)} />
            <View style={s.settingsSheet}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={s.sheetTitle}>⚙️ Akış Okuma Ayarları</Text>
                <TouchableOpacity onPress={() => setShowSettings(false)} hitSlop={{ top:10, bottom:10, left:10, right:10 }}
                  style={{ width:28, height:28, borderRadius:14, backgroundColor: 'rgba(128,128,128,0.15)', alignItems:'center', justifyContent:'center' }}>
                  <Text style={{ fontSize:14, color: t.colors.textHint, fontWeight:'700' }}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={s.sheetSection}>Rehber Stili</Text>
              <View style={s.sheetRow}>
                {([
                  { id: 'line',      icon: '—',  label: 'Çizgi'  },
                  { id: 'dot',       icon: '●',  label: 'Nokta'  },
                  { id: 'highlight', icon: '✨', label: 'Vurgu'  },
                  { id: 'underline', icon: '_',  label: 'Alt Çizgi' },
                ] as const).map((cs) => (
                  <TouchableOpacity
                    key={cs.id}
                    style={[s.sheetOptionBtn, settings.cursorStyle === cs.id && { borderColor: accentClr, backgroundColor: accentClr + '20' }]}
                    onPress={() => saveSettings({ ...settings, cursorStyle: cs.id })}
                  >
                    <Text style={s.sheetOptionIcon}>{cs.icon}</Text>
                    <Text style={s.sheetOptionLabel}>{cs.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={s.sheetSection}>Satır / Bölüm Genişliği</Text>
              <View style={s.sheetRow}>
                {([8, 10, 12] as const).map((n) => (
                  <TouchableOpacity
                    key={n}
                    style={[s.sheetOptionBtn, settings.wordsPerLine === n && { borderColor: accentClr, backgroundColor: accentClr + '20' }]}
                    onPress={() => {
                      const ns = { ...settings, wordsPerLine: n }
                      saveSettings(ns)
                      if (content) {
                        const raw = parseTextToLines(content.text, n)
                        setLines(applyLineDurations(raw, currentWPM, ns.readingMode, ns.smartSlowing))
                      }
                    }}
                  >
                    <Text style={s.sheetOptionLabel}>{n} kelime</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={s.sheetSection}>Yazı Boyutu</Text>
              <View style={s.sheetRow}>
                {(['small', 'medium', 'large'] as const).map((fs) => (
                  <TouchableOpacity
                    key={fs}
                    style={[s.sheetOptionBtn, settings.fontSize === fs && { borderColor: accentClr, backgroundColor: accentClr + '20' }]}
                    onPress={() => saveSettings({ ...settings, fontSize: fs })}
                  >
                    <Text style={s.sheetOptionLabel}>{fs === 'small' ? 'Küçük' : fs === 'medium' ? 'Orta' : 'Büyük'}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={s.sheetToggleRow}>
                <Text style={s.sheetToggleLabel}>Akıllı Yavaşlama</Text>
                <TouchableOpacity
                  style={[s.toggle, settings.smartSlowing && { backgroundColor: accentClr }]}
                  onPress={() => {
                    const ns = { ...settings, smartSlowing: !settings.smartSlowing }
                    saveSettings(ns)
                    if (content) {
                      const raw = parseTextToLines(content.text, ns.wordsPerLine)
                      setLines(applyLineDurations(raw, currentWPM, ns.readingMode, ns.smartSlowing))
                    }
                  }}
                >
                  <Text style={s.toggleTxt}>{settings.smartSlowing ? 'Açık' : 'Kapalı'}</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={[s.sheetClose, { backgroundColor: accentClr }]} onPress={() => setShowSettings(false)}>
                <Text style={s.sheetCloseTxt}>Kapat</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>
    )
  }

  // ── AŞAMA 3: Seans Sonu ────────────────────────────────────────

  const fetchAndShowQuiz = useCallback(async () => {
    const textId = content?.libraryTextId
    if (!textId) return
    try {
      const { data } = await (supabase as any)
        .from('text_questions')
        .select('id, text_id, chapter_id, question_type, question_text, options, correct_index, explanation, difficulty, order_index')
        .eq('text_id', textId)
        .order('order_index')
        .limit(5)
      setQuestions((data as TextQuestion[]) ?? [])
      setShowQuiz(true)
    } catch { /* sessiz */ }
  }, [content])

  // Kütüphane metni tamamlandığında quiz hemen açılır (0 gecikme)
  useEffect(() => {
    if (finalMetrics && content?.source === 'library') {
      fetchAndShowQuiz()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalMetrics])

  if (!finalMetrics) return null

  const xp = calculateXP(finalMetrics.arpScore, finalMetrics.totalWords, finalMetrics.durationSeconds)
  const totalDurMin = Math.floor(finalMetrics.durationSeconds / 60)
  const totalDurSec = finalMetrics.durationSeconds % 60

  return (
    <FlowResultScreen
      metrics={finalMetrics}
      xp={xp}
      totalDurMin={totalDurMin}
      totalDurSec={totalDurSec}
      accentColor={accentClr}
      hasQuiz={content?.source === 'library'}
      onQuiz={fetchAndShowQuiz}
      onRepeat={() => {
        if (onRepeat) { onRepeat(); return }
        setPhase('select'); setFinalMetrics(null); setLineIdx(0); setWpmHistory([]); setRegressionCount(0)
      }}
      onComplete={() => { onComplete(finalMetrics); onExit() }}
      onExit={onExit}
      t={t}
      s={s}
      showQuiz={showQuiz}
      questions={questions}
      libraryTextId={content?.libraryTextId ?? ''}
      onQuizClose={() => setShowQuiz(false)}
    />
  )
}

// ─── FlowResultScreen ──────────────────────────────────────────────

interface FlowResultProps {
  metrics:       FlowReadingMetrics
  xp:            number
  totalDurMin:   number
  totalDurSec:   number
  accentColor:   string
  hasQuiz:       boolean
  onQuiz:        () => void
  onRepeat:      () => void
  onComplete:    () => void
  onExit:        () => void
  t:             AppTheme
  s:             ReturnType<typeof ms>
  showQuiz:      boolean
  questions:     TextQuestion[]
  libraryTextId: string
  onQuizClose:   () => void
}

function getFlowSpeedTier(wpm: number) {
  if (wpm < 150) return { label: 'Yeni Başlayan', icon: '🌱', color: '#6B7280', desc: '< 150 WPM — Temelleri öğreniyorsun' }
  if (wpm < 200) return { label: 'Geliştiriyor',  icon: '📈', color: '#3B82F6', desc: '150-200 WPM — İyi bir başlangıç' }
  if (wpm < 280) return { label: 'Orta Seviye',   icon: '⚡', color: '#10B981', desc: '200-280 WPM — Ortalamanın üzerinde' }
  if (wpm < 350) return { label: 'Hızlı Okuyucu', icon: '🚀', color: '#F59E0B', desc: '280-350 WPM — İleri seviye' }
  return           { label: 'Uzman',           icon: '🏆', color: '#8B5CF6', desc: '350+ WPM — Elit okuyucu' }
}

function FlowResultScreen({
  metrics, xp, totalDurMin, totalDurSec, accentColor,
  hasQuiz, onQuiz, onRepeat, onComplete, onExit, t, s,
  showQuiz, questions, libraryTextId, onQuizClose,
}: FlowResultProps) {
  const { student } = useAuthStore()
  const speedTier  = getFlowSpeedTier(metrics.avgWPM)
  const regrNote   = metrics.regressionCount > 0
    ? `${metrics.regressionCount} kez geri döndün`
    : 'Hiç geri dönmeden okudun! 🎯'

  const [weeklyBest, setWeeklyBest] = useState<number | null>(null)
  const [rank,       setRank]       = useState<number | null>(null)
  const [streak,     setStreak]     = useState<number>(0)
  const isNewRecord = weeklyBest !== null && metrics.arpScore >= weeklyBest

  const [displayArp, setDisplayArp] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    let start = 0
    const target = metrics.arpScore
    const increment = target / 60
    intervalRef.current = setInterval(() => {
      start += increment
      if (start >= target) { setDisplayArp(target); if (intervalRef.current) clearInterval(intervalRef.current) }
      else { setDisplayArp(Math.round(start)) }
    }, 1500 / 60)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [metrics.arpScore])

  useEffect(() => {
    if (!student?.id) return
    const sid = student.id
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    ;(supabase as any)
      .from('reading_mode_sessions').select('arp_score')
      .eq('student_id', sid).gte('created_at', weekAgo)
      .order('arp_score', { ascending: false }).limit(1).single()
      .then(({ data }: any) => { if (data?.arp_score) setWeeklyBest(data.arp_score as number) })
    ;(supabase as any)
      .from('daily_stats').select('streak_days')
      .eq('student_id', sid).order('date', { ascending: false }).limit(1).single()
      .then(({ data }: any) => { if (data?.streak_days) setStreak(data.streak_days as number) })
    ;(supabase as any)
      .rpc('get_reading_rank', { p_arp: metrics.arpScore })
      .then(({ data }: any) => { if (typeof data === 'number') setRank(data) })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <SafeAreaView style={s.root}>
      {/* X Kapat */}
      <View style={{ paddingHorizontal: 16, paddingTop: 8, alignItems: 'flex-end' }}>
        <TouchableOpacity onPress={onExit}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={{ width: 38, height: 38, borderRadius: 19,
            backgroundColor: t.colors.surface, borderWidth: 1, borderColor: t.colors.border,
            alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 18, color: t.colors.textHint, fontWeight: '700' }}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={s.resultScroll} showsVerticalScrollIndicator={false}>
        <Text style={s.resultEmoji}>🎉</Text>
        <Text style={s.resultTitle}>Seans Tamamlandı!</Text>
        <Text style={s.resultSub}>Akış Okuma</Text>

        {/* ARP Kartı — speedTier inline */}
        <View style={[s.arpCard, { backgroundColor: accentColor }]}>
          <View style={s.arpHeaderRow}>
            <Text style={s.arpLabel}>ARP Skoru</Text>
            <View style={s.arpTierBadge}>
              <Text style={s.arpTierTxt}>{speedTier.icon} {speedTier.label}</Text>
            </View>
          </View>
          <Text style={s.arpValue}>{displayArp}</Text>
          {isNewRecord && (
            <View style={s.newRecordBadge}>
              <Text style={s.newRecordTxt}>🆕 Haftalık Rekor!</Text>
            </View>
          )}
        </View>

        {/* 4 Metrik */}
        <View style={s.metricsGrid}>
          {[
            { label: 'Ort. WPM',  value: String(metrics.avgWPM) },
            { label: 'Peak WPM',  value: String(metrics.peakWPM) },
            { label: 'Kelimeler', value: String(metrics.totalWords) },
            { label: 'Süre',      value: `${totalDurMin}:${String(totalDurSec).padStart(2, '0')}` },
          ].map((m) => (
            <View key={m.label} style={s.metricCard}>
              <Text style={s.metricValue}>{m.value}</Text>
              <Text style={s.metricLabel}>{m.label}</Text>
            </View>
          ))}
        </View>

        {/* BAŞARILAR */}
        <View style={s.achieveSection}>
          <Text style={s.achieveTitle}>BAŞARILAR</Text>

          <View style={[s.achieveRow, { borderLeftColor: speedTier.color }]}>
            <View style={[s.achieveIconWrap, { backgroundColor: speedTier.color + '18' }]}>
              <Text style={s.achieveIcon}>{speedTier.icon}</Text>
            </View>
            <View style={s.achieveInfo}>
              <Text style={[s.achieveLabel, { color: speedTier.color }]}>{speedTier.label}</Text>
              <Text style={s.achieveDesc}>{speedTier.desc}</Text>
            </View>
            <View style={[s.achievePill, { backgroundColor: speedTier.color }]}>
              <Text style={s.achievePillTxt}>{metrics.avgWPM} WPM</Text>
            </View>
          </View>

          {metrics.regressionCount === 0 && (
            <View style={[s.achieveRow, { borderLeftColor: '#10B981' }]}>
              <View style={[s.achieveIconWrap, { backgroundColor: '#D1FAE5' }]}>
                <Text style={s.achieveIcon}>🎯</Text>
              </View>
              <View style={s.achieveInfo}>
                <Text style={[s.achieveLabel, { color: '#10B981' }]}>Kesintisiz Akış</Text>
                <Text style={s.achieveDesc}>{regrNote}</Text>
              </View>
              <View style={[s.achievePill, { backgroundColor: '#10B981' }]}>
                <Text style={s.achievePillTxt}>Mükemmel</Text>
              </View>
            </View>
          )}

          {streak > 0 && (
            <View style={[s.achieveRow, { borderLeftColor: '#F59E0B' }]}>
              <View style={[s.achieveIconWrap, { backgroundColor: '#FEF3C7' }]}>
                <Text style={s.achieveIcon}>🔥</Text>
              </View>
              <View style={s.achieveInfo}>
                <Text style={[s.achieveLabel, { color: '#D97706' }]}>{streak} Günlük Seri</Text>
                <Text style={s.achieveDesc}>Her gün çalışmaya devam et!</Text>
              </View>
              <View style={[s.achievePill, { backgroundColor: '#F59E0B' }]}>
                <Text style={s.achievePillTxt}>{streak} gün</Text>
              </View>
            </View>
          )}
        </View>

        {/* Kişisel Kıyaslama */}
        <View style={s.socialRow}>
          <View style={s.socialBox}>
            <Text style={s.socialIcon}>📊</Text>
            <Text style={s.socialValue}>{weeklyBest ? (isNewRecord ? 'Rekor!' : String(weeklyBest)) : '—'}</Text>
            <Text style={s.socialLabel}>Haftalık en iyi</Text>
          </View>
          <View style={[s.socialBox, s.socialBoxBorder]}>
            <Text style={s.socialIcon}>🏅</Text>
            <Text style={s.socialValue}>{rank ? `#${rank}` : '—'}</Text>
            <Text style={s.socialLabel}>Genel sıralama</Text>
          </View>
          <View style={[s.socialBox, s.socialBoxBorder]}>
            <Text style={s.socialIcon}>⭐</Text>
            <Text style={s.socialValue}>+{xp}</Text>
            <Text style={s.socialLabel}>XP kazanıldı</Text>
          </View>
        </View>

        {/* Quiz Butonu */}
        {hasQuiz && (
          <TouchableOpacity
            style={{ backgroundColor: '#10B981', borderRadius: 14, paddingVertical: 14,
              alignItems: 'center', marginHorizontal: 16, marginTop: 12 }}
            onPress={onQuiz}
          >
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>📝 Anlama Soruları</Text>
          </TouchableOpacity>
        )}

        {/* Butonlar */}
        <View style={s.resultActions}>
          <TouchableOpacity style={[s.repeatBtn, { borderColor: accentColor }]} onPress={onRepeat}>
            <Text style={[s.repeatBtnTxt, { color: accentColor }]}>Tekrar Yap</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.saveBtn, { backgroundColor: accentColor }]} onPress={onComplete}>
            <Text style={s.saveBtnTxt}>İleri →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <QuestionModal
        visible={showQuiz}
        questions={questions}
        textId={libraryTextId}
        chapterId={null}
        onComplete={onQuizClose}
        onSkip={onQuizClose}
      />
    </SafeAreaView>
  )
}

// ─── Stiller ───────────────────────────────────────────────────────

function ms(t: AppTheme, rtBg: string, rtText: string) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: t.colors.background },

    // SELECT
    selectHeader: {
      alignItems: 'center', paddingTop: 20, paddingBottom: 16,
      backgroundColor: t.colors.panel,
    },
    exitBtn:  {
      width: 32, height: 32, borderRadius: 16,
      backgroundColor: 'rgba(128,128,128,0.18)',
      alignItems: 'center', justifyContent: 'center',
    },
    exitTxt:  { fontSize: 15, color: t.colors.text, fontWeight: '700' },
    selectTitle: { fontSize: 22, fontWeight: '900', color: '#fff', marginBottom: 4 },
    selectSub:   { fontSize: 13, color: 'rgba(255,255,255,0.6)' },
    selectBody:  { flex: 1, padding: 16, gap: 12 },

    // Content card
    contentCard: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      backgroundColor: t.colors.surface, borderRadius: 16, padding: 14,
      borderWidth: 1, borderColor: t.colors.border,
    },
    contentIcon:  { fontSize: 28 },
    contentInfo:  { flex: 1 },
    contentTitle: { fontSize: 15, fontWeight: '700', color: t.colors.text },
    contentMeta:  { fontSize: 12, color: t.colors.textHint, marginTop: 3 },
    changeBtn:    { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1 },
    changeTxt:    { fontSize: 12, fontWeight: '700' },

    // WPM card
    wpmCard: {
      backgroundColor: t.colors.surface, borderRadius: 16, padding: 16,
      borderWidth: 1, borderColor: t.colors.border,
    },
    cardLabel: {
      fontSize: 11, fontWeight: '800', color: t.colors.textHint,
      letterSpacing: 1, marginBottom: 12,
    },
    wpmAdjRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 12 },
    wpmAdjBtn:    { width: 44, height: 44, borderRadius: 12, backgroundColor: t.colors.background, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: t.colors.border },
    wpmAdjTxt:    { fontSize: 24, fontWeight: '700', color: t.colors.text },
    wpmDisplay:   { fontSize: 32, fontWeight: '900', minWidth: 120, textAlign: 'center' },
    wpmUnit:      { fontSize: 16, fontWeight: '600', color: t.colors.textHint },
    wpmPresetsRow:{ flexDirection: 'row', justifyContent: 'space-evenly' },
    wpmPreset:    { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6, borderWidth: 1, borderColor: t.colors.border, backgroundColor: t.colors.background, minWidth: 38, alignItems: 'center' },
    wpmPresetTxt: { fontSize: 12, fontWeight: '700', color: t.colors.textHint },
    wpmPresetTxtActive: { color: '#fff' },

    // Cursor card
    cursorCard: {
      backgroundColor: t.colors.surface, borderRadius: 16, padding: 16,
      borderWidth: 1, borderColor: t.colors.border,
    },
    cursorStyleRow:   { flexDirection: 'row', gap: 8 },
    cursorStyleBtn:   { flex: 1, borderRadius: 12, paddingVertical: 10, alignItems: 'center', borderWidth: 1.5, borderColor: t.colors.border, backgroundColor: t.colors.background, gap: 4 },
    cursorStyleIcon:  { fontSize: 16 },
    cursorStyleLabel: { fontSize: 11, fontWeight: '600', color: t.colors.textHint },

    startBtn:     { borderRadius: 16, paddingVertical: 18, alignItems: 'center' },
    startBtnTxt:  { fontSize: 17, fontWeight: '700', color: '#fff' },

    // legacy (reading phase reuses these)
    wpmRow:       { flexDirection: 'row', alignItems: 'center', gap: 10 },
    wpmValue:     { fontSize: 18, fontWeight: '800', minWidth: 52, textAlign: 'center' },

    // READING
    readHeader:  {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      paddingHorizontal: 16, paddingVertical: 12,
      backgroundColor: '#1D3A80',   // canlı lacivert header
      borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    readTitle:   { flex: 1, fontSize: 15, fontWeight: '700', color: '#DBEAFE' },  // pastel mavi başlık
    modeBtn:     { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: t.colors.surface + '40' },
    modeBtnTxt:  { fontSize: 12, fontWeight: '700' },
    settingsBtn: { padding: 6 },
    settingsBtnTxt: { fontSize: 18 },

    progressWrap: { paddingHorizontal: 16, paddingVertical: 6, backgroundColor: '#132558' },
    progressTrack:{ height: 3, backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: 2, overflow: 'hidden' },
    progressFill: { height: 3, borderRadius: 2 },
    progressTxt:  { fontSize: 11, color: '#93C5FD', marginTop: 4 },  // pastel mavi

    textArea:    { flex: 1, paddingHorizontal: 20, justifyContent: 'center', gap: 4 },
    lineSlot:    { minHeight: 32, justifyContent: 'center' },
    lineSlotActive: { minHeight: 44 },
    lineTextRow: { flexDirection: 'row', flexWrap: 'wrap' },
    lineText:    { color: t.colors.text, letterSpacing: 0.2 },
    word:        { color: t.colors.text },
    cursorContainer: { height: 4, marginTop: 3, overflow: 'hidden' },
    // LINE: sabit 28px genişlik, translateX ile kayar — metnin sonunu aşmaz
    cursorLine:      { position: 'absolute', left: 0, height: 4, width: 28, borderRadius: 2 },
    // UNDERLINE: genişleyen alt çizgi, Easing.steps ile kelime kelime büyür
    cursorUnderline: { height: 2, borderRadius: 1 },
    cursorDot:       { position: 'absolute', width: 10, height: 10, borderRadius: 5, top: -3 },

    // Kontroller
    controls:    {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 20, paddingVertical: 10,
      backgroundColor: '#1A3070',   // canlı lacivert kontrol paneli
      borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)',
    },
    ctrlBtn:     { padding: 8 },
    ctrlBtnTxt:  { fontSize: 13, fontWeight: '600', color: '#93C5FD' },  // pastel mavi ok
    playBtn:     { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    playBtnTxt:  { fontSize: 20, color: '#fff' },
    wpmSlider:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
    wpmStepBtn:  { padding: 8 },
    wpmStepTxt:  { fontSize: 14, fontWeight: '700', color: '#93C5FD' },  // pastel mavi ±
    wpmValueLive:{ fontSize: 15, fontWeight: '800', minWidth: 70, textAlign: 'center' },

    presetScroll: { maxHeight: 36, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', backgroundColor: '#132558' },
    presetContent:{ paddingHorizontal: 12, gap: 6, alignItems: 'center' },
    presetBtn:   {
      paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999,
      backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    },
    presetTxt:   { fontSize: 12, color: '#BFDBFE', fontWeight: '600' },  // açık mavi preset yazı
    presetTxtActive: { color: '#fff' },

    statsBar:    {
      flexDirection: 'row', justifyContent: 'space-around',
      paddingVertical: 8, paddingBottom: Platform.OS === 'ios' ? 4 : 8,
      backgroundColor: '#0F1F50',   // en derin lacivert — istatistik şeridi
      borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)',
    },
    statCell:    { alignItems: 'center' },
    statValue:   { fontSize: 15, fontWeight: '800', color: '#DBEAFE' },  // pastel mavi değer
    statLabel:   { fontSize: 9, color: '#93C5FD', marginTop: 1, letterSpacing: 0.5 },  // canlı mavi etiket

    // Settings sheet
    settingsOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 100 },
    settingsDim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
    settingsSheet: {
      position: 'absolute', bottom: 0, left: 0, right: 0,
      backgroundColor: t.colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24,
      padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    },
    sheetTitle:  { fontSize: 17, fontWeight: '800', color: t.colors.text, marginBottom: 16 },
    sheetSection:{ fontSize: 13, fontWeight: '700', color: t.colors.textHint, marginBottom: 8, marginTop: 12 },
    sheetRow:    { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    sheetOptionBtn: {
      borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
      borderWidth: 1.5, borderColor: t.colors.border, alignItems: 'center',
    },
    sheetOptionIcon: { fontSize: 16, marginBottom: 2 },
    sheetOptionLabel: { fontSize: 12, fontWeight: '600', color: t.colors.text },
    sheetToggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 },
    sheetToggleLabel: { fontSize: 14, color: t.colors.text, fontWeight: '500' },
    toggle:      { borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: t.colors.border },
    toggleTxt:   { fontSize: 13, fontWeight: '700', color: '#fff' },
    sheetClose:  { borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 20 },
    sheetCloseTxt: { fontSize: 16, fontWeight: '700', color: '#fff' },

    // RESULT
    resultScroll:    { paddingBottom: 48 },
    resultEmoji:     { fontSize: 40, textAlign: 'center', marginTop: 12 },
    resultTitle:     { fontSize: 22, fontWeight: '900', color: t.colors.text, textAlign: 'center', marginTop: 6, letterSpacing: -0.4 },
    resultSub:       { fontSize: 13, color: t.colors.textHint, textAlign: 'center', marginTop: 2, fontWeight: '500' },

    arpCard: {
      borderRadius: 20, paddingVertical: 20, paddingHorizontal: 20,
      alignItems: 'center', marginHorizontal: 16, marginTop: 16,
      shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 }, elevation: 6, gap: 6,
    },
    arpHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    arpLabel:     { fontSize: 11, fontWeight: '900', color: 'rgba(255,255,255,0.80)', letterSpacing: 1.5, textTransform: 'uppercase' as const },
    arpTierBadge: { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 2 },
    arpTierTxt:   { fontSize: 11, color: '#fff', fontWeight: '800' as const },
    arpValue:     { fontSize: 64, fontWeight: '900' as const, color: '#FFFFFF', letterSpacing: -2, lineHeight: 72 },
    newRecordBadge: { backgroundColor: '#F59E0B', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 3 },
    newRecordTxt:   { fontSize: 11, color: '#fff', fontWeight: '900' as const },

    metricsGrid: { flexDirection: 'row', flexWrap: 'wrap' as const, gap: 8, paddingHorizontal: 16, marginTop: 12 },
    metricCard:  { width: '47%' as `${number}%`, backgroundColor: '#F9FAFB', borderRadius: 14, padding: 14, alignItems: 'center' as const, gap: 4, borderWidth: 1, borderColor: '#E5E7EB' },
    metricValue: { fontSize: 20, fontWeight: '900' as const, color: '#111827', letterSpacing: -0.4 },
    metricLabel: { fontSize: 11, fontWeight: '600' as const, color: '#6B7280', textAlign: 'center' as const },

    achieveSection: { paddingHorizontal: 16, marginTop: 20, gap: 8 },
    achieveTitle:   { fontSize: 11, fontWeight: '800' as const, color: '#9CA3AF', letterSpacing: 1.5 },
    achieveRow: {
      flexDirection: 'row' as const, alignItems: 'center' as const, gap: 12,
      backgroundColor: '#FAFAFA', borderRadius: 14, padding: 12,
      borderLeftWidth: 4, borderWidth: 1, borderColor: '#F3F4F6',
    },
    achieveIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center' as const, justifyContent: 'center' as const },
    achieveIcon:     { fontSize: 18 },
    achieveInfo:     { flex: 1, gap: 2 },
    achieveLabel:    { fontSize: 14, fontWeight: '800' as const },
    achieveDesc:     { fontSize: 11, color: '#6B7280', fontWeight: '500' as const },
    achievePill:     { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
    achievePillTxt:  { fontSize: 11, color: '#fff', fontWeight: '800' as const },

    socialRow: {
      flexDirection: 'row' as const, backgroundColor: '#FAFAFA',
      marginHorizontal: 16, marginTop: 16,
      borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', overflow: 'hidden' as const,
    },
    socialBox:       { flex: 1, alignItems: 'center' as const, paddingVertical: 14, gap: 4 },
    socialBoxBorder: { borderLeftWidth: 1, borderLeftColor: '#E5E7EB' },
    socialIcon:      { fontSize: 18 },
    socialValue:     { fontSize: 15, fontWeight: '900' as const, color: '#111827' },
    socialLabel:     { fontSize: 10, color: '#6B7280', fontWeight: '600' as const, textAlign: 'center' as const },

    resultActions: { flexDirection: 'row' as const, gap: 10, paddingHorizontal: 16, marginTop: 20, marginBottom: 8 },
    repeatBtn:     { flex: 1, borderWidth: 2, borderRadius: 14, paddingVertical: 14, alignItems: 'center' as const },
    repeatBtnTxt:  { fontSize: 15, fontWeight: '700' as const },
    saveBtn:       { flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center' as const },
    saveBtnTxt:    { fontSize: 15, fontWeight: '700' as const, color: '#fff' },
  })
}
