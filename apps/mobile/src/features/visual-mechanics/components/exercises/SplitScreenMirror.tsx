/**
 * SplitScreenMirror — Bölünmüş Ekran Aynası
 * Ekran sola/sağa bölünür. Her iki yarıda aynı konumda nokta belirir.
 * İki hedefi de tıkla (binoküler koordinasyon).
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
const DARK_BG   = '#0A0F1F'
const C_LEFT    = '#0EA5E9'
const C_RIGHT   = '#10B981'
const PANEL_W   = (W - 40) / 2
const PANEL_H   = H * 0.58
const DOT_R     = 22
const WINDOW_MS = 1200   // tıklamak için süre

interface Props {
  level: DifficultyLevel
  onComplete: (m: RawMetrics) => void
  onExit: () => void
}

interface DotPos { x: number; y: number }

export default function SplitScreenMirror({ level, onComplete, onExit }: Props) {
  const params  = useMemo(() => buildDifficultyParams(level), [level])
  const { playHit, playMiss, playAppear, resetCombo } = useSoundFeedback()
  const pauseMs = Math.max(500, Math.round(1800 / params.animationSpeedMultiplier))

  const m = useRef({ hits: 0, misses: 0, total: 0, rts: [] as number[], spawnAt: 0 })
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [dotPos, setDotPos]  = useState<DotPos | null>(null)
  const [tapped, setTapped]  = useState({ l: false, r: false })
  const [hits, setHits]      = useState(0)

  const spawnNext = useCallback(() => {
    const x = DOT_R + Math.random() * (PANEL_W - DOT_R * 2)
    const y = DOT_R + Math.random() * (PANEL_H - DOT_R * 2)
    setDotPos({ x, y })
    setTapped({ l: false, r: false })
    playAppear()
    m.current.total++
    m.current.spawnAt = Date.now()
    timerRef.current = setTimeout(() => {
      setDotPos(null); m.current.misses++
      setTimeout(spawnNext, 350)
    }, WINDOW_MS)
  }, [])

  useEffect(() => {
    const init = setTimeout(spawnNext, 700)
    return () => { clearTimeout(init); if (timerRef.current) clearTimeout(timerRef.current) }
  }, [spawnNext])

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

  const handleSide = useCallback((side: 'l' | 'r') => {
    if (!dotPos) return
    setTapped(prev => {
      const next = { ...prev, [side]: true }
      if (next.l && next.r) {
        if (timerRef.current) clearTimeout(timerRef.current)
        m.current.hits++; m.current.rts.push(Math.min(Date.now() - m.current.spawnAt, 1200))
        setHits(h => h + 1)
        Haptics.selectionAsync()
        playHit()
        setDotPos(null)
        setTimeout(spawnNext, 300)
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      }
      return next
    })
  }, [dotPos, spawnNext])

  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={onExit}><Text style={s.exit}>✕</Text></TouchableOpacity>
        <Text style={s.title}>Bölünmüş Ekran Aynası</Text>
        <Text style={s.score}>{hits} ✓</Text>
      </View>
      <View style={s.barWrap}>
        <ExerciseProgressBar durationSeconds={params.durationSeconds} onComplete={handleTimerEnd} />
      </View>

      <View style={s.panels}>
        {/* Sol panel */}
        <TouchableOpacity style={[s.panel, { borderColor: 'rgba(14,165,233,0.25)' }]} onPress={() => handleSide('l')} activeOpacity={1}>
          <Text style={[s.panelLabel, { color: C_LEFT }]}>SOL</Text>
          {dotPos && (
            <View style={[
              s.dot, { left: dotPos.x - DOT_R, top: dotPos.y - DOT_R,
                backgroundColor: tapped.l ? '#ffffff' : C_LEFT }
            ]} />
          )}
        </TouchableOpacity>

        {/* Orta bölücü */}
        <View style={s.divider} />

        {/* Sağ panel */}
        <TouchableOpacity style={[s.panel, { borderColor: 'rgba(16,185,129,0.25)' }]} onPress={() => handleSide('r')} activeOpacity={1}>
          <Text style={[s.panelLabel, { color: C_RIGHT }]}>SAĞ</Text>
          {dotPos && (
            <View style={[
              s.dot, { left: dotPos.x - DOT_R, top: dotPos.y - DOT_R,
                backgroundColor: tapped.r ? '#ffffff' : C_RIGHT }
            ]} />
          )}
        </TouchableOpacity>
      </View>

      <Text style={s.hint}>Her iki taraftaki noktaya sırayla dokun</Text>
    </View>
  )
}

const s = StyleSheet.create({
  root:       { flex: 1, backgroundColor: DARK_BG },
  header:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 52 },
  exit:       { fontSize: 22, color: '#8696A0' },
  title:      { fontSize: 14, fontWeight: '800', color: '#00F5FF' },
  score:      { fontSize: 16, fontWeight: '800', color: '#00FF94' },
  barWrap:    { paddingHorizontal: 16, marginBottom: 8 },
  panels:     { flex: 1, flexDirection: 'row', marginHorizontal: 16, marginBottom: 20, gap: 8 },
  panel:      {
    flex: 1, backgroundColor: '#0E1628', borderRadius: 16, borderWidth: 1.5,
    overflow: 'hidden', position: 'relative',
  },
  panelLabel: { position: 'absolute', top: 10, alignSelf: 'center', fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  divider:    { width: 2, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 1 },
  dot:        {
    position: 'absolute', width: DOT_R * 2, height: DOT_R * 2, borderRadius: DOT_R,
    shadowColor: '#fff', shadowOffset: { width: 0, height: 0 }, shadowRadius: 10, shadowOpacity: 0.5, elevation: 8,
  },
  hint: { textAlign: 'center', fontSize: 12, color: '#8696A0', marginBottom: 24 },
})
