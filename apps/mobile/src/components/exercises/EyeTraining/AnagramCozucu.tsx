/**
 * AnagramCozucu — Anagram Çözücü (Sakkadik)
 * Karışık harfler → doğru sırayı tap'la oluştur
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

const WORDS = [
  'ELMA', 'ARABA', 'KALEM', 'KITAP', 'OKUL', 'BAHÇE', 'RENK', 'KAPI',
  'MASA', 'SANDALYE', 'PENCERE', 'YILDIZ', 'GÜNEŞ', 'DENIZ', 'ORMAN',
  'KELEBEK', 'BÜLBÜL', 'ÇIÇEK', 'TOMURCUK', 'BULUT',
]

function shuffle(arr: string[]): string[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function scramble(word: string): string[] {
  const letters = word.split('')
  let result: string[]
  do { result = shuffle(letters) } while (result.join('') === word)
  return result
}

function calcMetrics(hits: number, total: number, startMs: number): EyeMetrics {
  const acc = total > 0 ? (hits / total) * 100 : 0
  const elapsed = (performance.now() - startMs) / 1000
  return {
    reactionTimeMs:        Math.round(elapsed * 1000 / Math.max(total, 1)),
    accuracyPercent:       Math.round(acc),
    trackingErrorPx:       0,
    visualAttentionScore:  Math.round(acc * 0.65 + Math.min(100, (hits / Math.max(elapsed, 1)) * 15) * 0.35),
    saccadicSpeedEstimate: parseFloat((hits / Math.max(elapsed, 1)).toFixed(2)),
    taskCompletionMs:      Math.round(performance.now() - startMs),
    arpContribution:       4,
  }
}

export default function AnagramCozucu({
  difficulty, durationSeconds, onComplete, onExit,
}: EyeExerciseProps) {
  const wordList = WORDS.slice(0, Math.min(WORDS.length, Math.floor(durationSeconds / 4) + 5))
  const [wordIdx, setWordIdx]     = useState(0)
  const [letters, setLetters]     = useState<string[]>(() => scramble(wordList[0]))
  const [selected, setSelected]   = useState<number[]>([])
  const [hits, setHits]           = useState(0)
  const [total, setTotal]         = useState(0)
  const [showResult, setShowResult] = useState<'correct' | 'wrong' | null>(null)
  const { playHit, playMiss, playSuccess, playAppear } = useEyeSoundFeedback()
  const startMs = useRef(performance.now())
  const hitsRef = useRef(0)
  const totalRef = useRef(0)

  const scaleVal = useSharedValue(1)
  const scaleStyle = useAnimatedStyle(() => ({ transform: [{ scale: scaleVal.value }] }))

  const currentWord = wordList[wordIdx % wordList.length]

  const handleLetterTap = useCallback((idx: number) => {
    if (showResult !== null) return
    if (selected.includes(idx)) return
    const newSelected = [...selected, idx]
    setSelected(newSelected)

    if (newSelected.length === currentWord.length) {
      const guess = newSelected.map(i => letters[i]).join('')
      const isCorrect = guess === currentWord
      hitsRef.current += isCorrect ? 1 : 0
      totalRef.current++
      setHits(hitsRef.current)
      setTotal(totalRef.current)
      setShowResult(isCorrect ? 'correct' : 'wrong')

      if (isCorrect) {
        scaleVal.value = withSequence(withTiming(1.1, { duration: 100 }), withTiming(1, { duration: 150 }))
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        playSuccess()
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        playMiss()
      }

      setTimeout(() => {
        setShowResult(null)
        setSelected([])
        if (totalRef.current >= Math.min(wordList.length, Math.floor(durationSeconds / 4))) {
          onComplete(calcMetrics(hitsRef.current, totalRef.current, startMs.current))
        } else {
          const nextIdx = (wordIdx + 1) % wordList.length
          setWordIdx(nextIdx)
          setLetters(scramble(wordList[nextIdx]))
          playAppear()
        }
      }, 800)
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      playHit()
    }
  }, [showResult, selected, currentWord, letters, wordIdx, wordList, durationSeconds, onComplete, scaleVal, playHit, playMiss, playSuccess, playAppear])

  const handleClear = useCallback(() => {
    if (showResult !== null) return
    setSelected([])
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }, [showResult])

  const guess = selected.map(i => letters[i]).join('')

  return (
    <SafeAreaView style={s.root}>
      <TouchableOpacity style={s.exitBtn} onPress={onExit}>
        <Text style={s.exitTxt}>✕</Text>
      </TouchableOpacity>

      <Text style={s.title}>Anagram Çözücü</Text>

      <View style={s.stats}>
        <Text style={s.statHit}>✓ {hits}</Text>
        <Text style={s.statSep}>/</Text>
        <Text style={s.statTotal}>{total}</Text>
      </View>

      <Animated.View style={[s.card, scaleStyle, showResult === 'correct' && s.cardCorrect, showResult === 'wrong' && s.cardWrong]}>
        <Text style={s.cardLabel}>Kelimeleri harfleri sırayla seç:</Text>
        <Text style={s.guessText}>{guess || '_ '.repeat(currentWord.length).trim()}</Text>
        {showResult === 'correct' && <Text style={s.feedbackCorrect}>✓ Doğru! {currentWord}</Text>}
        {showResult === 'wrong' && <Text style={s.feedbackWrong}>✗ Yanlış! Doğrusu: {currentWord}</Text>}
      </Animated.View>

      <View style={s.lettersGrid}>
        {letters.map((letter, idx) => (
          <TouchableOpacity
            key={idx}
            style={[s.letterBtn, selected.includes(idx) && s.letterSelected]}
            onPressIn={() => handleLetterTap(idx)}
            hitSlop={8}
            activeOpacity={0.7}
          >
            <Text style={[s.letterTxt, selected.includes(idx) && s.letterTxtSelected]}>
              {letter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={s.clearBtn} onPress={handleClear} activeOpacity={0.7}>
        <Text style={s.clearTxt}>Temizle</Text>
      </TouchableOpacity>

      <Text style={s.progress}>{wordIdx + 1}/{wordList.length}</Text>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root:          { flex: 1, backgroundColor: '#0A0F1F', alignItems: 'center' },
  exitBtn:       { position: 'absolute', top: 52, right: 20, zIndex: 10, padding: 8 },
  exitTxt:       { color: 'rgba(255,255,255,0.5)', fontSize: 18 },
  title:         { marginTop: 56, fontSize: 22, fontWeight: '800', color: '#FFFFFF', marginBottom: 10 },
  stats:         { flexDirection: 'row', gap: 6, alignItems: 'center', marginBottom: 20 },
  statHit:       { color: '#00C853', fontSize: 20, fontWeight: '900' },
  statSep:       { color: 'rgba(255,255,255,0.3)', fontSize: 18 },
  statTotal:     { color: 'rgba(255,255,255,0.5)', fontSize: 18, fontWeight: '700' },
  card:          { backgroundColor: '#0F1A35', borderRadius: 22, paddingHorizontal: 28, paddingVertical: 22, marginHorizontal: 24, alignItems: 'center', width: '85%', marginBottom: 24, borderWidth: 2, borderColor: 'rgba(24,119,242,0.4)', minHeight: 100 },
  cardCorrect:   { borderColor: '#00C853' },
  cardWrong:     { borderColor: '#EF4444' },
  cardLabel:     { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 10 },
  guessText:     { color: '#FFFFFF', fontSize: 30, fontWeight: '900', letterSpacing: 6 },
  feedbackCorrect:{ color: '#00C853', fontSize: 14, fontWeight: '700', marginTop: 8 },
  feedbackWrong: { color: '#EF4444', fontSize: 13, fontWeight: '700', marginTop: 8 },
  lettersGrid:   { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, width: '85%', marginBottom: 18 },
  letterBtn:     { backgroundColor: '#162040', borderRadius: 12, width: 52, height: 52, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'rgba(24,119,242,0.4)' },
  letterSelected:{ backgroundColor: 'rgba(24,119,242,0.2)', borderColor: ACCENT },
  letterTxt:     { color: 'rgba(255,255,255,0.85)', fontSize: 20, fontWeight: '800' },
  letterTxtSelected:{ color: ACCENT },
  clearBtn:      { backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', paddingHorizontal: 24, paddingVertical: 10 },
  clearTxt:      { color: '#EF4444', fontSize: 14, fontWeight: '700' },
  progress:      { color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 14 },
})
