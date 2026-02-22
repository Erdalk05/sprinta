import React, { useEffect, useState, useRef } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, Animated, Dimensions,
} from 'react-native'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { createClient } from '@supabase/supabase-js'
import { theme } from '../../src/theme'
import { useAuthStore } from '../../src/stores/authStore'
import { calculateExamProgress, getLevelFromXp, LEVEL_NAMES } from '@sprinta/shared'
import { createAICoachService } from '@sprinta/api'

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
)

const { width: W } = Dimensions.get('window')

// ─── Hızlı Eylemler (MB WAY, Transfer, Pay bills benzeri) ────────
const QUICK_ACTIONS = [
  { id: 'speed',   icon: '⚡', label: 'Hızlı Antrenman',  route: '/exercise/speed_control'      },
  { id: 'comp',    icon: '🧠', label: 'Kavrama Testi',    route: '/exercise/deep_comprehension'  },
  { id: 'attn',    icon: '🎯', label: 'Dikkat Egzersizi', route: '/exercise/attention_power'     },
  { id: 'prog',    icon: '📋', label: 'Program Seç',      route: '/program/select'              },
  { id: 'stats',   icon: '📊', label: 'İstatistikler',    route: '/(tabs)/progress'             },
]

interface RecentSession {
  date: string
  avg_arp: number
  xp_earned: number
  sessions_count: number
  total_minutes: number
}

