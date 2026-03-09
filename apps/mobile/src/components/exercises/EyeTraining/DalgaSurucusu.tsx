/**
 * DalgaSurucusu — Göz Takibi (Smooth Pursuit) Egzersizi
 *
 * Sinüs dalgası boyunca hareket eden nokta.
 * PanResponder ile parmağı noktaya yakın tut.
 * Tracking error ölçülür.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions, SafeAreaView,
  PanResponder,
} from 'react-native'
import type { EyeExerciseProps, EyeMetrics } from '@sprinta/shared'

const { width: SW, height: SH } = Dimensions.get('window')
const BG = '#0A0F1F'
const ACCENT = '#FF9F1C'
const DOT_SIZE = 40
const AREA_TOP = 160
const AREA_H = SH * 0.45
const WAVE_AMP = AREA_H * 0.35
const WAVE_CY = AREA_TOP + AREA_H / 2

function wavePoint(t: number): { x: number; y: number } {
  return {
    x: t * SW,
    y: WAVE_CY + WAVE_AMP * Math.sin(t * Math.PI * 4),
  }
}

export default function DalgaSurucusu({
  durationSeconds,
  onComplete,
  onExit,
}: EyeExerciseProps) {
  const startTime = useRef(performance.now())
  const [elapsed, setElapsed] = useState(0)
  const [dotPos, setDotPos] = useState({ x: 0, y: WAVE_CY })
  const [fingerPos, setFingerPos] = useState<{ x: number; y: number } | null>(null)
  const trackingErrors = useRef<number[]>([])
  const finished = useRef(false)
  const animFrame = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Dalga hareketi ─────────────────────────────────────────────
  useEffect(() => {
    const update = () => {
      if (finished.current) return
      const e = (performance.now() - startTime.current) / 1000
      const t = (e % 3) / 3   // 3 sn'de bir tam dalga
      const pos = wavePoint(t)
      setDotPos(pos)

      if (fingerPos) {
        const err = Math.sqrt(
          Math.pow(pos.x - fingerPos.x, 2) + Math.pow(pos.y - fingerPos.y, 2)
        )
        trackingErrors.current.push(err)
      }
      animFrame.current = setTimeout(update, 33)
    }
    update()
    return () => { if (animFrame.current) clearTimeout(animFrame.current) }
  }, [fingerPos])

  // ── Timer ──────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      const e = (performance.now() - startTime.current) / 1000
      setElapsed(e)
      if (e >= durationSeconds && !finished.current) {
        finished.current = true
        clearInterval(interval)
        finishExercise()
      }
    }, 500)
    return () => clearInterval(interval)
  }, [durationSeconds])

  const panRef = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder:  () => true,
      onPanResponderGrant: (evt) => {
        setFingerPos({ x: evt.nativeEvent.pageX, y: evt.nativeEvent.pageY })
      },
      onPanResponderMove: (evt) => {
        setFingerPos({ x: evt.nativeEvent.pageX, y: evt.nativeEvent.pageY })
      },
      onPanResponderRelease: () => setFingerPos(null),
    })
  )

  const finishExercise = useCallback(() => {
    if (animFrame.current) clearTimeout(animFrame.current)
    const errs = trackingErrors.current
    const avgErr = errs.length ? errs.reduce((a, b) => a + b, 0) / errs.length : 999
    const accuracy = Math.max(0, 100 - (avgErr / 120) * 100)
    const speed = Math.max(0, Math.min(100, (1 - avgErr / 100) * 100))

    const metrics: EyeMetrics = {
      reactionTimeMs:        0,
      accuracyPercent:       accuracy,
      trackingErrorPx:       avgErr,
      visualAttentionScore:  accuracy * 0.6 + speed * 0.4,
      saccadicSpeedEstimate: 0,
      taskCompletionMs:      performance.now() - startTime.current,
      arpContribution:       5,
    }
    onComplete(metrics)
  }, [onComplete])

  const timeLeft = Math.max(0, durationSeconds - Math.floor(elapsed))
  const lastErr = trackingErrors.current[trackingErrors.current.length - 1] ?? 0

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onExit} style={styles.exitBtn}>
          <Text style={styles.exitText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.timerText}>{timeLeft}sn</Text>
        <Text style={styles.scoreText}>{Math.round(elapsed)}sn</Text>
      </View>

      <View style={styles.titleRow}>
        <Text style={styles.title}>Dalga Sürücüsü</Text>
        <Text style={styles.subtitle}>Göz Takibi (Smooth Pursuit) · Dalgayı takip et</Text>
      </View>

      {/* Alan */}
      <View style={styles.area} {...panRef.current.panHandlers}>
        {/* Dalga kanalı (yatay çizgi) */}
        <View style={[styles.waveGuide, { top: WAVE_CY - 2 - AREA_TOP }]} />
        <View style={[styles.waveBound, { top: WAVE_CY - WAVE_AMP - AREA_TOP }]} />
        <View style={[styles.waveBound, { top: WAVE_CY + WAVE_AMP - AREA_TOP }]} />

        {/* Parmak */}
        {fingerPos && (
          <View style={[
            styles.finger,
            { left: fingerPos.x - 20, top: fingerPos.y - AREA_TOP - 20 },
          ]} />
        )}

        {/* Nokta */}
        <View style={[
          styles.dot,
          {
            left: dotPos.x - DOT_SIZE / 2,
            top:  dotPos.y - AREA_TOP - DOT_SIZE / 2,
          },
        ]} />
      </View>

      <View style={styles.bottomInfo}>
        <Text style={styles.infoText}>🌊 Parmağını turuncu noktayla birlikte hareket ettir!</Text>
        {trackingErrors.current.length > 10 && (
          <Text style={[
            styles.errText,
            { color: lastErr < 60 ? '#22C55E' : lastErr < 120 ? ACCENT : '#EF4444' },
          ]}>
            Sapma: {Math.round(lastErr)}px
          </Text>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8,
  },
  exitBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  exitText:  { color: '#fff', fontSize: 16 },
  timerText: { color: '#fff', fontSize: 24, fontWeight: '800' },
  scoreText: { color: ACCENT, fontSize: 16, fontWeight: '700' },

  titleRow:  { alignItems: 'center', marginBottom: 8 },
  title:     { color: '#fff', fontSize: 20, fontWeight: '800' },
  subtitle:  { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 4 },

  area: {
    flex:     1,
    position: 'relative',
    overflow: 'hidden',
  },

  waveGuide: {
    position:        'absolute',
    left:            0, right: 0,
    height:          2,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  waveBound: {
    position:        'absolute',
    left:            0, right: 0,
    height:          1,
    backgroundColor: `${ACCENT}20`,
  },

  finger: {
    position:        'absolute',
    width:           40, height: 40,
    borderRadius:    20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth:     2,
    borderColor:     'rgba(255,255,255,0.4)',
  },

  dot: {
    position:        'absolute',
    width:           DOT_SIZE, height: DOT_SIZE,
    borderRadius:    DOT_SIZE / 2,
    backgroundColor: ACCENT,
    shadowColor:     ACCENT,
    shadowOffset:    { width: 0, height: 0 },
    shadowRadius:    14,
    shadowOpacity:   0.9,
    elevation:       8,
  },

  bottomInfo: { alignItems: 'center', paddingBottom: 24, gap: 6 },
  infoText:   { color: 'rgba(255,255,255,0.45)', fontSize: 13, textAlign: 'center' },
  errText:    { fontSize: 13, fontWeight: '700' },
})
