/**
 * RakamSprint — Göz Atlaması (Sakkadik) Egzersizi
 *
 * 10 tur: merkeze büyük rakam flash (300ms görünür).
 * Kullanıcı: TEK / ÇİFT seçer.
 * Hız + doğruluk ölçülür.
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

const BG = '#0A0F1F'
const ACCENT = '#1877F2'
const TOTAL_ROUNDS = 10

type Phase = 'waiting' | 'flash' | 'choose' | 'feedback' | 'done'

export default function RakamSprint({
  durationSeconds,
  onComplete,
  onExit,
}: EyeExerciseProps) {
  const { playHit, playMiss, playAppear } = useEyeSoundFeedback()
  const startTime = useRef(performance.now())
  const [elapsed, setElapsed] = useState(0)
  const [round, setRound] = useState(0)          // 0-based
  const [phase, setPhase] = useState<Phase>('waiting')
  const [currentNum, setCurrentNum] = useState<number | null>(null)
  const [correct, setCorrect] = useState(0)
  const [wrong, setWrong] = useState(0)
  const [lastFeedback, setLastFeedback] = useState<'ok' | 'err' | null>(null)
  const reactionTimes = useRef<number[]>([])
  const flashAt = useRef(0)
  const finished = useRef(false)

  const numOpacity = useSharedValue(0)
  const numStyle = useAnimatedStyle(() => ({ opacity: numOpacity.value }))

  // ── Timer ──────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      const e = (performance.now() - startTime.current) / 1000
      setElapsed(e)
      if (e >= durationSeconds && !finished.current && phase !== 'done') {
        finished.current = true
        clearInterval(interval)
        finishExercise()
      }
    }, 500)
    return () => clearInterval(interval)
  }, [durationSeconds, phase])

  // ── Tur başlatıcı ──────────────────────────────────────────────
  useEffect(() => {
    if (phase === 'waiting' && round < TOTAL_ROUNDS) {
      const t = setTimeout(() => startRound(), 400)
      return () => clearTimeout(t)
    }
  }, [phase, round])

  function startRound() {
    const num = Math.floor(Math.random() * 98) + 1   // 1–98
    setCurrentNum(num)
    setPhase('flash')
    playAppear()
    flashAt.current = performance.now()

    numOpacity.value = withSequence(
      withTiming(1, { duration: 100 }),
      withTiming(1, { duration: 250 }),
      withTiming(0, { duration: 100 }),
    )

    // Flash biter → seçim
    setTimeout(() => setPhase('choose'), 450)
  }

  function handleChoice(choice: 'tek' | 'cift') {
    if (phase !== 'choose' || currentNum === null || finished.current) return
    const rt = performance.now() - flashAt.current
    reactionTimes.current.push(rt)

    const isOdd = currentNum % 2 !== 0
    const isCorrect = (choice === 'tek' && isOdd) || (choice === 'cift' && !isOdd)

    if (isCorrect) {
      setCorrect(c => c + 1)
      setLastFeedback('ok')
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      playHit()
    } else {
      setWrong(w => w + 1)
      setLastFeedback('err')
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      playMiss()
    }

    setPhase('feedback')
    const nextRound = round + 1
    setTimeout(() => {
      setLastFeedback(null)
      setCurrentNum(null)
      if (nextRound >= TOTAL_ROUNDS && !finished.current) {
        finished.current = true
        finishExercise()
      } else {
        setRound(nextRound)
        setPhase('waiting')
      }
    }, 400)
  }

  const finishExercise = useCallback(() => {
    const rts = reactionTimes.current
    const total = correct + wrong
    const avgRt = rts.length ? rts.reduce((a, b) => a + b, 0) / rts.length : 999
    const accuracy = total > 0 ? (correct / total) * 100 : 0
    const speed = Math.max(0, Math.min(100, (1 - avgRt / 1000) * 100))

    const metrics: EyeMetrics = {
      reactionTimeMs:        avgRt,
      accuracyPercent:       accuracy,
      trackingErrorPx:       0,
      visualAttentionScore:  accuracy * 0.6 + speed * 0.4,
      saccadicSpeedEstimate: total / durationSeconds,
      taskCompletionMs:      performance.now() - startTime.current,
      arpContribution:       4,
    }
    onComplete(metrics)
  }, [correct, wrong, durationSeconds, onComplete])

  const timeLeft = Math.max(0, durationSeconds - Math.floor(elapsed))

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onExit} style={styles.exitBtn}>
          <Text style={styles.exitText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.timerText}>{timeLeft}sn</Text>
        <Text style={styles.roundText}>{round + 1}/{TOTAL_ROUNDS}</Text>
      </View>

      <View style={styles.titleRow}>
        <Text style={styles.title}>Rakam Sprint</Text>
        <Text style={styles.subtitle}>Göz Atlaması (Sakkadik) · Tek mi? Çift mi?</Text>
      </View>

      {/* Flash rakam */}
      <View style={styles.flashArea}>
        {currentNum !== null && (
          <Animated.Text style={[styles.flashNum, numStyle]}>
            {currentNum}
          </Animated.Text>
        )}
        {currentNum === null && phase === 'waiting' && (
          <Text style={styles.readyText}>Hazır...</Text>
        )}

        {/* Feedback */}
        {lastFeedback === 'ok'  && <Text style={styles.feedbackOk}>✓</Text>}
        {lastFeedback === 'err' && <Text style={styles.feedbackErr}>✗</Text>}
      </View>

      {/* Seçim butonları */}
      <View style={styles.btnRow}>
        <TouchableOpacity
          style={[styles.choiceBtn, styles.oddBtn, phase !== 'choose' && styles.btnDisabled]}
          onPressIn={() => handleChoice('tek')}
          disabled={phase !== 'choose'}
          activeOpacity={0.7}
        >
          <Text style={styles.choiceBtnText}>TEK</Text>
          <Text style={styles.choiceBtnSub}>1, 3, 5...</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.choiceBtn, styles.evenBtn, phase !== 'choose' && styles.btnDisabled]}
          onPressIn={() => handleChoice('cift')}
          disabled={phase !== 'choose'}
          activeOpacity={0.7}
        >
          <Text style={styles.choiceBtnText}>ÇİFT</Text>
          <Text style={styles.choiceBtnSub}>2, 4, 6...</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomInfo}>
        <Text style={styles.correctText}>✓ {correct}</Text>
        <Text style={styles.wrongText}>✗ {wrong}</Text>
      </View>
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
  exitText:   { color: '#fff', fontSize: 16 },
  timerText:  { color: '#fff', fontSize: 24, fontWeight: '800' },
  roundText:  { color: 'rgba(255,255,255,0.6)', fontSize: 16, fontWeight: '700' },

  titleRow:  { alignItems: 'center', marginBottom: 20 },
  title:     { color: '#fff', fontSize: 20, fontWeight: '800' },
  subtitle:  { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 4 },

  flashArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  flashNum: {
    color:      '#FFFFFF',
    fontSize:   120,
    fontWeight: '900',
    lineHeight: 130,
  },
  readyText: {
    color:    'rgba(255,255,255,0.25)',
    fontSize: 24,
  },
  feedbackOk:  { color: '#22C55E', fontSize: 48, fontWeight: '900', position: 'absolute', right: 40 },
  feedbackErr: { color: '#EF4444', fontSize: 48, fontWeight: '900', position: 'absolute', right: 40 },

  btnRow: {
    flexDirection: 'row',
    gap:           16,
    paddingHorizontal: 24,
    marginBottom:  24,
  },
  choiceBtn: {
    flex:           1,
    borderRadius:   16,
    paddingVertical: 18,
    alignItems:     'center',
    gap:            4,
  },
  oddBtn:       { backgroundColor: 'rgba(24,119,242,0.25)', borderWidth: 2, borderColor: ACCENT },
  evenBtn:      { backgroundColor: 'rgba(255,159,28,0.20)', borderWidth: 2, borderColor: '#FF9F1C' },
  btnDisabled:  { opacity: 0.35 },
  choiceBtnText:{ color: '#FFFFFF', fontSize: 22, fontWeight: '900' },
  choiceBtnSub: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },

  bottomInfo:   { flexDirection: 'row', justifyContent: 'center', gap: 32, paddingBottom: 30 },
  correctText:  { color: '#22C55E', fontSize: 18, fontWeight: '700' },
  wrongText:    { color: '#EF4444', fontSize: 18, fontWeight: '700' },
})