export default function HomeScreen() {
  const router = useRouter()
  const { student } = useAuthStore()
  const fadeAnim = useRef(new Animated.Value(0)).current

  const [recentSessions, setRecentSessions]       = useState<RecentSession[]>([])
  const [balanceVisible, setBalanceVisible]       = useState(true)
  const [morningBriefing, setMorningBriefing]     = useState<string | null>(null)
  const [briefingLoading, setBriefingLoading]     = useState(false)

  const aiCoach = createAICoachService(supabase)

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1, duration: 400, useNativeDriver: true,
    }).start()
    if (!student) return
    supabase
      .from('daily_stats')
      .select('date, avg_arp, xp_earned, sessions_count, total_minutes')
      .eq('student_id', student.id)
      .order('date', { ascending: false })
      .limit(5)
      .then(({ data }) => setRecentSessions((data as RecentSession[]) ?? []))

    // Sabah brifingi yükle
    setBriefingLoading(true)
    aiCoach.getMorningBriefing(student.id)
      .then((res) => setMorningBriefing(res.reply))
      .catch(() => setMorningBriefing(null))
      .finally(() => setBriefingLoading(false))
  }, [student?.id])

  const name        = student?.fullName?.split(' ')[0] ?? 'Öğrenci'
  const currentArp  = student?.currentArp ?? 0
  const examTarget  = (student?.examTarget ?? 'tyt').toUpperCase()
  const totalXp     = student?.totalXp ?? 0
  const streakDays  = student?.streakDays ?? 0
  const level       = getLevelFromXp(totalXp)
  const levelName   = LEVEL_NAMES[level] ?? 'Titan'
  const examProg    = calculateExamProgress(currentArp, examTarget.toLowerCase())

  const hour = new Date().getHours()
  const greeting =
    hour < 6  ? 'Günaydın' :
    hour < 12 ? 'Günaydın' :
    hour < 18 ? 'İyi günler' : 'İyi akşamlar'

  const tap = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    router.push(route as any)
  }

  return (
    <SafeAreaView style={s.root}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

          {/* ── HEADER ── */}
          <View style={s.header}>
            <View style={s.headerLeft}>
              <Text style={s.greeting}>{greeting}, {name}</Text>
            </View>
            <TouchableOpacity
              style={s.avatarBtn}
              onPress={() => router.push('/(tabs)/profile')}
            >
              <View style={s.avatar}>
                <Text style={s.avatarTxt}>{name.charAt(0).toUpperCase()}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* ── ARP KARTI (Account Balance equivalent) ── */}
          <View style={s.arpCard}>
            <View style={s.arpCardTop}>
              <Text style={s.arpCardLabel}>
                {examTarget} Hazırlık · Seviye {level} {levelName}
              </Text>
            </View>
            <View style={s.arpCardMiddle}>
              <TouchableOpacity
                style={s.arpVisibilityBtn}
                onPress={() => setBalanceVisible((v) => !v)}
              >
                <Text style={s.arpEye}>{balanceVisible ? '👁️' : '🙈'}</Text>
              </TouchableOpacity>
              {balanceVisible ? (
                <View style={s.arpValueRow}>
                  <Text style={s.arpValue}>{currentArp}</Text>
                  <Text style={s.arpUnit}> ARP</Text>
                </View>
              ) : (
                <Text style={s.arpHidden}>• • • • •</Text>
              )}
            </View>
            {/* İlerleme çubuğu */}
            <View style={s.arpProgress}>
              <View style={s.arpProgressTrack}>
                <View style={[s.arpProgressFill, {
                  width: `${examProgress(examProg.progressPercent)}%` as any,
                }]} />
              </View>
              <Text style={s.arpProgressTxt}>
                %{examProg.progressPercent} · Hedefe {examProg.remainingArp} ARP kaldı
              </Text>
            </View>
            {/* Account Details butonu */}
            <TouchableOpacity
              style={s.detailsBtn}
              onPress={() => router.push('/(tabs)/progress')}
            >
              <Text style={s.detailsTxt}>Detaylar →</Text>
            </TouchableOpacity>
          </View>

          {/* ── HIZLI EYLEMLER (MB WAY, Transfer, Pay bills) ── */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.quickScroll}
          >
            {QUICK_ACTIONS.map((qa) => (
              <TouchableOpacity
                key={qa.id}
                style={s.quickItem}
                onPress={() => tap(qa.route)}
                activeOpacity={0.7}
              >
                <View style={s.quickIcon}>
                  <Text style={s.quickEmoji}>{qa.icon}</Text>
                </View>
                <Text style={s.quickLabel}>{qa.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* ── AI KOÇ SABAH BRİFİNGİ ── */}
          {(briefingLoading || morningBriefing) && (
            <TouchableOpacity
              style={s.briefingCard}
              onPress={() => router.push('/ai-coach')}
              activeOpacity={0.85}
            >
              <View style={s.briefingHeader}>
                <Text style={s.briefingBot}>🤖</Text>
                <Text style={s.briefingTitle}>AI Koçundan Sabah Brifingi</Text>
                <View style={s.briefingBadge}><Text style={s.briefingBadgeTxt}>YENİ</Text></View>
              </View>
              {briefingLoading ? (
                <View style={s.briefingDots}>
                  <Text style={s.briefingDotsText}>• • •</Text>
                </View>
              ) : (
                <Text style={s.briefingText} numberOfLines={4}>
                  {morningBriefing}
                </Text>
              )}
              <View style={s.briefingFooter}>
                <Text style={s.briefingCta}>Koçunla Konuş →</Text>
              </View>
            </TouchableOpacity>
          )}

          {/* ── HERO BANNER (Promotional card) ── */}
          <TouchableOpacity
            style={s.heroBanner}
            onPress={() => tap('/program/select')}
            activeOpacity={0.9}
          >
            <View style={s.heroContent}>
              <Text style={s.heroTitle}>
                Bilimsel okuma hızını{'\n'}artır, sınava hazırlan
              </Text>
              <Text style={s.heroSub}>
                Yapay zeka destekli{'\n'}kişisel antrenmanın
              </Text>
              <View style={s.heroBtn}>
                <Text style={s.heroBtnTxt}>Programı Keşfet</Text>
              </View>
            </View>
            <Text style={s.heroEmoji}>🚀</Text>
          </TouchableOpacity>

          {/* ── SON AKTİVİTELER (Last transactions) ── */}
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Son Aktiviteler</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/progress')}>
              <Text style={s.sectionLink}>Tümünü Gör</Text>
            </TouchableOpacity>
          </View>

          {recentSessions.length === 0 ? (
            <View style={s.emptyActivity}>
              <Text style={s.emptyTxt}>Henüz aktivite yok — ilk antrenmanını başlat!</Text>
            </View>
          ) : (
            recentSessions.map((sess, i) => {
              const date = new Date(sess.date)
              const dayLabel = date.toLocaleDateString('tr-TR', {
                day: 'numeric', month: 'short',
              })
              const arpChange = sess.avg_arp > 0 ? `+${sess.avg_arp > currentArp ? 0 : 0} ARP` : '-'
              return (
                <View key={i} style={[s.txRow, i > 0 && s.txBorder]}>
                  <View style={s.txLeft}>
                    <Text style={s.txIcon}>
                      {i === 0 ? '⚡' : i === 1 ? '🧠' : i === 2 ? '🎯' : '📚'}
                    </Text>
                    <View style={s.txInfo}>
                      <Text style={s.txTitle}>
                        {sess.sessions_count} seans · {sess.total_minutes} dk
                      </Text>
                      <Text style={s.txDate}>{dayLabel}</Text>
                    </View>
                  </View>
                  <View style={s.txRight}>
                    <Text style={s.txArp}>+{sess.xp_earned} XP</Text>
                    <Text style={s.txArpSub}>ARP {sess.avg_arp}</Text>
                  </View>
                </View>
              )
            })
          )}

          {/* Seri / XP özeti */}
          <View style={s.statsRow}>
            <View style={s.statCard}>
              <Text style={s.statEmoji}>🔥</Text>
              <Text style={s.statVal}>{streakDays}</Text>
              <Text style={s.statLbl}>gün seri</Text>
            </View>
            <View style={s.statCard}>
              <Text style={s.statEmoji}>⭐</Text>
              <Text style={s.statVal}>{totalXp.toLocaleString('tr')}</Text>
              <Text style={s.statLbl}>toplam XP</Text>
            </View>
            <View style={s.statCard}>
              <Text style={s.statEmoji}>🏆</Text>
              <Text style={s.statVal}>Sv.{level}</Text>
              <Text style={s.statLbl}>{levelName}</Text>
            </View>
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  )
}

// Helper — clamp percent
function examProgress(pct: number) {
  return Math.min(100, Math.max(0, pct))
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: theme.colors.background },
  scroll: { paddingBottom: 32 },

  // Header — WhatsApp koyu yeşil top bar
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: theme.colors.panel,   // #075E54
  },
  headerLeft: { flex: 1 },
  greeting:   { fontSize: 20, fontWeight: '900', color: '#FFFFFF' },
  avatarBtn:  { marginLeft: 12 },
  avatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarTxt: { fontSize: 17, fontWeight: '800', color: '#FFFFFF' },

  // ARP Card (Account balance)
  arpCard: {
    marginHorizontal: 16, marginBottom: 20,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: 18,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  arpCardTop:    { marginBottom: 8 },
  arpCardLabel:  { fontSize: 12, color: theme.colors.textHint },
  arpCardMiddle: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  arpVisibilityBtn: { padding: 2 },
  arpEye:        { fontSize: 20 },
  arpValueRow:   { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  arpValue:      { fontSize: 40, fontWeight: '900', color: theme.colors.text },
  arpUnit:       { fontSize: 16, fontWeight: '700', color: theme.colors.textHint, marginBottom: 5 },
  arpHidden:     { fontSize: 28, color: theme.colors.textHint, letterSpacing: 4 },
  arpProgress:   { marginBottom: 14 },
  arpProgressTrack: {
    height: 4, backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2, overflow: 'hidden', marginBottom: 5,
  },
  arpProgressFill: {
    height: 4, borderRadius: 2, backgroundColor: theme.colors.accent,
  },
  arpProgressTxt: { fontSize: 11, color: theme.colors.textHint },
  detailsBtn: {
    alignSelf: 'flex-end',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  detailsTxt: { fontSize: 13, fontWeight: '700', color: '#fff' },

  // Quick actions
  quickScroll: { paddingHorizontal: 16, paddingBottom: 4, gap: 12 },
  quickItem:   { alignItems: 'center', width: 72 },
  quickIcon: {
    width: 56, height: 56, borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  quickEmoji: { fontSize: 24 },
  quickLabel: {
    fontSize: 10, color: theme.colors.accent,
    fontWeight: '600', textAlign: 'center', lineHeight: 13,
  },

  // AI Coach Morning Briefing card
  briefingCard: {
    marginHorizontal: 16, marginBottom: 16, marginTop: 4,
    backgroundColor: theme.colors.bubbleOut,  // #DCF8C6 açık yeşil balon
    borderRadius: theme.radius.xl,
    padding: 16,
    borderWidth: 1, borderColor: theme.colors.primary + '40',
  },
  briefingHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10,
  },
  briefingBot:   { fontSize: 20 },
  briefingTitle: { flex: 1, fontSize: 13, fontWeight: '700', color: theme.colors.panel },
  briefingBadge: {
    backgroundColor: theme.colors.primary,
    borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2,
  },
  briefingBadgeTxt: { fontSize: 9, fontWeight: '900', color: theme.colors.surface, letterSpacing: 0.5 },
  briefingText:  { fontSize: 13, color: theme.colors.text, lineHeight: 19, marginBottom: 12 },
  briefingDots:  { alignItems: 'flex-start', marginBottom: 12 },
  briefingDotsText: { fontSize: 18, color: theme.colors.textHint, letterSpacing: 4 },
  briefingFooter: { alignItems: 'flex-end' },
  briefingCta: { fontSize: 13, fontWeight: '700', color: theme.colors.accent },

  // Hero banner
  heroBanner: {
    marginHorizontal: 16, marginBottom: 24, marginTop: 8,
    backgroundColor: theme.colors.primary + '20',
    borderRadius: theme.radius.xl,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1, borderColor: theme.colors.primary + '40',
    overflow: 'hidden',
  },
  heroContent: { flex: 1 },
  heroTitle:   { fontSize: 16, fontWeight: '900', color: theme.colors.text, marginBottom: 6, lineHeight: 22 },
  heroSub:     { fontSize: 12, color: theme.colors.textHint, marginBottom: 14, lineHeight: 17 },
  heroBtn: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  heroBtnTxt: { fontSize: 13, fontWeight: '700', color: '#fff' },
  heroEmoji:  { fontSize: 48, marginLeft: 8 },

  // Section header
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginBottom: 8,
  },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: theme.colors.text },
  sectionLink:  { fontSize: 14, color: theme.colors.accent, fontWeight: '600' },

  // Transaction rows
  txRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: theme.colors.surface,
  },
  txBorder: { borderTopWidth: 1, borderTopColor: theme.colors.divider },
  txLeft:   { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  txIcon:   { fontSize: 24 },
  txInfo:   { flex: 1 },
  txTitle:  { fontSize: 14, fontWeight: '600', color: theme.colors.text },
  txDate:   { fontSize: 12, color: theme.colors.textHint, marginTop: 1 },
  txRight:  { alignItems: 'flex-end' },
  txArp:    { fontSize: 15, fontWeight: '700', color: theme.colors.accent },
  txArpSub: { fontSize: 11, color: theme.colors.textHint, marginTop: 1 },

  // Empty
  emptyActivity: {
    marginHorizontal: 16, padding: 20,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
  },
  emptyTxt: { fontSize: 13, color: theme.colors.textHint, textAlign: 'center' },

  // Bottom stats
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 16, marginTop: 16,
    gap: 10,
  },
  statCard: {
    flex: 1, alignItems: 'center', padding: 14,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  statEmoji: { fontSize: 22, marginBottom: 4 },
  statVal:   { fontSize: 18, fontWeight: '900', color: theme.colors.text },
  statLbl:   { fontSize: 10, color: theme.colors.textHint, marginTop: 2 },
})
