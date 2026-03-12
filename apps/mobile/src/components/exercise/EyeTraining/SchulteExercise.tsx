/**
 * SchulteExercise — Schulte Tablosu Egzersizi
 * Seviye rozeti · Canlı doğruluk · İlerleme çubuğu · Dur butonu
 * ChunkReader ile aynı tasarım dili
 */
import React, { useState, useRef, useCallback } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native'
import * as Haptics from 'expo-haptics'

const NAVY   = '#0D1B3E'
const BODY   = '#F8F9FC'
const CARD   = '#FFFFFF'
const BORDER = '#E2E8F8'
const TEXT_S = '#6B7A99'
const GREEN  = '#059669'
const RED    = '#EF4444'

export interface SchulteMetrics {
  completionTime:  number  // ms
  errorCount:      number
  gridSize:        number
  peripheralScore: number  // 0-100
  accuracy:        number  // 0-100
}

interface Props {
  difficultyLevel?: number  // 1-10 → 5×5(1-3), 6×6(4-7), 7×7(8-10)
  accentColor?:     string
  onComplete: (metrics: SchulteMetrics) => void
  onExit:     () => void
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Zorluk → seviye etiketi
function diffToLevel(diff: number): number {
  if (diff <= 3) return diff
  if (diff <= 7) return diff
  return diff
}

// Grid boyutu → XP ödülü
function gridToXP(gridSize: number): number {
  if (gridSize === 5) return 50
  if (gridSize === 6) return 75
  return 100
}

export function SchulteExercise({ difficultyLevel = 5, accentColor, onComplete, onExit }: Props) {
  const accent   = accentColor ?? '#F59E0B'
  const gridSize = difficultyLevel <= 3 ? 5 : difficultyLevel <= 7 ? 6 : 7
  const total    = gridSize * gridSize
  const xpReward = gridToXP(gridSize)
  const level    = difficultyLevel

  const [numbers]   = useState(() => shuffle(Array.from({ length: total }, (_, i) => i + 1)))
  const [next,   setNext]   = useState(1)
  const [errors, setErrors] = useState(0)
  const [found,  setFound]  = useState<Set<number>>(new Set())
  const [startTime] = useState(Date.now())
  const flashAnim   = useRef(new Animated.Value(1)).current

  const flash = useCallback(() => {
    Animated.sequence([
      Animated.timing(flashAnim, { toValue: 0.5, duration: 60,  useNativeDriver: true }),
      Animated.timing(flashAnim, { toValue: 1,   duration: 120, useNativeDriver: true }),
    ]).start()
  }, [flashAnim])

  const handleTap = useCallback((num: number) => {
    if (num === next) {
      Haptics.selectionAsync()
      flash()
      const newFound = new Set(found)
      newFound.add(num)
      setFound(newFound)
      if (num === total) {
        const elapsed      = Date.now() - startTime
        const timeScore    = Math.max(0, 100 - Math.floor(elapsed / 1000))
        const errorPenalty = errors * 5
        const peripheral   = Math.max(0, Math.min(100, timeScore - errorPenalty))
        const accuracy     = Math.round((total / (total + errors)) * 100)
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        onComplete({ completionTime: elapsed, errorCount: errors, gridSize, peripheralScore: peripheral, accuracy })
      } else {
        setNext(n => n + 1)
      }
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      setErrors(e => e + 1)
    }
  }, [next, total, errors, found, startTime, gridSize, flash, onComplete])

  const foundCount = found.size
  const progress   = foundCount / total
  const pct        = Math.round(progress * 100)
  const accuracy   = foundCount + errors > 0
    ? Math.round((foundCount / (foundCount + errors)) * 100)
    : 100

  const CELL = gridSize === 5 ? 60 : gridSize === 6 ? 50 : 42
  const GAP  = 6

  return (
    <View style={s.root}>

      {/* ── Üst ince progress çizgisi ─────────────────────── */}
      <View style={s.topBar}>
        <View style={[s.topFill, { width: `${pct}%` as any, backgroundColor: accent }]} />
      </View>

      {/* ── Seviye + XP rozeti ────────────────────────────── */}
      <View style={s.levelRow}>
        <View style={[s.levelBadge, { backgroundColor: accent + '20', borderColor: accent + '55' }]}>
          <Text style={[s.levelTxt, { color: accent }]}>🏆 SEVİYE {level}</Text>
        </View>
        <View style={s.xpBadge}>
          <Text style={s.xpTxt}>Tamamla ⚡ +{xpReward}</Text>
        </View>
      </View>

      {/* ── Hedef + skor satırı ───────────────────────────── */}
      <View style={s.statusRow}>
        {/* Hedef sayı */}
        <View style={s.targetWrap}>
          <Text style={s.targetLabel}>HEDEF</Text>
          <Text style={[s.targetNum, { color: accent }]}>{next}</Text>
        </View>
        {/* Dikey ayraç */}
        <View style={s.separator} />
        {/* Bulundu */}
        <View style={s.statItem}>
          <Text style={s.statLabel}>BULUNDU</Text>
          <Text style={[s.statVal, { color: GREEN }]}>✓ {foundCount}</Text>
        </View>
        {/* Dikey ayraç */}
        <View style={s.separator} />
        {/* Doğruluk */}
        <View style={s.statItem}>
          <Text style={s.statLabel}>DOĞRULUK</Text>
          <Text style={[s.statVal, { color: accuracy >= 80 ? GREEN : RED }]}>%{accuracy}</Text>
        </View>
        {/* Dikey ayraç */}
        <View style={s.separator} />
        {/* Hata */}
        <View style={s.statItem}>
          <Text style={s.statLabel}>HATA</Text>
          <Text style={[s.statVal, { color: errors > 0 ? RED : TEXT_S }]}>✗ {errors}</Text>
        </View>
      </View>

      {/* ── Schulte Grid ──────────────────────────────────── */}
      <Animated.View style={[s.grid, { opacity: flashAnim }]}>
        {Array.from({ length: gridSize }, (_, row) => (
          <View key={row} style={{ flexDirection: 'row', gap: GAP, marginBottom: GAP }}>
            {Array.from({ length: gridSize }, (_, col) => {
              const num     = numbers[row * gridSize + col]
              const isFound = found.has(num)
              const isNext  = num === next
              return (
                <TouchableOpacity
                  key={col}
                  style={[
                    s.cell,
                    { width: CELL, height: CELL },
                    isFound && s.cellFound,
                    isNext  && { borderColor: accent, borderWidth: 2.5 },
                  ]}
                  onPress={() => handleTap(num)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    s.cellNum,
                    { fontSize: gridSize === 7 ? 16 : 20 },
                    isFound && s.cellNumFound,
                    isNext  && { color: accent, fontWeight: '900' },
                  ]}>
                    {num}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        ))}
      </Animated.View>

      {/* ── Alt progress + Dur butonu ────────────────────── */}
      <View style={s.bottomArea}>
        <View style={s.progressWrap}>
          <View style={s.progressTrack}>
            <View style={[s.progressFill, { width: `${pct}%` as any, backgroundColor: accent }]} />
          </View>
          <View style={s.progressStats}>
            <Text style={s.progressTxt}>{foundCount} / {total} hücre</Text>
            <Text style={[s.progressTxt, { color: accent, fontWeight: '800' }]}>%{pct}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[s.durBtn, { backgroundColor: accent }]}
          onPress={onExit}
          activeOpacity={0.85}
        >
          <Text style={s.durTxt}>⏸ Dur</Text>
        </TouchableOpacity>
      </View>

    </View>
  )
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BODY,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  // Üst ince bar
  topBar:  { height: 3, backgroundColor: BORDER, marginHorizontal: -16, marginBottom: 14 },
  topFill: { height: 3 },

  // Seviye rozeti
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  levelBadge: {
    borderRadius: 20, borderWidth: 1,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  levelTxt:  { fontSize: 12, fontWeight: '800' },
  xpBadge: {
    backgroundColor: '#FEF3C7',
    borderRadius: 20, borderWidth: 1, borderColor: '#FDE68A',
    paddingHorizontal: 12, paddingVertical: 6,
  },
  xpTxt: { fontSize: 11, fontWeight: '700', color: '#92400E' },

  // Hedef + skor satırı
  statusRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: CARD, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: BORDER,
    marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  targetWrap: { flex: 1.2, alignItems: 'center' },
  targetLabel: { fontSize: 9, fontWeight: '800', color: TEXT_S, letterSpacing: 0.8, marginBottom: 2 },
  targetNum:   { fontSize: 28, fontWeight: '900' },
  separator:   { width: 1, height: 36, backgroundColor: BORDER },
  statItem:    { flex: 1, alignItems: 'center' },
  statLabel:   { fontSize: 9, fontWeight: '800', color: TEXT_S, letterSpacing: 0.8, marginBottom: 2 },
  statVal:     { fontSize: 16, fontWeight: '800' },

  // Grid
  grid: { alignItems: 'center', marginBottom: 14 },
  cell: {
    backgroundColor: CARD,
    borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: BORDER,
    shadowColor: '#000', shadowOpacity: 0.05,
    shadowRadius: 3, shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  cellFound:    { backgroundColor: '#D1FAE5', borderColor: GREEN, borderWidth: 1.5 },
  cellNum:      { fontWeight: '700', color: NAVY },
  cellNumFound: { color: GREEN },

  // Alt alan
  bottomArea: { gap: 12 },
  progressWrap: { gap: 5 },
  progressTrack: {
    height: 6, backgroundColor: BORDER,
    borderRadius: 3, overflow: 'hidden',
  },
  progressFill:  { height: 6, borderRadius: 3 },
  progressStats: { flexDirection: 'row', justifyContent: 'space-between' },
  progressTxt:   { fontSize: 12, color: TEXT_S, fontWeight: '600' },

  durBtn: {
    borderRadius: 16, paddingVertical: 15,
    alignItems: 'center',
  },
  durTxt: { fontSize: 17, fontWeight: '800', color: '#fff' },
})
