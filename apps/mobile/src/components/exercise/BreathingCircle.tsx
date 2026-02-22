import React, { useState, useEffect, useRef } from 'react'
import { View, Text, Animated, StyleSheet } from 'react-native'
import * as Haptics from 'expo-haptics'
import { colors } from '../../constants/colors'

// 4-7-8 tekniği: 4 san nefes al, 7 san tut, 8 san bırak
const PHASES: Array<{ label: string; duration: number; scale: number }> = [
  { label: 'Nefes Al',  duration: 4, scale: 1.4 },
  { label: 'Tut',       duration: 7, scale: 1.4 },
  { label: 'Bırak',     duration: 8, scale: 0.8 },
]

const TOTAL_ROUNDS = 3

interface Props {
  onComplete: () => void
  onHalfway?: () => void
}

export function BreathingCircle({ onComplete, onHalfway }: Props) {
  const [round, setRound] = useState(1)
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [countdown, setCountdown] = useState(PHASES[0].duration)
  const scaleAnim = useRef(new Animated.Value(1)).current
  const halfwayFired = useRef(false)

  useEffect(() => {
    const phase = PHASES[phaseIndex]
    setCountdown(phase.duration)

    // Ölçek animasyonu
    Animated.timing(scaleAnim, {
      toValue: phase.scale,
      duration: phase.duration * 1000,
      useNativeDriver: true,
    }).start()

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

    // Geri sayım
    let remaining = phase.duration
    const interval = setInterval(() => {
      remaining -= 1
      setCountdown(remaining)
      if (remaining <= 0) {
        clearInterval(interval)
      }
    }, 1000)

    // Sonraki faza geç
    const timeout = setTimeout(() => {
      clearInterval(interval)
      const nextPhaseIndex = (phaseIndex + 1) % PHASES.length
      const nextRound = nextPhaseIndex === 0 ? round + 1 : round

      if (!halfwayFired.current && nextRound > Math.floor(TOTAL_ROUNDS / 2)) {
        halfwayFired.current = true
        onHalfway?.()
      }

      if (nextPhaseIndex === 0 && round >= TOTAL_ROUNDS) {
        onComplete()
      } else {
        setPhaseIndex(nextPhaseIndex)
        if (nextPhaseIndex === 0) setRound(nextRound)
      }
    }, phase.duration * 1000)

    return () => {
      clearTimeout(timeout)
      clearInterval(interval)
    }
  }, [phaseIndex, round])

  const phase = PHASES[phaseIndex]

  return (
    <View style={styles.container}>
      <Text style={styles.round}>Tur {round} / {TOTAL_ROUNDS}</Text>

      <View style={styles.circleContainer}>
        <Animated.View style={[styles.outerRing, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.innerCircle}>
            <Text style={styles.countdown}>{countdown}</Text>
          </View>
        </Animated.View>
      </View>

      <Text style={styles.phaseLabel}>{phase.label}</Text>

      <View style={styles.stepsContainer}>
        {PHASES.map((p, i) => (
          <View key={i} style={styles.step}>
            <View style={[styles.stepDot, i === phaseIndex && styles.stepDotActive]} />
            <Text style={[styles.stepText, i === phaseIndex && styles.stepTextActive]}>
              {p.label} {p.duration}s
            </Text>
          </View>
        ))}
      </View>

      <Text style={styles.hint}>Burnu kullanarak derin nefes al</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F9FF',
    padding: 32,
  },
  round: {
    fontSize: 14,
    color: '#0369A1',
    marginBottom: 48,
  },
  circleContainer: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  outerRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#BAE6FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#0EA5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdown: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.white,
  },
  phaseLabel: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0369A1',
    marginBottom: 32,
  },
  stepsContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 24,
  },
  step: {
    alignItems: 'center',
    gap: 6,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#BAE6FD',
  },
  stepDotActive: {
    backgroundColor: '#0EA5E9',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  stepText: {
    fontSize: 11,
    color: '#7DD3FC',
  },
  stepTextActive: {
    color: '#0369A1',
    fontWeight: '600',
  },
  hint: {
    fontSize: 13,
    color: '#7DD3FC',
    textAlign: 'center',
  },
})
