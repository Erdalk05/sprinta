/**
 * Sprinta Ana Sayfa — v4 Modern Design
 * Dark Navy Hero · ARP + Sparkline · Stats · CTA
 * AI Coach · XP · Mission · BrainMap · Leaderboard · Weekly
 */
import { SafeAreaView } from 'react-native-safe-area-context'
import React, { useEffect, useRef, useMemo, useState } from 'react'
import {
  View, Text, TouchableOpacity, ScrollView, FlatList,
  Animated, StyleSheet,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../stores/authStore'
import { useGamificationStore } from '../../stores/gamificationStore'
import { useThemeToggle } from '../../theme/useAppTheme'
import { useHomeStore } from '../../stores/homeStore'
import { EventBus } from '../rewards/EventBus'
import { getBadgeById } from '../rewards/RewardEngine'
import { selectMotivation } from '../../utils/motivation'
import { XPProgressBar } from './components/XPProgressBar'
import { DailyMissionCard } from './components/DailyMissionCard'
import { BrainPowerMap } from './components/BrainPowerMap'
import { DailyLeaderboard } from './components/DailyLeaderboard'
import { WeeklyMomentumStrip } from './components/WeeklyMomentumStrip'
import { AICoachCard } from './components/AICoachCard'
import { QuickStartCard } from './components/QuickStartCard'
import { DailyPlanCard } from './components/DailyPlanCard'

// ─── Renk Paleti — İş Bankası + Facebook ─────────────────────────
const NAVY = '#1A3594'   // İş Bankası royal blue
const BLUE = '#1877F2'   // Facebook primary blue
const TEAL = '#40C8F0'   // Light accent blue
const BODY = '#D9E5FF'   // İş Bankası açık mavi zemin

// ─── Sınava göre hedef ARP ────────────────────────────────────────
const EXAM_TARGET_ARP: Record<string, number> = {
  LGS:     250,
  TYT:     200,
  AYT:     320,
  YDS:     280,
  YOKDIL:  280,
  ALES:    240,
  KPSS:    220,
  General: 300,
}

function targetArpForExam(examTarget: string | undefined): number {
  return EXAM_TARGET_ARP[examTarget ?? ''] ?? 250
}

// ─── Sıralamadaki yüzdelik ────────────────────────────────────────
function topPercent(arp: number): number {
  if (arp >= 500) return 1
  if (arp >= 400) return 3
  if (arp >= 300) return 8
  if (arp >= 200) return 20
  if (arp >= 100) return 45
  return 80
}

// ─── Count-Up Animasyonu ──────────────────────────────────────────
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
  }, [target, duration])
  return display
}

// ─── BadgeToast ───────────────────────────────────────────────────
function BadgeToast({ badgeId, onHide }: { badgeId: string; onHide: () => void }) {
  const badge   = getBadgeById(badgeId)
  const slideY  = useRef(new Animated.Value(-80)).current
  const opacity = useRef(new Animated.Value(0)).current
  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideY,  { toValue: 0, useNativeDriver: true, speed: 18, bounciness: 8 }),
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start()
    const t = setTimeout(() => {
      Animated.parallel([
        Animated.timing(slideY,  { toValue: -80, duration: 300, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0,   duration: 300, useNativeDriver: true }),
      ]).start(onHide)
    }, 2500)
    return () => clearTimeout(t)
  }, [onHide])
  if (!badge) return null
  return (
    <Animated.View style={[g.toast, { transform: [{ translateY: slideY }], opacity }]}>
      <Text style={{ fontSize: 20 }}>{badge.emoji}</Text>
      <Text style={g.toastTxt}>{badge.title} rozeti kazandın!</Text>
    </Animated.View>
  )
}

// ─── GlassStat ────────────────────────────────────────────────────
function GlassStat({ emoji, value, label }: { emoji: string; value: string | number; label: string }) {
  return (
    <View style={g.glassStat}>
      <Text style={{ fontSize: 18 }}>{emoji}</Text>
      <Text style={g.glassValue}>{value}</Text>
      <Text style={g.glassLabel}>{label}</Text>
    </View>
  )
}

// ─── Sparkline (mini bar chart) ───────────────────────────────────
function Sparkline({ data }: { data: number[] }) {
  if (!data || data.length === 0) return null
  const maxVal = Math.max(...data, 1)
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 36 }}>
      {data.map((v, i) => {
        const h = Math.max(3, (v / maxVal) * 36)
        const isLast = i === data.length - 1
        return (
          <View
            key={i}
            style={{
              width: 5,
              height: h,
              borderRadius: 3,
              backgroundColor: isLast ? TEAL : 'rgba(255,255,255,0.28)',
            }}
          />
        )
      })}
    </View>
  )
}

