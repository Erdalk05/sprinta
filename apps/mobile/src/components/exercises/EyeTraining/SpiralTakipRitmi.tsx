/**
 * SpiralTakipRitmi — Göz Takibi (Smooth Pursuit) Egzersizi
 *
 * Spiral path üzerinde hareket eden hedef.
 * Parmağı (PanResponder) hedefe yakın tutmaya çalış.
 * Tracking error hesaplanır.
 */
import { SafeAreaView } from 'react-native-safe-area-context'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions, 
  PanResponder,
} from 'react-native'
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, Easing,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import type { EyeExerciseProps, EyeMetrics } from '@sprinta/shared'

const { width: SW, height: SH } = Dimensions.get('window')
const BG = '#0A0F1F'
const ACCENT = '#FF9F1C'
const DOT_SIZE = 36
const AREA_CX = SW / 2
const AREA_CY = SH * 0.40
const MAX_RADIUS = Math.min(SW, SH) * 0.28

// Spiral path: t → (x, y)
function spiralPoint(t: number): { x: number; y: number } {
  const angle = t * Math.PI * 4       // 2 tam tur
  const r = (t % 1) * MAX_RADIUS      // genişleyen yarıçap
  return {
    x: AREA_CX + r * Math.cos(angle),
    y: AREA_CY + r * Math.sin(angle),
  }
}

export default function SpiralTakipRitmi({
  durationSeconds,
  onComplete,
  onExit,
}: EyeExerciseProps) {
  const startTime = useRef(performance.now())
  const [elapsed, setElapsed] = useState(0)
  const [dotPos, setDotPos] = useState({ x: AREA_CX, y: AREA_CY })
  const [fingerPos, setFingerPos] = useState<{ x: number; y: number } | null>(null)
  const trackingErrors = useRef<number[]>([])
  const finished = useRef(false)
  const animFrame = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Hareket loop ───────────────────────────────────────────────
  useEffect(() => {
    const update = () => {
      if (finished.current) return
      const elapsed = (performance.now() - startTime.current) / 1000
      const t = elapsed / durationSeconds
      const pos = spiralPoint(t)
      setDotPos(pos)

      // Tracking error kaydet
      if (fingerPos) {
        const err = Math.sqrt(
          Math.pow(pos.x - fingerPos.x, 2) + Math.pow(pos.y - fingerPos.y, 2)
        )
        trackingErrors.current.push(err)
      }

      animFrame.current = setTimeout(update, 33)  // ~30fps
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

  // PanResponder (parmak takibi)
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
    const accuracy = Math.max(0, 100 - (avgErr / MAX_RADIUS) * 100)
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
  const progress = elapsed / durationSeconds

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onExit} style={styles.exitBtn}>
          <Text style={styles.exitText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.timerText}>{timeLeft}sn</Text>
        <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
      </View>

      <View style={styles.titleRow}>
        <Text style={styles.title}>Spiral Takip Ritmi</Text>
        <Text style={styles.subtitle}>Göz Takibi (Smooth Pursuit) · Parmağınla takip et</Text>
      </View>

      {/* Alan */}
      <View style={styles.area} {...panRef.current.panHandlers}>
        {/* Spiral iz (basit — statik gösterim) */}
        <View style={styles.spiralHint}>
          <Text style={styles.spiralText}>🌀</Text>
        </View>

        {/* Parmak göstergesi */}
        {fingerPos && (
          <View style={[
            styles.finger,
            { left: fingerPos.x - 20, top: fingerPos.y - 80 },
          ]} />
        )}

        {/* Hareket eden hedef */}
        <View style={[
          styles.dot,
          { left: dotPos.x - DOT_SIZE / 2, top: dotPos.y - DOT_SIZE / 2 - 80 },
        ]} />
      </View>

      <View style={styles.bottomInfo}>
        <Text style={styles.infoText}>Turuncu noktayı parmağınla takip et!</Text>
        {trackingErrors.current.length > 0 && (
          <Text style={styles.errText}>
            Sapma: {Math.round(trackingErrors.current[trackingErrors.current.length - 1] ?? 0)}px
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
  exitText:    { color: '#fff', fontSize: 16 },
  timerText:   { color: '#fff', fontSize: 24, fontWeight: '800' },
  progressText:{ color: ACCENT, fontSize: 16, fontWeight: '700' },

  titleRow:  { alignItems: 'center', marginBottom: 8 },
  title:     { color: '#fff', fontSize: 20, fontWeight: '800' },
  subtitle:  { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 4 },

  area: {
    flex:     1,
    position: 'relative',
  },

  spiralHint: {
    position:       'absolute',
    left:           AREA_CX - 40,
    top:            AREA_CY - 120,
    alignItems:     'center',
    opacity:        0.08,
  },
  spiralText: { fontSize: 160 },

  finger: {
    position:        'absolute',
    width:           40,
    height:          40,
    borderRadius:    20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth:     2,
    borderColor:     '#FFFFFF',
  },

  dot: {
    position:        'absolute',
    width:           DOT_SIZE,
    height:          DOT_SIZE,
    borderRadius:    DOT_SIZE / 2,
    backgroundColor: ACCENT,
    shadowColor:     ACCENT,
    shadowOffset:    { width: 0, height: 0 },
    shadowRadius:    14,
    shadowOpacity:   0.9,
    elevation:       8,
  },

  bottomInfo: { alignItems: 'center', paddingBottom: 24, gap: 4 },
  infoText:   { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
  errText:    { color: ACCENT, fontSize: 12 },
})
