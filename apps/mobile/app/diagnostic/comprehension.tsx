import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, SafeAreaView } from 'react-native'
import { useRouter } from 'expo-router'
import { DIAGNOSTIC_CONTENT } from '../../src/data/diagnosticContent'
import { useDiagnosticStore } from '../../src/stores/diagnosticStore'
import { QuestionCard } from '../../src/components/exercise/QuestionCard'
import Animated, { useAnimatedStyle, withTiming, useSharedValue } from 'react-native-reanimated'

const BG     = '#080E1F'
const BORDER = '#1E293B'
const ACCENT = '#6366F1'
const TEXT   = '#F1F5F9'
const SUB    = '#94A3B8'
const GREEN  = '#10B981'

function DiagProgressBar({ step, total }: { step: number; total: number }) {
  const progress  = useSharedValue(step / total)
  const fillStyle = useAnimatedStyle(() => ({ flex: progress.value }))
  const restStyle = useAnimatedStyle(() => ({ flex: 1 - progress.value }))

  useEffect(() => {
    progress.value = withTiming(step / total, { duration: 400 })
  }, [step])

  return (
    <View style={[pb.track, { flexDirection: 'row' }]}>
      <Animated.View style={[pb.fill, fillStyle]} />
      <Animated.View style={restStyle} />
    </View>
  )
}
const pb = StyleSheet.create({
  track: { height: 3, backgroundColor: BORDER, marginHorizontal: 24, borderRadius: 2 },
  fill:  { height: 3, backgroundColor: GREEN, borderRadius: 2 },
})

export default function DiagnosticComprehensionScreen() {
  const router = useRouter()
  const { recordAnswer, buildResult } = useDiagnosticStore()
  const [questionIndex, setQuestionIndex] = useState(0)

  const questions = DIAGNOSTIC_CONTENT.questions
  const current   = questions[questionIndex]
  const progress  = questionIndex + 1

  const handleAnswer = (correct: boolean, responseTimeMs: number) => {
    recordAnswer(correct, responseTimeMs)
    const nextIndex = questionIndex + 1

    if (nextIndex >= questions.length) {
      buildResult()
      router.replace('/diagnostic/result')
    } else {
      setQuestionIndex(nextIndex)
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.topBar}>
        <Text style={s.topLabel}>Anlama Soruları</Text>
        <View style={s.counter}>
          <Text style={s.counterText}>{progress} / {questions.length}</Text>
        </View>
        <Text style={s.topStep}>Adım 2 / 3</Text>
      </View>
      <DiagProgressBar step={progress} total={questions.length} />

      <View style={s.dotRow}>
        {questions.map((_, i) => (
          <View
            key={i}
            style={[
              s.dot,
              i < questionIndex && s.dotDone,
              i === questionIndex && s.dotActive,
            ]}
          />
        ))}
      </View>

      {current && (
        <QuestionCard
          key={questionIndex}
          question={current}
          questionNumber={questionIndex + 1}
          totalQuestions={questions.length}
          onAnswer={handleAnswer}
        />
      )}
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: BG },
  topBar:      {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingVertical: 16,
  },
  topLabel:    { fontSize: 15, fontWeight: '700', color: TEXT, flex: 1 },
  counter:     {
    backgroundColor: GREEN + '20', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  counterText: { fontSize: 13, fontWeight: '700', color: GREEN },
  topStep:     { fontSize: 13, color: ACCENT, fontWeight: '600', flex: 1, textAlign: 'right' },
  dotRow:      { flexDirection: 'row', gap: 6, justifyContent: 'center', paddingVertical: 14 },
  dot:         { width: 8, height: 8, borderRadius: 4, backgroundColor: BORDER },
  dotDone:     { backgroundColor: GREEN + '80' },
  dotActive:   { width: 20, backgroundColor: GREEN },
})
