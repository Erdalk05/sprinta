/**
 * DailyMissionCard — Sport Premium Edition
 * SVG circular progress ring · XP badge · Difficulty tag · Animated burst
 */
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'
import { useHomeStore } from '../../../stores/homeStore'
import { useAppTheme } from '../../../theme/useAppTheme'
import type { AppTheme } from '../../../theme'

// ─── Sabitler ────────────────────────────────────────────────────
const RING_SIZE   = 84
const RING_RADIUS = 33
const RING_STROKE = 7
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

// react-native-svg Circle wrapped with RN Animated
const AnimatedCircle = Animated.createAnimatedComponent(Circle)

// ─── Progress Ring ────────────────────────────────────────────────
function ProgressRing({
  progress,
  pct,
  energyGreen,
}: {
  progress: number
  pct:      number
  energyGreen: string
}) {
  const animOffset = useRef(
    new Animated.Value(CIRCUMFERENCE)
  ).current

  useEffect(() => {
    Animated.timing(animOffset, {
      toValue:         CIRCUMFERENCE * (1 - Math.min(1, progress)),
      duration:        600,
      useNativeDriver: false,
    }).start()
  }, [progress])

  return (
    <View style={{ width: RING_SIZE, height: RING_SIZE, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={RING_SIZE} height={RING_SIZE} style={{ position: 'absolute' }}>
        {/* Track */}
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          stroke="#E8E8E8"
          strokeWidth={RING_STROKE}
          fill="none"
        />
        {/* Progress arc */}
        <AnimatedCircle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          stroke={energyGreen}
          strokeWidth={RING_STROKE}
          fill="none"
          strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
          strokeDashoffset={animOffset}
          strokeLinecap="round"
          transform={`rotate(-90, ${RING_SIZE / 2}, ${RING_SIZE / 2})`}
        />
      </Svg>
      {/* Center text */}
      <Text style={{ fontSize: 18, fontWeight: '900', color: '#0F3D2E' }}>{pct}%</Text>
    </View>
  )
}

// ─── Bileşen ─────────────────────────────────────────────────────
export function DailyMissionCard() {
  const t      = useAppTheme()
  const s      = useMemo(() => ms(t), [t])
  const router = useRouter()
  const { dailyMission } = useHomeStore()
  const { title, current, target, xpReward, levelTag, timeMinutes } = dailyMission

  const progress = Math.min(1, current / Math.max(1, target))
  const pct      = Math.round(progress * 100)
  const isDone   = progress >= 1

  // Burst scale on completion
  const burstScale = useRef(new Animated.Value(1)).current
  useEffect(() => {
    if (isDone) {
      Animated.sequence([
        Animated.timing(burstScale, { toValue: 1.04, duration: 140, useNativeDriver: true }),
        Animated.spring(burstScale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 10 }),
      ]).start()
    }
  }, [isDone])

  const handleAction = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    router.push('/(tabs)/sessions' as any)
  }

  return (
    <Animated.View style={[s.card, { transform: [{ scale: burstScale }] }]}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.cardTitle}>🎯 Bugünkü Görev</Text>
        <View style={s.levelTag}>
          <Text style={s.levelTxt}>{levelTag}</Text>
        </View>
      </View>

      {/* Body: ring + info */}
      <View style={s.body}>
        <ProgressRing progress={progress} pct={pct} energyGreen={t.colors.energyGreen} />

        <View style={s.info}>
          <Text style={s.missionTitle} numberOfLines={2}>{title}</Text>

          <View style={s.metaRow}>
            <Text style={s.metaTxt}>⏱ {timeMinutes} dk</Text>
          </View>

          <View style={s.badgeRow}>
            <View style={s.xpPill}>
              <Text style={s.xpTxt}>+{xpReward} XP ⭐</Text>
            </View>
            <Text style={s.fraction}>{current}/{target}</Text>
          </View>
        </View>
      </View>

      {/* Action */}
      <TouchableOpacity
        style={[s.actionBtn, isDone && s.actionBtnDone]}
        onPress={handleAction}
        activeOpacity={0.8}
        disabled={isDone}
      >
        <Text style={[s.actionTxt, isDone && s.actionTxtDone]}>
          {isDone ? '✅ Tamamlandı' : 'Devam Et →'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

// ─── Stiller ─────────────────────────────────────────────────────
function ms(t: AppTheme) {
  return StyleSheet.create({
    card: {
      backgroundColor:  t.colors.sportCard,
      marginHorizontal: 16,
      marginTop:        12,
      borderRadius:     18,
      padding:          18,
      shadowColor:      '#000',
      shadowOffset:     { width: 0, height: 2 },
      shadowOpacity:    0.08,
      shadowRadius:     8,
      elevation:        3,
    },

    header: {
      flexDirection:  'row',
      justifyContent: 'space-between',
      alignItems:     'center',
      marginBottom:   14,
    },
    cardTitle:  { fontSize: 13, fontWeight: '700', color: t.colors.text },
    levelTag:   {
      backgroundColor: t.colors.energyLight,
      borderRadius:    8,
      paddingHorizontal: 9,
      paddingVertical:   4,
    },
    levelTxt: { fontSize: 11, fontWeight: '800', color: t.colors.energyGreen },

    body: {
      flexDirection: 'row',
      alignItems:    'center',
      gap:           16,
      marginBottom:  16,
    },

    info:       { flex: 1 },
    missionTitle: {
      fontSize:     14,
      fontWeight:   '700',
      color:        t.colors.text,
      lineHeight:   20,
      marginBottom: 8,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems:    'center',
      marginBottom:  8,
    },
    metaTxt: { fontSize: 12, color: t.colors.textSub, fontWeight: '600' },
    badgeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    xpPill:   { backgroundColor: '#FEF3C7', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
    xpTxt:    { fontSize: 11, fontWeight: '700', color: '#92400E' },
    fraction: { fontSize: 12, color: t.colors.textSub, fontWeight: '600' },

    actionBtn: {
      backgroundColor: t.colors.deepGreen,
      borderRadius:    12,
      paddingVertical: 12,
      alignItems:      'center',
    },
    actionBtnDone: { backgroundColor: t.colors.sportSoft },
    actionTxt:     { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
    actionTxtDone: { color: t.colors.textHint },
  })
}
