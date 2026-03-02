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
  onComplete:      (metrics: ChunkRSVPMetrics) => void
  onExit:          () => void
  /** Kütüphaneden gelen metin — varsa seçim ekranını atla */
  initialContent?: ImportedContent
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

export default function ChunkRSVPExercise({ onComplete, onExit, initialContent }: Props) {
  const t = useAppTheme()
  const s = useMemo(() => ms(t), [t])

  const [phase, setPhase]           = useState<Phase>(initialContent ? 'select' : 'select')
  const [settings, setSettings]     = useState<Settings>(DEFAULT_SETTINGS)
  const [showSettings, setShowSettings] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [content, setContent]       = useState<ImportedContent | null>(initialContent ?? null)

  // Okuma state
  const [chunks, setChunks]         = useState<Chunk[]>([])
  const [chunkIdx, setChunkIdx]     = useState(0)
  const [isPlaying, setIsPlaying]   = useState(false)
  const [currentWPM, setCurrentWPM] = useState(DEFAULT_SETTINGS.targetWPM)
  const [wpmHistory, setWpmHistory] = useState<number[]>([])
  const [regressionCount, setRegressionCount] = useState(0)
  const [elapsedMs, setElapsedMs]   = useState(0)
  const [startTime, setStartTime]   = useState<number | null>(null)

  // Seans sonu
  const [finalMetrics, setFinalMetrics] = useState<ChunkRSVPMetrics | null>(null)

  // Quiz
  const [showQuiz,   setShowQuiz]   = useState(false)
  const [questions,  setQuestions]  = useState<TextQuestion[]>([])

  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

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
    if (idx >= chunks.length) { finishSession(); return }
    const chunk = chunks[idx]
    if (!chunk) return

    // Yeni chunk → animasyon
    opacity.value = 0
    opacity.value = withTiming(1, { duration: 80, easing: Easing.out(Easing.quad) })

    // WPM geçmişi güncelle
    const now = Date.now()
    const elapsed = startTime ? now - startTime : 0
    const wordsRead = chunks.slice(0, idx + 1).reduce((s, c) => s + c.words.length, 0)
    const instantWPM = calculateRealTimeWPM(wordsRead, elapsed)
    if (instantWPM > 0) setWpmHistory((h) => [...h.slice(-29), instantWPM])

    timerRef.current = setTimeout(() => {
      setChunkIdx((prev) => {
        const next = prev + 1
        if (next < chunks.length) scheduleNext(next)
        else finishSession()
        return next
      })
    }, chunk.displayDuration)
  }, [chunks, startTime, opacity])  // eslint-disable-line react-hooks/exhaustive-deps

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

  // WPM değişince chunk sürelerini yeniden hesapla
  useEffect(() => {
    if (chunks.length > 0) {
      setChunks((prev) => applyDurations(prev, currentWPM, settings.smartSlowing))
    }
  }, [currentWPM, settings.smartSlowing]) // eslint-disable-line react-hooks/exhaustive-deps

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

        <ScrollView contentContainerStyle={s.selectScroll}>
          <View style={s.heroBox}>
            <Text style={s.heroEmoji}>📦</Text>
            <Text style={s.heroTitle}>Chunk RSVP</Text>
            <Text style={s.heroSub}>Kelime gruplarını hızlıca işle — Bionic okuma destekli</Text>
          </View>

          {/* Ayar çipleri */}
          <View style={s.chipRow}>
            <View style={s.chip}><Text style={s.chipTxt}>{settings.chunkSize} kelime/grup</Text></View>
            <View style={s.chip}><Text style={s.chipTxt}>{currentWPM} WPM</Text></View>
            <View style={[s.chip, settings.bionicReading && s.chipActive]}>
              <Text style={[s.chipTxt, settings.bionicReading && s.chipTxtActive]}>Bionic</Text>
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
        </ScrollView>

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
        <View style={s.progressTrack}>
          <View style={[s.progressFill, { width: `${progress * 100}%` as `${number}%` }]} />
        </View>
        <Text style={s.progressInfo}>
          {wordsRead}/{totalWords} kelime  ·  {formatTime(remainingSec)} kaldı
        </Text>

        {/* Chunk Display */}
        <View style={s.chunkStage}>
          <Animated.View style={[s.chunkBox, chunkAnim]}>
            {currentChunk && settings.bionicReading ? (
              <View style={s.chunkWordsRow}>
                {currentChunk.words.map((w, i) => {
                  const b = applyBionicReading(w)
                  return (
                    <Text key={i} style={s.chunkWord}>
                      <Text style={s.bionicBold}>{b.bold}</Text>
                      <Text style={s.bionicLight}>{b.light}</Text>
                      {i < currentChunk.words.length - 1 ? ' ' : ''}
                    </Text>
                  )
                })}
              </View>
            ) : (
              <Text style={s.chunkText}>{currentChunk?.rawText ?? ''}</Text>
            )}
          </Animated.View>
        </View>

        {/* Kontrol Çubuğu */}
        <View style={s.controls}>
          <TouchableOpacity style={s.controlBtn} onPress={goBack}>
            <Text style={s.controlBtnTxt}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.playBtn} onPress={togglePause} activeOpacity={0.8}>
            <Text style={s.playBtnTxt}>{isPlaying ? '⏸' : '▶'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.controlBtn} onPress={goForward} disabled={settings.readingMode !== 'sprint'}>
            <Text style={[s.controlBtnTxt, settings.readingMode !== 'sprint' && { opacity: 0.3 }]}>→</Text>
          </TouchableOpacity>
        </View>

        {/* WPM Slider */}
        <View style={s.wpmSliderRow}>
          <Text style={s.wpmLabel}>100</Text>
          <View style={s.wpmSliderTrack}>
            <View style={[s.wpmSliderFill, { width: `${((currentWPM - 100) / 700) * 100}%` as `${number}%` }]} />
            <TouchableOpacity
              style={[s.wpmThumb, { left: `${((currentWPM - 100) / 700) * 100}%` as `${number}%` }]}
              onPress={() => {}}
            />
          </View>
          <Text style={s.wpmLabel}>800</Text>
        </View>
        <View style={s.wpmBtnsRow}>
          <TouchableOpacity style={s.wpmAdjBtn} onPress={() => { Haptics.selectionAsync(); setCurrentWPM((w) => Math.max(100, w - 25)) }}>
            <Text style={s.wpmAdjTxt}>−25</Text>
          </TouchableOpacity>
          <Text style={s.wpmDisplay}>{currentWPM} WPM</Text>
          <TouchableOpacity style={s.wpmAdjBtn} onPress={() => { Haptics.selectionAsync(); setCurrentWPM((w) => Math.min(800, w + 25)) }}>
            <Text style={s.wpmAdjTxt}>+25</Text>
          </TouchableOpacity>
        </View>

        {/* Canlı İstatistikler */}
        <View style={s.statsBar}>
          {[
            { label: 'WPM', value: String(displayWPM) },
            { label: 'Chunk', value: `${settings.chunkSize}/${chunks.length}` },
            { label: 'Süre', value: formatTime(Math.floor(elapsedMs / 1000)) },
            { label: 'ARP', value: String(computeSessionARP(displayWPM, 70, regressionCount, Math.floor(elapsedMs / 1000)).arp) },
          ].map((item) => (
            <View key={item.label} style={s.statItem}>
              <Text style={s.statValue}>{item.value}</Text>
              <Text style={s.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Settings Sheet */}
        {showSettings && (
          <SettingsSheet settings={settings} onUpdate={setSettings} onClose={() => setShowSettings(false)} t={t} s={s} currentWPM={currentWPM} onWPMChange={setCurrentWPM} />
        )}
      </SafeAreaView>
    )
  }

  // ── AŞAMA 3: Seans Sonu ───────────────────────────────────────

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

  if (phase === 'result' && finalMetrics) {
    return (
      <>
        <ResultScreen
          metrics={finalMetrics}
          content={content}
          onRepeat={() => {
            setPhase('select')
            setChunkIdx(0)
            setWpmHistory([])
            setRegressionCount(0)
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

// ─── Result Screen ─────────────────────────────────────────────────

interface ResultProps {
  metrics: ChunkRSVPMetrics
  content: ImportedContent | null
  onRepeat: () => void
  onComplete: () => void
  onExit: () => void
  onQuiz?: () => void
  hasQuiz?: boolean
  t: AppTheme
  s: ReturnType<typeof ms>
}

function ResultScreen({ metrics, content, onRepeat, onComplete, onExit, onQuiz, hasQuiz, t, s }: ResultProps) {
  const xp = calculateXP(metrics.arpScore, metrics.totalWords, metrics.bionicEnabled, metrics.durationSeconds)

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
      <ScrollView contentContainerStyle={s.resultScroll}>
        <Text style={s.resultEmoji}>🎉</Text>
        <Text style={s.resultTitle}>Seans Tamamlandı!</Text>

        {/* ARP Kartı */}
        <View style={s.arpCard}>
          <Text style={s.arpLabel}>ARP Skoru</Text>
          <Text style={s.arpValue}>{metrics.arpScore}</Text>
        </View>

        {/* Metrikler */}
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

        {/* XP */}
        <View style={s.xpBadge}>
          <Text style={s.xpTxt}>+{xp} XP kazandın!</Text>
        </View>

        {/* Quiz Butonu */}
        {hasQuiz && onQuiz && (
          <TouchableOpacity
            style={{ backgroundColor:'#10B981', borderRadius:14, paddingVertical:14,
              alignItems:'center', width:'100%', marginBottom:4 }}
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
          <TouchableOpacity style={s.continueBtn} onPress={onComplete}>
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
      <Text style={[s.chunkSizeTxt, settings.chunkSize === size && s.chunkSizeTxtActive]}>{size}</Text>
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

function ms(t: AppTheme) {
  const SPEED_COLOR = '#6C3EE8'
  return StyleSheet.create({
    container:    { flex: 1, backgroundColor: t.colors.background },
    readingBg:    { backgroundColor: t.isDark ? '#0D1117' : '#1A1A2E' },

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
    selectScroll: { padding: 20, paddingBottom: 60, gap: 16 },
    heroBox:      { alignItems: 'center', paddingVertical: 20 },
    heroEmoji:    { fontSize: 56, marginBottom: 12 },
    heroTitle:    { fontSize: 26, fontWeight: '900', color: t.colors.text, marginBottom: 6 },
    heroSub:      { fontSize: 14, color: t.colors.textHint, textAlign: 'center' },
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

    // Reading
    readingHeader: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 16, paddingVertical: 10,
    },
    readingBack:  { fontSize: 14, color: 'rgba(255,255,255,0.6)' },
    modeRow:      { flexDirection: 'row', gap: 4 },
    modePill:     {
      borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4,
      backgroundColor: 'rgba(255,255,255,0.1)',
    },
    modePillActive: { backgroundColor: SPEED_COLOR },
    modePillTxt:  { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.6)' },
    modePillTxtActive: { color: '#fff' },

    progressTrack: { height: 3, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 16 },
    progressFill:  { height: 3, backgroundColor: SPEED_COLOR, borderRadius: 2 },
    progressInfo:  { fontSize: 11, color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: 6, marginBottom: 4 },

    chunkStage:   { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
    chunkBox:     { alignItems: 'center', justifyContent: 'center' },
    chunkText:    { fontSize: 28, fontWeight: '700', color: '#FFFFFF', textAlign: 'center', lineHeight: 40 },
    chunkWordsRow:{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
    chunkWord:    { fontSize: 28, color: '#FFFFFF', lineHeight: 40 },
    bionicBold:   { fontWeight: '900' },
    bionicLight:  { fontWeight: '300' },

    controls:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24, marginBottom: 12 },
    controlBtn:   { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    controlBtnTxt:{ fontSize: 22, color: 'rgba(255,255,255,0.7)' },
    playBtn:      {
      width: 60, height: 60, borderRadius: 30,
      backgroundColor: SPEED_COLOR, alignItems: 'center', justifyContent: 'center',
    },
    playBtnTxt:   { fontSize: 24 },

    wpmSliderRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 8, marginBottom: 4 },
    wpmLabel:     { fontSize: 11, color: 'rgba(255,255,255,0.4)', width: 30 },
    wpmSliderTrack: {
      flex: 1, height: 4, backgroundColor: 'rgba(255,255,255,0.15)',
      borderRadius: 2, position: 'relative',
    },
    wpmSliderFill:{ height: 4, backgroundColor: SPEED_COLOR, borderRadius: 2 },
    wpmThumb:     {
      position: 'absolute', top: -6, width: 16, height: 16,
      borderRadius: 8, backgroundColor: '#fff', marginLeft: -8,
    },
    wpmBtnsRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 8 },
    wpmPresetsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', marginBottom: 8 },
    wpmAdjBtn:    {
      backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 999,
      paddingHorizontal: 16, paddingVertical: 6,
    },
    wpmAdjTxt:    { fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.8)' },
    wpmDisplay:   { fontSize: 16, fontWeight: '800', color: '#fff', minWidth: 90, textAlign: 'center' },

    statsBar:     {
      flexDirection: 'row', justifyContent: 'space-around',
      backgroundColor: 'rgba(255,255,255,0.05)',
      paddingVertical: 10, paddingHorizontal: 8,
    },
    statItem:     { alignItems: 'center' },
    statValue:    { fontSize: 14, fontWeight: '800', color: '#fff' },
    statLabel:    { fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 },

    // Result
    resultScroll: { padding: 24, paddingBottom: 48, alignItems: 'center', gap: 16 },
    resultEmoji:  { fontSize: 64 },
    resultTitle:  { fontSize: 26, fontWeight: '900', color: t.colors.text },
    arpCard:      {
      backgroundColor: SPEED_COLOR, borderRadius: 20, paddingVertical: 24, paddingHorizontal: 40,
      alignItems: 'center', width: '100%',
    },
    arpLabel:     { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 8 },
    arpValue:     { fontSize: 72, fontWeight: '900', color: '#fff', lineHeight: 80 },
    metricsGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', width: '100%' },
    metricCard:   {
      backgroundColor: t.colors.surface, borderRadius: 16, padding: 18,
      alignItems: 'center', minWidth: '40%', flex: 1,
    },
    metricValue:  { fontSize: 24, fontWeight: '900', color: t.colors.text },
    metricLabel:  { fontSize: 11, color: t.colors.textHint, marginTop: 4 },
    xpBadge:      {
      backgroundColor: '#F59E0B20', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24,
      borderWidth: 1, borderColor: '#F59E0B',
    },
    xpTxt:        { fontSize: 16, fontWeight: '700', color: '#F59E0B' },
    resultBtns:   { flexDirection: 'row', gap: 12, width: '100%' },
    repeatBtn:    {
      flex: 1, backgroundColor: t.colors.surface, borderRadius: 14,
      paddingVertical: 16, alignItems: 'center',
      borderWidth: 1, borderColor: t.colors.border,
    },
    repeatBtnTxt: { fontSize: 15, fontWeight: '700', color: t.colors.text },
    continueBtn:  {
      flex: 2, backgroundColor: SPEED_COLOR, borderRadius: 14,
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
    chunkSizeBtn:     {
      flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center',
      backgroundColor: t.colors.background, borderWidth: 1, borderColor: t.colors.border,
    },
    chunkSizeBtnActive: { backgroundColor: SPEED_COLOR, borderColor: SPEED_COLOR },
    chunkSizeTxt:     { fontSize: 16, fontWeight: '700', color: t.colors.textHint },
    chunkSizeTxtActive: { color: '#fff' },
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
