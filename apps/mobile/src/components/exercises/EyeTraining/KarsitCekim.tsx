/**
 * KarsitCekim — Göz Takibi (Smooth Pursuit) Egzersizi
 *
 * 2 zıt yönde hareket eden nokta.
 * Kırmızı renge döndüğünde dokun.
 */
import { SafeAreaView } from 'react-native-safe-area-context'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions, 
} from 'react-native'
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import type { EyeExerciseProps, EyeMetrics } from '@sprinta/shared'

const { width: SW, height: SH } = Dimensions.get('window')
const BG = '#0A0F1F'
const ACCENT = '#FF9F1C'   // Takip rengi
const RED_COLOR = '#EF4444'
const BLUE_COLOR = '#3B82F6'
const DOT_SIZE = 44
const AREA_W = SW - 40

export default function KarsitCekim({
  durationSeconds,
  onComplete,
  onExit,
}: EyeExerciseProps) {
  const startTime = useRef(performance.now())
  const [elapsed, setElapsed] = useState(0)
  const [redDot, setRedDot] = useState<'dot1' | 'dot2' | null>(null)
  const [hits, setHits] = useState(0)
  const [misses, setMisses] = useState(0)
  const reactionTimes = useRef<number[]>([])
  const redShownAt = useRef(0)
  const redTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const redCycleTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const finished = useRef(false)

  // Nokta 1: soldan sağa
  const dot1X = useSharedValue(0)
  // Nokta 2: sağdan sola (ters)
  const dot2X = useSharedValue(AREA_W - DOT_SIZE)

  const dot1Style = useAnimatedStyle(() => ({ transform: [{ translateX: dot1X.value }] }))
  const dot2Style = useAnimatedStyle(() => ({ transform: [{ translateX: dot2X.value }] }))

  const [dot1Red, setDot1Red] = useState(false)
  const [dot2Red, setDot2Red] = useState(false)

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

  // ── Hareket animasyonu ─────────────────────────────────────────
  useEffect(() => {
    const SPEED = 1600   // ms
    dot1X.value = withRepeat(
      withTiming(AREA_W - DOT_SIZE, { duration: SPEED, easing: Easing.linear }),
      -1, true
    )
    dot2X.value = withRepeat(
      withTiming(0, { duration: SPEED, easing: Easing.linear }),
      -1, true
    )
  }, [])

  // ── Kırmızı flash döngüsü ──────────────────────────────────────
  useEffect(() => {
    const scheduleRed = () => {
      const delay = 2000 + Math.random() * 2000
      redTimer.current = setTimeout(() => {
        if (finished.current) return
        const which = Math.random() > 0.5 ? 'dot1' : 'dot2'
        setRedDot(which)
        if (which === 'dot1') setDot1Red(true)
        else setDot2Red(true)
        redShownAt.current = performance.now()

        // 800ms kırmızı kalır
        setTimeout(() => {
          if (finished.current) return
          setRedDot(prev => {
            if (prev === which) {
              setMisses(m => m + 1)  // dokunulmadı → miss
              return null
            }
            return prev
          })
          setDot1Red(false)
          setDot2Red(false)
          scheduleRed()
        }, 800)
      }, delay)
    }

    scheduleRed()
    return () => {
      if (redTimer.current) clearTimeout(redTimer.current)
    }
  }, [])

  function handleDotPress(which: 'dot1' | 'dot2') {
    if (finished.current) return
    if (redDot === which) {
      const rt = performance.now() - redShownAt.current
      reactionTimes.current.push(rt)
      setHits(h => h + 1)
      setRedDot(null)
      setDot1Red(false)
      setDot2Red(false)
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    } else {
      setMisses(m => m + 1)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }
  }

  const finishExercise = useCallback(() => {
    if (redTimer.current) clearTimeout(redTimer.current)
    const rts = reactionTimes.current
    const total = hits + misses
    const avgRt = rts.length ? rts.reduce((a, b) => a + b, 0) / rts.length : 999
    const accuracy = total > 0 ? (hits / total) * 100 : 0
    const speed = Math.max(0, Math.min(100, (1 - avgRt / 800) * 100))

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
        <Text style={styles.title}>Karşıt Çekim</Text>
        <Text style={styles.subtitle}>Göz Takibi (Smooth Pursuit) · Kırmızıya dokun!</Text>
      </View>

      {/* Hareket alanı */}
      <View style={styles.trackArea}>
        {/* Üst ray: dot1 soldan sağa */}
        <View style={styles.track}>
          <View style={styles.trackLine} />
          <Animated.View style={[styles.dotWrap, dot1Style]}>
            <TouchableOpacity
              style={[styles.dot, { backgroundColor: dot1Red ? RED_COLOR : BLUE_COLOR }]}
              onPressIn={() => handleDotPress('dot1')}
              hitSlop={16}
              activeOpacity={0.7}
            />
          </Animated.View>
        </View>

        {/* Orta bilgi */}
        <View style={styles.centerInfo}>
          <Text style={styles.centerText}>⟵ ⟶</Text>
          <Text style={styles.centerLabel}>Kırmızı olan noktaya dokun</Text>
        </View>

        {/* Alt ray: dot2 sağdan sola */}
        <View style={styles.track}>
          <View style={styles.trackLine} />
          <Animated.View style={[styles.dotWrap, dot2Style]}>
            <TouchableOpacity
              style={[styles.dot, { backgroundColor: dot2Red ? RED_COLOR : ACCENT }]}
              onPressIn={() => handleDotPress('dot2')}
              hitSlop={16}
              activeOpacity={0.7}
            />
          </Animated.View>
        </View>
      </View>

      <View style={styles.bottomInfo}>
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

  trackArea: {
    flex: 1,
    justifyContent: 'space-evenly',
    paddingHorizontal: 20,
    paddingVertical:  40,
  },

  track: {
    height:   DOT_SIZE + 8,
    position: 'relative',
    width:    AREA_W,
    justifyContent: 'center',
  },
  trackLine: {
    position:        'absolute',
    left:            0,
    right:           0,
    height:          2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius:    1,
  },
  dotWrap: { position: 'absolute' },
  dot: {
    width:       DOT_SIZE,
    height:      DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 12,
    shadowOpacity: 0.7,
    elevation:    6,
  },

  centerInfo: { alignItems: 'center', gap: 4 },
  centerText:  { color: 'rgba(255,255,255,0.15)', fontSize: 32 },
  centerLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 13 },

  bottomInfo: { alignItems: 'center', paddingBottom: 30 },
  missText:   { color: '#FF6B6B', fontSize: 13 },
})
