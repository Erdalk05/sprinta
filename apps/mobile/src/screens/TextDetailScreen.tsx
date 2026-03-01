// =====================================================
// TextDetailScreen — Sprint 5 (Revision)
//
// Metin Detay Ekranı
//   - Animated skeleton (opacity pulse loop)
//   - DifficultyDots (5 daire, theme primary/border)
//   - ExamBadge (theme token tabanlı renkler)
//   - 3-sütunlu stats row (kelime · okuma · bölüm)
//   - "Devam ►" badge — progress.chapter_id eşleşmesi
//   - CTA subtitle (% tamamlandı)
//   - fetchKey: retry düzgün tetikler
//   - Auth guard (useAuthStore)
// =====================================================

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Animated,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { createClient } from '@supabase/supabase-js'
import * as Haptics from 'expo-haptics'
import { useAuthStore }  from '../stores/authStore'
import { useAppTheme }   from '../theme/useAppTheme'
import type { AppTheme } from '../theme'
import { createLibraryService } from '@sprinta/api'
import type { TextWithProgress, TextChapter } from '@sprinta/api'

// ─── Supabase (modül seviyesi) ────────────────────────
const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
)
const libraryService = createLibraryService(supabase)

// ─── Exam badge renkleri (tema token'lardan) ──────────
function examBadgeColors(
  examType: string,
  t: AppTheme,
): { bg: string; text: string } {
  switch (examType) {
    case 'LGS':  return { bg: t.colors.info        + '33', text: t.colors.info        }
    case 'TYT':  return { bg: t.colors.primary      + '33', text: t.colors.primary      }
    case 'ALES': return { bg: t.colors.warning      + '33', text: t.colors.warning      }
    case 'KPSS': return { bg: t.colors.primaryDark  + '44', text: t.colors.primaryDark  }
    default:     return { bg: t.colors.border,               text: t.colors.textHint     }
  }
}

// ─── Sayı formatı (Türkçe: 12.450) ───────────────────
function fmtNum(n: number): string {
  return n.toLocaleString('tr-TR')
}

// ─── Difficulty Dots ──────────────────────────────────
const DifficultyDots = React.memo(function DifficultyDots({
  level, t,
}: { level: number; t: AppTheme }) {
  return (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <View
          key={i}
          style={{
            width: 8, height: 8, borderRadius: 4,
            backgroundColor: i <= level ? t.colors.primary : t.colors.border,
          }}
        />
      ))}
    </View>
  )
})

// ─── Loading Skeleton (pulse animasyonlu) ─────────────
const LoadingSkeleton = React.memo(function LoadingSkeleton({
  s,
}: { s: ReturnType<typeof createStyles> }) {
  const pulseAnim = useRef(new Animated.Value(0.3)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.7, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 700, useNativeDriver: true }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [pulseAnim])

  return (
    <Animated.View style={[s.skeletonWrap, { opacity: pulseAnim }]}>
      <View style={[s.skeletonLine, { width: '65%', height: 22, marginBottom: 10 }]} />
      <View style={[s.skeletonLine, { width: '45%', height: 14, marginBottom: 20 }]} />
      <View style={[s.skeletonLine, { width: '100%', height: 64, marginBottom: 12 }]} />
      <View style={[s.skeletonLine, { width: '100%', height: 48, marginBottom: 12 }]} />
      <View style={[s.skeletonLine, { width: '100%', height: 180 }]} />
    </Animated.View>
  )
})

// ─── Chapter Row ──────────────────────────────────────
interface ChapterRowProps {
  chapter:   TextChapter
  index:     number
  isCurrent: boolean
  onPress:   (chapter: TextChapter) => void
  s:         ReturnType<typeof createStyles>
  t:         AppTheme
}

const ChapterRow = React.memo(function ChapterRow({
  chapter, index, isCurrent, onPress, s, t,
}: ChapterRowProps) {
  return (
    <TouchableOpacity
      style={s.chapterRow}
      onPress={() => onPress(chapter)}
      activeOpacity={0.7}
    >
      <View style={s.chapterNum}>
        <Text style={s.chapterNumTxt}>{index + 1}</Text>
      </View>
      <View style={s.chapterBody}>
        <Text style={s.chapterTitle} numberOfLines={1}>{chapter.title}</Text>
        {chapter.word_count != null && (
          <Text style={s.chapterMeta}>{fmtNum(chapter.word_count)} kelime</Text>
        )}
      </View>
      <View style={s.chapterRight}>
        {isCurrent ? (
          <View style={[s.resumeBadge, { backgroundColor: t.colors.primary + '22' }]}>
            <Text style={[s.resumeTxt, { color: t.colors.primary }]}>Devam ►</Text>
          </View>
        ) : (
          <Text style={s.chapterArrow}>›</Text>
        )}
      </View>
    </TouchableOpacity>
  )
})

