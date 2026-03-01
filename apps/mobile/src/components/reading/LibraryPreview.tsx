// =====================================================
// LibraryPreview — Pure display component (Prompt 1 update)
//
// Kural: Fetch YOK, state YOK, supabase YOK.
// Tüm data ve handler'lar props ile gelir.
// State owner: ReadingHubScreen
// =====================================================

import React, { useMemo, useRef, useEffect } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  TextInput, ScrollView, Animated,
} from 'react-native'
import { useAppTheme } from '../../theme/useAppTheme'
import type { AppTheme } from '../../theme'

// ─── Export edilen tipler — ReadingHubScreen tarafından kullanılır ─
export interface LibraryText {
  id:                  string
  title:               string
  category:            string
  exam_type:           string
  difficulty:          number
  word_count:          number | null
  estimated_read_time: number | null
  /** 0–1 arası okuma ilerlemesi — user_reading_progress.last_ratio */
  readingProgress?:    number
}

export type ExamFilter = 'Tümü' | 'LGS' | 'TYT' | 'ALES' | 'KPSS' | 'General'

export const EXAM_FILTERS: ExamFilter[] = ['Tümü', 'LGS', 'TYT', 'ALES', 'KPSS', 'General']

// ─── Sınav → ders kategorisi eşleşmesi ───────────────
const EXAM_SUBJECTS: Record<ExamFilter, string[]> = {
  'Tümü':    [],
  'LGS':     ['Tümü', 'Fen Bilimleri', 'Türkçe', 'Matematik', 'Sosyal Bilgiler', 'Tarih', 'Vatandaşlık', 'İngilizce'],
  'TYT':     ['Tümü', 'Biyoloji', 'Fizik', 'Kimya', 'Edebiyat', 'Matematik', 'Türkçe'],
  'ALES':    ['Tümü', 'Akademik', 'Dilbilim', 'Psikoloji', 'Felsefe', 'Ekonomi', 'Sosyoloji', 'İstatistik', 'Nörobilim', 'Teknoloji', 'Çevre Bilimleri'],
  'KPSS':    ['Tümü', 'Tarih', 'Coğrafya', 'Hukuk', 'Ekonomi', 'Siyasi Tarih', 'Türk İnkılabı', 'Dış Politika'],
  'General': ['Tümü', 'Bilim', 'Teknoloji', 'Kültür', 'Doğa', 'Sağlık', 'Dilbilim', 'Çevre'],
}

export function getSubjectsForExam(exam: ExamFilter): string[] {
  return EXAM_SUBJECTS[exam] ?? []
}

// ─── Props ────────────────────────────────────────────
export interface LibraryPreviewProps {
  texts:              LibraryText[]
  loading:            boolean
  error:              string | null
  filter:             ExamFilter
  categoryFilter:     string
  searchQuery:        string
  onFilterChange:     (f: ExamFilter) => void
  onCategoryChange:   (c: string) => void
  onSearchChange:     (q: string) => void
  onTextPress:        (text: LibraryText) => void
  onRetry:            () => void
}

// ─── Exam badge renkleri ──────────────────────────────
const EXAM_COLORS: Record<string, string> = {
  LGS:     '#3B82F6',
  TYT:     '#10B981',
  ALES:    '#F59E0B',
  KPSS:    '#8B5CF6',
  General: '#6B7280',
}

function examColor(type: string): string {
  return EXAM_COLORS[type] ?? '#6B7280'
}

function accentForDifficulty(difficulty: number): string {
  const palette = ['#10B981', '#0EA5E9', '#F59E0B', '#EF4444', '#8B5CF6']
  return palette[Math.min(difficulty - 1, 4)] ?? '#10B981'
}

