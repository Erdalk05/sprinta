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

// ── WPM Slider (Reanimated v4 PanGestureHandler) ────────────────────────
const WPM_MIN = 100, WPM_MAX = 500

interface WpmSliderProps {
  value: number
  onChange: (wpm: number) => void
  accentColor: string
}

function SessionWpmSlider({ value, onChange, accentColor }: WpmSliderProps) {
  const { width } = useWindowDimensions()
  const trackW = Math.max(160, width - 80)
  const range = WPM_MAX - WPM_MIN

  const [localWpm, setLocalWpm] = useState(value)
  const thumbX = useSharedValue(((value - WPM_MIN) / range) * trackW)
  const startX = useSharedValue(0)

  // Sync external value changes (e.g. initial load)
  useEffect(() => {
    thumbX.value = ((value - WPM_MIN) / range) * trackW
    setLocalWpm(value)
  }, [value])

  // When localWpm changes via drag, notify parent
  const prevWpm = useRef(value)
  useEffect(() => {
    if (localWpm !== prevWpm.current) {
      prevWpm.current = localWpm
      onChange(localWpm)
    }
  }, [localWpm, onChange])

  const pan = Gesture.Pan()
    .onBegin(() => { startX.value = thumbX.value })
    .onUpdate((e) => {
      const nx = Math.max(0, Math.min(trackW, startX.value + e.translationX))
      thumbX.value = nx
      const wpm = Math.round(WPM_MIN + (nx / trackW) * range)
      runOnJS(setLocalWpm)(wpm)
    })

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbX.value }],
  }))

  return (
    <View style={bar.sliderWrap}>
      <View style={bar.sliderHeader}>
        <Text style={bar.sliderLabel}>⚡ Hız</Text>
        <Text style={[bar.sliderValue, { color: accentColor }]}>{localWpm} WPM</Text>
      </View>
      <GestureDetector gesture={pan}>
        <View style={[bar.trackHitArea, { width: trackW }]}>
          <View style={bar.track}>
            <Animated.View style={[bar.thumb, { backgroundColor: accentColor }, thumbStyle]} />
          </View>
        </View>
      </GestureDetector>
      <View style={[bar.rangeRow, { width: trackW }]}>
        <Text style={bar.rangeLabel}>100</Text>
        <Text style={bar.rangeLabel}>500</Text>
      </View>
    </View>
  )
}
// ────────────────────────────────────────────────────────────────────────

const FONT_SIZE_MAP = { small: 14, medium: 17, large: 20 } as const
const FONT_SIZE_LABELS = { small: 'A', medium: 'A', large: 'A' } as const

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

  const config = MODULE_CONFIGS[moduleCode] ?? MODULE_CONFIGS.speed_control
  const difficultyNum = parseInt(difficulty ?? '5', 10)
  const accentColor = moduleColors[moduleCode] ?? colors.primary

  const isReadingExercise = moduleCode === 'speed_control' || moduleCode === 'deep_comprehension'

  // articleId → platform makalesinden çek
  useEffect(() => {
    if (!articleId) return
    getArticleById(articleId).then((art) => {
      if (art) setRemoteArticle(articleToExercise(art))
      setArticleLoading(false)
    })
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleQuit} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.quitText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.moduleLabel}>{config.label}</Text>
        <Text style={[styles.timer, { color: accentColor }]}>{formatTime(elapsed)}</Text>
      </View>
      {/* Accent line */}
      <View style={[styles.accentLine, { backgroundColor: accentColor }]} />

      {/* İçerik */}
      {phase === 'exercise' && moduleCode === 'speed_control' && exercise && (
        <ChunkReader
          text={exercise.content}
          targetWpm={wpmPreference}
          chunkSize={2}
          accentColor={accentColor}
          onProgress={(w) => store.addWords(w)}
          onHalfway={handleHalfway}
          onComplete={(wpm) => handleExerciseComplete(wpm)}
          onQuit={handleQuit}
        />
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
        <View style={styles.settingsBar}>
          {/* WPM Slider */}
          <SessionWpmSlider
            value={wpmPreference}
            onChange={setWpmPreference}
            accentColor={accentColor}
          />

          {/* Yazı Boyutu */}
          <View style={styles.fontRow}>
            <Text style={styles.fontLabel}>Yazı</Text>
            <View style={styles.fontBtns}>
              {(['small', 'medium', 'large'] as const).map(size => (
                <TouchableOpacity
                  key={size}
                  onPress={() => setFontSizePreference(size)}
                  style={[
                    styles.fontBtn,
                    fontSizePreference === size && { backgroundColor: accentColor + '20', borderColor: accentColor },
                  ]}
                  activeOpacity={0.75}
                >
                  <Text style={[
                    styles.fontBtnTxt,
                    { fontSize: size === 'small' ? 11 : size === 'medium' ? 14 : 18 },
                    fontSizePreference === size && { color: accentColor, fontWeight: '800' },
                  ]}>
                    {FONT_SIZE_LABELS[size]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
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
    paddingVertical: 14,
    backgroundColor: colors.background,
  },
  accentLine: {
    height: 3,
    borderRadius: 0,
    opacity: 0.85,
  },
  quitText: {
    fontSize: 20,
    color: colors.textSecondary,
    padding: 4,
  },
  moduleLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  timer: {
    fontSize: 16,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
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
    paddingTop: 10,
    paddingBottom: 14,
    gap: 6,
  },
  fontRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  fontLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  fontBtns: {
    flexDirection: 'row',
    gap: 8,
  },
  fontBtn: {
    width: 40,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fontBtnTxt: {
    fontWeight: '600',
    color: colors.text,
  },
})

// ── SessionWpmSlider stiller ──────────────────────────────────────────
const bar = StyleSheet.create({
  sliderWrap: {
    paddingHorizontal: 20,
    gap: 2,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sliderLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  sliderValue: {
    fontSize: 12,
    fontWeight: '800',
  },
  trackHitArea: {
    height: 36,
    justifyContent: 'center',
  },
  track: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    position: 'relative',
  },
  thumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    position: 'absolute',
    top: -9,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rangeLabel: {
    fontSize: 10,
    color: colors.textSecondary,
  },
})
