import React, { useState, useRef, useCallback, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { colors, moduleColors } from '../../../src/constants/colors'
import { MODULE_CONFIGS } from '../../../src/constants/modules'
import { SAMPLE_EXERCISES } from '../../../src/data/sampleContent'
import { getArticleById, type Article } from '../../../src/hooks/useArticles'
import { useSessionStore } from '../../../src/stores/sessionStore'
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
import { useAuthStore } from '../../../src/stores/authStore'

type Phase = 'exercise' | 'questions' | 'done'

// Supabase Article → SampleExercise benzeri format dönüşümü
function articleToExercise(art: Article) {
  return {
    id: art.id,
    moduleCode: art.subject_code,
    title: art.title,
    content: art.content_text,
    wordCount: art.word_count,
    difficulty: art.difficulty_level * 2, // 1-10 → 2-20 ölçeği normalize
    questions: art.questions,
  }
}

export default function SessionScreen() {
  const { moduleCode, difficulty, exerciseId, articleId, userContentId, userChunkId } =
    useLocalSearchParams<{
      moduleCode: string
      difficulty: string
      exerciseId: string
      articleId?: string
      userContentId?: string
      userChunkId?: string
    }>()
  const router = useRouter()
  const { student } = useAuthStore()
  const store = useSessionStore()

  const [phase, setPhase] = useState<Phase>('exercise')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [readingWpm, setReadingWpm] = useState(0)
  const [articleLoading, setArticleLoading] = useState(!!(articleId || userContentId))
  const [remoteArticle, setRemoteArticle] = useState<ReturnType<typeof articleToExercise> | null>(null)

  const config = MODULE_CONFIGS[moduleCode] ?? MODULE_CONFIGS.speed_control
  const difficultyNum = parseInt(difficulty ?? '5', 10)
  const accentColor = moduleColors[moduleCode] ?? colors.primary

  // articleId → platform makalesinden çek
  useEffect(() => {
    if (!articleId) return
    getArticleById(articleId).then((art) => {
      if (art) setRemoteArticle(articleToExercise(art))
      setArticleLoading(false)
    })
  }, [articleId])

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
    // İlk yarı metriklerini kaydet
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

    // Bilişsel profil (mevcut ARP'tan tahmin)
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
        <Text style={styles.timer}>{formatTime(elapsed)}</Text>
      </View>

      {/* İçerik */}
      {phase === 'exercise' && moduleCode === 'speed_control' && exercise && (
        <ChunkReader
          text={exercise.content}
          targetWpm={150 + difficultyNum * 10}
          chunkSize={2}
          onProgress={(w) => store.addWords(w)}
          onHalfway={handleHalfway}
          onComplete={() => handleExerciseComplete()}
        />
      )}

      {phase === 'exercise' && moduleCode === 'deep_comprehension' && exercise && (
        <TextReader
          text={exercise.content}
          wordCount={exercise.wordCount}
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

      {/* Konu metinleri (mevcut + yeni) — TextReader ile işlenir */}
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  quitText: {
    fontSize: 20,
    color: colors.textSecondary,
    padding: 4,
  },
  moduleLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  timer: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textSecondary,
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
})
