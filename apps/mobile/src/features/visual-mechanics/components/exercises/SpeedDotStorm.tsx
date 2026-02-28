/**
 * SpeedDotStorm — Hız Nokta Fırtınası
 * Birden fazla nokta aynı anda rastgele konumlarda belirir.
 * Hepsine dokunmaya çalış — süre dolmadan!
 */
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import * as Haptics from 'expo-haptics'
import { buildDifficultyParams } from '../../engines/difficultyEngine'
import type { DifficultyLevel } from '../../constants/exerciseConfig'
import type { RawMetrics } from '../../engines/scoringEngine'
import { ExerciseProgressBar } from '../ExerciseProgressBar'

const { width: W, height: H } = Dimensions.get('window')
const DARK_BG  = '#0A0F1F'
const DOT_R    = 22
const FIELD_W  = W - 32
const FIELD_H  = H * 0.60

const COLORS   = ['#00F5FF', '#10B981', '#F59E0B', '#A855F7', '#EF4444', '#0EA5E9']

interface Dot { id: number; x: number; y: number; color: string }

interface Props {
  level: DifficultyLevel
  onComplete: (m: RawMetrics) => void
  onExit: () => void
}

let idSeed = 0

export default function SpeedDotStorm({ level, onComplete, onExit }: Props) {
  const params    = useMemo(() => buildDifficultyParams(level), [level])
  const dotCount  = Math.round(2 * params.targetCountMultiplier)
  const visibleMs = Math.max(500, Math.round(1400 / params.animationSpeedMultiplier))

  const m = useRef({ hits: 0, misses: 0, total: 0, rts: [] as number[], spawnAt: 0 })
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [dots, setDots] = useState<Dot[]>([])
  const [hits, setHits] = useState(0)

  const spawnWave = useCallback(() => {
    const wave: Dot[] = []
    for (let i = 0; i < dotCount; i++) {
      wave.push({
        id: ++idSeed,
        x: DOT_R + Math.random() * (FIELD_W - DOT_R * 3),
        y: DOT_R + Math.random() * (FIELD_H - DOT_R * 3),
        color: COLORS[i % COLORS.length],
      })
    }
    m.current.total += dotCount
    m.current.spawnAt = Date.now()
    setDots(wave)

    timerRef.current = setTimeout(() => {
      setDots(prev => {
        m.current.misses += prev.length
        return []
      })
      setTimeout(spawnWave, 350)
    }, visibleMs)
  }, [dotCount, visibleMs])

  useEffect(() => {
    const init = setTimeout(spawnWave, 500)
    return () => { clearTimeout(init); if (timerRef.current) clearTimeout(timerRef.current) }
  }, [spawnWave])

  const handleTimerEnd = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    const dur = params.durationSeconds * 1000
    const avg = m.current.rts.length
      ? Math.round(m.current.rts.reduce((a, b) => a + b, 0) / m.current.rts.length) : 400
    onComplete({
      correctFocusDurationMs: Math.round((m.current.hits / Math.max(m.current.total, 1)) * dur),
      totalDurationMs: dur, reactionTimeMs: avg,
      errorCount: m.current.misses, totalTargets: Math.max(m.current.total, 1),
      fatigueIndex: Math.min(1, m.current.misses / Math.max(m.current.total, 1)),
    })
  }, [params, onComplete])

  const handleDot = useCallback((id: number) => {
    m.current.hits++
    m.current.rts.push(Math.min(Date.now() - m.current.spawnAt, visibleMs))
    setHits(h => h + 1)
    setDots(prev => prev.filter(d => d.id !== id))
    Haptics.selectionAsync()
  }, [visibleMs])

  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={onExit}><Text style={s.exit}>✕</Text></TouchableOpacity>
        <Text style={s.title}>Hız Nokta Fırtınası</Text>
        <Text style={s.score}>{hits} ✓</Text>
      </View>
      <View style={s.barWrap}>
        <ExerciseProgressBar durationSeconds={params.durationSeconds} onComplete={handleTimerEnd} />
      </View>

      <View style={[s.field, { height: FIELD_H }]}>
        {dots.map(dot => (
          <TouchableOpacity
            key={dot.id}
            style={[s.dot, {
              left: dot.x - DOT_R, top: dot.y - DOT_R,
              width: DOT_R * 2, height: DOT_R * 2, borderRadius: DOT_R,
              backgroundColor: dot.color, shadowColor: dot.color,
            }]}
            onPress={() => handleDot(dot.id)}
            activeOpacity={0.6}
            hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
          />
        ))}
        <Text style={s.hint}>Hepsine dokun!</Text>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: DARK_BG },
  header:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 52 },
  exit:    { fontSize: 22, color: '#8696A0' },
  title:   { fontSize: 15, fontWeight: '800', color: '#00F5FF' },
  score:   { fontSize: 16, fontWeight: '800', color: '#00FF94' },
  barWrap: { paddingHorizontal: 16, marginBottom: 8 },
  field:   {
    marginHorizontal: 16, marginBottom: 24,
    backgroundColor: '#0E1628', borderRadius: 20, borderWidth: 1,
    borderColor: 'rgba(0,245,255,0.08)', overflow: 'hidden', position: 'relative',
  },
  dot: {
    position: 'absolute',
    shadowOffset: { width: 0, height: 0 }, shadowRadius: 12, shadowOpacity: 0.9, elevation: 10,
  },
  hint: { position: 'absolute', bottom: 12, alignSelf: 'center', fontSize: 12, color: '#8696A0' },
})
