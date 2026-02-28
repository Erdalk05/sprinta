import React, { useState, useRef, useCallback } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native'
import * as Haptics from 'expo-haptics'

export interface SchulteMetrics {
  completionTime: number  // ms
  errorCount: number
  gridSize: number
  peripheralScore: number // 0-100
}

interface Props {
  difficultyLevel?: number  // 1-10 → 5x5(1-3), 6x6(4-7), 7x7(8-10)
  onComplete: (metrics: SchulteMetrics) => void
  onExit: () => void
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function SchulteExercise({ difficultyLevel = 5, onComplete, onExit }: Props) {
  const gridSize = difficultyLevel <= 3 ? 5 : difficultyLevel <= 7 ? 6 : 7
  const total = gridSize * gridSize

  const [numbers] = useState(() => shuffle(Array.from({ length: total }, (_, i) => i + 1)))
  const [next, setNext] = useState(1)
  const [errors, setErrors] = useState(0)
  const [found, setFound] = useState<Set<number>>(new Set())
  const [startTime] = useState(Date.now())
  const flashAnim = useRef(new Animated.Value(1)).current

  const flash = useCallback(() => {
    Animated.sequence([
      Animated.timing(flashAnim, { toValue: 0.4, duration: 60, useNativeDriver: true }),
      Animated.timing(flashAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start()
  }, [flashAnim])

  const handleTap = useCallback((num: number) => {
    if (num === next) {
      Haptics.selectionAsync()
      flash()
      const newFound = new Set(found)
      newFound.add(num)
      setFound(newFound)
      if (num === total) {
        const elapsed = Date.now() - startTime
        const timeScore = Math.max(0, 100 - Math.floor(elapsed / 1000))
        const errorPenalty = errors * 5
        const peripheralScore = Math.max(0, Math.min(100, timeScore - errorPenalty))
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        onComplete({ completionTime: elapsed, errorCount: errors, gridSize, peripheralScore })
      } else {
        setNext(n => n + 1)
      }
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      setErrors(e => e + 1)
    }
  }, [next, total, errors, found, startTime, gridSize, flash, onComplete])

  const CELL = gridSize === 5 ? 62 : gridSize === 6 ? 52 : 44
  const GAP = 6

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Schulte Tablosu {gridSize}×{gridSize}</Text>
        <Text style={styles.sub}>
          Sırayla dokunun: <Text style={styles.nextNum}>{next}</Text>
        </Text>
        <Text style={styles.errors}>Hata: {errors}</Text>
      </View>

      <Animated.View style={[styles.grid, { opacity: flashAnim }]}>
        {Array.from({ length: gridSize }, (_, row) => (
          <View key={row} style={{ flexDirection: 'row', gap: GAP, marginBottom: GAP }}>
            {Array.from({ length: gridSize }, (_, col) => {
              const idx = row * gridSize + col
              const num = numbers[idx]
              const isFound = found.has(num)
              return (
                <TouchableOpacity
                  key={col}
                  style={[styles.cell, { width: CELL, height: CELL }, isFound && styles.cellFound]}
                  onPress={() => handleTap(num)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.cellNum, isFound && styles.cellNumFound]}>{num}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
        ))}
      </Animated.View>

      <TouchableOpacity style={styles.exitBtn} onPress={onExit}>
        <Text style={styles.exitText}>Çıkış</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  header: { alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 18, fontWeight: '700', color: '#111', marginBottom: 4 },
  sub: { fontSize: 15, color: '#444', marginBottom: 4 },
  nextNum: { fontSize: 18, fontWeight: '900', color: '#F59E0B' },
  errors: { fontSize: 13, color: '#EF4444' },
  grid: { alignItems: 'center' },
  cell: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#DDD',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cellFound: { backgroundColor: '#D1FAE5', borderColor: '#059669' },
  cellNum: { fontSize: 20, fontWeight: '700', color: '#1F2937' },
  cellNumFound: { color: '#059669' },
  exitBtn: {
    marginTop: 28,
    paddingVertical: 10,
    paddingHorizontal: 28,
    backgroundColor: '#EEE',
    borderRadius: 12,
  },
  exitText: { fontSize: 15, color: '#666', fontWeight: '600' },
})
