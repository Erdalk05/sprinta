/**
 * Tanılama Testi — RSVP tabanlı okuma + anlama soruları
 *
 * Faz 1: intro    — Test bilgisi, Başla butonu
 * Faz 2: reading  — RSVP chunk gösterimi, 6dk sayaç, anlık WPM
 * Faz 3: questions— QuestionCard (reuse), 5 soru
 * Faz 4: result   — Skor, WPM, süre
 *
 * Reuses: ChunkRSVPEngine (tokenizeToChunks, applyDurations, calculateRealTimeWPM)
 * Reuses: QuestionCard component
 * Follows: same visual style as other reading modules
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView,
} from 'react-native'
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSpring,
} from 'react-native-reanimated'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { useAppTheme } from '../../src/theme/useAppTheme'
import type { AppTheme } from '../../src/theme'
import { QuestionCard } from '../../src/components/exercise/QuestionCard'
import {
  tokenizeToChunks,
  applyDurations,
  calculateRealTimeWPM,
  type Chunk,
} from '../../src/components/exercises/SpeedControl/ChunkRSVPEngine'
import { selectNextTest, type TanilamaTest } from '../../src/data/tanilamaPool'
import { useTanilamaHistoryStore } from '../../src/stores/tanilamaHistoryStore'

// ─── Sabitler ────────────────────────────────────────────────────
const MAX_SECONDS = 360          // 6 dakika
const DEFAULT_WPM = 200
const CHUNK_SIZE  = 2

type Phase = 'intro' | 'reading' | 'questions' | 'result'

// ─── Saniyeyi mm:ss formatına çevir ──────────────────────────────
function formatTime(s: number): string {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
}

// ─── Ana Ekran ────────────────────────────────────────────────────
export default function TanilamaScreen() {
  const router = useRouter()
  const t      = useAppTheme()
  const s      = useMemo(() => ms(t), [t])

  const { lastTestIds, lastCategory, recordTest } = useTanilamaHistoryStore()

  // Test seçimi (ekran mount'unda bir kez hesaplanır)
  const [test] = useState<TanilamaTest>(() =>
    selectNextTest(lastTestIds, lastCategory)
  )

  const [phase, setPhase]           = useState<Phase>('intro')
  const [chunks, setChunks]         = useState<Chunk[]>([])
  const [chunkIdx, setChunkIdx]     = useState(0)
  const [currentChunk, setCurrentChunk] = useState<Chunk | null>(null)
  const [countdown, setCountdown]   = useState(MAX_SECONDS)
  const [currentWPM, setCurrentWPM] = useState(DEFAULT_WPM)
  const [readingDone, setReadingDone] = useState(false)

  // Sorular
  const [questionIdx, setQuestionIdx] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)

  // Refs
  const readingStartRef  = useRef<number>(0)
  const wordsReadRef     = useRef<number>(0)
  const countdownRef     = useRef<ReturnType<typeof setInterval> | null>(null)
  const chunkTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Animasyonlar
  const chunkOpacity  = useSharedValue(1)
  const chunkScale    = useSharedValue(1)
  const progressAnim  = useSharedValue(0)

  const chunkAnimStyle = useAnimatedStyle(() => ({
    opacity:   chunkOpacity.value,
    transform: [{ scale: chunkScale.value }],
  }))

  // ── OKUMA BAŞLAT ──────────────────────────────────────────────
  const startReading = useCallback(() => {
    const rawChunks   = tokenizeToChunks(test.content, CHUNK_SIZE)
    const timedChunks = applyDurations(rawChunks, DEFAULT_WPM, true)
    setChunks(timedChunks)
    setChunkIdx(0)
    setCurrentChunk(timedChunks[0] ?? null)
    setReadingDone(false)
    wordsReadRef.current    = 0
    readingStartRef.current = Date.now()

    // Geri sayım başlat
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!)
          setReadingDone(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    setPhase('reading')
  }, [test.content])

  // ── CHUNK İLERLEME ───────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'reading' || chunks.length === 0 || readingDone) return

    if (chunkIdx >= chunks.length) {
      // Tüm chunk'lar gösterildi
      clearInterval(countdownRef.current!)
      setReadingDone(true)
      return
    }

    const chunk = chunks[chunkIdx]
    wordsReadRef.current += chunk.words.length

    // Chunk değişim animasyonu
    chunkOpacity.value = 0
    chunkScale.value   = 0.9
    chunkOpacity.value = withTiming(1, { duration: 80 })
    chunkScale.value   = withSpring(1, { damping: 15, stiffness: 300 })

    // İlerleme çubuğu
    progressAnim.value = withTiming(chunkIdx / chunks.length, { duration: 200 })

    // Anlık WPM güncelle
    const elapsed = Date.now() - readingStartRef.current
    if (elapsed > 0) {
      setCurrentWPM(Math.round(calculateRealTimeWPM(wordsReadRef.current, elapsed)))
    }

    chunkTimerRef.current = setTimeout(() => {
      setCurrentChunk(chunks[chunkIdx + 1] ?? null)
      setChunkIdx((i) => i + 1)
    }, chunk.displayDuration)

    return () => {
      if (chunkTimerRef.current) clearTimeout(chunkTimerRef.current)
    }
  }, [phase, chunks, chunkIdx, readingDone])

  // Okuma bitti → sorulara geç
  useEffect(() => {
    if (!readingDone || phase !== 'reading') return
    const t = setTimeout(() => {
      setPhase('questions')
    }, 600)
    return () => clearTimeout(t)
  }, [readingDone, phase])

  // Cleanup
  useEffect(() => {
    return () => {
      clearInterval(countdownRef.current!)
      clearTimeout(chunkTimerRef.current!)
    }
  }, [])

  // ── SORU CEVAPLAMA ───────────────────────────────────────────
  const handleAnswer = useCallback((correct: boolean) => {
    if (correct) setCorrectCount((n) => n + 1)

    if (questionIdx + 1 >= test.questions.length) {
      // Test tamamlandı — kaydet
      recordTest(test.id, test.category)
      setPhase('result')
    } else {
      setQuestionIdx((i) => i + 1)
    }
  }, [questionIdx, test, recordTest])

  // ── RENDER ───────────────────────────────────────────────────

  // --- INTRO ---
  if (phase === 'intro') {
    return (
      <SafeAreaView style={s.root}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Text style={s.backTxt}>←</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>Tanılama Testi</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={s.introScroll}>
          {/* Kategori etiketi */}
          <View style={[s.catBadge, { backgroundColor: categoryColor(test.category) + '20' }]}>
            <Text style={[s.catTxt, { color: categoryColor(test.category) }]}>
              {categoryEmoji(test.category)} {test.categoryLabel}
            </Text>
          </View>

          <Text style={s.introTitle}>{test.title}</Text>

          <View style={s.infoGrid}>
            <InfoBox label="Kelime" value={`~${test.wordCount}`} icon="📖" t={t} />
            <InfoBox label="Soru"   value={`${test.questions.length}`}  icon="❓" t={t} />
            <InfoBox label="Süre"   value="6 dk"  icon="⏱️" t={t} />
            <InfoBox label="Hız"    value="RSVP"  icon="⚡" t={t} />
          </View>

          <View style={s.rulesBox}>
            <Text style={s.rulesTitle}>📋 Test Kuralları</Text>
            {[
              'Metin RSVP yöntemiyle ekranında gösterilecek.',
              'Okurken geri dönme yok — odaklanarak ilerle.',
              'Okuma bittikten sonra 5 anlama sorusu çözeceksin.',
              'Toplam süre en fazla 6 dakika.',
            ].map((r, i) => (
              <View key={i} style={s.ruleRow}>
                <Text style={s.ruleDot}>·</Text>
                <Text style={s.ruleTxt}>{r}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={s.startBtn} onPress={startReading} activeOpacity={0.85}>
            <Text style={s.startBtnTxt}>⚡ Teste Başla</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    )
  }

  // --- READING ---
  if (phase === 'reading') {
    const progress = chunks.length > 0 ? chunkIdx / chunks.length : 0
    const timerColor = countdown <= 60 ? '#EF4444' : t.colors.primary

    return (
      <SafeAreaView style={s.root}>
        {/* Üst bilgi çubuğu */}
        <View style={s.readingHeader}>
          <View style={s.readingMeta}>
            <Text style={[s.countdown, { color: timerColor }]}>⏱ {formatTime(countdown)}</Text>
          </View>
          <Text style={s.wpmBadge}>{currentWPM} WPM</Text>
        </View>

        {/* İlerleme çubuğu */}
        <View style={s.progressTrack}>
          <View style={[s.progressFill, { width: `${Math.min(100, progress * 100)}%` as any, backgroundColor: t.colors.primary }]} />
        </View>

        {/* RSVP chunk gösterimi */}
        <View style={s.rsvpArea}>
          {currentChunk ? (
            <Animated.View style={[s.chunkWrap, chunkAnimStyle]}>
              <Text style={s.chunkText}>{currentChunk.rawText}</Text>
            </Animated.View>
          ) : (
            <View style={s.chunkWrap}>
              <Text style={s.chunkDone}>✓ Okuma Tamamlandı</Text>
            </View>
          )}
          {/* ORP merkez çizgisi */}
          <View style={s.orpLine} />
        </View>

        {/* Okuma tamamlandı butonu */}
        {readingDone && (
          <View style={s.readingBottom}>
            <Text style={s.readingDoneTxt}>
              {countdown === 0 ? '⏰ Süre doldu!' : '✅ Okuma bitti!'}
            </Text>
            <TouchableOpacity
              style={s.continueBtn}
              onPress={() => setPhase('questions')}
              activeOpacity={0.85}
            >
              <Text style={s.continueBtnTxt}>Sorulara Geç →</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    )
  }

  // --- QUESTIONS ---
  if (phase === 'questions') {
    const question = test.questions[questionIdx]
    if (!question) return null

    return (
      <SafeAreaView style={s.root}>
        <View style={s.qHeader}>
          <Text style={s.qHeaderTitle}>{test.title}</Text>
          <View style={s.qProgress}>
            {test.questions.map((_, i) => (
              <View
                key={i}
                style={[
                  s.qDot,
                  i < questionIdx
                    ? s.qDotDone
                    : i === questionIdx
                    ? s.qDotActive
                    : s.qDotPending,
                ]}
              />
            ))}
          </View>
        </View>
        <QuestionCard
          key={questionIdx}
          question={question}
          questionNumber={questionIdx + 1}
          totalQuestions={test.questions.length}
          onAnswer={(correct) => handleAnswer(correct)}
        />
      </SafeAreaView>
    )
  }

  // --- RESULT ---
  const totalQ    = test.questions.length
  const scorePercent = Math.round((correctCount / totalQ) * 100)
  const elapsed   = Math.round((Date.now() - readingStartRef.current) / 1000)

  return (
    <SafeAreaView style={s.root}>
      <ScrollView contentContainerStyle={s.resultScroll}>
        <Text style={s.resultEmoji}>{scorePercent >= 80 ? '🏆' : scorePercent >= 60 ? '👍' : '📚'}</Text>
        <Text style={s.resultTitle}>Test Tamamlandı!</Text>
        <Text style={s.resultSub}>{test.title}</Text>

        <View style={s.scoreCircle}>
          <Text style={s.scoreBig}>{correctCount}/{totalQ}</Text>
          <Text style={s.scoreLabel}>DOĞRU</Text>
          <Text style={[s.scorePct, { color: scorePercent >= 60 ? t.colors.primary : '#EF4444' }]}>
            %{scorePercent}
          </Text>
        </View>

        <View style={s.resultGrid}>
          <ResultStat icon="⚡" label="Ortalama WPM" value={`${currentWPM}`} t={t} />
          <ResultStat icon="⏱" label="Süre"         value={formatTime(elapsed)} t={t} />
          <ResultStat icon="📖" label="Kelime"       value={`${test.wordCount}`} t={t} />
          <ResultStat icon={categoryEmoji(test.category)} label="Kategori" value={test.categoryLabel} t={t} />
        </View>

        <TouchableOpacity
          style={s.startBtn}
          onPress={() => router.replace('/(tabs)/sessions')}
          activeOpacity={0.85}
        >
          <Text style={s.startBtnTxt}>Antrenmanlarına Dön →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

// ─── Yardımcı Bileşenler ────────────────────────────────────────
function InfoBox({ label, value, icon, t }: { label: string; value: string; icon: string; t: AppTheme }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={{ fontSize: 22, marginBottom: 4 }}>{icon}</Text>
      <Text style={{ fontSize: 16, fontWeight: '800', color: t.colors.text }}>{value}</Text>
      <Text style={{ fontSize: 11, color: t.colors.textHint }}>{label}</Text>
    </View>
  )
}

function ResultStat({ icon, label, value, t }: { icon: string; label: string; value: string; t: AppTheme }) {
  return (
    <View style={{ width: '47%', backgroundColor: t.colors.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: t.colors.border, alignItems: 'center', gap: 4 }}>
      <Text style={{ fontSize: 22 }}>{icon}</Text>
      <Text style={{ fontSize: 18, fontWeight: '900', color: t.colors.text }}>{value}</Text>
      <Text style={{ fontSize: 11, color: t.colors.textHint }}>{label}</Text>
    </View>
  )
}

// ─── Kategori renk/emoji ─────────────────────────────────────────
function categoryColor(cat: string): string {
  switch (cat) {
    case 'saglik':    return '#EF4444'
    case 'teknoloji': return '#6C3EE8'
    case 'egitim':    return '#059669'
    case 'edebiyat':  return '#8B5CF6'
    default:          return '#6B7280'
  }
}

function categoryEmoji(cat: string): string {
  switch (cat) {
    case 'saglik':    return '🏥'
    case 'teknoloji': return '💻'
    case 'egitim':    return '🎓'
    case 'edebiyat':  return '📜'
    default:          return '📄'
  }
}

// ─── Stiller ─────────────────────────────────────────────────────
function ms(t: AppTheme) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: t.colors.background },

    // Header (intro + questions)
    header: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      backgroundColor: t.colors.panel,
      paddingHorizontal: 12, paddingVertical: 12,
      borderBottomWidth: 1, borderBottomColor: t.colors.divider,
    },
    backBtn:     { width: 40, alignItems: 'center', justifyContent: 'center' },
    backTxt:     { fontSize: 24, color: '#FFFFFF' },
    headerTitle: { fontSize: 17, fontWeight: '800', color: '#FFFFFF' },

    // Intro
    introScroll: { padding: 20, paddingBottom: 40 },
    catBadge: {
      alignSelf: 'flex-start', borderRadius: 999,
      paddingHorizontal: 12, paddingVertical: 5, marginBottom: 16,
    },
    catTxt:   { fontSize: 13, fontWeight: '700' },
    introTitle: { fontSize: 24, fontWeight: '900', color: t.colors.text, marginBottom: 20, lineHeight: 30 },

    infoGrid: {
      flexDirection: 'row', justifyContent: 'space-between',
      backgroundColor: t.colors.surface, borderRadius: 16,
      padding: 16, marginBottom: 20,
      borderWidth: 1, borderColor: t.colors.border,
    },

    rulesBox: {
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
      borderRadius: 14, padding: 16, marginBottom: 28,
      borderWidth: 1, borderColor: t.colors.border,
    },
    rulesTitle: { fontSize: 14, fontWeight: '700', color: t.colors.text, marginBottom: 10 },
    ruleRow:    { flexDirection: 'row', gap: 8, marginBottom: 6 },
    ruleDot:    { fontSize: 18, color: t.colors.primary, lineHeight: 22 },
    ruleTxt:    { flex: 1, fontSize: 13, color: t.colors.textSub, lineHeight: 20 },

    startBtn: {
      backgroundColor: t.colors.primary, borderRadius: 999,
      paddingVertical: 16, alignItems: 'center',
    },
    startBtnTxt: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },

    // Reading header
    readingHeader: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: 20, paddingVertical: 12,
      backgroundColor: t.colors.panel,
    },
    readingMeta: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    countdown:   { fontSize: 18, fontWeight: '800' },
    wpmBadge:    { fontSize: 14, fontWeight: '700', color: t.colors.primaryLight, opacity: 0.9 },

    progressTrack: { height: 3, backgroundColor: t.colors.border },
    progressFill:  { height: 3, borderRadius: 2 },

    // RSVP bölgesi
    rsvpArea: {
      flex: 1, alignItems: 'center', justifyContent: 'center',
      paddingHorizontal: 24,
    },
    chunkWrap: { alignItems: 'center', justifyContent: 'center' },
    chunkText: {
      fontSize: 28, fontWeight: '700',
      color: t.colors.text,
      textAlign: 'center',
      lineHeight: 38,
      letterSpacing: 0.5,
    },
    chunkDone: { fontSize: 22, color: t.colors.primary, fontWeight: '700' },
    orpLine: {
      position: 'absolute', width: 2, height: 44,
      backgroundColor: t.colors.primary + '40',
      borderRadius: 1,
    },

    readingBottom: { alignItems: 'center', padding: 24, gap: 12 },
    readingDoneTxt: { fontSize: 16, color: t.colors.text, fontWeight: '600' },
    continueBtn: {
      backgroundColor: t.colors.primary, borderRadius: 999,
      paddingHorizontal: 28, paddingVertical: 14,
    },
    continueBtnTxt: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },

    // Questions header
    qHeader: {
      backgroundColor: t.colors.panel,
      paddingHorizontal: 16, paddingVertical: 14,
      borderBottomWidth: 1, borderBottomColor: t.colors.divider,
      alignItems: 'center', gap: 10,
    },
    qHeaderTitle: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
    qProgress:    { flexDirection: 'row', gap: 8 },
    qDot:         { width: 10, height: 10, borderRadius: 5 },
    qDotPending:  { backgroundColor: t.colors.border },
    qDotActive:   { backgroundColor: t.colors.primaryLight },
    qDotDone:     { backgroundColor: t.colors.primary },

    // Result
    resultScroll:  { padding: 24, paddingBottom: 40, alignItems: 'center' },
    resultEmoji:   { fontSize: 56, marginBottom: 8 },
    resultTitle:   { fontSize: 26, fontWeight: '900', color: t.colors.text, marginBottom: 4 },
    resultSub:     { fontSize: 14, color: t.colors.textHint, marginBottom: 24 },
    scoreCircle: {
      width: 140, height: 140, borderRadius: 70,
      backgroundColor: t.colors.surface,
      borderWidth: 3, borderColor: t.colors.primary,
      alignItems: 'center', justifyContent: 'center',
      marginBottom: 24,
    },
    scoreBig:  { fontSize: 28, fontWeight: '900', color: t.colors.text },
    scoreLabel:{ fontSize: 11, fontWeight: '700', color: t.colors.textHint, letterSpacing: 1.5 },
    scorePct:  { fontSize: 20, fontWeight: '900' },

    resultGrid:{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28, width: '100%' },
  })
}
