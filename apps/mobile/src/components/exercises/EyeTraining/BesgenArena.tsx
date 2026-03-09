/**
 * BesgenArena — Beşgen Arena (Göz Atlaması / Sakkadik)
 * 5 köşeli beşgen üzerinde zıplayan topu yakala.
 * performance.now() tabanlı reaksiyon ölçümü.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions,
} from 'react-native'
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSequence, withSpring,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { useEyeSoundFeedback } from './useEyeSoundFeedback'
import type { EyeExerciseProps, EyeMetrics } from '@sprinta/shared'

const { width: SW, height: SH } = Dimensions.get('window')
const CX = SW / 2
const CY = SH * 0.38
const RADIUS = Math.min(SW, SH) * 0.28
const BALL_R = 28

// Beşgen köşe noktaları (üstten başla, 72° aralıklar)
const POSITIONS = Array.from({ length: 5 }, (_, i) => {
  const angle = (i * 72 - 90) * (Math.PI / 180)
  return { x: CX + RADIUS * Math.cos(angle), y: CY + RADIUS * Math.sin(angle) }
})

const TOTAL_ROUNDS = 15
const ACCENT = '#1877F2'

function calcMetrics(
  hits: number, misses: number,
  reactionTimes: number[], startMs: number,
): EyeMetrics {
  const total   = hits + misses
  const acc     = total > 0 ? (hits / total) * 100 : 0
  const avgRt   = reactionTimes.length > 0
    ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
    : 999
  const speedScore = Math.max(0, 100 - (avgRt - 200) / 8)
  return {
    reactionTimeMs:        Math.round(avgRt),
    accuracyPercent:       Math.round(acc),
    trackingErrorPx:       0,
    visualAttentionScore:  Math.round(acc * 0.6 + speedScore * 0.4),
    saccadicSpeedEstimate: parseFloat((hits / ((performance.now() - startMs) / 1000)).toFixed(2)),
    taskCompletionMs:      Math.round(performance.now() - startMs),
    arpContribution:       3,
  }
}

export default function BesgenArena({
  difficulty, durationSeconds, onComplete, onExit,
}: EyeExerciseProps) {
  const { playHit, playMiss, playAppear } = useEyeSoundFeedback()
  const delayMs    = [900, 650, 450, 300][difficulty - 1]
  const [current, setCurrent] = useState(0)
  const [next, setNext]       = useState<number | null>(null)
  const [round, setRound]     = useState(0)
  const [hits, setHits]       = useState(0)
  const [misses, setMisses]   = useState(0)
  const [done, setDone]       = useState(false)

  const reactionTimes = useRef<number[]>([])
  const targetShownAt = useRef(0)
  const startMs       = useRef(performance.now())
  const timerRef      = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Animasyon değerleri (5 ayrı — hooks kuralı)
  const scale0 = useSharedValue(1)
  const scale1 = useSharedValue(1)
  const scale2 = useSharedValue(1)
  const scale3 = useSharedValue(1)
  const scale4 = useSharedValue(1)
  const scales = [scale0, scale1, scale2, scale3, scale4]

  const glow0 = useSharedValue(0)
  const glow1 = useSharedValue(0)
  const glow2 = useSharedValue(0)
  const glow3 = useSharedValue(0)
  const glow4 = useSharedValue(0)
  const glows = [glow0, glow1, glow2, glow3, glow4]

  const anim0 = useAnimatedStyle(() => ({ transform: [{ scale: scale0.value }], opacity: 0.4 + glow0.value * 0.6 }))
  const anim1 = useAnimatedStyle(() => ({ transform: [{ scale: scale1.value }], opacity: 0.4 + glow1.value * 0.6 }))
  const anim2 = useAnimatedStyle(() => ({ transform: [{ scale: scale2.value }], opacity: 0.4 + glow2.value * 0.6 }))
  const anim3 = useAnimatedStyle(() => ({ transform: [{ scale: scale3.value }], opacity: 0.4 + glow3.value * 0.6 }))
  const anim4 = useAnimatedStyle(() => ({ transform: [{ scale: scale4.value }], opacity: 0.4 + glow4.value * 0.6 }))
  const anims = [anim0, anim1, anim2, anim3, anim4]

  const showNext = useCallback((prevPos: number) => {
    let newPos: number
    do { newPos = Math.floor(Math.random() * 5) } while (newPos === prevPos)

    glows[newPos].value = withTiming(1, { duration: 150 })
    scales[newPos].value = withSpring(1.3, { damping: 10 })
    targetShownAt.current = performance.now()
    playAppear()
    setNext(newPos)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const finishGame = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setDone(true)
  }, [])

  // İlk tur başlat
  useEffect(() => {
    glows[0].value = withTiming(1, { duration: 200 })
    scales[0].value = withSpring(1.2)
    timerRef.current = setTimeout(() => showNext(0), delayMs)

    const totalTimer = setTimeout(finishGame, durationSeconds * 1000)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      clearTimeout(totalTimer)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleTap = useCallback((idx: number) => {
    if (next === null || done) return

    if (idx === next) {
      const rt = performance.now() - targetShownAt.current
      reactionTimes.current.push(rt)
      setHits(h => h + 1)
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      playHit()

      // Animasyon: vuruldu
      glows[idx].value = withSequence(
        withTiming(1, { duration: 50 }),
        withTiming(0, { duration: 200 }),
      )
      scales[idx].value = withSequence(
        withSpring(1.5, { damping: 8 }),
        withTiming(1, { duration: 200 }),
      )

      const newRound = round + 1
      setRound(newRound)
      setNext(null)
      setCurrent(idx)

      if (newRound >= TOTAL_ROUNDS) {
        finishGame()
      } else {
        timerRef.current = setTimeout(() => showNext(idx), 300)
      }
    } else {
      setMisses(m => m + 1)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      playMiss()
      scales[idx].value = withSequence(
        withTiming(0.85, { duration: 80 }),
        withTiming(1, { duration: 120 }),
      )
    }
  }, [next, done, round, finishGame, showNext, scales, glows])

  useEffect(() => {
    if (done) {
      const metrics = calcMetrics(hits, misses, reactionTimes.current, startMs.current)
      setTimeout(() => onComplete(metrics), 400)
    }
  }, [done, hits, misses, onComplete])

  return (
    <SafeAreaView style={s.root}>
      <TouchableOpacity style={s.exitBtn} onPress={onExit}>
        <Text style={s.exitTxt}>✕</Text>
      </TouchableOpacity>

      <Text style={s.title}>Beşgen Arena</Text>
      <Text style={s.sub}>Parlayan köşeye dokun</Text>

      <View style={s.stats}>
        <Text style={s.stat}>✅ {hits}</Text>
        <Text style={s.statDivider}>|</Text>
        <Text style={s.statRound}>{round}/{TOTAL_ROUNDS}</Text>
        <Text style={s.statDivider}>|</Text>
        <Text style={s.statMiss}>❌ {misses}</Text>
      </View>

      {/* Beşgen köşeleri */}
      <View style={s.arena}>
        {POSITIONS.map((pos, idx) => (
          <Animated.View
            key={idx}
            style={[
              s.ballWrap,
              { left: pos.x - BALL_R, top: pos.y - BALL_R },
              anims[idx],
              next === idx && s.ballActive,
            ]}
          >
            <TouchableOpacity
              style={s.ball}
              onPress={() => handleTap(idx)}
              activeOpacity={0.7}
            >
              <Text style={s.ballTxt}>{idx + 1}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}

        {/* Bağlantı çizgileri (dekoratif) */}
        {done && (
          <View style={s.doneOverlay}>
            <Text style={s.doneTxt}>🎯</Text>
          </View>
        )}
      </View>

      <Text style={s.hint}>Altın renkli köşeye hızlıca dokun</Text>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#0A0F1F', alignItems: 'center' },
  exitBtn:{ position: 'absolute', top: 52, right: 20, zIndex: 10, padding: 8 },
  exitTxt:{ color: 'rgba(255,255,255,0.5)', fontSize: 18 },
  title:  { marginTop: 56, fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  sub:    { fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 4 },
  stats:  { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16 },
  stat:   { fontSize: 16, fontWeight: '700', color: '#4ADE80' },
  statMiss:{ fontSize: 16, fontWeight: '700', color: '#F87171' },
  statRound:{ fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  statDivider:{ color: 'rgba(255,255,255,0.3)', fontSize: 16 },
  arena:  { flex: 1, width: SW, position: 'relative' },
  ballWrap:{
    position: 'absolute',
    width: BALL_R * 2, height: BALL_R * 2,
  },
  ball:   {
    width: BALL_R * 2, height: BALL_R * 2,
    borderRadius: BALL_R,
    backgroundColor: '#1A2A5E',
    borderWidth: 2, borderColor: ACCENT,
    alignItems: 'center', justifyContent: 'center',
  },
  ballActive: {
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9, shadowRadius: 16, elevation: 12,
  },
  ballTxt:{ color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  doneOverlay:{ ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  doneTxt:{ fontSize: 64 },
  hint:   { fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 32 },
})
