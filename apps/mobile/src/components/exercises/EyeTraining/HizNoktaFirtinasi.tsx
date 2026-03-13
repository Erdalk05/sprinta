/**
 * HizNoktaFirtinasi — Çevresel Görüş (Periferik) Egzersizi
 *
 * Random pozisyonlarda beliren noktalara hızla dokun.
 * withTiming opacity animasyonu, kısa görünme süresi.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions, SafeAreaView,
} from 'react-native'
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSequence,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import type { EyeExerciseProps, EyeMetrics } from '@sprinta/shared'

const { width: SW, height: SH } = Dimensions.get('window')
const BG = '#0A0F1F'
const ACCENT = '#00B890'
const DOT_SIZE = 52

const AREA_W = SW - 48
const AREA_H = SH * 0.50

interface DotState {
  x: number
  y: number
  id: number
}

export default function HizNoktaFirtinasi({
  durationSeconds,
  onComplete,
  onExit,
}: EyeExerciseProps) {
  const startTime = useRef(performance.now())
  const [elapsed, setElapsed] = useState(0)
  const [dot, setDot] = useState<DotState | null>(null)
  const [hits, setHits] = useState(0)
  const [misses, setMisses] = useState(0)
  const reactionTimes = useRef<number[]>([])
  const shownAt = useRef(0)
  const dotIdCounter = useRef(0)
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const finished = useRef(false)

  const dotOpacity = useSharedValue(0)
  const dotStyle = useAnimatedStyle(() => ({ opacity: dotOpacity.value }))

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

  // ── İlk nokta ─────────────────────────────────────────────────
  useEffect(() => {
    spawnDot()
    return () => { if (flashTimer.current) clearTimeout(flashTimer.current) }
  }, [])

  function spawnDot() {
    if (finished.current) return
    const x = DOT_SIZE / 2 + Math.random() * (AREA_W - DOT_SIZE)
    const y = DOT_SIZE / 2 + Math.random() * (AREA_H - DOT_SIZE)
    const id = ++dotIdCounter.current
    setDot({ x, y, id })
    shownAt.current = performance.now()

    // withTiming flash
    dotOpacity.value = 0
    dotOpacity.value = withSequence(
      withTiming(1, { duration: 80 }),
      withTiming(1, { duration: 550 }),
      withTiming(0, { duration: 100 }),
    )

    // Kaçırma süresi: 730ms
    flashTimer.current = setTimeout(() => {
      setDot(prev => {
        if (prev?.id === id) {
          setMisses(m => m + 1)
          spawnDot()
          return null
        }
        return prev
      })
    }, 730)
  }

  function handleDotPress(id: number) {
    if (finished.current) return
    const rt = performance.now() - shownAt.current
    reactionTimes.current.push(rt)
    setHits(h => h + 1)
    setDot(null)
    if (flashTimer.current) clearTimeout(flashTimer.current)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    spawnDot()
  }

  const finishExercise = useCallback(() => {
    if (flashTimer.current) clearTimeout(flashTimer.current)
    const rts = reactionTimes.current
    const total = hits + misses
    const avgRt = rts.length ? rts.reduce((a, b) => a + b, 0) / rts.length : 999
    const accuracy = total > 0 ? (hits / total) * 100 : 0
    const speed = Math.max(0, Math.min(100, (1 - avgRt / 730) * 100))

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
        <Text style={styles.title}>Hız Nokta Fırtınası</Text>
        <Text style={styles.subtitle}>Çevresel Görüş (Periferik) · Hızlı dokunma!</Text>
      </View>

      {/* Nokta alanı */}
      <View style={styles.area}>
        {dot && (
          <Animated.View
            style={[
              styles.dot,
              { left: dot.x - DOT_SIZE / 2, top: dot.y - DOT_SIZE / 2 },
              dotStyle,
            ]}
          >
            <TouchableOpacity
              style={styles.dotInner}
              onPressIn={() => handleDotPress(dot.id)}
              hitSlop={14}
              activeOpacity={0.7}
            />
          </Animated.View>
        )}
      </View>

      <View style={styles.bottomInfo}>
        <Text style={styles.infoText}>Beliren yeşil noktaya hızla dokun!</Text>
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

  area: {
    width:    AREA_W,
    height:   AREA_H,
    alignSelf: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    overflow: 'hidden',
  },

  dot: {
    position:   'absolute',
    width:      DOT_SIZE,
    height:     DOT_SIZE,
  },
  dotInner: {
    width:           DOT_SIZE,
    height:          DOT_SIZE,
    borderRadius:    DOT_SIZE / 2,
    backgroundColor: ACCENT,
    shadowColor:     ACCENT,
    shadowOffset:    { width: 0, height: 0 },
    shadowRadius:    14,
    shadowOpacity:   0.8,
    elevation:       8,
  },

  bottomInfo: { alignItems: 'center', paddingTop: 16, paddingBottom: 24, gap: 6 },
  infoText:   { color: 'rgba(255,255,255,0.55)', fontSize: 14 },
  missText:   { color: '#FF6B6B', fontSize: 13 },
})
