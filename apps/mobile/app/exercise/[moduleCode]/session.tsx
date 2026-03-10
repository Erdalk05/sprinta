import React, { useState, useRef, useCallback, useEffect } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert,
  ActivityIndicator, useWindowDimensions,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { GestureDetector, Gesture } from 'react-native-gesture-handler'
import Animated, { useSharedValue, useAnimatedStyle, runOnJS } from 'react-native-reanimated'
import { colors, moduleColors } from '../../../src/constants/colors'

// MMKV — custom metin desteği (index.tsx ile aynı anahtar)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _smkv: any = null
function getSMKV() {
  if (_smkv) return _smkv
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { MMKV } = require('react-native-mmkv')
    _smkv = new MMKV({ id: 'sprinta-content-picker' })
  } catch { _smkv = null }
  return _smkv
}
const CUSTOM_TEXT_KEY = 'pending_custom_exercise'
import { MODULE_CONFIGS } from '../../../src/constants/modules'
import { SAMPLE_EXERCISES } from '../../../src/data/sampleContent'
import { getArticleById, type Article } from '../../../src/hooks/useArticles'
import { useSessionStore } from '../../../src/stores/sessionStore'
import { useAuthStore } from '../../../src/stores/authStore'
import { createClient } from '@supabase/supabase-js'
import { createUserContentService } from '@sprinta/api'

const _supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
)
const _ucSvc = createUserContentService(_supabase)
import { ChunkReader } from '../../../src/components/exercise/ChunkReader'
import { TextReader } from '../../../src/components/exercise/TextReader'
import { AttentionGrid } from '../../../src/components/exercise/AttentionGrid'
import { BreathingCircle } from '../../../src/components/exercise/BreathingCircle'
import { QuestionCard } from '../../../src/components/exercise/QuestionCard'
import { SchulteExercise } from '../../../src/components/exercise/EyeTraining/SchulteExercise'
import { ContextGuessExercise } from '../../../src/components/exercise/Vocabulary/ContextGuessExercise'
import { formatTime } from '../../../src/hooks/useSessionTimer'
import { processSession } from '@sprinta/shared'
import type { CognitiveProfile } from '@sprinta/shared'

type Phase = 'exercise' | 'questions' | 'done'

// Supabase Article → SampleExercise benzeri format dönüşümü
function articleToExercise(art: Article) {
  return {
    id: art.id,
    moduleCode: art.subject_code,
    title: art.title,
    content: art.content_text,
    wordCount: art.word_count,
    difficulty: art.difficulty_level * 2,
    questions: art.questions,
  }
}

// ── İmmersif renk paleti — herhangi bir accent renkten türet ─────────
const IM_WHITE = '#FFFFFF'
const IM_TRACK = 'rgba(255,255,255,0.25)'

function getImmersivePalette(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return {
    header:  `rgb(${Math.round(r*0.40)},${Math.round(g*0.40)},${Math.round(b*0.40)})`,
    content: `rgb(${Math.min(255,Math.round(r*0.10+230))},${Math.min(255,Math.round(g*0.10+230))},${Math.min(255,Math.round(b*0.10+230))})`,
    bottom:  `rgb(${Math.round(r*0.28)},${Math.round(g*0.28)},${Math.round(b*0.28)})`,
  }
}

// ── WPM Slider ────────────────────────────────────────────────────────
const WPM_MIN = 100, WPM_MAX = 500

interface WpmSliderProps {
  value: number
  onChange: (wpm: number) => void
  accentColor: string
  dark?: boolean
}

