// =====================================================
// LibraryPreview — library/ katmanı (Sprint 5)
//
// TextItem (@sprinta/api) kullanan pure display component.
// Router ve state YOK — parent tüm logic'i sahiplenir.
// =====================================================

import React, { useMemo } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native'
import { useAppTheme } from '../../theme/useAppTheme'
import type { AppTheme } from '../../theme'
import type { TextItem } from '@sprinta/api'

// ─── Sınav filtresi tipleri ───────────────────────────
export type ExamFilter = 'Tümü' | 'LGS' | 'TYT' | 'ALES' | 'KPSS' | 'General'
export const EXAM_FILTERS: ExamFilter[] = ['Tümü', 'LGS', 'TYT', 'ALES', 'KPSS', 'General']

// ─── Props ────────────────────────────────────────────
export interface LibraryPreviewProps {
  texts:          TextItem[]
  loading:        boolean
  error:          string | null
  filter:         ExamFilter
  onFilterChange: (f: ExamFilter) => void
  onTextPress:    (text: TextItem) => void
}

// ─── Difficulty noktaları ─────────────────────────────
const DifficultyDots = React.memo(function DifficultyDots({
  level, t,
}: { level: number; t: AppTheme }) {
  return (
    <View style={{ flexDirection: 'row', gap: 3 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <View
          key={i}
          style={{
            width:           6, height: 6,
            borderRadius:    3,
            backgroundColor: i <= level ? t.colors.primary : t.colors.border,
          }}
        />
      ))}
    </View>
  )
})

// ─── Text kartı ───────────────────────────────────────
interface TextCardProps {
  text:    TextItem
  onPress: (text: TextItem) => void
  s:       ReturnType<typeof createStyles>
  t:       AppTheme
}

const TextCard = React.memo(function TextCard({ text, onPress, s, t }: TextCardProps) {
  return (
    <TouchableOpacity
      style={s.card}
      onPress={() => onPress(text)}
      activeOpacity={0.75}
    >
      <View style={s.cardTop}>
        <Text style={s.cardTitle} numberOfLines={2}>{text.title}</Text>
        <View style={s.cardBadge}>
          <Text style={s.cardBadgeTxt}>{text.exam_type}</Text>
        </View>
      </View>
      <Text style={s.cardCategory} numberOfLines={1}>{text.category}</Text>
      <View style={s.cardBottom}>
        <DifficultyDots level={text.difficulty} t={t} />
        <Text style={s.cardMeta}>
          {text.word_count} kelime · ~{text.estimated_read_time} dk
        </Text>
      </View>
    </TouchableOpacity>
  )
})

// ─── LibraryPreview ───────────────────────────────────
export const LibraryPreview = React.memo(function LibraryPreview({
  texts, loading, error, filter, onFilterChange, onTextPress,
}: LibraryPreviewProps) {
  const t = useAppTheme()
  const s = useMemo(() => createStyles(t), [t])

  return (
    <View style={s.container}>

      {/* Filter chips */}
      <View style={s.filterRow}>
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
      </View>

      {/* Content */}
      {loading ? (
        <View style={s.centerBox}>
          <ActivityIndicator size="small" color={t.colors.primary} />
        </View>
      ) : error ? (
        <View style={s.centerBox}>
          <Text style={s.errorTxt}>⚠️  {error}</Text>
        </View>
      ) : texts.length === 0 ? (
        <View style={s.centerBox}>
          <Text style={s.emptyTxt}>Bu filtrede metin bulunamadı.</Text>
        </View>
      ) : (
        <View style={s.list}>
          {texts.map(text => (
            <TextCard
              key={text.id}
              text={text}
              onPress={onTextPress}
              s={s}
              t={t}
            />
          ))}
        </View>
      )}

    </View>
  )
})

// ─── Stiller ──────────────────────────────────────────
function createStyles(t: AppTheme) {
  return StyleSheet.create({
    container: { gap: 12 },

    filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    chip: {
      paddingHorizontal: 12,
      paddingVertical:   5,
      borderRadius:      20,
      backgroundColor:   t.colors.surface,
      borderWidth:       StyleSheet.hairlineWidth,
      borderColor:       t.colors.border,
    },
    chipActive:   { backgroundColor: t.colors.primary, borderColor: t.colors.primary },
    chipTxt:      { fontSize: t.font.xs, fontWeight: '600', color: t.colors.textHint },
    chipTxtActive: { color: '#FFF' },

    centerBox: { paddingVertical: 24, alignItems: 'center' },
    errorTxt:  { fontSize: t.font.sm, color: '#EF4444' },
    emptyTxt:  { fontSize: t.font.sm, color: t.colors.textHint },

    list: { gap: 10 },
    card: {
      backgroundColor: t.colors.surface,
      borderRadius:    t.radius.lg,
      padding:         t.spacing.md,
      borderWidth:     StyleSheet.hairlineWidth,
      borderColor:     t.colors.border,
      ...t.shadows.sm,
    },
    cardTop: {
      flexDirection:  'row',
      justifyContent: 'space-between',
      alignItems:     'flex-start',
      marginBottom:   4,
      gap:            8,
    },
    cardTitle:    { flex: 1, fontSize: t.font.sm, fontWeight: '700', color: t.colors.text },
    cardBadge:    {
      backgroundColor: t.colors.primary + '22',
      borderRadius:    4,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    cardBadgeTxt: { fontSize: t.font.xs, fontWeight: '700', color: t.colors.primary },
    cardCategory: { fontSize: t.font.xs, color: t.colors.textHint, marginBottom: 8 },
    cardBottom:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardMeta:     { fontSize: t.font.xs, color: t.colors.textHint },
  })
}
