import { usePendingSheetStore } from '../stores/pendingSheetStore'
// =====================================================================
// SpeedCampScreen.tsx — Sprint 11
// Hızlı Okuma Kampı — Kişiselleştirilmiş Antrenman Merkezi
//
// Bölümler:
//   1. Hero: Anlık WPM + Göz Genişliği seviyesi
//   2. Bugünün Devresi: 3 önerilen egzersiz
//   3. WPM Trendi: 7 günlük çubuk grafik (Svg)
//   4. Teknik Rehber: her teknik hakkında kısa açıklama
// =====================================================================

import React, { useState, useCallback, useMemo, useEffect } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, SafeAreaView,
} from 'react-native'
import Svg, { Rect, Text as SvgText } from 'react-native-svg'
import { useRouter } from 'expo-router'
import { supabase } from '../lib/supabase'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useAppTheme } from '../theme/useAppTheme'
import type { AppTheme } from '../theme'

// ─── Supabase ────────────────────────────────────────────────────

// ─── Günlük devrenin 3 egzersizi ────────────────────────────────

interface CircuitItem {
  emoji:    string
  title:    string
  desc:     string
  route:    string
  color:    string
  duration: string
}

const CIRCUIT_ROTATIONS: CircuitItem[][] = [
  [
    { emoji: '👁️', title: 'Göz Genişliği',  desc: 'Flash kelime grupları — göz alanını genişlet', route: '/exercise/fixation-trainer', color: '#D97706', duration: '5 dk' },
    { emoji: '⚡', title: 'Chunk RSVP',      desc: 'Kelime gruplarını yüksek hızda oku',           route: '/exercise/chunk-rsvp',       color: '#3B82F6', duration: '8 dk' },
    { emoji: '📚', title: 'Anlayarak Oku',   desc: 'Kütüphane metni + anlama soruları',            route: '/calis',                      color: '#10B981', duration: '10 dk' },
  ],
  [
    { emoji: '🌊', title: 'Akış Okuma',      desc: 'Satır pacing — geri dönme engelleyici',        route: '/exercise/flow-reading',     color: '#8B5CF6', duration: '8 dk' },
    { emoji: '👁️', title: 'Göz Genişliği',  desc: '3 tur flash antrenmanı — span artır',          route: '/exercise/fixation-trainer', color: '#D97706', duration: '5 dk' },
    { emoji: '🎯', title: 'Akademik Mod',    desc: 'Yoğun metinleri yavaş ve derin oku',           route: '/exercise/academic-mode',    color: '#EC4899', duration: '10 dk' },
  ],
  [
    { emoji: '⏱️', title: 'Zamanlı Sprint',  desc: 'Süre baskısıyla hız kaydı kır',               route: '/exercise/timed-reading',    color: '#EF4444', duration: '6 dk' },
    { emoji: '🧠', title: 'Hafıza Sabiti',   desc: 'Spaced repetition ile kalıcı öğrenme',         route: '/exercise/memory-anchor',    color: '#06B6D4', duration: '7 dk' },
    { emoji: '👁️', title: 'Göz Genişliği',  desc: 'Günlük flash antrenmanı — rutin oluştur',      route: '/exercise/fixation-trainer', color: '#D97706', duration: '5 dk' },
  ],
]

// ─── WPM Trendi ─────────────────────────────────────────────────

interface WPMBar {
  day:   string
  wpm:   number
  today: boolean
}

const DAY_LABELS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']

function WPMChart({ bars, color }: { bars: WPMBar[]; color: string }) {
  const W  = 280
  const H  = 80
  const BW = 28
  const GAP = 8
  const maxWpm = Math.max(...bars.map(b => b.wpm), 100)

  return (
    <Svg width={W} height={H + 20}>
      {bars.map((b, i) => {
        const x    = i * (BW + GAP) + 4
        const barH = b.wpm > 0 ? Math.max(4, Math.round((b.wpm / maxWpm) * H)) : 4
        const y    = H - barH
        return (
          <React.Fragment key={i}>
            <Rect
              x={x} y={y} width={BW} height={barH}
              rx={4}
              fill={b.today ? color : color + '55'}
            />
            {b.wpm > 0 && (
              <SvgText
                x={x + BW / 2} y={y - 4}
                fontSize={9} fontWeight="700"
                fill={b.today ? color : color + '88'}
                textAnchor="middle"
              >
                {b.wpm}
              </SvgText>
            )}
            <SvgText
              x={x + BW / 2} y={H + 14}
              fontSize={9} fontWeight="600"
              fill={b.today ? '#FFFFFF' : 'rgba(150,150,150,0.70)'}
              textAnchor="middle"
            >
              {b.day}
            </SvgText>
          </React.Fragment>
        )
      })}
    </Svg>
  )
}

