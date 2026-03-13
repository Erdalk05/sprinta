/**
 * HarfZinciri — Harf Zinciri (Sakkadik)
 * Kelime göster → son harfle başlayan yeni kelimeyi 3 şıktan seç
 */
import React, { useState, useCallback, useRef } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
} from 'react-native'
import Animated, {
  useSharedValue, withSequence, withTiming, useAnimatedStyle,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { useEyeSoundFeedback } from './useEyeSoundFeedback'
import type { EyeExerciseProps, EyeMetrics } from '@sprinta/shared'

const ACCENT = '#1877F2'

interface Chain {
  word: string
  opts: string[]
  ans: number  // index of correct option (must start with last letter of word)
}

const CHAINS: Chain[] = [
  // word → last letter → correct option starts with that letter
  // wrong options start with DIFFERENT letters
  { word: 'Elma',     opts: ['Arı',      'Balon',   'Güneş'],     ans: 0 }, // a→A
  { word: 'Aslan',    opts: ['Kalem',    'Nar',      'Taş'],       ans: 1 }, // n→N
  { word: 'Nar',      opts: ['Balon',    'Güneş',    'Renk'],      ans: 2 }, // r→R
  { word: 'Renk',     opts: ['Balon',    'Kalem',    'Güneş'],     ans: 1 }, // k→K
  { word: 'Kalem',    opts: ['Taş',      'Güneş',    'Masa'],      ans: 2 }, // m→M
  { word: 'Masa',     opts: ['Kalem',    'Güneş',    'Ayı'],       ans: 2 }, // a→A
  { word: 'Ayı',      opts: ['Irak',     'Balon',    'Güneş'],     ans: 0 }, // ı→I
  { word: 'Irak',     opts: ['Taş',      'Kedi',     'Güneş'],     ans: 1 }, // k→K
  { word: 'Kedi',     opts: ['Masa',     'Güneş',    'İpek'],      ans: 2 }, // i→İ
  { word: 'İpek',     opts: ['Taş',      'Kitap',    'Güneş'],     ans: 1 }, // k→K
  { word: 'Kitap',    opts: ['Balon',    'Güneş',    'Portakal'],  ans: 2 }, // p→P
  { word: 'Portakal', opts: ['Kalem',    'Lale',     'Güneş'],     ans: 1 }, // l→L
  { word: 'Lale',     opts: ['Taş',      'Masa',     'Erik'],      ans: 2 }, // e→E
  { word: 'Erik',     opts: ['Kale',     'Güneş',    'Taş'],       ans: 0 }, // k→K
  { word: 'Kale',     opts: ['Taş',      'Güneş',    'Elmas'],     ans: 2 }, // e→E
  { word: 'Elmas',    opts: ['Kalem',    'Saat',     'Güneş'],     ans: 1 }, // s→S
  { word: 'Saat',     opts: ['Taş',      'Balon',    'Yıldız'],    ans: 0 }, // t→T
  { word: 'Taş',      opts: ['Şeker',    'Balon',    'Kalem'],     ans: 0 }, // ş→Ş
  { word: 'Şeker',    opts: ['Kalem',    'Deniz',    'Rakam'],     ans: 2 }, // r→R
  { word: 'Rakam',    opts: ['Taş',      'Mermer',   'Balon'],     ans: 1 }, // m→M
  { word: 'Mermer',   opts: ['Kalem',    'Balon',    'Rüya'],      ans: 2 }, // r→R
  { word: 'Rüya',     opts: ['Araba',    'Balon',    'Güneş'],     ans: 0 }, // a→A
  { word: 'Araba',    opts: ['Kalem',    'Deniz',    'Ayna'],      ans: 2 }, // a→A
  { word: 'Ayna',     opts: ['Taş',      'Armut',    'Bulut'],     ans: 1 }, // a→A
  { word: 'Armut',    opts: ['Kalem',    'Güneş',    'Tren'],      ans: 2 }, // t→T
  { word: 'Tren',     opts: ['Taş',      'Masa',     'Nohut'],     ans: 2 }, // n→N
  { word: 'Nohut',    opts: ['Kalem',    'Toprak',   'Güneş'],     ans: 1 }, // t→T
  { word: 'Toprak',   opts: ['Balon',    'Yıldız',   'Karpuz'],    ans: 2 }, // k→K
  { word: 'Karpuz',   opts: ['Zeytin',   'Kalem',    'Deniz'],     ans: 0 }, // z→Z
  { word: 'Zeytin',   opts: ['Kalem',    'Nefes',    'Güneş'],     ans: 1 }, // n→N
  { word: 'Nefes',    opts: ['Kalem',    'Güneş',    'Sepet'],     ans: 2 }, // s→S
  { word: 'Sepet',    opts: ['Kalem',    'Balon',    'Tilki'],     ans: 2 }, // t→T
  { word: 'Tilki',    opts: ['Kalem',    'İnce',     'Güneş'],     ans: 1 }, // i→İ
  { word: 'İnce',     opts: ['Kalem',    'Güneş',    'Ev'],        ans: 2 }, // e→E
  { word: 'Ev',       opts: ['Vadi',     'Kalem',    'Deniz'],     ans: 0 }, // v→V
  { word: 'Vadi',     opts: ['Kalem',    'Güneş',    'İlkbahar'],  ans: 2 }, // i→İ
  { word: 'İlkbahar', opts: ['Taş',      'Rüzgar',   'Kalem'],     ans: 1 }, // r→R
  { word: 'Rüzgar',   opts: ['Kalem',    'Balon',    'Resim'],     ans: 2 }, // r→R
  { word: 'Resim',    opts: ['Meyve',    'Güneş',    'Deniz'],     ans: 0 }, // m→M
  { word: 'Meyve',    opts: ['Kalem',    'Bulut',    'Ekmek'],     ans: 2 }, // e→E
]

function calcMetrics(hits: number, total: number, startMs: number): EyeMetrics {
  const acc = total > 0 ? (hits / total) * 100 : 0
  const elapsed = (performance.now() - startMs) / 1000
  return {
    reactionTimeMs:        Math.round(elapsed * 1000 / Math.max(total, 1)),
    accuracyPercent:       Math.round(acc),
    trackingErrorPx:       0,
    visualAttentionScore:  Math.round(acc * 0.7 + Math.min(100, (hits / Math.max(elapsed, 1)) * 20) * 0.3),
    saccadicSpeedEstimate: parseFloat((hits / Math.max(elapsed, 1)).toFixed(2)),
    taskCompletionMs:      Math.round(performance.now() - startMs),
    arpContribution:       4,
  }
}

export default function HarfZinciri({
  difficulty, durationSeconds, onComplete, onExit,
}: EyeExerciseProps) {
  const [idx, setIdx]           = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [hits, setHits]         = useState(0)
  const [total, setTotal]       = useState(0)
  const { playHit, playMiss, playAppear } = useEyeSoundFeedback()
  const startMs = useRef(performance.now())
  const hitsRef = useRef(0)
  const totalRef = useRef(0)

  const scaleVal = useSharedValue(1)
  const scaleStyle = useAnimatedStyle(() => ({ transform: [{ scale: scaleVal.value }] }))

  const q = CHAINS[idx % CHAINS.length]

  const handleSelect = useCallback((optIdx: number) => {
    if (showFeedback) return
    const isCorrect = optIdx === q.ans
    setSelected(optIdx)
    hitsRef.current += isCorrect ? 1 : 0
    totalRef.current++
    setHits(hitsRef.current)
    setTotal(totalRef.current)

    if (isCorrect) {
      scaleVal.value = withSequence(withTiming(1.08, { duration: 100 }), withTiming(1, { duration: 100 }))
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      playHit()
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      playMiss()
    }
    setShowFeedback(true)

    setTimeout(() => {
      setShowFeedback(false)
      setSelected(null)
      if (totalRef.current >= Math.min(CHAINS.length, durationSeconds / 3)) {
        const m = calcMetrics(hitsRef.current, totalRef.current, startMs.current)
        onComplete(m)
      } else {
        playAppear()
        setIdx(i => i + 1)
      }
    }, 900)
  }, [showFeedback, q, durationSeconds, onComplete, scaleVal])

  return (
    <SafeAreaView style={s.root}>
      <TouchableOpacity style={s.exitBtn} onPress={onExit}>
        <Text style={s.exitTxt}>✕</Text>
      </TouchableOpacity>

      <Text style={s.title}>Harf Zinciri</Text>

      <View style={s.stats}>
        <Text style={s.statTxt}>✓ {hits}</Text>
        <Text style={s.statSep}>/</Text>
        <Text style={s.statTxtTotal}>{total}</Text>
      </View>

      <Animated.View style={[s.card, scaleStyle]}>
        <Text style={s.cardLabel}>Son harfle başlayan kelimeyi seç:</Text>
        <Text style={s.wordTxt}>{q.word}</Text>
        <Text style={s.arrowTxt}>⬇</Text>
        <Text style={s.lastLetter}>"{q.word.slice(-1).toUpperCase()}" ile başlar</Text>
      </Animated.View>

      <View style={s.opts}>
        {q.opts.map((opt, oi) => (
          <TouchableOpacity
            key={oi}
            style={[
              s.optBtn,
              !showFeedback && selected === oi && s.optSelected,
              showFeedback && oi === q.ans && s.optCorrect,
              showFeedback && oi === selected && oi !== q.ans && s.optWrong,
            ]}
            onPressIn={() => handleSelect(oi)}
            activeOpacity={0.8}
          >
            <Text style={[s.optTxt, showFeedback && oi === q.ans && s.optTxtCorrect]}>
              {String.fromCharCode(65 + oi)}. {opt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={s.progress}>{(idx % CHAINS.length) + 1}/{CHAINS.length}</Text>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root:       { flex: 1, backgroundColor: '#0A0F1F', alignItems: 'center' },
  exitBtn:    { position: 'absolute', top: 52, right: 20, zIndex: 10, padding: 8 },
  exitTxt:    { color: 'rgba(255,255,255,0.5)', fontSize: 18 },
  title:      { marginTop: 56, fontSize: 22, fontWeight: '800', color: '#FFFFFF', marginBottom: 12 },
  stats:      { flexDirection: 'row', gap: 6, alignItems: 'center', marginBottom: 24 },
  statTxt:    { color: '#00C853', fontSize: 20, fontWeight: '900' },
  statSep:    { color: 'rgba(255,255,255,0.3)', fontSize: 18 },
  statTxtTotal:{ color: 'rgba(255,255,255,0.5)', fontSize: 18, fontWeight: '700' },
  card:       { backgroundColor: '#0F1A35', borderRadius: 22, paddingHorizontal: 32, paddingVertical: 28, marginHorizontal: 24, alignItems: 'center', width: '85%', marginBottom: 28, borderWidth: 2, borderColor: `rgba(24,119,242,0.4)` },
  cardLabel:  { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 12 },
  wordTxt:    { color: '#FFFFFF', fontSize: 36, fontWeight: '900', letterSpacing: 2 },
  arrowTxt:   { color: ACCENT, fontSize: 24, marginVertical: 6 },
  lastLetter: { color: ACCENT, fontSize: 14, fontWeight: '700' },
  opts:       { width: '85%', gap: 10 },
  optBtn:     { backgroundColor: '#0F1A35', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(24,119,242,0.3)', padding: 16, alignItems: 'center' },
  optSelected:{ borderColor: ACCENT, backgroundColor: 'rgba(24,119,242,0.15)' },
  optCorrect: { borderColor: '#00C853', backgroundColor: 'rgba(0,200,83,0.15)' },
  optWrong:   { borderColor: '#EF4444', backgroundColor: 'rgba(239,68,68,0.15)' },
  optTxt:     { color: 'rgba(255,255,255,0.85)', fontSize: 16, fontWeight: '600' },
  optTxtCorrect:{ color: '#00C853' },
  progress:   { color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 20 },
})
