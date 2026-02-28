/**
 * DiagonalLaserDash — Çapraz Lazer Koşusu
 * Nokta ekranda çapraz yönde zıplar. Noktaya dokun.
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
const LASER    = '#A855F7'

interface Props {
  level: DifficultyLevel
  onComplete: (m: RawMetrics) => void
  onExit: () => void
}

export default function DiagonalLaserDash({ level, onComplete, onExit }: Props) {
  const params  = useMemo(() => buildDifficultyParams(level), [level])
  const DOT_R   = Math.max(16, Math.floor(params.targetSize / 2))
  const spd     = params.animationSpeedMultiplier * 190
  const FIELD_W = W - 32
  const FIELD_H = H * 0.58

  const m = useRef({ hits: 0, misses: 0, total: 1, rts: [] as number[], spawnAt: Date.now() })
  const frameRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const velRef   = useRef({ vx: 1, vy: 1 })
  const [pos, setPos]   = useState({ x: DOT_R, y: DOT_R })
  const [hits, setHits] = useState(0)

  const MAXX = FIELD_W - DOT_R * 2
  const MAXY = FIELD_H - DOT_R * 2

  useEffect(() => {
    let x = DOT_R; let y = DOT_R; let last = Date.now()
    const tick = () => {
      const now = Date.now(); const dt = (now - last) / 1000; last = now
      x += velRef.current.vx * spd * dt
      y += velRef.current.vy * spd * dt
      let bounced = false
      if (x <= 0)    { x = 0;    velRef.current.vx =  1; bounced = true }
      if (x >= MAXX) { x = MAXX; velRef.current.vx = -1; bounced = true }
      if (y <= 0)    { y = 0;    velRef.current.vy =  1; bounced = true }
      if (y >= MAXY) { y = MAXY; velRef.current.vy = -1; bounced = true }
      if (bounced) { m.current.total++; m.current.spawnAt = Date.now() }
      setPos({ x, y })
      frameRef.current = setTimeout(tick, 16)
    }
    frameRef.current = setTimeout(tick, 16)
    return () => { if (frameRef.current) clearTimeout(frameRef.current) }
  }, [MAXX, MAXY, spd])

  const handleTimerEnd = useCallback(() => {
    if (frameRef.current) clearTimeout(frameRef.current)
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

  const handleDot = useCallback(() => {
    m.current.hits++; m.current.rts.push(Math.min(Date.now() - m.current.spawnAt, 1200))
    setHits(h => h + 1); Haptics.selectionAsync()
  }, [])

  const handleMiss = useCallback(() => {
    m.current.misses++
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
  }, [])

  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={onExit}><Text style={s.exit}>✕</Text></TouchableOpacity>
        <Text style={s.title}>Çapraz Lazer Koşusu</Text>
        <Text style={s.score}>{hits} ✓</Text>
      </View>
      <View style={s.barWrap}>
        <ExerciseProgressBar durationSeconds={params.durationSeconds} onComplete={handleTimerEnd} />
      </View>
      <TouchableOpacity style={[s.field, { height: FIELD_H }]} onPress={handleMiss} activeOpacity={1}>
        <TouchableOpacity
          style={[s.dot, { left: pos.x, top: pos.y, width: DOT_R * 2, height: DOT_R * 2, borderRadius: DOT_R }]}
          onPress={handleDot}
          hitSlop={{ top: 12, left: 12, right: 12, bottom: 12 }}
        />
        <Text style={s.hint}>Lazer noktasına dokun</Text>
      </TouchableOpacity>
    </View>
  )
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: DARK_BG },
  header:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 52 },
  exit:    { fontSize: 22, color: '#8696A0' },
  title:   { fontSize: 15, fontWeight: '800', color: LASER },
  score:   { fontSize: 16, fontWeight: '800', color: '#00FF94' },
  barWrap: { paddingHorizontal: 16, marginBottom: 8 },
  field:   {
    marginHorizontal: 16, marginBottom: 24,
    backgroundColor: '#0E1628', borderRadius: 20, borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.15)', overflow: 'hidden',
  },
  dot: {
    position: 'absolute', backgroundColor: LASER,
    shadowColor: LASER, shadowOffset: { width: 0, height: 0 }, shadowRadius: 14, shadowOpacity: 1, elevation: 10,
  },
  hint: { position: 'absolute', bottom: 14, alignSelf: 'center', fontSize: 12, color: '#8696A0' },
})
