/**
 * DikeyNabizTakibi — Göz Atlaması (Sakkadik) Egzersizi
 *
 * 2 nokta: üst / alt — ping-pong hareketi
 * Aktif noktaya dokun. withSpring animasyonu.
 */
import { SafeAreaView } from 'react-native-safe-area-context'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions, 
} from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import type { EyeExerciseProps, EyeMetrics } from '@sprinta/shared'

const { height: SH } = Dimensions.get('window')
const BG = '#0A0F1F'
const DOT_COLOR = '#1877F2'
const DOT_SIZE = 56

export default function DikeyNabizTakibi({
  durationSeconds,
  onComplete,
  onExit,
}: EyeExerciseProps) {
  const startTime = useRef(performance.now())
  const [elapsed, setElapsed] = useState(0)
  const [activePos, setActivePos] = useState<'top' | 'bottom'>('top')
  const [hits, setHits] = useState(0)
  const [misses, setMisses] = useState(0)
  const reactionTimes = useRef<number[]>([])
  const shownAt = useRef(performance.now())
  const switchInterval = useRef<ReturnType<typeof setInterval> | null>(null)
  const finished = useRef(false)

  // Animasyon: Y pozisyonu (0 = üst, 1 = alt)
  const dotY = useSharedValue(0)
  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: dotY.value }],
  }))

  const TRAVEL = SH * 0.35

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

  // ── Ping-pong ─────────────────────────────────────────────────
  useEffect(() => {
    shownAt.current = performance.now()
    switchInterval.current = setInterval(() => {
      setActivePos(prev => {
        const next = prev === 'top' ? 'bottom' : 'top'
        dotY.value = withSpring(next === 'bottom' ? TRAVEL : 0, {
          damping: 18, stiffness: 200,
        })
        shownAt.current = performance.now()
        return next
      })
      setMisses(m => m + 1) // geçerli pozisyona dokunulmadıysa miss
    }, 1200)
    return () => { if (switchInterval.current) clearInterval(switchInterval.current) }
  }, [])

  function handleDotPress() {
    const rt = performance.now() - shownAt.current
    reactionTimes.current.push(rt)
    setHits(h => h + 1)
    setMisses(m => Math.max(0, m - 1)) // interval miss'i iptal et
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
  }

  const finishExercise = useCallback(() => {
    if (switchInterval.current) clearInterval(switchInterval.current)
    const rts = reactionTimes.current
    const total = hits + misses
    const avgRt = rts.length ? rts.reduce((a, b) => a + b, 0) / rts.length : 999
    const accuracy = total > 0 ? (hits / total) * 100 : 0
    const speedFactor = Math.max(0, Math.min(100, (1 - avgRt / 1200) * 100))

    const metrics: EyeMetrics = {
      reactionTimeMs:        avgRt,
      accuracyPercent:       accuracy,
      trackingErrorPx:       0,
      visualAttentionScore:  accuracy * 0.6 + speedFactor * 0.4,
      saccadicSpeedEstimate: hits / durationSeconds,
      taskCompletionMs:      performance.now() - startTime.current,
      arpContribution:       3,
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
        <Text style={styles.title}>Dikey Nabız Takibi</Text>
        <Text style={styles.subtitle}>Göz Atlaması (Sakkadik) · Üst-Alt Ping-Pong</Text>
      </View>

      {/* Merkez alan: üst nokta + hareketli nokta + alt nokta */}
      <View style={styles.trackArea}>
        {/* Üst sabit marker */}
        <View style={styles.markerTop}>
          <View style={styles.markerLine} />
          <Text style={styles.markerLabel}>ÜST</Text>
        </View>

        {/* Hareketli nokta */}
        <Animated.View style={[styles.dotWrap, dotStyle]}>
          <TouchableOpacity
            style={styles.dot}
            onPressIn={handleDotPress}
            hitSlop={16}
            activeOpacity={0.7}
          />
        </Animated.View>

        {/* Alt sabit marker */}
        <View style={[styles.markerTop, { top: undefined, bottom: 20 }]}>
          <Text style={styles.markerLabel}>ALT</Text>
          <View style={styles.markerLine} />
        </View>
      </View>

      <View style={styles.bottomInfo}>
        <Text style={styles.infoText}>Mavi noktaya her geçişte dokun!</Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: BG },
  topBar:  {
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
  scoreText: { color: DOT_COLOR, fontSize: 18, fontWeight: '700' },

  titleRow: { alignItems: 'center', marginBottom: 12 },
  title:    { color: '#fff', fontSize: 20, fontWeight: '800' },
  subtitle: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 4 },

  trackArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 40,
    position: 'relative',
  },

  markerTop: {
    position:  'absolute',
    top:       20,
    alignItems: 'center',
    gap:       4,
  },
  markerLine: {
    width: 40, height: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 2,
  },
  markerLabel: {
    color:    'rgba(255,255,255,0.35)',
    fontSize: 10,
    letterSpacing: 1,
  },

  dotWrap: { position: 'absolute', top: 20 },
  dot: {
    width:           DOT_SIZE,
    height:          DOT_SIZE,
    borderRadius:    DOT_SIZE / 2,
    backgroundColor: DOT_COLOR,
    shadowColor:     DOT_COLOR,
    shadowOffset:    { width: 0, height: 0 },
    shadowRadius:    16,
    shadowOpacity:   0.8,
    elevation:       10,
  },

  bottomInfo:  { alignItems: 'center', paddingBottom: 30 },
  infoText:    { color: 'rgba(255,255,255,0.55)', fontSize: 14 },
})
