/**
 * WeeklyMomentumStrip — v4 Modern Design
 * Beyaz kart · Teal yukarı · Kırmızı aşağı · Gri nötr
 * Color-coded Pzt–Paz · WPM + session count · Animated bars
 */
import React, { useRef, useEffect } from 'react'
import { View, Text, ScrollView, StyleSheet, Animated } from 'react-native'
import { useHomeStore } from '../../../stores/homeStore'
import type { DayStat } from '../../../stores/homeStore'

const TEAL   = '#40C8F0'   // İş Bankası accent blue
const RED    = '#F87171'
const GRAY   = '#D1D5DB'
const CARD   = '#FFFFFF'
const BORDER = '#E2E8F8'
const TEXT   = '#1A1A2E'
const TEXT_S = '#6B7A99'
const TEXT_H = '#8892A4'
const SOFT   = '#F0F4FF'

const BAR_MAX_H = 48

function trendColor(trend: DayStat['trend']): string {
  if (trend === 'up')   return TEAL
  if (trend === 'down') return RED
  return GRAY
}

// ─── Tek Gün Kartı ────────────────────────────────────────────────
function DayCard({ day, maxWPM }: { day: DayStat; maxWPM: number }) {
  const barH    = Math.max(4, (day.wpm / maxWPM) * BAR_MAX_H)
  const color   = trendColor(day.trend)
  const barAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(barAnim, {
      toValue: barH, duration: 500,
      delay: Math.random() * 150,
      useNativeDriver: false,
    }).start()
  }, [barH])

  return (
    <View style={[dc.dayCol, day.isToday && dc.dayColToday]}>
      <View style={[dc.barWrap, { height: BAR_MAX_H }]}>
        <Animated.View style={[dc.bar, { height: barAnim, backgroundColor: color }]} />
      </View>
      <Text style={[dc.dayLabel, day.isToday && dc.dayLabelToday]}>
        {day.label}
      </Text>
      <View style={[dc.sessionPill, { backgroundColor: color + '25' }]}>
        <Text style={[dc.sessionTxt, { color }]}>{day.sessions}×</Text>
      </View>
    </View>
  )
}

const dc = StyleSheet.create({
  dayCol: {
    alignItems: 'center', gap: 4,
    paddingHorizontal: 4, paddingVertical: 8,
    borderRadius: 12,
  },
  dayColToday:      { backgroundColor: 'rgba(0,212,170,0.08)' },
  barWrap:          { justifyContent: 'flex-end' },
  bar:              { width: 24, borderRadius: 5 },
  dayLabel:         { fontSize: 11, fontWeight: '600', color: TEXT_S },
  dayLabelToday:    { color: TEAL, fontWeight: '800' },
  sessionPill:      { borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2 },
  sessionTxt:       { fontSize: 10, fontWeight: '700' },
})

// ─── Ana Bileşen ──────────────────────────────────────────────────
export function WeeklyMomentumStrip() {
  const { weeklyStats } = useHomeStore()

  const maxWPM    = Math.max(...weeklyStats.map((d) => d.wpm), 1)
  const totalMins = weeklyStats.reduce((acc, d) => acc + d.minutes, 0)
  const upDays    = weeklyStats.filter((d) => d.trend === 'up').length

  return (
    <View style={s.wrap}>
      <View style={s.titleRow}>
        <Text style={s.sectionTitle}>📊 Bu Hafta</Text>
      </View>
      <View style={s.pillRow}>
        <View style={s.infoPill}>
          <Text style={s.infoPillTxt}>⏰ {totalMins} dk</Text>
        </View>
        <View style={s.upPill}>
          <Text style={s.upTxt}>🔥 ↑ {upDays} gün aktif</Text>
        </View>
      </View>

      <View style={s.card}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.strip}
        >
          {weeklyStats.map((day) => (
            <DayCard key={day.label} day={day} maxWPM={maxWPM} />
          ))}
        </ScrollView>
      </View>
    </View>
  )
}

// ─── Stiller ─────────────────────────────────────────────────────
const s = StyleSheet.create({
  wrap: { marginHorizontal: 16, marginTop: 16 },

  titleRow: {
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: TEXT },
  pillRow: {
    flexDirection: 'row', gap: 8, marginBottom: 12,
  },
  infoPill: {
    backgroundColor: '#D9E5FF',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
  },
  infoPillTxt: { fontSize: 12, fontWeight: '600', color: '#6B7A99' },
  upPill: {
    backgroundColor: 'rgba(0,212,170,0.12)',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
  },
  upTxt: { fontSize: 12, fontWeight: '700', color: TEAL },

  card: {
    backgroundColor: CARD,
    borderRadius: 18,
    borderWidth: 1, borderColor: BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8,
    elevation: 3, paddingVertical: 12,
  },
  strip: {
    paddingHorizontal: 12, gap: 4, alignItems: 'flex-end',
  },
})
