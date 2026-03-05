import React, { useEffect, useState, useCallback, useMemo } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, ActivityIndicator, RefreshControl, Dimensions,
  Alert as RNAlert, Modal as RNModal,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { supabase } from '../../src/lib/supabase'
import {
  createLeaderboardService,
  type LeaderboardEntry,
  type LeaderboardSort,
  type Challenge,
  type ChallengeType,
} from '@sprinta/api'
import { type AppTheme } from '../../src/theme'
import { useAppTheme } from '../../src/theme/useAppTheme'
import { useAuthStore } from '../../src/stores/authStore'

const lbService = createLeaderboardService(supabase)

const { width: W } = Dimensions.get('window')

type Tab = 'leaderboard' | 'challenges'
type LeaderboardSortKey = LeaderboardSort

const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }
// WhatsApp paleti — her sınav türü farklı yeşil/teal tonu
const EXAM_GRADIENT: Record<string, [string, string]> = {
  lgs:  ['#075E54', '#25D366'],
  tyt:  ['#0B141A', '#128C7E'],
  ayt:  ['#128C7E', '#25D366'],
  kpss: ['#1F2C34', '#25D366'],
  ales: ['#075E54', '#128C7E'],
  yds:  ['#0B141A', '#34B7F1'],
}

function buildSortOptions(t: AppTheme) {
  return [
    { key: 'xp'     as LeaderboardSortKey, label: 'Haftalık XP',  icon: '⭐', gradient: t.gradients.leaderboard as [string, string] },
    { key: 'arp'    as LeaderboardSortKey, label: 'En Yüksek ARP', icon: '⚡', gradient: t.gradients.attention   as [string, string] },
    { key: 'streak' as LeaderboardSortKey, label: 'En Uzun Seri',  icon: '🔥', gradient: t.gradients.streak      as [string, string] },
  ]
}

