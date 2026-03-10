/**
 * SubjectProgressScreen — Ders Bazlı Performans
 * - Her ders için doğru/yanlış/net analizi
 * - SRS: Bugün tekrar bekleyen soru sayısı
 * - Eksik konular & güçlü alanlar
 */
import React, { useState, useEffect, useMemo } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator,
  StyleSheet, SafeAreaView,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useAppTheme } from '../../theme/useAppTheme'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'

interface SubjectStat {
  category: string
  total: number
  correct: number
  wrong: number
  accuracy: number
  pendingReview: number
}

interface OverallStat {
  total: number
  correct: number
  wrong: number
  pendingReview: number
}

const CATEGORY_ICONS: Record<string, string> = {
  'Türkçe':         '📝',
  'LGS Türkçe':     '📝',
  'Matematik':       '🔢',
  'LGS Matematik':   '🔢',
  'Fen Bilimleri':   '🔬',
  'LGS Fen':         '🔬',
  'Sosyal Bilgiler': '🌍',
  'LGS Sosyal':      '🌍',
  'İngilizce':       '🌐',
  'LGS İngilizce':   '🌐',
  'TYT Türkçe':      '📖',
  'TYT Matematik':   '📐',
  'TYT Tarih':       '🏛️',
  'TYT Felsefe':     '💭',
  'TYT Coğrafya':    '🗺️',
  'TYT Biyoloji':    '🧬',
  'TYT Fizik':       '⚛️',
  'TYT Kimya':       '⚗️',
  'Edebiyat':        '📚',
  'AYT Edebiyat':    '📚',
  'AYT Tarih':       '🏺',
  'AYT Cografya':    '🗺️',
  'AYT Coğrafya':    '🗺️',
  'Felsefe':         '🧠',
  'AYT Felsefe':     '🧠',
  'Psikoloji':       '🪞',
  'AYT Psikoloji':   '🪞',
  'YDS Okuma':       '🌍',
}

function getIcon(cat: string): string {
  return CATEGORY_ICONS[cat] ?? '📋'
}

function getAccuracyColor(accuracy: number): string {
  if (accuracy >= 80) return '#34C759'
  if (accuracy >= 60) return '#FF9500'
  return '#FF3B30'
}

