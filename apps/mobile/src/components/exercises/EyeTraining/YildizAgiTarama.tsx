/**
 * YildizAgiTarama — Çevresel Görüş (Periferik) Egzersizi
 *
 * 6 kollu yıldız konumlarında hedefler dağılır.
 * Altın ★ olanları bul ve dokun.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions, SafeAreaView,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import { useEyeSoundFeedback } from './useEyeSoundFeedback'
import type { EyeExerciseProps, EyeMetrics } from '@sprinta/shared'

const { width: SW, height: SH } = Dimensions.get('window')
const BG = '#0A0F1F'
const ACCENT = '#00B890'
const TARGET_COLOR  = '#FFD700'
const DECOY_COLOR   = '#3B82F6'
const DOT_SIZE = 48
const RADIUS = Math.min(SW, SH) * 0.30

// 6 kollu yıldız: 0°, 60°, 120°, 180°, 240°, 300°
const STAR_POSITIONS = Array.from({ length: 6 }, (_, i) => {
  const angle = (i * 60 - 90) * (Math.PI / 180)
  return {
    x: SW / 2 + RADIUS * Math.cos(angle),
    y: SH * 0.42 + RADIUS * Math.sin(angle),
  }
})

// Ara pozisyonlar (12 nokta toplam)
const MID_POSITIONS = Array.from({ length: 6 }, (_, i) => {
  const angle = (i * 60 - 60) * (Math.PI / 180)
  return {
    x: SW / 2 + (RADIUS * 0.55) * Math.cos(angle),
    y: SH * 0.42 + (RADIUS * 0.55) * Math.sin(angle),
  }
})

const ALL_POSITIONS = [...STAR_POSITIONS, ...MID_POSITIONS]

interface DotInfo {
  x: number
  y: number
  isTarget: boolean
  id: number
}

function generateRound(): DotInfo[] {
  const shuffled = [...ALL_POSITIONS].sort(() => Math.random() - 0.5)
  const count = 8 + Math.floor(Math.random() * 4)   // 8–11 nokta
  const targetCount = 2 + Math.floor(Math.random() * 3)  // 2–4 hedef

  return shuffled.slice(0, count).map((pos, i) => ({
    x:        pos.x,
    y:        pos.y,
    isTarget: i < targetCount,
    id:       i,
  }))
}

export default function YildizAgiTarama({
  durationSeconds,
  onComplete,
  onExit,
}: EyeExerciseProps) {
  const { playHit, playMiss, playSuccess } = useEyeSoundFeedback()
  const startTime = useRef(performance.now())
  const [elapsed, setElapsed] = useState(0)
  const [dots, setDots] = useState<DotInfo[]>(() => generateRound())
  const [tappedIds, setTappedIds] = useState<Set<number>>(new Set())
  const [score, setScore] = useState(0)
  const [errors, setErrors] = useState(0)
  const [round, setRound] = useState(0)
  const reactionTimes = useRef<number[]>([])
  const roundStart = useRef(performance.now())
  const finished = useRef(false)

  const targets = dots.filter(d => d.isTarget)
  const found = dots.filter(d => d.isTarget && tappedIds.has(d.id))
  const roundComplete = found.length === targets.length

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

  // Tur tamamlandığında yeni tur
  useEffect(() => {
    if (!roundComplete || finished.current) return
    playSuccess()
    const t = setTimeout(() => {
      setDots(generateRound())
      setTappedIds(new Set())
      roundStart.current = performance.now()
      setRound(r => r + 1)
    }, 600)
    return () => clearTimeout(t)
  }, [roundComplete])

  function handleDotPress(dot: DotInfo) {
    if (tappedIds.has(dot.id) || finished.current) return
    const rt = performance.now() - roundStart.current
    reactionTimes.current.push(rt)

    const newTapped = new Set(tappedIds)
    newTapped.add(dot.id)
    setTappedIds(newTapped)

    if (dot.isTarget) {
      setScore(s => s + 1)
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      playHit()
    } else {
      setErrors(e => e + 1)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      playMiss()
    }
  }

  const finishExercise = useCallback(() => {
    const rts = reactionTimes.current
    const total = score + errors
    const avgRt = rts.length ? rts.reduce((a, b) => a + b, 0) / rts.length : 999
    const accuracy = total > 0 ? (score / total) * 100 : 0
    const speed = Math.max(0, Math.min(100, (1 - avgRt / 5000) * 100))

    const metrics: EyeMetrics = {
      reactionTimeMs:        avgRt,
      accuracyPercent:       accuracy,
      trackingErrorPx:       0,
      visualAttentionScore:  accuracy * 0.6 + speed * 0.4,
      saccadicSpeedEstimate: score / durationSeconds,
      taskCompletionMs:      performance.now() - startTime.current,
      arpContribution:       4,
    }
    onComplete(metrics)
  }, [score, errors, durationSeconds, onComplete])

  const timeLeft = Math.max(0, durationSeconds - Math.floor(elapsed))

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onExit} style={styles.exitBtn}>
          <Text style={styles.exitText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.timerText}>{timeLeft}sn</Text>
        <Text style={styles.scoreText}>✓ {score}</Text>
      </View>

      <View style={styles.titleRow}>
        <Text style={styles.title}>Yıldız Ağı Tarama</Text>
        <Text style={styles.subtitle}>Çevresel Görüş (Periferik) · Altın noktaları bul</Text>
        <Text style={styles.roundInfo}>Tur {round + 1} · {found.length}/{targets.length} bulundu</Text>
      </View>

      {/* Yıldız ağı */}
      <View style={styles.starField}>
        {/* Merkez */}
        <View style={styles.centerDot} />

        {/* Noktalar */}
        {dots.map((dot) => {
          const tapped = tappedIds.has(dot.id)
          return (
            <TouchableOpacity
              key={`${round}-${dot.id}`}
              style={[
                styles.dot,
                {
                  left: dot.x - DOT_SIZE / 2,
                  top:  dot.y - DOT_SIZE / 2,
                  backgroundColor: tapped
                    ? (dot.isTarget ? 'rgba(0,184,144,0.3)' : 'rgba(239,68,68,0.3)')
                    : dot.isTarget ? 'rgba(255,215,0,0.15)' : 'rgba(59,130,246,0.10)',
                  borderColor: tapped
                    ? (dot.isTarget ? ACCENT : '#EF4444')
                    : dot.isTarget ? TARGET_COLOR : DECOY_COLOR,
                  opacity: tapped ? 0.5 : 1,
                },
              ]}
              onPressIn={() => handleDotPress(dot)}
              hitSlop={10}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.dotIcon,
                { color: dot.isTarget ? TARGET_COLOR : DECOY_COLOR },
              ]}>
                {dot.isTarget ? '★' : '●'}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>

      <View style={styles.bottomInfo}>
        <Text style={styles.infoText}>Altın yıldızları (★) bul — mavi noktalardan kaçın!</Text>
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
  scoreText: { color: ACCENT, fontSize: 18, fontWeight: '700' },

  titleRow:  { alignItems: 'center', marginBottom: 4 },
  title:     { color: '#fff', fontSize: 20, fontWeight: '800' },
  subtitle:  { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 4 },
  roundInfo: { color: TARGET_COLOR, fontSize: 12, fontWeight: '700', marginTop: 2 },

  starField: {
    flex:     1,
    position: 'relative',
  },

  centerDot: {
    position:        'absolute',
    width:           16,
    height:          16,
    borderRadius:    8,
    backgroundColor: '#FFFFFF',
    left:            SW / 2 - 8,
    top:             SH * 0.42 - 8,
    shadowColor:     '#fff',
    shadowOffset:    { width: 0, height: 0 },
    shadowRadius:    8,
    shadowOpacity:   0.8,
  },

  dot: {
    position:       'absolute',
    width:          DOT_SIZE,
    height:         DOT_SIZE,
    borderRadius:   DOT_SIZE / 2,
    borderWidth:    2,
    alignItems:     'center',
    justifyContent: 'center',
  },
  dotIcon: { fontSize: 22, fontWeight: '900' },

  bottomInfo: { alignItems: 'center', paddingBottom: 24 },
  infoText:   { color: 'rgba(255,255,255,0.45)', fontSize: 13 },
})
