/**
 * KalpRitim — Kalp Ritmi Takibi (Çevresel Görüş / Periferik)
 * EKG dalgasının tepesini tam zamanında yakala.
 * Bir "beat marker" sağdan sola hareket eder.
 * Merkez çizgisini geçtiğinde tap et.
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
const ACCENT = '#0EA5E9'
const CENTER_Y = SH * 0.42
const TRAVEL   = SW + 60  // Sağdan sola mesafe

function calcMetrics(
  hits: number, misses: number, timingErrors: number[], startMs: number,
): EyeMetrics {
  const total = hits + misses
  const acc   = total > 0 ? (hits / total) * 100 : 0
  const avgErr = timingErrors.length > 0
    ? timingErrors.reduce((a, b) => a + b, 0) / timingErrors.length : 300
  const speedScore = Math.max(0, 100 - avgErr / 3)
  return {
    reactionTimeMs:        Math.round(avgErr),
    accuracyPercent:       Math.round(acc),
    trackingErrorPx:       Math.round(avgErr),
    visualAttentionScore:  Math.round(acc * 0.6 + speedScore * 0.4),
    saccadicSpeedEstimate: parseFloat((hits / Math.max((performance.now() - startMs) / 1000, 1)).toFixed(2)),
    taskCompletionMs:      Math.round(performance.now() - startMs),
    arpContribution:       4,
  }
}

export default function KalpRitim({
  difficulty, durationSeconds, onComplete, onExit,
}: EyeExerciseProps) {
  const beatInterval = [1600, 1300, 1000, 800][difficulty - 1]
  const hitWindow    = [250, 200, 160, 130][difficulty - 1]  // ms her iki tarafta

  const [timeLeft, setTimeLeft] = useState(durationSeconds)
  const [done, setDone]         = useState(false)
  const [hits, setHits]         = useState(0)
  const [misses, setMisses]     = useState(0)
  const [feedback, setFeedback] = useState<'hit' | 'miss' | 'early' | null>(null)

  const { playHit, playMiss } = useEyeSoundFeedback()
  const beatAnim     = useRef(new Animated.Value(SW + 30)).current
  const timingErrors = useRef<number[]>([])
  const beatAtCenter = useRef(0)  // Ne zaman center'a ulaşır
  const beatActive   = useRef(false)
  const startMs      = useRef(performance.now())
  const loopRef      = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  // Beat looper
  const spawnBeat = useCallback(() => {
    if (done) return
    beatAnim.setValue(SW + 30)
    beatActive.current = true

    // Merkeze ulaşma süresi = SW / 2 / hız
    const totalMs    = beatInterval * 0.8  // beat hızı
    const centerMs   = totalMs * 0.5
    beatAtCenter.current = performance.now() + centerMs

    Animated.timing(beatAnim, {
      toValue: -30,
      duration: totalMs,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && beatActive.current) {
        // Kaçırıldı
        setMisses(m => m + 1)
        setFeedback('miss')
        setTimeout(() => setFeedback(null), 400)
        beatActive.current = false
      }
      loopRef.current = setTimeout(spawnBeat, beatInterval * 0.3)
    })
  }, [beatAnim, beatInterval, done])

  useEffect(() => {
    loopRef.current = setTimeout(spawnBeat, 500)
    return () => {
      if (loopRef.current) clearTimeout(loopRef.current)
      beatAnim.stopAnimation()
    }
  }, [spawnBeat, beatAnim])

  useEffect(() => {
    if (done) {
      if (loopRef.current) clearTimeout(loopRef.current)
      beatAnim.stopAnimation()
      const metrics = calcMetrics(hits, misses, timingErrors.current, startMs.current)
      setTimeout(() => onComplete(metrics), 400)
    }
  }, [done, hits, misses, onComplete, beatAnim])

  const handleTap = useCallback(() => {
    if (done || !beatActive.current) return

    const now = performance.now()
    const diff = Math.abs(now - beatAtCenter.current)

    if (diff <= hitWindow) {
      timingErrors.current.push(diff)
      setHits(h => h + 1)
      setFeedback('hit')
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      playHit()
      beatActive.current = false
      beatAnim.stopAnimation()
    } else if (now < beatAtCenter.current) {
      setFeedback('early')
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      playMiss()
    } else {
      setMisses(m => m + 1)
      setFeedback('miss')
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      playMiss()
      beatActive.current = false
    }
    setTimeout(() => setFeedback(null), 350)
  }, [done, hitWindow, beatAnim])

  return (
    <SafeAreaView style={s.root}>
      <TouchableOpacity style={s.exitBtn} onPress={onExit}>
        <Text style={s.exitTxt}>✕</Text>
      </TouchableOpacity>

      <Text style={s.title}>Kalp Ritmi Takibi</Text>
      <View style={s.statsRow}>
        <Text style={s.statHit}>❤️ {hits}</Text>
        <Text style={s.statTime}>⏱ {timeLeft}s</Text>
        <Text style={s.statMiss}>💔 {misses}</Text>
      </View>

      {/* EKG ekranı */}
      <TouchableOpacity
        style={s.ekgScreen}
        onPressIn={handleTap}
        activeOpacity={0.95}
      >
        {/* Yatay çizgiler (dekoratif EKG arka plan) */}
        {[0.3, 0.5, 0.7].map(frac => (
          <View key={frac} style={[s.hLine, { top: s.ekgScreen.height as number * frac }]} />
        ))}

        {/* Merkez tetik çizgisi */}
        <View style={s.centerLine} />
        <Text style={s.centerLabel}>◉ MERKEZ</Text>

        {/* EKG dalga çizgisi (statik dekoratif) */}
        <View style={s.waveContainer}>
          {Array.from({ length: 8 }).map((_, i) => (
            <View key={i} style={s.wavePulse} />
          ))}
        </View>

        {/* Hareketli beat marker */}
        <Animated.View
          style={[s.beatMarker, { transform: [{ translateX: beatAnim }] }]}
        >
          <View style={s.beatDot} />
          <View style={s.beatTrail} />
        </Animated.View>

        {/* Feedback */}
        {feedback && (
          <View style={s.feedbackWrap}>
            <Text style={[
              s.feedbackTxt,
              feedback === 'hit'   && { color: '#4ADE80' },
              feedback === 'miss'  && { color: '#F87171' },
              feedback === 'early' && { color: '#FBBF24' },
            ]}>
              {feedback === 'hit' ? '✓ MÜKEMMEL!' : feedback === 'early' ? '⚡ ERKEN' : '✗ KAÇIRDI'}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <Text style={s.hint}>Dalga merkez çizgisini geçince dokun!</Text>
    </SafeAreaView>
  )
}

