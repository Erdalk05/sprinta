/**
 * PinballGoz — Pinball Göz Antrenmanı (Göz Takibi / Smooth Pursuit)
 * Zıplayan topu takip et, parlayan bölgeye dokun.
 */
import { SafeAreaView } from 'react-native-safe-area-context'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,  Dimensions, Animated,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import { useEyeSoundFeedback } from './useEyeSoundFeedback'
import type { EyeExerciseProps, EyeMetrics } from '@sprinta/shared'

const { width: SW, height: SH } = Dimensions.get('window')
const ARENA_W = SW - 32
const ARENA_H = SH * 0.52
const BALL_R  = 16
const ZONE_R  = 38
const ACCENT  = '#6366F1'

// 5 bölge: 4 köşe + merkez
const ZONES = [
  { id: 0, x: 40,            y: 40 },
  { id: 1, x: ARENA_W - 40,  y: 40 },
  { id: 2, x: ARENA_W / 2,   y: ARENA_H / 2 },
  { id: 3, x: 40,            y: ARENA_H - 40 },
  { id: 4, x: ARENA_W - 40,  y: ARENA_H - 40 },
]

function calcMetrics(
  hits: number, misses: number, reactionTimes: number[], startMs: number,
): EyeMetrics {
  const total  = hits + misses
  const acc    = total > 0 ? (hits / total) * 100 : 0
  const avgRt  = reactionTimes.length > 0
    ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length : 999
  const speedScore = Math.max(0, 100 - (avgRt - 150) / 6)
  return {
    reactionTimeMs:        Math.round(avgRt),
    accuracyPercent:       Math.round(acc),
    trackingErrorPx:       0,
    visualAttentionScore:  Math.round(acc * 0.6 + speedScore * 0.4),
    saccadicSpeedEstimate: parseFloat((hits / Math.max((performance.now() - startMs) / 1000, 1)).toFixed(2)),
    taskCompletionMs:      Math.round(performance.now() - startMs),
    arpContribution:       4,
  }
}

