/**
 * ShrinkZoomFocus — Küçül & Yaklaş Odağı
 * Merkezi daire büyür ve küçülür. En küçük olduğu anda dokun.
 */
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import * as Haptics from 'expo-haptics'
import { buildDifficultyParams } from '../../engines/difficultyEngine'
import type { DifficultyLevel } from '../../constants/exerciseConfig'
import type { RawMetrics } from '../../engines/scoringEngine'
import { ExerciseProgressBar } from '../ExerciseProgressBar'

const { height: H } = Dimensions.get('window')
const DARK_BG   = '#0A0F1F'
const C_NORMAL  = '#8B5CF6'
const C_SMALL   = '#00F5FF'

const MIN_R  = 16
const MAX_R  = 90
const ZONE_R = 28   // tap zone: radius <= ZONE_R

interface Props {
  level: DifficultyLevel
  onComplete: (m: RawMetrics) => void
  onExit: () => void
}

export default function ShrinkZoomFocus({ level, onComplete, onExit }: Props) {
  const params    = useMemo(() => buildDifficultyParams(level), [level])
  const cycleMs   = Math.max(1000, Math.round(2800 / params.animationSpeedMultiplier))

  const m = useRef({ hits: 0, misses: 0, total: 0, rts: [] as number[], minAt: 0 })
  const tRef       = useRef(0)
  const frameRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inZoneRef  = useRef(false)
  const [radius, setRadius] = useState(MAX_R)
  const [hits, setHits]     = useState(0)

  useEffect(() => {
    let last = Date.now()
    const tick = () => {
      const now = Date.now(); const dt = (now - last) / 1000; last = now
      tRef.current += dt
      const phase = (tRef.current % (cycleMs / 1000)) / (cycleMs / 1000)  // 0-1
      // Sine: 1 = MAX, 0 = MIN
      const t = (Math.sin(phase * Math.PI * 2 - Math.PI / 2) + 1) / 2
      const r = MIN_R + (MAX_R - MIN_R) * t
      setRadius(r)

      const wasIn = inZoneRef.current
      const isIn  = r <= ZONE_R
      inZoneRef.current = isIn
      if (!wasIn && isIn) { m.current.total++; m.current.minAt = Date.now() }

      frameRef.current = setTimeout(tick, 16)
    }
    frameRef.current = setTimeout(tick, 16)
    return () => { if (frameRef.current) clearTimeout(frameRef.current) }
  }, [cycleMs])

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
      m.current.hits++; m.current.rts.push(Math.min(Date.now() - m.current.minAt, 600))
      setHits(h => h + 1); Haptics.selectionAsync()
    } else {
      m.current.misses++
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }
  }, [])

  const inZone = inZoneRef.current
  const ARENA  = H * 0.52

  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={onExit}><Text style={s.exit}>✕</Text></TouchableOpacity>
        <Text style={s.title}>Küçül & Yaklaş Odağı</Text>
        <Text style={s.score}>{hits} ✓</Text>
      </View>
      <View style={s.barWrap}>
        <ExerciseProgressBar durationSeconds={params.durationSeconds} onComplete={handleTimerEnd} />
      </View>

      <TouchableOpacity
        style={[s.arena, { height: ARENA }]}
        onPress={handleTap}
        activeOpacity={1}
      >
        {/* Target zone ring */}
        <View style={[s.targetRing, { width: ZONE_R * 2, height: ZONE_R * 2, borderRadius: ZONE_R }]} />

        {/* Pulsating circle */}
        <View style={[s.circle, {
          width: radius * 2, height: radius * 2, borderRadius: radius,
          backgroundColor: inZone ? C_SMALL : C_NORMAL,
          borderColor: inZone ? C_SMALL : 'rgba(139,92,246,0.4)',
          shadowColor: inZone ? C_SMALL : C_NORMAL,
        }]} />

        <Text style={s.hint}>{inZone ? '⚡ ŞIMDI!' : 'En küçük anda dokun'}</Text>
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
  arena:      {
    width: '90%' as any, backgroundColor: '#0E1628', borderRadius: 20, borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.15)', alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
  targetRing: { position: 'absolute', borderWidth: 1.5, borderColor: 'rgba(0,245,255,0.35)', borderStyle: 'dashed', backgroundColor: 'transparent' },
  circle:     { borderWidth: 2, shadowOffset: { width: 0, height: 0 }, shadowRadius: 16, shadowOpacity: 0.8, elevation: 10 },
  hint:       { position: 'absolute', bottom: 14, fontSize: 13, fontWeight: '700', color: '#8696A0' },
})
