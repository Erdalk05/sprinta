/**
 * GenisleyenHalkaOdagi — Çevresel Görüş (Periferik) Egzersizi
 *
 * Merkez noktaya odaklan.
 * Genişleyen halka büyüyünce içindeki rengi/şekli gör.
 * 4 şıktan doğrusunu seç.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions, SafeAreaView,
} from 'react-native'
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, Easing,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import type { EyeExerciseProps, EyeMetrics } from '@sprinta/shared'

const { width: SW } = Dimensions.get('window')
const BG = '#0A0F1F'
const ACCENT = '#00B890'   // Çevresel Görüş (Periferik) rengi

const COLORS = ['Kırmızı', 'Sarı', 'Yeşil', 'Mavi']
const COLOR_MAP: Record<string, string> = {
  Kırmızı: '#EF4444',
  Sarı:    '#EAB308',
  Yeşil:   '#22C55E',
  Mavi:    '#3B82F6',
}

function shuffleChoices(correct: string): string[] {
  const pool = COLORS.filter(c => c !== correct)
  const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, 3)
  const all = [...shuffled, correct].sort(() => Math.random() - 0.5)
  return all
}

type Phase = 'expand' | 'choose' | 'feedback'

const MAX_RING = SW * 0.45

export default function GenisleyenHalkaOdagi({
  durationSeconds,
  onComplete,
  onExit,
}: EyeExerciseProps) {
  const startTime = useRef(performance.now())
  const [elapsed, setElapsed] = useState(0)
  const [round, setRound] = useState(0)
  const [phase, setPhase] = useState<Phase>('expand')
  const [correctColor, setCorrectColor] = useState('Kırmızı')
  const [choices, setChoices] = useState(shuffleChoices('Kırmızı'))
  const [score, setScore] = useState(0)
  const [errors, setErrors] = useState(0)
  const reactionTimes = useRef<number[]>([])
  const choiceShownAt = useRef(0)
  const finished = useRef(false)

  const ringScale = useSharedValue(0)
  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity:   Math.min(1, ringScale.value * 3),
  }))

  // ── Timer ──────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      const e = (performance.now() - startTime.current) / 1000
      setElapsed(e)
      if (e >= durationSeconds && !finished.current) {
        finished.current = true
        clearInterval(interval)
        finishExercise()
      }
    }, 500)
    return () => clearInterval(interval)
  }, [durationSeconds])

  // ── Tur başlatıcı ──────────────────────────────────────────────
  useEffect(() => {
    if (finished.current) return
    startNewRound()
  }, [round])

  function startNewRound() {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)]
    setCorrectColor(color)
    setChoices(shuffleChoices(color))
    setPhase('expand')
    ringScale.value = 0
    ringScale.value = withTiming(1, { duration: 2000, easing: Easing.out(Easing.quad) }, () => {})
    // Görme penceresi 600ms açık → kapat → seçim
    setTimeout(() => {
      choiceShownAt.current = performance.now()
      setPhase('choose')
    }, 2400)
  }

  function handleChoice(choice: string) {
    if (phase !== 'choose' || finished.current) return
    const rt = performance.now() - choiceShownAt.current
    reactionTimes.current.push(rt)

    if (choice === correctColor) {
      setScore(s => s + 1)
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    } else {
      setErrors(e => e + 1)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }

    setPhase('feedback')
    setTimeout(() => {
      if (!finished.current) setRound(r => r + 1)
    }, 500)
  }

  const finishExercise = useCallback(() => {
    const rts = reactionTimes.current
    const total = score + errors
    const avgRt = rts.length ? rts.reduce((a, b) => a + b, 0) / rts.length : 999
    const accuracy = total > 0 ? (score / total) * 100 : 0
    const speed = Math.max(0, Math.min(100, (1 - avgRt / 3000) * 100))

    const metrics: EyeMetrics = {
      reactionTimeMs:        avgRt,
      accuracyPercent:       accuracy,
      trackingErrorPx:       0,
      visualAttentionScore:  accuracy * 0.6 + speed * 0.4,
      saccadicSpeedEstimate: 0,
      taskCompletionMs:      performance.now() - startTime.current,
      arpContribution:       4,
    }
    onComplete(metrics)
  }, [score, errors, onComplete])

  const timeLeft = Math.max(0, durationSeconds - Math.floor(elapsed))

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onExit} style={styles.exitBtn}>
          <Text style={styles.exitText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.timerText}>{timeLeft}sn</Text>
        <Text style={styles.scoreText}>✓ {score}</Text>
      </View>

      <View style={styles.titleRow}>
        <Text style={styles.title}>Genişleyen Halka Odağı</Text>
        <Text style={styles.subtitle}>Çevresel Görüş (Periferik) · Merkeze bak!</Text>
      </View>

      {/* Merkez alan */}
      <View style={styles.centerArea}>
        {/* Genişleyen renkli halka */}
        <Animated.View style={[styles.ring, ringStyle,
          { borderColor: phase === 'feedback' ? COLOR_MAP[correctColor] : ACCENT }
        ]}>
          {/* Merkez nokta (sabit) */}
          <View style={styles.centerDot} />
          {/* Halka içinde renk göstergesi (expand fazında) */}
          {phase === 'expand' && (
            <View style={[styles.colorHint, { backgroundColor: COLOR_MAP[correctColor] }]} />
          )}
        </Animated.View>

        {/* Merkez nokta (sürekli görünür) */}
        <View style={styles.fixationDot} />
      </View>

      {/* Seçim butonları */}
      {(phase === 'choose' || phase === 'feedback') && (
        <View style={styles.choicesGrid}>
          <Text style={styles.choicesLabel}>Halkada gördüğün renk?</Text>
          <View style={styles.choicesRow}>
            {choices.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.choiceBtn,
                  { borderColor: COLOR_MAP[c] },
                  phase === 'feedback' && c === correctColor && styles.choiceBtnCorrect,
                ]}
                onPressIn={() => handleChoice(c)}
                activeOpacity={0.75}
              >
                <View style={[styles.colorCircle, { backgroundColor: COLOR_MAP[c] }]} />
                <Text style={styles.choiceText}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {phase === 'expand' && (
        <View style={styles.bottomInfo}>
          <Text style={styles.infoText}>Merkez noktaya odaklan, halkanın rengini gör!</Text>
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8,
  },
  exitBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  exitText:  { color: '#fff', fontSize: 16 },
  timerText: { color: '#fff', fontSize: 24, fontWeight: '800' },
  scoreText: { color: ACCENT, fontSize: 18, fontWeight: '700' },

  titleRow:  { alignItems: 'center', marginBottom: 12 },
  title:     { color: '#fff', fontSize: 20, fontWeight: '800' },
  subtitle:  { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 4 },

  centerArea: {
    flex: 1,
    alignItems:     'center',
    justifyContent: 'center',
  },

  ring: {
    width:        MAX_RING * 2,
    height:       MAX_RING * 2,
    borderRadius: MAX_RING,
    borderWidth:  6,
    alignItems:   'center',
    justifyContent: 'center',
    position:     'absolute',
  },
  colorHint: {
    position:     'absolute',
    width:        40,
    height:       40,
    borderRadius: 20,
    top:          12,
  },
  centerDot: {
    width:           12,
    height:          12,
    borderRadius:    6,
    backgroundColor: '#FFFFFF',
  },
  fixationDot: {
    width:           16,
    height:          16,
    borderRadius:    8,
    backgroundColor: '#FFFFFF',
    borderWidth:     3,
    borderColor:     '#0A0F1F',
    shadowColor:     '#fff',
    shadowOffset:    { width: 0, height: 0 },
    shadowRadius:    8,
    shadowOpacity:   0.8,
  },

  choicesGrid: {
    paddingHorizontal: 20,
    paddingBottom:     24,
    gap:               12,
  },
  choicesLabel: {
    color:     'rgba(255,255,255,0.65)',
    fontSize:  14,
    textAlign: 'center',
  },
  choicesRow: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           10,
    justifyContent: 'center',
  },
  choiceBtn: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             8,
    borderRadius:    12,
    borderWidth:     2,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    minWidth:        130,
  },
  choiceBtnCorrect: { backgroundColor: 'rgba(0,184,144,0.2)' },
  colorCircle: {
    width: 18, height: 18, borderRadius: 9,
  },
  choiceText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  bottomInfo: { alignItems: 'center', paddingBottom: 30 },
  infoText:   { color: 'rgba(255,255,255,0.45)', fontSize: 13, textAlign: 'center', paddingHorizontal: 30 },
})
