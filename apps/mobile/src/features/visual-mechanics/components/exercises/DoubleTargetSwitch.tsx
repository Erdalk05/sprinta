/**
 * DoubleTargetSwitch — Çift Hedef Geçişi
 * Sol ve sağda iki hedef alternatif olarak yanar.
 * Aktif (parlak) olana dokun. Hız seviyeyle artar.
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
const DARK_BG = '#0A0F1F'
const C_L = '#0EA5E9'   // sol — mavi
const C_R = '#10B981'   // sağ — yeşil

interface Props {
  level: DifficultyLevel
  onComplete: (m: RawMetrics) => void
  onExit: () => void
}

export default function DoubleTargetSwitch({ level, onComplete, onExit }: Props) {
  const params   = useMemo(() => buildDifficultyParams(level), [level])
  const { playHit, playMiss, playAppear, resetCombo } = useSoundFeedback()
  const interval = Math.max(400, Math.round(1400 / params.animationSpeedMultiplier))
  const DOT_R    = Math.max(28, Math.floor(params.targetSize / 1.4))

  const m = useRef({ hits: 0, misses: 0, total: 0, rts: [] as number[], spawnAt: 0 })
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [active, setActive]       = useState<0 | 1>(0)   // 0=sol, 1=sağ
  const [flash,  setFlash]        = useState<0 | 1 | null>(null)
  const [hits, setHits]           = useState(0)

  const spawnNext = useCallback((next: 0 | 1) => {
    setActive(next)
    playAppear()
    m.current.total++
    m.current.spawnAt = Date.now()
    timerRef.current = setTimeout(() => {
      // Miss — tapped too slow
      m.current.misses++
      spawnNext(next === 0 ? 1 : 0)
    }, interval + 200)
  }, [interval])

  useEffect(() => {
    m.current.spawnAt = Date.now()
    m.current.total   = 1
    timerRef.current  = setTimeout(() => spawnNext(1), interval + 200)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [interval, spawnNext])

  const handleTimerEnd = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
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

  const handlePress = useCallback((side: 0 | 1) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (side === active) {
      m.current.hits++; m.current.rts.push(Math.min(Date.now() - m.current.spawnAt, 1200))
      setHits(h => h + 1); setFlash(side)
      setTimeout(() => setFlash(null), 150)
      Haptics.selectionAsync()
    } else {
      m.current.misses++
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }
    spawnNext(side === 0 ? 1 : 0)
  }, [active, spawnNext])

  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={onExit}><Text style={s.exit}>✕</Text></TouchableOpacity>
        <Text style={s.title}>Çift Hedef Geçişi</Text>
        <Text style={s.score}>{hits} ✓</Text>
      </View>
      <View style={s.barWrap}>
        <ExerciseProgressBar durationSeconds={params.durationSeconds} onComplete={handleTimerEnd} />
      </View>

      <View style={s.arena}>
        {/* Sol hedef */}
        <TouchableOpacity
          style={[
            s.target,
            { width: DOT_R * 2, height: DOT_R * 2, borderRadius: DOT_R, borderColor: C_L },
            active === 0 ? s.targetActive : s.targetDim,
            flash === 0 && { backgroundColor: C_L },
          ]}
          onPress={() => handlePress(0)}
          activeOpacity={0.7}
        >
          <Text style={[s.arrow, { color: C_L, opacity: active === 0 ? 1 : 0.25 }]}>←</Text>
        </TouchableOpacity>

        {/* Orta gösterge */}
        <View style={s.mid}>
          <Text style={[s.midArrow, { color: active === 0 ? C_L : C_R }]}>
            {active === 0 ? '◀' : '▶'}
          </Text>
        </View>

        {/* Sağ hedef */}
        <TouchableOpacity
          style={[
            s.target,
            { width: DOT_R * 2, height: DOT_R * 2, borderRadius: DOT_R, borderColor: C_R },
            active === 1 ? s.targetActive : s.targetDim,
            flash === 1 && { backgroundColor: C_R },
          ]}
          onPress={() => handlePress(1)}
          activeOpacity={0.7}
        >
          <Text style={[s.arrow, { color: C_R, opacity: active === 1 ? 1 : 0.25 }]}>→</Text>
        </TouchableOpacity>
      </View>

      <Text style={s.hint}>Parlayan hedefe dokun</Text>
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
  arena:   { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', paddingHorizontal: 24 },
  target:  { borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  targetActive: { shadowColor: '#fff', shadowOffset: { width: 0, height: 0 }, shadowRadius: 16, shadowOpacity: 0.6, elevation: 12 },
  targetDim:    { opacity: 0.22 },
  arrow:   { fontSize: 26, fontWeight: '900' },
  mid:     { alignItems: 'center' },
  midArrow:{ fontSize: 36, fontWeight: '900' },
  hint:    { textAlign: 'center', fontSize: 12, color: '#8696A0', marginBottom: 32 },
})
