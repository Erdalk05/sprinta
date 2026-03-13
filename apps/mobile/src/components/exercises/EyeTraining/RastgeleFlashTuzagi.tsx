/**
 * RastgeleFlashTuzagi — Göz Takibi (Smooth Pursuit) Egzersizi
 *
 * 3×3 bölge flash. 150ms withTiming ile bölge parlar.
 * Doğru bölgeye dokun.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions, SafeAreaView,
} from 'react-native'
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSequence,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { useEyeSoundFeedback } from './useEyeSoundFeedback'
import type { EyeExerciseProps, EyeMetrics } from '@sprinta/shared'

const { width: SW } = Dimensions.get('window')
const BG = '#0A0F1F'
const ACCENT = '#FF9F1C'
const GRID_SIZE = 3
const CELL_SIZE = (SW - 40 - (GRID_SIZE - 1) * 8) / GRID_SIZE

// Her hücre için ayrı shared value kullanamayız (hooks kuralı).
// Bunun yerine aktif hücreyi state'te tutup opacities objesini StyleSheet'te hesaplayacağız.

export default function RastgeleFlashTuzagi({
  durationSeconds,
  onComplete,
  onExit,
}: EyeExerciseProps) {
  const { playHit, playMiss, playAppear } = useEyeSoundFeedback()
  const startTime = useRef(performance.now())
  const [elapsed, setElapsed] = useState(0)
  const [activeCell, setActiveCell] = useState<number | null>(null)
  const [hits, setHits] = useState(0)
  const [misses, setMisses] = useState(0)
  const reactionTimes = useRef<number[]>([])
  const shownAt = useRef(0)
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const finished = useRef(false)

  // ── Timer ──────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      const e = (performance.now() - startTime.current) / 1000
      setElapsed(e)
      if (e >= durationSeconds && !finished.current) {
        finished.current = true
        clearInterval(interval)
        finishExercise()
      }
    }, 500)
    return () => clearInterval(interval)
  }, [durationSeconds])

  // ── İlk flash ─────────────────────────────────────────────────
  useEffect(() => {
    spawnFlash()
    return () => { if (flashTimer.current) clearTimeout(flashTimer.current) }
  }, [])

  function spawnFlash() {
    if (finished.current) return
    const cell = Math.floor(Math.random() * GRID_SIZE * GRID_SIZE)
    playAppear()
    setActiveCell(cell)
    shownAt.current = performance.now()

    // 350ms görünür → kaçırma
    flashTimer.current = setTimeout(() => {
      setActiveCell(prev => {
        if (prev === cell) {
          setMisses(m => m + 1)
          // küçük gecikme ile yeni flash
          flashTimer.current = setTimeout(spawnFlash, 300)
          return null
        }
        return prev
      })
    }, 350)
  }

  function handleCellPress(index: number) {
    if (finished.current) return
    if (index !== activeCell) {
      setMisses(m => m + 1)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      playMiss()
      return
    }
    const rt = performance.now() - shownAt.current
    reactionTimes.current.push(rt)
    setHits(h => h + 1)
    setActiveCell(null)
    if (flashTimer.current) clearTimeout(flashTimer.current)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    playHit()
    flashTimer.current = setTimeout(spawnFlash, 250)
  }

  const finishExercise = useCallback(() => {
    if (flashTimer.current) clearTimeout(flashTimer.current)
    const rts = reactionTimes.current
    const total = hits + misses
    const avgRt = rts.length ? rts.reduce((a, b) => a + b, 0) / rts.length : 999
    const accuracy = total > 0 ? (hits / total) * 100 : 0
    const speed = Math.max(0, Math.min(100, (1 - avgRt / 350) * 100))

    const metrics: EyeMetrics = {
      reactionTimeMs:        avgRt,
      accuracyPercent:       accuracy,
      trackingErrorPx:       0,
      visualAttentionScore:  accuracy * 0.6 + speed * 0.4,
      saccadicSpeedEstimate: hits / durationSeconds,
      taskCompletionMs:      performance.now() - startTime.current,
      arpContribution:       4,
    }
    onComplete(metrics)
  }, [hits, misses, durationSeconds, onComplete])

  const timeLeft = Math.max(0, durationSeconds - Math.floor(elapsed))

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onExit} style={styles.exitBtn}>
          <Text style={styles.exitText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.timerText}>{timeLeft}sn</Text>
        <Text style={styles.scoreText}>✓ {hits}</Text>
      </View>

      <View style={styles.titleRow}>
        <Text style={styles.title}>Rastgele Flash Tuzağı</Text>
        <Text style={styles.subtitle}>Göz Takibi (Smooth Pursuit) · Hızlı flash!</Text>
      </View>

      {/* 3×3 Grid */}
      <View style={styles.gridArea}>
        <View style={styles.grid}>
          {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => {
            const isActive = i === activeCell
            return (
              <TouchableOpacity
                key={i}
                style={[
                  styles.cell,
                  isActive && styles.cellActive,
                ]}
                onPressIn={() => handleCellPress(i)}
                hitSlop={8}
                activeOpacity={0.6}
              >
                {isActive && (
                  <View style={styles.flashCore} />
                )}
              </TouchableOpacity>
            )
          })}
        </View>
      </View>

      <View style={styles.bottomInfo}>
        <Text style={styles.infoText}>Parlayan bölgeye hızlıca dokun!</Text>
        <Text style={styles.missText}>Kaçırılan: {misses}</Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8,
  },
  exitBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  exitText:  { color: '#fff', fontSize: 16 },
  timerText: { color: '#fff', fontSize: 24, fontWeight: '800' },
  scoreText: { color: ACCENT, fontSize: 18, fontWeight: '700' },

  titleRow:  { alignItems: 'center', marginBottom: 12 },
  title:     { color: '#fff', fontSize: 20, fontWeight: '800' },
  subtitle:  { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 4 },

  gridArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  grid: {
    flexDirection:  'row',
    flexWrap:       'wrap',
    gap:            8,
    width:          CELL_SIZE * GRID_SIZE + 8 * (GRID_SIZE - 1),
  },

  cell: {
    width:           CELL_SIZE,
    height:          CELL_SIZE,
    borderRadius:    16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.10)',
    alignItems:      'center',
    justifyContent:  'center',
  },
  cellActive: {
    backgroundColor: `${ACCENT}33`,
    borderColor:     ACCENT,
    shadowColor:     ACCENT,
    shadowOffset:    { width: 0, height: 0 },
    shadowRadius:    16,
    shadowOpacity:   0.8,
    elevation:       8,
  },
  flashCore: {
    width:           40,
    height:          40,
    borderRadius:    20,
    backgroundColor: ACCENT,
    opacity:         0.9,
  },

  bottomInfo: { alignItems: 'center', paddingBottom: 30, gap: 6 },
  infoText:   { color: 'rgba(255,255,255,0.55)', fontSize: 14 },
  missText:   { color: '#FF6B6B', fontSize: 13 },
})
