// =====================================================
// ReaderScreen — Sprint 5 (Revision)
//
// Sürükleyici Okuma Ekranı (Immersive Reader)
//
// Kurallar:
//   - TouchableWithoutFeedback → tam ekran tap (scroll engellenmez)
//   - overlayVisible: useState(false) — başlangıçta gizli
//   - overlayAnim: Animated.Value(0) — 0=gizli, 1=görünür
//   - scrollRatio: useRef — re-render YOK
//   - isSaving: useState — back butonu loading indicator
//   - Scroll restore: onLayout + restoreRatioRef
//   - Chapter change: in-place setState (router.replace YOK)
//   - scrollEventThrottle={16}
//   - Tüm timer'lar cleanup'ta temizlenir
// =====================================================

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, TouchableWithoutFeedback,
  StyleSheet, SafeAreaView, Animated, ActivityIndicator,
} from 'react-native'
import type { NativeScrollEvent, NativeSyntheticEvent, LayoutChangeEvent } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { supabase } from '../lib/supabase'
import * as Haptics from 'expo-haptics'
import { useAuthStore }  from '../stores/authStore'
import { useAppTheme }   from '../theme/useAppTheme'
import type { AppTheme } from '../theme'
import { createLibraryService, createAdaptiveService, createQuestionService } from '@sprinta/api'
import type { TextChapter, RecordChapterSessionInput, TextQuestion, QuestionAnswer } from '@sprinta/api'
import { QuestionModal }    from '../components/reading/QuestionModal'    // SPRINT 10 ADD
import { BookmarksDrawer } from '../components/reading/BookmarksDrawer'  // SPRINT 11 ADD

// ─── Services (singleton supabase kullanır) ───────────
const libraryService  = createLibraryService(supabase)
const adaptiveService = createAdaptiveService(supabase)  // SPRINT 7 ADD
const questionService = createQuestionService(supabase)  // SPRINT 10 ADD

const SAVE_THROTTLE_MS  = 500
const OVERLAY_HIDE_MS   = 3000
const OVERLAY_FADE_MS   = 300

