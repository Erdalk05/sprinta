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
import ContentImportModal, {
  ImportedContent, saveRecentContent,
} from '../shared/ContentImportModal'
import { QuestionModal } from '../../reading/QuestionModal'
import type { TextQuestion, QuestionAnswer } from '@sprinta/api'
import { supabase } from '../../../lib/supabase'
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

export default function FlowReadingExercise({ onComplete, onExit, initialContent }: Props) {
  const t = useAppTheme()
  const s = useMemo(() => ms(t), [t])

  const [phase, setPhase]               = useState<Phase>('select')
  const [settings, setSettings]         = useState<Settings>(DEFAULT_SETTINGS)
  const [showSettings, setShowSettings] = useState(false)
  const [showImport, setShowImport]     = useState(false)
  const [content, setContent]           = useState<ImportedContent | null>(initialContent ?? null)

  // Okuma state
  const [lines, setLines]               = useState<TextLine[]>([])
  const [lineIdx, setLineIdx]           = useState(0)
  const [isPlaying, setIsPlaying]       = useState(false)
  const [currentWPM, setCurrentWPM]     = useState(DEFAULT_SETTINGS.targetWPM)
  const [wpmHistory, setWpmHistory]     = useState<number[]>([])
  const [regressionCount, setRegressionCount] = useState(0)
  const [startTime, setStartTime]       = useState<number | null>(null)
  const [finalMetrics, setFinalMetrics] = useState<FlowReadingMetrics | null>(null)

  // Quiz
  const [showQuiz,  setShowQuiz]  = useState(false)
  const [questions, setQuestions] = useState<TextQuestion[]>([])

  // Cursor animasyonu
  const cursorX       = useSharedValue(0)   // 0 → 1 (satır genişliğinin yüzdesi)
  const dotPulse      = useSharedValue(1)
  const lineWidth     = useRef(300)         // container genişliği (ölçülür)
  const textLineWidth = useSharedValue(300) // SON satırın gerçek metin genişliği (onTextLayout ile)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
  }, [settings.cursorStyle, cursorX, dotPulse])

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
    if (idx >= lines.length) { finishSession(); return }
    const line = lines[idx]
    if (!line) return

    // WPM geçmişi
    const now      = Date.now()
    const elapsed  = startTime ? now - startTime : 0
    const wordsRead = lines.slice(0, idx + 1).reduce((s, l) => s + l.wordCount, 0)
    const instWPM  = calculateRealTimeWPM(wordsRead, elapsed)
    if (instWPM > 0) setWpmHistory((h) => [...h.slice(-29), instWPM])

    // Cursor başlat
    startCursorForLine(line)

    timerRef.current = setTimeout(() => {
      setLineIdx((prev) => {
        const next = prev + 1
        if (next < lines.length) scheduleNext(next)
        else finishSession()
        return next
      })
    }, line.estimatedReadMs)
  }, [lines, startTime, startCursorForLine]) // eslint-disable-line react-hooks/exhaustive-deps

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

  const changeWPM = (delta: number) => {
    const next = Math.max(100, Math.min(600, currentWPM + delta))
    setCurrentWPM(next)
    if (content) {
      const raw = parseTextToLines(content.text, settings.wordsPerLine)
      const withDur = applyLineDurations(raw, next, settings.readingMode, settings.smartSlowing)
      setLines(withDur)
    }
  }

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

  // LINE: soldan sağa kayan sabit genişlikte kılavuz çubuğu
  // Kelimenin sonu = container sağ kenarı → metin bitmeden önce durur
  const cursorLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: cursorX.value * Math.max(0, lineWidth.current - 28) }],
  }))

  // UNDERLINE: kelime kelime büyüyen alt çizgi — SON satırın gerçek metin genişliğine kadar
  // textLineWidth, onTextLayout ile ölçülür → kısa satırlarda metni aşmaz
  const cursorUnderlineStyle = useAnimatedStyle(() => ({
    width: cursorX.value * textLineWidth.value,
  }))

  const cursorDotStyle = useAnimatedStyle(() => ({
    left: `${cursorX.value * 92}%` as any,
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

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  // ── AŞAMA 1: İçerik Seç ────────────────────────────────────────

  if (phase === 'select') {
    return (
      <SafeAreaView style={s.root}>
        <View style={s.selectHeader}>
          <TouchableOpacity onPress={onExit} style={s.exitBtn}
            hitSlop={{ top:10, bottom:10, left:10, right:10 }}>
            <Text style={s.exitTxt}>✕</Text>
          </TouchableOpacity>
          <Text style={s.selectTitle}>🌊 Akış Okuma</Text>
          <Text style={s.selectSub}>Satır satır, rehber çizgiyle oku</Text>
        </View>

        {content ? (
          <ScrollView contentContainerStyle={s.selectBody}>
            <View style={s.contentCard}>
              <Text style={s.contentIcon}>📄</Text>
              <View style={s.contentInfo}>
                <Text style={s.contentTitle}>{content.title}</Text>
                <Text style={s.contentMeta}>
                  {content.wordCount} kelime  ·  ~{content.estimatedMinutes} dk
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowImport(true)} style={s.changeBtn}>
                <Text style={s.changeTxt}>Değiştir</Text>
              </TouchableOpacity>
            </View>

            {/* Settings önizleme */}
            <View style={s.settingsPrev}>
              <Text style={s.settingsPrevTitle}>⚙️ Ayarlar</Text>
              <View style={s.settingsRow}>
                <Text style={s.settingsLabel}>Cursor Stili</Text>
                <View style={s.cursorBtns}>
                  {(['line', 'dot', 'highlight', 'underline'] as const).map((cs) => (
                    <TouchableOpacity
                      key={cs}
                      style={[s.cursorBtn, settings.cursorStyle === cs && { backgroundColor: t.module.speed_control.color }]}
                      onPress={() => saveSettings({ ...settings, cursorStyle: cs })}
                    >
                      <Text style={[s.cursorBtnTxt, settings.cursorStyle === cs && s.cursorBtnTxtActive]}>
                        {cs === 'line' ? '—' : cs === 'dot' ? '●' : cs === 'highlight' ? '✨' : '_'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={s.settingsRow}>
                <Text style={s.settingsLabel}>Hedef WPM</Text>
                <View style={s.wpmRow}>
                  <TouchableOpacity onPress={() => changeWPM(-25)} style={s.wpmStepBtn}>
                    <Text style={s.wpmStepTxt}>−25</Text>
                  </TouchableOpacity>
                  <Text style={[s.wpmValue, { color: t.module.speed_control.color }]}>{currentWPM}</Text>
                  <TouchableOpacity onPress={() => changeWPM(+25)} style={s.wpmStepBtn}>
                    <Text style={s.wpmStepTxt}>+25</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <TouchableOpacity style={[s.startBtn, { backgroundColor: t.module.speed_control.color }]} onPress={handleStart}>
              <Text style={s.startBtnTxt}>Egzersizi Başlat →</Text>
            </TouchableOpacity>
          </ScrollView>
        ) : (
          <View style={s.selectEmpty}>
            <Text style={s.emptyEmoji}>📖</Text>
            <Text style={s.emptyTitle}>İçerik Seç</Text>
            <Text style={s.emptySub}>Kütüphane, metin veya URL'den okuyacağın içeriği seç.</Text>
            <TouchableOpacity
              style={[s.importBtn, { backgroundColor: t.module.speed_control.color }]}
              onPress={() => setShowImport(true)}
            >
              <Text style={s.importBtnTxt}>İçerik Seç →</Text>
            </TouchableOpacity>
          </View>
        )}

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
          <TouchableOpacity onPress={() => { setIsPlaying(false); setPhase('select') }} style={s.exitBtn}
            hitSlop={{ top:10, bottom:10, left:10, right:10 }}>
            <Text style={s.exitTxt}>✕</Text>
          </TouchableOpacity>
          <Text style={s.readTitle} numberOfLines={1}>{content?.title ?? 'Akış Okuma'}</Text>
          <TouchableOpacity onPress={toggleMode} style={s.modeBtn}>
            <Text style={[s.modeBtnTxt, { color: settings.readingMode === 'cruise' ? t.module.speed_control.color : t.colors.textHint }]}>
              {settings.readingMode === 'sprint' ? 'Sprint' : 'Cruise'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowSettings(true)} style={s.settingsBtn}>
            <Text style={s.settingsBtnTxt}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Progress */}
        <View style={s.progressWrap}>
          <View style={s.progressTrack}>
            <View style={[s.progressFill, { width: `${progressPct}%` as any, backgroundColor: t.module.speed_control.color }]} />
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
                            wi < highlightState.endWord && { color: t.module.speed_control.color, fontWeight: '700' },
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
                      <Animated.View style={[s.cursorLine, { backgroundColor: t.module.speed_control.color }, cursorLineStyle]} />
                    )}
                    {settings.cursorStyle === 'underline' && (
                      // Kelime kelime büyüyen alt çizgi (Easing.steps)
                      <Animated.View style={[s.cursorUnderline, { backgroundColor: t.module.speed_control.color + 'AA' }, cursorUnderlineStyle]} />
                    )}
                    {settings.cursorStyle === 'dot' && (
                      <Animated.View style={[s.cursorDot, { backgroundColor: t.module.speed_control.color }, cursorDotStyle]} />
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
          <TouchableOpacity onPress={togglePlay} style={[s.playBtn, { backgroundColor: t.module.speed_control.color }]}>
            <Text style={s.playBtnTxt}>{isPlaying ? '⏸' : '▶'}</Text>
          </TouchableOpacity>
          <View style={s.wpmSlider}>
            <TouchableOpacity onPress={() => changeWPM(-25)} style={s.wpmStepBtn}>
              <Text style={s.wpmStepTxt}>−</Text>
            </TouchableOpacity>
            <Text style={[s.wpmValueLive, { color: t.module.speed_control.color }]}>{currentWPM} WPM</Text>
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
              style={[s.presetBtn, currentWPM === w && { backgroundColor: t.module.speed_control.color }]}
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
              <Text style={s.sheetTitle}>⚙️ Akış Okuma Ayarları</Text>

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
                    style={[s.sheetOptionBtn, settings.cursorStyle === cs.id && { borderColor: t.module.speed_control.color, backgroundColor: t.module.speed_control.color + '20' }]}
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
                    style={[s.sheetOptionBtn, settings.wordsPerLine === n && { borderColor: t.module.speed_control.color, backgroundColor: t.module.speed_control.color + '20' }]}
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
                    style={[s.sheetOptionBtn, settings.fontSize === fs && { borderColor: t.module.speed_control.color, backgroundColor: t.module.speed_control.color + '20' }]}
                    onPress={() => saveSettings({ ...settings, fontSize: fs })}
                  >
                    <Text style={s.sheetOptionLabel}>{fs === 'small' ? 'Küçük' : fs === 'medium' ? 'Orta' : 'Büyük'}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={s.sheetToggleRow}>
                <Text style={s.sheetToggleLabel}>Akıllı Yavaşlama</Text>
                <TouchableOpacity
                  style={[s.toggle, settings.smartSlowing && { backgroundColor: t.module.speed_control.color }]}
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

              <TouchableOpacity style={[s.sheetClose, { backgroundColor: t.module.speed_control.color }]} onPress={() => setShowSettings(false)}>
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
        .select('*')
        .eq('text_id', textId)
        .order('order_index')
        .limit(5)
      setQuestions((data as TextQuestion[]) ?? [])
      setShowQuiz(true)
    } catch { /* sessiz */ }
  }, [content])

  if (!finalMetrics) return null

  const totalDurMin = Math.floor(finalMetrics.durationSeconds / 60)
  const totalDurSec = finalMetrics.durationSeconds % 60
  const xp = calculateXP(finalMetrics.arpScore, finalMetrics.totalWords, finalMetrics.durationSeconds)
  const regrNote = finalMetrics.regressionCount > 0
    ? `${finalMetrics.regressionCount} kez geri döndün`
    : 'Hiç geri dönmeden okudun! 🎯'

  return (
    <SafeAreaView style={s.root}>
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
      <ScrollView contentContainerStyle={s.resultScroll} showsVerticalScrollIndicator={false}>
        {/* Başlık */}
        <View style={s.resultHero}>
          <Text style={s.resultEmoji}>🎉</Text>
          <Text style={s.resultTitle}>Akış Tamamlandı!</Text>
          <Text style={s.resultSub}>Akış Okuma seansı bitti</Text>
        </View>

        {/* ARP Kartı */}
        <View style={[s.arpCard, { backgroundColor: t.module.speed_control.color }]}>
          <Text style={s.arpLabel}>ARP Puanın</Text>
          <Text style={s.arpValue}>{finalMetrics.arpScore}</Text>
          <Text style={s.arpNote}>{regrNote}</Text>
        </View>

        {/* XP */}
        <View style={s.xpBadge}>
          <Text style={s.xpTxt}>+{xp} XP kazandın! ⭐</Text>
        </View>

        {/* Metrikler */}
        <View style={s.metricsGrid}>
          {[
            { label: 'Ort. WPM', value: String(finalMetrics.avgWPM) },
            { label: 'Peak WPM', value: String(finalMetrics.peakWPM) },
            { label: 'Toplam Kelime', value: String(finalMetrics.totalWords) },
            { label: 'Süre', value: `${totalDurMin}:${String(totalDurSec).padStart(2, '0')}` },
            { label: 'Toplam Satır', value: String(finalMetrics.totalLines) },
            { label: 'Cursor Stili', value: finalMetrics.cursorStyle.toUpperCase() },
          ].map((m) => (
            <View key={m.label} style={s.metricCard}>
              <Text style={s.metricValue}>{m.value}</Text>
              <Text style={s.metricLabel}>{m.label}</Text>
            </View>
          ))}
        </View>

        {/* Quiz Butonu */}
        {content?.source === 'library' && (
          <TouchableOpacity
            style={{ backgroundColor:'#10B981', borderRadius:14, paddingVertical:14,
              alignItems:'center', marginHorizontal:0, marginBottom:8 }}
            onPress={fetchAndShowQuiz}
          >
            <Text style={{ color:'#fff', fontWeight:'800', fontSize:16 }}>📝 Anlama Soruları</Text>
          </TouchableOpacity>
        )}

        {/* Butonlar */}
        <View style={s.resultActions}>
          <TouchableOpacity
            style={[s.repeatBtn, { borderColor: t.module.speed_control.color }]}
            onPress={() => {
              setPhase('select')
              setFinalMetrics(null)
              setLineIdx(0)
              setWpmHistory([])
              setRegressionCount(0)
            }}
          >
            <Text style={[s.repeatBtnTxt, { color: t.module.speed_control.color }]}>Tekrar Yap</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.saveBtn, { backgroundColor: t.module.speed_control.color }]}
            onPress={() => { onComplete(finalMetrics); onExit() }}
          >
            <Text style={s.saveBtnTxt}>İleri →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <QuestionModal
        visible={showQuiz}
        questions={questions}
        textId={content?.libraryTextId ?? ''}
        chapterId={null}
        onComplete={(_answers: QuestionAnswer[]) => {
          setShowQuiz(false)
          onComplete(finalMetrics)
          onExit()
        }}
        onSkip={() => setShowQuiz(false)}
      />
    </SafeAreaView>
  )
}

// ─── Stiller ───────────────────────────────────────────────────────

function ms(t: AppTheme) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: t.colors.background },

    // SELECT
    selectHeader: { alignItems: 'center', paddingTop: 20, paddingBottom: 16, backgroundColor: t.colors.panel },
    exitBtn:      { paddingHorizontal: 16, paddingVertical: 10, alignSelf: 'flex-start' },
    exitTxt:      { fontSize: 15, color: 'rgba(255,255,255,0.7)' },
    selectTitle:  { fontSize: 22, fontWeight: '900', color: '#fff', marginBottom: 4 },
    selectSub:    { fontSize: 13, color: 'rgba(255,255,255,0.6)' },
    selectBody:   { padding: 20, paddingBottom: 40 },
    selectEmpty:  { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
    emptyEmoji:   { fontSize: 56, marginBottom: 16 },
    emptyTitle:   { fontSize: 22, fontWeight: '800', color: t.colors.text, marginBottom: 8 },
    emptySub:     { fontSize: 14, color: t.colors.textSub, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
    importBtn:    { borderRadius: 16, paddingVertical: 16, paddingHorizontal: 32, alignItems: 'center' },
    importBtnTxt: { fontSize: 16, fontWeight: '700', color: '#fff' },

    contentCard:  {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      backgroundColor: t.colors.surface, borderRadius: 16, padding: 14,
      borderWidth: 1, borderColor: t.colors.border, marginBottom: 16,
    },
    contentIcon:  { fontSize: 28 },
    contentInfo:  { flex: 1 },
    contentTitle: { fontSize: 15, fontWeight: '700', color: t.colors.text },
    contentMeta:  { fontSize: 12, color: t.colors.textHint, marginTop: 3 },
    changeBtn:    { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: t.colors.border },
    changeTxt:    { fontSize: 12, fontWeight: '600', color: t.colors.textHint },

    settingsPrev: { backgroundColor: t.colors.surface, borderRadius: 16, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: t.colors.border },
    settingsPrevTitle: { fontSize: 13, fontWeight: '700', color: t.colors.textHint, marginBottom: 12 },
    settingsRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
    settingsLabel:{ fontSize: 14, color: t.colors.text, fontWeight: '500' },
    cursorBtns:   { flexDirection: 'row', gap: 6 },
    cursorBtn:    { width: 36, height: 36, borderRadius: 10, backgroundColor: t.colors.border, alignItems: 'center', justifyContent: 'center' },
    cursorBtnTxt: { fontSize: 14, color: t.colors.textHint },
    cursorBtnTxtActive: { color: '#fff', fontWeight: '700' },
    wpmRow:       { flexDirection: 'row', alignItems: 'center', gap: 10 },
    wpmValue:     { fontSize: 18, fontWeight: '800', minWidth: 52, textAlign: 'center' },

    startBtn:     { borderRadius: 16, paddingVertical: 18, alignItems: 'center' },
    startBtnTxt:  { fontSize: 17, fontWeight: '700', color: '#fff' },

    // READING
    readHeader:  {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      paddingHorizontal: 16, paddingVertical: 12,
      backgroundColor: t.colors.panel, borderBottomWidth: 1, borderBottomColor: t.colors.divider,
    },
    readTitle:   { flex: 1, fontSize: 15, fontWeight: '700', color: '#fff' },
    modeBtn:     { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: t.colors.surface + '40' },
    modeBtnTxt:  { fontSize: 12, fontWeight: '700' },
    settingsBtn: { padding: 6 },
    settingsBtnTxt: { fontSize: 18 },

    progressWrap: { paddingHorizontal: 16, paddingVertical: 6 },
    progressTrack:{ height: 3, backgroundColor: t.colors.divider, borderRadius: 2, overflow: 'hidden' },
    progressFill: { height: 3, borderRadius: 2 },
    progressTxt:  { fontSize: 11, color: t.colors.textHint, marginTop: 4 },

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
      borderTopWidth: 1, borderTopColor: t.colors.divider,
    },
    ctrlBtn:     { padding: 8 },
    ctrlBtnTxt:  { fontSize: 13, fontWeight: '600', color: t.colors.textHint },
    playBtn:     { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    playBtnTxt:  { fontSize: 20, color: '#fff' },
    wpmSlider:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
    wpmStepBtn:  { padding: 8 },
    wpmStepTxt:  { fontSize: 14, fontWeight: '700', color: t.colors.textHint },
    wpmValueLive:{ fontSize: 15, fontWeight: '800', minWidth: 70, textAlign: 'center' },

    presetScroll: { maxHeight: 36, borderTopWidth: 1, borderTopColor: t.colors.divider },
    presetContent:{ paddingHorizontal: 12, gap: 6, alignItems: 'center' },
    presetBtn:   {
      paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999,
      backgroundColor: t.colors.surface, borderWidth: 1, borderColor: t.colors.border,
    },
    presetTxt:   { fontSize: 12, color: t.colors.textHint, fontWeight: '600' },
    presetTxtActive: { color: '#fff' },

    statsBar:    {
      flexDirection: 'row', justifyContent: 'space-around',
      paddingVertical: 8, paddingBottom: Platform.OS === 'ios' ? 4 : 8,
      backgroundColor: t.colors.surface, borderTopWidth: 1, borderTopColor: t.colors.border,
    },
    statCell:    { alignItems: 'center' },
    statValue:   { fontSize: 15, fontWeight: '800', color: t.colors.text },
    statLabel:   { fontSize: 9, color: t.colors.textHint, marginTop: 1, letterSpacing: 0.5 },

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
    resultScroll:{ padding: 24, paddingBottom: 48 },
    resultHero:  { alignItems: 'center', marginBottom: 24, marginTop: 8 },
    resultEmoji: { fontSize: 56, marginBottom: 8 },
    resultTitle: { fontSize: 26, fontWeight: '800', color: t.colors.text },
    resultSub:   { fontSize: 14, color: t.colors.textSub, marginTop: 4 },
    arpCard:     { borderRadius: 20, padding: 24, marginBottom: 16, alignItems: 'center' },
    arpLabel:    { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginBottom: 8 },
    arpValue:    { fontSize: 72, fontWeight: '900', color: '#fff', lineHeight: 80 },
    arpNote:     { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 6, fontWeight: '600' },
    xpBadge:     { backgroundColor: '#FEF3C7', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 20, alignItems: 'center', marginBottom: 20 },
    xpTxt:       { fontSize: 16, fontWeight: '700', color: '#92400E' },
    metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
    metricCard:  { flex: 1, minWidth: '44%', backgroundColor: t.colors.surface, borderRadius: 14, padding: 16, alignItems: 'center' },
    metricValue: { fontSize: 20, fontWeight: '800', color: t.colors.text },
    metricLabel: { fontSize: 12, color: t.colors.textHint, marginTop: 4, textAlign: 'center' },
    resultActions: { gap: 12 },
    repeatBtn:   { borderWidth: 2, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
    repeatBtnTxt:{ fontSize: 16, fontWeight: '700' },
    saveBtn:     { borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
    saveBtnTxt:  { fontSize: 16, fontWeight: '700', color: '#fff' },
  })
}