export default function PinballGoz({
  difficulty, durationSeconds, onComplete, onExit,
}: EyeExerciseProps) {
  const zoneDuration = [700, 550, 420, 320][difficulty - 1]

  const [timeLeft, setTimeLeft] = useState(durationSeconds)
  const [done, setDone]         = useState(false)
  const [score, setScore]       = useState(0)
  const [activeZone, setActiveZone] = useState<number | null>(null)

  const ballX    = useRef(new Animated.Value(ARENA_W / 2)).current
  const ballY    = useRef(new Animated.Value(ARENA_H / 2)).current
  const vx       = useRef(3.5)
  const vy       = useRef(2.8)
  const bx       = useRef(ARENA_W / 2)
  const by       = useRef(ARENA_H / 2)
  const frameRef = useRef<number | null>(null)
  const zoneTimer= useRef<ReturnType<typeof setTimeout> | null>(null)

  const { playHit, playAppear } = useEyeSoundFeedback()
  const hits         = useRef(0)
  const misses       = useRef(0)
  const reactionTimes= useRef<number[]>([])
  const zoneShownAt  = useRef(0)
  const startMs      = useRef(performance.now())

  // Timer countdown
  useEffect(() => {
    if (done) return
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(interval); setDone(true); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [done])

  // Ball physics loop
  const tick = useCallback(() => {
    if (done) return
    const speed = 1 + (durationSeconds - timeLeft) / durationSeconds * 0.5
    bx.current += vx.current * speed
    by.current += vy.current * speed

    if (bx.current <= BALL_R || bx.current >= ARENA_W - BALL_R) vx.current *= -1
    if (by.current <= BALL_R || by.current >= ARENA_H - BALL_R) vy.current *= -1

    bx.current = Math.max(BALL_R, Math.min(ARENA_W - BALL_R, bx.current))
    by.current = Math.max(BALL_R, Math.min(ARENA_H - BALL_R, by.current))

    ballX.setValue(bx.current - BALL_R)
    ballY.setValue(by.current - BALL_R)

    // Bölge aktivasyonu kontrolü
    if (activeZone === null) {
      for (const z of ZONES) {
        const dist = Math.hypot(bx.current - z.x, by.current - z.y)
        if (dist < ZONE_R + BALL_R + 10) {
          playAppear()
          setActiveZone(z.id)
          zoneShownAt.current = performance.now()
          if (zoneTimer.current) clearTimeout(zoneTimer.current)
          zoneTimer.current = setTimeout(() => {
            setActiveZone(prev => {
              if (prev === z.id) {
                misses.current++
                return null
              }
              return prev
            })
          }, zoneDuration)
          break
        }
      }
    }

    frameRef.current = requestAnimationFrame(tick)
  }, [ballX, ballY, activeZone, done, zoneDuration, durationSeconds, timeLeft])

  useEffect(() => {
    frameRef.current = requestAnimationFrame(tick)
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current) }
  }, [tick])

  useEffect(() => {
    if (done) {
      if (zoneTimer.current) clearTimeout(zoneTimer.current)
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
      const metrics = calcMetrics(hits.current, misses.current, reactionTimes.current, startMs.current)
      setTimeout(() => onComplete(metrics), 400)
    }
  }, [done, onComplete])

  const handleZoneTap = useCallback((zoneId: number) => {
    if (done || activeZone !== zoneId) return
    const rt = performance.now() - zoneShownAt.current
    reactionTimes.current.push(rt)
    hits.current++
    setScore(s => s + 1)
    setActiveZone(null)
    if (zoneTimer.current) clearTimeout(zoneTimer.current)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    playHit()
  }, [done, activeZone, playHit, playAppear])

  return (
    <SafeAreaView style={s.root}>
      <TouchableOpacity style={s.exitBtn} onPress={onExit}>
        <Text style={s.exitTxt}>✕</Text>
      </TouchableOpacity>

      <Text style={s.title}>Pinball Göz</Text>
      <View style={s.statsRow}>
        <Text style={s.statScore}>🎯 {score}</Text>
        <Text style={s.statTime}>⏱ {timeLeft}s</Text>
      </View>

      {/* Arena */}
      <View style={s.arena} pointerEvents="box-none">
        {/* Bölgeler */}
        {ZONES.map(z => (
          <TouchableOpacity
            key={z.id}
            style={[
              s.zone,
              { left: z.x - ZONE_R, top: z.y - ZONE_R },
              activeZone === z.id && s.zoneActive,
            ]}
            onPressIn={() => handleZoneTap(z.id)}
            hitSlop={12}
            activeOpacity={0.7}
          >
            <Text style={s.zoneTxt}>{activeZone === z.id ? '●' : '○'}</Text>
          </TouchableOpacity>
        ))}

        {/* Top */}
        <Animated.View
          style={[
            s.ball,
            { transform: [{ translateX: ballX }, { translateY: ballY }] },
          ]}
        />
      </View>

      <Text style={s.hint}>Parlayan bölgeye hızlıca dokun!</Text>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#0A0F1F', alignItems: 'center' },
  exitBtn:{ position: 'absolute', top: 52, right: 20, zIndex: 10, padding: 8 },
  exitTxt:{ color: 'rgba(255,255,255,0.5)', fontSize: 18 },
  title:  { marginTop: 56, fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  statsRow:{ flexDirection: 'row', gap: 32, marginTop: 8, marginBottom: 12 },
  statScore:{ fontSize: 18, fontWeight: '700', color: '#FFD700' },
  statTime:{ fontSize: 18, fontWeight: '700', color: ACCENT },
  arena: {
    width: ARENA_W, height: ARENA_H,
    backgroundColor: '#0F1530',
    borderRadius: 20, borderWidth: 2, borderColor: 'rgba(99,102,241,0.3)',
    position: 'relative', overflow: 'hidden',
  },
  zone: {
    position: 'absolute',
    width: ZONE_R * 2, height: ZONE_R * 2, borderRadius: ZONE_R,
    backgroundColor: 'rgba(99,102,241,0.1)',
    borderWidth: 2, borderColor: 'rgba(99,102,241,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  zoneActive:{
    backgroundColor: 'rgba(99,102,241,0.3)',
    borderColor: ACCENT,
    shadowColor: ACCENT, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9, shadowRadius: 14, elevation: 8,
  },
  zoneTxt:{ color: ACCENT, fontSize: 18, fontWeight: '900' },
  ball: {
    position: 'absolute',
    width: BALL_R * 2, height: BALL_R * 2, borderRadius: BALL_R,
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFFFFF', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8, shadowRadius: 8, elevation: 6,
  },
  hint:   { fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 16, marginBottom: 32 },
})
