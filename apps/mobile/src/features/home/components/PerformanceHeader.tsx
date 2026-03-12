/**
 * PerformanceHeader — Sport Premium Edition
 * Reanimated withSpring WPM · Delta glow · Focus/Eye chips · 7 mini bars
 */
import React, { useEffect, useMemo, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  runOnJS,
  interpolate,
} from 'react-native-reanimated'
import { useHomeStore } from '../../../stores/homeStore'
import { useAppTheme } from '../../../theme/useAppTheme'
import type { AppTheme } from '../../../theme'

// ─── Spring Count-Up ─────────────────────────────────────────────
function useSpringCountUp(target: number): number {
  const sv      = useSharedValue(0)
  const [val, setVal] = useState(0)

  useEffect(() => {
    sv.value = withSpring(target, { damping: 12, stiffness: 120, mass: 0.8 })
  }, [target])

  useAnimatedReaction(
    () => Math.round(sv.value),
    (cur) => runOnJS(setVal)(cur),
  )
  return val
}

// ─── Bileşen ─────────────────────────────────────────────────────
export function PerformanceHeader() {
  const t = useAppTheme()
  const s = useMemo(() => ms(t), [t])

  const { currentWPM, deltaPercent, focusScore, eyeStability, lastSessionWPMs } = useHomeStore()
  const wpmDisplay  = useSpringCountUp(currentWPM)
  const focusDisplay = useSpringCountUp(focusScore)
  const eyeDisplay   = useSpringCountUp(eyeStability)

  const isPositive = deltaPercent >= 0

  // Delta glow pulse (Reanimated)
  const glow = useSharedValue(0)
  useEffect(() => {
    if (isPositive) {
      glow.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 350 }),
          withTiming(0, { duration: 350 }),
        ),
        -1,
        false,
      )
    } else {
      glow.value = withTiming(0, { duration: 200 })
    }
  }, [isPositive])

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: interpolate(glow.value, [0, 1], [0, 0.45]),
    shadowRadius:  interpolate(glow.value, [0, 1], [0, 10]),
    shadowColor:   '#1877F2',
    shadowOffset:  { width: 0, height: 0 },
    elevation:     interpolate(glow.value, [0, 1], [0, 6]),
  }))

  // Bar heights for last 7 sessions
  const maxWPM = Math.max(...lastSessionWPMs, 1)

  return (
    <View style={s.card}>
      <Text style={s.cardLabel}>PERFORMANS</Text>

      {/* WPM + chips row */}
      <View style={s.topRow}>
        {/* WPM Block */}
        <View style={s.wpmBlock}>
          <Text style={s.wpmNumber}>{wpmDisplay}</Text>
          <Text style={s.wpmUnit}>WPM</Text>
        </View>

        {/* Delta Chip */}
        <Animated.View style={[
          s.deltaPill,
          isPositive ? s.pillPos : s.pillNeg,
          isPositive && glowStyle,
        ]}>
          <Text style={[s.deltaTxt, isPositive ? s.deltaPos : s.deltaNeg]}>
            {isPositive ? '↑' : '↓'} %{Math.abs(deltaPercent)}
          </Text>
        </Animated.View>

        <View style={s.chipGroup}>
          {/* Focus Chip */}
          <View style={s.chip}>
            <Text style={s.chipLabel}>Odak</Text>
            <Text style={s.chipValue}>{focusDisplay}</Text>
          </View>
          {/* Eye Chip */}
          <View style={s.chip}>
            <Text style={s.chipLabel}>Göz</Text>
            <Text style={s.chipValue}>{eyeDisplay}%</Text>
          </View>
        </View>
      </View>

      {/* 7 mini session bars */}
      <View style={s.barsRow}>
        <Text style={s.barsLabel}>Son 7 Oturum</Text>
        <View style={s.bars}>
          {lastSessionWPMs.map((wpm, i) => {
            const h = Math.max(4, (wpm / maxWPM) * 28)
            const isLast = i === lastSessionWPMs.length - 1
            return (
              <View key={i} style={[s.barWrap, { height: 28 }]}>
                <View style={[
                  s.bar,
                  { height: h, backgroundColor: isLast ? t.colors.energyGreen : t.colors.sportSoft },
                ]} />
              </View>
            )
          })}
        </View>
        <Text style={s.wpmTrend}>{currentWPM} WPM</Text>
      </View>
    </View>
  )
}

// ─── Stiller ─────────────────────────────────────────────────────
function ms(t: AppTheme) {
  return StyleSheet.create({
    card: {
      backgroundColor:  t.colors.sportCard,
      marginHorizontal: 16,
      marginTop:        16,
      borderRadius:     18,
      padding:          18,
      shadowColor:      '#000',
      shadowOffset:     { width: 0, height: 2 },
      shadowOpacity:    0.08,
      shadowRadius:     8,
      elevation:        3,
    },
    cardLabel: {
      fontSize:      10,
      fontWeight:    '700',
      letterSpacing: 1.6,
      color:         t.colors.textHint,
      marginBottom:  10,
    },

    topRow: {
      flexDirection: 'row',
      alignItems:    'center',
      gap:           12,
      marginBottom:  16,
      flexWrap:      'wrap',
    },

    wpmBlock: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
    wpmNumber: {
      fontSize:   40,
      fontWeight: '900',
      color:      t.colors.deepGreen,
      lineHeight: 44,
    },
    wpmUnit: {
      fontSize:     13,
      fontWeight:   '700',
      color:        t.colors.textSub,
      marginBottom: 5,
    },

    deltaPill: {
      borderRadius:      10,
      paddingHorizontal: 10,
      paddingVertical:   5,
    },
    pillPos:  { backgroundColor: t.colors.energyLight },
    pillNeg:  { backgroundColor: 'rgba(239,68,68,0.12)' },
    deltaTxt: { fontSize: 13, fontWeight: '800' },
    deltaPos: { color: t.colors.energyGreen },
    deltaNeg: { color: '#EF4444' },

    chipGroup: { flexDirection: 'row', gap: 8, marginLeft: 'auto' },
    chip: {
      backgroundColor: t.colors.sportSoft,
      borderRadius:    10,
      paddingHorizontal: 10,
      paddingVertical:   7,
      alignItems:      'center',
      minWidth:        52,
    },
    chipLabel: { fontSize: 10, color: t.colors.textHint, fontWeight: '600', marginBottom: 2 },
    chipValue: { fontSize: 15, fontWeight: '800', color: t.colors.deepGreen },

    barsRow: {
      flexDirection: 'row',
      alignItems:    'flex-end',
      gap:           8,
    },
    barsLabel: { fontSize: 10, color: t.colors.textHint, fontWeight: '600', marginBottom: 2 },
    bars:      { flexDirection: 'row', alignItems: 'flex-end', gap: 4, flex: 1 },
    barWrap:   { flex: 1, justifyContent: 'flex-end' },
    bar:       { borderRadius: 3 },
    wpmTrend:  { fontSize: 11, fontWeight: '700', color: t.colors.energyGreen, marginBottom: 2 },
  })
}
