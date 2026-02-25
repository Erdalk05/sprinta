/**
 * Sprinta Ana Sayfa — Hero Redesign
 * Gradient hero header, ARP count-up, glassmorphism stats,
 * günlük hedef kartı, haftalık özet, son seans, rozetler.
 */
import React, { useEffect, useRef, useMemo, useState } from 'react'
import {
  View, Text, TouchableOpacity, ScrollView, FlatList,
  SafeAreaView, Animated, StyleSheet, Dimensions,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../stores/authStore'
import { useGamificationStore } from '../../stores/gamificationStore'
import { useThemeToggle, useAppTheme } from '../../theme/useAppTheme'
import type { AppTheme } from '../../theme'
import { calculateExamProgress, getLevelFromXp } from '@sprinta/shared'
import { EventBus } from '../rewards/EventBus'
import { getBadgeById } from '../rewards/RewardEngine'

const { width: W } = Dimensions.get('window')

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
  const level      = getLevelFromXp(totalXp)

  const hour     = new Date().getHours()
  const greeting = hour < 12 ? 'Günaydın' : hour < 18 ? 'İyi günler' : 'İyi akşamlar'

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

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    router.push('/(tabs)/sessions' as any)
  }

  return (
    <SafeAreaView style={s.root}>
      {badgeToast && (
        <BadgeToast badgeId={badgeToast} onHide={() => setBadgeToast(null)} />
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ═══════════════════════════════════════════════════════
            BÖLÜM 1 — Hero Header
        ═══════════════════════════════════════════════════════ */}
        <LinearGradient
          colors={t.gradients.hero as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.hero}
        >
          {/* Üst satır: selam + tema toggle */}
          <View style={s.heroTop}>
            <View>
              <Text style={s.heroGreeting}>{greeting} 👋</Text>
              <Text style={s.heroName}>{name}</Text>
            </View>
            <TouchableOpacity onPress={toggleTheme} style={s.themeBtn}>
              <Text style={{ fontSize: 22 }}>{isDark ? '☀️' : '🌙'}</Text>
            </TouchableOpacity>
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
          <TouchableOpacity style={s.startBtn} onPress={handleStart} activeOpacity={0.9}>
            <Text style={s.startIcon}>▶</Text>
            <Text style={s.startTxt}>HIZLI BAŞLA</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* ═══════════════════════════════════════════════════════
            BÖLÜM 2 — Günlük Hedef
        ═══════════════════════════════════════════════════════ */}
        <LinearGradient
          colors={t.gradients.cardPrimary as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.goalCard}
        >
          <View style={s.goalTop}>
            <Text style={s.goalTitle}>🎯 Bugünkü Hedef</Text>
            <View style={s.goalBadge}>
              <Text style={s.goalBadgeTxt}>{examTarget}</Text>
            </View>
          </View>
          <View style={s.goalBar}>
            <View style={[s.goalBarFill, { width: `${Math.min(100, examProg.progressPercent)}%` as any }]} />
          </View>
          <View style={s.goalBottom}>
            <Text style={s.goalPct}>%{Math.round(examProg.progressPercent)} tamamlandı</Text>
            {examProg.progressPercent >= 100 ? (
              <Text style={s.goalDone}>✅ Bugünkü hedef tamamlandı!</Text>
            ) : (
              <TouchableOpacity style={s.goalBtn} onPress={handleContinue}>
                <Text style={s.goalBtnTxt}>Devam Et →</Text>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>

        {/* ═══════════════════════════════════════════════════════
            BÖLÜM 3 — Bu Hafta İstatistikleri
        ═══════════════════════════════════════════════════════ */}
        <Text style={s.sectionTitle}>Bu Hafta</Text>
        <View style={s.weekRow}>
          {[
            { emoji: '📊', value: String(Math.max(0, Math.floor(totalXp / 120))), unit: 'seans' },
            { emoji: '🕐', value: String(Math.max(0, Math.floor(totalXp / 40))),  unit: 'dakika' },
            { emoji: '⚡', value: totalXp.toLocaleString('tr'),                   unit: 'XP' },
          ].map((item, i) => (
            <View key={i} style={s.weekCard}>
              <Text style={{ fontSize: 24, marginBottom: 4 }}>{item.emoji}</Text>
              <Text style={s.weekValue}>{item.value}</Text>
              <Text style={s.weekUnit}>{item.unit}</Text>
            </View>
          ))}
        </View>

        {/* ═══════════════════════════════════════════════════════
            BÖLÜM 4 — Son Seans / Motivasyon
        ═══════════════════════════════════════════════════════ */}
        {totalXp > 0 ? (
          <LinearGradient
            colors={t.gradients.cardSuccess as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.lastCard}
          >
            <Text style={s.lastTitle}>Son Seans</Text>
            <Text style={s.lastMeta}>
              Hız Kontrolü  ·  {currentArp} ARP
            </Text>
            <TouchableOpacity
              style={s.lastBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                router.push('/exercise/speed_control' as any)
              }}
            >
              <Text style={s.lastBtnTxt}>Tekrarla →</Text>
            </TouchableOpacity>
          </LinearGradient>
        ) : (
          <LinearGradient
            colors={t.gradients.cardSuccess as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.lastCard}
          >
            <Text style={s.lastTitle}>🚀 İlk Antrenmanına Başla!</Text>
            <Text style={s.lastMeta}>Sprinta ile okuma hızını ölç ve geliştir.</Text>
            <TouchableOpacity style={s.lastBtn} onPress={handleStart}>
              <Text style={s.lastBtnTxt}>Şimdi Başla →</Text>
            </TouchableOpacity>
          </LinearGradient>
        )}

        {/* ═══════════════════════════════════════════════════════
            BÖLÜM 5 — Rozetler
        ═══════════════════════════════════════════════════════ */}
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

    // Hero
    hero: {
      paddingTop: 20, paddingBottom: 24,
      paddingHorizontal: 20,
      gap: 16,
    },
    heroTop: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    },
    heroGreeting: { fontSize: 14, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },
    heroName:     { fontSize: 22, fontWeight: '800', color: '#fff', marginTop: 2 },
    themeBtn:     { padding: 6 },

    arpBlock:  { alignItems: 'center', paddingVertical: 8 },
    arpLabel:  { fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: '700', letterSpacing: 2 },
    arpValue:  { fontSize: 72, fontWeight: '900', color: '#fff', lineHeight: 80, marginTop: 4 },
    arpTrend:  { fontSize: 13, color: 'rgba(255,255,255,0.80)', marginTop: 4, fontWeight: '600' },

    glassRow:  { flexDirection: 'row', gap: 10 },

    startBtn:  {
      backgroundColor: '#fff',
      borderRadius: 16, height: 56,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: 10,
      ...t.shadows.lg,
    },
    startIcon: { fontSize: 20 },
    startTxt:  { fontSize: 17, fontWeight: '800', color: '#1a1a2e', letterSpacing: 1.5 },

    // Günlük hedef
    goalCard: {
      marginHorizontal: 16, marginTop: 16,
      borderRadius: 20, padding: 18,
      ...t.shadows.md,
    },
    goalTop:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    goalTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
    goalBadge: { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
    goalBadgeTxt: { fontSize: 12, fontWeight: '800', color: '#fff' },
    goalBar:   { height: 6, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 3, overflow: 'hidden', marginBottom: 10 },
    goalBarFill: { height: 6, backgroundColor: '#fff', borderRadius: 3 },
    goalBottom:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    goalPct:   { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
    goalDone:  { fontSize: 13, color: '#fff', fontWeight: '700' },
    goalBtn:   { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 7 },
    goalBtnTxt:{ fontSize: 13, fontWeight: '700', color: '#fff' },

    // Haftalık
    sectionTitle: { fontSize: 16, fontWeight: '700', color: t.colors.text, marginHorizontal: 16, marginTop: 20, marginBottom: 10 },
    sectionLink:  { fontSize: 14, fontWeight: '600', marginTop: 20, marginRight: 16 },
    weekRow:   { flexDirection: 'row', gap: 10, marginHorizontal: 16 },
    weekCard:  {
      flex: 1, backgroundColor: t.colors.surface,
      borderRadius: 16, padding: 14, alignItems: 'center',
      borderWidth: 1, borderColor: t.colors.border,
      ...t.shadows.sm,
    },
    weekValue: { fontSize: 22, fontWeight: '900', color: t.colors.text, marginBottom: 2 },
    weekUnit:  { fontSize: 11, color: t.colors.textHint },

    // Son seans
    lastCard: {
      marginHorizontal: 16, marginTop: 16,
      borderRadius: 20, padding: 18,
      ...t.shadows.md,
    },
    lastTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 4 },
    lastMeta:  { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 12 },
    lastBtn:   { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 9, alignSelf: 'flex-end' },
    lastBtnTxt:{ fontSize: 14, fontWeight: '700', color: '#fff' },

    // Rozetler
    badgeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    badgeList:   { paddingHorizontal: 16, paddingBottom: 4, gap: 12 },
    badgeItem:   { alignItems: 'center', width: 68 },
    badgeCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
    badgeName:   { fontSize: 10, color: t.colors.textHint, textAlign: 'center' },
  })
}
