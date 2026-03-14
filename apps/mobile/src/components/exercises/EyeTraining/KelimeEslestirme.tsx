/**
 * KelimeEslestirme — Kelime Eşleştirme (Sakkadik)
 * 4×4 grid, türkçe↔anlam kart çiftlerini bul (flip animasyon)
 */
import { SafeAreaView } from 'react-native-safe-area-context'
import React, { useState, useCallback, useRef } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,  Dimensions,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import { useEyeSoundFeedback } from './useEyeSoundFeedback'
import type { EyeExerciseProps, EyeMetrics } from '@sprinta/shared'

const { width: SW } = Dimensions.get('window')
const GRID = 4
const CELL_SIZE = (SW - 48) / GRID - 6
const ACCENT = '#1877F2'

interface Card {
  id: number
  text: string
  pairId: number
  type: 'word' | 'meaning'
  matched: boolean
  flipped: boolean
}

const PAIRS = [
  { word: 'Cesur', meaning: 'Korkusuz' },
  { word: 'Hızlı', meaning: 'Süratli' },
  { word: 'Güzel', meaning: 'Estetik' },
  { word: 'Büyük', meaning: 'İri' },
  { word: 'Akıllı', meaning: 'Zeki' },
  { word: 'Mutlu', meaning: 'Sevinçli' },
  { word: 'Uzun', meaning: 'İri boylu' },
  { word: 'Sert', meaning: 'Katı' },
]

function buildCards(): Card[] {
  const cards: Card[] = []
  PAIRS.slice(0, 8).forEach((p, i) => {
    cards.push({ id: i * 2,     text: p.word,    pairId: i, type: 'word',    matched: false, flipped: false })
    cards.push({ id: i * 2 + 1, text: p.meaning, pairId: i, type: 'meaning', matched: false, flipped: false })
  })
  // Shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]]
  }
  return cards
}

function calcMetrics(matched: number, attempts: number, startMs: number): EyeMetrics {
  const acc = attempts > 0 ? Math.min(100, (matched * 2 / attempts) * 100) : 0
  const elapsed = (performance.now() - startMs) / 1000
  return {
    reactionTimeMs:        Math.round(elapsed * 1000 / Math.max(matched, 1)),
    accuracyPercent:       Math.round(acc),
    trackingErrorPx:       0,
    visualAttentionScore:  Math.round(acc * 0.65 + Math.min(100, matched * 12) * 0.35),
    saccadicSpeedEstimate: parseFloat((matched / Math.max(elapsed, 1)).toFixed(2)),
    taskCompletionMs:      Math.round(performance.now() - startMs),
    arpContribution:       5,
  }
}

