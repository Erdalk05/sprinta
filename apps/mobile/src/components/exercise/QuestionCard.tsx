import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import * as Haptics from 'expo-haptics'
import { colors } from '../../constants/colors'
import type { SampleQuestion } from '../../data/sampleContent'

interface Props {
  question: SampleQuestion
  questionNumber: number
  totalQuestions: number
  onAnswer: (correct: boolean, responseTimeMs: number) => void
}

export function QuestionCard({ question, questionNumber, totalQuestions, onAnswer }: Props) {
  const [selected, setSelected] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const startTime = React.useRef(Date.now())

  const handleSelect = (index: number) => {
    if (answered) return
    const responseTime = Date.now() - startTime.current
    const correct = index === question.correctIndex
    setSelected(index)
    setAnswered(true)

    if (correct) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }

    setTimeout(() => {
      onAnswer(correct, responseTime)
    }, 600)
  }

  const getOptionStyle = (index: number) => {
    if (!answered) return styles.option
    if (index === question.correctIndex) return [styles.option, styles.optionCorrect]
    if (index === selected && index !== question.correctIndex) return [styles.option, styles.optionWrong]
    return [styles.option, styles.optionDim]
  }

  const getOptionTextStyle = (index: number) => {
    if (!answered) return styles.optionText
    if (index === question.correctIndex) return [styles.optionText, styles.optionTextCorrect]
    if (index === selected && index !== question.correctIndex) return [styles.optionText, styles.optionTextWrong]
    return [styles.optionText, styles.optionTextDim]
  }

  return (
    <View style={styles.container}>
      <Text style={styles.counter}>
        Soru {questionNumber} / {totalQuestions}
      </Text>
      <Text style={styles.question}>{question.question}</Text>

      {question.options.map((option, i) => (
        <TouchableOpacity
          key={i}
          style={getOptionStyle(i)}
          onPress={() => handleSelect(i)}
          activeOpacity={0.7}
          disabled={answered}
        >
          <Text style={styles.optionLetter}>
            {String.fromCharCode(65 + i)}
          </Text>
          <Text style={getOptionTextStyle(i)}>{option}</Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  counter: {
    fontSize: 13,
    color: colors.textTertiary,
    marginBottom: 12,
    textAlign: 'center',
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 28,
    lineHeight: 26,
    textAlign: 'center',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  optionCorrect: {
    backgroundColor: '#D1FAE5',
    borderColor: colors.success,
  },
  optionWrong: {
    backgroundColor: '#FEE2E2',
    borderColor: colors.error,
  },
  optionDim: {
    opacity: 0.45,
  },
  optionLetter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border,
    textAlign: 'center',
    lineHeight: 28,
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    marginRight: 12,
  },
  optionText: {
    fontSize: 15,
    color: colors.text,
    flex: 1,
    lineHeight: 22,
  },
  optionTextCorrect: {
    color: '#065F46',
    fontWeight: '600',
  },
  optionTextWrong: {
    color: '#991B1B',
  },
  optionTextDim: {
    color: colors.textTertiary,
  },
})
