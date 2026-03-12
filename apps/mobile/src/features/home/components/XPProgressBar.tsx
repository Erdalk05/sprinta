/**
 * XPProgressBar — v4 Modern Design
 * Koyu lacivert kart · Teal ilerleme çubuğu · Mavi seviye rozeti
 * Level-up glow · Floating +XP animasyonu
 */
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { View, Text, Animated, StyleSheet } from 'react-native'
import RAnimated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withTiming, withSequence, interpolate,
} from 'react-native-reanimated'
import { useAuthStore } from '../../../stores/authStore'
import { EventBus } from '../../rewards/EventBus'

const NAVY   = '#0D1B3E'
const BLUE   = '#2D5BE3'
const TEAL   = '#40C8F0'   // İş Bankası accent blue
const TEXT_L = '#FFFFFF'
const TEXT_LS= 'rgba(255,255,255,0.60)'

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

export function XPProgressBar() {
  const { student } = useAuthStore()

  const totalXp   = student?.totalXp ?? 0
  const level     = Math.floor(totalXp / LEVEL_XP)
  const xpInLevel = totalXp % LEVEL_XP
  const progress  = xpInLevel / LEVEL_XP
  const hint      = getLevelHint(level)

  // RN Animated bar fill
  const barAnim      = useRef(new Animated.Value(0)).current
  const prevLevelRef = useRef(level)

  // Reanimated level-up glow
  const glowSV = useSharedValue(0)

  useEffect(() => {
    Animated.timing(barAnim, {
      toValue: progress, duration: 800, useNativeDriver: false,
    }).start()
    if (level > prevLevelRef.current) {
      prevLevelRef.current = level
      glowSV.value = withSequence(
        withSpring(1, { damping: 6, stiffness: 200 }),
        withTiming(0, { duration: 1200 }),
      )
    }
  }, [totalXp])

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: interpolate(glowSV.value, [0, 1], [0, 0.55]),
    shadowRadius:  interpolate(glowSV.value, [0, 1], [4, 18]),
    shadowColor:   TEAL,
    shadowOffset:  { width: 0, height: 0 },
    elevation:     interpolate(glowSV.value, [0, 1], [3, 10]),
  }))

  const barWidth = barAnim.interpolate({
    inputRange: [0, 1], outputRange: ['0%', '100%'],
  })

  // Floating +XP animasyonu
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
      {floatDelta !== null && (
        <Animated.View
          style={[s.floatXP, { transform: [{ translateY: floatY }], opacity: floatOp }]}
          pointerEvents="none"
        >
          <Text style={s.floatTxt}>+{floatDelta} XP ⭐</Text>
        </Animated.View>
      )}

      <View style={s.topRow}>
        <View style={s.levelBadge}>
          <Text style={s.levelTxt}>Lv.{level}</Text>
        </View>
        <Text style={s.xpFraction}>
          {xpInLevel.toLocaleString('tr')} / {LEVEL_XP} XP
        </Text>
        <Text style={s.hintTxt} numberOfLines={1}>→ {hint}</Text>
      </View>

      <View style={s.barBg}>
        <Animated.View style={[s.barFill, { width: barWidth }]} />
      </View>
    </RAnimated.View>
  )
}

const s = StyleSheet.create({
  card: {
    backgroundColor: NAVY,
    marginHorizontal: 16, marginTop: 12,
    borderRadius: 16, padding: 16,
    shadowColor: NAVY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8,
    elevation: 4, overflow: 'visible',
  },
  floatXP: { position: 'absolute', top: 0, right: 16, zIndex: 999 },
  floatTxt: { fontSize: 13, fontWeight: '800', color: TEAL },
  topRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 8, marginBottom: 12, flexWrap: 'wrap',
  },
  levelBadge: {
    backgroundColor: BLUE, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  levelTxt:  { fontSize: 12, fontWeight: '800', color: TEXT_L },
  xpFraction:{ fontSize: 13, fontWeight: '700', color: TEXT_L },
  hintTxt:   { fontSize: 11, color: TEXT_LS, flex: 1, textAlign: 'right' },
  barBg: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 4, overflow: 'hidden',
  },
  barFill: { height: 8, backgroundColor: TEAL, borderRadius: 4 },
})
