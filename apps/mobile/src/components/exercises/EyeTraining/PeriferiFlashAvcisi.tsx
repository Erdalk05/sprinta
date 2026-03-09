/**
 * PeriferiFlashAvcisi — Çevresel Görüş (Periferik) Egzersizi
 *
 * Merkez noktaya bak.
 * Sol/Sağ kenardan bir hedef belirir (kaçınma veya sayma).
 * Kaç hedef gördüğünü say → Sayı gir.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions, SafeAreaView,
} from 'react-native'
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSequence,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { useEyeSoundFeedback } from './useEyeSoundFeedback'
import type { EyeExerciseProps, EyeMetrics } from '@sprinta/shared'

const { width: SW, height: SH } = Dimensions.get('window')
const BG = '#0A0F1F'
const ACCENT = '#00B890'
const DOT_SIZE = 36

type Side = 'left' | 'right' | 'both' | 'none'
type Phase = 'show' | 'choose'

function randomSide(): Side {
  const r = Math.random()
  if (r < 0.25) return 'left'
  if (r < 0.50) return 'right'
  if (r < 0.75) return 'both'
  return 'none'
}

function sideToCount(side: Side): number {
  if (side === 'none')  return 0
  if (side === 'both')  return 2
  return 1
}

export default function PeriferiFlashAvcisi({
  durationSeconds,
  onComplete,
  onExit,
}: EyeExerciseProps) {
  const { playHit, playMiss, playAppear } = useEyeSoundFeedback()
  const startTime = useRef(performance.now())
  const [elapsed, setElapsed] = useState(0)
  const [round, setRound] = useState(0)
  const [phase, setPhase] = useState<Phase>('show')
  const [side, setSide] = useState<Side>('left')
  const [correct, setCorrect] = useState(0)
  const [wrong, setWrong] = useState(0)
  const reactionTimes = useRef<number[]>([])
  const choiceAt = useRef(0)
  const finished = useRef(false)

  const leftOpacity  = useSharedValue(0)
  const rightOpacity = useSharedValue(0)
  const leftStyle  = useAnimatedStyle(() => ({ opacity: leftOpacity.value }))
  const rightStyle = useAnimatedStyle(() => ({ opacity: rightOpacity.value }))

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
    const s = randomSide()
    setSide(s)
    setPhase('show')

    leftOpacity.value  = 0
    rightOpacity.value = 0
    playAppear()

    if (s === 'left' || s === 'both') {
      leftOpacity.value = withSequence(
        withTiming(1, { duration: 100 }),
        withTiming(1, { duration: 500 }),
        withTiming(0, { duration: 100 }),
      )
    }
    if (s === 'right' || s === 'both') {
      rightOpacity.value = withSequence(
        withTiming(1, { duration: 100 }),
        withTiming(1, { duration: 500 }),
        withTiming(0, { duration: 100 }),
      )
    }

    // Flash bittikten sonra seçim
    const t = setTimeout(() => {
      choiceAt.current = performance.now()
      setPhase('choose')
    }, 800)
    return () => clearTimeout(t)
  }, [round])

  function handleChoice(n: number) {
    if (phase !== 'choose' || finished.current) return
    const rt = performance.now() - choiceAt.current
    reactionTimes.current.push(rt)

    if (n === sideToCount(side)) {
      setCorrect(c => c + 1)
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      playHit()
    } else {
      setWrong(w => w + 1)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      playMiss()
    }

    if (!finished.current) {
      setTimeout(() => setRound(r => r + 1), 350)
    }
  }

  const finishExercise = useCallback(() => {
    const rts = reactionTimes.current
    const total = correct + wrong
    const avgRt = rts.length ? rts.reduce((a, b) => a + b, 0) / rts.length : 999
    const accuracy = total > 0 ? (correct / total) * 100 : 0
    const speed = Math.max(0, Math.min(100, (1 - avgRt / 2000) * 100))

    const metrics: EyeMetrics = {
      reactionTimeMs:        avgRt,
      accuracyPercent:       accuracy,
      trackingErrorPx:       0,
      visualAttentionScore:  accuracy * 0.6 + speed * 0.4,
      saccadicSpeedEstimate: 0,
      taskCompletionMs:      performance.now() - startTime.current,
      arpContribution:       5,
    }
    onComplete(metrics)
  }, [correct, wrong, onComplete])

  const timeLeft = Math.max(0, durationSeconds - Math.floor(elapsed))

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onExit} style={styles.exitBtn}>
          <Text style={styles.exitText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.timerText}>{timeLeft}sn</Text>
        <Text style={styles.scoreText}>✓ {correct}</Text>
      </View>

      <View style={styles.titleRow}>
        <Text style={styles.title}>Periferi Flash Avcısı</Text>
        <Text style={styles.subtitle}>Çevresel Görüş (Periferik) · Merkeze bak!</Text>
      </View>

      {/* Flash sahne */}
      <View style={styles.scene}>
        {/* Sol hedef */}
        <Animated.View style={[styles.target, styles.targetLeft, leftStyle]}>
          <View style={styles.targetDot} />
        </Animated.View>

        {/* Merkez odak */}
        <View style={styles.fixation}>
          <View style={styles.fixationDot} />
          <Text style={styles.fixationLabel}>ODAK</Text>
        </View>

        {/* Sağ hedef */}
        <Animated.View style={[styles.target, styles.targetRight, rightStyle]}>
          <View style={styles.targetDot} />
        </Animated.View>
      </View>

      {/* Seçim */}
      {phase === 'choose' && (
        <View style={styles.choiceArea}>
          <Text style={styles.choiceLabel}>Kaç hedef gördün?</Text>
          <View style={styles.choiceRow}>
            {[0, 1, 2].map(n => (
              <TouchableOpacity
                key={n}
                style={styles.choiceBtn}
                onPress={() => handleChoice(n)}
                activeOpacity={0.75}
              >
                <Text style={styles.choiceBtnText}>{n}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {phase === 'show' && (
        <View style={styles.bottomInfo}>
          <Text style={styles.infoText}>Merkez noktaya bak — yan hedefleri say!</Text>
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

  titleRow: { alignItems: 'center', marginBottom: 12 },
  title:    { color: '#fff', fontSize: 20, fontWeight: '800' },
  subtitle: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 4 },

  scene: {
    flex: 1,
    flexDirection: 'row',
    alignItems:    'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginHorizontal: 8,
  },

  target: {
    width:  DOT_SIZE + 20,
    height: DOT_SIZE + 20,
    alignItems:     'center',
    justifyContent: 'center',
  },
  targetLeft:  {},
  targetRight: {},
  targetDot: {
    width:           DOT_SIZE,
    height:          DOT_SIZE,
    borderRadius:    DOT_SIZE / 2,
    backgroundColor: ACCENT,
    shadowColor:     ACCENT,
    shadowOffset:    { width: 0, height: 0 },
    shadowRadius:    12,
    shadowOpacity:   0.9,
    elevation:       8,
  },

  fixation: {
    alignItems: 'center',
    gap:        6,
  },
  fixationDot: {
    width:           20, height: 20, borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor:     '#fff',
    shadowOffset:    { width: 0, height: 0 },
    shadowRadius:    8,
    shadowOpacity:   0.9,
  },
  fixationLabel: {
    color:    'rgba(255,255,255,0.35)',
    fontSize: 10,
    letterSpacing: 1,
  },

  choiceArea: {
    alignItems:   'center',
    paddingBottom: 30,
    gap:           14,
  },
  choiceLabel: {
    color:    '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  choiceRow: {
    flexDirection: 'row',
    gap:           16,
  },
  choiceBtn: {
    width:          72, height: 72,
    borderRadius:   36,
    backgroundColor: 'rgba(0,184,144,0.18)',
    borderWidth:    2,
    borderColor:    ACCENT,
    alignItems:     'center',
    justifyContent: 'center',
  },
  choiceBtnText: { color: '#fff', fontSize: 26, fontWeight: '900' },

  bottomInfo: { alignItems: 'center', paddingBottom: 30 },
  infoText:   { color: 'rgba(255,255,255,0.45)', fontSize: 13 },
})
