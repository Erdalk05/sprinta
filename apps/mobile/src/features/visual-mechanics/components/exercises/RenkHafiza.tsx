/**
 * RenkHafiza — Renk Hafızası (Flash Matrix / Sakkadik)
 * Renk çiftlerini bul — görsel hafıza grid egzersizi
 */
import React, { useState, useCallback, useRef, useEffect } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import type { ExerciseProps } from '../../../../components/exercises/types'
import type { DifficultyLevel } from '../../constants/exerciseConfig'
import type { RawMetrics } from '../../engines/scoringEngine'

const { width: SW } = Dimensions.get('window')
const CARD_SIZE = Math.floor((SW - 80) / 4)

const COLORS = [
  { id: 'red',    bg: '#EF4444', label: '🔴' },
  { id: 'blue',   bg: '#3B82F6', label: '🔵' },
  { id: 'green',  bg: '#22C55E', label: '🟢' },
  { id: 'yellow', bg: '#EAB308', label: '🟡' },
  { id: 'purple', bg: '#A855F7', label: '🟣' },
  { id: 'orange', bg: '#F97316', label: '🟠' },
  { id: 'pink',   bg: '#EC4899', label: '🩷' },
  { id: 'teal',   bg: '#14B8A6', label: '🩵' },
]

interface Card {
  id: number
  colorId: string
  bg: string
  label: string
  matched: boolean
}