function SessionWpmSlider({ value, onChange, accentColor, dark }: WpmSliderProps) {
  const { width } = useWindowDimensions()
  const trackW = Math.max(160, width - 48)
  const range = WPM_MAX - WPM_MIN
  const thumbX = useSharedValue(((value - WPM_MIN) / range) * trackW)
  const startX = useSharedValue(0)

  useEffect(() => {
    thumbX.value = ((value - WPM_MIN) / range) * trackW
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const fillC = dark ? IM_WHITE : accentColor
  const trackC = dark ? IM_TRACK : accentColor + '22'
  const labelC = dark ? 'rgba(255,255,255,0.65)' : colors.textSecondary
  const valueC = dark ? IM_WHITE : accentColor

  const pan = Gesture.Pan()
    .onBegin(() => { startX.value = thumbX.value })
    .onUpdate((e) => {
      const nx = Math.max(0, Math.min(trackW, startX.value + e.translationX))
      thumbX.value = nx
      runOnJS(onChange)(Math.round(WPM_MIN + (nx / trackW) * range))
    })

  // Tek tıkla → o noktaya atla
  const tapJump = Gesture.Tap()
    .onEnd((e) => {
      const nx = Math.max(0, Math.min(trackW, e.x))
      thumbX.value = nx
      runOnJS(onChange)(Math.round(WPM_MIN + (nx / trackW) * range))
    })

  const gesture = Gesture.Exclusive(pan, tapJump)

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbX.value }],
  }))
  const fillStyle = useAnimatedStyle(() => ({
    width: Math.max(0, thumbX.value + 13),
  }))

  return (
    <View style={bar.sliderWrap}>
      <View style={bar.sliderHeader}>
        <Text style={[bar.sliderLabel, { color: labelC }]}>⚡ OKUMA HIZI</Text>
        <Text style={[bar.sliderValue, { color: valueC }]}>{value} WPM</Text>
      </View>
      <GestureDetector gesture={gesture}>
        <View style={[bar.trackHitArea, { width: trackW }]}>
          <View style={[bar.track, { backgroundColor: trackC }]}>
            <Animated.View style={[{ height: 5, backgroundColor: fillC, borderRadius: 3, position: 'absolute' }, fillStyle]} />
          </View>
          <Animated.View style={[bar.thumb, { borderColor: dark ? IM_WHITE : accentColor }, thumbStyle]} />
        </View>
      </GestureDetector>
    </View>
  )
}

// ── Yazı Boyutu Slider (3 snap) ────────────────────────────────────────
const FONT_STEPS = ['small', 'medium', 'large'] as const
type FontSizeKey = typeof FONT_STEPS[number]
const FONT_LABELS: Record<FontSizeKey, string> = { small: 'Küçük', medium: 'Orta', large: 'Büyük' }

function FontSizeSlider({ value, onChange, accentColor, dark }: { value: FontSizeKey; onChange: (v: FontSizeKey) => void; accentColor: string; dark?: boolean }) {
  const { width } = useWindowDimensions()
  const trackW = Math.max(160, width - 48)
  const thumbX = useSharedValue((FONT_STEPS.indexOf(value) / 2) * trackW)
  const startX = useSharedValue(0)

  useEffect(() => {
    thumbX.value = (FONT_STEPS.indexOf(value) / 2) * trackW
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const fillC = dark ? IM_WHITE : accentColor
  const trackC = dark ? IM_TRACK : accentColor + '22'
  const labelC = dark ? 'rgba(255,255,255,0.65)' : colors.textSecondary
  const valueC = dark ? IM_WHITE : accentColor

  // Worklet içinde snap — JS'e sadece step indexi geçilir
  const pan = Gesture.Pan()
    .onBegin(() => { startX.value = thumbX.value })
    .onUpdate((e) => {
      thumbX.value = Math.max(0, Math.min(trackW, startX.value + e.translationX))
    })
    .onEnd(() => {
      'worklet'
      const clamped = Math.max(0, Math.min(2, Math.round((thumbX.value / trackW) * 2)))
      thumbX.value = (clamped / 2) * trackW
      runOnJS(onChange)(['small', 'medium', 'large'][clamped] as FontSizeKey)
    })

  // Tek tıkla da atlayabilsin
  const tapJump = Gesture.Tap()
    .onEnd((e) => {
      'worklet'
      const clamped = Math.max(0, Math.min(2, Math.round((Math.max(0, Math.min(trackW, e.x)) / trackW) * 2)))
      thumbX.value = (clamped / 2) * trackW
      runOnJS(onChange)(['small', 'medium', 'large'][clamped] as FontSizeKey)
    })

  const gesture = Gesture.Exclusive(pan, tapJump)

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbX.value }],
  }))
  const fillStyle = useAnimatedStyle(() => ({
    width: Math.max(0, thumbX.value + 13),
  }))

  return (
    <View style={bar.sliderWrap}>
      <View style={bar.sliderHeader}>
        <Text style={[bar.sliderLabel, { color: labelC }]}>YAZI BOYUTU</Text>
        <Text style={[bar.sliderValue, { color: valueC }]}>{FONT_LABELS[value]}</Text>
      </View>
      <GestureDetector gesture={gesture}>
        <View style={[bar.trackHitArea, { width: trackW }]}>
          <View style={[bar.track, { backgroundColor: trackC }]}>
            <Animated.View style={[{ height: 5, backgroundColor: fillC, borderRadius: 3, position: 'absolute' }, fillStyle]} />
          </View>
          <Animated.View style={[bar.thumb, { borderColor: dark ? IM_WHITE : accentColor }, thumbStyle]} />
        </View>
      </GestureDetector>
    </View>
  )
}
// ────────────────────────────────────────────────────────────────────────