// ─── Güçlük noktaları ─────────────────────────────────
const DifficultyDots = React.memo(function DifficultyDots({
  level, color, s,
}: { level: number; color: string; s: ReturnType<typeof createStyles> }) {
  return (
    <View style={s.dotsRow}>
      {[1, 2, 3, 4, 5].map(i => (
        <View key={i} style={[s.dot, i <= level ? { backgroundColor: color } : s.dotEmpty]} />
      ))}
    </View>
  )
})

// ─── Skeleton kart ────────────────────────────────────
function SkeletonCard({ anim, s }: { anim: Animated.Value; s: ReturnType<typeof createStyles> }) {
  return (
    <Animated.View style={[s.skeleton, { opacity: anim }]}>
      <View style={s.skeletonTop} />
      <View style={s.skeletonTitle} />
      <View style={s.skeletonMeta} />
    </Animated.View>
  )
}

// ─── Kütüphane kartı ──────────────────────────────────
interface LibraryCardProps {
  text:    LibraryText
  onPress: (text: LibraryText) => void
  s:       ReturnType<typeof createStyles>
}

const LibraryCard = React.memo(function LibraryCard({ text, onPress, s }: LibraryCardProps) {
  const accent = accentForDifficulty(text.difficulty)
  const eColor = examColor(text.exam_type)
  const prog   = text.readingProgress ?? 0
  const isDone = prog >= 0.95

  return (
    <TouchableOpacity
      style={[s.card, { borderLeftColor: isDone ? '#10B981' : accent }]}
      onPress={() => onPress(text)}
      activeOpacity={0.8}
    >
      <View style={s.cardTop}>
        <View style={s.cardMeta}>
          <View style={[s.examBadge, { backgroundColor: eColor + '22' }]}>
            <Text style={[s.examBadgeTxt, { color: eColor }]}>{text.exam_type}</Text>
          </View>
          <Text style={s.category} numberOfLines={1}>{text.category}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {isDone && (
            <View style={{ backgroundColor: '#10B98122', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 }}>
              <Text style={{ fontSize: 10, fontWeight: '800', color: '#10B981' }}>✓ BİTTİ</Text>
            </View>
          )}
          <DifficultyDots level={text.difficulty} color={accent} s={s} />
        </View>
      </View>

      <Text style={s.title} numberOfLines={2}>{text.title}</Text>

      {/* İlerleme çubuğu */}
      {prog > 0 && (
        <View style={{ height: 3, backgroundColor: isDone ? '#10B98133' : accent + '33',
          borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
          <View style={{ height: 3, backgroundColor: isDone ? '#10B981' : accent,
            width: `${Math.round(prog * 100)}%` as any, borderRadius: 2 }} />
        </View>
      )}

      <View style={s.cardFooter}>
        {text.word_count != null && (
          <Text style={s.footerTxt}>📝 {text.word_count} kelime</Text>
        )}
        {text.estimated_read_time != null && (
          <Text style={s.footerTxt}>⏱ ~{text.estimated_read_time} dk</Text>
        )}
        <Text style={[s.footerTxt, s.startBtn]}>
          {isDone ? 'Tekrar Oku ›' : prog > 0 ? 'Devam Et ›' : 'Okumaya Başla ›'}
        </Text>
      </View>
    </TouchableOpacity>
  )
})

// ─── LibraryPreview ───────────────────────────────────
export const LibraryPreview = React.memo(function LibraryPreview({
  texts,
  loading,
  error,
  filter,
  categoryFilter,
  searchQuery,
  onFilterChange,
  onCategoryChange,
  onSearchChange,
  onTextPress,
  onRetry,
}: LibraryPreviewProps) {
  const t   = useAppTheme()
  const s   = useMemo(() => createStyles(t), [t])
  const skeletonAnim = useRef(new Animated.Value(0.4)).current
  const subjects = useMemo(() => getSubjectsForExam(filter), [filter])

  // Skeleton animasyonu
  useEffect(() => {
    if (!loading) return
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(skeletonAnim, { toValue: 0.8, duration: 700, useNativeDriver: true }),
        Animated.timing(skeletonAnim, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [loading, skeletonAnim])

  return (
    <View style={s.container}>

      {/* ── Arama çubuğu ─────────────────────────────────── */}
      <View style={s.searchRow}>
        <TextInput
          style={s.searchInput}
          placeholder="Metin ara..."
          placeholderTextColor={t.colors.textHint}
          value={searchQuery}
          onChangeText={onSearchChange}
          clearButtonMode="while-editing"
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => onSearchChange('')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={s.clearBtn}
          >
            <Text style={s.clearBtnTxt}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Sınav filtre chipları ───────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filters}
      >
        {EXAM_FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[s.chip, filter === f && s.chipActive]}
            onPress={() => onFilterChange(f)}
            activeOpacity={0.7}
          >
            <Text style={[s.chipTxt, filter === f && s.chipTxtActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Ders / Kategori chipları (sınav seçiliyse) ─── */}
      {subjects.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.filters}
        >
          {subjects.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[s.chip, s.chipSub, categoryFilter === cat && s.chipSubActive]}
              onPress={() => onCategoryChange(cat)}
              activeOpacity={0.7}
            >
              <Text style={[s.chipTxt, categoryFilter === cat && s.chipTxtActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* ── Loading: skeleton kartlar ────────────────────── */}
      {loading && (
        <View style={s.cards}>
          {[0, 1, 2].map(i => (
            <SkeletonCard key={i} anim={skeletonAnim} s={s} />
          ))}
        </View>
      )}

      {/* ── Error ───────────────────────────────────────── */}
      {!loading && error != null && (
        <View style={s.center}>
          <Text style={s.errorTxt}>⚠️ {error}</Text>
          <TouchableOpacity style={s.retryBtn} onPress={onRetry} activeOpacity={0.8}>
            <Text style={s.retryBtnTxt}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Empty state ─────────────────────────────────── */}
      {!loading && error == null && texts.length === 0 && (
        <View style={s.center}>
          <Text style={s.emptyIcon}>📚</Text>
          {searchQuery.length > 0 ? (
            <>
              <Text style={s.emptyTxt}>
                '{searchQuery}' için sonuç bulunamadı.
              </Text>
              <TouchableOpacity
                style={s.retryBtn}
                onPress={() => onSearchChange('')}
                activeOpacity={0.8}
              >
                <Text style={s.retryBtnTxt}>Aramayı Temizle</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={s.emptyTxt}>
              {filter === 'Tümü'
                ? 'Henüz kütüphanede metin yok.'
                : `${filter} için metin bulunamadı.`}
            </Text>
          )}
        </View>
      )}

      {/* ── Kartlar ─────────────────────────────────────── */}
      {!loading && error == null && texts.length > 0 && (
        <>
          <Text style={s.resultCount}>{texts.length} metin</Text>
          <View style={s.cards}>
            {texts.map(text => (
              <LibraryCard
                key={text.id}
                text={text}
                onPress={onTextPress}
                s={s}
              />
            ))}
          </View>
        </>
      )}

    </View>
  )
})

// ─── Stiller ──────────────────────────────────────────
function createStyles(t: AppTheme) {
  return StyleSheet.create({
    container: { gap: t.spacing.sm },

    // Arama
    searchRow: {
      flexDirection:   'row',
      alignItems:      'center',
      backgroundColor: t.colors.surface,
      borderRadius:    t.radius.md,
      borderWidth:     1,
      borderColor:     t.colors.border,
      paddingHorizontal: t.spacing.sm,
    },
    searchInput: {
      flex:            1,
      height:          40,
      fontSize:        t.font.sm,
      color:           t.colors.text,
    },
    clearBtn:    { padding: 6 },
    clearBtnTxt: { fontSize: 12, color: t.colors.textHint, fontWeight: '700' },

    // Filtreler
    filters: {
      gap:            t.spacing.xs,
      paddingVertical: 2,
    },
    chip: {
      paddingHorizontal: t.spacing.sm,
      paddingVertical:   5,
      borderRadius:      t.radius.pill,
      backgroundColor:   t.colors.border,
    },
    chipActive:    { backgroundColor: t.colors.primary },
    chipSub:       { backgroundColor: t.colors.surface, borderWidth: 1, borderColor: t.colors.border },
    chipSubActive: { backgroundColor: t.colors.primary + '22', borderColor: t.colors.primary },
    chipTxt:       { fontSize: t.font.xs, color: t.colors.textHint, fontWeight: '600' },
    chipTxtActive: { color: t.colors.primary, fontWeight: '800' },

    // Sonuç sayısı
    resultCount: {
      fontSize:  t.font.xs,
      color:     t.colors.textHint,
      fontWeight: '600',
    },

    // Skeleton
    skeleton: {
      backgroundColor: t.colors.surface,
      borderRadius:    t.radius.md,
      padding:         t.spacing.md,
      gap:             t.spacing.xs,
      borderLeftWidth: 3,
      borderLeftColor: t.colors.border,
    },
    skeletonTop:   { height: 16, width: '40%', borderRadius: 4, backgroundColor: t.colors.border },
    skeletonTitle: { height: 20, width: '90%', borderRadius: 4, backgroundColor: t.colors.border },
    skeletonMeta:  { height: 12, width: '60%', borderRadius: 4, backgroundColor: t.colors.border },

    // Center (error / empty)
    center: {
      paddingVertical: t.spacing.xxl,
      alignItems:      'center',
      gap:             t.spacing.sm,
    },
    errorTxt: { fontSize: t.font.sm, color: '#EF4444', textAlign: 'center' },
    emptyIcon: { fontSize: 32 },
    emptyTxt:  { fontSize: t.font.sm, color: t.colors.textHint, textAlign: 'center' },

    retryBtn: {
      paddingHorizontal: t.spacing.lg,
      paddingVertical:   t.spacing.sm,
      backgroundColor:   t.colors.primary,
      borderRadius:      t.radius.md,
      marginTop:         4,
    },
    retryBtnTxt: {
      fontSize:   t.font.sm,
      color:      '#fff',
      fontWeight: '700',
    },

    // Kartlar
    cards: { gap: t.spacing.sm },

    card: {
      backgroundColor: t.colors.surface,
      borderRadius:    t.radius.md,
      padding:         t.spacing.md,
      borderLeftWidth: 3,
      gap:             t.spacing.xs,
      ...t.shadows.sm,
    },
    cardTop: {
      flexDirection:  'row',
      justifyContent: 'space-between',
      alignItems:     'center',
    },
    cardMeta: {
      flexDirection: 'row',
      alignItems:    'center',
      gap:           t.spacing.xs,
      flex:          1,
    },
    examBadge: {
      paddingHorizontal: 7,
      paddingVertical:   2,
      borderRadius:      t.radius.sm,
    },
    examBadgeTxt: { fontSize: t.font.xs, fontWeight: '800' },
    category:     { fontSize: t.font.xs, color: t.colors.textSub, flex: 1 },

    dotsRow: { flexDirection: 'row', gap: 3 },
    dot:     { width: 7, height: 7, borderRadius: 3.5 },
    dotEmpty: { backgroundColor: t.colors.border },

    title: {
      fontSize:   t.font.md,
      fontWeight: '700',
      color:      t.colors.text,
      lineHeight: 20,
    },
    cardFooter: {
      flexDirection: 'row',
      alignItems:    'center',
      gap:           t.spacing.sm,
    },
    footerTxt: { fontSize: t.font.xs, color: t.colors.textHint },
    startBtn: {
      marginLeft: 'auto',
      color:      t.colors.primary,
      fontWeight: '700',
      fontSize:   t.font.sm,
    },
  })
}