export default function SubjectProgressScreen() {
  const t = useAppTheme()
  const router = useRouter()
  const { student } = useAuthStore()

  const [stats, setStats] = useState<SubjectStat[]>([])
  const [overall, setOverall] = useState<OverallStat>({ total: 0, correct: 0, wrong: 0, pendingReview: 0 })
  const [loading, setLoading] = useState(true)
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'weak' | 'review'>('all')

  useEffect(() => {
    if (student?.id) loadStats()
  }, [student?.id])

  const loadStats = async () => {
    if (!student?.id) return
    setLoading(true)

    const today = new Date().toISOString().split('T')[0]

    // Query wrong_answers with category info
    const { data: wrongData } = await supabase
      .from('wrong_answers')
      .select(`
        id,
        next_review_at,
        text_questions!inner (
          text_library!inner ( category )
        )
      `)
      .eq('student_id', student.id)

    // Query question sessions
    const { data: sessionData } = await supabase
      .from('user_question_sessions')
      .select('question_id, is_correct, text_questions!inner ( text_library!inner ( category ) )')
      .eq('student_id', student.id)

    // Build stats map
    const map: Record<string, { total: number; correct: number; wrong: number; pendingReview: number }> = {}

    for (const row of (sessionData ?? []) as any[]) {
      const cat = row.text_questions?.text_library?.category ?? 'Diğer'
      if (!map[cat]) map[cat] = { total: 0, correct: 0, wrong: 0, pendingReview: 0 }
      map[cat].total++
      if (row.is_correct) map[cat].correct++
      else map[cat].wrong++
    }

    for (const row of (wrongData ?? []) as any[]) {
      const cat = (row as any).text_questions?.text_library?.category ?? 'Diğer'
      if (!map[cat]) map[cat] = { total: 0, correct: 0, wrong: 0, pendingReview: 0 }
      if (row.next_review_at <= today) {
        map[cat].pendingReview++
      }
    }

    const result: SubjectStat[] = Object.entries(map)
      .map(([category, s]) => ({
        category,
        total: s.total,
        correct: s.correct,
        wrong: s.wrong,
        accuracy: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0,
        pendingReview: s.pendingReview,
      }))
      .sort((a, b) => b.total - a.total)

    const tot = result.reduce((acc, s) => ({
      total: acc.total + s.total,
      correct: acc.correct + s.correct,
      wrong: acc.wrong + s.wrong,
      pendingReview: acc.pendingReview + s.pendingReview,
    }), { total: 0, correct: 0, wrong: 0, pendingReview: 0 })

    setStats(result)
    setOverall(tot)
    setLoading(false)
  }

  const filtered = useMemo(() => {
    if (selectedFilter === 'weak')   return stats.filter(s => s.accuracy < 60 && s.total >= 3)
    if (selectedFilter === 'review') return stats.filter(s => s.pendingReview > 0)
    return stats
  }, [stats, selectedFilter])

  const s = useMemo(() => StyleSheet.create({
    container:    { flex: 1, backgroundColor: t.colors.background },
    header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: t.spacing.lg, paddingVertical: t.spacing.md, backgroundColor: t.colors.background, borderBottomWidth: 1, borderBottomColor: t.colors.border },
    headerTitle:  { fontSize: t.font.lg, fontWeight: '800', color: t.colors.text },
    closeBtn:     { padding: 8 },
    closeBtnTxt:  { fontSize: 18, color: t.colors.textSub },

    // Overall row
    overallRow:   { flexDirection: 'row', marginHorizontal: t.spacing.lg, marginVertical: t.spacing.md, gap: 10 },
    overallCard:  { flex: 1, backgroundColor: t.colors.surface, borderRadius: t.radius.md, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: t.colors.border },
    overallNum:   { fontSize: 22, fontWeight: '900', marginBottom: 4 },
    overallLabel: { fontSize: 11, color: t.colors.textSub, fontWeight: '600' },

    // Review banner
    reviewBanner: { marginHorizontal: t.spacing.lg, marginBottom: t.spacing.md, padding: 14, borderRadius: t.radius.md, backgroundColor: '#FF950015', borderWidth: 1.5, borderColor: '#FF9500', flexDirection: 'row', alignItems: 'center', gap: 12 },
    reviewLeft:   { flex: 1 },
    reviewTitle:  { fontSize: t.font.md, fontWeight: '700', color: '#FF9500', marginBottom: 2 },
    reviewSub:    { fontSize: t.font.sm, color: t.colors.textSub },
    reviewBtn:    { paddingHorizontal: 16, paddingVertical: 8, borderRadius: t.radius.sm, backgroundColor: '#FF9500' },
    reviewBtnTxt: { fontSize: t.font.sm, fontWeight: '700', color: '#FFF' },

    // Filter chips
    filterRow:    { flexDirection: 'row', paddingHorizontal: t.spacing.lg, gap: 8, marginBottom: t.spacing.md },
    filterChip:   { paddingHorizontal: 14, paddingVertical: 7, borderRadius: t.radius.pill, backgroundColor: t.colors.surface, borderWidth: 1.5, borderColor: t.colors.border },
    filterChipOn: { backgroundColor: t.colors.primary + '15', borderColor: t.colors.primary },
    filterTxt:    { fontSize: t.font.sm, color: t.colors.textSub, fontWeight: '600' },
    filterTxtOn:  { color: t.colors.primary },

    // Subject card
    subjectCard:  { marginHorizontal: t.spacing.lg, marginBottom: 10, backgroundColor: t.colors.surface, borderRadius: t.radius.md, borderWidth: 1, borderColor: t.colors.border, padding: t.spacing.md },
    subjectTop:   { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
    subjectIcon:  { fontSize: 22 },
    subjectMeta:  { flex: 1 },
    subjectName:  { fontSize: t.font.md, fontWeight: '700', color: t.colors.text },
    subjectCount: { fontSize: t.font.sm, color: t.colors.textSub, marginTop: 2 },
    accBadge:     { paddingHorizontal: 10, paddingVertical: 4, borderRadius: t.radius.pill },
    accBadgeTxt:  { fontSize: t.font.sm, fontWeight: '800', color: '#FFF' },

    // Progress bar
    barBg:        { height: 6, backgroundColor: t.colors.border, borderRadius: 3 },
    barFill:      { height: 6, borderRadius: 3 },

    // Stat row
    statRow:      { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
    statItem:     { alignItems: 'center' },
    statNum:      { fontSize: 15, fontWeight: '800' },
    statLabel:    { fontSize: 10, color: t.colors.textSub },

    // Review badge inside card
    cardReview:   { marginTop: 8, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: '#FF950020' },
    cardReviewTxt:{ fontSize: 11, color: '#FF9500', fontWeight: '700' },

    // Empty
    empty:        { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
    emptyIcon:    { fontSize: 48, marginBottom: 12 },
    emptyTitle:   { fontSize: t.font.lg, fontWeight: '700', color: t.colors.text, marginBottom: 8, textAlign: 'center' },
    emptySub:     { fontSize: t.font.md, color: t.colors.textSub, textAlign: 'center' },
  }), [t])

  if (loading) {
    return (
      <SafeAreaView style={s.container}>
        <ActivityIndicator style={{ flex: 1 }} size="large" color={t.colors.primary} />
      </SafeAreaView>
    )
  }

  const overallAccuracy = overall.total > 0 ? Math.round((overall.correct / overall.total) * 100) : 0

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Ders Analizi</Text>
        <TouchableOpacity style={s.closeBtn} onPress={() => router.back()}>
          <Text style={s.closeBtnTxt}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Overall stats */}
        <View style={s.overallRow}>
          <View style={s.overallCard}>
            <Text style={[s.overallNum, { color: t.colors.primary }]}>{overall.total}</Text>
            <Text style={s.overallLabel}>Toplam Soru</Text>
          </View>
          <View style={s.overallCard}>
            <Text style={[s.overallNum, { color: '#34C759' }]}>{overall.correct}</Text>
            <Text style={s.overallLabel}>Doğru</Text>
          </View>
          <View style={s.overallCard}>
            <Text style={[s.overallNum, { color: '#FF3B30' }]}>{overall.wrong}</Text>
            <Text style={s.overallLabel}>Yanlış</Text>
          </View>
          <View style={s.overallCard}>
            <Text style={[s.overallNum, { color: getAccuracyColor(overallAccuracy) }]}>{overallAccuracy}%</Text>
            <Text style={s.overallLabel}>Başarı</Text>
          </View>
        </View>

        {/* SRS Review Banner */}
        {overall.pendingReview > 0 && (
          <TouchableOpacity style={s.reviewBanner} onPress={() => router.push('/exercise/wrong-answers' as any)} activeOpacity={0.85}>
            <View style={s.reviewLeft}>
              <Text style={s.reviewTitle}>🔁 {overall.pendingReview} soru tekrar bekliyor</Text>
              <Text style={s.reviewSub}>Bugün tekrar etmen gereken yanlış cevaplar</Text>
            </View>
            <View style={s.reviewBtn}>
              <Text style={s.reviewBtnTxt}>Başla</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Filter chips */}
        <View style={s.filterRow}>
          {[
            { key: 'all',    label: 'Tümü' },
            { key: 'weak',   label: '⚠️ Zayıf (<60%)' },
            { key: 'review', label: '🔁 Tekrar Bekliyor' },
          ].map(f => (
            <TouchableOpacity
              key={f.key}
              style={[s.filterChip, selectedFilter === f.key && s.filterChipOn]}
              onPress={() => setSelectedFilter(f.key as any)}
            >
              <Text style={[s.filterTxt, selectedFilter === f.key && s.filterTxtOn]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Subject cards */}
        {stats.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>📊</Text>
            <Text style={s.emptyTitle}>Henüz veri yok</Text>
            <Text style={s.emptySub}>Soru çözdükten sonra ders bazlı performansın burada görünecek.</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>✅</Text>
            <Text style={s.emptyTitle}>
              {selectedFilter === 'weak' ? 'Zayıf ders yok!' : 'Tekrar bekleyen soru yok!'}
            </Text>
            <Text style={s.emptySub}>
              {selectedFilter === 'weak' ? 'Tüm derslerde %60 üzeri başarı.' : 'Harika! Bugün tekrar yapılacak soru yok.'}
            </Text>
          </View>
        ) : (
          filtered.map(sub => {
            const icon = getIcon(sub.category)
            const accColor = getAccuracyColor(sub.accuracy)
            return (
              <View key={sub.category} style={s.subjectCard}>
                <View style={s.subjectTop}>
                  <Text style={s.subjectIcon}>{icon}</Text>
                  <View style={s.subjectMeta}>
                    <Text style={s.subjectName}>{sub.category}</Text>
                    <Text style={s.subjectCount}>{sub.total} soru çözüldü</Text>
                  </View>
                  <View style={[s.accBadge, { backgroundColor: accColor }]}>
                    <Text style={s.accBadgeTxt}>%{sub.accuracy}</Text>
                  </View>
                </View>

                {/* Progress bar */}
                <View style={s.barBg}>
                  <View style={[s.barFill, { width: `${sub.accuracy}%`, backgroundColor: accColor }]} />
                </View>

                {/* D/Y/Net row */}
                <View style={s.statRow}>
                  <View style={s.statItem}>
                    <Text style={[s.statNum, { color: '#34C759' }]}>{sub.correct}</Text>
                    <Text style={s.statLabel}>Doğru</Text>
                  </View>
                  <View style={s.statItem}>
                    <Text style={[s.statNum, { color: '#FF3B30' }]}>{sub.wrong}</Text>
                    <Text style={s.statLabel}>Yanlış</Text>
                  </View>
                  <View style={s.statItem}>
                    <Text style={[s.statNum, { color: t.colors.primary }]}>
                      {(sub.correct - sub.wrong * 0.25).toFixed(2)}
                    </Text>
                    <Text style={s.statLabel}>Net</Text>
                  </View>
                  <View style={s.statItem}>
                    <Text style={[s.statNum, { color: t.colors.text }]}>{sub.total}</Text>
                    <Text style={s.statLabel}>Toplam</Text>
                  </View>
                </View>

                {sub.pendingReview > 0 && (
                  <View style={s.cardReview}>
                    <Text style={s.cardReviewTxt}>🔁 {sub.pendingReview} tekrar bekliyor</Text>
                  </View>
                )}
              </View>
            )
          })
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  )
}