const FONT_SIZE_MAP      = { small: 14, medium: 17, large: 20 } as const
const CHUNK_FONT_SIZE_MAP = { small: 40, medium: 52, large: 66 } as const

export default function SessionScreen() {
  const { moduleCode, difficulty, exerciseId, articleId, userContentId, userChunkId, hasPendingText } =
    useLocalSearchParams<{
      moduleCode: string
      difficulty: string
      exerciseId: string
      articleId?: string
      userContentId?: string
      userChunkId?: string
      hasPendingText?: string
    }>()
  const router = useRouter()
  const { student } = useAuthStore()
  const store = useSessionStore()

  const { wpmPreference, fontSizePreference, setWpmPreference, setFontSizePreference } = store
  const currentFontSize = FONT_SIZE_MAP[fontSizePreference]

  const [phase, setPhase] = useState<Phase>('exercise')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [readingWpm, setReadingWpm] = useState(0)
  const [articleLoading, setArticleLoading] = useState(!!(articleId || userContentId || hasPendingText))
  const [remoteArticle, setRemoteArticle] = useState<ReturnType<typeof articleToExercise> | null>(null)
  const [sessionPaused, setSessionPaused] = useState(false)

  const config = MODULE_CONFIGS[moduleCode] ?? MODULE_CONFIGS.speed_control
  const difficultyNum = parseInt(difficulty ?? '5', 10)
  const accentColor = moduleColors[moduleCode] ?? colors.primary

  const isReadingExercise = moduleCode === 'speed_control' || moduleCode === 'deep_comprehension'

  // articleId → önce articles cache, sonra text_library tablosundan çek
  useEffect(() => {
    if (!articleId) return
    ;(async () => {
      // 1) Articles cache (konu modülleri)
      const cached = await getArticleById(articleId)
      if (cached) {
        setRemoteArticle(articleToExercise(cached))
        setArticleLoading(false)
        return
      }
      // 2) text_library tablosu (içerik seçici kütüphanesi)
      try {
        const { data } = await _supabase
          .from('text_library')
          .select('id, title, body, word_count, exam_type')
          .eq('id', articleId)
          .single()
        if (data) {
          setRemoteArticle({
            id: data.id,
            moduleCode,
            title: data.title,
            content: data.body ?? '',
            wordCount: data.word_count ?? 0,
            difficulty: difficultyNum,
            questions: [],
          })
        }
      } catch { /**/ }
      setArticleLoading(false)
    })()
  }, [articleId])

  // hasPendingText → MMKV'den özel metin yükle (index.tsx Metin/Dosya sekmeleri)
  useEffect(() => {
    if (hasPendingText !== '1') return
    try {
      const raw = getSMKV()?.getString(CUSTOM_TEXT_KEY)
      if (raw) {
        const { text, title, wordCount } = JSON.parse(raw)
        setRemoteArticle({
          id: 'custom_text',
          moduleCode,
          title: title ?? 'Özel Metin',
          content: text,
          wordCount: wordCount ?? Math.round(text.split(/\s+/).length),
          difficulty: difficultyNum,
          questions: [],
        })
      }
    } catch { /**/ }
    setArticleLoading(false)
  }, [hasPendingText])

  // userContentId → kullanıcının kendi içeriğinden chunk çek
  useEffect(() => {
    if (!userContentId) {
      if (!articleId) setArticleLoading(false)
      return
    }
    _ucSvc.getContentChunks(userContentId).then((chunks) => {
      const idx = userChunkId ? parseInt(userChunkId, 10) : 0
      const chunk = chunks[idx] ?? chunks[0]
      if (chunk) {
        setRemoteArticle({
          id: chunk.id,
          moduleCode,
          title: `Bölüm ${(idx + 1)}`,
          content: chunk.chunk_text,
          wordCount: chunk.word_count,
          difficulty: difficultyNum,
          questions: [],
        })
      }
      setArticleLoading(false)
    })
  }, [userContentId, userChunkId, moduleCode, difficultyNum])

  // Kullanılacak exercise: remote → sample fallback
  const exercise = remoteArticle ?? SAMPLE_EXERCISES[moduleCode]

  // Elapsed timer
  const elapsedRef = useRef(0)
  React.useEffect(() => {
    store.startSession({ moduleCode, exerciseId: exerciseId ?? 'sample', difficultyLevel: difficultyNum })
    const interval = setInterval(() => {
      elapsedRef.current += 1
      setElapsed(elapsedRef.current)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleHalfway = useCallback(() => {
    const wpm = store.wordsRead > 0
      ? Math.round(store.wordsRead / (Math.max(1, elapsedRef.current) / 60))
      : 180
    const accuracy = Math.max(0, 100 - (store.errorsCount / Math.max(1, store.wordsRead)) * 100)
    store.recordHalfway(wpm, Math.round(accuracy))
  }, [store])

  const handleExerciseComplete = useCallback((wpm?: number) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    if (wpm) setReadingWpm(wpm)

    const hasQuestions = (exercise?.questions?.length ?? 0) > 0
    if (hasQuestions) {
      setPhase('questions')
    } else {
      finishSession(wpm ?? 0)
    }
  }, [exercise])

  const handleAnswer = useCallback((correct: boolean, responseTimeMs: number) => {
    store.recordAnswer(correct, responseTimeMs)
    const nextIndex = questionIndex + 1
    if (nextIndex >= (exercise?.questions?.length ?? 0)) {
      setQuestionIndex(0)
      finishSession(readingWpm)
    } else {
      setQuestionIndex(nextIndex)
    }
  }, [questionIndex, exercise, readingWpm])

  const finishSession = useCallback((wpm: number) => {
    const secondHalfWpm = wpm > 0 ? wpm : Math.round(store.wordsRead / Math.max(1, elapsedRef.current / 60))
    const secondHalfAccuracy = store.totalQuestions > 0
      ? Math.round((store.correctAnswers / store.totalQuestions) * 100)
      : 85

    const metrics = store.buildMetrics(secondHalfWpm, secondHalfAccuracy)

    const arp = student?.currentArp ?? 0
    const profile: CognitiveProfile = {
      sustainableWpm: Math.round(arp / 0.8) || 180,
      peakWpm: Math.round(arp / 0.7) || 220,
      comprehensionBaseline: 75,
      stabilityIndex: 0.7,
      fatigueThreshold: 50,
      speedSkill: Math.min(100, Math.round((arp / 300) * 100)),
      comprehensionSkill: 75,
      attentionSkill: 70,
      primaryWeakness: null,
      secondaryWeakness: null,
    }

    const result = processSession(metrics, profile, [])
    store.saveResult(result)

    router.replace({
      pathname: '/exercise/[moduleCode]/result',
      params: {
        moduleCode,
        ...(userChunkId ? { userChunkId } : {}),
        ...(userContentId ? { userContentId } : {}),
      },
    })
  }, [store, student, router, moduleCode])

  const handleQuit = () => {
    Alert.alert('Egzersizden Çık', 'İlerlemeniz kaydedilmeyecek. Çıkmak istediğinize emin misiniz?', [
      { text: 'Devam Et', style: 'cancel' },
      { text: 'Çık', style: 'destructive', onPress: () => { store.reset(); router.back() } },
    ])
  }

  if (articleLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator style={{ flex: 1 }} size="large" color={accentColor} />
      </SafeAreaView>
    )
  }

  // İmmersif mod: metin okuma modülleri (dikkat/nefes/göz/kelime hariç tümü)
  const NON_READING = new Set(['attention_power', 'mental_reset', 'eye_training', 'vocabulary'])
  const im = !NON_READING.has(moduleCode)
  const imPal = getImmersivePalette(accentColor)

  return (
    <SafeAreaView style={[styles.container, im && { backgroundColor: imPal.content }]}>
      {/* Header — immersif modda modüle özgü koyu renk */}
      <View style={[styles.header, im && { backgroundColor: imPal.header }]}>
        <TouchableOpacity onPress={handleQuit} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={styles.quitBtn}>
          <Text style={[styles.quitText, im && { color: IM_WHITE }]}>✕</Text>
        </TouchableOpacity>
        <Text style={[styles.moduleLabel, im && { color: IM_WHITE }]}>{config.label}</Text>
        <Text style={[styles.timer, { color: im ? IM_WHITE : accentColor }]}>{formatTime(elapsed)}</Text>
      </View>
      {/* Accent line — immersif modda gizle */}
      {!im && <View style={[styles.accentLine, { backgroundColor: accentColor }]} />}

      {/* İçerik */}
      {phase === 'exercise' && moduleCode === 'speed_control' && exercise && (
        <>
          <ChunkReader
            text={exercise.content}
            targetWpm={wpmPreference}
            chunkSize={2}
            accentColor={im ? imPal.header : accentColor}
            bgColor={imPal.content}
            fontSize={CHUNK_FONT_SIZE_MAP[fontSizePreference]}
            isPaused={sessionPaused}
            onProgress={(w) => store.addWords(w)}
            onHalfway={handleHalfway}
            onComplete={(wpm) => handleExerciseComplete(wpm)}
          />
          {/* Pause / Resume — immersif modda beyaz outline */}
          <TouchableOpacity
            onPress={() => setSessionPaused(p => !p)}
            activeOpacity={0.82}
            style={[styles.pauseInlineBtn, im
              ? sessionPaused
                ? { backgroundColor: IM_WHITE, borderColor: IM_WHITE }
                : { backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,0.5)' }
              : sessionPaused
                ? { backgroundColor: accentColor, borderColor: accentColor }
                : { backgroundColor: 'transparent', borderColor: accentColor + '80' }
            ]}
          >
            <Text style={[styles.pauseInlineTxt, { color: im ? (sessionPaused ? imPal.header : IM_WHITE) : (sessionPaused ? '#fff' : accentColor) }]}>
              {sessionPaused ? '▶  Devam Et' : '⏸  Duraklat'}
            </Text>
          </TouchableOpacity>
        </>
      )}

      {phase === 'exercise' && moduleCode === 'deep_comprehension' && exercise && (
        <TextReader
          text={exercise.content}
          wordCount={exercise.wordCount}
          fontSize={currentFontSize}
          onHalfway={handleHalfway}
          onComplete={(wpm) => handleExerciseComplete(wpm)}
        />
      )}

      {phase === 'exercise' && moduleCode === 'attention_power' && (
        <AttentionGrid
          onProgress={(r) => store.addWords(r * 5)}
          onAnswer={(correct, ms) => store.recordAnswer(correct, ms)}
          onHalfway={handleHalfway}
          onComplete={() => handleExerciseComplete()}
        />
      )}

      {phase === 'exercise' && moduleCode === 'mental_reset' && (
        <BreathingCircle
          onHalfway={handleHalfway}
          onComplete={() => finishSession(0)}
        />
      )}

      {phase === 'exercise' && moduleCode === 'eye_training' && (
        <SchulteExercise
          difficultyLevel={difficultyNum}
          accentColor={accentColor}
          onComplete={(metrics) => {
            store.addWords(metrics.gridSize * metrics.gridSize)
            store.recordAnswer(true, metrics.completionTime)
            finishSession(0)
          }}
          onExit={handleQuit}
        />
      )}

      {phase === 'exercise' && moduleCode === 'vocabulary' && (
        <ContextGuessExercise
          onComplete={(vocabMetrics) => {
            store.addWords(vocabMetrics.total * 10)
            for (let i = 0; i < vocabMetrics.total; i++) {
              store.recordAnswer(i < vocabMetrics.correct, vocabMetrics.avgResponseMs)
            }
            finishSession(0)
          }}
          onExit={handleQuit}
        />
      )}

      {/* Konu metinleri — TextReader ile işlenir */}
      {phase === 'exercise' &&
        !['speed_control','deep_comprehension','attention_power','mental_reset','eye_training','vocabulary'].includes(moduleCode) &&
        exercise && exercise.content.length > 0 && (
        <TextReader
          text={exercise.content}
          wordCount={exercise.wordCount}
          onHalfway={handleHalfway}
          onComplete={(wpm) => handleExerciseComplete(wpm)}
        />
      )}

      {/* Sorular */}
      {phase === 'questions' && exercise?.questions && exercise.questions.length > 0 && (
        <View style={styles.questionsContainer}>
          <View style={[styles.questionsHeader, { backgroundColor: accentColor + '15' }]}>
            <Text style={[styles.questionsTitle, { color: accentColor }]}>
              🧠 Kavrama Soruları
            </Text>
          </View>
          <QuestionCard
            key={questionIndex}
            question={exercise.questions[questionIndex]}
            questionNumber={questionIndex + 1}
            totalQuestions={exercise.questions.length}
            onAnswer={handleAnswer}
          />
        </View>
      )}

      {/* ── Okuma Ayarları Alt Barı (speed_control / deep_comprehension) ── */}
      {phase === 'exercise' && isReadingExercise && (
        <View style={[styles.settingsBar, im && { backgroundColor: imPal.bottom, borderTopColor: 'transparent' }]}>
          <SessionWpmSlider
            value={wpmPreference}
            onChange={setWpmPreference}
            accentColor={accentColor}
            dark={im}
          />
          <FontSizeSlider
            value={fontSizePreference}
            onChange={setFontSizePreference}
            accentColor={accentColor}
            dark={im}
          />
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.background,
  },
  accentLine: {
    height: 2,
    opacity: 0.7,
  },
  quitBtn: { padding: 4 },
  quitText: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  moduleLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pauseInlineBtn: {
    marginHorizontal: 24,
    marginTop: 8,
    marginBottom: 4,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseInlineTxt: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  timer: {
    fontSize: 16,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    minWidth: 36,
    textAlign: 'right',
  },
  questionsContainer: {
    flex: 1,
  },
  questionsHeader: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    alignItems: 'center',
  },
  questionsTitle: {
    fontSize: 16,
    fontWeight: '700',
  },

  // ── Settings Bar ──────────────────────────────────────────────────
  settingsBar: {
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 4,
  },
  fontRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  fontLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: colors.textSecondary,
  },
  fontBtns: {
    flexDirection: 'row',
    gap: 8,
  },
  fontBtn: {
    width: 58,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    backgroundColor: colors.background,
  },
  fontBtnA: {
    fontWeight: '800',
  },
  fontBtnLbl: {
    fontSize: 9,
    fontWeight: '600',
  },
  // Font timeline (3-dot slider)
  fontTimeline: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 4,
  },
  fontTrackLine: {
    flex: 1,
    height: 2,
    borderRadius: 1,
  },
  fontDotWrap: {
    alignItems: 'center',
    gap: 5,
  },
  fontDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  fontDotLabel: {
    fontWeight: '700',
    color: colors.textSecondary,
  },
})

// ── Slider paylaşımlı stiller (WPM + FontSize) ───────────────────────
const bar = StyleSheet.create({
  sliderWrap: {
    paddingHorizontal: 24,
    gap: 2,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  sliderLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: colors.textSecondary,
  },
  sliderValue: {
    fontSize: 13,
    fontWeight: '900',
  },
  trackHitArea: {
    height: 32,
    justifyContent: 'center',
    position: 'relative',
  },
  track: {
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  thumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    position: 'absolute',
    top: 5,
    backgroundColor: '#fff',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 1,
  },
  rangeLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
  },
})