// ─── Ana Ekran ────────────────────────────────────────────────────
export default function GameHomeScreen() {
  const router = useRouter()
  const { isDark, toggleTheme } = useThemeToggle()
  const { student } = useAuthStore()
  const { earnedBadges } = useGamificationStore()
  const { lastSessionWPMs, deltaPercent, fetchHomeData } = useHomeStore()
  const [badgeToast, setBadgeToast] = useState<string | null>(null)

  const name       = student?.fullName?.split(' ')[0] ?? 'Öğrenci'
  const currentArp = student?.currentArp  ?? 0
  const totalXp    = student?.totalXp    ?? 0
  const streakDays = student?.streakDays ?? 0
  const badgeCount = earnedBadges.length
  const arpDisplay = useCountUp(currentArp, 1200)
  const topPct     = topPercent(currentArp)
  const targetArp  = targetArpForExam(student?.examTarget)
  const arpPct     = Math.min(100, Math.round((currentArp / targetArp) * 100))

  const motivation = useMemo(
    () => selectMotivation(name, streakDays, totalXp, null),
    [name, streakDays, totalXp],
  )

  // Gerçek veri yükle
  useEffect(() => {
    if (student?.id) fetchHomeData(student.id)
  }, [student?.id])

  // EventBus rozet toast
  useEffect(() => {
    const handler = ({ badgeId }: { badgeId: string }) => setBadgeToast(badgeId)
    EventBus.on('BADGE_UNLOCKED', handler)
    return () => EventBus.off('BADGE_UNLOCKED', handler)
  }, [])

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    router.push('/exercise/daily-training' as any)
  }

  return (
    <SafeAreaView style={g.root}>
      {badgeToast && (
        <BadgeToast badgeId={badgeToast} onHide={() => setBadgeToast(null)} />
      )}

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ══════════════════ HERO — Koyu Lacivert ════════════════ */}
        <View style={g.hero}>

          {/* Üst satır: isim + butonlar */}
          <View style={g.heroTop}>
            <View style={{ flex: 1 }}>
              <Text style={g.heroName}>{name}</Text>
              <Text style={g.heroGreeting}>{motivation.icon} {motivation.greeting}</Text>
            </View>
            <View style={g.heroActions}>
              <TouchableOpacity onPress={toggleTheme} style={g.heroBtn} activeOpacity={0.7}>
                <Text style={{ fontSize: 15 }}>{isDark ? '☀️' : '🌙'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/menu' as any)}
                style={g.heroBtn}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 15 }}>⚙️</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ARP Büyük Sayı + Sparkline */}
          <View style={g.arpSection}>
            <Text style={g.arpLabel}>ARP SKORUM</Text>
            <View style={g.arpRow}>
              <Text style={g.arpValue}>{arpDisplay}</Text>
              <Sparkline data={lastSessionWPMs} />
            </View>
            <View style={g.arpBadges}>
              {deltaPercent !== 0 && (
                <View style={[
                  g.badge,
                  { backgroundColor: deltaPercent > 0 ? 'rgba(0,212,170,0.18)' : 'rgba(255,255,255,0.10)' },
                ]}>
                  <Text style={[
                    g.badgeTxt,
                    { color: deltaPercent > 0 ? TEAL : 'rgba(255,255,255,0.55)' },
                  ]}>
                    {deltaPercent > 0 ? '+' : ''}{deltaPercent}% bu hafta
                  </Text>
                </View>
              )}
              <View style={g.badge}>
                <Text style={g.badgeTxt}>🏅 Top %{topPct} Türkiye</Text>
              </View>
            </View>
          </View>

          {/* Stats: Seri · XP · Rozet */}
          <View style={g.statsRow}>
            <GlassStat emoji="🔥" value={streakDays} label="gün seri" />
            <GlassStat
              emoji="⚡"
              value={totalXp >= 1000 ? `${(totalXp / 1000).toFixed(1)}k` : totalXp}
              label="XP"
            />
            <GlassStat emoji="🏆" value={badgeCount} label="rozet" />
          </View>

          {/* CTA: Antrenmanı Başlat + Hedef */}
          <View style={g.ctaRow}>
            <TouchableOpacity style={g.ctaPrimary} onPress={handleStart} activeOpacity={0.88}>
              <Text style={g.ctaPrimaryTxt}>Antrenmanı Başlat →</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={g.ctaSecondary}
              onPress={() => router.push('/(tabs)/progress' as any)}
              activeOpacity={0.88}
            >
              <Text style={g.ctaSecondaryTxt}>🎯 Hedef</Text>
            </TouchableOpacity>
          </View>

          {/* ARP Progression Bar */}
          <View style={g.arpProgress}>
            <View style={g.arpProgressRow}>
              <Text style={g.arpProgressLabel}>ARP'INDAKİ YOL</Text>
              <Text style={g.arpProgressPct}>{currentArp} / {targetArp}</Text>
            </View>
            <View style={g.arpProgressBg}>
              <View style={[g.arpProgressFill, { width: `${arpPct}%` }]} />
            </View>
          </View>
        </View>

        {/* ══════════════════ İÇERİK KARTLARI ════════════════════ */}

        {/* İçerik Seç Kısayolları */}
        <QuickStartCard />

        {/* Bugünün Planı */}
        <DailyPlanCard />

        {/* AI Koç */}
        <AICoachCard />

        {/* XP İlerleme */}
        <XPProgressBar />

        {/* Günlük Görev */}
        <DailyMissionCard />

        {/* Bilişsel Güç Haritası */}
        <BrainPowerMap />

        {/* Günlük Sıralama */}
        <DailyLeaderboard />

        {/* Haftalık Momentum */}
        <WeeklyMomentumStrip />

        {/* Rozetler */}
        {earnedBadges.length > 0 && (
          <>
            <View style={g.badgeHeader}>
              <Text style={g.sectionTitle}>Son Kazanılan Rozetler</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/progress' as any)}>
                <Text style={g.sectionLink}>Tümü →</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              horizontal
              data={earnedBadges.slice(0, 8)}
              keyExtractor={(b) => b.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={g.badgeList}
              getItemLayout={(_data, index) => ({ length: 80, offset: 80 * index, index })}
              renderItem={({ item }) => (
                <View style={g.badgeItem}>
                  <View style={[g.badgeCircle, { backgroundColor: item.color + '20' }]}>
                    <Text style={{ fontSize: 24 }}>{item.iconName}</Text>
                  </View>
                  <Text style={g.badgeName} numberOfLines={1}>{item.name}</Text>
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
const g = StyleSheet.create({
  root:  { flex: 1, backgroundColor: BODY },

  // Toast
  toast: {
    position: 'absolute', top: 12, left: 16, right: 16, zIndex: 999,
    backgroundColor: NAVY, borderRadius: 14,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 12,
  },
  toastTxt: { fontSize: 14, fontWeight: '600', color: '#fff', flex: 1 },

  // Hero
  hero: {
    backgroundColor: NAVY,
    paddingTop: 20, paddingBottom: 28,
    paddingHorizontal: 20, gap: 20,
  },
  heroTop:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroName:    { fontSize: 28, fontWeight: '900', color: '#fff' },
  heroGreeting:{ fontSize: 13, color: 'rgba(255,255,255,0.70)', fontWeight: '500', marginTop: 3 },
  heroActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heroBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },

  // ARP
  arpSection: { gap: 8 },
  arpLabel: {
    fontSize: 10, fontWeight: '700',
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 2,
  },
  arpRow:   { flexDirection: 'row', alignItems: 'flex-end', gap: 16 },
  arpValue: { fontSize: 72, fontWeight: '900', color: '#fff', lineHeight: 80 },
  arpBadges:{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5,
  },
  badgeTxt: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.75)' },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10 },
  glassStat: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14, padding: 12, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
  },
  glassValue: { fontSize: 17, fontWeight: '800', color: '#fff', marginTop: 4 },
  glassLabel: { fontSize: 10, color: 'rgba(255,255,255,0.65)', marginTop: 2 },

  // ARP Progress
  arpProgress: { gap: 6 },
  arpProgressRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  arpProgressLabel: {
    fontSize:     10,
    fontWeight:   '700',
    color:        'rgba(255,255,255,0.55)',
    letterSpacing: 1.5,
  },
  arpProgressPct: {
    fontSize:   11,
    fontWeight: '600',
    color:      'rgba(255,255,255,0.75)',
  },
  arpProgressBg: {
    height:          6,
    borderRadius:    3,
    backgroundColor: 'rgba(255,255,255,0.15)',
    overflow:        'hidden',
  },
  arpProgressFill: {
    height:          6,
    borderRadius:    3,
    backgroundColor: TEAL,
  },

  // CTA
  ctaRow: { flexDirection: 'row', gap: 12 },
  ctaPrimary: {
    flex: 2, backgroundColor: TEAL, borderRadius: 14, height: 52,
    alignItems: 'center', justifyContent: 'center',
  },
  ctaPrimaryTxt: { fontSize: 15, fontWeight: '700', color: '#fff' },
  ctaSecondary: {
    flex: 1, borderRadius: 14, height: 52,
    borderWidth: 1.5, borderColor: TEAL,
    alignItems: 'center', justifyContent: 'center',
  },
  ctaSecondaryTxt: { fontSize: 14, fontWeight: '700', color: TEAL },

  // Sections
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#1A1A2E', marginLeft: 16, marginTop: 20, marginBottom: 10 },
  sectionLink:  { fontSize: 13, fontWeight: '600', color: BLUE, marginTop: 20, marginRight: 16 },
  badgeHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badgeList:    { paddingHorizontal: 16, paddingBottom: 4, gap: 12 },
  badgeItem:    { alignItems: 'center', width: 68 },
  badgeCircle:  { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  badgeName:    { fontSize: 10, color: '#8892A4', textAlign: 'center' },
})
