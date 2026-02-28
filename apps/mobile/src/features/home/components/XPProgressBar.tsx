/**
 * XPProgressBar — Sport Premium Edition
 * Seviye · XP ilerleme · withTiming fill · Level-up glow · Floating +XP
 */
import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react'
import { View, Text, Animated, StyleSheet } from 'react-native'
import RAnimated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  interpolate,
} from 'react-native-reanimated'
import { useAuthStore } from '../../../stores/authStore'
import { useAppTheme } from '../../../theme/useAppTheme'
import type { AppTheme } from '../../../theme'
import { EventBus } from '../../rewards/EventBus'

// ─── Sabitler ─────────────────────────────────────────────────────
const LEVEL_XP = 500

const LEVEL_HINTS = [
  '+5% okuma hızı',
  '+10% XP bonusu',
  '+15% kavrama',
  '+20% odak süresi',
  '+25% hız patlaması',
  '+30% analiz gücü',
]

function getLevelHint(level: number): string {
  return LEVEL_HINTS[level % LEVEL_HINTS.length]
}

// ─── Bileşen ─────────────────────────────────────────────────────
export function XPProgressBar() {
  const t = useAppTheme()
  const s = useMemo(() => ms(t), [t])
  const { student } = useAuthStore()

  const totalXp   = student?.totalXp ?? 0
  const level     = Math.floor(totalXp / LEVEL_XP)
  const xpInLevel = totalXp % LEVEL_XP
  const progress  = xpInLevel / LEVEL_XP
  const hint      = getLevelHint(level)

  // ── RN Animated bar (% width) ───────────────────────────────────
  const barAnim    = useRef(new Animated.Value(0)).current
  const prevLevelRef = useRef(level)

  // ── Reanimated glow (level-up のみ) ────────────────────────────
  const glowSV = useSharedValue(0)

  useEffect(() => {
    Animated.timing(barAnim, {
      toValue:         progress,
      duration:        800,
      useNativeDriver: false,
    }).start()

    if (level > prevLevelRef.current) {
      prevLevelRef.current = level
      glowSV.value = withSequence(
        withSpring(1,  { damping: 6, stiffness: 200 }),
        withTiming(0,  { duration: 1200 }),
      )
    }
  }, [totalXp])

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: interpolate(glowSV.value, [0, 1], [0, 0.70]),
    shadowRadius:  interpolate(glowSV.value, [0, 1], [4, 18]),
    shadowColor:   t.colors.energyGreen,
    shadowOffset:  { width: 0, height: 0 },
    elevation:     interpolate(glowSV.value, [0, 1], [2, 10]),
  }))

  const barWidth = barAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: ['0%', '100%'],
  })

  // ── Floating +XP animasyonu ─────────────────────────────────────
  const [floatDelta, setFloatDelta] = useState<number | null>(null)
  const floatY  = useRef(new Animated.Value(0)).current
  const floatOp = useRef(new Animated.Value(0)).current

  const showFloat = useCallback((delta: number) => {
    setFloatDelta(delta)
    floatY.setValue(0)
    floatOp.setValue(1)
    Animated.parallel([
      Animated.timing(floatY,  { toValue: -38, duration: 700, useNativeDriver: true }),
      Animated.timing(floatOp, { toValue: 0,   duration: 700, useNativeDriver: true }),
    ]).start(() => setFloatDelta(null))
  }, [floatY, floatOp])

  useEffect(() => {
    const handler = ({ delta }: { delta: number; total: number }) => {
      if (delta > 0) showFloat(delta)
    }
    EventBus.on('XP_UPDATED', handler)
    return () => EventBus.off('XP_UPDATED', handler)
  }, [showFloat])

  return (
    <RAnimated.View style={[s.card, glowStyle]}>
      {/* Floating +XP */}
      {floatDelta !== null && (
        <Animated.View
          style={[
            s.floatXP,
            { transform: [{ translateY: floatY }], opacity: floatOp },
          ]}
          pointerEvents="none"
        >
          <Text style={s.floatTxt}>+{floatDelta} XP ⭐</Text>
        </Animated.View>
      )}

      {/* Üst satır */}
      <View style={s.topRow}>
        <View style={s.levelBadge}>
          <Text style={s.levelTxt}>Lv.{level}</Text>
        </View>
        <Text style={s.xpFraction}>
          {xpInLevel.toLocaleString('tr')} / {LEVEL_XP} XP
        </Text>
        <Text style={s.hintTxt} numberOfLines={1}>Sonraki: {hint}</Text>
      </View>

      {/* Progress bar */}
      <View style={s.barBg}>
        <Animated.View style={[s.barFill, { width: barWidth }]} />
      </View>
    </RAnimated.View>
  )
}

// ─── Stiller ─────────────────────────────────────────────────────
function ms(t: AppTheme) {
  return StyleSheet.create({
    card: {
      backgroundColor:  t.colors.sportCard,
      marginHorizontal: 16,
      marginTop:        12,
      borderRadius:     16,
      padding:          14,
      shadowColor:      '#000',
      shadowOffset:     { width: 0, height: 2 },
      shadowOpacity:    0.06,
      shadowRadius:     6,
      elevation:        2,
      overflow:         'visible',
    },

    // Floating
    floatXP: {
      position: 'absolute',
      top:      0,
      right:    16,
      zIndex:   999,
    },
    floatTxt: {
      fontSize:   13,
      fontWeight: '800',
      color:      t.colors.energyGreen,
    },

    // Üst satır
    topRow: {
      flexDirection:  'row',
      alignItems:     'center',
      gap:            8,
      marginBottom:   10,
      flexWrap:       'wrap',
    },
    levelBadge: {
      backgroundColor:   t.colors.deepGreen,
      borderRadius:      8,
      paddingHorizontal: 10,
      paddingVertical:   4,
    },
    levelTxt: { fontSize: 12, fontWeight: '800', color: '#FFFFFF' },
    xpFraction: {
      fontSize:   13,
      fontWeight: '700',
      color:      t.colors.text,
    },
    hintTxt: {
      fontSize:  11,
      color:     t.colors.textHint,
      flex:      1,
      textAlign: 'right',
    },

    // Bar
    barBg: {
      height:          8,
      backgroundColor: t.colors.sportSoft,
      borderRadius:    4,
      overflow:        'hidden',
    },
    barFill: {
      height:          8,
      backgroundColor: t.colors.energyGreen,
      borderRadius:    4,
    },
  })
}