interface RenkHafizaProps extends ExerciseProps {
  level: DifficultyLevel
  onComplete: (metrics: RawMetrics) => void
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildDeck(pairs: number): Card[] {
  const selected = COLORS.slice(0, pairs)
  const raw = [...selected, ...selected].map((c, i) => ({
    id: i,
    colorId: c.id,
    bg: c.bg,
    label: c.label,
    matched: false,
  }))
  return shuffle(raw)
}

function calcMetrics(hits: number, total: number, flipCount: number, startMs: number): RawMetrics {
  const elapsed = Math.max(1, performance.now() - startMs)
  const wrongFlips = Math.max(0, flipCount - hits * 2)
  return {
    correctFocusDurationMs: Math.round(hits * 500),
    totalDurationMs:        Math.round(elapsed),
    reactionTimeMs:         Math.round(elapsed / Math.max(total, 1)),
    errorCount:             wrongFlips,
    totalTargets:           total,
    fatigueIndex:           0,
  }
}

const RenkHafiza: React.FC<RenkHafizaProps> = ({ level, onComplete, onExit }) => {
  const pairs = [4, 6, 7, 8][level - 1]
  const peekDuration = [1500, 1200, 900, 600][level - 1]
  const durationSeconds = [40, 50, 60, 70][level - 1]

  const [cards, setCards]           = useState<Card[]>(() => buildDeck(pairs))
  const [flipped, setFlipped]       = useState<number[]>([])
  const [peeking, setPeeking]       = useState(true)
  const [timeLeft, setTimeLeft]     = useState(durationSeconds)
  const [done, setDone]             = useState(false)
  const [matchCount, setMatchCount] = useState(0)

  const startMs    = useRef(performance.now())
  const hitsRef    = useRef(0)
  const totalRef   = useRef(0)
  const flipCount  = useRef(0)
  const lockRef    = useRef(false)

  // Peek phase — show all cards briefly
  useEffect(() => {
    if (!peeking) return
    setFlipped(cards.map(c => c.id))
    const t = setTimeout(() => {
      setFlipped([])
      setPeeking(false)
    }, peekDuration)
    return () => clearTimeout(t)
  }, [peekDuration])

  // Timer
  useEffect(() => {
    if (done || peeking) return
    const t = setInterval(() => {
      setTimeLeft(tl => {
        if (tl <= 1) { clearInterval(t); setDone(true); return 0 }
        return tl - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [done, peeking])

  // Done
  useEffect(() => {
    if (done) {
      const m = calcMetrics(hitsRef.current, totalRef.current, flipCount.current, startMs.current)
      setTimeout(() => onComplete(m), 300)
    }
  }, [done, onComplete])

  const handleFlip = useCallback((cardId: number) => {
    if (lockRef.current || peeking || done) return
    const card = cards.find(c => c.id === cardId)
    if (!card || card.matched || flipped.includes(cardId)) return

    flipCount.current++
    const newFlipped = [...flipped, cardId]
    setFlipped(newFlipped)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

    if (newFlipped.length === 2) {
      lockRef.current = true
      const [a, b] = newFlipped.map(id => cards.find(c => c.id === id)!)
      totalRef.current++

      if (a.colorId === b.colorId) {
        hitsRef.current++
        setMatchCount(m => m + 1)
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        setTimeout(() => {
          setCards(prev => prev.map(c => newFlipped.includes(c.id) ? { ...c, matched: true } : c))
          setFlipped([])
          lockRef.current = false
          if (hitsRef.current >= pairs) {
            setDone(true)
          }
        }, 500)
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        setTimeout(() => {
          setFlipped([])
          lockRef.current = false
        }, 1000)
      }
    }
  }, [peeking, done, cards, flipped, pairs])

  const isFlipped = (card: Card) => peeking || flipped.includes(card.id) || card.matched

  return (
    <SafeAreaView style={s.root}>
      <TouchableOpacity style={s.exitBtn} onPress={onExit}>
        <Text style={s.exitTxt}>✕</Text>
      </TouchableOpacity>

      <Text style={s.title}>Renk Hafızası</Text>

      <View style={s.header}>
        <Text style={s.matchTxt}>🎯 {matchCount}/{pairs}</Text>
        {peeking
          ? <Text style={s.peekTxt}>👁 Ezberle!</Text>
          : <Text style={s.timerTxt}>⏱ {timeLeft}s</Text>
        }
      </View>

      <View style={s.grid}>
        {cards.map(card => (
          <TouchableOpacity
            key={card.id}
            style={[
              s.card,
              { width: CARD_SIZE, height: CARD_SIZE },
              isFlipped(card) ? { backgroundColor: card.bg } : s.cardBack,
              card.matched && s.cardMatched,
            ]}
            onPress={() => handleFlip(card.id)}
            activeOpacity={0.8}
          >
            {isFlipped(card)
              ? <Text style={s.cardLabel}>{card.label}</Text>
              : <Text style={s.cardQuestion}>?</Text>
            }
          </TouchableOpacity>
        ))}
      </View>

      {peeking && <Text style={s.hint}>Renklerin yerini ezberle!</Text>}
    </SafeAreaView>
  )
}

export default RenkHafiza

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: '#0A0F1F', alignItems: 'center' },
  exitBtn:     { position: 'absolute', top: 52, right: 20, zIndex: 10, padding: 8 },
  exitTxt:     { color: 'rgba(255,255,255,0.5)', fontSize: 18 },
  title:       { marginTop: 56, fontSize: 22, fontWeight: '800', color: '#FFFFFF', marginBottom: 14 },
  header:      { flexDirection: 'row', gap: 24, alignItems: 'center', marginBottom: 24 },
  matchTxt:    { color: '#00C853', fontSize: 18, fontWeight: '700' },
  peekTxt:     { color: '#FFD700', fontSize: 16, fontWeight: '700' },
  timerTxt:    { color: '#0EA5E9', fontSize: 18, fontWeight: '700' },
  grid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', paddingHorizontal: 16 },
  card:        { borderRadius: 12, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
  cardBack:    { backgroundColor: '#1A2A4A', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)' },
  cardMatched: { opacity: 0.5 },
  cardLabel:   { fontSize: 28 },
  cardQuestion:{ color: 'rgba(255,255,255,0.3)', fontSize: 26, fontWeight: '900' },
  hint:        { color: '#FFD700', fontSize: 14, fontWeight: '700', marginTop: 20 },
})
