/**
 * CupOyunu — Karışık Bardak Oyunu (Göz Takibi / Smooth Pursuit)
 * Topu hangi bardağa sakladık? Karıştırmaları takip et, bul!
 */
import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, Animated,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import { useEyeSoundFeedback } from './useEyeSoundFeedback'
import type { EyeExerciseProps, EyeMetrics } from '@sprinta/shared'

const { width: SW, height: SH } = Dimensions.get('window')
const CUP_W  = 72
const CUP_H  = 88
const GAP    = 30
const START_X = [
  (SW - CUP_W * 3 - GAP * 2) / 2,
  (SW - CUP_W * 3 - GAP * 2) / 2 + CUP_W + GAP,
  (SW - CUP_W * 3 - GAP * 2) / 2 + (CUP_W + GAP) * 2,
]
const CUP_Y  = SH * 0.40
const ACCENT = '#6366F1'
const TOTAL_ROUNDS = 8

type Phase = 'reveal' | 'shuffle' | 'guess' | 'result'

function calcMetrics(hits: number, total: number, startMs: number): EyeMetrics {
  const acc = total > 0 ? (hits / total) * 100 : 0
  return {
    reactionTimeMs:        800,
    accuracyPercent:       Math.round(acc),
    trackingErrorPx:       0,
    visualAttentionScore:  Math.round(acc),
    saccadicSpeedEstimate: 0,
    taskCompletionMs:      Math.round(performance.now() - startMs),
    arpContribution:       4,
  }
}

