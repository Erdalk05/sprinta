/**
 * VerticalPulseTrack — Dikey Nabız Takibi
 * Nokta sinüs dalgasıyla yukarı-aşağı hareket eder.
 * Ortadaki yeşil zone'a girerken tıkla.
 */
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import * as Haptics from 'expo-haptics'
import { buildDifficultyParams } from '../../engines/difficultyEngine'
import type { DifficultyLevel } from '../../constants/exerciseConfig'
import type { RawMetrics } from '../../engines/scoringEngine'
import { ExerciseProgressBar } from '../ExerciseProgressBar'
import { useSoundFeedback } from '../../hooks/useSoundFeedback'

const { height: H } = Dimensions.get('window')
const PLAY_H   = H * 0.60
const CENTER_Y = PLAY_H / 2
const DOT_R    = 22
const ZONE_H   = 88
const NEON     = '#00F5FF'
const DARK_BG  = '#0A0F1F'

interface Props {
  level: DifficultyLevel
  onComplete: (m: RawMetrics) => void
  onExit: () => void
}

export default function VerticalPulseTrack({ level, onComplete, onExit }: Props) {
  const params = useMemo(() => buildDifficultyParams(level), [level])
  const { playHit, playMiss, playAppear, resetCombo } = useSoundFeedback()
  const speed  = params.animationSpeedMultiplier * 1.3
  const amp    = CENTER_Y - 52

  const m = useRef({ hits: 0, misses: 0, total: 0, rts: [] as number[], lastAt: 0 })
  const tRef     = useRef(0)
  const frameRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inZoneRef = useRef(false)
  const [dotY, setDotY] = useState(CENTER_Y)
  const [hits, setHits] = useState(0)

  useEffect(() => {
    let last = Date.now()
    const tick = () => {
      const now = Date.now(); const dt = (now - last) / 1000; last = now
      tRef.current += dt
      const y = CENTER_Y + amp * Math.sin(tRef.current * speed)
      setDotY(y)
      const wasIn = inZoneRef.current
      const isIn  = Math.abs(y - CENTER_Y) < ZONE_H / 2
      inZoneRef.current = isIn
      if (!wasIn && isIn) { m.current.total++; m.current.lastAt = Date.now(); playAppear() }
      frameRef.current = setTimeout(tick, 16)
    }
    frameRef.current = setTimeout(tick, 16)
    return () => { if (frameRef.current) clearTimeout(frameRef.current) }
  }, [amp, speed])

  const handleTimerEnd = useCallback(() => {
    if (frameRef.current) clearTimeout(frameRef.current)
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
      m.current.hits++; m.current.rts.push(Math.min(Date.now() - m.current.lastAt, 1000))
      setHits(h => h + 1); Haptics.selectionAsync(); playHit()
    } else {
      m.current.misses++
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); playMiss()
    }
  }, [])

  const inZone = Math.abs(dotY - CENTER_Y) < ZONE_H / 2

  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={onExit}><Text style={s.exit}>✕</Text></TouchableOpacity>
        <Text style={s.title}>Dikey Nabız Takibi</Text>
        <Text style={s.score}>{hits} ✓</Text>
      </View>
      <View style={s.barWrap}>
        <ExerciseProgressBar durationSeconds={params.durationSeconds} onComplete={handleTimerEnd} />
      </View>
      <TouchableOpacity style={s.field} onPress={handleTap} activeOpacity={1}>
        <View style={[s.zone, { top: CENTER_Y - ZONE_H / 2 }]} />
        <View style={[s.dot, {
          top: dotY - DOT_R,
          left: '50%' as any,
          marginLeft: -DOT_R,
          backgroundColor: inZone ? '#10B981' : NEON,
        }]} />
        <Text style={s.hint}>Yeşil bölgeye girerken dokun</Text>
      </TouchableOpacity>
    </View>
  )
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: DARK_BG },
  header:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 52 },
  exit:    { fontSize: 22, color: '#8696A0' },
  title:   { fontSize: 15, fontWeight: '800', color: NEON },
  score:   { fontSize: 16, fontWeight: '800', color: '#00FF94' },
  barWrap: { paddingHorizontal: 16, marginBottom: 8 },
  field:   {
    flex: 1, marginHorizontal: 16, marginBottom: 24,
    backgroundColor: '#0E1628', borderRadius: 20, borderWidth: 1,
    borderColor: 'rgba(0,245,255,0.10)', overflow: 'hidden',
  },
  zone: {
    position: 'absolute', left: 0, right: 0, height: ZONE_H,
    backgroundColor: 'rgba(16,185,129,0.10)',
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(16,185,129,0.40)',
  },
  dot: {
    position: 'absolute', width: DOT_R * 2, height: DOT_R * 2, borderRadius: DOT_R,
    shadowColor: NEON, shadowOffset: { width: 0, height: 0 }, shadowRadius: 12, shadowOpacity: 0.9, elevation: 8,
  },
  hint: { position: 'absolute', bottom: 14, alignSelf: 'center', fontSize: 12, color: '#8696A0' },
})
