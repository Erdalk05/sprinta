/**
 * LineScanSprint — Satır Tarama Sprinti
 * Nokta soldan sağa 4 satır boyunca süpürür.
 * Sağ/sol hedef bölgeye girerken dokun. Okuma sakkadı antrenmanı.
 */
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import * as Haptics from 'expo-haptics'
import { buildDifficultyParams } from '../../engines/difficultyEngine'
import type { DifficultyLevel } from '../../constants/exerciseConfig'
import type { RawMetrics } from '../../engines/scoringEngine'
import { ExerciseProgressBar } from '../ExerciseProgressBar'

const { height: H } = Dimensions.get('window')
const FIELD_W  = Dimensions.get('window').width - 32
const FIELD_H  = H * 0.54
const DOT_R    = 20
const ZONE_W   = 64
const NEON     = '#F59E0B'
const DARK_BG  = '#0A0F1F'
const ROWS     = [0.18, 0.38, 0.60, 0.80]

interface Props {
  level: DifficultyLevel
  onComplete: (m: RawMetrics) => void
  onExit: () => void
}

export default function LineScanSprint({ level, onComplete, onExit }: Props) {
  const params   = useMemo(() => buildDifficultyParams(level), [level])
  const spd      = params.animationSpeedMultiplier * 250

  const m = useRef({ hits: 0, misses: 0, total: 0, rts: [] as number[], lastAt: 0 })
  const frameRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inZoneRef = useRef(false)
  const dirRef    = useRef(1)
  const rowRef    = useRef(0)
  const [pos, setPos]   = useState({ x: 0, row: 0 })
  const [hits, setHits] = useState(0)

  const MAXX = FIELD_W - DOT_R * 2

  useEffect(() => {
    let x = 0; let last = Date.now()
    const tick = () => {
      const now = Date.now(); const dt = (now - last) / 1000; last = now
      x += dirRef.current * spd * dt
      let hitEdge = false
      if (x >= MAXX) { x = MAXX; dirRef.current = -1; hitEdge = true }
      if (x <= 0)    { x = 0;    dirRef.current =  1; hitEdge = true }
      if (hitEdge) rowRef.current = (rowRef.current + 1) % ROWS.length
      setPos({ x, row: rowRef.current })
      const wasIn = inZoneRef.current
      const isIn  = dirRef.current === 1 ? x > MAXX - ZONE_W : x < ZONE_W
      inZoneRef.current = isIn
      if (!wasIn && isIn) { m.current.total++; m.current.lastAt = Date.now() }
      frameRef.current = setTimeout(tick, 16)
    }
    frameRef.current = setTimeout(tick, 16)
    return () => { if (frameRef.current) clearTimeout(frameRef.current) }
  }, [MAXX, spd])

  const handleTimerEnd = useCallback(() => {
    if (frameRef.current) clearTimeout(frameRef.current)
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

  const handleTap = useCallback(() => {
    if (inZoneRef.current) {
      m.current.hits++; m.current.rts.push(Math.min(Date.now() - m.current.lastAt, 800))
      setHits(h => h + 1); Haptics.selectionAsync()
    } else {
      m.current.misses++
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }
  }, [])

  const isRight = dirRef.current === 1

  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={onExit}><Text style={s.exit}>✕</Text></TouchableOpacity>
        <Text style={s.title}>Satır Tarama Sprinti</Text>
        <Text style={s.score}>{hits} ✓</Text>
      </View>
      <View style={s.barWrap}>
        <ExerciseProgressBar durationSeconds={params.durationSeconds} onComplete={handleTimerEnd} />
      </View>
      <TouchableOpacity style={[s.field, { height: FIELD_H }]} onPress={handleTap} activeOpacity={1}>
        {ROWS.map((r, i) => (
          <View key={i} style={[s.scanLine, { top: r * FIELD_H, opacity: i === pos.row ? 0.45 : 0.10 }]} />
        ))}
        <View style={[s.zoneL, { opacity: !isRight ? 1 : 0.25 }]} />
        <View style={[s.zoneR, { opacity: isRight ? 1 : 0.25 }]} />
        <View style={[s.dot, { left: pos.x, top: ROWS[pos.row] * FIELD_H - DOT_R }]} />
        <Text style={s.hint}>{isRight ? 'Sağa ulaşınca dokun →' : '← Sola ulaşınca dokun'}</Text>
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
    marginHorizontal: 16, marginBottom: 24,
    backgroundColor: '#0E1628', borderRadius: 20, borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.12)', overflow: 'hidden',
  },
  scanLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(245,158,11,0.7)' },
  zoneL: {
    position: 'absolute', left: 0, top: 0, bottom: 0, width: ZONE_W,
    backgroundColor: 'rgba(245,158,11,0.10)',
    borderRightWidth: 1, borderColor: 'rgba(245,158,11,0.55)',
  },
  zoneR: {
    position: 'absolute', right: 0, top: 0, bottom: 0, width: ZONE_W,
    backgroundColor: 'rgba(245,158,11,0.10)',
    borderLeftWidth: 1, borderColor: 'rgba(245,158,11,0.55)',
  },
  dot: {
    position: 'absolute', width: DOT_R * 2, height: DOT_R * 2, borderRadius: DOT_R,
    backgroundColor: NEON,
    shadowColor: NEON, shadowOffset: { width: 0, height: 0 }, shadowRadius: 10, shadowOpacity: 0.9, elevation: 8,
  },
  hint: { position: 'absolute', bottom: 12, alignSelf: 'center', fontSize: 12, color: '#8696A0' },
})