export default function KelimeEslestirme({
  difficulty, durationSeconds, onComplete, onExit,
}: EyeExerciseProps) {
  const [cards, setCards]       = useState<Card[]>(buildCards)
  const [selected, setSelected] = useState<number[]>([])
  const [matched, setMatched]   = useState(0)
  const [attempts, setAttempts] = useState(0)
  const { playHit, playMiss, playFlip, playSuccess } = useEyeSoundFeedback()
  const startMs = useRef(performance.now())
  const matchRef = useRef(0)
  const attRef   = useRef(0)

  const handlePress = useCallback((id: number) => {
    setCards(prev => {
      const card = prev.find(c => c.id === id)
      if (!card || card.matched || card.flipped) return prev
      return prev.map(c => c.id === id ? { ...c, flipped: true } : c)
    })

    setSelected(prev => {
      const next = [...prev, id]
      if (next.length === 2) {
        attRef.current++
        setAttempts(attRef.current)
        const [a, b] = next.map(sid => cards.find(c => c.id === sid)!)
        if (a && b && a.pairId === b.pairId && a.type !== b.type) {
          // Match!
          matchRef.current++
          setMatched(matchRef.current)
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
          playHit()
          setCards(prev => prev.map(c => (c.id === a.id || c.id === b.id) ? { ...c, matched: true } : c))
          if (matchRef.current >= 8) {
            playSuccess()
            const m = calcMetrics(matchRef.current, attRef.current, startMs.current)
            setTimeout(() => onComplete(m), 600)
          }
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
          playMiss()
          setTimeout(() => {
            setCards(prev => prev.map(c =>
              (next.includes(c.id) && !c.matched) ? { ...c, flipped: false } : c,
            ))
          }, 900)
        }
        return []
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      playFlip()
      return next
    })
  }, [cards, onComplete])

  return (
    <SafeAreaView style={s.root}>
      <TouchableOpacity style={s.exitBtn} onPress={onExit}>
        <Text style={s.exitTxt}>✕</Text>
      </TouchableOpacity>

      <Text style={s.title}>Kelime Eşleştirme</Text>
      <View style={s.stats}>
        <Text style={s.statTxt}>✓ {matched}/8 çift</Text>
        <Text style={s.statSep}>·</Text>
        <Text style={s.statTxtAtt}>{attempts} deneme</Text>
      </View>

      <View style={s.grid}>
        {cards.map(card => (
          <TouchableOpacity
            key={card.id}
            style={[
              s.cell,
              card.flipped && !card.matched && s.cellFlipped,
              card.matched && s.cellMatched,
            ]}
            onPressIn={() => handlePress(card.id)}
            hitSlop={6}
            activeOpacity={0.8}
            disabled={card.matched || card.flipped}
          >
            {card.flipped || card.matched ? (
              <>
                <Text style={[s.cellTxt, card.matched && s.cellTxtMatched]}>{card.text}</Text>
                <View style={[s.cellTag, { backgroundColor: card.type === 'word' ? 'rgba(24,119,242,0.2)' : 'rgba(0,200,83,0.2)' }]}>
                  <Text style={[s.cellTagTxt, { color: card.type === 'word' ? ACCENT : '#00C853' }]}>
                    {card.type === 'word' ? 'Kelime' : 'Anlam'}
                  </Text>
                </View>
              </>
            ) : (
              <Text style={s.cellBack}>?</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <Text style={s.hint}>Türkçe kelimeyi anlamıyla eşleştir!</Text>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root:     { flex: 1, backgroundColor: '#0A0F1F', alignItems: 'center' },
  exitBtn:  { position: 'absolute', top: 52, right: 20, zIndex: 10, padding: 8 },
  exitTxt:  { color: 'rgba(255,255,255,0.5)', fontSize: 18 },
  title:    { marginTop: 56, fontSize: 22, fontWeight: '800', color: '#FFFFFF', marginBottom: 8 },
  stats:    { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 20 },
  statTxt:  { color: '#00C853', fontSize: 16, fontWeight: '700' },
  statSep:  { color: 'rgba(255,255,255,0.3)', fontSize: 16 },
  statTxtAtt:{ color: 'rgba(255,255,255,0.45)', fontSize: 14 },
  grid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingHorizontal: 20, justifyContent: 'center' },
  cell:     { width: CELL_SIZE, height: CELL_SIZE, backgroundColor: '#162040', borderRadius: 10, borderWidth: 1.5, borderColor: 'rgba(24,119,242,0.25)', alignItems: 'center', justifyContent: 'center', padding: 4 },
  cellFlipped:{ backgroundColor: '#0F2050', borderColor: ACCENT },
  cellMatched:{ backgroundColor: 'rgba(0,200,83,0.15)', borderColor: '#00C853' },
  cellTxt:  { color: '#FFFFFF', fontSize: 12, fontWeight: '700', textAlign: 'center' },
  cellTxtMatched:{ color: '#00C853' },
  cellTag:  { borderRadius: 4, paddingHorizontal: 4, paddingVertical: 2, marginTop: 4 },
  cellTagTxt:{ fontSize: 9, fontWeight: '700' },
  cellBack: { color: ACCENT, fontSize: 22, fontWeight: '900' },
  hint:     { fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 20 },
})
