import React, { useEffect, useState, useRef } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, Animated, FlatList, Dimensions,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { createClient } from '@supabase/supabase-js'
import { useAuthStore } from '../../src/stores/authStore'
import { calculateExamProgress, getLevelFromXp, LEVEL_NAMES } from '@sprinta/shared'
import { createAICoachService } from '@sprinta/api'
import { colors } from '../../src/theme/colors'
import { typography } from '../../src/theme/typography'
import { shadows } from '../../src/theme/shadows'
import { spacing } from '../../src/theme/spacing'
import { ProgressBar } from '../../src/components/ui/ProgressBar'
import { Badge } from '../../src/components/ui/Badge'
import { Card } from '../../src/components/ui/Card'

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
)

const { width: W } = Dimensions.get('window')
const CARD_W = 160
const CARD_GAP = 12

// ─── Modül kartları ───────────────────────────────────────────────
const MODULES = [
  { id: 'speed_control',      icon: '⚡', label: 'Hız\nKontrolü',    grad: colors.modules.speed         as [string,string] },
  { id: 'deep_comprehension', icon: '🧠', label: 'Derin\nKavrama',   grad: colors.modules.comprehension as [string,string] },
  { id: 'attention_power',    icon: '🎯', label: 'Dikkat\nGücü',     grad: colors.modules.attention     as [string,string] },
  { id: 'mental_reset',       icon: '🌿', label: 'Zihinsel\nSıfırl', grad: colors.modules.mental        as [string,string] },
]

