/**
 * ChunkReader — RSVP Hız Okuma Bileşeni
 * Seviye rozeti · WPM göstergesi · Gerçek WPM ölçümü · Dur butonu
 */
import React, { useState, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Animated } from 'react-native'

const NAVY    = '#0D1B3E'
const TEAL    = '#00D4AA'
const BODY    = '#F8F9FC'
const BORDER  = '#E2E8F8'
const TEXT_S  = '#6B7A99'
const TEXT_H  = '#8892A4'

// WPM → Seviye (bilimsel okuma hızı sınıflandırması)
function wpmToLevel(wpm: number): number {
  if (wpm < 150) return 1
  if (wpm < 200) return 2
  if (wpm < 250) return 3
  if (wpm < 300) return 4
  if (wpm < 400) return 5
  return 6
}

interface Props {
  text:         string
  targetWpm:    number
  chunkSize:    number
  accentColor?: string
  bgColor?:     string          // içerik alanı arka plan rengi
  fontSize?:    number          // chunk yazı boyutu (default 52)
  isPaused?:    boolean         // dışarıdan duraklatma kontrolü
  onProgress:   (wordsRead: number) => void
  onComplete:   (actualWpm?: number) => void
  onHalfway?:   () => void
  onQuit?:      () => void
}

export function ChunkReader({
  text, targetWpm, chunkSize, accentColor,
  bgColor,
  fontSize = 52,
  isPaused = false,
  onProgress, onComplete, onHalfway,
}: Props) {
  const accent = accentColor ?? '#6C3EE8'

  const words = text.trim().split(/\s+/)
  const chunks: string[] = []
  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize).join(' '))
  }

  const [currentIndex, setCurrentIndex] = useState(0)
  const halfwayFired = useRef(false)
  const fadeAnim     = useRef(new Animated.Value(1)).current
  const startTime    = useRef(Date.now())
  const pauseStart   = useRef<number | null>(null)

  const msPerChunk = Math.round((60 / targetWpm) * chunkSize * 1000)
  const FADE_MS    = 60

  // Dış isPaused değiştiğinde pause süresini WPM hesabına ekle
  useEffect(() => {
    if (isPaused) {
      pauseStart.current = Date.now()
    } else if (pauseStart.current) {
      startTime.current += Date.now() - pauseStart.current
      pauseStart.current = null
    }
  }, [isPaused])

  useEffect(() => {
    if (isPaused) return

    if (currentIndex >= chunks.length) {
      const elapsedMin  = (Date.now() - startTime.current) / 60000
      const actualWpm   = Math.round(words.length / Math.max(0.01, elapsedMin))
      onComplete(actualWpm)
      return
    }

    if (!halfwayFired.current && currentIndex >= Math.floor(chunks.length / 2)) {
      halfwayFired.current = true
      onHalfway?.()
    }

    fadeAnim.setValue(0)
    Animated.timing(fadeAnim, { toValue: 1, duration: FADE_MS, useNativeDriver: true }).start()

    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, { toValue: 0, duration: FADE_MS, useNativeDriver: true }).start(() => {
        const wordsInChunk = chunks[currentIndex].split(' ').length
        onProgress(wordsInChunk)
        setCurrentIndex(prev => prev + 1)
      })
    }, msPerChunk - FADE_MS)

    return () => clearTimeout(timer)
  }, [currentIndex, isPaused])

  const progress   = Math.min(1, currentIndex / Math.max(1, chunks.length))
  const pct        = Math.round(progress * 100)
  const level      = wpmToLevel(targetWpm)
  const wordsRead  = Math.min(words.length, currentIndex * chunkSize)

  return (
    <View style={[s.root, { backgroundColor: bgColor ?? BODY }]}>

      {/* ── Kelime sayacı — ÜSTTE ──────────────────────────────── */}
      <View style={s.countersRow}>
        <Text style={[s.counterVal, { color: accent }]}>{wordsRead}</Text>
        <Text style={s.counterSep}>/</Text>
        <Text style={s.counterTotal}>{words.length} kelime</Text>
        <View style={{ flex: 1 }} />
        <Text style={[s.counterPct, { color: accent }]}>%{pct}</Text>
      </View>

      {/* ── Progress track — sayacın hemen altında ─────────────── */}
      <View style={s.progressTrack}>
        <View style={[s.progressFill, { width: `${pct}%` as any, backgroundColor: accent }]} />
      </View>

      {/* ── Kelime alanı — merkez ──────────────────────────────── */}
      <View style={s.wordArea}>
        <Animated.Text style={[s.chunk, { opacity: fadeAnim, fontSize, lineHeight: fontSize * 1.25 }]}>
          {currentIndex < chunks.length ? chunks[currentIndex] : '✓'}
        </Animated.Text>
        <View style={[s.focusLine, { backgroundColor: accent }]} />
      </View>

      {/* ── Seviye rozeti + WPM — alt ──────────────────────────── */}
      <View style={s.metaRow}>
        <View style={[s.levelBadge, { backgroundColor: accent + '18', borderColor: accent + '40' }]}>
          <Text style={[s.levelTxt, { color: accent }]}>🏆 SEVİYE {level}</Text>
        </View>
        <Text style={[s.wpmPill, { color: accent }]}>⚡ {targetWpm} WPM</Text>
      </View>

    </View>
  )
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
  },

  // Sayaç satırı — EN ÜSTTE
  countersRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 8,
  },
  counterVal: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  counterSep: { fontSize: 16, color: TEXT_H, fontWeight: '400' },
  counterTotal: { fontSize: 14, color: TEXT_S, fontWeight: '600' },
  counterPct: { fontSize: 14, fontWeight: '800' },

  // Progress bar — sayacın altında
  progressTrack: {
    height: 5,
    backgroundColor: BORDER,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 0,
  },
  progressFill: { height: 5, borderRadius: 3 },

  // Kelime gösterim alanı — merkez
  wordArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  chunk: {
    fontSize: 52,
    fontWeight: '900',
    color: NAVY,
    textAlign: 'center',
    letterSpacing: 0.5,
    lineHeight: 64,
  },
  focusLine: {
    width: 48,
    height: 3,
    borderRadius: 2,
    opacity: 0.4,
  },

  // Meta satırı — alt
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  levelBadge: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  levelTxt: { fontSize: 12, fontWeight: '800' },
  wpmPill: { fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
})
