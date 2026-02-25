import React, { useEffect, useState, useMemo } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator, Dimensions,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { createClient } from '@supabase/supabase-js'
import { type AppTheme } from '../../src/theme'
import { useAppTheme } from '../../src/theme/useAppTheme'
import { useAuthStore } from '../../src/stores/authStore'
import { calculateExamProgress, getLevelFromXp, LEVEL_NAMES } from '@sprinta/shared'
import { createBadgeService } from '@sprinta/api'
import type { Badge } from '@sprinta/api'
import { BadgeCard } from '../../src/components/gamification/BadgeCard'
import { GradientCard } from '../../src/components/ui/GradientCard'
import { ProgressRing } from '../../src/components/ui/ProgressRing'
import { LineChart } from '../../src/components/ui/LineChart'

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
)
const badgeService = createBadgeService(supabase)

const { width: SCREEN_W } = Dimensions.get('window')
const CHART_W = SCREEN_W - 64

type Period = '7g' | '30g' | '90g'

interface DailyStat {
  date: string
  avg_arp: number
  sessions_count: number
  total_minutes: number
  xp_earned: number
}

function computeSkills(arp: number, stats: DailyStat[]) {
  const avgMinutes = stats.length > 0
    ? stats.reduce((s, d) => s + d.total_minutes, 0) / stats.length : 0
  const consistency = stats.filter((d) => d.sessions_count > 0).length / Math.max(stats.length, 1)
  return {
    speed:         Math.min(100, Math.round((arp / 300) * 100)),
    comprehension: Math.min(100, Math.round(75 + (arp - 100) / 8)),
    attention:     Math.min(100, Math.round(consistency * 100)),
    endurance:     Math.min(100, Math.round((avgMinutes / 30) * 100)),
  }
}

