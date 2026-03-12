/**
 * DailyMissionCard — v4 Modern Design
 * Beyaz kart · Teal ring · Mavi action butonu
 * SVG circular progress ring · XP badge · Animated burst
 */
import React, { useEffect, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'
import { useHomeStore } from '../../../stores/homeStore'

const BLUE   = '#2D5BE3'
const TEAL   = '#40C8F0'   // İş Bankası accent blue
const CARD   = '#FFFFFF'
const BORDER = '#E2E8F8'
const TEXT   = '#1A1A2E'
const TEXT_S = '#6B7A99'
const TEXT_H = '#8892A4'
const SOFT   = '#F0F4FF'

const RING_SIZE   = 84
const RING_RADIUS = 33
const RING_STROKE = 7
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

// ─── Progress Ring ────────────────────────────────────────────────
function ProgressRing({ progress, pct }: { progress: number; pct: number }) {
  const animOffset = useRef(new Animated.Value(CIRCUMFERENCE)).current

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
        <Circle
          cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_RADIUS}
          stroke="#E8E8E8" strokeWidth={RING_STROKE} fill="none"
        />
        <AnimatedCircle
          cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_RADIUS}
          stroke={TEAL} strokeWidth={RING_STROKE} fill="none"
          strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
          strokeDashoffset={animOffset}
          strokeLinecap="round"
          transform={`rotate(-90, ${RING_SIZE / 2}, ${RING_SIZE / 2})`}
        />
      </Svg>
      <Text style={{ fontSize: 18, fontWeight: '900', color: TEXT }}>{pct}%</Text>
    </View>
  )
}

// ─── Bileşen ─────────────────────────────────────────────────────
export function DailyMissionCard() {
  const router = useRouter()
  const { dailyMission } = useHomeStore()
  const { title, current, target, xpReward, levelTag, timeMinutes } = dailyMission

  const progress = Math.min(1, current / Math.max(1, target))
  const pct      = Math.round(progress * 100)
  const isDone   = progress >= 1

  const burstScale = useRef(new Animated.Value(1)).current
  useEffect(() => {
    if (isDone) {
      Animated.sequence([
        Animated.timing(burstScale,  { toValue: 1.04, duration: 140, useNativeDriver: true }),
        Animated.spring(burstScale,  { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 10 }),
      ]).start()
    }
  }, [isDone])

  const handleAction = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    router.push('/(tabs)/sessions' as any)
  }

  return (
    <Animated.View style={[s.card, { transform: [{ scale: burstScale }] }]}>
      <View style={s.header}>
        <Text style={s.cardTitle}>🎯 Bugünkü Görev</Text>
        <View style={s.levelTag}>
          <Text style={s.levelTxt}>{levelTag}</Text>
        </View>
      </View>

      <View style={s.body}>
        <ProgressRing progress={progress} pct={pct} />
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
const s = StyleSheet.create({
  card: {
    backgroundColor: CARD,
    marginHorizontal: 16, marginTop: 12,
    borderRadius: 18, padding: 18,
    borderWidth: 1, borderColor: BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 14,
  },
  cardTitle: { fontSize: 13, fontWeight: '700', color: TEXT },
  levelTag: {
    backgroundColor: 'rgba(0,212,170,0.12)',
    borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4,
  },
  levelTxt: { fontSize: 11, fontWeight: '800', color: TEAL },

  body: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },

  info:         { flex: 1 },
  missionTitle: { fontSize: 14, fontWeight: '700', color: TEXT, lineHeight: 20, marginBottom: 8 },
  metaRow:      { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  metaTxt:      { fontSize: 12, color: TEXT_S, fontWeight: '600' },
  badgeRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  xpPill:       { backgroundColor: '#E8F0FE', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  xpTxt:        { fontSize: 11, fontWeight: '700', color: '#92400E' },
  fraction:     { fontSize: 12, color: TEXT_S, fontWeight: '600' },

  actionBtn: {
    backgroundColor: BLUE, borderRadius: 12,
    paddingVertical: 12, alignItems: 'center',
  },
  actionBtnDone: { backgroundColor: SOFT },
  actionTxt:     { fontSize: 14, fontWeight: '700', color: '#fff' },
  actionTxtDone: { color: TEXT_H },
})
