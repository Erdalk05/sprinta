import React, { useState, useRef, useCallback } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { colors, moduleColors } from '../../../src/constants/colors'
import { MODULE_CONFIGS } from '../../../src/constants/modules'
import { SAMPLE_EXERCISES } from '../../../src/data/sampleContent'
import { useSessionStore } from '../../../src/stores/sessionStore'
import { ChunkReader } from '../../../src/components/exercise/ChunkReader'
import { TextReader } from '../../../src/components/exercise/TextReader'
import { AttentionGrid } from '../../../src/components/exercise/AttentionGrid'
import { BreathingCircle } from '../../../src/components/exercise/BreathingCircle'
import { QuestionCard } from '../../../src/components/exercise/QuestionCard'
import { formatTime } from '../../../src/hooks/useSessionTimer'
import { processSession } from '@sprinta/shared'
import type { CognitiveProfile } from '@sprinta/shared'
import { useAuthStore } from '../../../src/stores/authStore'

type Phase = 'exercise' | 'questions' | 'done'

export default function SessionScreen() {
  const { moduleCode, difficulty, exerciseId } = useLocalSearchParams<{
    moduleCode: string
    difficulty: string
    exerciseId: string
  }>()
  const router = useRouter()
  const { student } = useAuthStore()
  const store = useSessionStore()

  const [phase, setPhase] = useState<Phase>('exercise')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [readingWpm, setReadingWpm] = useState(0)

  const config = MODULE_CONFIGS[moduleCode] ?? MODULE_CONFIGS.speed_control
  const exercise = SAMPLE_EXERCISES[moduleCode]
  const difficultyNum = parseInt(difficulty ?? '5', 10)
  const accentColor = moduleColors[moduleCode] ?? colors.primary

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
      params: { moduleCode },
    })
  }, [store, student, router, moduleCode])

  const handleQuit = () => {
    Alert.alert('Egzersizden Çık', 'İlerlemeniz kaydedilmeyecek. Çıkmak istediğinize emin misiniz?', [
      { text: 'Devam Et', style: 'cancel' },
      { text: 'Çık', style: 'destructive', onPress: () => { store.reset(); router.back() } },
    ])
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

      {/* Sorular */}
      {phase === 'questions' && exercise?.questions && exercise.questions.length > 0 && (
        <View style={styles.questionsContainer}>
          <View style={[styles.questionsHeader, { backgroundColor: accentColor + '15' }]}>
            <Text style={[styles.questionsTitle, { color: accentColor }]}>
              🧠 Kavrama Soruları
            </Text>
          </View>
          <QuestionCard
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
