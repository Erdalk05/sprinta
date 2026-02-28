/**
 * MicroPauseReact — Mikro Duraklama Refleksi
 * Nokta ekranda hareket eder, aniden durur (0.8s).
 * Durduğu anda tıkla. Hareket halindeyken tıklama = hata.
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
const C_MOVE   = '#8B5CF6'
const C_PAUSED = '#F59E0B'
const FIELD_H  = H * 0.60
const FIELD_W  = W - 32
const DOT_R    = 24

interface Props {
  level: DifficultyLevel
  onComplete: (m: RawMetrics) => void
  onExit: () => void
}

export default function MicroPauseReact({ level, onComplete, onExit }: Props) {
  const params   = useMemo(() => buildDifficultyParams(level), [level])
  const moveSpd  = params.animationSpeedMultiplier * 140
  const pauseMs  = 800
  const moveMs   = Math.max(1200, Math.round(3000 / params.animationSpeedMultiplier))

  const m = useRef({ hits: 0, misses: 0, total: 0, rts: [] as number[], pauseAt: 0 })
  const frameRef    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const phaseRef    = useRef<'moving' | 'paused'>('moving')
  const phaseTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const velRef      = useRef({ vx: 1, vy: 0.6 })
  const posRef      = useRef({ x: FIELD_W / 2, y: FIELD_H / 2 })

  const [pos, setPos]       = useState({ x: FIELD_W / 2, y: FIELD_H / 2 })
  const [paused, setPaused] = useState(false)
  const [hits, setHits]     = useState(0)

  const MAXX = FIELD_W - DOT_R * 2
  const MAXY = FIELD_H - DOT_R * 2

  const startPause = useCallback(() => {
    phaseRef.current = 'paused'
    setPaused(true)
    m.current.total++
    m.current.pauseAt = Date.now()
    phaseTimer.current = setTimeout(() => {
      if (phaseRef.current === 'paused') {
        m.current.misses++
        phaseRef.current = 'moving'
        setPaused(false)
        phaseTimer.current = setTimeout(startPause, moveMs)
      }
    }, pauseMs)
  }, [moveMs, pauseMs])

  useEffect(() => {
    // Random initial velocity direction
    const angle = Math.random() * Math.PI * 2
    velRef.current = { vx: Math.cos(angle), vy: Math.sin(angle) }

    let last = Date.now()
    const tick = () => {
      if (phaseRef.current === 'moving') {
        const now = Date.now(); const dt = (now - last) / 1000; last = now
        posRef.current.x += velRef.current.vx * moveSpd * dt
        posRef.current.y += velRef.current.vy * moveSpd * dt
        if (posRef.current.x <= 0)    { posRef.current.x = 0;    velRef.current.vx *= -1 }
        if (posRef.current.x >= MAXX) { posRef.current.x = MAXX; velRef.current.vx *= -1 }
        if (posRef.current.y <= 0)    { posRef.current.y = 0;    velRef.current.vy *= -1 }
        if (posRef.current.y >= MAXY) { posRef.current.y = MAXY; velRef.current.vy *= -1 }
        setPos({ ...posRef.current })
      } else {
        last = Date.now()
      }
      frameRef.current = setTimeout(tick, 16)
    }
    frameRef.current = setTimeout(tick, 16)

    // First pause after initial move period
    phaseTimer.current = setTimeout(startPause, moveMs)

    return () => {
      if (frameRef.current)   clearTimeout(frameRef.current)
      if (phaseTimer.current) clearTimeout(phaseTimer.current)
    }
  }, [MAXX, MAXY, moveMs, moveSpd, startPause])

  const handleTimerEnd = useCallback(() => {
    if (frameRef.current)   clearTimeout(frameRef.current)
    if (phaseTimer.current) clearTimeout(phaseTimer.current)
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
    if (phaseRef.current === 'paused') {
      if (phaseTimer.current) clearTimeout(phaseTimer.current)
      m.current.hits++; m.current.rts.push(Math.min(Date.now() - m.current.pauseAt, pauseMs))
      setHits(h => h + 1); setPaused(false)
      phaseRef.current = 'moving'
      Haptics.selectionAsync()
      phaseTimer.current = setTimeout(startPause, moveMs)
    } else {
      m.current.misses++
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }
  }, [moveMs, pauseMs, startPause])

  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={onExit}><Text style={s.exit}>✕</Text></TouchableOpacity>
        <Text style={s.title}>Mikro Duraklama Refleksi</Text>
        <Text style={s.score}>{hits} ✓</Text>
      </View>
      <View style={s.barWrap}>
        <ExerciseProgressBar durationSeconds={params.durationSeconds} onComplete={handleTimerEnd} />
      </View>

      <View style={[s.field, { height: FIELD_H }]}>
        <TouchableOpacity
          style={[s.dot, {
            left: pos.x, top: pos.y,
            width: DOT_R * 2, height: DOT_R * 2, borderRadius: DOT_R,
            backgroundColor: paused ? C_PAUSED : C_MOVE,
            shadowColor: paused ? C_PAUSED : C_MOVE,
            transform: [{ scale: paused ? 1.25 : 1.0 }],
          }]}
          onPress={handleDot}
          hitSlop={{ top: 14, left: 14, right: 14, bottom: 14 }}
        />
        <Text style={s.hint}>{paused ? '⚡ ŞIMDI DOKUN!' : 'Durana kadar bekle...'}</Text>
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
    position: 'absolute',
    shadowOffset: { width: 0, height: 0 }, shadowRadius: 14, shadowOpacity: 0.9, elevation: 10,
  },
  hint: { position: 'absolute', bottom: 12, alignSelf: 'center', fontSize: 13, fontWeight: '700', color: '#8696A0' },
})
