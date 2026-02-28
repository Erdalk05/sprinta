/**
 * RandomBlinkTrap — Rastgele Yanıp Sönme Tuzağı
 * Yeşil (gerçek) ve kırmızı (tuzak) noktalar belirir.
 * Yeşile dokun, kırmızıdan kaç.
 */
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import * as Haptics from 'expo-haptics'
import { buildDifficultyParams } from '../../engines/difficultyEngine'
import type { DifficultyLevel } from '../../constants/exerciseConfig'
import type { RawMetrics } from '../../engines/scoringEngine'
import { ExerciseProgressBar } from '../ExerciseProgressBar'

const { width: W, height: H } = Dimensions.get('window')
const DARK_BG   = '#0A0F1F'
const C_TARGET  = '#10B981'
const C_TRAP    = '#EF4444'
const DOT_R     = 24
const FIELD_W   = W - 32
const FIELD_H   = H * 0.60

interface Dot {
  id: number; x: number; y: number; isTarget: boolean
}

interface Props {
  level: DifficultyLevel
  onComplete: (m: RawMetrics) => void
  onExit: () => void
}

let dotIdCounter = 0

export default function RandomBlinkTrap({ level, onComplete, onExit }: Props) {
  const params    = useMemo(() => buildDifficultyParams(level), [level])
  const visibleMs = Math.max(600, Math.round(1500 / params.animationSpeedMultiplier))
  const trapCount = level >= 3 ? 2 : 1

  const m = useRef({ hits: 0, misses: 0, total: 0, rts: [] as number[], spawnAt: 0 })
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [dots, setDots] = useState<Dot[]>([])
  const [hits, setHits] = useState(0)

  const spawnWave = useCallback(() => {
    const targetCount = 1 + (level >= 2 ? 1 : 0)
    const newDots: Dot[] = []

    for (let i = 0; i < targetCount; i++) {
      newDots.push({
        id: ++dotIdCounter,
        x: DOT_R + Math.random() * (FIELD_W - DOT_R * 2),
        y: DOT_R + Math.random() * (FIELD_H - DOT_R * 2),
        isTarget: true,
      })
    }
    for (let i = 0; i < trapCount; i++) {
      newDots.push({
        id: ++dotIdCounter,
        x: DOT_R + Math.random() * (FIELD_W - DOT_R * 2),
        y: DOT_R + Math.random() * (FIELD_H - DOT_R * 2),
        isTarget: false,
      })
    }

    m.current.total += targetCount
    m.current.spawnAt = Date.now()
    setDots(newDots)

    timerRef.current = setTimeout(() => {
      // Untapped targets = misses
      setDots(prev => {
        const untapped = prev.filter(d => d.isTarget).length
        m.current.misses += untapped
        return []
      })
      setTimeout(spawnWave, 400)
    }, visibleMs)
  }, [level, trapCount, visibleMs])

  useEffect(() => {
    const init = setTimeout(spawnWave, 600)
    return () => { clearTimeout(init); if (timerRef.current) clearTimeout(timerRef.current) }
  }, [spawnWave])

  const handleTimerEnd = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    const dur = params.durationSeconds * 1000
    const avg = m.current.rts.length
      ? Math.round(m.current.rts.reduce((a, b) => a + b, 0) / m.current.rts.length) : 500
    onComplete({
      correctFocusDurationMs: Math.round((m.current.hits / Math.max(m.current.total, 1)) * dur),
      totalDurationMs: dur, reactionTimeMs: avg,
      errorCount: m.current.misses, totalTargets: Math.max(m.current.total, 1),
      fatigueIndex: Math.min(1, m.current.misses / Math.max(m.current.total, 1)),
    })
  }, [params, onComplete])

  const handleDot = useCallback((dot: Dot) => {
    if (dot.isTarget) {
      m.current.hits++; m.current.rts.push(Math.min(Date.now() - m.current.spawnAt, 1500))
      setHits(h => h + 1); Haptics.selectionAsync()
    } else {
      m.current.misses += 2  // tuzağa basmak daha büyük ceza
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }
    setDots(prev => prev.filter(d => d.id !== dot.id))
  }, [])

  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={onExit}><Text style={s.exit}>✕</Text></TouchableOpacity>
        <Text style={s.title}>Rastgele Yanıp Sönme Tuzağı</Text>
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
              backgroundColor: dot.isTarget ? C_TARGET : C_TRAP,
              shadowColor: dot.isTarget ? C_TARGET : C_TRAP,
            }]}
            onPress={() => handleDot(dot)}
            activeOpacity={0.7}
          />
        ))}
        <Text style={s.legend}>
          <Text style={{ color: C_TARGET }}>{'● Dokun  '}</Text>
          <Text style={{ color: C_TRAP }}>{'● Kaçın'}</Text>
        </Text>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: DARK_BG },
  header:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 52 },
  exit:    { fontSize: 22, color: '#8696A0' },
  title:   { fontSize: 14, fontWeight: '800', color: '#00F5FF' },
  score:   { fontSize: 16, fontWeight: '800', color: '#00FF94' },
  barWrap: { paddingHorizontal: 16, marginBottom: 8 },
  field:   {
    marginHorizontal: 16, marginBottom: 24,
    backgroundColor: '#0E1628', borderRadius: 20, borderWidth: 1,
    borderColor: 'rgba(0,245,255,0.08)', overflow: 'hidden', position: 'relative',
  },
  dot: {
    position: 'absolute', shadowOffset: { width: 0, height: 0 }, shadowRadius: 12, shadowOpacity: 0.9, elevation: 10,
  },
  legend: { position: 'absolute', bottom: 12, alignSelf: 'center', fontSize: 12 },
})
