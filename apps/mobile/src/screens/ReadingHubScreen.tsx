// =====================================================
// ReadingHubScreen — Tek state owner (Sprint 4)
//
// Mimari kural:
//   - Bu ekran tüm state'i sahiplenir.
//   - Child bileşenler pure + props-only.
//   - Tüm async çağrılar try/catch ile sarılır.
//   - Handler'lar useCallback ile stable tutulur.
//   - error asla root'a bubble etmez.
// =====================================================

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  View, Text, TouchableOpacity, ScrollView, Animated,
  StyleSheet, SafeAreaView, Platform,
} from 'react-native'
import { supabase } from '../lib/supabase'
import { useRouter, useFocusEffect } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { useAuthStore }   from '../stores/authStore'
import { useAppTheme }    from '../theme/useAppTheme'
import type { AppTheme }  from '../theme'
import { PerformancePanel }         from '../components/reading/PerformancePanel'
import { PerformanceInsightCard }   from '../components/reading/PerformanceInsightCard' // SPRINT 7 ADD
import { ExamInsightCard }          from '../components/reading/ExamInsightCard'         // SPRINT 8 ADD
import { MentorFeedbackCard }      from '../components/reading/MentorFeedbackCard'       // SPRINT 9 ADD
import { ModeGrid }                 from '../components/reading/ModeGrid'
import { LibraryPreview }           from '../components/reading/LibraryPreview'
import { ReadingModePickerSheet }   from '../components/reading/ReadingModePickerSheet'
import { WPMTrendCard }             from '../components/reading/WPMTrendCard'
import { DailyGoalCard }            from '../components/reading/DailyGoalCard'
import type { ModeItem }            from '../components/reading/ModeGrid'
import type { LibraryText, ExamFilter } from '../components/reading/LibraryPreview'
import { createAdaptiveService, createExamService, createMentorService } from '@sprinta/api' // SPRINT 7/8/9
import type {
  UserDifficultyProfile,
  RecommendedText,
  UserExamProfile,
  ReadingExamCorrelation,
  AiMentorFeedback,
} from '@sprinta/api' // SPRINT 7/8/9

// SPRINT 7 ADD
const adaptiveService = createAdaptiveService(supabase)
// SPRINT 8 ADD
const examService     = createExamService(supabase)
// SPRINT 9 ADD
const mentorService   = createMentorService(supabase)

const LIBRARY_LIMIT = 30

// ─── Section başlığı (pure, React.memo) ──────────────
interface SectionTitleProps {
  icon:  string
  title: string
  sub?:  string
  s:     ReturnType<typeof createStyles>
}

const SectionTitle = React.memo(function SectionTitle({ icon, title, sub, s }: SectionTitleProps) {
  return (
    <View style={s.sectionHeader}>
      <Text style={s.sectionIcon}>{icon}</Text>
      <View>
        <Text style={s.sectionTitle}>{title}</Text>
        {sub != null && <Text style={s.sectionSub}>{sub}</Text>}
      </View>
    </View>
  )
})

