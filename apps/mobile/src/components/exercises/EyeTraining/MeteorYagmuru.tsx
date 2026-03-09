/**
 * MeteorYagmuru — Meteor Yağmuru (Çevresel Görüş / Periferik)
 * Düşen altın meteorları yakala, kırmızılardan kaç.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, Animated,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import { useEyeSoundFeedback } from './useEyeSoundFeedback'
import type { EyeExerciseProps, EyeMetrics } from '@sprinta/shared'

const { width: SW, height: SH } = Dimensions.get('window')
const COLS = 3
const COL_W = SW / COLS
const METEOR_R = 22
const ACCENT = '#0EA5E9'

interface MeteorItem {
  id: number
  col: number
  isGold: boolean
  anim: Animated.Value
  tapped: boolean
  missed: boolean
}

let nextId = 0

function calcMetrics(
  hits: number, misses: number, wrongTaps: number, startMs: number,
): EyeMetrics {
  const total = hits + misses
  const acc   = total > 0 ? Math.min(100, (hits / (total + wrongTaps * 0.5)) * 100) : 0
  const elapsed = (performance.now() - startMs) / 1000
  const rate  = hits / Math.max(elapsed, 1)
  return {
    reactionTimeMs:        Math.round(800 / Math.max(rate, 0.5)),
    accuracyPercent:       Math.round(acc),
    trackingErrorPx:       0,
    visualAttentionScore:  Math.round(acc * 0.6 + Math.min(100, rate * 15) * 0.4),
    saccadicSpeedEstimate: parseFloat(rate.toFixed(2)),
    taskCompletionMs:      Math.round(performance.now() - startMs),
    arpContribution:       4,
  }
}

export default function MeteorYagmuru({
  difficulty, durationSeconds, onComplete, onExit,
}: EyeExerciseProps) {
  const fallDuration = [2200, 1800, 1400, 1100][difficulty - 1]
  const spawnRate    = [1200, 950, 750, 600][difficulty - 1]

  const [meteors, setMeteors]   = useState<MeteorItem[]>([])
  const [score, setScore]       = useState(0)
  const [timeLeft, setTimeLeft] = useState(durationSeconds)
  const [done, setDone]         = useState(false)

  const hits      = useRef(0)
  const misses    = useRef(0)
  const wrongTaps = useRef(0)
  const startMs   = useRef(performance.now())

  const { playHit, playMiss, playAppear } = useEyeSoundFeedback()

  // Timer
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

  // Meteor spawn
  useEffect(() => {
    if (done) return
    const spawn = setInterval(() => {
      if (done) return
      const col    = Math.floor(Math.random() * COLS)
      const isGold = Math.random() > 0.35  // %65 altın
      const anim   = new Animated.Value(0)
      const id     = nextId++
      const meteor: MeteorItem = { id, col, isGold, anim, tapped: false, missed: false }

      setMeteors(prev => [...prev.slice(-8), meteor])  // max 9 aynı anda
      playAppear()

      Animated.timing(anim, {
        toValue: 1,
        duration: fallDuration,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          if (isGold) {
            misses.current++
          }
          setMeteors(prev => prev.filter(m => m.id !== id))
        }
      })
    }, spawnRate)

    return () => clearInterval(spawn)
  }, [done, fallDuration, spawnRate, playAppear])

  useEffect(() => {
    if (done) {
      const metrics = calcMetrics(hits.current, misses.current, wrongTaps.current, startMs.current)
      setTimeout(() => onComplete(metrics), 400)
    }
  }, [done, onComplete])

  const handleTap = useCallback((id: number, isGold: boolean) => {
    if (done) return
    if (isGold) {
      hits.current++
      setScore(s => s + 1)
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      playHit()
    } else {
      wrongTaps.current++
      setScore(s => Math.max(0, s - 1))
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      playMiss()
    }
    setMeteors(prev => prev.filter(m => m.id !== id))
  }, [done, playHit, playMiss])

  const FALL_DISTANCE = SH * 0.75

  return (
    <SafeAreaView style={s.root}>
      <TouchableOpacity style={s.exitBtn} onPress={onExit}>
        <Text style={s.exitTxt}>✕</Text>
      </TouchableOpacity>

      <Text style={s.title}>Meteor Yağmuru</Text>
      <View style={s.header}>
        <Text style={s.score}>⭐ {score}</Text>
        <Text style={s.timer}>⏱ {timeLeft}s</Text>
      </View>

      {/* Kolon çizgileri */}
      <View style={s.arena} pointerEvents="box-none">
        {[0, 1, 2].map(c => (
          <View key={c} style={[s.colLine, { left: COL_W * (c + 1) }]} />
        ))}

        {meteors.map(m => {
          const cx = COL_W * m.col + COL_W / 2 - METEOR_R
          const ty = m.anim.interpolate({ inputRange: [0, 1], outputRange: [-METEOR_R * 2, FALL_DISTANCE] })
          return (
            <Animated.View
              key={m.id}
              style={[
                s.meteorWrap,
                { left: cx, transform: [{ translateY: ty }] },
              ]}
            >
              <TouchableOpacity
                style={[s.meteor, m.isGold ? s.meteorGold : s.meteorRed]}
                onPress={() => handleTap(m.id, m.isGold)}
                activeOpacity={0.7}
              >
                <Text style={s.meteorTxt}>{m.isGold ? '⭐' : '💀'}</Text>
              </TouchableOpacity>
            </Animated.View>
          )
        })}
      </View>

      <Text style={s.hint}>⭐ Altın = Dokun  · 💀 Kırmızı = Kaç</Text>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#0A0F1F', alignItems: 'center' },
  exitBtn:{ position: 'absolute', top: 52, right: 20, zIndex: 10, padding: 8 },
  exitTxt:{ color: 'rgba(255,255,255,0.5)', fontSize: 18 },
  title:  { marginTop: 56, fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  header: { flexDirection: 'row', gap: 32, marginTop: 8, marginBottom: 4 },
  score:  { fontSize: 18, fontWeight: '700', color: '#FFD700' },
  timer:  { fontSize: 18, fontWeight: '700', color: ACCENT },
  arena:  { flex: 1, width: SW, position: 'relative', overflow: 'hidden' },
  colLine:{ position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
  meteorWrap:{ position: 'absolute', top: 0, width: METEOR_R * 2, height: METEOR_R * 2 },
  meteor: {
    width: METEOR_R * 2, height: METEOR_R * 2, borderRadius: METEOR_R,
    alignItems: 'center', justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 8, elevation: 6,
  },
  meteorGold:{ backgroundColor: '#1A1400', borderWidth: 2, borderColor: '#FFD700', shadowColor: '#FFD700' },
  meteorRed: { backgroundColor: '#1A0000', borderWidth: 2, borderColor: '#EF4444', shadowColor: '#EF4444' },
  meteorTxt: { fontSize: 16 },
  hint:   { fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 32 },
})