// ─── Ana ekran ────────────────────────────────────────
export default function ReaderScreen() {
  const {
    textId,
    chapterId,
    totalChapters: totalChaptersParam,
  } = useLocalSearchParams<{
    textId:          string
    chapterId?:      string
    totalChapters?:  string
  }>()

  const router  = useRouter()
  const t       = useAppTheme()
  const s       = useMemo(() => createStyles(t), [t])
  const student = useAuthStore(st => st.student)

  const totalChapters = parseInt(totalChaptersParam ?? '0', 10)
  const hasChapterId  = Boolean(chapterId && chapterId !== 'null' && chapterId !== '')

  // ── Content state ──────────────────────────────────────
  const [chapter,           setChapter]           = useState<TextChapter | null>(null)
  const [loading,           setLoading]           = useState<boolean>(true)
  const [error,             setError]             = useState<string | null>(null)
  const [currentChapterNum, setCurrentChapterNum] = useState<number>(1)
  const [isSaving,          setIsSaving]          = useState<boolean>(false)
  const [isChangingChapter, setIsChangingChapter] = useState<boolean>(false)

  // ── Overlay state ──────────────────────────────────────
  const [overlayVisible,     setOverlayVisible]     = useState<boolean>(false)
  const [overlayProgressPct, setOverlayProgressPct] = useState<number>(0)
  const overlayAnim     = useRef(new Animated.Value(0)).current
  const overlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Scroll refs (no useState — no re-renders) ─────────
  const scrollViewRef     = useRef<ScrollView>(null)
  const contentHeightRef  = useRef<number>(0)
  const viewportHeightRef = useRef<number>(0)
  const scrollRatioRef    = useRef<number>(0)
  const saveThrottleRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const restoreRatioRef   = useRef<number>(0)

  // SPRINT 10 ADD — soru modal state
  const [questions,      setQuestions]      = useState<TextQuestion[]>([])
  const [showQuestions,  setShowQuestions]  = useState(false)
  const questionShownRef = useRef(false)  // her bölüm için bir kez

  // SPRINT 11 ADD — yer imi drawer
  const [showBookmarks, setShowBookmarks] = useState(false)

  // SPRINT 7 ADD — session tracking refs (no re-renders)
  const chapterStartTimeRef    = useRef<string>(new Date().toISOString())
  const scrollSpeedSamplesRef  = useRef<number[]>([])
  const lastScrollYRef         = useRef<number>(0)
  const lastScrollTimeRef      = useRef<number>(Date.now())

  // ── Fetch bölüm + ilerleme ─────────────────────────────
  useEffect(() => {
    if (!textId) {
      setError('Metin bulunamadı.')
      setLoading(false)
      return
    }

    let cancelled = false

    async function loadContent(): Promise<void> {
      setLoading(true)
      setError(null)
      scrollRatioRef.current = 0
      restoreRatioRef.current = 0

      try {
        if (hasChapterId) {
          const [chapterRes, progressRes] = await Promise.all([
            libraryService.getChapterById(chapterId!),
            libraryService.getReadingProgress(textId),
          ])
          if (cancelled) return
          if (chapterRes.error || !chapterRes.data) {
            setError('Bölüm yüklenemedi.')
            return
          }
          setChapter(chapterRes.data)
          setCurrentChapterNum(chapterRes.data.chapter_number)

          // Scroll restore — aynı bölüm ise
          const prog = progressRes.data
          if (prog?.chapter_id === chapterRes.data.id && prog.last_ratio > 0) {
            restoreRatioRef.current = prog.last_ratio
          }

        } else {
          // Bölümsüz metin → text body'yi chapter olarak kullan
          const [textRes, progressRes] = await Promise.all([
            libraryService.getTextById(textId),
            libraryService.getReadingProgress(textId),
          ])
          if (cancelled) return
          if (textRes.error || !textRes.data) {
            setError('Metin yüklenemedi.')
            return
          }
          const fake: TextChapter = {
            id:             textRes.data.id,
            text_id:        textRes.data.id,
            chapter_number: 1,
            title:          textRes.data.title,
            body:           textRes.data.body,
            word_count:     textRes.data.word_count,
            created_at:     textRes.data.created_at,
          }
          setChapter(fake)
          setCurrentChapterNum(1)

          const prog = progressRes.data
          if (prog && prog.last_ratio > 0) {
            restoreRatioRef.current = prog.last_ratio
          }
        }
      } catch {
        if (!cancelled) setError('Bağlantı hatası.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadContent()
    return () => { cancelled = true }
  }, [textId, chapterId])

  // SPRINT 10 ADD — chapter değişince soruları yükle ve state sıfırla
  useEffect(() => {
    if (!chapter || !textId) return
    questionShownRef.current = false
    setShowQuestions(false)
    setQuestions([])

    questionService
      .getQuestions(textId, hasChapterId ? (chapterId ?? undefined) : undefined)
      .then(({ data }) => {
        if (data && data.length > 0) setQuestions(data)
      })
      .catch(() => {})
  }, [chapter?.id]) // eslint-disable-line

  // ── Timer cleanup ──────────────────────────────────────
  useEffect(() => {
    return () => {
      if (saveThrottleRef.current)  clearTimeout(saveThrottleRef.current)
      if (overlayTimerRef.current)  clearTimeout(overlayTimerRef.current)
    }
  }, [])

  // ── Overlay helpers ────────────────────────────────────
  const scheduleOverlayHide = useCallback((): void => {
    if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current)
    overlayTimerRef.current = setTimeout(() => {
      Animated.timing(overlayAnim, {
        toValue: 0, duration: OVERLAY_FADE_MS, useNativeDriver: true,
      }).start()
      setTimeout(() => setOverlayVisible(false), OVERLAY_FADE_MS)
    }, OVERLAY_HIDE_MS)
  }, [overlayAnim])

  const handleScreenTap = useCallback((): void => {
    if (!overlayVisible) {
      // Mevcut progress snapshot'ı al
      setOverlayProgressPct(Math.round(scrollRatioRef.current * 100))
      setOverlayVisible(true)
      Animated.timing(overlayAnim, {
        toValue: 1, duration: 200, useNativeDriver: true,
      }).start()
      scheduleOverlayHide()
    } else {
      // Zaten görünür — timer'ı sıfırla
      scheduleOverlayHide()
    }
  }, [overlayVisible, overlayAnim, scheduleOverlayHide])

  // ── Scroll tracking (no setState!) ────────────────────
  const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>): void => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent
    contentHeightRef.current  = contentSize.height
    viewportHeightRef.current = layoutMeasurement.height
    const maxScroll = contentSize.height - layoutMeasurement.height
    if (maxScroll <= 0) return
    const ratio = Math.min(1, Math.max(0, contentOffset.y / maxScroll))
    scrollRatioRef.current = ratio

    if (saveThrottleRef.current) clearTimeout(saveThrottleRef.current)
    saveThrottleRef.current = setTimeout(() => {
      void doSaveSilently(ratio)
    }, SAVE_THROTTLE_MS)

    // SPRINT 7 ADD — scroll speed sampling (max 20 samples, no re-render)
    const nowMs    = Date.now()
    const deltaY   = Math.abs(contentOffset.y - lastScrollYRef.current)
    const deltaTime = nowMs - lastScrollTimeRef.current
    if (deltaTime > 0 && deltaY > 0) {
      scrollSpeedSamplesRef.current.push(deltaY / deltaTime)
      if (scrollSpeedSamplesRef.current.length > 20) {
        scrollSpeedSamplesRef.current.shift()
      }
    }
    lastScrollYRef.current    = contentOffset.y
    lastScrollTimeRef.current = nowMs

    // SPRINT 10 ADD — %90 scroll → soruları tetikle (bir kez)
    if (ratio >= 0.9 && !questionShownRef.current && questions.length > 0) {
      questionShownRef.current = true
      setShowQuestions(true)
    }
  }, [questions.length])

  // ── Content onLayout — scroll restore ─────────────────
  const handleContentLayout = useCallback((e: LayoutChangeEvent): void => {
    contentHeightRef.current = e.nativeEvent.layout.height
    if (restoreRatioRef.current > 0 && viewportHeightRef.current > 0) {
      const maxScroll = contentHeightRef.current - viewportHeightRef.current
      if (maxScroll > 0) {
        scrollViewRef.current?.scrollTo({
          y:        restoreRatioRef.current * maxScroll,
          animated: false,
        })
      }
      restoreRatioRef.current = 0 // tek seferlik
    }
  }, [])

  const handleViewportLayout = useCallback((e: LayoutChangeEvent): void => {
    viewportHeightRef.current = e.nativeEvent.layout.height
  }, [])

  // ── Save (sessiz — scroll sırasında) ──────────────────
  const doSaveSilently = useCallback(async (ratio: number): Promise<void> => {
    if (!textId) return
    try {
      await libraryService.saveReadingProgress({
        text_id:    textId,
        chapter_id: hasChapterId ? (chapterId ?? null) : null,
        last_ratio: ratio,
      })
    } catch { /* sessiz */ }
  }, [textId, chapterId, hasChapterId])

  // ── Save (await — back + chapter change) ──────────────
  const doSaveAwait = useCallback(async (ratio: number): Promise<void> => {
    if (!textId) return
    await libraryService.saveReadingProgress({
      text_id:    textId,
      chapter_id: hasChapterId ? (chapterId ?? null) : null,
      last_ratio: ratio,
    })
  }, [textId, chapterId, hasChapterId])

  // SPRINT 7 ADD — session input builder (fire-and-forget)
  const buildSessionInput = useCallback((): RecordChapterSessionInput => ({
    text_id:          textId,
    chapter_id:       chapter?.id ?? '',
    started_at:       chapterStartTimeRef.current,
    duration_seconds: Math.round(
      (Date.now() - new Date(chapterStartTimeRef.current).getTime()) / 1000,
    ),
    completion_ratio: scrollRatioRef.current,
    avg_scroll_speed:
      scrollSpeedSamplesRef.current.length > 0
        ? scrollSpeedSamplesRef.current.reduce((a, b) => a + b, 0) /
          scrollSpeedSamplesRef.current.length
        : undefined,
    // difficulty intentionally absent — service fetches from DB
  }), [textId, chapter])

  // ── Back — kayıt yaparak ───────────────────────────────
  const handleBack = useCallback(async (): Promise<void> => {
    if (isSaving) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    if (saveThrottleRef.current) clearTimeout(saveThrottleRef.current)
    setIsSaving(true)
    try {
      await doSaveAwait(scrollRatioRef.current)
    } finally {
      setIsSaving(false)
    }
    // SPRINT 7 ADD — fire-and-forget session record
    if (chapter?.id) {
      adaptiveService.recordChapterSession(buildSessionInput()).catch(() => {})
    }
    router.back()
  }, [isSaving, doSaveAwait, router, chapter, buildSessionInput])

  // ── Chapter navigation (in-place, no router.replace) ──
  const changeChapter = useCallback(async (direction: 'previous' | 'next'): Promise<void> => {
    if (!textId || isChangingChapter) return
    const targetNum = direction === 'next'
      ? currentChapterNum + 1
      : currentChapterNum - 1
    if (targetNum < 1 || targetNum > totalChapters) return

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setIsChangingChapter(true)
    try {
      const saveRatio = direction === 'next' ? 1 : scrollRatioRef.current
      await doSaveAwait(saveRatio)

      // SPRINT 7 ADD — tamamlanan bölümü kaydet (fire-and-forget)
      if (chapter?.id) {
        adaptiveService.recordChapterSession(buildSessionInput()).catch(() => {})
      }
      // SPRINT 7 ADD — yeni bölüm için takip sıfırla
      chapterStartTimeRef.current   = new Date().toISOString()
      scrollSpeedSamplesRef.current = []
      lastScrollYRef.current        = 0
      lastScrollTimeRef.current     = Date.now()
      // SPRINT 10 ADD — soru state sıfırla
      questionShownRef.current = false
      setShowQuestions(false)
      setQuestions([])

      const result = await libraryService.getChapterByTextAndNumber(textId, targetNum)
      if (!result.data) return

      setChapter(result.data)
      setCurrentChapterNum(result.data.chapter_number)
      scrollRatioRef.current  = 0
      restoreRatioRef.current = 0
      scrollViewRef.current?.scrollTo({ y: 0, animated: false })
      scheduleOverlayHide()
    } catch { /* sessiz */ } finally {
      setIsChangingChapter(false)
    }
  }, [textId, isChangingChapter, currentChapterNum, totalChapters, doSaveAwait, scheduleOverlayHide, chapter, buildSessionInput])

  const handlePrevChapter = useCallback((): void => {
    void changeChapter('previous')
  }, [changeChapter])

  const handleNextChapter = useCallback((): void => {
    void changeChapter('next')
  }, [changeChapter])

  // SPRINT 10 ADD — soru modal tamamlandı
  const handleQuestionsComplete = useCallback((answers: QuestionAnswer[]) => {
    setShowQuestions(false)
    // Fire-and-forget kaydet → Sprint 8 user_question_sessions → exam profile güncellenir
    if (answers.length > 0) {
      questionService.recordAnswers(answers).catch(() => {})
    }
  }, [])

  const handleQuestionsSkip = useCallback(() => {
    setShowQuestions(false)
  }, [])

  // ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.centerBox}>
          <ActivityIndicator size="large" color={t.colors.primary} />
        </View>
      </SafeAreaView>
    )
  }

  if (error || !chapter) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.centerBox}>
          <Text style={s.errorTxt}>⚠️  {error ?? 'Bilinmeyen hata'}</Text>
          <TouchableOpacity style={s.retryBtn} onPress={() => void handleBack()}>
            <Text style={s.retryTxt}>Geri Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  const showChapterNav = hasChapterId && totalChapters > 1

  return (
    <SafeAreaView style={s.safe}>

      {/* ── Tam ekran tap algılayıcısı + ScrollView ─────── */}
      <TouchableWithoutFeedback onPress={handleScreenTap}>
        <ScrollView
          ref={scrollViewRef}
          style={s.scroll}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onLayout={handleViewportLayout}
        >
          <View onLayout={handleContentLayout}>
            <Text style={s.chapterHeading}>{chapter.title}</Text>
            <Text style={s.bodyText}>{chapter.body}</Text>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>

      {/* SPRINT 10 ADD — Soru Modal'ı */}
      <QuestionModal
        visible={showQuestions}
        questions={questions}
        textId={textId}
        chapterId={hasChapterId ? (chapterId ?? null) : null}
        onComplete={handleQuestionsComplete}
        onSkip={handleQuestionsSkip}
      />

      {/* ── Yer imi Drawer ─────────────────────────────── */}
      <BookmarksDrawer
        visible={showBookmarks}
        textId={textId}
        studentId={student?.id ?? ''}
        currentChapterId={hasChapterId ? (chapterId ?? null) : null}
        currentPosition={scrollRatioRef.current}
        onClose={() => setShowBookmarks(false)}
      />

      {/* ── Overlay (absoluteFill, pointerEvents box-none) ─ */}
      {overlayVisible && (
        <Animated.View
          pointerEvents="box-none"
          style={[StyleSheet.absoluteFillObject, { opacity: overlayAnim }]}
        >
          {/* Top bar */}
          <View style={s.topBar}>
            <TouchableOpacity
              style={s.backBtn}
              onPress={() => void handleBack()}
              disabled={isSaving}
              activeOpacity={0.7}
            >
              {isSaving
                ? <ActivityIndicator size="small" color={t.colors.primary} />
                : <Text style={s.backTxt}>‹</Text>
              }
            </TouchableOpacity>
            <View style={s.topMeta}>
              <Text style={s.topChapterTitle} numberOfLines={1}>{chapter.title}</Text>
              {showChapterNav && (
                <Text style={s.topChapterNum}>{currentChapterNum} / {totalChapters}</Text>
              )}
            </View>
            {/* Yer imi butonu */}
            <TouchableOpacity
              style={s.backBtn}
              onPress={() => setShowBookmarks(true)}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 20 }}>🔖</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom bar */}
          <View style={s.bottomBar}>
            {showChapterNav ? (
              <>
                <TouchableOpacity
                  style={[s.navBtn, currentChapterNum <= 1 && s.navBtnDim]}
                  onPress={handlePrevChapter}
                  disabled={currentChapterNum <= 1 || isChangingChapter}
                  activeOpacity={0.7}
                >
                  <Text style={s.navBtnTxt}>‹ Önceki</Text>
                </TouchableOpacity>
                <Text style={s.progressPct}>%{overlayProgressPct} tamamlandı</Text>
                <TouchableOpacity
                  style={[s.navBtn, currentChapterNum >= totalChapters && s.navBtnDim]}
                  onPress={handleNextChapter}
                  disabled={currentChapterNum >= totalChapters || isChangingChapter}
                  activeOpacity={0.7}
                >
                  <Text style={s.navBtnTxt}>Sonraki ›</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={s.progressPct}>%{overlayProgressPct} tamamlandı</Text>
            )}
          </View>
        </Animated.View>
      )}

    </SafeAreaView>
  )
}

