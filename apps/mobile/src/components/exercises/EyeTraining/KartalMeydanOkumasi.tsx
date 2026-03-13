/**
 * KartalMeydanOkumasi — BOSS Egzersizi
 *
 * 4 faz sıralı:
 *   1. Schulte (12sn) — Göz Atlaması (Sakkadik)
 *   2. Fırtına  (12sn) — Çevresel Görüş (Periferik)
 *   3. Spiral   (13sn) — Göz Takibi (Smooth Pursuit)
 *   4. Flash    (13sn) — Göz Atlaması (Sakkadik)
 * Toplam: ~50sn
 */
import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions, SafeAreaView,
  PanResponder,
} from 'react-native'
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSequence,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { useEyeSoundFeedback } from './useEyeSoundFeedback'
import type { EyeExerciseProps, EyeMetrics } from '@sprinta/shared'

const { width: SW, height: SH } = Dimensions.get('window')
const BG = '#0A0F1F'
const DOT_SIZE = 44
const PHASE_DURATIONS = [12, 12, 13, 13] // sn
const PHASE_COLORS = ['#1877F2', '#00B890', '#FF9F1C', '#1877F2']
const PHASE_NAMES = [
  'Schulte — Göz Atlaması',
  'Fırtına — Çevresel Görüş',
  'Spiral — Göz Takibi',
  'Flash — Göz Atlaması',
]