export default function CupOyunu({
  difficulty, durationSeconds: _dur, onComplete, onExit,
}: EyeExerciseProps) {
  const shuffleCount  = [2, 3, 4, 5][difficulty - 1]
  const shuffleSpeed  = [700, 550, 400, 300][difficulty - 1]

  const [phase, setPhase] = useState<Phase>('reveal')
  const [round, setRound] = useState(1)
  const [score, setScore] = useState(0)
  const [ballIdx, setBallIdx] = useState(0)     // Hangi pozisyon numarasında top var
  const [positions, setPositions] = useState([0, 1, 2])  // positions[i] = visual_slot_of_cup_i
  const [guessResult, setGuessResult] = useState<'correct' | 'wrong' | null>(null)

  const { playHit, playMiss, playFlip, playAppear } = useEyeSoundFeedback()
  const ballVisible   = useRef(true)
  const totalHits     = useRef(0)
  const startMs       = useRef(performance.now())

  // Animated positions for 3 cups
  const animX0 = useRef(new Animated.Value(START_X[0])).current
  const animX1 = useRef(new Animated.Value(START_X[1])).current
  const animX2 = useRef(new Animated.Value(START_X[2])).current
  const animXs = [animX0, animX1, animX2]

  // Cup visibility (lifts during reveal)
  const animLift = useRef(new Animated.Value(0)).current

  const startReveal = useCallback(() => {
    setPhase('reveal')
    ballVisible.current = true
    const newBall = Math.floor(Math.random() * 3)
    playAppear()
    setBallIdx(newBall)
    setPositions([0, 1, 2])
    animX0.setValue(START_X[0])
    animX1.setValue(START_X[1])
    animX2.setValue(START_X[2])

    // Reveal: kaldır
    Animated.timing(animLift, { toValue: -30, duration: 300, useNativeDriver: true }).start(() => {
      setTimeout(() => {
        // Kapa
        Animated.timing(animLift, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
          setTimeout(() => runShuffle(newBall, [0, 1, 2], 0), 300)
        })
      }, 800)
    })
  }, [animLift, animX0, animX1, animX2])

  const runShuffle = useCallback((
    currentBall: number,
    currentPositions: number[],
    shufflesDone: number,
  ) => {
    if (shufflesDone >= shuffleCount) {
      setPhase('guess')
      return
    }
    // İki rastgele cup swap
    let a = Math.floor(Math.random() * 3)
    let b: number
    do { b = Math.floor(Math.random() * 3) } while (b === a)

    const newPos = [...currentPositions]
    const tmpSlot = newPos[a]; newPos[a] = newPos[b]; newPos[b] = tmpSlot

    // Eğer ball bu cup'lardan birindeyse ball index güncelle
    let newBall = currentBall
    if (currentBall === a) newBall = b
    else if (currentBall === b) newBall = a

    // Animate swap
    const targetA = START_X[newPos[a]]
    const targetB = START_X[newPos[b]]

    const midY = CUP_Y - 50
    playFlip()
    Animated.parallel([
      Animated.sequence([
        Animated.timing(animXs[a], { toValue: targetA + 10, duration: shuffleSpeed * 0.4, useNativeDriver: false }),
        Animated.timing(animXs[a], { toValue: targetA, duration: shuffleSpeed * 0.6, useNativeDriver: false }),
      ]),
      Animated.sequence([
        Animated.timing(animXs[b], { toValue: targetB - 10, duration: shuffleSpeed * 0.4, useNativeDriver: false }),
        Animated.timing(animXs[b], { toValue: targetB, duration: shuffleSpeed * 0.6, useNativeDriver: false }),
      ]),
    ]).start(() => {
      setPositions(newPos)
      setBallIdx(newBall)
      setTimeout(() => runShuffle(newBall, newPos, shufflesDone + 1), 200)
    })
  }, [shuffleCount, shuffleSpeed, animXs])

  useEffect(() => { startReveal() }, [])

  const handleGuess = useCallback((cupIdx: number) => {
    if (phase !== 'guess') return
    const correct = cupIdx === ballIdx
    if (correct) {
      totalHits.current++
      setScore(s => s + 1)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      playHit()
      setGuessResult('correct')
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      playMiss()
      setGuessResult('wrong')
    }
    setPhase('result')

    setTimeout(() => {
      setGuessResult(null)
      if (round >= TOTAL_ROUNDS) {
        const metrics = calcMetrics(totalHits.current, TOTAL_ROUNDS, startMs.current)
        onComplete(metrics)
      } else {
        setRound(r => r + 1)
        startReveal()
      }
    }, 1200)
  }, [phase, ballIdx, round, startReveal, onComplete])

  return (
    <SafeAreaView style={s.root}>
      <TouchableOpacity style={s.exitBtn} onPress={onExit}>
        <Text style={s.exitTxt}>✕</Text>
      </TouchableOpacity>

      <Text style={s.title}>Karışık Bardak</Text>
      <View style={s.statsRow}>
        <Text style={s.statScore}>🎯 {score}/{round - 1 > 0 ? round - 1 : 0}</Text>
        <Text style={s.statRound}>Tur {round}/{TOTAL_ROUNDS}</Text>
      </View>

      <Text style={s.phaseHint}>
        {phase === 'reveal'  && '👀 Topu gör!'}
        {phase === 'shuffle' && '🔀 Takip et...'}
        {phase === 'guess'   && '❓ Hangi bardakta?'}
        {phase === 'result'  && (guessResult === 'correct' ? '✅ Doğru!' : '❌ Yanlış!')}
      </Text>

      {/* Bardaklar */}
      <View style={s.arena}>
        {[0, 1, 2].map(cupIdx => {
          const xAnim = animXs[cupIdx]
          const showBall = (phase === 'reveal') && cupIdx === ballIdx

          return (
            <Animated.View
              key={cupIdx}
              style={[s.cupWrap, { left: xAnim, top: CUP_Y }]}
            >
              {/* Top (sadece reveal fazında görünür) */}
              {showBall && (
                <Animated.View style={[s.ball, { transform: [{ translateY: animLift }] }]} />
              )}

              {/* Bardak */}
              <TouchableOpacity
                style={[
                  s.cup,
                  phase === 'result' && cupIdx === ballIdx && s.cupReveal,
                ]}
                onPress={() => handleGuess(cupIdx)}
                activeOpacity={phase === 'guess' ? 0.7 : 1}
              >
                <Text style={s.cupEmoji}>
                  {phase === 'result' && cupIdx === ballIdx ? '🎉' : '🎩'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )
        })}
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: '#0A0F1F', alignItems: 'center' },
  exitBtn: { position: 'absolute', top: 52, right: 20, zIndex: 10, padding: 8 },
  exitTxt: { color: 'rgba(255,255,255,0.5)', fontSize: 18 },
  title:   { marginTop: 56, fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  statsRow:{ flexDirection: 'row', gap: 32, marginTop: 8 },
  statScore:{ fontSize: 16, fontWeight: '700', color: '#4ADE80' },
  statRound:{ fontSize: 16, fontWeight: '700', color: ACCENT },
  phaseHint:{ fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginTop: 24 },
  arena:   { flex: 1, width: SW, position: 'relative' },
  cupWrap: { position: 'absolute', alignItems: 'center' },
  ball:    {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#FFD700',
    shadowColor: '#FFD700', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9, shadowRadius: 8, elevation: 6,
    marginBottom: 4,
  },
  cup:     {
    width: CUP_W, height: CUP_H,
    backgroundColor: '#1A1F3E',
    borderRadius: 14, borderWidth: 2, borderColor: ACCENT,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: ACCENT, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  cupReveal:{ backgroundColor: '#1A3A1A', borderColor: '#4ADE80' },
  cupEmoji: { fontSize: 36 },
})
