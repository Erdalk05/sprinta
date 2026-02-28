/**
 * CircularOrbitChase — Dairesel Yörünge Takibi
 * Nokta daire boyunca döner. Sarı hedef yayına girerken dokun.
 */
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import * as Haptics from 'expo-haptics'
import { buildDifficultyParams } from '../../engines/difficultyEngine'
import type { DifficultyLevel } from '../../constants/exerciseConfig'
import type { RawMetrics } from '../../engines/scoringEngine'
import { ExerciseProgressBar } from '../ExerciseProgressBar'

const { width: W, height: H } = Dimensions.get('window')
const DARK_BG    = '#0A0F1F'
const DOT_COLOR  = '#0EA5E9'
const ZONE_COLOR = '#F59E0B'
const DOT_R      = 14

// Target zone: arc around angle 0 (right side of circle)
// Zone half-width in radians
const ZONE_HALF  = Math.PI / 6  // 30° each side = 60° total

interface Props {
  level: DifficultyLevel
  onComplete: (m: RawMetrics) => void
  onExit: () => void
}

export default function CircularOrbitChase({ level, onComplete, onExit }: Props) {
  const params   = useMemo(() => buildDifficultyParams(level), [level])
  const rps      = params.animationSpeedMultiplier * 0.55   // rotations per second
  const zoneHalf = ZONE_HALF / params.animationSpeedMultiplier

  const ARENA_SIZE = Math.min(W - 32, (H * 0.55))
  const CENTER     = ARENA_SIZE / 2
  const ORBIT_R    = CENTER * 0.72

  const m = useRef({ hits: 0, misses: 0, total: 0, rts: [] as number[], lastAt: 0 })
  const tRef       = useRef(0)
  const frameRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inZoneRef  = useRef(false)
  const [angle, setAngle] = useState(0)
  const [hits, setHits]   = useState(0)

  useEffect(() => {
    let last = Date.now()
    const tick = () => {
      const now = Date.now(); const dt = (now - last) / 1000; last = now
      tRef.current += dt * rps * Math.PI * 2
      const a = tRef.current % (Math.PI * 2)
      setAngle(a)

      // Zone: angle near 0 (right)
      const normalised = ((a + Math.PI) % (Math.PI * 2)) - Math.PI  // -π to π
      const wasIn = inZoneRef.current
      const isIn  = Math.abs(normalised) < zoneHalf
      inZoneRef.current = isIn
      if (!wasIn && isIn) { m.current.total++; m.current.lastAt = Date.now() }

      frameRef.current = setTimeout(tick, 16)
    }
    frameRef.current = setTimeout(tick, 16)
    return () => { if (frameRef.current) clearTimeout(frameRef.current) }
  }, [rps, zoneHalf])

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

  const handleTap = useCallback(() => {
    if (inZoneRef.current) {
      m.current.hits++; m.current.rts.push(Math.min(Date.now() - m.current.lastAt, 800))
      setHits(h => h + 1); Haptics.selectionAsync()
    } else {
      m.current.misses++
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }
  }, [])

  const dotX = CENTER + ORBIT_R * Math.cos(angle) - DOT_R
  const dotY = CENTER + ORBIT_R * Math.sin(angle) - DOT_R
  const inZone = inZoneRef.current

  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={onExit}><Text style={s.exit}>✕</Text></TouchableOpacity>
        <Text style={s.title}>Dairesel Yörünge Takibi</Text>
        <Text style={s.score}>{hits} ✓</Text>
      </View>
      <View style={s.barWrap}>
        <ExerciseProgressBar durationSeconds={params.durationSeconds} onComplete={handleTimerEnd} />
      </View>

      <TouchableOpacity
        style={[s.arena, { width: ARENA_SIZE, height: ARENA_SIZE }]}
        onPress={handleTap}
        activeOpacity={1}
      >
        {/* Orbit circle */}
        <View style={[s.orbitRing, {
          width: ORBIT_R * 2, height: ORBIT_R * 2, borderRadius: ORBIT_R,
          left: CENTER - ORBIT_R, top: CENTER - ORBIT_R,
        }]} />

        {/* Target zone marker (right side) */}
        <View style={[s.zoneMarker, {
          right: CENTER - ORBIT_R - 8,
          top: CENTER - 18,
          backgroundColor: inZone ? ZONE_COLOR : 'rgba(245,158,11,0.25)',
        }]} />

        {/* Moving dot */}
        <View style={[s.dot, {
          left: dotX, top: dotY,
          width: DOT_R * 2, height: DOT_R * 2, borderRadius: DOT_R,
          backgroundColor: inZone ? ZONE_COLOR : DOT_COLOR,
          shadowColor: inZone ? ZONE_COLOR : DOT_COLOR,
        }]} />

        {/* Center point */}
        <View style={[s.center, { left: CENTER - 4, top: CENTER - 4 }]} />

        <Text style={s.hint}>Sarı bölgeye girerken dokun</Text>
      </TouchableOpacity>
    </View>
  )
}

const s = StyleSheet.create({
  root:       { flex: 1, backgroundColor: DARK_BG, alignItems: 'center' },
  header:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 52, alignSelf: 'stretch' },
  exit:       { fontSize: 22, color: '#8696A0' },
  title:      { fontSize: 15, fontWeight: '800', color: '#00F5FF' },
  score:      { fontSize: 16, fontWeight: '800', color: '#00FF94' },
  barWrap:    { paddingHorizontal: 16, marginBottom: 8, alignSelf: 'stretch' },
  arena:      { backgroundColor: '#0E1628', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(0,245,255,0.10)', position: 'relative' },
  orbitRing:  { position: 'absolute', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'transparent' },
  zoneMarker: { position: 'absolute', width: 16, height: 36, borderRadius: 8 },
  dot:        { position: 'absolute', shadowOffset: { width: 0, height: 0 }, shadowRadius: 12, shadowOpacity: 0.9, elevation: 8 },
  center:     { position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.25)' },
  hint:       { position: 'absolute', bottom: 12, alignSelf: 'center', fontSize: 12, color: '#8696A0' },
})