// ─── Ana ekran ────────────────────────────────────────
export default function TextDetailScreen() {
  const { textId } = useLocalSearchParams<{ textId: string }>()
  const router     = useRouter()
  const t          = useAppTheme()
  const s          = useMemo(() => createStyles(t), [t])
  const student    = useAuthStore(st => st.student)

  const [textData, setTextData] = useState<TextWithProgress | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)
  const [fetchKey, setFetchKey] = useState(0)

  // ── Fetch ──────────────────────────────────────────────
  useEffect(() => {
    if (!textId) {
      setError('Metin bulunamadı.')
      setLoading(false)
      return
    }
    if (!student) {
      setError('Oturum bulunamadı.')
      setLoading(false)
      return
    }

    let cancelled = false

    async function load(): Promise<void> {
      setLoading(true)
      setError(null)
      try {
        const result = await libraryService.getTextWithProgress(textId)
        if (cancelled) return
        if (result.error || !result.data) {
          setError(result.error ?? 'Metin yüklenemedi.')
        } else {
          setTextData(result.data)
        }
      } catch {
        if (!cancelled) setError('Bağlantı hatası. Tekrar dene.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [textId, student, fetchKey])

  // ── Handlers ──────────────────────────────────────────
  const handleBack  = useCallback((): void => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    router.back()
  }, [router])

  const handleRetry = useCallback((): void => {
    setFetchKey(k => k + 1)
  }, [])

  const navigateToReader = useCallback((
    chapterId: string,
    totalChapters: number,
  ): void => {
    if (!textId) return
    router.push({
      pathname: '/reader' as any,
      params: {
        textId,
        chapterId,
        totalChapters: String(totalChapters),
      },
    })
  }, [router, textId])

  const handleChapterPress = useCallback((chapter: TextChapter): void => {
    if (!textData) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    navigateToReader(chapter.id, textData.chapters.length)
  }, [navigateToReader, textData])

  const handleStartReading = useCallback((): void => {
    if (!textData || !textId) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    const { progress, chapters } = textData

    // Kaldığı bölümden devam et
    if (progress?.chapter_id && chapters.length > 0) {
      const cont = chapters.find(c => c.id === progress.chapter_id)
      if (cont) {
        navigateToReader(cont.id, chapters.length)
        return
      }
    }

    // İlk bölümden başla
    const first = chapters[0]
    if (first) {
      navigateToReader(first.id, chapters.length)
    } else {
      // Bölümsüz metin
      router.push({
        pathname: '/reader' as any,
        params: { textId, totalChapters: '0' },
      })
    }
  }, [router, textId, textData, navigateToReader])

  // ── Derived ───────────────────────────────────────────
  const progressPercent  = useMemo((): number => {
    if (!textData?.progress) return 0
    return Math.round(textData.progress.last_ratio * 100)
  }, [textData])

  const hasProgress      = progressPercent > 2
  const currentChapterId = textData?.progress?.chapter_id ?? null
  const ctaDisabled      = !textData || textData.chapters.length === 0
  const ctaLabel         = ctaDisabled
    ? 'İçerik Hazırlanıyor'
    : hasProgress
    ? 'Kaldığın Yerden Devam Et'
    : 'Okumaya Başla'
  const ctaSub           = hasProgress ? `%${progressPercent} tamamlandı` : null

  // ─────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.safe}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.hBack} onPress={handleBack} activeOpacity={0.7}>
          <Text style={s.hBackTxt}>‹</Text>
        </TouchableOpacity>
        <Text style={s.hTitle} numberOfLines={1}>Metin Detayı</Text>
        <View style={s.hBack} />
      </View>

      {loading ? (
        <ScrollView contentContainerStyle={s.content}>
          <LoadingSkeleton s={s} />
        </ScrollView>

      ) : error ? (
        <View style={s.centerBox}>
          <Text style={s.errorTxt}>⚠️  {error}</Text>
          <TouchableOpacity style={s.retryBtn} onPress={handleRetry}>
            <Text style={s.retryTxt}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>

      ) : textData ? (
        <>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>

            {/* ── Meta kart ───────────────────────────── */}
            <View style={s.metaCard}>
              <View style={s.topRow}>
                {(() => {
                  const c = examBadgeColors(textData.exam_type, t)
                  return (
                    <View style={[s.examBadge, { backgroundColor: c.bg }]}>
                      <Text style={[s.examTxt, { color: c.text }]}>{textData.exam_type}</Text>
                    </View>
                  )
                })()}
                <DifficultyDots level={textData.difficulty} t={t} />
              </View>

              <Text style={s.textTitle}>{textData.title}</Text>
              <Text style={s.textCategory}>{textData.category}</Text>

              {hasProgress && (
                <View style={s.progressWrap}>
                  <View style={s.progressBg}>
                    <View style={[s.progressFill, { width: `${progressPercent}%` as any }]} />
                  </View>
                  <Text style={s.progressTxt}>%{progressPercent} tamamlandı</Text>
                </View>
              )}
            </View>

            {/* ── Stats row ───────────────────────────── */}
            <View style={s.statsRow}>
              <View style={s.statCard}>
                <Text style={s.statValue}>{fmtNum(textData.word_count)}</Text>
                <Text style={s.statLabel}>Kelime</Text>
              </View>
              <View style={[s.statCard, s.statCardMid]}>
                <Text style={s.statValue}>~{textData.estimated_read_time} dk</Text>
                <Text style={s.statLabel}>Okuma</Text>
              </View>
              <View style={s.statCard}>
                <Text style={s.statValue}>{textData.chapters.length}</Text>
                <Text style={s.statLabel}>Bölüm</Text>
              </View>
            </View>

            {/* ── Bölümler ────────────────────────────── */}
            {textData.chapters.length > 0 && (
              <View style={s.chapterCard}>
                <Text style={s.sectionLabel}>BÖLÜMLER</Text>
                {textData.chapters.map((ch, i) => (
                  <ChapterRow
                    key={ch.id}
                    chapter={ch}
                    index={i}
                    isCurrent={ch.id === currentChapterId}
                    onPress={handleChapterPress}
                    s={s}
                    t={t}
                  />
                ))}
              </View>
            )}

            <View style={{ height: 120 }} />
          </ScrollView>

          {/* ── CTA ─────────────────────────────────── */}
          <View style={s.ctaBar}>
            <TouchableOpacity
              style={[s.ctaBtn, ctaDisabled && s.ctaBtnDim]}
              onPress={handleStartReading}
              disabled={ctaDisabled}
              activeOpacity={0.85}
            >
              <Text style={s.ctaTxt}>{ctaLabel}</Text>
              {ctaSub != null && <Text style={s.ctaSub}>{ctaSub}</Text>}
            </TouchableOpacity>
          </View>
        </>
      ) : null}

    </SafeAreaView>
  )
}

// ─── Stiller ──────────────────────────────────────────
function createStyles(t: AppTheme) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.colors.background },

    header: {
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: t.spacing.lg, paddingVertical: t.spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: t.colors.divider,
      backgroundColor: t.colors.surface,
    },
    hBack:    { minWidth: 36, alignItems: 'center' },
    hBackTxt: { fontSize: 28, color: t.colors.primary, fontWeight: '300', lineHeight: 32 },
    hTitle:   {
      flex: 1, textAlign: 'center',
      fontSize: t.font.md, fontWeight: '700', color: t.colors.text,
    },

    content:   { padding: t.spacing.lg, gap: t.spacing.md },
    centerBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: t.spacing.xl },
    errorTxt:  {
      fontSize: t.font.md, color: t.colors.error,
      textAlign: 'center', marginBottom: t.spacing.lg,
    },
    retryBtn: {
      backgroundColor: t.colors.primary,
      paddingHorizontal: t.spacing.xxl, paddingVertical: t.spacing.sm,
      borderRadius: t.radius.md,
    },
    retryTxt: { color: t.colors.white, fontWeight: '700', fontSize: t.font.sm },

    // Meta card
    metaCard: {
      backgroundColor: t.colors.surface, borderRadius: t.radius.lg,
      padding: t.spacing.lg,
      borderWidth: StyleSheet.hairlineWidth, borderColor: t.colors.border,
      ...t.shadows.sm,
    },
    topRow:   {
      flexDirection: 'row', alignItems: 'center',
      justifyContent: 'space-between', marginBottom: t.spacing.sm,
    },
    examBadge: { borderRadius: t.radius.pill, paddingHorizontal: t.spacing.md, paddingVertical: 3 },
    examTxt:   { fontSize: t.font.xs, fontWeight: '700' },
    textTitle: {
      fontSize: t.font.xxl, fontWeight: '800',
      color: t.colors.text, marginBottom: 4,
    },
    textCategory: { fontSize: t.font.sm, color: t.colors.textHint, marginBottom: t.spacing.sm },

    progressWrap: { marginTop: t.spacing.sm },
    progressBg:   {
      height: 6, backgroundColor: t.colors.border,
      borderRadius: 3, overflow: 'hidden', marginBottom: 4,
    },
    progressFill: { height: '100%', backgroundColor: t.colors.primary, borderRadius: 3 },
    progressTxt:  { fontSize: t.font.xs, color: t.colors.primary, fontWeight: '600' },

    // Stats row — 3 eşit sütun
    statsRow: { flexDirection: 'row', gap: t.spacing.sm },
    statCard: {
      flex: 1, backgroundColor: t.colors.surface, borderRadius: t.radius.md,
      padding: t.spacing.md, alignItems: 'center',
      borderWidth: StyleSheet.hairlineWidth, borderColor: t.colors.border,
      ...t.shadows.sm,
    },
    statCardMid: { borderColor: t.colors.primary + '44' },
    statValue:   { fontSize: t.font.lg, fontWeight: '800', color: t.colors.text, marginBottom: 2 },
    statLabel:   { fontSize: t.font.xs, color: t.colors.textHint, fontWeight: '600' },

    // Chapters
    chapterCard: {
      backgroundColor: t.colors.surface, borderRadius: t.radius.lg,
      padding: t.spacing.md,
      borderWidth: StyleSheet.hairlineWidth, borderColor: t.colors.border,
    },
    sectionLabel: {
      fontSize: t.font.xs, fontWeight: '800', color: t.colors.textHint,
      letterSpacing: 1, marginBottom: t.spacing.sm,
    },
    chapterRow: {
      flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm,
      paddingVertical: t.spacing.sm,
      borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.colors.border,
    },
    chapterNum:    {
      width: 28, height: 28, borderRadius: 14,
      backgroundColor: t.colors.primary + '22',
      alignItems: 'center', justifyContent: 'center',
    },
    chapterNumTxt: { fontSize: t.font.sm, fontWeight: '700', color: t.colors.primary },
    chapterBody:   { flex: 1 },
    chapterTitle:  { fontSize: t.font.sm, fontWeight: '600', color: t.colors.text },
    chapterMeta:   { fontSize: t.font.xs, color: t.colors.textHint, marginTop: 2 },
    chapterRight:  { alignItems: 'flex-end', minWidth: 60 },
    chapterArrow:  { fontSize: t.font.lg, color: t.colors.textHint },
    resumeBadge:   { borderRadius: t.radius.sm, paddingHorizontal: 6, paddingVertical: 2 },
    resumeTxt:     { fontSize: t.font.xs, fontWeight: '700' },

    // CTA
    ctaBar: {
      padding: t.spacing.lg, backgroundColor: t.colors.surface,
      borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.colors.border,
    },
    ctaBtn: {
      backgroundColor: t.colors.primary, borderRadius: t.radius.lg,
      paddingVertical: t.spacing.md + 2, alignItems: 'center',
    },
    ctaBtnDim: { backgroundColor: t.colors.border },
    ctaTxt:    { fontSize: t.font.lg, fontWeight: '800', color: t.colors.white },
    ctaSub:    { fontSize: t.font.xs, color: t.colors.white, opacity: 0.8, marginTop: 2 },

    // Skeleton
    skeletonWrap: { gap: t.spacing.sm },
    skeletonLine: { backgroundColor: t.colors.border, borderRadius: t.radius.sm },
  })
}
