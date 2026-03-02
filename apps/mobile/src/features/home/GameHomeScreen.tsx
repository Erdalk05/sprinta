/**
 * Sprinta Ana Sayfa — v3 Cognitive Performance Game Engine
 * Hero · PerformanceHeader · XPProgressBar · DailyMission · BrainPowerMap
 * DailyLeaderboard · WeeklyMomentum · AICoach · Rozetler
 */
import React, { useEffect, useRef, useMemo, useState } from 'react'
import {
  View, Text, TouchableOpacity, ScrollView, FlatList,
  SafeAreaView, Animated, StyleSheet,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../stores/authStore'
import { useGamificationStore } from '../../stores/gamificationStore'
import { useThemeToggle, useAppTheme } from '../../theme/useAppTheme'
import type { AppTheme } from '../../theme'
import { calculateExamProgress } from '@sprinta/shared'
import { EventBus } from '../rewards/EventBus'
import { getBadgeById } from '../rewards/RewardEngine'
import { PerformanceHeader } from './components/PerformanceHeader'
import { selectMotivation } from '../../utils/motivation'
import { XPProgressBar } from './components/XPProgressBar'
import { DailyMissionCard } from './components/DailyMissionCard'
import { BrainPowerMap } from './components/BrainPowerMap'
import { DailyLeaderboard } from './components/DailyLeaderboard'
import { WeeklyMomentumStrip } from './components/WeeklyMomentumStrip'
import { AICoachCard } from './components/AICoachCard'

// ─── CountUp animasyon ────────────────────────────────────────────

function useCountUp(target: number, duration = 1000): number {
  const anim = useRef(new Animated.Value(0)).current
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    anim.setValue(0)
    const listener = anim.addListener(({ value }) => setDisplay(Math.round(value)))
    Animated.timing(anim, { toValue: target, duration, useNativeDriver: false }).start(() => {
      anim.removeListener(listener)
    })
    return () => anim.removeAllListeners()
  }, [target])

  return display
}

// ─── BadgeToast ───────────────────────────────────────────────────

function BadgeToast({ badgeId, onHide }: { badgeId: string; onHide: () => void }) {
  const t = useAppTheme()
  const badge  = getBadgeById(badgeId)
  const slideY = useRef(new Animated.Value(-80)).current
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideY, { toValue: 0, useNativeDriver: true, speed: 18, bounciness: 8 }),
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start()
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(slideY, { toValue: -80, duration: 300, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0,  duration: 300, useNativeDriver: true }),
      ]).start(onHide)
    }, 2500)
    return () => clearTimeout(timer)
  }, [])

  if (!badge) return null
  return (
    <Animated.View style={[{
      position: 'absolute', top: 12, left: 16, right: 16, zIndex: 999,
      backgroundColor: t.colors.panel, borderRadius: 14,
      flexDirection: 'row', alignItems: 'center', gap: 10,
      paddingHorizontal: 16, paddingVertical: 12,
      transform: [{ translateY: slideY }], opacity,
      ...t.shadows.md,
    }]}>
      <Text style={{ fontSize: 20 }}>{badge.emoji}</Text>
      <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff', flex: 1 }}>
        {badge.title} rozeti kazandın!
      </Text>
    </Animated.View>
  )
}

// ─── GlassStat ────────────────────────────────────────────────────

function GlassStat({ emoji, value, label }: { emoji: string; value: string | number; label: string }) {
  return (
    <View style={{
      flex: 1,
      backgroundColor: 'rgba(255,255,255,0.15)',
      borderRadius: 14,
      padding: 10,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.25)',
    }}>
      <Text style={{ fontSize: 18 }}>{emoji}</Text>
      <Text style={{ fontSize: 16, fontWeight: '800', color: '#fff', marginTop: 2 }}>{value}</Text>
      <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>{label}</Text>
    </View>
  )
}

// ─── Ana Ekran ────────────────────────────────────────────────────

