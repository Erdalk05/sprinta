/**
 * WeeklyMomentumStrip — Sport Premium Edition
 * Color-coded Mon–Sun · WPM + session count · Animated bars
 */
import React, { useMemo, useRef, useEffect } from 'react'
import { View, Text, ScrollView, StyleSheet, Animated } from 'react-native'
import { useHomeStore } from '../../../stores/homeStore'
import { useAppTheme } from '../../../theme/useAppTheme'
import type { AppTheme } from '../../../theme'
import type { DayStat } from '../../../stores/homeStore'

const BAR_MAX_H = 48

// ─── Renk Mantığı ─────────────────────────────────────────────────
function trendColor(trend: DayStat['trend'], energyGreen: string): string {
  if (trend === 'up')   return energyGreen
  if (trend === 'down') return '#F87171'
  return '#D1D5DB'
}

// ─── Tek Gün Kartı ────────────────────────────────────────────────
function DayCard({ day, maxWPM, t }: { day: DayStat; maxWPM: number; t: AppTheme }) {
  const s      = useMemo(() => cardStyles(t), [t])
  const barH   = Math.max(4, (day.wpm / maxWPM) * BAR_MAX_H)
  const color  = trendColor(day.trend, t.colors.energyGreen)

  const barAnim = useRef(new Animated.Value(0)).current
  useEffect(() => {
    Animated.timing(barAnim, {
      toValue:         barH,
      duration:        500,
      delay:           Math.random() * 150,
      useNativeDriver: false,
    }).start()
  }, [barH])

  return (
    <View style={[s.dayCol, day.isToday && s.dayColToday]}>
      {/* WPM */}
      <Text style={[s.wpmTxt, { color }]}>{day.wpm}</Text>

      {/* Bar */}
      <View style={[s.barWrap, { height: BAR_MAX_H }]}>
        <Animated.View style={[s.bar, { height: barAnim, backgroundColor: color }]} />
      </View>

      {/* Day label */}
      <Text style={[s.dayLabel, day.isToday && s.dayLabelToday]}>
        {day.label}
      </Text>

      {/* Sessions count */}
      <View style={[s.sessionPill, { backgroundColor: color + '25' }]}>
        <Text style={[s.sessionTxt, { color }]}>{day.sessions}×</Text>
      </View>
    </View>
  )
}

function cardStyles(t: AppTheme) {
  return StyleSheet.create({
    dayCol: {
      alignItems:   'center',
      gap:          4,
      paddingHorizontal: 4,
      paddingVertical:   8,
      borderRadius: 12,
    },
    dayColToday: {
      backgroundColor: 'rgba(0,200,83,0.08)',
    },
    wpmTxt:      { fontSize: 10, fontWeight: '700' },
    barWrap:     { justifyContent: 'flex-end' },
    bar:         { width: 24, borderRadius: 5 },
    dayLabel:    { fontSize: 11, fontWeight: '600', color: t.colors.textSub },
    dayLabelToday: { color: t.colors.energyGreen, fontWeight: '800' },
    sessionPill: { borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2 },
    sessionTxt:  { fontSize: 10, fontWeight: '700' },
  })
}

// ─── Ana Bileşen ─────────────────────────────────────────────────
export function WeeklyMomentumStrip() {
  const t = useAppTheme()
  const s = useMemo(() => ms(t), [t])
  const { weeklyStats } = useHomeStore()

  const maxWPM       = Math.max(...weeklyStats.map((d) => d.wpm), 1)
  const totalMins    = weeklyStats.reduce((acc, d) => acc + d.minutes, 0)
  const upDays       = weeklyStats.filter((d) => d.trend === 'up').length

  return (
    <View style={s.wrap}>
      {/* Title + summary */}
      <View style={s.titleRow}>
        <Text style={s.sectionTitle}>📈 Bu Hafta</Text>
        <View style={s.summaryGroup}>
          <Text style={s.summaryTxt}>{totalMins}dk</Text>
          <View style={s.upPill}>
            <Text style={s.upTxt}>↑ {upDays} gün</Text>
          </View>
        </View>
      </View>

      {/* Day cards */}
      <View style={s.card}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.strip}
        >
          {weeklyStats.map((day) => (
            <DayCard key={day.label} day={day} maxWPM={maxWPM} t={t} />
          ))}
        </ScrollView>
      </View>
    </View>
  )
}

// ─── Stiller ─────────────────────────────────────────────────────
function ms(t: AppTheme) {
  return StyleSheet.create({
    wrap: { marginHorizontal: 16, marginTop: 16 },

    titleRow: {
      flexDirection:  'row',
      justifyContent: 'space-between',
      alignItems:     'center',
      marginBottom:   10,
    },
    sectionTitle: { fontSize: 14, fontWeight: '700', color: t.colors.text },
    summaryGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    summaryTxt:   { fontSize: 12, color: t.colors.textHint, fontWeight: '600' },
    upPill:       {
      backgroundColor: t.colors.energyLight,
      borderRadius:    8,
      paddingHorizontal: 8,
      paddingVertical:   3,
    },
    upTxt: { fontSize: 11, fontWeight: '700', color: t.colors.energyGreen },

    card: {
      backgroundColor: t.colors.sportCard,
      borderRadius:    18,
      shadowColor:     '#000',
      shadowOffset:    { width: 0, height: 2 },
      shadowOpacity:   0.08,
      shadowRadius:    8,
      elevation:       3,
      paddingVertical: 12,
    },
    strip: {
      paddingHorizontal: 12,
      gap:               4,
      alignItems:        'flex-end',
    },
  })
}
