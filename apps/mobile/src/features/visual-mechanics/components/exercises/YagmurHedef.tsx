/**
 * YagmurHedef — Yağmur Hedef (Periferik Flash)
 * Renkli daireler düşer → doğru renge dokun.
 * VM versiyonu: görsel (kelimesiz), saf renk-dikkat egzersizi.
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import { useAppTheme } from '../../../../theme/useAppTheme'
import type { ExerciseProps } from '../../../../components/exercises/types'
import type { DifficultyLevel } from '../../constants/exerciseConfig'
import { buildDifficultyParams } from '../../engines/difficultyEngine'
import type { RawMetrics } from '../../engines/scoringEngine'
import { ExerciseProgressBar } from '../ExerciseProgressBar'
import { useSoundFeedback } from '../../hooks/useSoundFeedback'

const { width: SW, height: SH } = Dimensions.get('window')
const NEON_CYAN = '#00F5FF'
const NEON_GREEN = '#00FF94'
const NEON_RED = '#FF3333'
const EXERCISE_BG = '#0A0F1F'

const COLORS = [NEON_CYAN, NEON_GREEN, '#F59E0B', '#A855F7']
const COLS = 3
const COL_W = SW / COLS
const BALL_R = 26

interface Ball {
  id: number
  col: number
  color: string
  isTarget: boolean
  anim: Animated.Value
}

let nextBallId = 0

interface YagmurHedefProps extends ExerciseProps {
  level: DifficultyLevel
  onComplete: (metrics: RawMetrics) => void
}

const YagmurHedef: React.FC<YagmurHedefProps> = ({ level, onComplete, onExit }) => {
  const t = useAppTheme()
  const { playHit, playMiss, resetCombo } = useSoundFeedback()
  const params = useMemo(() => buildDifficultyParams(level), [level])

  const [balls, setBalls] = useState<Ball[]>([])
  const [targetColor, setTargetColor] = useState(NEON_CYAN)
  const [displayHits, setDisplayHits] = useState(0)
  const [displayMisses, setDisplayMisses] = useState(0)

  const hitRef = useRef(0)
  const missRef = useRef(0)
  const reactionTimesRef = useRef<number[]>([])
  const startTimeRef = useRef(Date.now())
  const doneRef = useRef(false)

  const fallDuration = Math.round(2000 / params.animationSpeedMultiplier)
  const spawnMs = Math.round(900 / params.animationSpeedMultiplier)

  // Rotate target color periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (doneRef.current) return
      setTargetColor(COLORS[Math.floor(Math.random() * COLORS.length)])
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Spawn balls
  useEffect(() => {
    const spawn = setInterval(() => {
      if (doneRef.current) return
      const col = Math.floor(Math.random() * COLS)
      const color = COLORS[Math.floor(Math.random() * COLORS.length)]
      const anim = new Animated.Value(0)
      const id = nextBallId++
      setBalls(prev => [...prev.slice(-9), { id, col, color, isTarget: false, anim }])

      Animated.timing(anim, {
        toValue: 1,
        duration: fallDuration,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setBalls(prev => prev.filter(b => b.id !== id))
        }
      })
    }, spawnMs)
    return () => clearInterval(spawn)
  }, [fallDuration, spawnMs])

  const handleDone = useCallback(() => {
    if (doneRef.current) return
    doneRef.current = true
    const totalDurationMs = Date.now() - startTimeRef.current
    const rts = reactionTimesRef.current
    const avgRt = rts.length > 0 ? Math.round(rts.reduce((s, v) => s + v, 0) / rts.length) : 600
    const metrics: RawMetrics = {
      correctFocusDurationMs: hitRef.current * avgRt,
      totalDurationMs,
      reactionTimeMs: avgRt,
      errorCount: missRef.current,
      totalTargets: Math.max(1, hitRef.current + missRef.current),
      fatigueIndex: Math.min(1, (totalDurationMs / (params.durationSeconds * 1000)) * 0.15),
    }
    resetCombo()
    onComplete(metrics)
  }, [params.durationSeconds, onComplete])

  const handleBallPress = useCallback((id: number, color: string, tapTime: number) => {
    if (doneRef.current) return
    setBalls(prev => prev.filter(b => b.id !== id))
    if (color === targetColor) {
      reactionTimesRef.current.push(Date.now() - tapTime)
      hitRef.current++
      setDisplayHits(h => h + 1)
      void Haptics.selectionAsync()
      playHit()
    } else {
      missRef.current++
      setDisplayMisses(m => m + 1)
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      playMiss()
    }
  }, [targetColor, playHit, playMiss])

  const FALL = SH * 0.6

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onExit} style={styles.exitBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.exitText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Yağmur Hedef</Text>
        <View style={styles.exitBtn} />
      </View>

      <View style={styles.progressContainer}>
        <ExerciseProgressBar durationSeconds={params.durationSeconds} onComplete={handleDone} />
      </View>

      <View style={styles.targetRow}>
        <Text style={styles.targetLabel}>Hedef renk:</Text>
        <View style={[styles.targetSwatch, { backgroundColor: targetColor, shadowColor: targetColor }]} />
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statChip}>
          <Text style={[styles.statValue, { color: NEON_GREEN }]}>{displayHits}</Text>
          <Text style={[styles.statLabel, { color: t.colors.textHint }]}>Doğru</Text>
        </View>
        <View style={styles.statChip}>
          <Text style={[styles.statValue, { color: NEON_RED }]}>{displayMisses}</Text>
          <Text style={[styles.statLabel, { color: t.colors.textHint }]}>Hata</Text>
        </View>
      </View>

      <View style={styles.arena} pointerEvents="box-none">
        {balls.map(ball => {
          const tapTime = Date.now()
          const cx = COL_W * ball.col + COL_W / 2 - BALL_R
          const ty = ball.anim.interpolate({ inputRange: [0, 1], outputRange: [-BALL_R * 2, FALL] })
          return (
            <Animated.View key={ball.id} style={[styles.ballWrap, { left: cx, transform: [{ translateY: ty }] }]}>
              <TouchableOpacity
                style={[styles.ball, { backgroundColor: ball.color + '22', borderColor: ball.color, shadowColor: ball.color }]}
                onPress={() => handleBallPress(ball.id, ball.color, tapTime)}
                activeOpacity={0.7}
              />
            </Animated.View>
          )
        })}
      </View>

      <Text style={[styles.instruction, { color: t.colors.textHint }]}>
        Hedef renkli topları yakala!
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: EXERCISE_BG, alignItems: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    width: '100%', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8,
  },
  exitBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  exitText: { fontSize: 20, color: '#8696A0', fontWeight: '300' },
  title: { fontSize: 16, fontWeight: '700', color: NEON_CYAN, letterSpacing: 0.5 },
  progressContainer: { width: '100%', paddingHorizontal: 16, marginBottom: 8 },
  targetRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  targetLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
  targetSwatch: {
    width: 32, height: 32, borderRadius: 16,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 8, elevation: 6,
  },
  statsRow: { flexDirection: 'row', gap: 32, marginBottom: 8 },
  statChip: { alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 11, marginTop: 2 },
  arena: { flex: 1, width: SW, position: 'relative', overflow: 'hidden' },
  ballWrap: { position: 'absolute', top: 0, width: BALL_R * 2, height: BALL_R * 2 },
  ball: {
    width: BALL_R * 2, height: BALL_R * 2, borderRadius: BALL_R,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 10, elevation: 8,
  },
  instruction: { marginTop: 12, marginBottom: 24, fontSize: 13, letterSpacing: 0.5, opacity: 0.7 },
})

export default YagmurHedef
