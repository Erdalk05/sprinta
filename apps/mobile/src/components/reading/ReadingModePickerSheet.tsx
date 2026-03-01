/**
 * ReadingModePickerSheet
 * Metne tıklayınca açılan okuma modu seçim sayfası.
 *
 * - Tüm okuma modlarını gösterir
 * - Kullanıcı mod seçer → pendingReadingStore'a yazar → egzersiz route'una gider
 * - Modal overlay olarak çalışır (Modal tabanlı bottom-sheet)
 */
import React, { useMemo, useCallback } from 'react'
import {
  View, Text, Modal, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, Platform,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'
import { useAppTheme } from '../../theme/useAppTheme'
import type { AppTheme } from '../../theme'
import { usePendingReadingStore } from '../../stores/pendingReadingStore'
import type { LibraryText } from './LibraryPreview'

// ─── Mod kategorileri ──────────────────────────────────────────
interface ModeOption {
  icon:     string
  label:    string
  subtitle: string
  route:    string
  tag:      'hız' | 'anlama' | 'odak' | 'kelime' | 'tarama' | 'süper'
}

const MODE_OPTIONS: ModeOption[] = [
  {
    icon: '⚡', label: 'Chunk Okuma',
    subtitle: 'RSVP • hız bloklarla şarjol',
    route: '/exercise/chunk-rsvp',
    tag: 'hız',
  },
  {
    icon: '🌊', label: 'Akış Okuma',
    subtitle: 'Satır pacing • sprint modu',
    route: '/exercise/flow-reading',
    tag: 'hız',
  },
  {
    icon: '⏱️', label: 'Zamanlı Okuma',
    subtitle: 'Süre baskısı • WPM rekoru',
    route: '/exercise/timed-reading',
    tag: 'hız',
  },
  {
    icon: '🏕️', label: 'Hızlı Okuma Kampı',
    subtitle: 'Günlük devre • WPM trend',
    route: '/exercise/speed-camp',
    tag: 'hız',
  },
  {
    icon: '📚', label: 'Akademik Mod',
    subtitle: 'Derin okuma • ağır metinler',
    route: '/exercise/academic-mode',
    tag: 'anlama',
  },
  {
    icon: '🔮', label: 'Tahmin Okuma',
    subtitle: 'Anlamsal bağlantı • tahmin et',
    route: '/exercise/prediction-reading',
    tag: 'anlama',
  },
  {
    icon: '🧠', label: 'Hafıza Sabitleme',
    subtitle: 'Spaced repetition • geri çağırma',
    route: '/exercise/memory-anchor',
    tag: 'anlama',
  },
  {
    icon: '👁️', label: 'Göz Genişliği',
    subtitle: 'Flash gruplar • span artır',
    route: '/exercise/fixation-trainer',
    tag: 'odak',
  },
  {
    icon: '🎯', label: 'Dikkat Filtresi',
    subtitle: 'Ritim • odak geliştirme',
    route: '/exercise/focus-filter',
    tag: 'odak',
  },
  {
    icon: '🔍', label: 'Anahtar Kelime Tarama',
    subtitle: 'Tarama tekniği • hızlı bulma',
    route: '/exercise/keyword-scan',
    tag: 'tarama',
  },
  {
    icon: '📖', label: 'Kelime Haznesi',
    subtitle: 'MCQ flash • LGS / TYT',
    route: '/exercise/vocabulary',
    tag: 'kelime',
  },
  {
    icon: '🧬', label: 'Biyonik Okuma',
    subtitle: 'Kalın ilk yarı • hızlı tanıma',
    route: '/exercise/bionic-reading',
    tag: 'süper',
  },
  {
    icon: '📜', label: 'Oto Kaydırma',
    subtitle: 'WPM bazlı rehberli okuma',
    route: '/exercise/auto-scroll',
    tag: 'hız',
  },
  {
    icon: '🪜', label: 'Hız Merdiveni',
    subtitle: 'Artan hızlı RSVP antrenmanı',
    route: '/exercise/speed-ladder',
    tag: 'hız',
  },
  {
    icon: '💫', label: 'Çok Kelime',
    subtitle: '2-4 kelime RSVP • span genişlet',
    route: '/exercise/word-burst',
    tag: 'süper',
  },
]

// ─── Tag renkleri ─────────────────────────────────────────────
const TAG_COLORS: Record<string, string> = {
  hız:    '#00C853',
  anlama: '#2196F3',
  odak:   '#FF9800',
  kelime: '#9C27B0',
  tarama: '#F44336',
  süper:  '#0EA5E9',
}
const TAG_LABELS: Record<string, string> = {
  hız:    'Hız',
  anlama: 'Anlama',
  odak:   'Odak',
  kelime: 'Kelime',
  tarama: 'Tarama',
  süper:  'Süper',
}

// ─── Props ────────────────────────────────────────────────────
interface ReadingModePickerSheetProps {
  visible:   boolean
  text:      LibraryText | null
  onClose:   () => void
}

// ─── Bileşen ─────────────────────────────────────────────────
export function ReadingModePickerSheet({
  visible, text, onClose,
}: ReadingModePickerSheetProps) {
  const t      = useAppTheme()
  const s      = useMemo(() => createStyles(t), [t])
  const router = useRouter()
  const setPending = usePendingReadingStore(st => st.set)

  const handleModePress = useCallback((mode: ModeOption) => {
    if (!text) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    // Metni store'a yaz
    setPending({
      textId:    text.id,
      title:     text.title,
      examType:  text.exam_type,
      category:  text.category,
      wordCount: text.word_count ?? 0,
    })
    // Modu kapat
    onClose()
    // Egzersiz route'una git
    router.push(mode.route as any)
  }, [text, setPending, onClose, router])

  if (!text) return null

  // Diff rengi
  const diffColors = ['#10B981', '#0EA5E9', '#F59E0B', '#EF4444', '#8B5CF6']
  const diffColor  = diffColors[Math.min((text.difficulty ?? 1) - 1, 4)] ?? '#10B981'

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={s.overlay}>
        <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={onClose} />

        <SafeAreaView style={s.sheet}>
          {/* ── Handle çubuğu ───────────────────────────── */}
          <View style={s.handle} />

          {/* ── Metin bilgisi ────────────────────────────── */}
          <View style={s.textInfo}>
            <View style={s.textInfoTop}>
              <View style={[s.examBadge, { backgroundColor: '#3B82F622' }]}>
                <Text style={[s.examBadgeTxt, { color: '#3B82F6' }]}>{text.exam_type}</Text>
              </View>
              <Text style={[s.categoryTxt]}>{text.category}</Text>
              <View style={{ flex: 1 }} />
              {/* Güçlük dots */}
              <View style={s.dotsRow}>
                {[1,2,3,4,5].map(i => (
                  <View key={i} style={[s.dot, i <= (text.difficulty ?? 1)
                    ? { backgroundColor: diffColor } : s.dotEmpty]} />
                ))}
              </View>
            </View>
            <Text style={s.textTitle} numberOfLines={2}>{text.title}</Text>
            <Text style={s.textMeta}>
              📝 {text.word_count ?? '—'} kelime
              {text.estimated_read_time ? `  ⏱ ~${text.estimated_read_time} dk` : ''}
            </Text>
          </View>

          {/* ── Başlık ──────────────────────────────────── */}
          <View style={s.headerRow}>
            <Text style={s.headerTitle}>Okuma Modunu Seç</Text>
            <TouchableOpacity style={s.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={s.closeBtnTxt}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* ── Mod listesi ─────────────────────────────── */}
          <ScrollView
            style={s.scroll}
            contentContainerStyle={s.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {MODE_OPTIONS.map(mode => {
              const tc = TAG_COLORS[mode.tag] ?? '#888'
              return (
                <TouchableOpacity
                  key={mode.route}
                  style={s.modeRow}
                  onPress={() => handleModePress(mode)}
                  activeOpacity={0.75}
                >
                  <View style={[s.modeIconBox, { backgroundColor: tc + '20' }]}>
                    <Text style={s.modeIcon}>{mode.icon}</Text>
                  </View>
                  <View style={s.modeText}>
                    <Text style={s.modeLabel}>{mode.label}</Text>
                    <Text style={s.modeSub}>{mode.subtitle}</Text>
                  </View>
                  <View style={[s.tagBadge, { backgroundColor: tc + '18' }]}>
                    <Text style={[s.tagTxt, { color: tc }]}>{TAG_LABELS[mode.tag]}</Text>
                  </View>
                  <Text style={s.arrow}>›</Text>
                </TouchableOpacity>
              )
            })}
            <View style={{ height: Platform.OS === 'ios' ? 20 : 12 }} />
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  )
}

// ─── Stiller ─────────────────────────────────────────────────
function createStyles(t: AppTheme) {
  return StyleSheet.create({
    overlay: {
      flex:            1,
      justifyContent:  'flex-end',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
    },
    sheet: {
      backgroundColor: t.colors.background,
      borderTopLeftRadius:  20,
      borderTopRightRadius: 20,
      maxHeight: '90%',
      paddingHorizontal: t.spacing.md,
      paddingTop: t.spacing.xs,
    },
    handle: {
      width: 40, height: 4,
      backgroundColor: t.colors.border,
      borderRadius: 2,
      alignSelf: 'center',
      marginBottom: t.spacing.sm,
    },

    // Metin bilgisi
    textInfo: {
      backgroundColor: t.colors.surface,
      borderRadius:    t.radius.md,
      padding:         t.spacing.sm,
      marginBottom:    t.spacing.sm,
      gap:             4,
      borderWidth:     1,
      borderColor:     t.colors.border,
    },
    textInfoTop: {
      flexDirection: 'row',
      alignItems:    'center',
      gap:           t.spacing.xs,
    },
    examBadge: {
      paddingHorizontal: 7,
      paddingVertical:   2,
      borderRadius:      t.radius.sm,
    },
    examBadgeTxt: { fontSize: t.font.xs, fontWeight: '800' },
    categoryTxt:  { fontSize: t.font.xs, color: t.colors.textSub },
    dotsRow:      { flexDirection: 'row', gap: 3 },
    dot:          { width: 6, height: 6, borderRadius: 3 },
    dotEmpty:     { backgroundColor: t.colors.border },
    textTitle:    { fontSize: t.font.md, fontWeight: '700', color: t.colors.text, lineHeight: 20 },
    textMeta:     { fontSize: t.font.xs, color: t.colors.textHint },

    // Header
    headerRow: {
      flexDirection:  'row',
      alignItems:     'center',
      justifyContent: 'space-between',
      marginBottom:   t.spacing.sm,
    },
    headerTitle: { fontSize: t.font.lg, fontWeight: '800', color: t.colors.text },
    closeBtn: {
      width: 30, height: 30,
      borderRadius:    15,
      backgroundColor: t.colors.surface,
      alignItems:      'center',
      justifyContent:  'center',
      borderWidth:     1,
      borderColor:     t.colors.border,
    },
    closeBtnTxt: { fontSize: 14, color: t.colors.textHint, fontWeight: '700' },

    // Scroll
    scroll:        { flexGrow: 0 },
    scrollContent: { gap: 6 },

    // Mod satırı
    modeRow: {
      flexDirection:   'row',
      alignItems:      'center',
      gap:             t.spacing.sm,
      backgroundColor: t.colors.surface,
      borderRadius:    t.radius.md,
      padding:         t.spacing.sm,
      borderWidth:     1,
      borderColor:     t.colors.border,
    },
    modeIconBox: {
      width:          44,
      height:         44,
      borderRadius:   t.radius.sm,
      alignItems:     'center',
      justifyContent: 'center',
    },
    modeIcon:  { fontSize: 22 },
    modeText:  { flex: 1, gap: 2 },
    modeLabel: { fontSize: t.font.sm, fontWeight: '700', color: t.colors.text },
    modeSub:   { fontSize: t.font.xs, color: t.colors.textHint },
    tagBadge:  { paddingHorizontal: 8, paddingVertical: 3, borderRadius: t.radius.pill },
    tagTxt:    { fontSize: 11, fontWeight: '700' },
    arrow:     { fontSize: 18, color: t.colors.textHint, fontWeight: '700' },
  })
}
