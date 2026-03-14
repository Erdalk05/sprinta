/**
 * HeceleAtla — Heceleme Atlama (Sakkadik)
 * Kelime hecelere bölünür → sırayla tap (hece renk flash)
 */
import { SafeAreaView } from 'react-native-safe-area-context'
import React, { useState, useCallback, useRef } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, 
} from 'react-native'
import Animated, {
  useSharedValue, withSequence, withTiming, useAnimatedStyle,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { useEyeSoundFeedback } from './useEyeSoundFeedback'
import type { EyeExerciseProps, EyeMetrics } from '@sprinta/shared'

const ACCENT = '#1877F2'

// Turkish syllable data [word, syllables[]]
const WORD_DATA: [string, string[]][] = [
  ['kardeş',      ['kar', 'deş']],
  ['okul',        ['o', 'kul']],
  ['çiçek',       ['çi', 'çek']],
  ['deniz',       ['de', 'niz']],
  ['kapı',        ['ka', 'pı']],
  ['araba',       ['a', 'ra', 'ba']],
  ['kalem',       ['ka', 'lem']],
  ['güneş',       ['gü', 'neş']],
  ['yıldız',      ['yıl', 'dız']],
  ['pencere',     ['pen', 'ce', 're']],
  ['kitap',       ['ki', 'tap']],
  ['ağaç',        ['a', 'ğaç']],
  ['elma',        ['el', 'ma']],
  ['bahçe',       ['bah', 'çe']],
  ['çocuk',       ['ço', 'cuk']],
  ['köpek',       ['kö', 'pek']],
  ['mektup',      ['mek', 'tup']],
  ['tarih',       ['ta', 'rih']],
  ['bulut',       ['bu', 'lut']],
  ['kelebek',     ['ke', 'le', 'bek']],
  ['yelpaze',     ['yel', 'pa', 'ze']],
  ['bilgisayar',  ['bil', 'gi', 'sa', 'yar']],
  ['anlamak',     ['an', 'la', 'mak']],
  ['öğrenci',     ['öğ', 'ren', 'ci']],
  ['matematik',   ['ma', 'te', 'ma', 'tik']],
]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function calcMetrics(hits: number, total: number, startMs: number): EyeMetrics {
  const acc = total > 0 ? (hits / total) * 100 : 0
  const elapsed = (performance.now() - startMs) / 1000
  return {
    reactionTimeMs:        Math.round(elapsed * 1000 / Math.max(total, 1)),
    accuracyPercent:       Math.round(acc),
    trackingErrorPx:       0,
    visualAttentionScore:  Math.round(acc * 0.7 + Math.min(100, (hits / Math.max(elapsed, 1)) * 10) * 0.3),
    saccadicSpeedEstimate: parseFloat((hits / Math.max(elapsed, 1)).toFixed(2)),
    taskCompletionMs:      Math.round(performance.now() - startMs),
    arpContribution:       4,
  }
}

export default function HeceleAtla({
  difficulty, durationSeconds, onComplete, onExit,
}: EyeExerciseProps) {
  const wordPool = shuffle(WORD_DATA).slice(0, Math.min(WORD_DATA.length, Math.floor(durationSeconds / 4) + 3))
  const [wordIdx, setWordIdx]         = useState(0)
  const [nextStep, setNextStep]       = useState(0)
  const [hits, setHits]               = useState(0)
  const [total, setTotal]             = useState(0)
  const [flashIdx, setFlashIdx]       = useState<number | null>(null)
  const [wrongFlash, setWrongFlash]   = useState<number | null>(null)
  const [completed, setCompleted]     = useState(false)
  const { playHit, playMiss, playSuccess, playAppear } = useEyeSoundFeedback()
  const startMs = useRef(performance.now())
  const hitsRef = useRef(0)
  const totalRef = useRef(0)

  const scaleVal = useSharedValue(1)
  const scaleStyle = useAnimatedStyle(() => ({ transform: [{ scale: scaleVal.value }] }))

  const [currentWord, syllables] = wordPool[wordIdx % wordPool.length]

  // Shuffled display order, but correct tap order is syllables[0..n]
  const [displayOrder] = useState<number[]>(() => shuffle([...Array(syllables.length).keys()]))
  const [displayOrders, setDisplayOrders] = useState<number[][]>([shuffle([...Array(syllables.length).keys()])])

  const getDisplayOrder = (wIdx: number): number[] => {
    if (displayOrders[wIdx]) return displayOrders[wIdx]
    return [...Array(wordPool[wIdx % wordPool.length][1].length).keys()]
  }

  const handleHeceTap = useCallback((sylIdx: number) => {
    if (completed || flashIdx !== null || wrongFlash !== null) return

    const [, syls] = wordPool[wordIdx % wordPool.length]
    const expectedStep = nextStep

    if (sylIdx === expectedStep) {
      // Correct
      setFlashIdx(sylIdx)
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      playHit()
      setTimeout(() => {
        setFlashIdx(null)
        if (expectedStep + 1 >= syls.length) {
          // Word done
          hitsRef.current++
          totalRef.current++
          setHits(hitsRef.current)
          setTotal(totalRef.current)
          setNextStep(0)

          scaleVal.value = withSequence(withTiming(1.08, { duration: 100 }), withTiming(1, { duration: 100 }))
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
          playSuccess()

          if (totalRef.current >= wordPool.length) {
            setCompleted(true)
            setTimeout(() => onComplete(calcMetrics(hitsRef.current, totalRef.current, startMs.current)), 400)
          } else {
            const nextWIdx = wordIdx + 1
            playAppear()
            setWordIdx(nextWIdx)
            const newSyls = wordPool[nextWIdx % wordPool.length][1]
            setDisplayOrders(prev => {
              const updated = [...prev]
              updated[nextWIdx] = shuffle([...Array(newSyls.length).keys()])
              return updated
            })
          }
        } else {
          setNextStep(s => s + 1)
        }
      }, 250)
    } else {
      // Wrong
      setWrongFlash(sylIdx)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      playMiss()
      setTimeout(() => {
        setWrongFlash(null)
        setNextStep(0)
        totalRef.current++
        setTotal(totalRef.current)
      }, 500)
    }
  }, [completed, flashIdx, wrongFlash, wordIdx, nextStep, wordPool, onComplete, scaleVal])

  const [, currentSyllables] = wordPool[wordIdx % wordPool.length]
  const currDisplayOrder = getDisplayOrder(wordIdx)
  const displaySyllables = currDisplayOrder.map(i => ({ idx: i, text: currentSyllables[i] }))

  return (
    <SafeAreaView style={s.root}>
      <TouchableOpacity style={s.exitBtn} onPress={onExit}>
        <Text style={s.exitTxt}>✕</Text>
      </TouchableOpacity>

      <Text style={s.title}>Heceleme Atlama</Text>

      <View style={s.stats}>
        <Text style={s.statHit}>✓ {hits}</Text>
        <Text style={s.statSep}>/</Text>
        <Text style={s.statTotal}>{total}</Text>
      </View>

      <Animated.View style={[s.card, scaleStyle]}>
        <Text style={s.cardLabel}>Heceleri sırayla tap'la:</Text>
        <Text style={s.wordTxt}>{currentWord}</Text>
        <View style={s.progressDots}>
          {currentSyllables.map((_, i) => (
            <View key={i} style={[s.dot, i < nextStep && s.dotDone, i === nextStep && s.dotActive]} />
          ))}
        </View>
      </Animated.View>

      <View style={s.heceler}>
        {displaySyllables.map(({ idx, text }) => (
          <TouchableOpacity
            key={idx}
            style={[
              s.heceBtn,
              idx < nextStep && s.heceDone,
              flashIdx === idx && s.heceFlash,
              wrongFlash === idx && s.heceWrong,
            ]}
            onPressIn={() => handleHeceTap(idx)}
            hitSlop={8}
            activeOpacity={0.7}
          >
            <Text style={[
              s.heceTxt,
              idx < nextStep && s.heceTxtDone,
              flashIdx === idx && s.heceTxtFlash,
            ]}>
              {text}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={s.hint}>Adım {nextStep + 1}/{currentSyllables.length}: "{currentSyllables[nextStep]}" hecesine bas</Text>
      <Text style={s.progress}>{wordIdx + 1}/{wordPool.length}</Text>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root:       { flex: 1, backgroundColor: '#0A0F1F', alignItems: 'center' },
  exitBtn:    { position: 'absolute', top: 52, right: 20, zIndex: 10, padding: 8 },
  exitTxt:    { color: 'rgba(255,255,255,0.5)', fontSize: 18 },
  title:      { marginTop: 56, fontSize: 22, fontWeight: '800', color: '#FFFFFF', marginBottom: 10 },
  stats:      { flexDirection: 'row', gap: 6, alignItems: 'center', marginBottom: 20 },
  statHit:    { color: '#00C853', fontSize: 20, fontWeight: '900' },
  statSep:    { color: 'rgba(255,255,255,0.3)', fontSize: 18 },
  statTotal:  { color: 'rgba(255,255,255,0.5)', fontSize: 18, fontWeight: '700' },
  card:       { backgroundColor: '#0F1A35', borderRadius: 22, paddingHorizontal: 28, paddingVertical: 22, marginHorizontal: 24, width: '85%', alignItems: 'center', marginBottom: 28, borderWidth: 2, borderColor: `rgba(24,119,242,0.4)` },
  cardLabel:  { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 10 },
  wordTxt:    { color: '#FFFFFF', fontSize: 36, fontWeight: '900', letterSpacing: 3, marginBottom: 14 },
  progressDots:{ flexDirection: 'row', gap: 8 },
  dot:        { width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.15)' },
  dotDone:    { backgroundColor: '#00C853' },
  dotActive:  { backgroundColor: ACCENT },
  heceler:    { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, width: '85%', marginBottom: 20 },
  heceBtn:    { backgroundColor: '#0F1A35', borderRadius: 14, borderWidth: 1.5, borderColor: 'rgba(24,119,242,0.35)', paddingHorizontal: 20, paddingVertical: 16, minWidth: 70, alignItems: 'center' },
  heceDone:   { borderColor: '#00C853', backgroundColor: 'rgba(0,200,83,0.1)' },
  heceFlash:  { borderColor: ACCENT, backgroundColor: 'rgba(24,119,242,0.25)' },
  heceWrong:  { borderColor: '#EF4444', backgroundColor: 'rgba(239,68,68,0.15)' },
  heceTxt:    { color: 'rgba(255,255,255,0.85)', fontSize: 20, fontWeight: '800' },
  heceTxtDone:{ color: '#00C853' },
  heceTxtFlash:{ color: ACCENT },
  hint:       { color: 'rgba(255,255,255,0.35)', fontSize: 12, marginBottom: 6, textAlign: 'center', paddingHorizontal: 20 },
  progress:   { color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 4 },
})
