import { useState } from 'react'
import { View, Text, StyleSheet, SafeAreaView } from 'react-native'
import { useRouter } from 'expo-router'
import { colors } from '../../src/constants/colors'
import { DIAGNOSTIC_CONTENT } from '../../src/data/diagnosticContent'
import { useDiagnosticStore } from '../../src/stores/diagnosticStore'
import { QuestionCard } from '../../src/components/exercise/QuestionCard'

export default function DiagnosticComprehensionScreen() {
  const router = useRouter()
  const { recordAnswer, buildResult } = useDiagnosticStore()
  const [questionIndex, setQuestionIndex] = useState(0)

  const questions = DIAGNOSTIC_CONTENT.questions
  const current = questions[questionIndex]
  const progress = (questionIndex / questions.length) * 100

  const handleAnswer = (correct: boolean, responseTimeMs: number) => {
    recordAnswer(correct, responseTimeMs)
    const nextIndex = questionIndex + 1

    if (nextIndex >= questions.length) {
      // Tüm sorular bitti — sonuç hesapla ve geç
      buildResult()
      router.replace('/diagnostic/result')
    } else {
      setQuestionIndex(nextIndex)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Başlık */}
      <View style={styles.header}>
        <View style={styles.step}>
          <Text style={styles.stepText}>Adım 2 / 3</Text>
        </View>
        <Text style={styles.headerTitle}>Anlama Soruları</Text>
        <Text style={styles.headerSub}>Az önce okuduğun metinle ilgili</Text>
      </View>

      {/* İlerleme */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      {/* Soru */}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    padding: 20, paddingTop: 24,
    borderBottomWidth: 1, borderBottomColor: colors.border,
    alignItems: 'center', gap: 6,
  },
  step: {
    backgroundColor: '#059669' + '15', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 4,
  },
  stepText: { fontSize: 12, fontWeight: '700', color: '#059669' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  headerSub: { fontSize: 13, color: colors.textSecondary },
  progressBar: { height: 4, backgroundColor: colors.border },
  progressFill: { height: 4, backgroundColor: '#059669', borderRadius: 2 },
})