export default function GameHomeScreen() {
  const t = useAppTheme()
  const s = useMemo(() => ms(t), [t])
  const router = useRouter()
  const { isDark, toggleTheme } = useThemeToggle()
  const { student } = useAuthStore()
  const { earnedBadges } = useGamificationStore()
  const [badgeToast, setBadgeToast] = useState<string | null>(null)

  const name       = student?.fullName?.split(' ')[0] ?? 'Öğrenci'
  const currentArp = student?.currentArp  ?? 0
  const examTarget = (student?.examTarget ?? 'tyt').toUpperCase()
  const totalXp    = student?.totalXp    ?? 0
  const streakDays = student?.streakDays ?? 0

  const lastWpm    = null // future: fetch from store
  const motivation = useMemo(
    () => selectMotivation(name, streakDays, totalXp, lastWpm),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [name, streakDays, totalXp],
  )
  const greeting = motivation.greeting

  const examProg   = calculateExamProgress(currentArp, examTarget.toLowerCase())
  const arpDisplay = useCountUp(currentArp, 1200)
  const badgeCount = earnedBadges.length

  // EventBus badge toast
  useEffect(() => {
    const handler = ({ badgeId }: { badgeId: string }) => setBadgeToast(badgeId)
    EventBus.on('BADGE_UNLOCKED', handler)
    return () => EventBus.off('BADGE_UNLOCKED', handler)
  }, [])

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    router.push('/exercise/speed_control' as any)
  }

  return (
    <SafeAreaView style={s.root}>
      {badgeToast && (
        <BadgeToast badgeId={badgeToast} onHide={() => setBadgeToast(null)} />
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ══════════════════ BÖLÜM 1 — Hero ══════════════════════ */}
        <View style={s.hero}>
          {/* Üst satır: selam + tema toggle */}
          <View style={s.heroTop}>
            <View>
              <Text style={s.heroGreeting}>{motivation.icon} {greeting}</Text>
              <Text style={s.heroName}>{name}</Text>
            </View>
            <TouchableOpacity onPress={toggleTheme} style={s.themeBtn}>
              <Text style={{ fontSize: 22 }}>{isDark ? '☀️' : '🌙'}</Text>
            </TouchableOpacity>
          </View>

          {/* Motivasyon mesajı */}
          <View style={s.motivCard}>
            <Text style={s.motivTxt} numberOfLines={3}>{motivation.message}</Text>
          </View>

          {/* ARP büyük sayı — count-up */}
          <View style={s.arpBlock}>
            <Text style={s.arpLabel}>ARP SKORUM</Text>
            <Text style={s.arpValue}>{arpDisplay}</Text>
            {examProg.progressPercent > 0 && (
              <Text style={s.arpTrend}>
                {'↑ '}
                {examTarget} hedefine %{Math.round(examProg.progressPercent)} ulaştın
              </Text>
            )}
          </View>

          {/* 3 mini glassmorphism stat */}
          <View style={s.glassRow}>
            <GlassStat emoji="🔥" value={streakDays} label="gün seri" />
            <GlassStat emoji="⚡" value={totalXp.toLocaleString('tr')} label="XP" />
            <GlassStat emoji="🏆" value={badgeCount} label="rozet" />
          </View>

          {/* HIZLI BAŞLA */}
          <TouchableOpacity onPress={handleStart} activeOpacity={0.9} style={s.startBtn}>
            <Text style={s.startIcon}>⚡</Text>
            <Text style={s.startTxt}>HIZLI BAŞLA</Text>
          </TouchableOpacity>
        </View>

        {/* ══════════════════ BÖLÜM 2 — Performans Metrikleri ═════ */}
        <PerformanceHeader />

        {/* ══════════════════ BÖLÜM 3 — XP İlerleme ══════════════ */}
        <XPProgressBar />

        {/* ══════════════════ BÖLÜM 4 — Günlük Görev ═════════════ */}
        <DailyMissionCard />

        {/* ══════════════════ BÖLÜM 5 — Bilişsel Güç Haritası ════ */}
        <BrainPowerMap />

        {/* ══════════════════ BÖLÜM 6 — Günlük Sıralama ══════════ */}
        <DailyLeaderboard />

        {/* ══════════════════ BÖLÜM 7 — Haftalık Momentum ════════ */}
        <WeeklyMomentumStrip />

        {/* ══════════════════ BÖLÜM 8 — AI Koç ═══════════════════ */}
        <AICoachCard />

        {/* ══════════════════ BÖLÜM 9 — Rozetler ══════════════════ */}
        {earnedBadges.length > 0 && (
          <>
            <View style={s.badgeHeader}>
              <Text style={s.sectionTitle}>Son Kazanılan Rozetler</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/progress' as any)}>
                <Text style={[s.sectionLink, { color: t.colors.primary }]}>Tümü →</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              horizontal
              data={earnedBadges.slice(0, 8)}
              keyExtractor={(b) => b.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.badgeList}
              renderItem={({ item }) => (
                <View style={s.badgeItem}>
                  <View style={[s.badgeCircle, { backgroundColor: item.color + '20' }]}>
                    <Text style={{ fontSize: 24 }}>{item.iconName}</Text>
                  </View>
                  <Text style={s.badgeName} numberOfLines={1}>{item.name}</Text>
                </View>
              )}
            />
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

// ─── Stiller ─────────────────────────────────────────────────────

function ms(t: AppTheme) {
  return StyleSheet.create({
    root:   { flex: 1, backgroundColor: t.colors.background },
    scroll: { paddingBottom: 24 },

    // Hero — WhatsApp solid header
    hero: {
      backgroundColor: t.colors.headerBg,
      paddingTop: 16, paddingBottom: 22,
      paddingHorizontal: 20,
      gap: 16,
    },
    heroTop: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    },
    heroGreeting: { fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },
    heroName:     { fontSize: 20, fontWeight: '700', color: '#fff', marginTop: 2 },
    themeBtn:     { padding: 6 },

    // Motivasyon kartı
    motivCard: {
      backgroundColor: 'rgba(255,255,255,0.10)',
      borderRadius:    12,
      paddingHorizontal: 14,
      paddingVertical:   10,
      borderLeftWidth:   3,
      borderLeftColor:   'rgba(255,255,255,0.50)',
    },
    motivTxt: {
      fontSize:   13,
      color:      'rgba(255,255,255,0.92)',
      fontWeight: '500',
      lineHeight: 19,
    },

    arpBlock:  { alignItems: 'center', paddingVertical: 4 },
    arpLabel:  { fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: '700', letterSpacing: 2 },
    arpValue:  { fontSize: 64, fontWeight: '900', color: '#fff', lineHeight: 72, marginTop: 4 },
    arpTrend:  { fontSize: 12, color: 'rgba(255,255,255,0.80)', marginTop: 4, fontWeight: '600' },

    glassRow:  { flexDirection: 'row', gap: 10 },

    // Başla butonu — beyaz kenarlıklı
    startBtn:  {
      borderRadius: 14, height: 52,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: 8,
      backgroundColor: 'rgba(255,255,255,0.15)',
      borderWidth: 1.5,
      borderColor: 'rgba(255,255,255,0.50)',
    },
    startIcon: { fontSize: 20 },
    startTxt:  { fontSize: 16, fontWeight: '700', color: '#fff', letterSpacing: 0.5 },

    // Günlük hedef — flat beyaz kart
    goalCard: {
      backgroundColor: t.colors.surface,
      marginHorizontal: 16, marginTop: 16,
      borderRadius: 16, padding: 16,
      borderWidth: 1, borderColor: t.colors.border,
    },
    goalTop:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    goalTitle: { fontSize: 15, fontWeight: '700', color: t.colors.text },
    goalBadge: { backgroundColor: t.colors.greenLight, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
    goalBadgeTxt: { fontSize: 12, fontWeight: '800', color: '#25D366' },
    goalBar:   { height: 5, backgroundColor: t.colors.border, borderRadius: 3, overflow: 'hidden', marginBottom: 10 },
    goalBarFill: { height: 5, backgroundColor: '#25D366', borderRadius: 3 },
    goalBottom:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    goalPct:   { fontSize: 12, color: t.colors.textSub },
    goalDone:  { fontSize: 12, color: '#25D366', fontWeight: '700' },
    goalBtn:   { borderWidth: 1.5, borderColor: '#25D366', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
    goalBtnTxt:{ fontSize: 12, fontWeight: '700', color: '#25D366' },

    // Haftalık
    sectionTitle: { fontSize: 14, fontWeight: '700', color: t.colors.text, marginHorizontal: 16, marginTop: 20, marginBottom: 10 },
    sectionLink:  { fontSize: 13, fontWeight: '600', marginTop: 20, marginRight: 16 },
    weekRow:   { flexDirection: 'row', gap: 10, marginHorizontal: 16 },
    weekCard:  {
      flex: 1, backgroundColor: t.colors.surface,
      borderRadius: 14, padding: 14, alignItems: 'center',
      borderWidth: 1, borderColor: t.colors.border,
    },
    weekValue: { fontSize: 20, fontWeight: '700', color: t.colors.text, marginBottom: 2 },
    weekUnit:  { fontSize: 10, color: t.colors.textHint },

    // Son seans — flat beyaz kart, yeşil aksan
    lastCard: {
      backgroundColor: t.colors.surface,
      marginHorizontal: 16, marginTop: 16,
      borderRadius: 16, padding: 16,
      borderWidth: 1, borderColor: t.colors.border,
    },
    lastTitle: { fontSize: 15, fontWeight: '700', color: t.colors.text, marginBottom: 4 },
    lastMeta:  { fontSize: 12, color: t.colors.textSub, marginBottom: 14 },
    lastBtn:   { borderWidth: 1.5, borderColor: '#25D366', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 7, alignSelf: 'flex-end' },
    lastBtnTxt:{ fontSize: 13, fontWeight: '700', color: '#25D366' },

    // Rozetler
    badgeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    badgeList:   { paddingHorizontal: 16, paddingBottom: 4, gap: 12 },
    badgeItem:   { alignItems: 'center', width: 68 },
    badgeCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
    badgeName:   { fontSize: 10, color: t.colors.textHint, textAlign: 'center' },
  })
}
