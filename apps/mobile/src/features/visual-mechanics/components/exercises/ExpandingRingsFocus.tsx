/**
 * ExpandingRingsFocus — Genişleyen Halkalar Odağı
 * Halkalar merkezden genişler. Hedef halkaya ulaşınca dokun.
 */
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import * as Haptics from 'expo-haptics'
import { buildDifficultyParams } from '../../engines/difficultyEngine'
import type { DifficultyLevel } from '../../constants/exerciseConfig'
import type { RawMetrics } from '../../engines/scoringEngine'
import { ExerciseProgressBar } from '../ExerciseProgressBar'
import { useSoundFeedback } from '../../hooks/useSoundFeedback'

const { width: W, height: H } = Dimensions.get('window')
const DARK_BG    = '#0A0F1F'
const RING_C     = '#0EA5E9'
const TARGET_C   = '#10B981'

const TARGET_R   = 100  // fixed target radius
const ZONE_TOL   = 14   // ±14px tolerance

interface Ring { id: number; r: number }

interface Props {
  level: DifficultyLevel
  onComplete: (m: RawMetrics) => void
  onExit: () => void
}

let ringIdSeed = 0

export default function ExpandingRingsFocus({ level, onComplete, onExit }: Props) {
  const params    = useMemo(() => buildDifficultyParams(level), [level])
  const { playHit, playMiss, playAppear, resetCombo } = useSoundFeedback()
  const expandSpd = params.animationSpeedMultiplier * 55   // px/s
  const spawnInterval = Math.max(700, Math.round(2000 / params.animationSpeedMultiplier))

  const m = useRef({ hits: 0, misses: 0, total: 0, rts: [] as number[], lastCross: 0 })
  const frameRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const spawnRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inZoneRef  = useRef(false)
  const [rings, setRings] = useState<Ring[]>([{ id: ++ringIdSeed, r: 10 }])
  const [hits, setHits]   = useState(0)

  useEffect(() => {
    let last = Date.now()
    const tick = () => {
      const now = Date.now(); const dt = (now - last) / 1000; last = now
      setRings(prev => {
        const next = prev
          .map(rg => ({ ...rg, r: rg.r + expandSpd * dt }))
          .filter(rg => rg.r < TARGET_R + 80)

        // Check zone crossing
        const wasCrossing = inZoneRef.current
        const isCrossing  = next.some(rg => Math.abs(rg.r - TARGET_R) < ZONE_TOL)
        inZoneRef.current = isCrossing
        if (!wasCrossing && isCrossing) {
          m.current.total++; m.current.lastCross = Date.now(); playAppear()
        }
        return next
      })
      frameRef.current = setTimeout(tick, 16)
    }
    frameRef.current = setTimeout(tick, 16)

    const spawn = () => {
      setRings(prev => [...prev, { id: ++ringIdSeed, r: 10 }])
      spawnRef.current = setTimeout(spawn, spawnInterval)
    }
    spawnRef.current = setTimeout(spawn, spawnInterval)

    return () => {
      if (frameRef.current) clearTimeout(frameRef.current)
      if (spawnRef.current) clearTimeout(spawnRef.current)
    }
  }, [expandSpd, spawnInterval])

  const handleTimerEnd = useCallback(() => {
    if (frameRef.current) clearTimeout(frameRef.current)
    if (spawnRef.current) clearTimeout(spawnRef.current)
    const dur = params.durationSeconds * 1000
    const avg = m.current.rts.length
      ? Math.round(m.current.rts.reduce((a, b) => a + b, 0) / m.current.rts.length) : 500
    resetCombo()
    onComplete({
      correctFocusDurationMs: Math.round((m.current.hits / Math.max(m.current.total, 1)) * dur),
      totalDurationMs: dur, reactionTimeMs: avg,
      errorCount: m.current.misses, totalTargets: Math.max(m.current.total, 1),
      fatigueIndex: Math.min(1, m.current.misses / Math.max(m.current.total, 1)),
    })
  }, [params, onComplete])

  const handleTap = useCallback(() => {
    if (inZoneRef.current) {
      m.current.hits++; m.current.rts.push(Math.min(Date.now() - m.current.lastCross, 700))
      setHits(h => h + 1); Haptics.selectionAsync(); playHit()
    } else {
      m.current.misses++
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); playMiss()
    }
  }, [])

  const ARENA_H  = H * 0.54
  const ARENA_W  = W - 32          // kenar padding (16×2) çıkarılmış gerçek genişlik
  const CENTER_X = ARENA_W / 2
  const CENTER_Y = ARENA_H / 2

  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={onExit}><Text style={s.exit}>✕</Text></TouchableOpacity>
        <Text style={s.title}>Genişleyen Halkalar Odağı</Text>
        <Text style={s.score}>{hits} ✓</Text>
      </View>
      <View style={s.barWrap}>
        <ExerciseProgressBar durationSeconds={params.durationSeconds} onComplete={handleTimerEnd} />
      </View>

      <TouchableOpacity
        style={[s.arena, { height: ARENA_H, width: ARENA_W }]}
        onPress={handleTap}
        activeOpacity={1}
      >
        {/* Target ring (fixed dashed) */}
        <View style={[s.targetRing, {
          width: TARGET_R * 2, height: TARGET_R * 2, borderRadius: TARGET_R,
          left: CENTER_X - TARGET_R, top: CENTER_Y - TARGET_R,
        }]} />

        {/* Expanding rings */}
        {rings.map(rg => {
          const near = Math.abs(rg.r - TARGET_R) < ZONE_TOL
          return (
            <View key={rg.id} style={[s.ring, {
              width: rg.r * 2, height: rg.r * 2, borderRadius: rg.r,
              left: CENTER_X - rg.r, top: CENTER_Y - rg.r,
              borderColor: near ? TARGET_C : RING_C,
              opacity: Math.max(0, 1 - (rg.r / (TARGET_R + 80)) * 0.7),
            }]} />
          )
        })}

        {/* Center dot */}
        <View style={[s.centerDot, { left: CENTER_X - 6, top: CENTER_Y - 6 }]} />

        <Text style={s.hint}>Halka yeşil çizgiye değince dokun</Text>
      </TouchableOpacity>
    </View>
  )
}

const s = StyleSheet.create({
  root:       { flex: 1, backgroundColor: DARK_BG, alignItems: 'center' },
  header:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 52, alignSelf: 'stretch' },
  exit:       { fontSize: 22, color: '#8696A0' },
  title:      { fontSize: 14, fontWeight: '800', color: '#00F5FF' },
  score:      { fontSize: 16, fontWeight: '800', color: '#00FF94' },
  barWrap:    { paddingHorizontal: 16, marginBottom: 8, alignSelf: 'stretch' },
  arena:      {
    backgroundColor: '#0E1628', borderRadius: 20, borderWidth: 1,
    borderColor: 'rgba(14,165,233,0.12)', position: 'relative', marginBottom: 16, overflow: 'hidden',
  },
  targetRing: { position: 'absolute', borderWidth: 2, borderColor: TARGET_C, borderStyle: 'dashed', backgroundColor: 'transparent' },
  ring:       { position: 'absolute', borderWidth: 1.5, backgroundColor: 'transparent' },
  centerDot:  { position: 'absolute', width: 12, height: 12, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.4)' },
  hint:       { position: 'absolute', bottom: 12, alignSelf: 'center', fontSize: 12, color: '#8696A0' },
})