export default function ProgressScreen() {
  const { student }   = useAuthStore()
  const t             = useAppTheme()
  const s             = useMemo(() => ms(t), [t])

  const [period, setPeriod]       = useState<Period>('7g')
  const [stats, setStats]         = useState<DailyStat[]>([])
  const [loading, setLoading]     = useState(true)
  const [earnedBadges, setEarned] = useState<Badge[]>([])
  const [lockedBadges, setLocked] = useState<Badge[]>([])

  const currentArp = student?.currentArp ?? 0
  const examTarget = student?.examTarget?.toLowerCase() ?? 'tyt'
  const totalXp    = student?.totalXp ?? 0
  const streak     = student?.streakDays ?? 0

  const examProgress = calculateExamProgress(currentArp, examTarget)
  const level        = getLevelFromXp(totalXp)
  const levelName    = LEVEL_NAMES[level] ?? 'Titan'
  const days         = period === '7g' ? 7 : period === '30g' ? 30 : 90

  useEffect(() => {
    if (!student) return
    setLoading(true)
    const since = new Date(Date.now() - days * 86400000).toISOString().split('T')[0]
    // 4 saniye timeout — bağlantı yoksa boş göster
    const timer = setTimeout(() => setLoading(false), 4000)
    Promise.all([
      supabase
        .from('daily_stats')
        .select('date, avg_arp, sessions_count, total_minutes, xp_earned')
        .eq('student_id', student.id)
        .gte('date', since)
        .order('date', { ascending: true }),
      badgeService.getStudentBadges(student.id),
    ]).then(([{ data }, { earned, locked }]) => {
      clearTimeout(timer)
      setStats((data as DailyStat[]) ?? [])
      setEarned(earned)
      setLocked(locked)
      setLoading(false)
    }).catch(() => { clearTimeout(timer); setLoading(false) })
    return () => clearTimeout(timer)
  }, [student?.id, days])

  const chartData = (() => {
    const map: Record<string, number> = {}
    stats.forEach((st) => { map[st.date] = st.avg_arp })
    const result: { label: string; value: number }[] = []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000)
      const key = d.toISOString().split('T')[0]
      result.push({ label: `${d.getDate()}/${d.getMonth() + 1}`, value: map[key] ?? 0 })
    }
    return result
  })()

  const hasData = stats.length > 0
  const skills  = computeSkills(currentArp, stats)
  const trendArp = stats.length < 2 ? 0 : stats[stats.length - 1].avg_arp - stats[0].avg_arp

  return (
    <SafeAreaView style={s.root}>
      <LinearGradient
        colors={t.gradients.istatistik as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.topBar}
      >
        <Text style={s.topTitle}>İlerleme</Text>
        <View style={s.periodRow}>
          {(['7g', '30g', '90g'] as Period[]).map((p) => (
            <TouchableOpacity
              key={p}
              style={[s.periodBtn, period === p && s.periodBtnActive]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[s.periodTxt, period === p && s.periodTxtActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        <GradientCard colors={[t.colors.primary + '50', t.colors.surface]} style={s.heroCard}>
          <View style={s.heroTop}>
            <View style={s.heroLeft}>
              <Text style={s.heroLabel}>Mevcut ARP</Text>
              <Text style={s.heroArp}>{currentArp}</Text>
              <Text style={s.heroTarget}>{examTarget.toUpperCase()} Hedefi</Text>
              <View style={s.targetBar}>
                <View style={[s.targetFill, { width: `${examProgress.progressPercent}%` as any, backgroundColor: t.colors.primary }]} />
              </View>
              <Text style={s.targetPct}>%{examProgress.progressPercent} tamamlandı</Text>
            </View>
            <ProgressRing
              value={examProgress.progressPercent} size={84} stroke={8}
              color={t.colors.primary}
              label={`${Math.round(examProgress.progressPercent)}%`}
              sublabel={examTarget.toUpperCase()}
            />
          </View>
          <View style={s.chipRow}>
            <StatChip t={t} emoji="🏆" label={levelName} value={`Sv.${level}`} color={t.colors.accent} />
            <StatChip t={t} emoji="🔥" label="Seri" value={`${streak} gün`} color="#F97316" />
            <StatChip t={t} emoji="⭐" label="XP" value={totalXp.toLocaleString('tr')} color={t.colors.primary} />
            {trendArp !== 0 && (
              <StatChip t={t}
                emoji={trendArp > 0 ? '📈' : '📉'} label="Trend"
                value={`${trendArp > 0 ? '+' : ''}${trendArp}`}
                color={trendArp > 0 ? t.colors.success : '#EF4444'}
              />
            )}
          </View>
        </GradientCard>

        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>📊 ARP Trendi</Text>
          {hasData && <Text style={s.sectionSub}>{stats.length} kayıt / {days} gün</Text>}
        </View>
        <View style={s.chartCard}>
          {loading
            ? <View style={s.chartLoading}><ActivityIndicator color={t.colors.primary} /></View>
            : <LineChart data={chartData} color={t.colors.primary} height={130} width={CHART_W} showDots showGrid showLabels />
          }
        </View>

        <Text style={s.sectionTitle}>🧠 Beceri Profili</Text>
        <View style={s.skillCard}>
          <SkillBar t={t} label="Hız Kontrolü"     value={skills.speed}         color={t.module.speed_control.color}       icon="⚡" />
          <SkillBar t={t} label="Derin Kavrama"     value={skills.comprehension} color={t.module.deep_comprehension.color}  icon="🧠" />
          <SkillBar t={t} label="Dikkat Gücü"       value={skills.attention}     color={t.module.attention_power.color}     icon="🎯" />
          <SkillBar t={t} label="Sürdürülebilirlik" value={skills.endurance}     color={t.module.mental_reset.color}        icon="🌿" />
        </View>

        <Text style={s.sectionTitle}>📅 {period} Özeti</Text>
        <View style={s.statsGrid}>
          <StatBlock t={t} label="Toplam Seans" value={stats.reduce((a, d) => a + d.sessions_count, 0).toString()} unit="seans" color={t.colors.primary} />
          <StatBlock t={t} label="Toplam Süre"  value={stats.reduce((a, d) => a + d.total_minutes, 0).toString()} unit="dakika" color={t.colors.accent} />
          <StatBlock t={t} label="Kazanılan XP" value={stats.reduce((a, d) => a + d.xp_earned, 0).toLocaleString('tr')} unit="xp" color="#F59E0B" />
          <StatBlock t={t} label="En Yüksek ARP" value={(stats.length > 0 ? Math.max(...stats.map((d) => d.avg_arp)) : 0).toString()} unit="arp" color="#8B5CF6" />
        </View>

        {examProgress.remainingArp > 0 && (
          <>
            <Text style={s.sectionTitle}>🎯 Hedefe Kalan</Text>
            <GradientCard colors={[t.colors.accent + '30', t.colors.surface]} style={s.goalCard}>
              <View style={s.goalRow}>
                <View style={s.goalLeft}>
                  <Text style={s.goalTitle}>{examTarget.toUpperCase()} Minimum Hedef</Text>
                  <Text style={s.goalRemain}>
                    <Text style={{ color: t.colors.accent }}>{examProgress.remainingArp} ARP</Text> kaldı
                  </Text>
                  <Text style={s.goalEst}>~{Math.ceil(examProgress.remainingArp / 5)} günlük çalışma</Text>
                </View>
                <View style={s.goalCircle}>
                  <Text style={s.goalPct}>{examProgress.progressPercent}%</Text>
                  <Text style={s.goalPctSub}>TAM.</Text>
                </View>
              </View>
            </GradientCard>
          </>
        )}

        {(earnedBadges.length > 0 || lockedBadges.length > 0) && (
          <>
            <Text style={s.sectionTitle}>🏅 Rozetler</Text>
            <View style={s.badgeList}>
              {earnedBadges.map((b) => <BadgeCard key={b.id} badge={b} earned size="small" />)}
              {lockedBadges.slice(0, 3).map((b) => <BadgeCard key={b.id} badge={b} earned={false} size="small" />)}
            </View>
          </>
        )}

        {!student?.hasCompletedDiagnostic && (
          <View style={s.diagBanner}>
            <Text style={s.diagTitle}>🧪 Tanılama Testi Bekleniyor</Text>
            <Text style={s.diagSub}>Kişisel başlangıç ARP değerini belirlemek için tanılama testini tamamla.</Text>
          </View>
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

// ─── Alt Bileşenler ───────────────────────────────────────────────

function SkillBar({ t, label, value, color, icon }: { t: AppTheme; label: string; value: number; color: string; icon: string }) {
  const trackBg = t.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 }}>
      <Text style={{ fontSize: 20, width: 28 }}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: t.colors.text }}>{label}</Text>
          <Text style={{ fontSize: 13, fontWeight: '800', color }}>{value}</Text>
        </View>
        <View style={{ height: 6, backgroundColor: trackBg, borderRadius: 3, overflow: 'hidden' }}>
          <View style={{ height: 6, borderRadius: 3, width: `${Math.min(100, value)}%` as any, backgroundColor: color }} />
        </View>
      </View>
    </View>
  )
}

function StatBlock({ t, label, value, unit, color }: { t: AppTheme; label: string; value: string; unit: string; color: string }) {
  return (
    <View style={{ width: '47%', backgroundColor: t.colors.surface, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: t.colors.border }}>
      <Text style={{ fontSize: 24, fontWeight: '900', marginBottom: 2, color }}>{value}</Text>
      <Text style={{ fontSize: 11, color: t.colors.textHint, marginBottom: 4 }}>{unit}</Text>
      <Text style={{ fontSize: 12, color: t.colors.textSub }}>{label}</Text>
    </View>
  )
}

function StatChip({ t, emoji, label, value, color }: { t: AppTheme; emoji: string; label: string; value: string; color: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: color + '40', backgroundColor: color + '15' }}>
      <Text style={{ fontSize: 16 }}>{emoji}</Text>
      <View>
        <Text style={{ fontSize: 13, fontWeight: '800', color }}>{value}</Text>
        <Text style={{ fontSize: 10, color: t.colors.textHint }}>{label}</Text>
      </View>
    </View>
  )
}

// ─── Styles ──────────────────────────────────────────────────────

function ms(t: AppTheme) {
  return StyleSheet.create({
    root:    { flex: 1, backgroundColor: t.colors.background },
    topBar:  {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: 20, paddingVertical: 14,
    },
    topTitle: { fontSize: 20, fontWeight: '900', color: '#FFFFFF' },
    periodRow:{ flexDirection: 'row', gap: 6 },
    periodBtn:{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999,
                backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
    periodBtnActive:{ backgroundColor: t.colors.primary + '40', borderColor: t.colors.primary },
    periodTxt:{ fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.7)' },
    periodTxtActive:{ color: '#FFFFFF' },

    scroll:   { padding: 16, paddingBottom: 40 },

    heroCard: { marginBottom: 20 },
    heroTop:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
    heroLeft: { flex: 1 },
    heroLabel:{ fontSize: 12, color: t.colors.textHint, marginBottom: 2 },
    heroArp:  { fontSize: 48, fontWeight: '900', color: t.colors.text, lineHeight: 56 },
    heroTarget:{ fontSize: 11, color: t.colors.textHint, marginTop: 8, marginBottom: 4 },
    targetBar:{ height: 4, backgroundColor: t.colors.border, borderRadius: 2, overflow: 'hidden', width: '80%' },
    targetFill:{ height: 4, borderRadius: 2 },
    targetPct:{ fontSize: 11, color: t.colors.primaryLight, marginTop: 3 },
    chipRow:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

    sectionHeader:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    sectionTitle: { fontSize: 15, fontWeight: '700', color: t.colors.text, marginBottom: 10 },
    sectionSub:   { fontSize: 11, color: t.colors.textHint },
    chartCard:    {
      backgroundColor: t.colors.surface, borderRadius: 16,
      padding: 16, marginBottom: 20,
      borderWidth: 1, borderColor: t.colors.border,
    },
    chartLoading: { height: 130, alignItems: 'center', justifyContent: 'center' },

    skillCard:  { backgroundColor: t.colors.surface, borderRadius: 16,
                  padding: 16, marginBottom: 20, borderWidth: 1, borderColor: t.colors.border },

    statsGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },

    goalCard:   { marginBottom: 20 },
    goalRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    goalLeft:   { flex: 1 },
    goalTitle:  { fontSize: 13, color: t.colors.textHint, marginBottom: 4 },
    goalRemain: { fontSize: 18, fontWeight: '800', color: t.colors.text },
    goalEst:    { fontSize: 11, color: t.colors.textHint, marginTop: 4 },
    goalCircle: {
      width: 60, height: 60, borderRadius: 30,
      backgroundColor: t.colors.accent + '20',
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 2, borderColor: t.colors.accent,
    },
    goalPct:    { fontSize: 14, fontWeight: '900', color: t.colors.accent },
    goalPctSub: { fontSize: 8,  fontWeight: '700', color: t.colors.accent, letterSpacing: 1 },

    badgeList:  { gap: 8, marginBottom: 20 },

    diagBanner: { backgroundColor: '#78350F20', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#F59E0B40' },
    diagTitle:  { fontSize: 14, fontWeight: '700', color: '#F59E0B', marginBottom: 4 },
    diagSub:    { fontSize: 12, color: t.colors.textSub, lineHeight: 18 },
  })
}
