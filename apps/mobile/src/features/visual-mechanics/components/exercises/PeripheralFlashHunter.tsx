/**
 * PeripheralFlashHunter — Periferik Flash Avcısı
 * Merkezdeki artıya bakarken çevrede beliren hedeflere dokun.
 * 8 çevresel konum, rastgele belirip söner.
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
const DARK_BG  = '#0A0F1F'
const TARGET_C = '#F59E0B'

// 8 periferik konum (offset'ler merkeze göre — birim normalized 0-1 alanı içinde)
const POSITIONS = [
  { ax: 0.50, ay: 0.08 }, // N
  { ax: 0.82, ay: 0.18 }, // NE
  { ax: 0.90, ay: 0.50 }, // E
  { ax: 0.82, ay: 0.82 }, // SE
  { ax: 0.50, ay: 0.90 }, // S
  { ax: 0.18, ay: 0.82 }, // SW
  { ax: 0.10, ay: 0.50 }, // W
  { ax: 0.18, ay: 0.18 }, // NW
]

interface Props {
  level: DifficultyLevel
  onComplete: (m: RawMetrics) => void
  onExit: () => void
}

export default function PeripheralFlashHunter({ level, onComplete, onExit }: Props) {
  const params    = useMemo(() => buildDifficultyParams(level), [level])
  const { playHit, playMiss, playAppear, resetCombo } = useSoundFeedback()
  const flashMs   = Math.max(500, Math.round(1400 / params.animationSpeedMultiplier))
  const TARGET_R  = Math.max(20, Math.floor(params.targetSize / 2))

  const m = useRef({ hits: 0, misses: 0, total: 0, rts: [] as number[], spawnAt: 0 })
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [active, setActive] = useState<number | null>(null)
  const [hits, setHits]     = useState(0)

  const spawnNext = useCallback(() => {
    const idx = Math.floor(Math.random() * POSITIONS.length)
    setActive(idx)
    playAppear()
    m.current.total++
    m.current.spawnAt = Date.now()
    timerRef.current = setTimeout(() => {
      setActive(null)
      m.current.misses++
      setTimeout(spawnNext, 300)
    }, flashMs)
  }, [flashMs])

  useEffect(() => {
    const init = setTimeout(spawnNext, 600)
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

  const handleTarget = useCallback((idx: number) => {
    if (idx !== active) return
    if (timerRef.current) clearTimeout(timerRef.current)
    m.current.hits++; m.current.rts.push(Math.min(Date.now() - m.current.spawnAt, 1500))
    setHits(h => h + 1); setActive(null)
    Haptics.selectionAsync()
    playHit()
    setTimeout(spawnNext, 280)
  }, [active, spawnNext])

  const ARENA_W = W - 32
  const ARENA_H = H * 0.62

  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={onExit}><Text style={s.exit}>✕</Text></TouchableOpacity>
        <Text style={s.title}>Geniş Görüş <Text style={{fontSize: 10, opacity: 0.6}}>(Periferik)</Text> Flash Avcısı</Text>
        <Text style={s.score}>{hits} ✓</Text>
      </View>
      <View style={s.barWrap}>
        <ExerciseProgressBar durationSeconds={params.durationSeconds} onComplete={handleTimerEnd} />
      </View>

      <View style={[s.arena, { width: ARENA_W, height: ARENA_H }]}>
        {/* Periferik hedefler */}
        {POSITIONS.map((p, i) => (
          <TouchableOpacity
            key={i}
            style={[
              s.target,
              {
                left: p.ax * ARENA_W - TARGET_R,
                top:  p.ay * ARENA_H - TARGET_R,
                width: TARGET_R * 2, height: TARGET_R * 2, borderRadius: TARGET_R,
                opacity: active === i ? 1 : 0,
              },
            ]}
            onPress={() => handleTarget(i)}
            activeOpacity={0.7}
          />
        ))}

        {/* Merkez sabit artı */}
        <View style={s.crossH} />
        <View style={s.crossV} />
      </View>

      <Text style={s.hint}>Merkeze bak — çevredeki flaşa dokun</Text>
    </View>
  )
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: DARK_BG, alignItems: 'center' },
  header:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 52, alignSelf: 'stretch' },
  exit:    { fontSize: 22, color: '#8696A0' },
  title:   { fontSize: 15, fontWeight: '800', color: TARGET_C },
  score:   { fontSize: 16, fontWeight: '800', color: '#00FF94' },
  barWrap: { paddingHorizontal: 16, marginBottom: 8, alignSelf: 'stretch' },
  arena:   { backgroundColor: '#0E1628', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(245,158,11,0.12)', position: 'relative' },
  target:  {
    position: 'absolute', backgroundColor: TARGET_C,
    shadowColor: TARGET_C, shadowOffset: { width: 0, height: 0 }, shadowRadius: 14, shadowOpacity: 1, elevation: 10,
  },
  crossH:  { position: 'absolute', top: '50%', left: '50%', marginLeft: -16, marginTop: -1.5, width: 32, height: 3, backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 2 },
  crossV:  { position: 'absolute', top: '50%', left: '50%', marginTop: -16, marginLeft: -1.5, width: 3, height: 32, backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 2 },
  hint:    { fontSize: 12, color: '#8696A0', marginTop: 12, textAlign: 'center' },
})