// ── Schulte 4×4 ────────────────────────────────────────────────
function shuffleArr(arr: number[]): number[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const SCHULTE_SIZE = 4
const SCHULTE_CELL = (SW - 48) / SCHULTE_SIZE

// ── Spiral ────────────────────────────────────────────────────
const SPIRAL_CX = SW / 2
const SPIRAL_CY = SH * 0.38
const MAX_RADIUS = Math.min(SW, SH) * 0.24

function spiralPoint(t: number): { x: number; y: number } {
  const angle = t * Math.PI * 4
  const r = (t % 1) * MAX_RADIUS
  return { x: SPIRAL_CX + r * Math.cos(angle), y: SPIRAL_CY + r * Math.sin(angle) }
}

export default function KartalMeydanOkumasi({
  durationSeconds,
  onComplete,
  onExit,
}: EyeExerciseProps) {
  const { playHit, playMiss, playLevelUp, playAppear } = useEyeSoundFeedback()
  const masterStart = useRef(performance.now())
  const [totalElapsed, setTotalElapsed] = useState(0)
  const [phase, setPhase] = useState(0)           // 0-3
  const [phaseElapsed, setPhaseElapsed] = useState(0)
  const phaseStart = useRef(performance.now())
  const finished = useRef(false)

  // ── Metrikler (her faz) ────────────────────────────────────────
  const allMetrics = useRef<Array<Partial<EyeMetrics>>>([{}, {}, {}, {}])

  // ── Faz 0: Schulte ──────────────────────────────────────────
  const [schulteGrid] = useState(() => shuffleArr(Array.from({ length: SCHULTE_SIZE * SCHULTE_SIZE }, (_, i) => i + 1)))
  const [schulteNext, setSchulteNext] = useState(1)
  const [schulteHit, setSchulteHit] = useState<Set<number>>(new Set())
  const schulteHits = useRef(0)
  const schulteMisses = useRef(0)
  const schulteRTs = useRef<number[]>([])
  const schulteTargetAt = useRef(performance.now())

  // ── Faz 1: Fırtına ──────────────────────────────────────────
  const [stormDot, setStormDot] = useState<{ x: number; y: number; id: number } | null>(null)
  const stormHits = useRef(0)
  const stormMisses = useRef(0)
  const stormRTs = useRef<number[]>([])
  const stormShownAt = useRef(0)
  const stormTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const stormId = useRef(0)
  const dotOpacity = useSharedValue(0)
  const dotStyle = useAnimatedStyle(() => ({ opacity: dotOpacity.value }))

  // ── Faz 2: Spiral ─────────────────────────────────────────────
  const [spiralDot, setSpiralDot] = useState({ x: SPIRAL_CX, y: SPIRAL_CY })
  const [fingerPos, setFingerPos] = useState<{ x: number; y: number } | null>(null)
  const spiralErrors = useRef<number[]>([])
  const spiralFrame = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Faz 3: Flash ──────────────────────────────────────────────
  const [flashGrid] = useState(() => shuffleArr(Array.from({ length: 16 }, (_, i) => i)))
  const [flashActive, setFlashActive] = useState<number | null>(null)
  const flashHits = useRef(0)
  const flashMisses = useRef(0)
  const flashRTs = useRef<number[]>([])
  const flashShownAt = useRef(0)
  const flashTimer2 = useRef<ReturnType<typeof setTimeout> | null>(null)
  const FLASH_CELL = (SW - 48 - 12) / 4

  // ──────────────────────────────────────────────────────────────
  // Master timer
  useEffect(() => {
    const interval = setInterval(() => {
      const me = (performance.now() - masterStart.current) / 1000
      setTotalElapsed(me)
      const pe = (performance.now() - phaseStart.current) / 1000
      setPhaseElapsed(pe)

      if (me >= durationSeconds && !finished.current) {
        finished.current = true
        clearInterval(interval)
        finishAll()
      }
    }, 250)
    return () => clearInterval(interval)
  }, [durationSeconds])

  // Faz değişimi kontrolü
  useEffect(() => {
    const phaseDur = PHASE_DURATIONS[phase] ?? 12
    const pe = (performance.now() - phaseStart.current) / 1000
    if (pe >= phaseDur && phase < 3 && !finished.current) {
      advancePhase()
    }
  }, [phaseElapsed])

  function advancePhase() {
    const next = phase + 1
    setPhase(next)
    phaseStart.current = performance.now()
    setPhaseElapsed(0)
    setSchulteNext(1)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
    playLevelUp()
  }

  // ── Faz 1: Storm start ────────────────────────────────────────
  useEffect(() => {
    if (phase !== 1) {
      if (stormTimer.current) clearTimeout(stormTimer.current)
      return
    }
    spawnStorm()
    return () => { if (stormTimer.current) clearTimeout(stormTimer.current) }
  }, [phase])

  function spawnStorm() {
    if (finished.current || phase !== 1) return
    const x = DOT_SIZE / 2 + Math.random() * (SW - 48 - DOT_SIZE)
    const y = DOT_SIZE / 2 + Math.random() * (SH * 0.4 - DOT_SIZE)
    const id = ++stormId.current
    setStormDot({ x, y, id })
    stormShownAt.current = performance.now()
    dotOpacity.value = withSequence(
      withTiming(1, { duration: 80 }),
      withTiming(1, { duration: 500 }),
      withTiming(0, { duration: 100 }),
    )
    stormTimer.current = setTimeout(() => {
      setStormDot(prev => {
        if (prev?.id === id) {
          stormMisses.current++
          spawnStorm()
          return null
        }
        return prev
      })
    }, 680)
  }

  // ── Faz 2: Spiral loop ────────────────────────────────────────
  useEffect(() => {
    if (phase !== 2) {
      if (spiralFrame.current) clearTimeout(spiralFrame.current)
      return
    }
    const loop = () => {
      if (finished.current || phase !== 2) return
      const t = ((performance.now() - phaseStart.current) / 1000 / PHASE_DURATIONS[2]) % 1
      const pos = spiralPoint(t)
      setSpiralDot(pos)
      if (fingerPos) {
        const err = Math.sqrt(Math.pow(pos.x - fingerPos.x, 2) + Math.pow(pos.y - fingerPos.y, 2))
        spiralErrors.current.push(err)
      }
      spiralFrame.current = setTimeout(loop, 33)
    }
    loop()
    return () => { if (spiralFrame.current) clearTimeout(spiralFrame.current) }
  }, [phase, fingerPos])

  // ── Faz 3: Flash start ────────────────────────────────────────
  useEffect(() => {
    if (phase !== 3) {
      if (flashTimer2.current) clearTimeout(flashTimer2.current)
      return
    }
    spawnFlash()
    return () => { if (flashTimer2.current) clearTimeout(flashTimer2.current) }
  }, [phase])

  function spawnFlash() {
    if (finished.current || phase !== 3) return
    const cell = Math.floor(Math.random() * 16)
    setFlashActive(cell)
    flashShownAt.current = performance.now()
    flashTimer2.current = setTimeout(() => {
      setFlashActive(prev => {
        if (prev === cell) {
          flashMisses.current++
          spawnFlash()
          return null
        }
        return prev
      })
    }, 500)
  }

  const panRef = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder:  () => true,
      onPanResponderGrant: (e) => setFingerPos({ x: e.nativeEvent.pageX, y: e.nativeEvent.pageY }),
      onPanResponderMove:  (e) => setFingerPos({ x: e.nativeEvent.pageX, y: e.nativeEvent.pageY }),
      onPanResponderRelease: () => setFingerPos(null),
    })
  )

  function finishAll() {
    // Tüm fazlar için ortak metrik hesapla
    const schulteAcc  = schulteHits.current + schulteMisses.current > 0
      ? (schulteHits.current / (schulteHits.current + schulteMisses.current)) * 100 : 50
    const stormAcc    = stormHits.current + stormMisses.current > 0
      ? (stormHits.current / (stormHits.current + stormMisses.current)) * 100 : 50
    const spiralAcc   = spiralErrors.current.length > 0
      ? Math.max(0, 100 - (spiralErrors.current.reduce((a, b) => a + b, 0) / spiralErrors.current.length / MAX_RADIUS) * 100) : 50
    const flashAcc    = flashHits.current + flashMisses.current > 0
      ? (flashHits.current / (flashHits.current + flashMisses.current)) * 100 : 50

    const avgAcc = (schulteAcc + stormAcc + spiralAcc + flashAcc) / 4
    const allRTs = [...schulteRTs.current, ...stormRTs.current, ...flashRTs.current]
    const avgRt = allRTs.length > 0 ? allRTs.reduce((a, b) => a + b, 0) / allRTs.length : 500
    const avgSpiralErr = spiralErrors.current.length > 0
      ? spiralErrors.current.reduce((a, b) => a + b, 0) / spiralErrors.current.length : 0

    const metrics: EyeMetrics = {
      reactionTimeMs:        avgRt,
      accuracyPercent:       avgAcc,
      trackingErrorPx:       avgSpiralErr,
      visualAttentionScore:  Math.min(100, avgAcc * 0.7 + Math.max(0, 100 - avgSpiralErr / 2) * 0.3),
      saccadicSpeedEstimate: (schulteHits.current + flashHits.current) / durationSeconds,
      taskCompletionMs:      performance.now() - masterStart.current,
      arpContribution:       12,
    }
    onComplete(metrics)
  }

  const totalTimeLeft = Math.max(0, durationSeconds - Math.floor(totalElapsed))
  const phaseTimeLeft = Math.max(0, (PHASE_DURATIONS[phase] ?? 12) - Math.floor(phaseElapsed))
  const color = PHASE_COLORS[phase] ?? '#1877F2'

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onExit} style={styles.exitBtn}>
          <Text style={styles.exitText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.timerText}>{totalTimeLeft}sn</Text>
        <View style={[styles.phaseChip, { borderColor: color }]}>
          <Text style={[styles.phaseText, { color }]}>{phaseTimeLeft}sn</Text>
        </View>
      </View>

      {/* Faz göstergesi */}
      <View style={styles.phaseBar}>
        {PHASE_DURATIONS.map((_, i) => (
          <View
            key={i}
            style={[
              styles.phasePip,
              { backgroundColor: i <= phase ? PHASE_COLORS[i] : 'rgba(255,255,255,0.12)' },
            ]}
          />
        ))}
      </View>

      <View style={styles.titleRow}>
        <Text style={styles.bossLabel}>🏆 BOSS</Text>
        <Text style={styles.title}>Kartal Meydan Okuması</Text>
        <Text style={[styles.phaseLabel, { color }]}>{PHASE_NAMES[phase]}</Text>
      </View>

      {/* ── Faz 0: Schulte ────────────────────────────────────── */}
      {phase === 0 && (
        <View style={styles.phaseArea}>
          <View style={styles.schulteGrid}>
            {schulteGrid.map((val, idx) => {
              const isHit  = schulteHit.has(val)
              const isNext = val === schulteNext
              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.schulteCell,
                    isHit  && { backgroundColor: 'rgba(34,197,94,0.15)', borderColor: '#22C55E' },
                    isNext && { backgroundColor: 'rgba(24,119,242,0.25)', borderColor: '#1877F2' },
                  ]}
                  onPressIn={() => {
                    if (val !== schulteNext) { schulteMisses.current++; return }
                    const rt = performance.now() - schulteTargetAt.current
                    schulteRTs.current.push(rt)
                    schulteHits.current++
                    schulteTargetAt.current = performance.now()
                    const newHit = new Set(schulteHit); newHit.add(val)
                    setSchulteHit(newHit)
                    setSchulteNext(prev => prev + 1)
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    playHit()
                  }}
                  hitSlop={6}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.schulteCellText,
                    isHit  && { color: '#22C55E', opacity: 0.4 },
                    isNext && { color: '#fff', fontSize: 20, fontWeight: '900' },
                  ]}>{val}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
          <Text style={styles.hintText}>Hedef: {schulteNext}</Text>
        </View>
      )}

      {/* ── Faz 1: Fırtına ────────────────────────────────────── */}
      {phase === 1 && (
        <View style={styles.phaseArea}>
          {stormDot && (
            <Animated.View style={[
              styles.stormDotWrap,
              { left: stormDot.x - DOT_SIZE / 2, top: stormDot.y - DOT_SIZE / 2 },
              dotStyle,
            ]}>
              <TouchableOpacity
                style={[styles.stormDot, { backgroundColor: '#00B890' }]}
                onPressIn={() => {
                  if (!stormDot) return
                  const rt = performance.now() - stormShownAt.current
                  stormRTs.current.push(rt)
                  stormHits.current++
                  setStormDot(null)
                  if (stormTimer.current) clearTimeout(stormTimer.current)
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  playHit()
                  spawnStorm()
                }}
                hitSlop={14}
                activeOpacity={0.7}
              />
            </Animated.View>
          )}
          <Text style={[styles.hintText, { marginTop: SH * 0.42 }]}>Yeşil noktaya dokun!</Text>
        </View>
      )}

      {/* ── Faz 2: Spiral ─────────────────────────────────────── */}
      {phase === 2 && (
        <View style={StyleSheet.absoluteFill} {...panRef.current.panHandlers}>
          {fingerPos && (
            <View style={[styles.finger, { left: fingerPos.x - 20, top: fingerPos.y - 20 }]} />
          )}
          <View style={[
            styles.spiralDot,
            { left: spiralDot.x - DOT_SIZE / 2, top: spiralDot.y - DOT_SIZE / 2 },
          ]} />
          <Text style={[styles.hintText, { position: 'absolute', bottom: 80, alignSelf: 'center' }]}>
            Parmağınla takip et!
          </Text>
        </View>
      )}

      {/* ── Faz 3: Flash 4×4 ──────────────────────────────────── */}
      {phase === 3 && (
        <View style={styles.phaseArea}>
          <View style={styles.flashGrid}>
            {Array.from({ length: 16 }, (_, i) => {
              const isActive = i === flashActive
              return (
                <TouchableOpacity
                  key={i}
                  style={[styles.flashCell, isActive && styles.flashCellActive]}
                  onPressIn={() => {
                    if (i !== flashActive) { flashMisses.current++; return }
                    flashRTs.current.push(performance.now() - flashShownAt.current)
                    flashHits.current++
                    setFlashActive(null)
                    if (flashTimer2.current) clearTimeout(flashTimer2.current)
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    playHit()
                    spawnFlash()
                  }}
                  activeOpacity={0.6}
                >
                  {isActive && <View style={styles.flashCore} />}
                </TouchableOpacity>
              )
            })}
          </View>
          <Text style={styles.hintText}>Parlayan bölgeye dokun!</Text>
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 6,
  },
  exitBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  exitText:  { color: '#fff', fontSize: 16 },
  timerText: { color: '#fff', fontSize: 24, fontWeight: '800' },
  phaseChip: {
    borderRadius: 10, borderWidth: 2, paddingHorizontal: 10, paddingVertical: 4,
  },
  phaseText: { fontSize: 16, fontWeight: '700' },

  phaseBar: {
    flexDirection: 'row', gap: 6,
    paddingHorizontal: 20, marginBottom: 8,
  },
  phasePip: { flex: 1, height: 4, borderRadius: 2 },

  titleRow:   { alignItems: 'center', marginBottom: 8 },
  bossLabel:  { color: '#FFD700', fontSize: 12, fontWeight: '800', letterSpacing: 1.5 },
  title:      { color: '#fff', fontSize: 20, fontWeight: '800' },
  phaseLabel: { fontSize: 12, marginTop: 3 },

  phaseArea:  { flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' },

  schulteGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  schulteCell:    {
    width: SCHULTE_CELL, height: SCHULTE_CELL, borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  schulteCellText:{ color: 'rgba(255,255,255,0.65)', fontSize: 16, fontWeight: '700' },

  stormDotWrap: { position: 'absolute' },
  stormDot:     {
    width: DOT_SIZE, height: DOT_SIZE, borderRadius: DOT_SIZE / 2,
    shadowOffset: { width: 0, height: 0 }, shadowRadius: 12, shadowOpacity: 0.8, elevation: 8,
  },

  finger: {
    position: 'absolute', width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
  },
  spiralDot: {
    position: 'absolute', width: DOT_SIZE, height: DOT_SIZE, borderRadius: DOT_SIZE / 2,
    backgroundColor: '#FF9F1C',
    shadowColor: '#FF9F1C', shadowOffset: { width: 0, height: 0 }, shadowRadius: 14, shadowOpacity: 0.9,
    elevation: 8,
  },

  flashGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  flashCell:     {
    width: (SW - 48 - 18) / 4, height: (SW - 48 - 18) / 4, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center', justifyContent: 'center',
  },
  flashCellActive: {
    backgroundColor: 'rgba(24,119,242,0.25)', borderColor: '#1877F2',
    shadowColor: '#1877F2', shadowOffset: { width: 0, height: 0 }, shadowRadius: 12, shadowOpacity: 0.7,
    elevation: 6,
  },
  flashCore: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#1877F2' },

  hintText: { color: 'rgba(255,255,255,0.45)', fontSize: 13, marginTop: 16 },
})
