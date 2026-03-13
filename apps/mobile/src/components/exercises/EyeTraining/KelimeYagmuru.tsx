/**
 * KelimeYagmuru — Kelime Yağmuru (Çevresel Görüş / Periferik)
 * Ekrandan kelimeler düşer, doğru anlamlıya dokun.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  View, Text, StyleSheet, Pressable, TouchableOpacity, SafeAreaView, Dimensions, Animated,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import { useEyeSoundFeedback } from './useEyeSoundFeedback'
import type { EyeExerciseProps, EyeMetrics } from '@sprinta/shared'

const { width: SW, height: SH } = Dimensions.get('window')
const COLS = 3
const COL_W = SW / COLS
const WORD_H = 40
const ACCENT = '#0EA5E9'

interface WordPair {
  word: string
  meaning: string
  isTarget: boolean
}

const WORD_PAIRS: WordPair[] = [
  { word: 'Cesur', meaning: 'Korkusuz', isTarget: true },
  { word: 'Keder', meaning: 'Üzüntü', isTarget: true },
  { word: 'Mütevazı', meaning: 'Alçakgönüllü', isTarget: true },
  { word: 'Muazzam', meaning: 'Devasa', isTarget: true },
  { word: 'Sabır', meaning: 'Dayanma gücü', isTarget: true },
  { word: 'Cömert', meaning: 'Eli açık', isTarget: true },
  { word: 'Felaket', meaning: 'Büyük yıkım', isTarget: true },
  { word: 'Yanlış', meaning: 'Hata', isTarget: false },
  { word: 'Düzgün', meaning: 'Sağlam', isTarget: false },
  { word: 'Hızlı', meaning: 'Süratli', isTarget: false },
]

interface FallingWord {
  id: number
  pair: WordPair
  col: number
  anim: Animated.Value
}

let nextId = 0

function calcMetrics(hits: number, misses: number, wrongTaps: number, startMs: number): EyeMetrics {
  const total = hits + misses
  const acc = total > 0 ? Math.min(100, (hits / (total + wrongTaps * 0.5)) * 100) : 0
  const elapsed = (performance.now() - startMs) / 1000
  const rate = hits / Math.max(elapsed, 1)
  return {
    reactionTimeMs:        Math.round(900 / Math.max(rate, 0.5)),
    accuracyPercent:       Math.round(acc),
    trackingErrorPx:       0,
    visualAttentionScore:  Math.round(acc * 0.6 + Math.min(100, rate * 12) * 0.4),
    saccadicSpeedEstimate: parseFloat(rate.toFixed(2)),
    taskCompletionMs:      Math.round(performance.now() - startMs),
    arpContribution:       4,
  }
}

// Target word changes every few seconds
const TARGET_CYCLE_MS = 4000

export default function KelimeYagmuru({
  difficulty, durationSeconds, onComplete, onExit,
}: EyeExerciseProps) {
  const fallDuration = [2500, 2000, 1600, 1200][difficulty - 1]
  const spawnRate    = [1400, 1100, 850, 650][difficulty - 1]

  const [words, setWords]         = useState<FallingWord[]>([])
  const [score, setScore]         = useState(0)
  const [timeLeft, setTimeLeft]   = useState(durationSeconds)
  const [done, setDone]           = useState(false)
  const [targetIdx, setTargetIdx] = useState(0)

  const hits      = useRef(0)
  const misses    = useRef(0)
  const wrongTaps = useRef(0)
  const startMs   = useRef(performance.now())

  const { playHit, playMiss, playAppear, playWhoosh } = useEyeSoundFeedback()

  const currentTarget = WORD_PAIRS[targetIdx % WORD_PAIRS.length]

  // Timer
  useEffect(() => {
    if (done) return
    const t = setInterval(() => {
      setTimeLeft(tl => {
        if (tl <= 1) { clearInterval(t); setDone(true); return 0 }
        return tl - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [done])

  // Cycle target word
  useEffect(() => {
    if (done) return
    const t = setInterval(() => setTargetIdx(i => i + 1), TARGET_CYCLE_MS)
    return () => clearInterval(t)
  }, [done])

  // Spawn words
  useEffect(() => {
    if (done) return
    const spawn = setInterval(() => {
      if (done) return
      const col = Math.floor(Math.random() * COLS)
      const isTarget = Math.random() > 0.45
      const pair = isTarget
        ? currentTarget
        : WORD_PAIRS[Math.floor(Math.random() * WORD_PAIRS.length)]
      const anim = new Animated.Value(0)
      const id = nextId++
      const fw: FallingWord = { id, pair, col, anim }
      setWords(prev => [...prev.slice(-10), fw])
      playAppear()
      Animated.timing(anim, { toValue: 1, duration: fallDuration, useNativeDriver: true }).start(({ finished }) => {
        if (finished) {
          if (pair.word === currentTarget.word) misses.current++
          setWords(prev => prev.filter(w => w.id !== id))
        }
      })
    }, spawnRate)
    return () => clearInterval(spawn)
  }, [done, fallDuration, spawnRate, currentTarget, playAppear])

  useEffect(() => {
    if (done) {
      const m = calcMetrics(hits.current, misses.current, wrongTaps.current, startMs.current)
      setTimeout(() => onComplete(m), 400)
    }
  }, [done, onComplete])

  const handleTap = useCallback((id: number, pair: WordPair) => {
    if (done) return
    if (pair.word === currentTarget.word) {
      hits.current++
      setScore(s => s + 2)
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      playHit()
    } else {
      wrongTaps.current++
      setScore(s => Math.max(0, s - 1))
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      playMiss()
    }
    setWords(prev => prev.filter(w => w.id !== id))
  }, [done, currentTarget, playHit, playMiss])

  const FALL_DISTANCE = SH * 0.72

  return (
    <SafeAreaView style={s.root}>
      <TouchableOpacity style={s.exitBtn} onPress={onExit}>
        <Text style={s.exitTxt}>✕</Text>
      </TouchableOpacity>
      <Text style={s.title}>Kelime Yağmuru</Text>
      <View style={s.header}>
        <Text style={s.score}>⭐ {score}</Text>
        <Text style={s.timer}>⏱ {timeLeft}s</Text>
      </View>

      <View style={s.targetBox}>
        <Text style={s.targetLabel}>Anlamı aranan kelime:</Text>
        <Text style={s.targetWord}>{currentTarget.meaning}</Text>
      </View>

      <View style={s.arena} pointerEvents="box-none">
        {[0, 1, 2].map(c => (
          <View key={c} style={[s.colLine, { left: COL_W * (c + 1) }]} />
        ))}
        {words.map(w => {
          const cx = COL_W * w.col + COL_W / 2 - 50
          const ty = w.anim.interpolate({ inputRange: [0, 1], outputRange: [-WORD_H, FALL_DISTANCE] })
          const isTarget = w.pair.word === currentTarget.word
          return (
            <Animated.View key={w.id} style={[s.wordWrap, { left: cx, transform: [{ translateY: ty }] }]}>
              <Pressable
                style={[s.wordBtn, isTarget ? s.wordTarget : s.wordNormal]}
                onPressIn={() => handleTap(w.id, w.pair)}
                hitSlop={8}
              >
                <Text style={[s.wordTxt, isTarget ? s.wordTxtTarget : s.wordTxtNormal]}>
                  {w.pair.word}
                </Text>
              </Pressable>
            </Animated.View>
          )
        })}
      </View>
      <Text style={s.hint}>Anlamı eşleşen kelimeye dokun!</Text>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root:       { flex: 1, backgroundColor: '#0A0F1F', alignItems: 'center' },
  exitBtn:    { position: 'absolute', top: 52, right: 20, zIndex: 10, padding: 8 },
  exitTxt:    { color: 'rgba(255,255,255,0.5)', fontSize: 18 },
  title:      { marginTop: 56, fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  header:     { flexDirection: 'row', gap: 32, marginTop: 6, marginBottom: 4 },
  score:      { fontSize: 18, fontWeight: '700', color: '#FFD700' },
  timer:      { fontSize: 18, fontWeight: '700', color: ACCENT },
  targetBox:  { backgroundColor: '#0F1A35', borderRadius: 14, paddingHorizontal: 20, paddingVertical: 10, marginBottom: 6, borderWidth: 1, borderColor: 'rgba(14,165,233,0.4)', alignItems: 'center' },
  targetLabel:{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginBottom: 2 },
  targetWord: { color: '#FFD700', fontSize: 20, fontWeight: '800' },
  arena:      { flex: 1, width: SW, position: 'relative', overflow: 'hidden' },
  colLine:    { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
  wordWrap:   { position: 'absolute', top: 0, width: 100, height: WORD_H },
  wordBtn:    { width: 100, height: WORD_H, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  wordTarget: { backgroundColor: '#0A1A00', borderColor: '#00C853', shadowColor: '#00C853', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 8, elevation: 6 },
  wordNormal: { backgroundColor: '#1A0F2E', borderColor: 'rgba(14,165,233,0.4)' },
  wordTxt:    { fontSize: 13, fontWeight: '700' },
  wordTxtTarget:{ color: '#00C853' },
  wordTxtNormal:{ color: 'rgba(255,255,255,0.7)' },
  hint:       { fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 28 },
})
