/**
 * TunnelVisionBreaker — Tünel Görüş Kırıcı
 * Merkezdeki noktaya odaklanırken ekranın 4 köşesinde hedefler belirir.
 * Gözü merkezden kaldırmadan çevresel farkındalıkla tıkla.
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
const CORNER_C = '#EF4444'
const MARGIN   = 28
const CORNER_R = 26

// 4 köşe + 4 kenar orta = 8 ekstra konum
const CORNERS = [
  { id: 0, left: MARGIN,             top: MARGIN },
  { id: 1, left: W - MARGIN * 3,     top: MARGIN },
  { id: 2, left: MARGIN,             top: H * 0.68 },
  { id: 3, left: W - MARGIN * 3,     top: H * 0.68 },
]

interface Props {
  level: DifficultyLevel
  onComplete: (m: RawMetrics) => void
  onExit: () => void
}

export default function TunnelVisionBreaker({ level, onComplete, onExit }: Props) {
  const params   = useMemo(() => buildDifficultyParams(level), [level])
  const flashMs  = Math.max(600, Math.round(1600 / params.animationSpeedMultiplier))
  // Level 3-4: iki köşe aynı anda
  const multiFlash = level >= 3

  const m = useRef({ hits: 0, misses: 0, total: 0, rts: [] as number[], spawnAt: 0 })
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [actives, setActives] = useState<number[]>([])
  const [hits, setHits]       = useState(0)

  const spawnNext = useCallback(() => {
    const count = multiFlash ? 2 : 1
    const shuffled = [...CORNERS].sort(() => Math.random() - 0.5)
    const ids = shuffled.slice(0, count).map(c => c.id)
    setActives(ids)
    m.current.total += count
    m.current.spawnAt = Date.now()
    timerRef.current = setTimeout(() => {
      setActives([])
      m.current.misses += count
      setTimeout(spawnNext, 350)
    }, flashMs)
  }, [flashMs, multiFlash])

  useEffect(() => {
    const init = setTimeout(spawnNext, 700)
    return () => { clearTimeout(init); if (timerRef.current) clearTimeout(timerRef.current) }
  }, [spawnNext])

  const handleTimerEnd = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    const dur = params.durationSeconds * 1000
    const avg = m.current.rts.length
      ? Math.round(m.current.rts.reduce((a, b) => a + b, 0) / m.current.rts.length) : 600
    onComplete({
      correctFocusDurationMs: Math.round((m.current.hits / Math.max(m.current.total, 1)) * dur),
      totalDurationMs: dur, reactionTimeMs: avg,
      errorCount: m.current.misses, totalTargets: Math.max(m.current.total, 1),
      fatigueIndex: Math.min(1, m.current.misses / Math.max(m.current.total, 1)),
    })
  }, [params, onComplete])

  const handleCorner = useCallback((id: number) => {
    if (!actives.includes(id)) return
    m.current.hits++; m.current.rts.push(Math.min(Date.now() - m.current.spawnAt, 1500))
    setHits(h => h + 1)
    Haptics.selectionAsync()
    const remaining = actives.filter(a => a !== id)
    if (remaining.length === 0) {
      if (timerRef.current) clearTimeout(timerRef.current)
      setActives([])
      setTimeout(spawnNext, 300)
    } else {
      setActives(remaining)
    }
  }, [actives, spawnNext])

  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={onExit}><Text style={s.exit}>✕</Text></TouchableOpacity>
        <Text style={s.title}>Tünel Görüş Kırıcı</Text>
        <Text style={s.score}>{hits} ✓</Text>
      </View>
      <View style={s.barWrap}>
        <ExerciseProgressBar durationSeconds={params.durationSeconds} onComplete={handleTimerEnd} />
      </View>

      <View style={s.arena}>
        {/* Köşe hedefleri */}
        {CORNERS.map(c => {
          const isActive = actives.includes(c.id)
          return (
            <TouchableOpacity
              key={c.id}
              style={[s.corner, { left: c.left, top: c.top - 140, opacity: isActive ? 1 : 0 }]}
              onPress={() => handleCorner(c.id)}
              activeOpacity={0.7}
            />
          )
        })}
        {/* Merkez sabit odak noktası */}
        <View style={s.centerDot} />
        <Text style={s.centerLabel}>ODAK</Text>
      </View>

      <Text style={s.hint}>Merkeze bak — köşelerdeki kırmızıya dokun</Text>
    </View>
  )
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: DARK_BG },
  header:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 52 },
  exit:    { fontSize: 22, color: '#8696A0' },
  title:   { fontSize: 15, fontWeight: '800', color: CORNER_C },
  score:   { fontSize: 16, fontWeight: '800', color: '#00FF94' },
  barWrap: { paddingHorizontal: 16, marginBottom: 8 },
  arena:   {
    flex: 1, marginHorizontal: 16, marginBottom: 24,
    backgroundColor: '#0E1628', borderRadius: 20, borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.12)', position: 'relative',
    alignItems: 'center', justifyContent: 'center',
  },
  corner: {
    position: 'absolute', width: CORNER_R * 2, height: CORNER_R * 2, borderRadius: CORNER_R,
    backgroundColor: CORNER_C,
    shadowColor: CORNER_C, shadowOffset: { width: 0, height: 0 }, shadowRadius: 16, shadowOpacity: 1, elevation: 12,
  },
  centerDot:   { width: 16, height: 16, borderRadius: 8, backgroundColor: '#00F5FF', shadowColor: '#00F5FF', shadowOffset: { width: 0, height: 0 }, shadowRadius: 8, shadowOpacity: 0.8 },
  centerLabel: { fontSize: 10, color: 'rgba(0,245,255,0.5)', marginTop: 4, letterSpacing: 1.5 },
  hint: { textAlign: 'center', fontSize: 12, color: '#8696A0', marginBottom: 28, paddingHorizontal: 24 },
})