// ─── Ana ekran ────────────────────────────────────────
export default function ReadingHubScreen() {
  const t   = useAppTheme()
  const s   = useMemo(() => createStyles(t), [t])

  // ── Store erişimi (sadece burada) ────────────────────
  const student                      = useAuthStore(st => st.student)
  const router                       = useRouter()

  // ── Library state ─────────────────────────────────────
  const [texts,          setTexts]          = useState<LibraryText[]>([])
  const [loading,        setLoading]        = useState(true)
  const [error,          setError]          = useState<string | null>(null)
  const [filter,         setFilter]         = useState<ExamFilter>('Tümü')
  const [categoryFilter, setCategoryFilter] = useState<string>('Tümü')
  const [searchQuery,    setSearchQuery]    = useState<string>('')
  /** textId → last_ratio (0–1) */
  const [progressMap, setProgressMap] = useState<Record<string, number>>({})
  /** Mod seçim sayfası */
  const [pickerText,  setPickerText]  = useState<LibraryText | null>(null)

  // SPRINT 7 ADD — adaptif profil + öneriler
  const [diffProfile,   setDiffProfile]   = useState<UserDifficultyProfile | null>(null)
  const [recommendations, setRecommendations] = useState<RecommendedText[]>([])
  const [recLoading,    setRecLoading]    = useState(true)
  // Placeholder animasyonu (yükleniyor kartları)
  const recPlaceholderAnim = useMemo(() => new Animated.Value(0.3), [])

  // SPRINT 8 ADD — sınav profili + correlation
  const [examProfile,  setExamProfile]  = useState<UserExamProfile       | null>(null)
  const [correlation,  setCorrelation]  = useState<ReadingExamCorrelation | null>(null)

  // SPRINT 9 ADD — mentor geri bildirimi
  const [mentorFeedback,  setMentorFeedback]  = useState<AiMentorFeedback | null>(null)
  const [mentorLoading,   setMentorLoading]   = useState(true)
  const [isGenerating,    setIsGenerating]    = useState(false)

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(recPlaceholderAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(recPlaceholderAnim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ]),
    ).start()
  }, [recPlaceholderAnim])

  // ── Library fetch — try/catch, error asla root'a bubble etmez ─
  const fetchTexts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('text_library')
        .select('id, title, category, exam_type, difficulty, word_count, estimated_read_time')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(LIBRARY_LIMIT)

      if (fetchError) {
        setError('Metinler yüklenemedi.')
      } else {
        setTexts((data as LibraryText[]) ?? [])
      }
    } catch {
      setError('Bağlantı hatası. Tekrar dene.')
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Okuma ilerlemesi fetch ────────────────────────────
  const fetchProgress = useCallback(async () => {
    if (!student?.id) return
    try {
      const { data } = await (supabase as any)
        .from('user_reading_progress')
        .select('text_id, last_ratio')
        .eq('user_id', student.id)
      if (data) {
        const map: Record<string, number> = {}
        ;(data as { text_id: string; last_ratio: number }[]).forEach(r => {
          map[r.text_id] = r.last_ratio
        })
        setProgressMap(map)
      }
    } catch {
      // sessiz
    }
  }, [student?.id])

  useEffect(() => { fetchTexts() }, [fetchTexts])
  useEffect(() => { fetchProgress() }, [fetchProgress])

  // Ekrana dönüldüğünde ilerlemeyi yenile (okuma sonrası)
  useFocusEffect(
    useCallback(() => { fetchProgress() }, [fetchProgress]),
  )

  // ── Client-side filter + search + progress merge ─────────────
  const filteredTexts = useMemo(() => {
    let result = texts
    if (filter !== 'Tümü') {
      result = result.filter(tx => tx.exam_type === filter)
    }
    if (categoryFilter && categoryFilter !== 'Tümü') {
      result = result.filter(tx => tx.category === categoryFilter)
    }
    const q = searchQuery.trim().toLowerCase()
    if (q.length > 0) {
      result = result.filter(tx =>
        tx.title.toLowerCase().includes(q) ||
        tx.category.toLowerCase().includes(q),
      )
    }
    // İlerleme verisini metinlere birleştir
    return result.map(tx => ({
      ...tx,
      readingProgress: progressMap[tx.id] ?? 0,
    }))
  }, [texts, filter, categoryFilter, searchQuery, progressMap])

  // SPRINT 7 ADD — profil + öneriler yükle
  useEffect(() => {
    let cancelled = false
    setRecLoading(true)

    Promise.all([
      adaptiveService.getUserDifficultyProfile(),
      adaptiveService.getRecommendedTexts(),
    ]).then(([profileResult, recResult]) => {
      if (cancelled) return
      if (profileResult.data)    setDiffProfile(profileResult.data)
      if (recResult.data)        setRecommendations(recResult.data)
    }).catch(() => {}).finally(() => {
      if (!cancelled) setRecLoading(false)
    })

    return () => { cancelled = true }
  }, [])

  // SPRINT 8 ADD — sınav profili + correlation yükle
  useEffect(() => {
    let cancelled = false

    Promise.all([
      examService.getExamProfile(),
      examService.getReadingExamCorrelation(),
    ]).then(([profResult, corrResult]) => {
      if (cancelled) return
      if (profResult.data)  setExamProfile(profResult.data)
      if (corrResult.data)  setCorrelation(corrResult.data)
    }).catch(() => {})

    return () => { cancelled = true }
  }, [])

  // SPRINT 9 ADD — mentor geri bildirimi yükle
  useEffect(() => {
    let cancelled = false
    setMentorLoading(true)

    mentorService.getLatestFeedback().then(({ data }) => {
      if (!cancelled) {
        setMentorFeedback(data)
        setMentorLoading(false)
      }
    }).catch(() => {
      if (!cancelled) setMentorLoading(false)
    })

    return () => { cancelled = true }
  }, [])

  // SPRINT 9 ADD — yeni analiz üret
  const handleGenerateMentorFeedback = useCallback(async () => {
    if (isGenerating) return
    setIsGenerating(true)
    const { data } = await mentorService.generateFeedback()
    if (data) {
      setMentorFeedback(data)
      mentorService.markSeen(data.id)
    }
    setIsGenerating(false)
  }, [isGenerating])

  // SPRINT 7/8 ADD — öneri badge metni
  const getRecBadge = useCallback((reason: RecommendedText['recommendation_reason']): string => {
    if (reason === 'resume')           return 'Devam Et'
    if (reason === 'skill_match')      return 'Zayıf Alan'   // SPRINT 8
    if (reason === 'difficulty_match') return 'Seviyene Uygun'
    return 'Önerilen'
  }, [])

  // ── Stable handler'lar (useCallback) ─────────────────
  const handleModePress = useCallback((mode: ModeItem) => {
    if (mode.comingSoon || !mode.route) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    router.push(mode.route as any)
  }, [router])

  const handleTextPress = useCallback((text: LibraryText) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setPickerText(text)
  }, [])

  const handleFilterChange = useCallback((f: ExamFilter) => {
    setFilter(f)
    setCategoryFilter('Tümü') // Sınav değişince kategori sıfırlanır
  }, [])

  const handleCategoryChange = useCallback((c: string) => {
    setCategoryFilter(c)
  }, [])

  const handleSearchChange = useCallback((q: string) => {
    setSearchQuery(q)
  }, [])

  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    router.back()
  }, [router])

  // ── Memoized performance props ────────────────────────
  const perfProps = useMemo(() => student ? {
    totalXp:    student.totalXp,
    level:      student.level,
    streakDays: student.streakDays,
    currentArp: student.currentArp,
  } : null, [student])

  // ─────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.safe}>

      {/* ── Mod Seçim Sayfası ───────────────────────── */}
      <ReadingModePickerSheet
        visible={pickerText != null}
        text={pickerText}
        onClose={() => setPickerText(null)}
      />

      {/* ── Header ──────────────────────────────────── */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={handleBack} activeOpacity={0.7}>
          <Text style={s.backTxt}>‹</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Okuma Merkezi</Text>
          <Text style={s.headerSub}>Hız · Anlama · Odak</Text>
        </View>
        <View style={s.backBtn} />
      </View>

      {/* ── Sayfa içeriği ───────────────────────────── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.content}
      >
        {/* Performans paneli — sadece student varsa */}
        {perfProps != null && (
          <PerformancePanel {...perfProps} />
        )}

        {/* SPRINT 7 ADD — Adaptif Performans Kartı */}
        {perfProps != null && (
          <PerformanceInsightCard
            profile={diffProfile}
            xp={perfProps.totalXp}
            level={perfProps.level}
          />
        )}

        {/* SPRINT 8 ADD — Sınav Zeka Kartı */}
        <ExamInsightCard
          profile={examProfile}
          correlation={correlation}
        />

        {/* SPRINT 9 ADD — AI Mentor Geri Bildirimi */}
        <SectionTitle icon="🎓" title="Mentorum" sub="AI destekli kişisel analiz" s={s} />
        <MentorFeedbackCard
          feedback={mentorFeedback}
          loading={mentorLoading}
          isGenerating={isGenerating}
          onGenerate={handleGenerateMentorFeedback}
        />

        {/* SPRINT 7 ADD — Senin İçin Önerilenler */}
        <SectionTitle icon="🎯" title="Senin İçin Önerilenler" s={s} />
        {recLoading ? (
          // Yükleniyor: 3 placeholder kart
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.recList}
          >
            {[0, 1, 2].map(i => (
              <Animated.View key={i} style={[s.recPlaceholder, { opacity: recPlaceholderAnim }]} />
            ))}
          </ScrollView>
        ) : recommendations.length === 0 ? (
          <Text style={s.recEmpty}>
            Okumaya başla, sana özel öneriler hazırlayalım.
          </Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.recList}
          >
            {recommendations.map(item => (
              <TouchableOpacity
                key={item.id}
                style={s.recCard}
                onPress={() => handleTextPress(item as unknown as LibraryText)}
                activeOpacity={0.8}
              >
                <View style={[
                  s.recBadge,
                  item.recommendation_reason === 'resume'
                    ? s.recBadgeResume
                    : item.recommendation_reason === 'skill_match'
                    ? s.recBadgeSkill
                    : item.recommendation_reason === 'difficulty_match'
                    ? s.recBadgeMatch
                    : s.recBadgeExam,
                ]}>
                  <Text style={s.recBadgeTxt}>{getRecBadge(item.recommendation_reason)}</Text>
                </View>
                <Text style={s.recTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={s.recCategory} numberOfLines={1}>{item.category}</Text>
                {/* Zorluk dots */}
                <View style={s.recDots}>
                  {[1, 2, 3, 4, 5].map(d => (
                    <View
                      key={d}
                      style={[s.recDot, d <= item.difficulty ? s.recDotFilled : s.recDotEmpty]}
                    />
                  ))}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Günlük Hedef + WPM Trend */}
        <SectionTitle icon="🎯" title="Bugün" sub="hedef · hız trendi" s={s} />
        <DailyGoalCard />
        <WPMTrendCard />

        {/* Okuma Modları */}
        <SectionTitle icon="⚡" title="Okuma Modları" sub="17 mod · popülerden az yaygına" s={s} />
        <ModeGrid onModePress={handleModePress} />

        {/* Metin Kütüphanesi */}
        <SectionTitle icon="📚" title="Metin Kütüphanesi" sub="Sınava göre filtrele · ara" s={s} />
        <LibraryPreview
          texts={filteredTexts}
          loading={loading}
          error={error}
          filter={filter}
          categoryFilter={categoryFilter}
          searchQuery={searchQuery}
          onFilterChange={handleFilterChange}
          onCategoryChange={handleCategoryChange}
          onSearchChange={handleSearchChange}
          onTextPress={handleTextPress}
          onRetry={fetchTexts}
        />

        <View style={s.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  )
}

// ─── Stiller ──────────────────────────────────────────
function createStyles(t: AppTheme) {
  return StyleSheet.create({
    safe: {
      flex:            1,
      backgroundColor: t.colors.background,
    },
    header: {
      flexDirection:     'row',
      alignItems:        'center',
      paddingHorizontal: t.spacing.lg,
      paddingVertical:   t.spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: t.colors.divider,
      backgroundColor:   t.colors.surface,
    },
    backBtn: {
      minWidth:   36,
      alignItems: 'center',
    },
    backTxt: {
      fontSize:   28,
      color:      t.colors.primary,
      fontWeight: '300',
      lineHeight: 32,
    },
    headerCenter: { flex: 1, alignItems: 'center' },
    headerTitle: {
      fontSize:   t.font.lg,
      fontWeight: '800',
      color:      t.colors.text,
    },
    headerSub: {
      fontSize:  t.font.xs,
      color:     t.colors.textHint,
      marginTop: 1,
    },
    content: {
      paddingHorizontal: t.spacing.lg,
      paddingVertical:   t.spacing.lg,
      gap:               t.spacing.lg,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems:    'center',
      gap:           t.spacing.sm,
    },
    sectionIcon:  { fontSize: 18 },
    sectionTitle: { fontSize: t.font.md, fontWeight: '800', color: t.colors.text },
    sectionSub:   { fontSize: t.font.xs, color: t.colors.textHint, marginTop: 1 },
    bottomPad: { height: t.spacing.xxxl },

    // SPRINT 7 ADD — öneriler
    recList: {
      paddingVertical: t.spacing.xs,
      gap:             t.spacing.md,
    },
    recPlaceholder: {
      width:           140,
      height:          160,
      borderRadius:    t.radius.lg,
      backgroundColor: t.colors.surfaceSub,
    },
    recEmpty: {
      fontSize:  t.font.sm,
      color:     t.colors.textHint,
      textAlign: 'center',
      paddingVertical: t.spacing.md,
    },
    recCard: {
      width:           140,
      backgroundColor: t.colors.surface,
      borderRadius:    t.radius.lg,
      padding:         t.spacing.md,
      gap:             t.spacing.xs,
      ...t.shadows.sm,
    },
    recBadge: {
      alignSelf:         'flex-start',
      paddingHorizontal: t.spacing.sm,
      paddingVertical:   2,
      borderRadius:      20,
    },
    recBadgeResume:  { backgroundColor: t.colors.primary },
    recBadgeSkill:   { backgroundColor: '#EF4444' },        // SPRINT 8: kırmızı = zayıf alan
    recBadgeMatch:   { backgroundColor: t.colors.accent },
    recBadgeExam:    { backgroundColor: t.colors.surfaceSub },
    recBadgeTxt: {
      fontSize:   t.font.xs,
      color:      t.colors.white,
      fontWeight: '700',
    },
    recTitle: {
      fontSize:   t.font.sm,
      fontWeight: '700',
      color:      t.colors.text,
      lineHeight: 18,
    },
    recCategory: {
      fontSize: t.font.xs,
      color:    t.colors.textHint,
    },
    recDots: {
      flexDirection: 'row',
      gap:           3,
      marginTop:     t.spacing.xs,
    },
    recDot: {
      width:        8,
      height:       8,
      borderRadius: 4,
    },
    recDotFilled: { backgroundColor: t.colors.primary },
    recDotEmpty:  { backgroundColor: t.colors.border },
  })
}
