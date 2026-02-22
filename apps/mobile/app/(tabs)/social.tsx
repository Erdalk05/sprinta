import React, { useEffect, useState, useCallback, useMemo } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, ActivityIndicator, RefreshControl, Dimensions,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import { createClient } from '@supabase/supabase-js'
import {
  createLeaderboardService,
  type LeaderboardEntry,
  type LeaderboardSort,
} from '@sprinta/api'
import { type AppTheme } from '../../src/theme'
import { useAppTheme } from '../../src/theme/useAppTheme'
import { useAuthStore } from '../../src/stores/authStore'
import { GradientCard } from '../../src/components/ui/GradientCard'

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
)
const lbService = createLeaderboardService(supabase)

type Tab = 'leaderboard' | 'challenges'

const SORT_OPTIONS: { key: LeaderboardSort; label: string; icon: string; color: string }[] = [
  { key: 'xp',     label: 'XP',    icon: '⭐', color: '#25D366' },
  { key: 'arp',    label: 'ARP',   icon: '⚡', color: '#F59E0B' },
  { key: 'streak', label: 'Seri',  icon: '🔥', color: '#EF4444' },
]

const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

const EXAM_COLOR: Record<string, string> = {
  lgs: '#6C3EE8', tyt: '#0EA5E9', ayt: '#10B981',
  kpss: '#F59E0B', ales: '#EF4444', yds: '#8B5CF6',
}

export default function SocialScreen() {
  const { student } = useAuthStore()
  const t           = useAppTheme()
  const s           = useMemo(() => ms(t), [t])

  const [activeTab, setActiveTab] = useState<Tab>('leaderboard')
  const [sort, setSort]           = useState<LeaderboardSort>('xp')
  const [entries, setEntries]     = useState<LeaderboardEntry[]>([])
  const [myRank, setMyRank]       = useState<LeaderboardEntry | null>(null)
  const [loading, setLoading]     = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const [list, me] = await Promise.all([
        lbService.getLeaderboard(sort),
        student ? lbService.getMyRank(student.id) : Promise.resolve(null),
      ])
      setEntries(list)
      setMyRank(me)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [sort, student?.id])

  useEffect(() => { load() }, [load])

  const sortLabel    = SORT_OPTIONS.find((o) => o.key === sort)!
  const myPosition   = entries.findIndex((e) => e.student_id === student?.id) + 1

  return (
    <SafeAreaView style={s.root}>
      <View style={s.topBar}>
        <Text style={s.topTitle}>Sosyal</Text>
        <View style={s.tabRow}>
          <TouchableOpacity
            style={[s.tabBtn, activeTab === 'leaderboard' && s.tabBtnActive]}
            onPress={() => setActiveTab('leaderboard')}
          >
            <Text style={[s.tabTxt, activeTab === 'leaderboard' && s.tabTxtActive]}>🏆 Sıralama</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.tabBtn, activeTab === 'challenges' && s.tabBtnActive]}
            onPress={() => setActiveTab('challenges')}
          >
            <Text style={[s.tabTxt, activeTab === 'challenges' && s.tabTxtActive]}>⚔️ Meydan</Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === 'leaderboard' ? (
        <LeaderboardView t={t} s={s}
          entries={entries} myRank={myRank} myId={student?.id}
          sort={sort} sortLabel={sortLabel} loading={loading}
          refreshing={refreshing} onRefresh={() => load(true)}
          onSort={(sv) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSort(sv) }}
          myPosition={myPosition}
        />
      ) : (
        <ChallengesView t={t} s={s} student={student} entries={entries} />
      )}
    </SafeAreaView>
  )
}

// ─── Liderlik Tablosu ─────────────────────────────────────────────

type Styles = ReturnType<typeof ms>