// ─── Teknik Kart ─────────────────────────────────────────────────

interface TechCardProps {
  emoji: string
  title: string
  desc:  string
  color: string
  s:     ReturnType<typeof createStyles>
}

function TechCard({ emoji, title, desc, color, s }: TechCardProps) {
  return (
    <View style={[s.techCard, { borderLeftColor: color }]}>
      <Text style={{ fontSize: 24 }}>{emoji}</Text>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={s.techTitle}>{title}</Text>
        <Text style={s.techDesc}>{desc}</Text>
      </View>
    </View>
  )
}

// ─── Ana Bileşen ─────────────────────────────────────────────────

export default function SpeedCampScreen() {
  const t      = useAppTheme()
  const s      = useMemo(() => createStyles(t), [t])
  const router = useRouter()

  const [wpmBars,   setWpmBars]   = useState<WPMBar[]>([])
  const [avgWpm,    setAvgWpm]    = useState(0)
  const [spanLevel, setSpanLevel] = useState(1)
  const [streak,    setStreak]    = useState(0)
  const [totalXp,   setTotalXp]   = useState(0)
  const [loading,   setLoading]   = useState(true)
  const [dayOfWeek, setDayOfWeek] = useState(0)

  const todayCircuit = CIRCUIT_ROTATIONS[dayOfWeek % CIRCUIT_ROTATIONS.length]

  const loadData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const now = new Date()
      const dow = (now.getDay() + 6) % 7   // 0 = Pzt … 6 = Paz
      setDayOfWeek(dow)

      // Son 7 günlük WPM
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const { data: sessions } = await (supabase as any)
        .from('sessions')
        .select('created_at, metrics')
        .eq('student_id', user.id)
        .gte('created_at', since)
        .order('created_at', { ascending: true })

      const dayMap: Record<number, number[]> = {}
      if (Array.isArray(sessions)) {
        sessions.forEach((sess: { created_at: string; metrics: unknown }) => {
          const d      = new Date(sess.created_at)
          const dayIdx = (d.getDay() + 6) % 7
          const wpm    = (sess.metrics as { wpm?: number })?.wpm ?? 0
          if (wpm > 50) {
            if (!dayMap[dayIdx]) dayMap[dayIdx] = []
            dayMap[dayIdx].push(wpm)
          }
        })
      }

      const bars: WPMBar[] = DAY_LABELS.map((label, i) => ({
        day:   label,
        wpm:   dayMap[i] ? Math.round(dayMap[i].reduce((a, b) => a + b, 0) / dayMap[i].length) : 0,
        today: i === dow,
      }))
      setWpmBars(bars)

      const allWpms = bars.filter(b => b.wpm > 0).map(b => b.wpm)
      if (allWpms.length > 0) {
        setAvgWpm(Math.round(allWpms.reduce((a, b) => a + b, 0) / allWpms.length))
      }

      // Span seviyesi AsyncStorage'dan
      const storedSpan = await AsyncStorage.getItem(`fixation_span_${user.id}`)
      if (storedSpan) setSpanLevel(Math.max(1, Math.min(5, parseInt(storedSpan, 10))))

      // XP + streak (students tablosundan)
      const { data: student } = await (supabase as any)
        .from('students')
        .select('total_xp, streak_days')
        .eq('auth_user_id', user.id)
        .single()
      if (student) {
        setTotalXp((student as { total_xp?: number }).total_xp ?? 0)
        setStreak((student as { streak_days?: number }).streak_days ?? 0)
      }
    } catch {
      // sessiz hata
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const accentColor = '#D97706'

  return (
    <SafeAreaView style={s.root}>
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Başlık ────────────────────────────────────── */}
        <View style={s.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.campTitle}>🏕️ Hızlı Okuma Kampı</Text>
            <Text style={s.campSub}>Kişiselleştirilmiş antrenman programı</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {streak > 0 && (
              <View style={s.streakBadge}>
                <Text style={s.streakFire}>🔥</Text>
                <Text style={s.streakNum}>{streak}</Text>
              </View>
            )}
            <TouchableOpacity onPress={() => (usePendingSheetStore.getState().setPendingSheet('okuma'), router.back())}
              hitSlop={{ top:10, bottom:10, left:10, right:10 }}
              style={{ width:36, height:36, borderRadius:18,
                backgroundColor: t.colors.surface, borderWidth:1, borderColor: t.colors.border,
                alignItems:'center', justifyContent:'center' }}>
              <Text style={{ fontSize:17, color: t.colors.textHint, fontWeight:'700' }}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Hero: WPM + Göz Seviyesi ─────────────────── */}
        <View style={s.heroCard}>
          <View style={s.heroLeft}>
            <Text style={s.heroLabel}>Ortalama Hız</Text>
            <Text style={s.heroWpm}>{loading ? '---' : (avgWpm > 0 ? avgWpm : '?')}</Text>
            <Text style={s.heroUnit}>kelime/dk</Text>
          </View>
          <View style={s.heroDivider} />
          <View style={s.heroRight}>
            <Text style={s.heroLabel}>Göz Genişliği</Text>
            <Text style={[s.heroSpan, { color: accentColor }]}>Seviye {spanLevel}</Text>
            <TouchableOpacity
              style={[s.trainBtn, { backgroundColor: accentColor }]}
              onPress={() => router.push('/exercise/fixation-trainer' as any)}
              activeOpacity={0.8}
            >
              <Text style={s.trainBtnTxt}>Antrenman Yap</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Bugünün Devresi ──────────────────────────── */}
        <Text style={s.sectionTitle}>⚡ Bugünün Devresi</Text>
        <Text style={s.sectionSub}>3 egzersiz · ~23 dakika</Text>

        {todayCircuit.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={[s.circuitCard, { borderLeftColor: item.color }]}
            onPress={() => router.push(item.route as any)}
            activeOpacity={0.8}
          >
            <View style={[s.circuitNum, { backgroundColor: item.color + '20' }]}>
              <Text style={[s.circuitNumTxt, { color: item.color }]}>{i + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.circuitTitle}>{item.emoji} {item.title}</Text>
              <Text style={s.circuitDesc}>{item.desc}</Text>
            </View>
            <Text style={[s.circuitDur, { color: item.color }]}>{item.duration}</Text>
          </TouchableOpacity>
        ))}

        {/* ── 7 Günlük WPM Trendi ─────────────────────── */}
        <Text style={[s.sectionTitle, { marginTop: 24 }]}>📈 7 Günlük WPM Trendi</Text>

        <View style={s.chartCard}>
          {wpmBars.length === 7 ? (
            <WPMChart bars={wpmBars} color={accentColor} />
          ) : (
            <Text style={{ color: t.colors.textHint, fontSize: t.font.sm }}>
              Veri yükleniyor…
            </Text>
          )}
          {avgWpm > 0 && (
            <Text style={[s.chartAvg, { color: accentColor }]}>
              7 gün ortalaması: {avgWpm} WPM
            </Text>
          )}
        </View>

        {/* ── XP istatistiği ───────────────────────────── */}
        {(totalXp > 0 || streak > 0) && (
          <View style={s.xpRow}>
            <View style={s.xpBox}>
              <Text style={[s.xpVal, { color: '#F59E0B' }]}>{totalXp.toLocaleString('tr-TR')}</Text>
              <Text style={s.xpKey}>Toplam XP</Text>
            </View>
            <View style={s.xpBox}>
              <Text style={[s.xpVal, { color: accentColor }]}>{spanLevel}</Text>
              <Text style={s.xpKey}>Göz Seviyesi</Text>
            </View>
            <View style={s.xpBox}>
              <Text style={[s.xpVal, { color: '#10B981' }]}>{streak}</Text>
              <Text style={s.xpKey}>Gün Serisi</Text>
            </View>
          </View>
        )}

        {/* ── Teknik Rehber ────────────────────────────── */}
        <Text style={[s.sectionTitle, { marginTop: 24 }]}>🧠 Teknik Rehber</Text>

        <TechCard
          emoji="👁️" color="#D97706" s={s}
          title="Göz Genişliği (Fixation Span)"
          desc="Ortalama okuyucu 1.1 kelime/fiksasyon yapar. Bu antrenman ile 3-5 kelimeye çıkabilirsin. %67 hız artışı."
        />
        <TechCard
          emoji="⚡" color="#3B82F6" s={s}
          title="RSVP (Rapid Serial Visual Presentation)"
          desc="Tek nokta odağı ile kelimeler flash olarak geçer. Göz hareketi sıfıra iner. Dünya rekoru: 2000+ WPM."
        />
        <TechCard
          emoji="🌊" color="#8B5CF6" s={s}
          title="Pacing (Satır Yönlendirme)"
          desc="Göz hareketini düzenli tutan bir rehber çizgi. Regresyon (%25 zaman kaybı) tamamen önlenir."
        />
        <TechCard
          emoji="🧠" color="#10B981" s={s}
          title="Chunking (Kelime Gruplama)"
          desc="Beyin bireysel kelimeleri değil anlamlı grupları işler. 3-4 kelimelik gruplar optimal anlama sağlar."
        />

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