// ─── Hızlı eylemler ──────────────────────────────────────────────
const QUICK_ACTIONS = [
  { id: 'speed', icon: '⚡', label: 'Hızlı Antrenman',  route: '/exercise/speed_control'      },
  { id: 'comp',  icon: '🧠', label: 'Kavrama Testi',    route: '/exercise/deep_comprehension'  },
  { id: 'attn',  icon: '🎯', label: 'Dikkat Egzersizi', route: '/exercise/attention_power'     },
  { id: 'prog',  icon: '📋', label: 'Program Seç',      route: '/program/select'              },
  { id: 'stats', icon: '📊', label: 'İstatistikler',    route: '/(tabs)/progress'             },
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

  const [recentSessions, setRecentSessions]   = useState<RecentSession[]>([])
  const [morningBriefing, setMorningBriefing] = useState<string | null>(null)
  const [briefingLoading, setBriefingLoading] = useState(false)

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

    setBriefingLoading(true)
    aiCoach.getMorningBriefing(student.id)
      .then((res) => setMorningBriefing(res.reply))
      .catch(() => setMorningBriefing(null))
      .finally(() => setBriefingLoading(false))
  }, [student?.id])

  const name       = student?.fullName?.split(' ')[0] ?? 'Öğrenci'
  const currentArp = student?.currentArp ?? 0
  const examTarget = (student?.examTarget ?? 'tyt').toUpperCase()
  const totalXp    = student?.totalXp ?? 0
  const streakDays = student?.streakDays ?? 0
  const level      = getLevelFromXp(totalXp)
  const levelName  = LEVEL_NAMES[level] ?? 'Titan'
  const examProg   = calculateExamProgress(currentArp, examTarget.toLowerCase())

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Günaydın' : hour < 18 ? 'İyi günler' : 'İyi akşamlar'

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
              <Text style={s.greeting}>{greeting}, {name} 🔥</Text>
            </View>
            <View style={s.headerRight}>
              <Badge type="streak" value={streakDays} size="sm" style={s.streakBadge} />
              <Badge type="xp" value={totalXp.toLocaleString('tr')} size="sm" style={s.xpBadge} />
              <TouchableOpacity
                style={s.avatarBtn}
                onPress={() => router.push('/(tabs)/profile')}
              >
                <View style={s.avatar}>
                  <Text style={s.avatarTxt}>{name.charAt(0).toUpperCase()}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── ARP KARTI (Gradient) ── */}
          <Card
            variant="cognitive"
            gradientColors={colors.arpGradient as [string, string]}
            style={s.arpCard}
            padding={20}
          >
            <Text style={s.arpLabel}>{examTarget} Hazırlık · Seviye {level} {levelName}</Text>
            <View style={s.arpValueRow}>
              <Text style={s.arpValue}>{currentArp}</Text>
              <Text style={s.arpUnit}> ARP</Text>
            </View>
            <ProgressBar
              progress={examProg.progressPercent / 100}
              color="rgba(255,255,255,0.9)"
              trackColor="rgba(255,255,255,0.2)"
              height={6}
              style={s.arpBar}
            />
            <Text style={s.arpSub}>%{examProg.progressPercent} · Hedefe {examProg.remainingArp} ARP kaldı</Text>
            <TouchableOpacity
              style={s.detailsBtn}
              onPress={() => tap('/(tabs)/progress')}
            >
              <Text style={s.detailsTxt}>Detaylar →</Text>
            </TouchableOpacity>
          </Card>

          {/* ── GÜNLÜK HEDEF KARTI ── */}
          <Card variant="elevated" style={s.goalCard} padding={spacing.md}>
            <View style={s.goalHeader}>
              <Text style={s.goalTitle}>Bugünkü Hedef 🎯</Text>
              <Text style={s.goalPct}>%{Math.round(Math.min(1, streakDays / 7) * 100)}</Text>
            </View>
            {[
              { icon: '⚡', label: '1 hız antrenmanı tamamla', done: streakDays > 0 },
              { icon: '🧠', label: 'Kavrama testini bitir',    done: streakDays > 1 },
              { icon: '🎯', label: 'Dikkat egzersizi yap',    done: false },
            ].map((task, i) => (
              <View key={i} style={s.goalRow}>
                <Text style={s.goalIcon}>{task.icon}</Text>
                <Text style={[s.goalTxt, task.done && s.goalTxtDone]}>{task.label}</Text>
                <Text style={s.goalCheck}>{task.done ? '✅' : '⬜'}</Text>
              </View>
            ))}
            <ProgressBar
              progress={Math.min(1, streakDays / 7)}
              color={colors.primary}
              height={6}
              style={{ marginTop: spacing.sm }}
            />
          </Card>

          {/* ── MODÜL KARTLARI (Horizontal scroll) ── */}
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Antrenmanlar</Text>
            <TouchableOpacity onPress={() => tap('/(tabs)/sessions')}>
              <Text style={s.sectionLink}>Tümü →</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            horizontal
            data={MODULES}
            keyExtractor={m => m.id}
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_W + CARD_GAP}
            decelerationRate="fast"
            contentContainerStyle={s.moduleList}
            renderItem={({ item: m }) => (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => tap(`/exercise/${m.id}`)}
              >
                <LinearGradient
                  colors={m.grad}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={s.moduleCard}
                >
                  <Text style={s.moduleEmoji}>{m.icon}</Text>
                  <Text style={s.moduleName}>{m.label}</Text>
                  <View style={s.moduleBadge}>
                    <Text style={s.moduleBadgeTxt}>Başla →</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            )}
          />

          {/* ── AI KOÇ BRİFİNG ── */}
          {(briefingLoading || morningBriefing) && (
            <TouchableOpacity
              style={s.briefingCard}
              onPress={() => tap('/ai-coach')}
              activeOpacity={0.85}
            >
              <View style={s.briefingHeader}>
                <Text style={s.briefingBot}>🤖</Text>
                <Text style={s.briefingTitle}>AI Koçundan Sabah Brifingi</Text>
                <View style={s.briefingBadge}><Text style={s.briefingBadgeTxt}>YENİ</Text></View>
              </View>
              {briefingLoading
                ? <Text style={s.briefingDots}>• • •</Text>
                : <Text style={s.briefingText} numberOfLines={4}>{morningBriefing}</Text>
              }
              <Text style={s.briefingCta}>Koçunla Konuş →</Text>
            </TouchableOpacity>
          )}

          {/* ── MOTİVASYON KARTI ── */}
          <TouchableOpacity onPress={() => tap('/program/select')} activeOpacity={0.9}>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.heroBanner}
            >
              <View style={s.heroContent}>
                <Text style={s.heroTitle}>Bilimsel okuma hızını{'\n'}artır, sınava hazırlan</Text>
                <Text style={s.heroSub}>Yapay zeka destekli{'\n'}kişisel antrenmanın</Text>
                <View style={s.heroBtn}>
                  <Text style={s.heroBtnTxt}>Programı Keşfet</Text>
                </View>
              </View>
              <Text style={s.heroEmoji}>🚀</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* ── SON AKTİVİTELER ── */}
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Son Aktiviteler</Text>
            <TouchableOpacity onPress={() => tap('/(tabs)/progress')}>
              <Text style={s.sectionLink}>Tümünü Gör</Text>
            </TouchableOpacity>
          </View>

          <Card variant="elevated" style={s.activityCard} padding={0}>
            {recentSessions.length === 0 ? (
              <View style={s.emptyActivity}>
                <Text style={s.emptyTxt}>Henüz aktivite yok — ilk antrenmanını başlat!</Text>
              </View>
            ) : (
              recentSessions.map((sess, i) => {
                const dayLabel = new Date(sess.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
                return (
                  <View key={i} style={[s.txRow, i > 0 && s.txBorder]}>
                    <View style={[s.txAccent, { backgroundColor: i % 2 === 0 ? colors.primary : colors.primaryDark }]} />
                    <View style={s.txLeft}>
                      <Text style={s.txIcon}>{['⚡','🧠','🎯','📚','🌿'][i % 5]}</Text>
                      <View>
                        <Text style={s.txTitle}>{sess.sessions_count} seans · {sess.total_minutes} dk</Text>
                        <Text style={s.txDate}>{dayLabel}</Text>
                      </View>
                    </View>
                    <View style={s.txRight}>
                      <Text style={s.txXp}>+{sess.xp_earned} XP</Text>
                      <Text style={s.txArp}>ARP {sess.avg_arp}</Text>
                    </View>
                  </View>
                )
              })
            )}
          </Card>

          {/* ── STATS ── */}
          <View style={s.statsRow}>
            {[
              { emoji: '🔥', val: `${streakDays}`,                    lbl: 'gün seri' },
              { emoji: '⭐', val: totalXp.toLocaleString('tr'),       lbl: 'toplam XP' },
              { emoji: '🏆', val: `Sv.${level}`,                      lbl: levelName },
            ].map((st, i) => (
              <Card key={i} variant="elevated" style={s.statCard} padding={14}>
                <Text style={s.statEmoji}>{st.emoji}</Text>
                <Text style={s.statVal}>{st.val}</Text>
                <Text style={s.statLbl}>{st.lbl}</Text>
              </Card>
            ))}
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: 32 },

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: 14,
    backgroundColor: colors.primaryDarker,
  },
  headerLeft:  { flex: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  greeting:    { fontSize: 20, fontWeight: '900', color: colors.white },
  streakBadge: {},
  xpBadge:     {},
  avatarBtn:   { marginLeft: 6 },
  avatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarTxt: { fontSize: 17, fontWeight: '800', color: colors.white },

  // ARP Card
  arpCard:     { marginHorizontal: spacing.md, marginTop: spacing.md, marginBottom: spacing.md, borderRadius: 20 },
  arpLabel:    { ...(typography.caption as object), color: 'rgba(255,255,255,0.75)', marginBottom: 4 },
  arpValueRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12 },
  arpValue:    { fontSize: 48, fontWeight: '900', color: colors.white },
  arpUnit:     { fontSize: 18, fontWeight: '700', color: 'rgba(255,255,255,0.8)', marginBottom: 8 },
  arpBar:      { marginBottom: 8 },
  arpSub:      { ...(typography.caption as object), color: 'rgba(255,255,255,0.75)', marginBottom: 14 },
  detailsBtn:  {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8,
  },
  detailsTxt: { ...(typography.label as object), color: colors.white, fontWeight: '700' },

  // Goal Card
  goalCard:   { marginHorizontal: spacing.md, marginBottom: spacing.md },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  goalTitle:  { ...(typography.h3 as object), color: colors.textPrimary },
  goalPct:    { ...(typography.label as object), color: colors.primary, fontWeight: '700' },
  goalRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  goalIcon:   { fontSize: 18, marginRight: 10 },
  goalTxt:    { flex: 1, ...(typography.label as object), color: colors.textPrimary },
  goalTxtDone:{ color: colors.textSecondary, textDecorationLine: 'line-through' },
  goalCheck:  { fontSize: 16 },

  // Module cards
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.md, marginBottom: 10, marginTop: 4,
  },
  sectionTitle: { ...(typography.h3 as object), color: colors.textPrimary },
  sectionLink:  { ...(typography.label as object), color: colors.primary, fontWeight: '600' },
  moduleList:   { paddingHorizontal: spacing.md, paddingBottom: spacing.sm, gap: CARD_GAP },
  moduleCard: {
    width: CARD_W, height: 180, borderRadius: 20,
    padding: spacing.md, justifyContent: 'space-between',
    ...shadows.md,
  },
  moduleEmoji: { fontSize: 40 },
  moduleName:  { ...(typography.bodyMedium as object), color: colors.white, fontWeight: '700', lineHeight: 22 },
  moduleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5,
  },
  moduleBadgeTxt: { ...(typography.captionMedium as object), color: colors.white },

  // AI Briefing
  briefingCard: {
    marginHorizontal: spacing.md, marginBottom: spacing.md,
    backgroundColor: colors.primaryLight,
    borderRadius: 16, padding: spacing.md,
    borderWidth: 1, borderColor: colors.primary + '40',
  },
  briefingHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  briefingBot:    { fontSize: 20 },
  briefingTitle:  { flex: 1, ...(typography.label as object), color: colors.primaryDarker, fontWeight: '700' },
  briefingBadge:  { backgroundColor: colors.primary, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  briefingBadgeTxt: { fontSize: 9, fontWeight: '900', color: colors.white },
  briefingDots:   { ...(typography.body as object), color: colors.textSecondary, letterSpacing: 4, marginBottom: 12 },
  briefingText:   { ...(typography.label as object), color: colors.textPrimary, lineHeight: 20, marginBottom: 10 },
  briefingCta:    { ...(typography.label as object), color: colors.primaryDark, fontWeight: '700', textAlign: 'right' },

  // Hero banner
  heroBanner: {
    marginHorizontal: spacing.md, marginBottom: spacing.md, marginTop: spacing.sm,
    borderRadius: 20, padding: 20,
    flexDirection: 'row', alignItems: 'center', overflow: 'hidden',
    ...shadows.sm,
  },
  heroContent: { flex: 1 },
  heroTitle:   { ...(typography.h3 as object), color: colors.white, marginBottom: 6 },
  heroSub:     { ...(typography.caption as object), color: 'rgba(255,255,255,0.8)', marginBottom: 14 },
  heroBtn: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8,
  },
  heroBtnTxt: { ...(typography.label as object), color: colors.white, fontWeight: '700' },
  heroEmoji:  { fontSize: 48, marginLeft: 8 },

  // Activity
  activityCard: { marginHorizontal: spacing.md, marginBottom: spacing.sm, overflow: 'hidden' },
  emptyActivity:{ padding: 20, alignItems: 'center' },
  emptyTxt:     { ...(typography.caption as object), color: colors.textSecondary, textAlign: 'center' },
  txRow:        { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingRight: spacing.md },
  txBorder:     { borderTopWidth: 1, borderTopColor: colors.border },
  txAccent:     { width: 4, height: '100%', borderRadius: 2, marginRight: 12, minHeight: 40 },
  txLeft:       { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  txIcon:       { fontSize: 22 },
  txTitle:      { ...(typography.label as object), color: colors.textPrimary },
  txDate:       { ...(typography.caption as object), color: colors.textSecondary, marginTop: 2 },
  txRight:      { alignItems: 'flex-end' },
  txXp:         { ...(typography.label as object), color: colors.primary, fontWeight: '700' },
  txArp:        { ...(typography.caption as object), color: colors.textSecondary, marginTop: 2 },

  // Stats row
  statsRow: { flexDirection: 'row', marginHorizontal: spacing.md, gap: 10, marginTop: 4 },
  statCard: { flex: 1, alignItems: 'center' },
  statEmoji:{ fontSize: 22, marginBottom: 4 },
  statVal:  { ...(typography.h3 as object), color: colors.textPrimary },
  statLbl:  { ...(typography.caption as object), color: colors.textSecondary, marginTop: 2 },
})
