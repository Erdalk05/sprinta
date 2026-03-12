/**
 * OppositePull — Karşıt Çekim
 * İki hedef zıt yönlerde hareket eder. Parlayan hedefe dokun.
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
const DARK_BG = '#0A0F1F'
const C_A = '#0EA5E9'
const C_B = '#F59E0B'

interface Props {
  level: DifficultyLevel
  onComplete: (m: RawMetrics) => void
  onExit: () => void
}

export default function OppositePull({ level, onComplete, onExit }: Props) {
  const params  = useMemo(() => buildDifficultyParams(level), [level])
  const { playHit, playMiss, playAppear, resetCombo } = useSoundFeedback()
  const DOT_R   = Math.max(22, Math.floor(params.targetSize / 2))
  const spd     = params.animationSpeedMultiplier * 180
  const FIELD_W = W - 32
  const FIELD_H = H * 0.55
  const MAXX    = FIELD_W - DOT_R * 2

  // Dot A starts left→right, Dot B starts right→left
  const posARef  = useRef(0)
  const posBRef  = useRef(MAXX)
  const frameRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [posA, setPosA] = useState(0)
  const [posB, setPosB] = useState(MAXX)
  // active: null=none, 'A'=left, 'B'=right — set when dot reaches peak
  const [active, setActive]       = useState<'A' | 'B' | null>(null)
  const activeRef                 = useRef<'A' | 'B' | null>(null)
  const activeTimerRef            = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [hits, setHits]           = useState(0)

  const m = useRef({ hits: 0, misses: 0, total: 0, rts: [] as number[], spawnAt: 0 })

  const triggerActive = useCallback((side: 'A' | 'B') => {
    activeRef.current = side
    setActive(side)
    playAppear()
    m.current.total++
    m.current.spawnAt = Date.now()
    if (activeTimerRef.current) clearTimeout(activeTimerRef.current)
    activeTimerRef.current = setTimeout(() => {
      if (activeRef.current === side) {
        m.current.misses++
        activeRef.current = null
        setActive(null)
      }
    }, 900)
  }, [])

  const aPeakRef = useRef(false)
  const bPeakRef = useRef(false)
  const aVelRef  = useRef(1)
  const bVelRef  = useRef(-1)

  useEffect(() => {
    let last = Date.now()
    const tick = () => {
      const now = Date.now(); const dt = (now - last) / 1000; last = now
      posARef.current += aVelRef.current * spd * dt
      posBRef.current += bVelRef.current * spd * dt

      const aWasPeak = aPeakRef.current
      const bWasPeak = bPeakRef.current

      if (posARef.current >= MAXX) { posARef.current = MAXX; aVelRef.current = -1; aPeakRef.current = true }
      else if (posARef.current <= 0) { posARef.current = 0; aVelRef.current = 1; aPeakRef.current = false }
      else { aPeakRef.current = false }

      if (posBRef.current <= 0) { posBRef.current = 0; bVelRef.current = 1; bPeakRef.current = true }
      else if (posBRef.current >= MAXX) { posBRef.current = MAXX; bVelRef.current = -1; bPeakRef.current = false }
      else { bPeakRef.current = false }

      if (!aWasPeak && aPeakRef.current && activeRef.current === null) triggerActive('A')
      if (!bWasPeak && bPeakRef.current && activeRef.current === null) triggerActive('B')

      setPosA(posARef.current)
      setPosB(posBRef.current)
      frameRef.current = setTimeout(tick, 16)
    }
    frameRef.current = setTimeout(tick, 16)
    return () => {
      if (frameRef.current) clearTimeout(frameRef.current)
      if (activeTimerRef.current) clearTimeout(activeTimerRef.current)
    }
  }, [MAXX, spd, triggerActive])

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

  const handlePress = useCallback((side: 'A' | 'B') => {
    if (activeRef.current === side) {
      if (activeTimerRef.current) clearTimeout(activeTimerRef.current)
      m.current.hits++; m.current.rts.push(Math.min(Date.now() - m.current.spawnAt, 900))
      setHits(h => h + 1); setActive(null); activeRef.current = null
      Haptics.selectionAsync(); playHit()
    } else {
      m.current.misses++
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); playMiss()
    }
  }, [])

  const ROW_Y = FIELD_H * 0.45

  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={onExit}><Text style={s.exit}>✕</Text></TouchableOpacity>
        <Text style={s.title}>Karşıt Çekim</Text>
        <Text style={s.score}>{hits} ✓</Text>
      </View>
      <View style={s.barWrap}>
        <ExerciseProgressBar durationSeconds={params.durationSeconds} onComplete={handleTimerEnd} />
      </View>

      <View style={[s.field, { height: FIELD_H }]}>
        {/* Track line */}
        <View style={[s.track, { top: ROW_Y + DOT_R - 1 }]} />

        {/* Dot A */}
        <TouchableOpacity
          style={[s.dot, {
            left: posA, top: ROW_Y,
            width: DOT_R * 2, height: DOT_R * 2, borderRadius: DOT_R,
            backgroundColor: C_A,
            opacity: active === 'A' ? 1 : 0.35,
          }]}
          onPress={() => handlePress('A')}
          hitSlop={{ top: 12, left: 12, right: 12, bottom: 12 }}
        />

        {/* Dot B */}
        <TouchableOpacity
          style={[s.dot, {
            left: posB, top: ROW_Y + DOT_R * 2.4,
            width: DOT_R * 2, height: DOT_R * 2, borderRadius: DOT_R,
            backgroundColor: C_B,
            opacity: active === 'B' ? 1 : 0.35,
          }]}
          onPress={() => handlePress('B')}
          hitSlop={{ top: 12, left: 12, right: 12, bottom: 12 }}
        />

        <Text style={s.hint}>Parlayan hedefe dokun</Text>
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
    borderColor: 'rgba(0,245,255,0.10)', overflow: 'hidden', position: 'relative',
  },
  track: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
  dot:   { position: 'absolute', shadowOffset: { width: 0, height: 0 }, shadowRadius: 14, shadowOpacity: 0.9, elevation: 10 },
  hint:  { position: 'absolute', bottom: 12, alignSelf: 'center', fontSize: 12, color: '#8696A0' },
})