const EKG_H = SH * 0.45

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#0A0F1F', alignItems: 'center' },
  exitBtn:{ position: 'absolute', top: 52, right: 20, zIndex: 10, padding: 8 },
  exitTxt:{ color: 'rgba(255,255,255,0.5)', fontSize: 18 },
  title:  { marginTop: 56, fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  statsRow:{ flexDirection: 'row', gap: 24, marginTop: 10, marginBottom: 16 },
  statHit: { fontSize: 18, fontWeight: '700', color: '#F87171' },
  statTime:{ fontSize: 18, fontWeight: '700', color: ACCENT },
  statMiss:{ fontSize: 18, fontWeight: '700', color: '#6B7280' },

  ekgScreen:{
    width: SW - 32, height: EKG_H,
    backgroundColor: '#0D1F0D', borderRadius: 20,
    borderWidth: 1.5, borderColor: '#1A4A1A',
    overflow: 'hidden', position: 'relative',
  },
  hLine:{ position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(0,255,100,0.08)' },

  centerLine:{
    position: 'absolute',
    left: SW / 2 - 17, top: 0, bottom: 0,
    width: 2, backgroundColor: 'rgba(255,255,255,0.25)',
  },
  centerLabel:{
    position: 'absolute',
    left: SW / 2 - 50, top: 8,
    fontSize: 9, color: 'rgba(255,255,255,0.35)', fontWeight: '700',
  },

  waveContainer:{
    position: 'absolute', bottom: '35%',
    left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
  },
  wavePulse:{
    width: 2, height: 30,
    backgroundColor: 'rgba(0,255,100,0.15)',
    borderRadius: 1,
  },

  beatMarker:{
    position: 'absolute',
    top: 0, bottom: 0,
    width: 40,
    alignItems: 'flex-start',
  },
  beatDot:{
    position: 'absolute', top: '50%', marginTop: -12,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#00FF64',
    shadowColor: '#00FF64', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9, shadowRadius: 12, elevation: 8,
  },
  beatTrail:{
    position: 'absolute', top: '50%', marginTop: -2,
    width: 40, height: 4,
    backgroundColor: 'rgba(0,255,100,0.3)',
    borderRadius: 2,
  },

  feedbackWrap:{
    position: 'absolute', top: 12, left: 0, right: 0,
    alignItems: 'center',
  },
  feedbackTxt:{ fontSize: 18, fontWeight: '800' },

  hint:   { fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 20, marginBottom: 32 },
})
