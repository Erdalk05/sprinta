/**
 * FlashAtlamaMatrisi — Göz Atlaması (Sakkadik) Egzersizi
 *
 * 4×4 grid → 6×6 grid
 * Beliren flash noktaya dokun. Süre dolunca sonuç döner.
 * Zorluk artışı: her 10 sn'de grid büyür.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions, SafeAreaView,
} from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { useEyeSoundFeedback } from './useEyeSoundFeedback'
import type { EyeExerciseProps, EyeMetrics } from '@sprinta/shared'

const { width: SW, height: SH } = Dimensions.get('window')
const BG = '#0A0F1F'
const FLASH_COLOR = '#1877F2'      // Göz Atlama (Sakkadik) rengi

// Izgara boyutu için hesaplama
function getGridSize(elapsed: number): number {
  if (elapsed < 10) return 4
  if (elapsed < 20) return 5
  return 6
}

function buildGrid(size: number): number[] {
  return Array.from({ length: size * size }, (_, i) => i)
}

export default function FlashAtlamaMatrisi({
  durationSeconds,
  onComplete,
  onExit,
}: EyeExerciseProps) {
  const { playHit, playMiss, playAppear } = useEyeSoundFeedback()
  const startTime = useRef(performance.now())
  const [elapsed, setElapsed] = useState(0)
  const [gridSize, setGridSize] = useState(4)
  const [activeCell, setActiveCell] = useState<number | null>(null)
  const [hits, setHits] = useState(0)
  const [misses, setMisses] = useState(0)
  const reactionTimes = useRef<number[]>([])
  const flashShownAt = useRef<number>(0)
  const flashTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const flashOpacity = useSharedValue(0)
  const flashStyle = useAnimatedStyle(() => ({ opacity: flashOpacity.value }))

  // ── Timer ──────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      const e = (performance.now() - startTime.current) / 1000
      setElapsed(e)
      setGridSize(getGridSize(e))
      if (e >= durationSeconds) {
        clearInterval(interval)
        finishExercise()
      }
    }, 500)
    return () => clearInterval(interval)
  }, [durationSeconds])

  // ── Flash tetikleyici ──────────────────────────────────────────
  useEffect(() => {
    scheduleFlash()
    return () => { if (flashTimeout.current) clearTimeout(flashTimeout.current) }
  }, [gridSize])

  function scheduleFlash() {
    if (flashTimeout.current) clearTimeout(flashTimeout.current)
    const delay = 600 + Math.random() * 800
    flashTimeout.current = setTimeout(() => {
      const size = gridSize
      const cell = Math.floor(Math.random() * size * size)
      playAppear()
      setActiveCell(cell)
      flashShownAt.current = performance.now()
      flashOpacity.value = withSequence(
        withTiming(1, { duration: 80 }),
        withTiming(1, { duration: 450 }),
        withTiming(0, { duration: 150 }),
      )
      // Tepki verilmezse miss say
      flashTimeout.current = setTimeout(() => {
        setActiveCell(prev => {
          if (prev === cell) {
            setMisses(m => m + 1)
            scheduleFlash()
            return null
          }
          return prev
        })
      }, 700)
    }, delay)
  }

  function handleCellPress(index: number) {
    if (index !== activeCell) {
      setMisses(m => m + 1)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      playMiss()
      return
    }
    const rt = performance.now() - flashShownAt.current
    reactionTimes.current.push(rt)
    setHits(h => h + 1)
    setActiveCell(null)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    playHit()
    scheduleFlash()
  }

  const finishExercise = useCallback(() => {
    const rts = reactionTimes.current
    const totalAttempts = hits + misses
    const avgRt = rts.length > 0 ? rts.reduce((a, b) => a + b, 0) / rts.length : 999
    const accuracy = totalAttempts > 0 ? (hits / totalAttempts) * 100 : 0
    const speedFactor = Math.max(0, Math.min(100, (1 - avgRt / 700) * 100))
    const vas = accuracy * 0.6 + speedFactor * 0.4

    const metrics: EyeMetrics = {
      reactionTimeMs:        avgRt,
      accuracyPercent:       accuracy,
      trackingErrorPx:       0,
      visualAttentionScore:  vas,
      saccadicSpeedEstimate: hits / durationSeconds,
      taskCompletionMs:      performance.now() - startTime.current,
      arpContribution:       3,
    }
    onComplete(metrics)
  }, [hits, misses, durationSeconds, onComplete])

  const timeLeft = Math.max(0, durationSeconds - Math.floor(elapsed))
  const CELL_SIZE = Math.min((SW - 48) / gridSize, 64)

  return (
    <SafeAreaView style={styles.safe}>
      {/* Üst bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onExit} style={styles.exitBtn}>
          <Text style={styles.exitText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.timerText}>{timeLeft}sn</Text>
        <Text style={styles.scoreText}>✓ {hits}</Text>
      </View>

      {/* Başlık */}
      <View style={styles.titleRow}>
        <Text style={styles.title}>Flash Atlama Matrisi</Text>
        <Text style={styles.subtitle}>Göz Atlaması (Sakkadik) · {gridSize}×{gridSize}</Text>
      </View>

      {/* Grid */}
      <View style={styles.gridWrap}>
        <View style={[styles.grid, { gap: 6 }]}>
          {buildGrid(gridSize).map((idx) => {
            const isActive = idx === activeCell
            return (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.cell,
                  { width: CELL_SIZE, height: CELL_SIZE, borderRadius: CELL_SIZE * 0.18 },
                  isActive && styles.cellActive,
                ]}
                onPress={() => handleCellPress(idx)}
                activeOpacity={0.6}
              >
                {isActive && (
                  <Animated.View style={[styles.flashDot, flashStyle]} />
                )}
              </TouchableOpacity>
            )
          })}
        </View>
      </View>

      {/* Alt bilgi */}
      <View style={styles.bottomInfo}>
        <Text style={styles.infoText}>Mavi noktaya dokun!</Text>
        <Text style={styles.missText}>Kaçırılan: {misses}</Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  topBar: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    paddingHorizontal: 20,
    paddingTop:      12,
    paddingBottom:   8,
  },
  exitBtn: {
    width:          36, height: 36,
    borderRadius:   18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems:     'center', justifyContent: 'center',
  },
  exitText:  { color: '#fff', fontSize: 16 },
  timerText: { color: '#fff', fontSize: 24, fontWeight: '800' },
  scoreText: { color: FLASH_COLOR, fontSize: 18, fontWeight: '700' },

  titleRow:  { alignItems: 'center', marginBottom: 20 },
  title:     { color: '#fff', fontSize: 20, fontWeight: '800' },
  subtitle:  { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 4 },

  gridWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  grid:     { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },

  cell: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.10)',
    alignItems:      'center',
    justifyContent:  'center',
    margin:          3,
  },
  cellActive: {
    backgroundColor: 'rgba(24,119,242,0.18)',
    borderColor:     FLASH_COLOR,
  },
  flashDot: {
    width:           24, height: 24,
    borderRadius:    12,
    backgroundColor: FLASH_COLOR,
  },

  bottomInfo: {
    alignItems:   'center',
    paddingBottom: 30,
    gap:           6,
  },
  infoText: { color: 'rgba(255,255,255,0.55)', fontSize: 14 },
  missText: { color: '#FF6B6B', fontSize: 13 },
})