// ─── Stiller ──────────────────────────────────────────
function createStyles(t: AppTheme) {
  // Overlay bar yaklaşık yüksekliği — padding sağlamak için
  const OVERLAY_H = t.spacing.huge + t.spacing.lg // ~64px

  return StyleSheet.create({
    safe:      { flex: 1, backgroundColor: t.colors.background },
    centerBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    errorTxt:  {
      fontSize: t.font.md, color: t.colors.error,
      textAlign: 'center', marginBottom: t.spacing.lg,
    },
    retryBtn: {
      backgroundColor: t.colors.primary,
      paddingHorizontal: t.spacing.xxl, paddingVertical: t.spacing.sm,
      borderRadius: t.radius.md,
    },
    retryTxt: { color: t.colors.white, fontWeight: '700' },

    scroll:        { flex: 1 },
    scrollContent: {
      paddingHorizontal: 21,   // t.spacing.lg(16) × 1.3
      paddingTop:        OVERLAY_H,
      paddingBottom:     OVERLAY_H,
    },
    chapterHeading: {
      fontSize:     t.font.xl,
      fontWeight:   '800',
      color:        t.colors.text,
      marginBottom: t.spacing.lg,
    },
    bodyText: {
      fontSize:   t.font.lg + 1,              // 17 — comfortable reading
      lineHeight: Math.round((t.font.lg + 1) * 1.7),
      color:      t.colors.text,
    },

    // ── Overlay top bar ────────────────────────────────
    topBar: {
      position: 'absolute', top: 0, left: 0, right: 0,
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: t.spacing.lg, paddingVertical: t.spacing.sm,
      backgroundColor: t.colors.surface + 'F0',
      borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: t.colors.divider,
    },
    backBtn: { minWidth: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
    backTxt: { fontSize: 28, color: t.colors.primary, fontWeight: '300', lineHeight: 32 },
    topMeta: { flex: 1, alignItems: 'center' },
    topChapterTitle: { fontSize: t.font.sm, fontWeight: '700', color: t.colors.text },
    topChapterNum:   { fontSize: t.font.xs, color: t.colors.textHint, marginTop: 1 },

    // ── Overlay bottom bar ─────────────────────────────
    bottomBar: {
      position: 'absolute', bottom: 0, left: 0, right: 0,
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: t.spacing.lg, paddingVertical: t.spacing.md,
      backgroundColor: t.colors.surface + 'F0',
      borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.colors.border,
    },
    navBtn:      {
      paddingHorizontal: t.spacing.md, paddingVertical: t.spacing.sm,
      backgroundColor: t.colors.primary + '22', borderRadius: t.radius.md,
    },
    navBtnDim:   { opacity: 0.3 },
    navBtnTxt:   { fontSize: t.font.sm, fontWeight: '700', color: t.colors.primary },
    progressPct: { fontSize: t.font.sm, fontWeight: '600', color: t.colors.textHint },
  })
}
