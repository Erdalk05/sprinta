/**
 * CaprazLazerKosusu — Göz Atlaması (Sakkadik) Egzersizi
 *
 * 4 köşe rotasyonu → 8 köşe → 12 köşe
 * Her köşede aktif nokta belirir, kullanıcı sırayla dokunur.
 */
import { SafeAreaView } from 'react-native-safe-area-context'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions, 
} from 'react-native'
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import type { EyeExerciseProps, EyeMetrics } from '@sprinta/shared'

const { width: SW, height: SH } = Dimensions.get('window')
const BG = '#0A0F1F'
const DOT_COLOR = '#1877F2'
const DOT_SIZE = 44

// 12 köşe koordinatları (merkeze göre yüzde)
function getPositions(count: 4 | 8 | 12): Array<{ x: number; y: number }> {
  if (count === 4) {
    return [
      { x: 0.15, y: 0.15 }, { x: 0.85, y: 0.15 },
      { x: 0.85, y: 0.85 }, { x: 0.15, y: 0.85 },
    ]
  }
  if (count === 8) {
    return [
      { x: 0.15, y: 0.15 }, { x: 0.50, y: 0.08 }, { x: 0.85, y: 0.15 },
      { x: 0.92, y: 0.50 }, { x: 0.85, y: 0.85 }, { x: 0.50, y: 0.92 },
      { x: 0.15, y: 0.85 }, { x: 0.08, y: 0.50 },
    ]
  }
  return [
    { x: 0.15, y: 0.15 }, { x: 0.50, y: 0.05 }, { x: 0.85, y: 0.15 },
    { x: 0.95, y: 0.38 }, { x: 0.95, y: 0.62 }, { x: 0.85, y: 0.85 },
    { x: 0.50, y: 0.95 }, { x: 0.15, y: 0.85 }, { x: 0.05, y: 0.62 },
    { x: 0.05, y: 0.38 }, { x: 0.30, y: 0.50 }, { x: 0.70, y: 0.50 },
  ]
}

function getPointCount(elapsed: number): 4 | 8 | 12 {
  if (elapsed < 10) return 4
  if (elapsed < 20) return 8
  return 12
}

const AREA_W = SW - 32
const AREA_H = SH * 0.55

export default function CaprazLazerKosusu({
  durationSeconds,
  onComplete,
  onExit,
}: EyeExerciseProps) {
  const startTime = useRef(performance.now())
  const [elapsed, setElapsed] = useState(0)
  const [pointCount, setPointCount] = useState<4 | 8 | 12>(4)
  const [activeIndex, setActiveIndex] = useState(0)
  const [hits, setHits] = useState(0)
  const [misses, setMisses] = useState(0)
  const reactionTimes = useRef<number[]>([])
  const shownAt = useRef(performance.now())
  const finished = useRef(false)

  const positions = getPositions(pointCount)

  // ── Timer ──────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      const e = (performance.now() - startTime.current) / 1000
      setElapsed(e)
      const pc = getPointCount(e) as 4 | 8 | 12
      setPointCount(pc)
      if (e >= durationSeconds && !finished.current) {
        finished.current = true
        clearInterval(interval)
        finishExercise()
      }
    }, 500)
    return () => clearInterval(interval)
  }, [durationSeconds])

  // Zaman aşımı: 1.5sn içinde dokunulmadıysa miss + ilerle
  useEffect(() => {
    shownAt.current = performance.now()
    const timeout = setTimeout(() => {
      if (!finished.current) {
        setMisses(m => m + 1)
        advance()
      }
    }, 1500)
    return () => clearTimeout(timeout)
  }, [activeIndex, pointCount])

  function advance() {
    setActiveIndex(prev => (prev + 1) % positions.length)
    shownAt.current = performance.now()
  }

  function handleDotPress(index: number) {
    if (index !== activeIndex) {
      setMisses(m => m + 1)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      return
    }
    const rt = performance.now() - shownAt.current
    reactionTimes.current.push(rt)
    setHits(h => h + 1)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    advance()
  }

  const finishExercise = useCallback(() => {
    const rts = reactionTimes.current
    const total = hits + misses
    const avgRt = rts.length ? rts.reduce((a, b) => a + b, 0) / rts.length : 999
    const accuracy = total > 0 ? (hits / total) * 100 : 0
    const speed = Math.max(0, Math.min(100, (1 - avgRt / 1500) * 100))

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
        <Text style={styles.title}>Çapraz Lazer Koşusu</Text>
        <Text style={styles.subtitle}>Göz Atlaması (Sakkadik) · {pointCount} köşe</Text>
      </View>

      {/* Alan */}
      <View style={styles.area}>
        {positions.map((pos, i) => {
          const isActive = i === activeIndex
          return (
            <TouchableOpacity
              key={`${pointCount}-${i}`}
              style={[
                styles.dot,
                {
                  left: pos.x * AREA_W - DOT_SIZE / 2,
                  top:  pos.y * AREA_H - DOT_SIZE / 2,
                  backgroundColor: isActive ? DOT_COLOR : 'rgba(255,255,255,0.08)',
                  borderColor:     isActive ? DOT_COLOR : 'rgba(255,255,255,0.15)',
                  shadowOpacity:   isActive ? 0.7 : 0,
                },
              ]}
              onPressIn={() => handleDotPress(i)}
              hitSlop={12}
              activeOpacity={0.7}
            >
              {isActive && <Text style={styles.dotLabel}>{i + 1}</Text>}
            </TouchableOpacity>
          )
        })}
      </View>

      <View style={styles.bottomInfo}>
        <Text style={styles.infoText}>Parlayan noktaya sırayla dokun!</Text>
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
  scoreText: { color: DOT_COLOR, fontSize: 18, fontWeight: '700' },

  titleRow: { alignItems: 'center', marginBottom: 12 },
  title:    { color: '#fff', fontSize: 20, fontWeight: '800' },
  subtitle: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 4 },

  area: {
    width:    AREA_W,
    height:   AREA_H,
    alignSelf: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
  },

  dot: {
    position:   'absolute',
    width:      DOT_SIZE,
    height:     DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: DOT_COLOR,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 12,
    elevation:   8,
  },
  dotLabel: { color: '#fff', fontSize: 14, fontWeight: '800' },

  bottomInfo: { alignItems: 'center', paddingTop: 16, paddingBottom: 24 },
  infoText:   { color: 'rgba(255,255,255,0.55)', fontSize: 14 },
})