export default function SocialScreen() {
  const { student } = useAuthStore()
  const t           = useAppTheme()
  const s           = useMemo(() => ms(t), [t])
  const router      = useRouter()

  const SORT_OPTIONS = useMemo(() => buildSortOptions(t), [t])

  const [activeTab, setActiveTab] = useState<Tab>('leaderboard')
  const [sort, setSort]           = useState<LeaderboardSortKey>('xp')
  const [entries, setEntries]     = useState<LeaderboardEntry[]>([])
  const [myRank, setMyRank]       = useState<LeaderboardEntry | null>(null)
  const [loading, setLoading]     = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    const timer = setTimeout(() => { setLoading(false); setRefreshing(false) }, 4000)
    try {
      const [list, me] = await Promise.all([
        lbService.getLeaderboard(sort),
        student ? lbService.getMyRank(student.id) : Promise.resolve(null),
      ])
      clearTimeout(timer)
      setEntries(list)
      setMyRank(me)
    } catch {
      clearTimeout(timer)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [sort, student?.id])

  useEffect(() => { load() }, [load])

  const myPosition   = entries.findIndex((e) => e.student_id === student?.id) + 1
  const sortOption   = SORT_OPTIONS.find((o) => o.key === sort)!

  const getRankValue = (e: LeaderboardEntry) =>
    sort === 'xp'     ? `${e.weekly_xp.toLocaleString('tr')} XP` :
    sort === 'arp'    ? `${e.current_arp} ARP` : `${e.streak_days} gün 🔥`

  const top3 = entries.slice(0, 3)
  const rest  = entries.slice(3)

  return (
    <SafeAreaView style={s.root}>
      {/* ── Gradient Hero Header ── */}
      <LinearGradient
        colors={t.gradients.leaderboard as [string, string]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={s.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backTxt}>← Geri</Text>
        </TouchableOpacity>
        <View style={s.headerContent}>
          <Text style={s.headerTitle}>👥 Sosyal Arena</Text>
          <Text style={s.headerSub}>Rakiplerinle yarış · Sıralamaya gir · Kazan</Text>
        </View>

        {/* Sıralama / Meydan tab seçici */}
        <View style={s.tabRow}>
          {(['leaderboard', 'challenges'] as Tab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[s.tabBtn, activeTab === tab && s.tabBtnActive]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveTab(tab) }}
            >
              <Text style={[s.tabTxt, activeTab === tab && s.tabTxtActive]}>
                {tab === 'leaderboard' ? '🏆 Sıralama' : '⚔️ Meydan'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {activeTab === 'leaderboard' ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.scroll}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor="#fff" />
          }
        >
          {/* Sort pill selector */}
          <View style={s.sortRow}>
            {SORT_OPTIONS.map((o) => (
              <TouchableOpacity
                key={o.key}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSort(o.key) }}
                activeOpacity={0.85}
              >
                {sort === o.key ? (
                  <LinearGradient colors={o.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.sortPillActive}>
                    <Text style={s.sortPillIcon}>{o.icon}</Text>
                    <Text style={[s.sortPillTxt, { color: '#fff' }]}>{o.label}</Text>
                  </LinearGradient>
                ) : (
                  <View style={[s.sortPill, { backgroundColor: t.colors.surface, borderColor: t.colors.border }]}>
                    <Text style={s.sortPillIcon}>{o.icon}</Text>
                    <Text style={[s.sortPillTxt, { color: t.colors.textHint }]}>{o.label}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {loading ? (
            <View style={s.center}>
              <LinearGradient colors={sortOption.gradient} style={s.loadingCircle}>
                <ActivityIndicator size="large" color="#fff" />
              </LinearGradient>
              <Text style={[s.emptyTitle, { marginTop: 16 }]}>Yükleniyor…</Text>
            </View>
          ) : (
            <>
              {/* Podyum — Top 3 */}
              {top3.length >= 3 && (
                <View style={s.podiumWrap}>
                  {/* 2. sıra */}
                  <PodiumCol t={t} entry={top3[1]} rank={2} value={getRankValue(top3[1])} isMe={top3[1].student_id === student?.id} />
                  {/* 1. sıra — daha büyük */}
                  <PodiumCol t={t} entry={top3[0]} rank={1} value={getRankValue(top3[0])} isMe={top3[0].student_id === student?.id} tall />
                  {/* 3. sıra */}
                  <PodiumCol t={t} entry={top3[2]} rank={3} value={getRankValue(top3[2])} isMe={top3[2].student_id === student?.id} />
                </View>
              )}

              {/* Benim sıram */}
              {myRank && myPosition > 3 && (
                <LinearGradient colors={[t.colors.primary + '40', t.colors.accent + '40']} style={s.myRankCard}>
                  <Text style={s.myRankLabel}>📍 SENİN SIRAMAN</Text>
                  <View style={s.myRankRow}>
                    <Text style={s.myRankNum}>#{myPosition}</Text>
                    <Text style={s.myRankName}>{myRank.full_name}</Text>
                    <Text style={s.myRankVal}>{getRankValue(myRank)}</Text>
                  </View>
                </LinearGradient>
              )}

              {/* Geri kalanlar */}
              {rest.map((e, i) => {
                const rank = i + 4
                const isMe = e.student_id === student?.id
                const grad = EXAM_GRADIENT[e.exam_target] ?? ['#667eea', '#764ba2']
                return (
                  <View key={e.student_id} style={[s.row, isMe && s.rowMe]}>
                    <Text style={[s.rowRank, isMe && { color: t.colors.primary }]}>#{rank}</Text>
                    <LinearGradient colors={grad} style={s.avatar}>
                      <Text style={s.avatarTxt}>{e.full_name.charAt(0).toUpperCase()}</Text>
                    </LinearGradient>
                    <View style={s.rowInfo}>
                      <Text style={[s.rowName, isMe && { color: t.colors.primary }]}>
                        {e.full_name}{isMe ? ' 👋' : ''}
                      </Text>
                      <Text style={s.rowMeta}>{e.exam_target.toUpperCase()} · {e.streak_days} gün seri</Text>
                    </View>
                    <LinearGradient colors={sortOption.gradient} style={s.valPill}>
                      <Text style={s.valPillTxt}>{getRankValue(e)}</Text>
                    </LinearGradient>
                  </View>
                )
              })}

              {entries.length === 0 && (
                <View style={s.center}>
                  <Text style={{ fontSize: 56, marginBottom: 12 }}>🌟</Text>
                  <Text style={s.emptyTitle}>Henüz veri yok</Text>
                  <Text style={s.emptySub}>Bu hafta antrenman yapan öğrenciler burada görünecek.</Text>
                </View>
              )}
            </>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      ) : (
        <ChallengesView t={t} s={s} student={student} entries={entries} />
      )}
    </SafeAreaView>
  )
}

// ─── Podyum Kolonu ────────────────────────────────────────────────
function PodiumCol({ t, entry, rank, value, isMe, tall = false }: {
  t: AppTheme; entry: LeaderboardEntry; rank: number
  value: string; isMe: boolean; tall?: boolean
}) {
  const grad = EXAM_GRADIENT[entry.exam_target] ?? [t.colors.primary, t.colors.accent]
  const sz   = tall ? 64 : 52
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={{ fontSize: tall ? 36 : 28, marginBottom: 6 }}>{MEDAL[rank]}</Text>
      <LinearGradient
        colors={isMe ? [t.colors.primary, t.colors.accent] : grad}
        style={{
          width: sz, height: sz, borderRadius: sz / 2,
          alignItems: 'center', justifyContent: 'center', marginBottom: 6,
          borderWidth: isMe ? 3 : 0, borderColor: '#fff',
        }}
      >
        <Text style={{ fontSize: tall ? 26 : 20, fontWeight: '900', color: '#fff' }}>
          {entry.full_name.charAt(0).toUpperCase()}
        </Text>
      </LinearGradient>
      <Text style={{ fontSize: 12, fontWeight: '800', color: isMe ? t.colors.primary : t.colors.text, textAlign: 'center' }} numberOfLines={1}>
        {isMe ? 'Sen 👋' : entry.full_name.split(' ')[0]}
      </Text>
      <Text style={{ fontSize: 10, color: t.colors.textHint, textAlign: 'center', marginTop: 2 }}>{value}</Text>
    </View>
  )
}

// ─── Meydan Okuma ─────────────────────────────────────────────────
type Styles = ReturnType<typeof ms>

const CHALLENGE_TYPES: { key: ChallengeType; label: string; desc: string; icon: string }[] = [
  { key: 'weekly_xp', label: 'XP Yarışması',  desc: '7 günde kim daha fazla XP kazanır?',  icon: '⭐' },
  { key: 'arp_gain',  label: 'ARP Artışı',    desc: "Kim ARP'sini daha çok artırır?",       icon: '📈' },
  { key: 'streak',    label: 'Seri Yarışması', desc: 'Günlük seriyi kim daha uzun tutar?',  icon: '🔥' },
]

function fmtDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getDate().toString().padStart(2,'0')}.${(d.getMonth()+1).toString().padStart(2,'0')}`
}

function ChallengesView({ t, s, student, entries }: { t: AppTheme; s: Styles; student: any; entries: LeaderboardEntry[] }) {
  const [myChallenges,    setMyChallenges]    = useState<Challenge[]>([])
  const [loadingMine,     setLoadingMine]     = useState(true)
  const [modalOpponent,   setModalOpponent]   = useState<LeaderboardEntry | null>(null)
  const [selectedType,    setSelectedType]    = useState<ChallengeType>('weekly_xp')
  const [sending,         setSending]         = useState(false)

  // Kendi challenge'larını yükle
  useEffect(() => {
    if (!student?.id) return
    lbService.getMyChallenges(student.id)
      .then(setMyChallenges)
      .catch(() => {})
      .finally(() => setLoadingMine(false))
  }, [student?.id])

  const openModal = useCallback((entry: LeaderboardEntry) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setSelectedType('weekly_xp')
    setModalOpponent(entry)
  }, [])

  const sendChallenge = useCallback(async () => {
    if (!student?.id || !modalOpponent) return
    setSending(true)
    try {
      await lbService.sendChallenge({
        challengerId: student.id,
        opponentId:   modalOpponent.student_id,
        type:         selectedType,
      })
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      setModalOpponent(null)
      // Listeyi yenile
      const updated = await lbService.getMyChallenges(student.id)
      setMyChallenges(updated)
    } catch (e: any) {
      RNAlert.alert('Hata', e?.message ?? 'Meydan okuma gönderilemedi.')
    } finally {
      setSending(false)
    }
  }, [student?.id, modalOpponent, selectedType])

  const acceptOrDecline = useCallback(async (c: Challenge, accept: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    try {
      if (accept) await lbService.acceptChallenge(c.id)
      else        await lbService.declineChallenge(c.id)
      const updated = await lbService.getMyChallenges(student.id)
      setMyChallenges(updated)
    } catch { /* sessiz */ }
  }, [student?.id])

  const typeLabel: Record<ChallengeType, string> = {
    weekly_xp: 'XP Yarışması', arp_gain: 'ARP Artışı', streak: 'Seri',
  }

  return (
    <>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Nasıl çalışır */}
        <LinearGradient colors={t.gradients.leaderboard as [string, string]} style={s.howCard}>
          <Text style={s.howTitle}>⚔️ Meydan Okuma Nasıl Çalışır?</Text>
          <Text style={s.howText}>
            Sıralamada bir rakip seç, tür belirle ve 7 günlük rekabeti başlat.
            Kazanan +200 XP bonus alır!
          </Text>
        </LinearGradient>

        {/* Aktif / bekleyen challenge'larım */}
        {myChallenges.length > 0 && (
          <>
            <Text style={s.sectionTitle}>⚔️ Meydan Okumalarım</Text>
            {myChallenges.map((c) => {
              const isChallenger  = c.challenger_id === student?.id
              const otherName     = entries.find(e =>
                e.student_id === (isChallenger ? c.opponent_id : c.challenger_id)
              )?.full_name ?? '...'
              const isPending     = c.status === 'pending' && !isChallenger
              return (
                <View key={c.id} style={[s.opponentRow, { borderLeftWidth: 3, borderLeftColor:
                  c.status === 'active' ? '#10B981' : '#F59E0B',
                }]}>
                  <View style={s.rowInfo}>
                    <Text style={s.rowName}>{typeLabel[c.challenge_type as ChallengeType]} vs {otherName}</Text>
                    <Text style={s.rowMeta}>
                      {c.status === 'pending' ? '⏳ Bekliyor' : '🔴 Aktif'}
                      {c.ends_at ? ` · ${fmtDate(c.ends_at)}'de biter` : ''}
                    </Text>
                  </View>
                  {isPending && (
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      <TouchableOpacity
                        onPress={() => acceptOrDecline(c, true)}
                        style={[s.challengeBtn, { backgroundColor: '#10B981' }]}
                      >
                        <Text style={s.challengeBtnTxt}>Kabul</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => acceptOrDecline(c, false)}
                        style={[s.challengeBtn, { backgroundColor: '#EF4444' }]}
                      >
                        <Text style={s.challengeBtnTxt}>Reddet</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  {!isPending && c.status === 'active' && (
                    <View style={s.scorePair}>
                      <Text style={s.scoreMe}>{Math.round(isChallenger ? c.challenger_score : c.opponent_score)}</Text>
                      <Text style={[s.rowMeta, { color: t.colors.textHint }]}> vs </Text>
                      <Text style={s.scoreOpp}>{Math.round(isChallenger ? c.opponent_score : c.challenger_score)}</Text>
                    </View>
                  )}
                </View>
              )
            })}
          </>
        )}

        {/* Yarışma türleri */}
        <Text style={s.sectionTitle}>🎯 Yarışma Türleri</Text>
        <View style={s.challengeGrid}>
          {CHALLENGE_TYPES.map((c) => {
            const grad = c.key === 'weekly_xp'
              ? t.gradients.leaderboard : c.key === 'arp_gain'
              ? t.gradients.attention : t.gradients.streak
            return (
              <LinearGradient key={c.key} colors={grad as [string, string]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.ctCard}>
                <Text style={{ fontSize: 28, marginBottom: 8 }}>{c.icon}</Text>
                <Text style={s.ctLabel}>{c.label}</Text>
                <Text style={s.ctDesc}>{c.desc}</Text>
              </LinearGradient>
            )
          })}
        </View>

        {/* Rakip listesi */}
        <Text style={[s.sectionTitle, { marginTop: 8 }]}>👊 Rakip Seç</Text>
        {entries.filter((e) => e.student_id !== student?.id).slice(0, 8).map((e) => {
          const grad = EXAM_GRADIENT[e.exam_target] ?? [t.colors.primary, t.colors.accent]
          const hasActive = myChallenges.some(c =>
            (c.challenger_id === e.student_id || c.opponent_id === e.student_id)
            && ['pending','active'].includes(c.status)
          )
          return (
            <View key={e.student_id} style={s.opponentRow}>
              <LinearGradient colors={grad} style={s.avatar}>
                <Text style={s.avatarTxt}>{e.full_name.charAt(0).toUpperCase()}</Text>
              </LinearGradient>
              <View style={s.rowInfo}>
                <Text style={s.rowName}>{e.full_name}</Text>
                <Text style={s.rowMeta}>ARP {e.current_arp} · {e.streak_days} gün 🔥</Text>
              </View>
              <TouchableOpacity
                onPress={() => openModal(e)}
                disabled={hasActive}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={hasActive ? ['#9CA3AF','#9CA3AF'] : t.gradients.cta as [string, string]}
                  style={s.challengeBtn}
                >
                  <Text style={s.challengeBtnTxt}>{hasActive ? 'Aktif' : 'Meydan Oku'}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )
        })}

        {entries.length === 0 && (
          <View style={s.center}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>🤝</Text>
            <Text style={s.emptyTitle}>Rakip bulunamadı</Text>
            <Text style={s.emptySub}>Sıralama listesi yüklenince rakipler burada görünecek.</Text>
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Meydan Okuma Modal ── */}
      <RNModal
        visible={modalOpponent !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setModalOpponent(null)}
      >
        <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setModalOpponent(null)} />
        {modalOpponent && (
          <View style={s.modalSheet}>
            <View style={s.modalHandle} />
            <Text style={[s.sectionTitle, { marginHorizontal: 16 }]}>
              ⚔️ {modalOpponent.full_name}'e Meydan Oku
            </Text>
            <Text style={[s.rowMeta, { marginHorizontal: 16, marginBottom: 12 }]}>
              Yarışma türünü seç — 7 gün sürer, kazanan +200 XP alır
            </Text>
            {CHALLENGE_TYPES.map((ct) => (
              <TouchableOpacity
                key={ct.key}
                style={[s.typeRow, selectedType === ct.key && { borderColor: t.colors.primary, backgroundColor: t.colors.primary + '12' }]}
                onPress={() => setSelectedType(ct.key)}
              >
                <Text style={{ fontSize: 22 }}>{ct.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[s.rowName, { color: t.colors.text }]}>{ct.label}</Text>
                  <Text style={s.rowMeta}>{ct.desc}</Text>
                </View>
                {selectedType === ct.key && <Text style={{ color: t.colors.primary, fontWeight: '800' }}>✓</Text>}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[s.sendChallengeBtn, sending && { opacity: 0.6 }]}
              onPress={sendChallenge}
              disabled={sending}
            >
              <LinearGradient colors={t.gradients.cta as [string, string]} style={s.sendGradient}>
                <Text style={s.sendChallengeTxt}>
                  {sending ? 'Gönderiliyor…' : '⚔️ Meydan Oku!'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            <View style={{ height: 24 }} />
          </View>
        )}
      </RNModal>
    </>
  )
}

// ─── Stiller ─────────────────────────────────────────────────────
function ms(t: AppTheme) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: t.colors.background },

    header: { paddingBottom: 16 },
    backBtn: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
    backTxt: { fontSize: 14, color: 'rgba(255,255,255,0.85)' },
    headerContent: { paddingHorizontal: 20, paddingBottom: 14 },
    headerTitle: { fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
    headerSub:   { fontSize: 13, color: 'rgba(255,255,255,0.80)', marginTop: 3 },

    tabRow: { flexDirection: 'row', marginHorizontal: 20, gap: 8 },
    tabBtn: {
      flex: 1, paddingVertical: 9, borderRadius: 12, alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.15)',
      borderWidth: 1, borderColor: 'rgba(255,255,255,0.30)',
    },
    tabBtnActive: { backgroundColor: 'rgba(255,255,255,0.30)', borderColor: 'rgba(255,255,255,0.70)' },
    tabTxt:       { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.70)' },
    tabTxtActive: { color: '#fff' },

    scroll: { padding: 16, paddingBottom: 40 },
    center: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },

    loadingCircle: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },

    // Sort pills
    sortRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
    sortPill: {
      flexDirection: 'row', alignItems: 'center', gap: 5,
      paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999,
      borderWidth: 1,
    },
    sortPillActive: {
      flexDirection: 'row', alignItems: 'center', gap: 5,
      paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999,
    },
    sortPillIcon: { fontSize: 13 },
    sortPillTxt:  { fontSize: 12, fontWeight: '700' },

    // Podyum
    podiumWrap: {
      flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around',
      backgroundColor: t.colors.surface, borderRadius: 20, padding: 20,
      marginBottom: 16, borderWidth: 1, borderColor: t.colors.border,
      ...t.shadows.md,
    },

    // Benim sıram
    myRankCard: {
      borderRadius: 16, padding: 14, marginBottom: 12,
      borderWidth: 1, borderColor: t.colors.primary + '40',
    },
    myRankLabel: { fontSize: 10, fontWeight: '900', color: t.colors.primary, letterSpacing: 1.5, marginBottom: 6 },
    myRankRow:   { flexDirection: 'row', alignItems: 'center', gap: 10 },
    myRankNum:   { fontSize: 20, fontWeight: '900', color: t.colors.primary, width: 40 },
    myRankName:  { flex: 1, fontSize: 14, fontWeight: '700', color: t.colors.text },
    myRankVal:   { fontSize: 14, fontWeight: '800', color: t.colors.primary },

    // Liste satırı
    row: {
      flexDirection: 'row', alignItems: 'center', gap: 10,
      backgroundColor: t.colors.surface, borderRadius: 14, padding: 12, marginBottom: 8,
      borderWidth: 1, borderColor: t.colors.border,
    },
    rowMe: { borderColor: t.colors.primary + '60', backgroundColor: t.colors.primary + '08' },
    rowRank: { fontSize: 13, fontWeight: '800', color: t.colors.textHint, width: 28 },
    avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    avatarTxt: { fontSize: 16, fontWeight: '900', color: '#fff' },
    rowInfo: { flex: 1 },
    rowName: { fontSize: 14, fontWeight: '700', color: t.colors.text },
    rowMeta: { fontSize: 11, color: t.colors.textHint, marginTop: 1 },
    valPill: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
    valPillTxt: { fontSize: 11, fontWeight: '800', color: '#fff' },

    emptyTitle: { fontSize: 18, fontWeight: '800', color: t.colors.text, marginBottom: 6 },
    emptySub:   { fontSize: 13, color: t.colors.textSub, textAlign: 'center', lineHeight: 18, paddingHorizontal: 20 },

    sectionTitle: { fontSize: 15, fontWeight: '700', color: t.colors.text, marginBottom: 12 },

    // Meydan okuma
    howCard: { borderRadius: 20, padding: 18, marginBottom: 20 },
    howTitle: { fontSize: 16, fontWeight: '900', color: '#fff', marginBottom: 8 },
    howText:  { fontSize: 13, color: 'rgba(255,255,255,0.88)', lineHeight: 20 },

    challengeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
    ctCard:  { borderRadius: 16, padding: 14, width: (W - 42) / 2 },
    ctLabel: { fontSize: 13, fontWeight: '800', color: '#fff', marginBottom: 4 },
    ctDesc:  { fontSize: 11, color: 'rgba(255,255,255,0.80)', lineHeight: 15 },

    opponentRow: {
      flexDirection: 'row', alignItems: 'center', gap: 10,
      backgroundColor: t.colors.surface, borderRadius: 14, padding: 12, marginBottom: 8,
      borderWidth: 1, borderColor: t.colors.border,
    },
    challengeBtn: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
    challengeBtnTxt: { fontSize: 11, fontWeight: '800', color: '#fff' },

    // Skor gösterimi
    scorePair: { flexDirection: 'row', alignItems: 'center' },
    scoreMe:   { fontSize: 14, fontWeight: '900', color: t.colors.primary },
    scoreOpp:  { fontSize: 14, fontWeight: '900', color: '#EF4444' },

    // Meydan Okuma Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
    modalSheet: {
      backgroundColor: t.colors.surface,
      borderTopLeftRadius: 28, borderTopRightRadius: 28,
      paddingBottom: 40, maxHeight: '80%',
    },
    modalHandle: {
      width: 36, height: 4, backgroundColor: t.colors.divider,
      borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 16,
    },
    typeRow: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      marginHorizontal: 16, marginBottom: 10,
      padding: 14, borderRadius: 14,
      borderWidth: 1.5, borderColor: t.colors.border,
      backgroundColor: t.colors.background,
    },
    sendChallengeBtn: { marginHorizontal: 16, marginTop: 8 },
    sendGradient: {
      borderRadius: 14, paddingVertical: 18,
      alignItems: 'center',
    },
    sendChallengeTxt: { fontSize: 16, fontWeight: '900', color: '#fff' },
  })
}