// ─── Stiller ──────────────────────────────────────────────────────
function createStyles(t: AppTheme) {
  return StyleSheet.create({
    root: {
      flex:            1,
      backgroundColor: t.colors.background,
    },
    scroll: {
      paddingHorizontal: 20,
      paddingTop:        16,
      gap:               12,
    },
    headerRow: {
      flexDirection:  'row',
      justifyContent: 'space-between',
      alignItems:     'flex-start',
    },
    campTitle: {
      fontSize:   22,
      fontWeight: '900',
      color:      t.colors.text,
    },
    campSub: {
      fontSize:  t.font.sm,
      color:     t.colors.textHint,
      marginTop: 2,
    },
    streakBadge: {
      flexDirection:     'row',
      alignItems:        'center',
      gap:               4,
      backgroundColor:   '#F59E0B20',
      borderRadius:      20,
      paddingHorizontal: 12,
      paddingVertical:   6,
    },
    streakFire: { fontSize: 18 },
    streakNum: {
      fontSize:   16,
      fontWeight: '900',
      color:      '#F59E0B',
    },
    heroCard: {
      flexDirection:   'row',
      backgroundColor: t.colors.surface,
      borderRadius:    t.radius.xl,
      padding:         20,
      gap:             16,
      alignItems:      'center',
    },
    heroLeft:  { flex: 1, alignItems: 'center', gap: 2 },
    heroLabel: { fontSize: t.font.xs, color: t.colors.textHint, fontWeight: '700' },
    heroWpm:   { fontSize: 42, fontWeight: '900', color: t.colors.text, lineHeight: 48 },
    heroUnit:  { fontSize: t.font.xs, color: t.colors.textHint },
    heroDivider: { width: 1, height: 80, backgroundColor: t.colors.border },
    heroRight: { flex: 1, alignItems: 'center', gap: 4 },
    heroSpan:  { fontSize: 28, fontWeight: '900', lineHeight: 34 },
    trainBtn: {
      marginTop:         8,
      borderRadius:      20,
      paddingHorizontal: 16,
      paddingVertical:   8,
    },
    trainBtnTxt: { fontSize: t.font.xs, fontWeight: '800', color: '#fff' },
    sectionTitle: {
      fontSize:   t.font.md,
      fontWeight: '900',
      color:      t.colors.text,
      marginTop:  8,
    },
    sectionSub: { fontSize: t.font.xs, color: t.colors.textHint, marginTop: -8 },
    circuitCard: {
      flexDirection:   'row',
      alignItems:      'center',
      gap:             12,
      backgroundColor: t.colors.surface,
      borderRadius:    t.radius.md,
      padding:         14,
      borderLeftWidth: 4,
    },
    circuitNum: {
      width:          32,
      height:         32,
      borderRadius:   16,
      alignItems:     'center',
      justifyContent: 'center',
      flexShrink:     0,
    },
    circuitNumTxt: { fontSize: t.font.sm, fontWeight: '900' },
    circuitTitle:  { fontSize: t.font.sm, fontWeight: '800', color: t.colors.text },
    circuitDesc:   { fontSize: t.font.xs, color: t.colors.textHint, marginTop: 2 },
    circuitDur:    { fontSize: t.font.xs, fontWeight: '800' },
    chartCard: {
      backgroundColor: t.colors.surface,
      borderRadius:    t.radius.lg,
      padding:         16,
      alignItems:      'center',
      gap:             8,
    },
    chartAvg: { fontSize: t.font.xs, fontWeight: '700' },
    xpRow:    { flexDirection: 'row', gap: 10 },
    xpBox: {
      flex:            1,
      backgroundColor: t.colors.surface,
      borderRadius:    t.radius.md,
      padding:         12,
      alignItems:      'center',
      gap:             2,
    },
    xpVal: { fontSize: 18, fontWeight: '900' },
    xpKey: { fontSize: t.font.xs, color: t.colors.textHint, fontWeight: '600' },
    techCard: {
      flexDirection:   'row',
      gap:             12,
      alignItems:      'flex-start',
      backgroundColor: t.colors.surface,
      borderRadius:    t.radius.md,
      padding:         14,
      borderLeftWidth: 3,
    },
    techTitle: { fontSize: t.font.sm, fontWeight: '800', color: t.colors.text },
    techDesc: {
      fontSize:  t.font.xs,
      color:     t.colors.textHint,
      lineHeight: 18,
      marginTop:  2,
    },
  })
}
