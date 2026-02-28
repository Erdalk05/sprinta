/**
 * GamificationStatusCard — Stars + Streak + Milestone özeti
 * Egzersiz sonuç ekranının altına inject edilir.
 * Mevcut layouta dokunmaz — sadece ek olarak render edilir.
 */

import React, { useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import type { GamificationState, StarMilestone } from '@sprinta/api'

interface Props {
  gamState: GamificationState
}

// ─── Star row ────────────────────────────────────────────────────────────────
function StarDots({ filled, total = 3 }: { filled: number; total?: number }) {
  return (
    <View style={sd.row}>
      {Array.from({ length: total }).map((_, i) => (
        <Text key={i} style={[sd.dot, i < filled && sd.dotFilled]}>
          {i < filled ? '⭐' : '☆'}
        </Text>
      ))}
    </View>
  )
}

const sd = StyleSheet.create({
  row:       { flexDirection: 'row', gap: 4 },
  dot:       { fontSize: 18, opacity: 0.35 },
  dotFilled: { opacity: 1 },
})

// ─── Milestone badge ──────────────────────────────────────────────────────────
function MilestoneBadge({ m }: { m: StarMilestone }) {
  return (
    <View style={[mb.wrap, m.unlocked && mb.wrapUnlocked]}>
      <Text style={mb.icon}>{m.unlocked ? '🏆' : '🔒'}</Text>
      <Text style={[mb.label, m.unlocked && mb.labelUnlocked]} numberOfLines={2}>
        {m.label}
      </Text>
      <Text style={[mb.stars, m.unlocked && mb.starsUnlocked]}>{m.stars}⭐</Text>
    </View>
  )
}

const mb = StyleSheet.create({
  wrap:         { flex: 1, backgroundColor: '#0E1628', borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,245,255,0.1)' },
  wrapUnlocked: { borderColor: 'rgba(245,158,11,0.5)', backgroundColor: '#1A1205' },
  icon:         { fontSize: 22, marginBottom: 4 },
  label:        { fontSize: 9, color: '#8696A0', textAlign: 'center', lineHeight: 12 },
  labelUnlocked:{ color: '#F59E0B' },
  stars:        { fontSize: 10, color: '#8696A0', marginTop: 4 },
  starsUnlocked:{ color: '#F59E0B', fontWeight: '800' },
})

// ─── Main component ────────────────────────────────────────────────────────────
export function GamificationStatusCard({ gamState }: Props) {
  const { daily, streak, stats, milestones, newStars } = gamState

  const newStarsLabel = useMemo(() => {
    if (newStars === 3) return '🎉 Mükemmel! 3 yıldız'
    if (newStars === 2) return '✨ Harika! 2 yıldız'
    if (newStars === 1) return '👍 Güzel! 1 yıldız'
    return '💪 Devam et!'
  }, [newStars])

  return (
    <View style={s.card}>

      {/* ── Yeni yıldız banner ── */}
      {newStars > 0 && (
        <View style={s.newStarBanner}>
          <Text style={s.newStarTxt}>{newStarsLabel}</Text>
        </View>
      )}

      {/* ── Bugün + Streak satırı ── */}
      <View style={s.row}>

        {/* Bugünkü yıldızlar */}
        <View style={s.statBox}>
          <Text style={s.statLabel}>BUGÜN</Text>
          <StarDots filled={Math.min(daily.starsToday, 3)} />
          <Text style={s.statSub}>
            {daily.starsToday} / 3
            {daily.dailyCompleted ? '  ✓' : ''}
          </Text>
        </View>

        {/* Divider */}
        <View style={s.divider} />

        {/* Streak */}
        <View style={s.statBox}>
          <Text style={s.statLabel}>SERİ</Text>
          <Text style={s.streakVal}>{streak.currentStreak}</Text>
          <Text style={s.statSub}>gün 🔥</Text>
        </View>

        {/* Divider */}
        <View style={s.divider} />

        {/* Toplam */}
        <View style={s.statBox}>
          <Text style={s.statLabel}>TOPLAM</Text>
          <Text style={s.totalVal}>{stats.totalStars}</Text>
          <Text style={s.statSub}>yıldız ⭐</Text>
        </View>
      </View>

      {/* ── Milestone rozetleri ── */}
      <Text style={s.milestoneLabel}>KARTAL GÖZÜ ROZETLERİ</Text>
      <View style={s.milestoneRow}>
        {milestones.map((m) => (
          <MilestoneBadge key={m.badgeId} m={m} />
        ))}
      </View>

    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  card: {
    backgroundColor: '#0A0F1F',
    borderTopWidth:  1,
    borderTopColor:  'rgba(0,245,255,0.10)',
    paddingHorizontal: 20,
    paddingTop:      16,
    paddingBottom:   8,
  },

  newStarBanner: {
    backgroundColor:  'rgba(0,255,148,0.12)',
    borderRadius:     12,
    paddingVertical:  10,
    alignItems:       'center',
    marginBottom:     14,
    borderWidth:      1,
    borderColor:      'rgba(0,255,148,0.30)',
  },
  newStarTxt: { fontSize: 15, fontWeight: '800', color: '#00FF94' },

  row: {
    flexDirection:  'row',
    alignItems:     'center',
    marginBottom:   16,
  },
  statBox: { flex: 1, alignItems: 'center', gap: 4 },
  statLabel: {
    fontSize:      9,
    fontWeight:    '700',
    color:         '#8696A0',
    letterSpacing: 0.8,
  },
  statSub:  { fontSize: 11, color: '#8696A0' },

  streakVal: { fontSize: 28, fontWeight: '900', color: '#F97316' },
  totalVal:  { fontSize: 28, fontWeight: '900', color: '#F59E0B' },

  divider: { width: 1, height: 48, backgroundColor: 'rgba(0,245,255,0.08)' },

  milestoneLabel: {
    fontSize:      9,
    fontWeight:    '700',
    color:         '#8696A0',
    letterSpacing: 1,
    marginBottom:  8,
  },
  milestoneRow: { flexDirection: 'row', gap: 8 },
})