function LeaderboardView({
  t, s, entries, myRank, myId, sort, sortLabel, loading,
  refreshing, onRefresh, onSort, myPosition,
}: {
  t: AppTheme; s: Styles
  entries: LeaderboardEntry[]
  myRank: LeaderboardEntry | null
  myId?: string
  sort: LeaderboardSort
  sortLabel: (typeof SORT_OPTIONS)[0]
  loading: boolean; refreshing: boolean
  onRefresh: () => void
  onSort: (s: LeaderboardSort) => void
  myPosition: number
}) {
  const getRankValue = (e: LeaderboardEntry) =>
    sort === 'xp'     ? `${e.weekly_xp} XP` :
    sort === 'arp'    ? `ARP ${e.current_arp}` : `${e.streak_days} gün 🔥`

  const top3 = entries.slice(0, 3)
  const rest  = entries.slice(3)

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={s.scroll}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.colors.primary} />}
    >
      <View style={s.sortRow}>
        {SORT_OPTIONS.map((o) => (
          <TouchableOpacity
            key={o.key}
            style={[s.sortBtn, sort === o.key && { backgroundColor: o.color + '25', borderColor: o.color }]}
            onPress={() => onSort(o.key)}
          >
            <Text style={s.sortIcon}>{o.icon}</Text>
            <Text style={[s.sortTxt, sort === o.key && { color: o.color }]}>{o.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={s.center}><ActivityIndicator size="large" color={t.colors.primary} /></View>
      ) : (
        <>
          {top3.length >= 3 && (
            <GradientCard colors={[t.colors.primary + '30', t.colors.surface]} style={s.podiumCard}>
              <Text style={s.podiumTitle}>{sortLabel.icon} Bu Haftanın Liderleri</Text>
              <View style={s.podium}>
                <PodiumCol t={t} entry={top3[1]} rank={2} valueLabel={getRankValue(top3[1])} isMe={top3[1].student_id === myId} />
                <PodiumCol t={t} entry={top3[0]} rank={1} valueLabel={getRankValue(top3[0])} isMe={top3[0].student_id === myId} tall />
                <PodiumCol t={t} entry={top3[2]} rank={3} valueLabel={getRankValue(top3[2])} isMe={top3[2].student_id === myId} />
              </View>
            </GradientCard>
          )}

          {myRank && myPosition > 3 && (
            <View style={s.myRankBanner}>
              <Text style={s.myRankLabel}>Senin Sıralaman</Text>
              <View style={s.myRankRow}>
                <Text style={s.myRankNum}>#{myPosition}</Text>
                <Text style={s.myRankName}>{myRank.full_name}</Text>
                <Text style={[s.myRankVal, { color: sortLabel.color }]}>{getRankValue(myRank)}</Text>
              </View>
            </View>
          )}

          {rest.map((e, i) => {
            const rank = i + 4
            const isMe = e.student_id === myId
            const examColor = EXAM_COLOR[e.exam_target] ?? t.colors.primary
            return (
              <View key={e.student_id} style={[s.row, isMe && s.rowMe]}>
                <Text style={[s.rowRank, isMe && { color: t.colors.accent }]}>#{rank}</Text>
                <View style={[s.avatar, { backgroundColor: examColor + '30' }]}>
                  <Text style={s.avatarTxt}>{e.full_name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={s.rowInfo}>
                  <Text style={[s.rowName, isMe && { color: t.colors.accent }]}>
                    {e.full_name}{isMe ? ' (Sen)' : ''}
                  </Text>
                  <Text style={s.rowMeta}>{e.exam_target.toUpperCase()} · {e.streak_days} gün seri</Text>
                </View>
                <Text style={[s.rowVal, { color: sortLabel.color }]}>{getRankValue(e)}</Text>
              </View>
            )
          })}

          {entries.length === 0 && (
            <View style={s.center}>
              <Text style={s.emptyEmoji}>🌟</Text>
              <Text style={s.emptyTitle}>Henüz veri yok</Text>
              <Text style={s.emptySub}>Bu hafta antrenman yapan öğrenciler burada görünecek.</Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  )
}

function PodiumCol({
  t, entry, rank, valueLabel, isMe, tall = false,
}: {
  t: AppTheme
  entry: LeaderboardEntry
  rank: number; valueLabel: string; isMe: boolean; tall?: boolean
}) {
  const examColor = EXAM_COLOR[entry.exam_target] ?? t.colors.primary
  return (
    <View style={{ alignItems: 'center', flex: 1, ...(tall ? { paddingBottom: 8 } : {}) }}>
      <Text style={{ fontSize: 28, marginBottom: 6 }}>{MEDAL[rank]}</Text>
      <View style={{
        width: 52, height: 52, borderRadius: 26,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 2, marginBottom: 6,
        backgroundColor: examColor + '40', borderColor: examColor,
      }}>
        <Text style={{ fontSize: 20, fontWeight: '800', color: examColor }}>
          {entry.full_name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <Text style={{ fontSize: 12, fontWeight: '700', color: isMe ? t.colors.accent : t.colors.text, textAlign: 'center' }} numberOfLines={1}>
        {isMe ? 'Sen' : entry.full_name.split(' ')[0]}
      </Text>
      <Text style={{ fontSize: 11, color: t.colors.textHint, marginTop: 2, textAlign: 'center' }}>{valueLabel}</Text>
    </View>
  )
}

function ChallengesView({ t, s, student, entries }: { t: AppTheme; s: Styles; student: any; entries: LeaderboardEntry[] }) {
  const CHALLENGE_TYPES = [
    { key: 'weekly_xp', label: '⭐ XP Yarışması',  desc: '7 günde kim daha fazla XP kazanır?' },
    { key: 'arp_gain',  label: '📈 ARP Artışı',    desc: "Kim ARP'sini daha çok artırır?" },
    { key: 'streak',    label: '🔥 Seri Yarışması', desc: 'Günlük seriyi kim daha uzun tutar?' },
  ]

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      <GradientCard colors={[t.colors.accent + '20', t.colors.surface]} style={s.howCard}>
        <Text style={s.howTitle}>⚔️ Meydan Okuma Nasıl Çalışır?</Text>
        <Text style={s.howText}>
          Sıralamada gördüğün bir öğrenciyi seç, 7 günlük rekabet başlatsın.
          Süre sonunda daha yüksek puan alan kazanır ve XP bonusu alır.
        </Text>
      </GradientCard>

      <Text style={s.sectionTitle}>Yarışma Türleri</Text>
      {CHALLENGE_TYPES.map((ct) => (
        <View key={ct.key} style={s.ctCard}>
          <Text style={s.ctLabel}>{ct.label}</Text>
          <Text style={s.ctDesc}>{ct.desc}</Text>
        </View>
      ))}

      <Text style={[s.sectionTitle, { marginTop: 8 }]}>Sıralamadan Rakip Seç</Text>
      {entries.filter((e) => e.student_id !== student?.id).slice(0, 8).map((e) => {
        const examColor = EXAM_COLOR[e.exam_target] ?? t.colors.primary
        return (
          <View key={e.student_id} style={s.opponentRow}>
            <View style={[s.avatar, { backgroundColor: examColor + '30' }]}>
              <Text style={s.avatarTxt}>{e.full_name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={s.rowInfo}>
              <Text style={s.rowName}>{e.full_name}</Text>
              <Text style={s.rowMeta}>ARP {e.current_arp} · {e.streak_days} gün seri</Text>
            </View>
            <TouchableOpacity
              style={s.challengeBtn}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
            >
              <Text style={s.challengeBtnTxt}>Meydan Oku</Text>
            </TouchableOpacity>
          </View>
        )
      })}

      {entries.length === 0 && (
        <View style={s.center}>
          <Text style={s.emptyEmoji}>🤝</Text>
          <Text style={s.emptyTitle}>Rakip bulunamadı</Text>
          <Text style={s.emptySub}>Sıralama listesi yüklenince rakiplerin burada görünecek.</Text>
        </View>
      )}
      <View style={{ height: 32 }} />
    </ScrollView>
  )
}

// ─── Styles ──────────────────────────────────────────────────────

function ms(t: AppTheme) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: t.colors.background },
    topBar: {
      paddingHorizontal: 20, paddingVertical: 12,
      borderBottomWidth: 1, borderBottomColor: t.colors.divider,
      backgroundColor: t.colors.panel,
    },
    topTitle: { fontSize: 20, fontWeight: '900', color: '#FFFFFF', marginBottom: 10 },
    tabRow: { flexDirection: 'row', gap: 8 },
    tabBtn: {
      flex: 1, paddingVertical: 8, borderRadius: 999,
      alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)',
      borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
    },
    tabBtnActive: { backgroundColor: t.colors.primary + '30', borderColor: t.colors.primary },
    tabTxt:       { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.7)' },
    tabTxtActive: { color: '#FFFFFF' },

    scroll: { padding: 16, paddingBottom: 40 },
    center: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },

    sortRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    sortBtn: {
      flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
      paddingVertical: 8, borderRadius: 999,
      backgroundColor: t.colors.surface, borderWidth: 1, borderColor: t.colors.border,
    },
    sortIcon: { fontSize: 14 },
    sortTxt:  { fontSize: 13, fontWeight: '700', color: t.colors.textHint },

    podiumCard:  { marginBottom: 16 },
    podiumTitle: { fontSize: 14, fontWeight: '700', color: t.colors.text, marginBottom: 16, textAlign: 'center' },
    podium:      { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end' },

    myRankBanner: {
      backgroundColor: t.colors.accent + '15',
      borderRadius: 16, padding: 12, marginBottom: 12,
      borderWidth: 1, borderColor: t.colors.accent + '40',
    },
    myRankLabel: { fontSize: 10, fontWeight: '700', color: t.colors.accent, letterSpacing: 1, marginBottom: 4 },
    myRankRow:   { flexDirection: 'row', alignItems: 'center', gap: 10 },
    myRankNum:   { fontSize: 18, fontWeight: '900', color: t.colors.accent, width: 36 },
    myRankName:  { flex: 1, fontSize: 14, fontWeight: '700', color: t.colors.text },
    myRankVal:   { fontSize: 14, fontWeight: '800' },

    row: {
      flexDirection: 'row', alignItems: 'center', gap: 10,
      backgroundColor: t.colors.surface, borderRadius: 12, padding: 12, marginBottom: 6,
      borderWidth: 1, borderColor: t.colors.border,
    },
    rowMe:    { borderColor: t.colors.accent + '60', backgroundColor: t.colors.accent + '08' },
    rowRank:  { fontSize: 13, fontWeight: '800', color: t.colors.textHint, width: 30 },
    avatar:   { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    avatarTxt:{ fontSize: 16, fontWeight: '800', color: t.colors.text },
    rowInfo:  { flex: 1 },
    rowName:  { fontSize: 14, fontWeight: '700', color: t.colors.text },
    rowMeta:  { fontSize: 11, color: t.colors.textHint, marginTop: 1 },
    rowVal:   { fontSize: 14, fontWeight: '800' },

    emptyEmoji: { fontSize: 48, marginBottom: 12 },
    emptyTitle: { fontSize: 18, fontWeight: '800', color: t.colors.text, marginBottom: 6 },
    emptySub:   { fontSize: 13, color: t.colors.textSub, textAlign: 'center', lineHeight: 18 },

    sectionTitle: { fontSize: 15, fontWeight: '700', color: t.colors.text, marginBottom: 10 },

    howCard:  { marginBottom: 20 },
    howTitle: { fontSize: 15, fontWeight: '800', color: t.colors.text, marginBottom: 8 },
    howText:  { fontSize: 13, color: t.colors.textSub, lineHeight: 20 },

    ctCard:  { backgroundColor: t.colors.surface, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: t.colors.border },
    ctLabel: { fontSize: 14, fontWeight: '700', color: t.colors.text, marginBottom: 3 },
    ctDesc:  { fontSize: 12, color: t.colors.textHint },

    opponentRow: {
      flexDirection: 'row', alignItems: 'center', gap: 10,
      backgroundColor: t.colors.surface, borderRadius: 12, padding: 12, marginBottom: 8,
      borderWidth: 1, borderColor: t.colors.border,
    },
    challengeBtn: {
      backgroundColor: t.colors.primary + '25', borderRadius: 999,
      paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: t.colors.primary,
    },
    challengeBtnTxt: { fontSize: 11, fontWeight: '700', color: t.colors.primaryLight },
  })
}
