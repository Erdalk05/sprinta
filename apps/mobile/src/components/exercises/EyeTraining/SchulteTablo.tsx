/**
 * SchulteTablo — Göz Atlaması (Sakkadik) Egzersizi
 *
 * 5×5 grid, Fisher-Yates karışık 1-25 rakamları.
 * Kullanıcı sırayla 1→25 dokun.
 * Tamamlama süresi ölçülür. max 60sn.
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions, SafeAreaView,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import { useEyeSoundFeedback } from './useEyeSoundFeedback'
import type { EyeExerciseProps, EyeMetrics } from '@sprinta/shared'

const { width: SW } = Dimensions.get('window')
const BG = '#0A0F1F'
const ACCENT = '#1877F2'
const GRID = 5

function shuffleArray(arr: number[]): number[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildShulte(size: number): number[] {
  const nums = Array.from({ length: size * size }, (_, i) => i + 1)
  return shuffleArray(nums)
}

const CELL_SIZE = Math.min((SW - 32 - (GRID - 1) * 6) / GRID, 60)

export default function SchulteTablo({
  durationSeconds,
  onComplete,
  onExit,
}: EyeExerciseProps) {
  const { playHit, playMiss } = useEyeSoundFeedback()
  const startTime = useRef(performance.now())
  const [elapsed, setElapsed] = useState(0)
  const [grid] = useState(() => buildShulte(GRID))
  const [nextTarget, setNextTarget] = useState(1)
  const [hitCells, setHitCells] = useState<Set<number>>(new Set())
  const [mistakes, setMistakes] = useState(0)
  const reactionTimes = useRef<number[]>([])
  const targetShownAt = useRef(performance.now())
  const finished = useRef(false)

  // ── Timer ──────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      const e = (performance.now() - startTime.current) / 1000
      setElapsed(e)
      if (e >= durationSeconds && !finished.current) {
        finished.current = true
        clearInterval(interval)
        finishExercise(false)
      }
    }, 500)
    return () => clearInterval(interval)
  }, [durationSeconds])

  function handleCellPress(value: number) {
    if (finished.current) return
    if (value !== nextTarget) {
      setMistakes(m => m + 1)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      playMiss()
      return
    }

    const rt = performance.now() - targetShownAt.current
    reactionTimes.current.push(rt)
    targetShownAt.current = performance.now()

    const newHit = new Set(hitCells)
    newHit.add(value)
    setHitCells(newHit)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    playHit()

    const newTarget = nextTarget + 1
    setNextTarget(newTarget)

    if (newTarget > GRID * GRID && !finished.current) {
      finished.current = true
      finishExercise(true)
    }
  }

  const finishExercise = useCallback((completed: boolean) => {
    const rts = reactionTimes.current
    const hitCount = completed ? GRID * GRID : reactionTimes.current.length
    const totalCells = GRID * GRID
    const avgRt = rts.length ? rts.reduce((a, b) => a + b, 0) / rts.length : 999
    const accuracy = completed
      ? Math.max(0, 100 - mistakes * 5)
      : (hitCount / totalCells) * 100
    const speed = Math.max(0, Math.min(100, (1 - avgRt / 3000) * 100))

    const metrics: EyeMetrics = {
      reactionTimeMs:        avgRt,
      accuracyPercent:       accuracy,
      trackingErrorPx:       0,
      visualAttentionScore:  accuracy * 0.6 + speed * 0.4,
      saccadicSpeedEstimate: hitCount / (elapsed || 1),
      taskCompletionMs:      performance.now() - startTime.current,
      arpContribution:       5,
    }
    onComplete(metrics)
  }, [mistakes, elapsed, onComplete])

  const timeLeft = Math.max(0, durationSeconds - Math.floor(elapsed))

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onExit} style={styles.exitBtn}>
          <Text style={styles.exitText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.timerText}>{timeLeft}sn</Text>
        <View style={styles.targetChip}>
          <Text style={styles.targetLabel}>Hedef</Text>
          <Text style={styles.targetNum}>{nextTarget}</Text>
        </View>
      </View>

      <View style={styles.titleRow}>
        <Text style={styles.title}>Schulte Tablosu</Text>
        <Text style={styles.subtitle}>Göz Atlaması (Sakkadik) · 1'den {GRID * GRID}'e sırayla</Text>
      </View>

      {/* Grid */}
      <View style={styles.grid}>
        {grid.map((value, idx) => {
          const isHit  = hitCells.has(value)
          const isNext = value === nextTarget
          return (
            <TouchableOpacity
              key={idx}
              style={[
                styles.cell,
                isHit  && styles.cellHit,
                isNext && styles.cellNext,
              ]}
              onPress={() => handleCellPress(value)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.cellText,
                isHit  && styles.cellTextHit,
                isNext && styles.cellTextNext,
              ]}>
                {value}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>

      <View style={styles.bottomInfo}>
        <Text style={styles.infoText}>Hatalı dokunma: {mistakes}</Text>
        <Text style={styles.progressText}>{nextTarget - 1}/{GRID * GRID}</Text>
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

  targetChip: {
    backgroundColor: 'rgba(24,119,242,0.2)',
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6,
    alignItems: 'center',
  },
  targetLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10 },
  targetNum:   { color: ACCENT, fontSize: 22, fontWeight: '900' },

  titleRow: { alignItems: 'center', marginBottom: 20 },
  title:    { color: '#fff', fontSize: 20, fontWeight: '800' },
  subtitle: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 4 },

  grid: {
    flexDirection:  'row',
    flexWrap:       'wrap',
    justifyContent: 'center',
    gap:            6,
    paddingHorizontal: 16,
  },

  cell: {
    width:           CELL_SIZE,
    height:          CELL_SIZE,
    borderRadius:    8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.12)',
    alignItems:      'center',
    justifyContent:  'center',
  },
  cellHit: {
    backgroundColor: 'rgba(34,197,94,0.15)',
    borderColor:     '#22C55E',
  },
  cellNext: {
    backgroundColor: 'rgba(24,119,242,0.25)',
    borderColor:     ACCENT,
    shadowColor:     ACCENT,
    shadowOffset:    { width: 0, height: 0 },
    shadowRadius:    10,
    shadowOpacity:   0.6,
    elevation:       6,
  },
  cellText:     { color: 'rgba(255,255,255,0.65)', fontSize: 18, fontWeight: '700' },
  cellTextHit:  { color: '#22C55E', opacity: 0.5 },
  cellTextNext: { color: '#FFFFFF', fontSize: 22, fontWeight: '900' },

  bottomInfo:   { alignItems: 'center', paddingTop: 16, paddingBottom: 24, gap: 4 },
  infoText:     { color: '#FF6B6B', fontSize: 13 },
  progressText: { color: 'rgba(255,255,255,0.45)', fontSize: 12 },
})
