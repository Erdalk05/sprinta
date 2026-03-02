// =====================================================
// ReadingHubScreen — Sadeleştirilmiş versiyon
//
// Sadece önemli olan:
//   1. Kişiselleştirilmiş selamlama + motivasyon sözü
//   2. Kompakt stat şeridi (WPM · Seri · XP)
//   3. Okuma Modları grid
//   4. Metin Kütüphanesi
// =====================================================

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView,
} from 'react-native'
import { supabase } from '../lib/supabase'
import { useRouter, useFocusEffect } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { useAuthStore }  from '../stores/authStore'
import { useAppTheme }   from '../theme/useAppTheme'
import type { AppTheme } from '../theme'
import { ModeGrid }                from '../components/reading/ModeGrid'
import { LibraryPreview }          from '../components/reading/LibraryPreview'
import { ReadingModePickerSheet }  from '../components/reading/ReadingModePickerSheet'
import type { ModeItem }           from '../components/reading/ModeGrid'
import type { LibraryText, ExamFilter } from '../components/reading/LibraryPreview'
import { selectMotivation } from '../utils/motivation'

const LIBRARY_LIMIT = 30

// ─── Ana ekran ────────────────────────────────────────
export default function ReadingHubScreen() {
  const t   = useAppTheme()
  const s   = useMemo(() => createStyles(t), [t])
  const student = useAuthStore(st => st.student)
  const router  = useRouter()

  // ── Library state ──────────────────────────────────
  const [texts,          setTexts]          = useState<LibraryText[]>([])
  const [loading,        setLoading]        = useState(true)
  const [error,          setError]          = useState<string | null>(null)
  const [filter,         setFilter]         = useState<ExamFilter>('Tümü')
  const [categoryFilter, setCategoryFilter] = useState<string>('Tümü')
  const [searchQuery,    setSearchQuery]    = useState<string>('')
  const [progressMap,    setProgressMap]    = useState<Record<string, number>>({})
  const [pickerText,     setPickerText]     = useState<LibraryText | null>(null)

  // ── Hızlı stat: son WPM ────────────────────────────
  const [lastWpm, setLastWpm] = useState<number | null>(null)

  // ── Kişiselleştirilmiş selamlama + motivasyon ──────
  const firstName = useMemo(() => {
    const full = student?.fullName ?? ''
    return full.split(' ')[0] || 'Öğrenci'
  }, [student?.fullName])

  const { greeting, icon: greetIcon, message: motivMessage } = useMemo(
    () => selectMotivation(
      firstName,
      student?.streakDays ?? 0,
      student?.totalXp    ?? 0,
      lastWpm,
    ),
    [firstName, student?.streakDays, student?.totalXp, lastWpm],
  )

  // ── Library fetch ──────────────────────────────────
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

  // ── İlerleme fetch ─────────────────────────────────
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
    } catch { /* sessiz */ }
  }, [student?.id])

  // ── Son WPM fetch ──────────────────────────────────
  useEffect(() => {
    if (!student?.id) return
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await (supabase as any)
          .from('reading_mode_sessions')
          .select('avg_wpm')
          .eq('student_id', student.id)
          .gt('avg_wpm', 0)
          .order('created_at', { ascending: false })
          .limit(1)
        if (!cancelled && data?.[0]?.avg_wpm) setLastWpm(data[0].avg_wpm)
      } catch { /* sessiz */ }
    })()
    return () => { cancelled = true }
  }, [student?.id])

  useEffect(() => { fetchTexts() },    [fetchTexts])
  useEffect(() => { fetchProgress() }, [fetchProgress])

  useFocusEffect(
    useCallback(() => { fetchProgress() }, [fetchProgress]),
  )

  // ── Filtreli metin listesi ─────────────────────────
  const filteredTexts = useMemo(() => {
    let result = texts
    if (filter !== 'Tümü') result = result.filter(tx => tx.exam_type === filter)
    if (categoryFilter && categoryFilter !== 'Tümü')
      result = result.filter(tx => tx.category === categoryFilter)
    const q = searchQuery.trim().toLowerCase()
    if (q.length > 0)
      result = result.filter(tx =>
        tx.title.toLowerCase().includes(q) || tx.category.toLowerCase().includes(q),
      )
    return result.map(tx => ({ ...tx, readingProgress: progressMap[tx.id] ?? 0 }))
  }, [texts, filter, categoryFilter, searchQuery, progressMap])

  // ── Handler'lar ────────────────────────────────────
  const handleModePress    = useCallback((mode: ModeItem) => {
    if (mode.comingSoon || !mode.route) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    router.push(mode.route as any)
  }, [router])

  const handleTextPress    = useCallback((text: LibraryText) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setPickerText(text)
  }, [])

  const handleFilterChange   = useCallback((f: ExamFilter) => {
    setFilter(f); setCategoryFilter('Tümü')
  }, [])
  const handleCategoryChange = useCallback((c: string) => setCategoryFilter(c), [])
  const handleSearchChange   = useCallback((q: string) => setSearchQuery(q), [])
  const handleBack           = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    router.back()
  }, [router])

  // ──────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.safe}>

      {/* ── Mod Seçim Sheet ──────────────────────────── */}
      <ReadingModePickerSheet
        visible={pickerText != null}
        text={pickerText}
        onClose={() => setPickerText(null)}
      />

      {/* ── Header ───────────────────────────────────── */}
      <View style={s.header}>
        {/* Sol: kullanıcı adı + selamlama */}
        <View style={s.headerLeft}>
          <Text style={s.headerName}>{firstName}</Text>
          <Text style={s.headerGreet}>{greetIcon} {greeting}</Text>
        </View>

        {/* Sağ: ayarlar + çıkış */}
        <View style={s.headerRight}>
          <TouchableOpacity
            style={s.iconBtn}
            onPress={() => router.push('/(tabs)/menu' as any)}
            activeOpacity={0.7}
          >
            <Text style={s.iconBtnTxt}>⚙️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.iconBtn}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <Text style={s.iconBtnTxt}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>

        {/* ── Motivasyon kartı ─────────────────────────── */}
        <View style={s.motivCard}>
          <Text style={s.motivMsg} numberOfLines={3}>{motivMessage}</Text>
        </View>

        {/* ── Kompakt stat şeridi ──────────────────────── */}
        <View style={s.statRow}>
          <View style={s.statItem}>
            <Text style={s.statVal}>{lastWpm ?? '—'}</Text>
            <Text style={s.statLbl}>Son WPM</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={s.statVal}>{student?.streakDays ?? 0}</Text>
            <Text style={s.statLbl}>🔥 Seri</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={s.statVal}>{student?.totalXp ?? 0}</Text>
            <Text style={s.statLbl}>⭐ XP</Text>
          </View>
        </View>

        {/* ── Okuma Modları ────────────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>⚡ Okuma Modları</Text>
          <Text style={s.sectionSub}>17 mod · en popülerden az yaygına</Text>
        </View>
        <ModeGrid onModePress={handleModePress} />

        {/* ── Metin Kütüphanesi ────────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>📚 Metin Kütüphanesi</Text>
          <Text style={s.sectionSub}>Sınava göre filtrele · ara · başla</Text>
        </View>
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

        <View style={{ height: 40 }} />
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

    // Header
    header: {
      flexDirection:     'row',
      alignItems:        'center',
      justifyContent:    'space-between',
      paddingHorizontal: t.spacing.lg,
      paddingVertical:   t.spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: t.colors.divider,
      backgroundColor:   t.colors.surface,
    },
    headerLeft: {
      flex: 1,
      gap:  2,
    },
    headerName: {
      fontSize:   t.font.lg,
      fontWeight: '900',
      color:      t.colors.text,
    },
    headerGreet: {
      fontSize:  t.font.xs,
      color:     t.colors.textHint,
      fontWeight: '600',
    },
    headerRight: {
      flexDirection: 'row',
      alignItems:    'center',
      gap:           8,
    },
    iconBtn: {
      width:           36,
      height:          36,
      borderRadius:    18,
      backgroundColor: t.colors.background,
      alignItems:      'center',
      justifyContent:  'center',
      borderWidth:     StyleSheet.hairlineWidth,
      borderColor:     t.colors.border,
    },
    iconBtnTxt: {
      fontSize: 16,
    },

    // İçerik
    content: {
      paddingHorizontal: t.spacing.lg,
      paddingTop:        t.spacing.md,
      gap:               t.spacing.lg,
    },

    // Motivasyon kartı
    motivCard: {
      backgroundColor: t.colors.surface,
      borderRadius:    t.radius.lg,
      borderWidth:     StyleSheet.hairlineWidth,
      borderColor:     t.colors.border,
      paddingHorizontal: 14,
      paddingVertical:   12,
      borderLeftWidth:   3,
      borderLeftColor:   t.colors.primary,
    },
    motivMsg: {
      fontSize:   t.font.sm,
      color:      t.colors.text,
      fontWeight: '500',
      lineHeight: 20,
    },

    // Stat şeridi
    statRow: {
      flexDirection:   'row',
      backgroundColor: t.colors.surface,
      borderRadius:    t.radius.lg,
      borderWidth:     StyleSheet.hairlineWidth,
      borderColor:     t.colors.border,
      paddingVertical: 14,
      ...t.shadows.sm,
    },
    statItem: {
      flex:       1,
      alignItems: 'center',
      gap:        2,
    },
    statVal: {
      fontSize:   20,
      fontWeight: '800',
      color:      t.colors.text,
    },
    statLbl: {
      fontSize:  t.font.xs,
      color:     t.colors.textHint,
      fontWeight: '600',
    },
    statDivider: {
      width:           StyleSheet.hairlineWidth,
      alignSelf:       'stretch',
      backgroundColor: t.colors.border,
      marginVertical:  4,
    },

    // Bölüm başlığı
    section: { gap: 2 },
    sectionTitle: {
      fontSize:   t.font.md,
      fontWeight: '800',
      color:      t.colors.text,
    },
    sectionSub: {
      fontSize: t.font.xs,
      color:    t.colors.textHint,
    },
  })
}
