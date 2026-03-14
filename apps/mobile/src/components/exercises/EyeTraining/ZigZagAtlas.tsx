/**
 * ZigZagAtlas — ZigZag Atlama Parkuru (Göz Atlaması / Sakkadik)
 * Sıra numaralı hedeflere zigzag düzeninde hızla dokun.
 */
import { SafeAreaView } from 'react-native-safe-area-context'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,  Dimensions,
} from 'react-native'
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming, withSequence,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { useEyeSoundFeedback } from './useEyeSoundFeedback'
import type { EyeExerciseProps, EyeMetrics } from '@sprinta/shared'

const { width: SW, height: SH } = Dimensions.get('window')
const ACCENT = '#1877F2'
const CIRCLE_R = 36

// Zigzag düzeni: soldan sağa alternating
const BASE_POSITIONS = [
  { x: SW * 0.22, y: SH * 0.22 },
  { x: SW * 0.72, y: SH * 0.30 },
  { x: SW * 0.22, y: SH * 0.42 },
  { x: SW * 0.72, y: SH * 0.52 },
  { x: SW * 0.22, y: SH * 0.62 },
]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function calcMetrics(
  sequences: number, tapTimes: number[], startMs: number,
): EyeMetrics {
  const avgTap = tapTimes.length > 0
    ? tapTimes.reduce((a, b) => a + b, 0) / tapTimes.length : 999
  const acc = Math.min(100, sequences * 12)
  const speedScore = Math.max(0, 100 - (avgTap - 150) / 6)
  return {
    reactionTimeMs:        Math.round(avgTap),
    accuracyPercent:       Math.round(acc),
    trackingErrorPx:       0,
    visualAttentionScore:  Math.round(acc * 0.6 + speedScore * 0.4),
    saccadicSpeedEstimate: parseFloat((sequences * 5 / ((performance.now() - startMs) / 1000)).toFixed(2)),
    taskCompletionMs:      Math.round(performance.now() - startMs),
    arpContribution:       3,
  }
}

export default function ZigZagAtlas({
  difficulty, durationSeconds, onComplete, onExit,
}: EyeExerciseProps) {
  const [numbers, setNumbers] = useState(() => shuffle([1, 2, 3, 4, 5]))
  const [nextTarget, setNextTarget] = useState(1)
  const [sequences, setSequences] = useState(0)
  const [timeLeft, setTimeLeft] = useState(durationSeconds)
  const [done, setDone] = useState(false)
  const [flashIdx, setFlashIdx] = useState<number | null>(null)

  const { playHit, playMiss, playSuccess } = useEyeSoundFeedback()
  const tapTimes = useRef<number[]>([])
  const lastTapAt = useRef(performance.now())
  const startMs   = useRef(performance.now())

  const scale0 = useSharedValue(1); const scale1 = useSharedValue(1)
  const scale2 = useSharedValue(1); const scale3 = useSharedValue(1)
  const scale4 = useSharedValue(1)
  const scales = [scale0, scale1, scale2, scale3, scale4]

  const anim0 = useAnimatedStyle(() => ({ transform: [{ scale: scale0.value }] }))
  const anim1 = useAnimatedStyle(() => ({ transform: [{ scale: scale1.value }] }))
  const anim2 = useAnimatedStyle(() => ({ transform: [{ scale: scale2.value }] }))
  const anim3 = useAnimatedStyle(() => ({ transform: [{ scale: scale3.value }] }))
  const anim4 = useAnimatedStyle(() => ({ transform: [{ scale: scale4.value }] }))
  const anims = [anim0, anim1, anim2, anim3, anim4]

  // Geri sayım timer
  useEffect(() => {
    if (done) return
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(interval)
          setDone(true)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [done])

  useEffect(() => {
    if (done) {
      const metrics = calcMetrics(sequences, tapTimes.current, startMs.current)
      setTimeout(() => onComplete(metrics), 400)
    }
  }, [done, sequences, onComplete])

  const handleTap = useCallback((idx: number) => {
    if (done) return
    const num = numbers[idx]

    if (num === nextTarget) {
      const rt = performance.now() - lastTapAt.current
      tapTimes.current.push(rt)
      lastTapAt.current = performance.now()

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      playHit()
      scales[idx].value = withSequence(
        withSpring(1.35, { damping: 8 }),
        withTiming(1, { duration: 180 }),
      )
      setFlashIdx(idx)
      setTimeout(() => setFlashIdx(null), 250)

      if (nextTarget === 5) {
        // Sekans tamamlandı
        setSequences(s => s + 1)
        setNextTarget(1)
        setNumbers(shuffle([1, 2, 3, 4, 5]))
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        playSuccess()
      } else {
        setNextTarget(t => t + 1)
      }
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      playMiss()
      scales[idx].value = withSequence(
        withTiming(0.85, { duration: 80 }),
        withTiming(1, { duration: 120 }),
      )
    }
  }, [done, numbers, nextTarget, scales])

  return (
    <SafeAreaView style={s.root}>
      <TouchableOpacity style={s.exitBtn} onPress={onExit}>
        <Text style={s.exitTxt}>✕</Text>
      </TouchableOpacity>

      <Text style={s.title}>ZigZag Atlama</Text>
      <Text style={s.sub}>
        Hedef: <Text style={{ color: ACCENT, fontWeight: '900' }}>{nextTarget}</Text>
        {'  '}·{'  '}⏱ {timeLeft}s{'  '}·{'  '}✅ {sequences} dizi
      </Text>

      <View style={s.arena}>
        {BASE_POSITIONS.map((pos, idx) => {
          const num = numbers[idx]
          const isTarget = num === nextTarget
          const isFlash  = flashIdx === idx
          return (
            <Animated.View
              key={idx}
              style={[
                s.circleWrap,
                { left: pos.x - CIRCLE_R, top: pos.y - CIRCLE_R },
                anims[idx],
              ]}
            >
              <TouchableOpacity
                style={[
                  s.circle,
                  isTarget && s.circleTarget,
                  isFlash  && s.circleFlash,
                ]}
                onPressIn={() => handleTap(idx)}
                hitSlop={10}
                activeOpacity={0.7}
              >
                <Text style={[s.circleNum, isTarget && s.circleNumTarget]}>
                  {num}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )
        })}
      </View>

      <Text style={s.hint}>Sırayla 1 → 2 → 3 → 4 → 5 dokun</Text>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#0A0F1F', alignItems: 'center' },
  exitBtn:{ position: 'absolute', top: 52, right: 20, zIndex: 10, padding: 8 },
  exitTxt:{ color: 'rgba(255,255,255,0.5)', fontSize: 18 },
  title:  { marginTop: 56, fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  sub:    { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 8 },
  arena:  { flex: 1, width: SW, position: 'relative' },
  circleWrap:{ position: 'absolute', width: CIRCLE_R * 2, height: CIRCLE_R * 2 },
  circle: {
    width: CIRCLE_R * 2, height: CIRCLE_R * 2, borderRadius: CIRCLE_R,
    backgroundColor: '#1A2A5E',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  circleTarget:{
    borderColor: ACCENT, borderWidth: 2.5,
    backgroundColor: '#0F1D4E',
    shadowColor: ACCENT, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8, shadowRadius: 14, elevation: 10,
  },
  circleFlash:{ backgroundColor: '#1877F230' },
  circleNum:  { color: 'rgba(255,255,255,0.45)', fontSize: 26, fontWeight: '900' },
  circleNumTarget:{ color: '#FFFFFF' },
  hint:   { fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 32 },
})
