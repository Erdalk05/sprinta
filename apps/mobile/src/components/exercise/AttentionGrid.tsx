import React, { useState, useEffect, useCallback, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import * as Haptics from 'expo-haptics'
import { colors } from '../../constants/colors'

const GRID_SIZE = 5
const ROUNDS = 10
const LETTERS = 'ABCDEFGHKLMNPRSTYZabcdefghklmnprstyz'
const TARGET_LETTERS = ['A', 'K', 'S', 'T', 'Y']

interface Props {
  onProgress: (roundsComplete: number) => void
  onAnswer: (correct: boolean, responseTimeMs: number) => void
  onHalfway?: () => void
  onComplete: () => void
}

export function AttentionGrid({ onProgress, onAnswer, onHalfway, onComplete }: Props) {
  const [round, setRound] = useState(0)
  const [grid, setGrid] = useState<string[]>([])
  const [target, setTarget] = useState('')
  const [targetPos, setTargetPos] = useState(-1)
  const [selectedPos, setSelectedPos] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const roundStartTime = useRef(Date.now())
  const halfwayFired = useRef(false)

  const generateRound = useCallback(() => {
    const newTarget = TARGET_LETTERS[Math.floor(Math.random() * TARGET_LETTERS.length)]
    const pos = Math.floor(Math.random() * GRID_SIZE * GRID_SIZE)
    const newGrid: string[] = []

    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
      if (i === pos) {
        newGrid.push(newTarget)
      } else {
        let letter
        do {
          letter = LETTERS[Math.floor(Math.random() * LETTERS.length)]
        } while (letter.toUpperCase() === newTarget)
        newGrid.push(letter)
      }
    }

    setTarget(newTarget)
    setTargetPos(pos)
    setGrid(newGrid)
    setSelectedPos(null)
    setAnswered(false)
    roundStartTime.current = Date.now()
  }, [])

  useEffect(() => {
    generateRound()
  }, [round])

  const handleTap = (pos: number) => {
    if (answered) return
    const responseTime = Date.now() - roundStartTime.current
    const correct = pos === targetPos
    setSelectedPos(pos)
    setAnswered(true)

    if (correct) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }

    onAnswer(correct, responseTime)
    onProgress(round + 1)

    if (!halfwayFired.current && round + 1 >= ROUNDS / 2) {
      halfwayFired.current = true
      onHalfway?.()
    }

    setTimeout(() => {
      if (round + 1 >= ROUNDS) {
        onComplete()
      } else {
        setRound((r) => r + 1)
      }
    }, 500)
  }

  const getCellStyle = (pos: number) => {
    if (!answered) return styles.cell
    if (pos === targetPos) return [styles.cell, styles.cellCorrect]
    if (pos === selectedPos && pos !== targetPos) return [styles.cell, styles.cellWrong]
    return styles.cell
  }

  return (
    <View style={styles.container}>
      <Text style={styles.round}>{round + 1} / {ROUNDS}</Text>
      <View style={styles.targetBox}>
        <Text style={styles.targetLabel}>Hedef harf:</Text>
        <Text style={styles.targetLetter}>{target}</Text>
      </View>

      <View style={styles.grid}>
        {grid.map((letter, i) => (
          <TouchableOpacity
            key={i}
            style={getCellStyle(i)}
            onPress={() => handleTap(i)}
            activeOpacity={0.7}
            disabled={answered}
          >
            <Text style={styles.cellText}>{letter}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.hint}>Hedef harfi izle ve dokun</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  round: {
    fontSize: 14,
    color: colors.textTertiary,
    marginBottom: 20,
  },
  targetBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#E8F0FE',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 32,
  },
  targetLabel: {
    fontSize: 16,
    color: '#92400E',
    fontWeight: '500',
  },
  targetLetter: {
    fontSize: 32,
    fontWeight: '800',
    color: '#D97706',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: GRID_SIZE * 56,
    gap: 4,
    marginBottom: 24,
  },
  cell: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cellCorrect: {
    backgroundColor: '#D1FAE5',
    borderColor: colors.success,
  },
  cellWrong: {
    backgroundColor: '#FEE2E2',
    borderColor: colors.error,
  },
  cellText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  hint: {
    fontSize: 13,
    color: colors.textTertiary,
  },
})
