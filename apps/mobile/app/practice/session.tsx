/**
 * TYT Tarzı Paragraf + Soru Ekranı
 *
 * Layout:
 *   - Paragraf ScrollView (ekranın ~55'i)
 *   - Soru + ABCD şıkları (sabit alt bölüm, ~45%)
 *
 * Akış:
 *   1) Metin yüklenir — timer başlar
 *   2) Kullanıcı paragrafı okur, şıka dokunur
 *   3) Haptic + renk animasyonu (300ms withTiming)
 *   4) Doğru/yanlış göster → 1.5sn → otomatik sonraki soru
 *   5) Tüm sorular biter → result.tsx
 *
 * WPM: metin yüklenince başlar, 1. şık seçilince biter
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator,
  Dimensions,
} from 'react-native'
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming,
} from 'react-native-reanimated'
import { useRouter, useLocalSearchParams } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { useAppTheme } from '../../src/theme/useAppTheme'
import type { AppTheme } from '../../src/theme'
import { supabase } from '../../src/lib/supabase'
import { createQuestionService } from '@sprinta/api'
import type { TextQuestion, QuestionAnswer } from '@sprinta/api'

// ─── Sabitler ─────────────────────────────────────────────────────
const SCREEN_H      = Dimensions.get('window').height
const PARA_RATIO    = 0.52   // paragraf bölümünün yükseklik oranı
const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const

// ─── TYT renk paleti ──────────────────────────────────────────────
const EXAM_COLORS: Record<string, string> = {
  tyt:   '#1D4ED8',
  lgs:   '#0891B2',
  ayt:   '#7C3AED',
  kpss:  '#EA580C',
  ales:  '#16A34A',
  yds:   '#DB2777',
}
function examColor(examType: string) {
  return EXAM_COLORS[examType?.toLowerCase()] ?? '#1D4ED8'
}

const CORRECT_COLOR = '#16A34A'
const WRONG_COLOR   = '#DC2626'

// ─── Yardımcı ─────────────────────────────────────────────────────
function formatTime(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

// ─── Soru tipi etiketleri ─────────────────────────────────────────
const TYPE_LABEL: Record<string, string> = {
  main_idea:  'Ana Fikir',
  inference:  'Çıkarım',
  detail:     'Ayrıntı',
  vocabulary: 'Kelime Anlamı',
  tone:       'Ton / Bakış Açısı',
}

type AnswerState = 'idle' | 'correct' | 'wrong'

// ─── Session state ────────────────────────────────────────────────
interface Answer extends QuestionAnswer {
  selectedIndex: number
}

// ─── Ana Ekran ────────────────────────────────────────────────────
export default function PracticeSessionScreen() {
  const t      = useAppTheme()
  const s      = useMemo(() => ms(t), [t])
  const router = useRouter()
  const { textId } = useLocalSearchParams<{ textId: string }>()

  // ── Veri state ─────────────────────────────────────────────────
  const [text,      setText]      = useState<any>(null)
  const [questions, setQuestions] = useState<TextQuestion[]>([])
  const [loading,   setLoading]   = useState(true)

  // ── Soru state ─────────────────────────────────────────────────
  const [qIdx,        setQIdx]        = useState(0)
  const [selected,    setSelected]    = useState<number | null>(null)
  const [answerState, setAnswerState] = useState<AnswerState>('idle')
  const [answers,     setAnswers]     = useState<Answer[]>([])
  const [showExplain, setShowExplain] = useState(false)

  // ── Timer state ─────────────────────────────────────────────────
  const [timer,       setTimer]       = useState(0)
  const [wpmRecorded, setWpmRecorded] = useState(false)
  const timerRef        = useRef<ReturnType<typeof setInterval> | null>(null)
  const readStartRef    = useRef<number>(Date.now())
  const questionStartRef= useRef<number>(Date.now())
  const wpmRef          = useRef<number>(0)

  // ── Animasyon değerleri (sabit sayıda, React kuralı) ───────────
  const optAnim0 = useSharedValue(0)
  const optAnim1 = useSharedValue(0)
  const optAnim2 = useSharedValue(0)
  const optAnim3 = useSharedValue(0)
  const optAnims = [optAnim0, optAnim1, optAnim2, optAnim3]

  const explainAnim = useSharedValue(0)

  // ── Veri yükle ─────────────────────────────────────────────────
  useEffect(() => {
    if (!textId) return
    async function load() {
      setLoading(true)
      try {
        const [{ data: textData }, { data: qData }] = await Promise.all([
          supabase.from('text_library').select('*').eq('id', textId).single(),
          createQuestionService(supabase).getQuestions(textId),
        ])
        setText(textData)
        setQuestions((qData as TextQuestion[]) ?? [])
        readStartRef.current    = Date.now()
        questionStartRef.current = Date.now()
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [textId])

  // ── Süre sayacı ────────────────────────────────────────────────
  useEffect(() => {
    if (loading) return
    timerRef.current = setInterval(() => setTimer(v => v + 1), 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [loading])

  // ── Opt animasyon stilleri (4 adet sabit) ─────────────────────
  const optStyle0 = useAnimatedStyle(() => ({ opacity: 1 - optAnim0.value * 0 }))
  const optStyle1 = useAnimatedStyle(() => ({ opacity: 1 - optAnim1.value * 0 }))
  const optStyle2 = useAnimatedStyle(() => ({ opacity: 1 - optAnim2.value * 0 }))
  const optStyle3 = useAnimatedStyle(() => ({ opacity: 1 - optAnim3.value * 0 }))
  const optStyles = [optStyle0, optStyle1, optStyle2, optStyle3]

  const explainStyle = useAnimatedStyle(() => ({
    opacity:    explainAnim.value,
    transform: [{ translateY: (1 - explainAnim.value) * 10 }],
  }))

  // ── Şık seç ────────────────────────────────────────────────────
  const handleSelect = useCallback((idx: number) => {
    if (answerState !== 'idle') return
    const question = questions[qIdx]
    if (!question) return

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

    const isCorrect = idx === question.correct_index
    setSelected(idx)
    setAnswerState(isCorrect ? 'correct' : 'wrong')
    setShowExplain(false)

    // WPM: ilk şık seçilince kaydet
    if (!wpmRecorded && answers.length === 0) {
      const elapsedMinutes = (Date.now() - readStartRef.current) / 60000
      const wordCount = text?.word_count ?? text?.body?.trim().split(/\s+/).length ?? 300
      wpmRef.current = elapsedMinutes > 0 ? Math.round(wordCount / elapsedMinutes) : 0
      setWpmRecorded(true)
    }

    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }

    // Animasyonları tetikle
    optAnims.forEach((anim, i) => {
      anim.value = withTiming(1, { duration: 300 })
    })
    explainAnim.value = withTiming(1, { duration: 300 })

    const elapsed = (Date.now() - questionStartRef.current) / 1000
    setAnswers(prev => [...prev, {
      questionId:          question.id,
      textId:              textId ?? '',
      chapterId:           null,
      questionType:        question.question_type,
      isCorrect,
      responseTimeSeconds: elapsed,
      selectedIndex:       idx,
    }])

    // 1.5sn sonra otomatik ileri
    setTimeout(() => {
      goNext(isCorrect)
    }, 1500)
  }, [answerState, questions, qIdx, answers.length, text, wpmRecorded, textId, optAnims, explainAnim])

  // ── Sonraki soru ───────────────────────────────────────────────
  const goNext = useCallback((isCorrect?: boolean) => {
    const nextIdx = qIdx + 1
    const total   = questions.length

    if (nextIdx >= total) {
      // Tüm sorular bitti — result.tsx'e git
      if (timerRef.current) clearInterval(timerRef.current)
      // Cevapları serialize et
      const answersJson = JSON.stringify(
        answers.map(a => ({
          questionId:          a.questionId,
          textId:              a.textId,
          chapterId:           a.chapterId,
          questionType:        a.questionType,
          isCorrect:           a.isCorrect,
          responseTimeSeconds: a.responseTimeSeconds,
          selectedIndex:       a.selectedIndex,
        }))
      )
      router.push({
        pathname: '/practice/result',
        params: {
          textId:      textId ?? '',
          textTitle:   text?.title ?? '',
          examType:    text?.exam_type ?? 'tyt',
          wordCount:   String(text?.word_count ?? 300),
          wpm:         String(wpmRef.current),
          durationSec: String(timer),
          answersJson,
          questionsJson: JSON.stringify(questions),
        },
      } as any)
    } else {
      // Sıfırla — sonraki soru
      optAnims.forEach(anim => { anim.value = 0 })
      explainAnim.value = 0
      setQIdx(nextIdx)
      setSelected(null)
      setAnswerState('idle')
      setShowExplain(false)
      questionStartRef.current = Date.now()
    }
  }, [qIdx, questions, answers, text, textId, timer, router, optAnims, explainAnim])

  // ── İşaretle ────────────────────────────────────────────────────
  const handleBookmark = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
  }, [])

  // ── Önceki soru ────────────────────────────────────────────────
  const goPrev = useCallback(() => {
    if (qIdx === 0) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    optAnims.forEach(anim => { anim.value = 0 })
    explainAnim.value = 0
    setQIdx(q => q - 1)
    setSelected(null)
    setAnswerState('idle')
    setShowExplain(false)
    questionStartRef.current = Date.now()
  }, [qIdx, optAnims, explainAnim])

  // ── Loading ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={[s.root, s.center]}>
        <ActivityIndicator size="large" color={t.colors.primary} />
        <Text style={s.loadingTxt}>Metin yükleniyor…</Text>
      </SafeAreaView>
    )
  }

  if (!text || questions.length === 0) {
    return (
      <SafeAreaView style={[s.root, s.center]}>
        <Text style={{ fontSize: 40 }}>😕</Text>
        <Text style={s.emptyTxt}>Metin veya soru bulunamadı</Text>
        <TouchableOpacity style={s.backBtnLg} onPress={() => router.back()}>
          <Text style={s.backBtnLgTxt}>← Geri Dön</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  const question  = questions[qIdx]
  const total     = questions.length
  const progress  = (qIdx / total)
  const headerCol = examColor(text.exam_type)
  const examLabel = text.exam_type?.toUpperCase() ?? 'TYT'
  const paraH     = SCREEN_H * PARA_RATIO

  return (
    <SafeAreaView style={s.root}>

      {/* ── Üst header ──────────────────────────────────────────── */}
      <View style={[s.header, { backgroundColor: headerCol }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={[s.examBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
          <Text style={s.examBadgeTxt}>{examLabel} 📘</Text>
        </View>
        <Text style={s.qCounter}>Soru {qIdx + 1}/{total}</Text>
        <View style={s.timerBox}>
          <Text style={s.timerTxt}>⏱ {formatTime(timer)}</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={s.progressTrack}>
        <Animated.View style={[s.progressFill, {
          width:           `${Math.round(progress * 100)}%` as any,
          backgroundColor: headerCol,
        }]} />
      </View>

      {/* ── Paragraf (üst %55) ──────────────────────────────────── */}
      <View style={[s.paraSection, { height: paraH }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.paraContent}
        >
          <View style={s.paraTitleRow}>
            <Text style={s.paraTitle} numberOfLines={1}>📖 {text.title}</Text>
          </View>
          <Text style={s.paraBody}>{text.body}</Text>
          <View style={{ height: 12 }} />
        </ScrollView>
      </View>

      {/* Ayırıcı çizgi */}
      <View style={[s.divider, { backgroundColor: headerCol + '30' }]} />

      {/* ── Soru + Şıklar (alt sabit bölüm) ─────────────────────── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.questionSection}
      >
        {/* Soru tipi badge */}
        <View style={s.qtypeRow}>
          <View style={[s.qtypeBadge, { backgroundColor: headerCol + '18' }]}>
            <Text style={[s.qtypeTxt, { color: headerCol }]}>
              {TYPE_LABEL[question.question_type] ?? question.question_type}
            </Text>
          </View>
        </View>

        {/* Soru metni */}
        <Text style={s.questionTxt}>{question.question_text}</Text>

        {/* Seçenekler */}
        <View style={s.optionsBox}>
          {question.options.map((opt, i) => {
            const isSelected  = selected === i
            const isCorrect   = i === question.correct_index
            const showCorrect = answerState !== 'idle' && isCorrect
            const showWrong   = answerState !== 'idle' && isSelected && !isCorrect
            const disabled    = answerState !== 'idle'

            let borderCol = t.colors.border
            let bgCol     = t.colors.surface
            let textCol   = t.colors.text
            let circleCol = t.colors.border
            let circleBg  = t.colors.surface
            let letterCol = t.colors.textSub
            let icon      = ''

            if (showCorrect) {
              borderCol = CORRECT_COLOR
              bgCol     = CORRECT_COLOR + '12'
              textCol   = CORRECT_COLOR
              circleCol = CORRECT_COLOR
              circleBg  = CORRECT_COLOR
              letterCol = '#fff'
              icon      = '✓'
            } else if (showWrong) {
              borderCol = WRONG_COLOR
              bgCol     = WRONG_COLOR + '12'
              textCol   = WRONG_COLOR
              circleCol = WRONG_COLOR
              circleBg  = WRONG_COLOR
              letterCol = '#fff'
              icon      = '✗'
            } else if (isSelected && answerState === 'idle') {
              borderCol = headerCol
              bgCol     = headerCol + '10'
              circleCol = headerCol
              circleBg  = headerCol
              letterCol = '#fff'
            }

            return (
              <Animated.View key={i} style={optStyles[i]}>
                <TouchableOpacity
                  style={[s.option, { borderColor: borderCol, backgroundColor: bgCol }]}
                  onPress={() => handleSelect(i)}
                  disabled={disabled}
                  activeOpacity={0.75}
                >
                  <View style={[s.optCircle, { borderColor: circleCol, backgroundColor: (showCorrect || showWrong || (isSelected && answerState === 'idle')) ? circleBg : 'transparent' }]}>
                    <Text style={[s.optLetter, { color: letterCol }]}>
                      {icon || OPTION_LETTERS[i]}
                    </Text>
                  </View>
                  <Text style={[s.optTxt, { color: textCol }]}>{opt}</Text>
                </TouchableOpacity>
              </Animated.View>
            )
          })}
        </View>

        {/* Açıklama (cevap sonrası) */}
        {answerState !== 'idle' && question.explanation && (
          <Animated.View style={[
            s.explainBox,
            { borderColor: answerState === 'correct' ? CORRECT_COLOR + '44' : WRONG_COLOR + '44' },
            explainStyle,
          ]}>
            <Text style={[s.explainTitle, { color: answerState === 'correct' ? CORRECT_COLOR : WRONG_COLOR }]}>
              {answerState === 'correct' ? '✓ Doğru!' : '✗ Yanlış'}
            </Text>
            <Text style={s.explainTxt}>{question.explanation}</Text>
          </Animated.View>
        )}

        <View style={{ height: 16 }} />
      </ScrollView>

      {/* ── Alt bar: Önceki · İşaretle · Sonraki ───────────────── */}
      <View style={[s.bottomBar, { borderTopColor: headerCol + '20' }]}>
        <TouchableOpacity
          style={[s.barBtn, qIdx === 0 && s.barBtnDisabled]}
          onPress={goPrev}
          disabled={qIdx === 0}
          activeOpacity={0.7}
        >
          <Text style={[s.barBtnTxt, qIdx === 0 && { color: t.colors.textHint }]}>◄ Önceki</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.barBtnMid} onPress={handleBookmark} activeOpacity={0.7}>
          <Text style={s.barBtnMidTxt}>🔖 İşaretle</Text>
        </TouchableOpacity>

        {answerState === 'idle' ? (
          <View style={[s.barBtn, s.barBtnDisabled]}>
            <Text style={[s.barBtnTxt, { color: t.colors.textHint }]}>Sonraki ►</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[s.barBtn, { backgroundColor: headerCol + '15' }]}
            onPress={() => goNext()}
            activeOpacity={0.7}
          >
            <Text style={[s.barBtnTxt, { color: headerCol }]}>
              {qIdx + 1 >= total ? 'Sonucu Gör ►' : 'Sonraki ►'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  )
}

// ─── Stiller ─────────────────────────────────────────────────────
function ms(t: AppTheme) {
  return StyleSheet.create({
    root:   { flex: 1, backgroundColor: t.colors.background },
    center: { alignItems: 'center', justifyContent: 'center', gap: 12 },

    // Header
    header: {
      flexDirection:     'row',
      alignItems:        'center',
      paddingHorizontal: 14,
      paddingVertical:   12,
      gap:               10,
    },
    backBtn:      { padding: 4 },
    backArrow:    { fontSize: 20, color: '#fff', fontWeight: '600' },
    examBadge: {
      paddingHorizontal: 10,
      paddingVertical:   4,
      borderRadius:      6,
    },
    examBadgeTxt: { fontSize: 12, fontWeight: '800', color: '#fff' },
    qCounter:  { flex: 1, fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.9)', textAlign: 'center' },
    timerBox:  { },
    timerTxt:  { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.85)' },

    // Progress bar
    progressTrack: {
      height:          3,
      backgroundColor: t.colors.border,
      overflow:        'hidden',
    },
    progressFill: {
      height: 3,
    },

    // Paragraf bölümü
    paraSection: {
      borderBottomWidth: 0,
    },
    paraContent: {
      paddingHorizontal: 18,
      paddingVertical:   12,
    },
    paraTitleRow: {
      flexDirection:  'row',
      alignItems:     'center',
      marginBottom:   10,
    },
    paraTitle: {
      fontSize:   14,
      fontWeight: '800',
      color:      t.colors.text,
      flex:       1,
    },
    paraBody: {
      fontSize:   15,
      color:      t.colors.text,
      lineHeight: 25,
      letterSpacing: 0.1,
    },

    divider: {
      height: 3,
    },

    // Soru bölümü
    questionSection: {
      paddingHorizontal: 16,
      paddingTop:        12,
    },
    qtypeRow: {
      marginBottom: 8,
    },
    qtypeBadge: {
      alignSelf:         'flex-start',
      paddingHorizontal: 10,
      paddingVertical:   4,
      borderRadius:      6,
    },
    qtypeTxt: {
      fontSize:   11,
      fontWeight: '700',
    },
    questionTxt: {
      fontSize:     15,
      fontWeight:   '700',
      color:        t.colors.text,
      lineHeight:   23,
      marginBottom: 14,
    },

    // Seçenekler
    optionsBox: { gap: 9 },
    option: {
      flexDirection:  'row',
      alignItems:     'center',
      gap:            12,
      borderRadius:   12,
      padding:        12,
      borderWidth:    1.5,
    },
    optCircle: {
      width:          30,
      height:         30,
      borderRadius:   15,
      borderWidth:    1.5,
      alignItems:     'center',
      justifyContent: 'center',
      flexShrink:     0,
    },
    optLetter: {
      fontSize:   13,
      fontWeight: '900',
    },
    optTxt: {
      flex:       1,
      fontSize:   14,
      lineHeight: 20,
    },

    // Açıklama kutusu
    explainBox: {
      marginTop:    12,
      borderWidth:  1,
      borderRadius: 10,
      padding:      12,
      gap:          5,
    },
    explainTitle: {
      fontSize:   13,
      fontWeight: '800',
    },
    explainTxt: {
      fontSize:   13,
      color:      t.colors.textSub,
      lineHeight: 19,
    },

    // Alt bar
    bottomBar: {
      flexDirection:     'row',
      alignItems:        'center',
      borderTopWidth:    1,
      paddingHorizontal: 14,
      paddingVertical:   10,
      backgroundColor:   t.colors.surface,
      gap:               8,
    },
    barBtn: {
      flex:            1,
      alignItems:      'center',
      paddingVertical: 10,
      borderRadius:    10,
    },
    barBtnDisabled: { opacity: 0.4 },
    barBtnTxt: {
      fontSize:   13,
      fontWeight: '700',
      color:      t.colors.text,
    },
    barBtnMid: {
      flex:              1,
      alignItems:        'center',
      paddingVertical:   10,
      borderRadius:      10,
      backgroundColor:   t.colors.surfaceSub,
    },
    barBtnMidTxt: {
      fontSize:   13,
      fontWeight: '600',
      color:      t.colors.textSub,
    },

    // Loading / empty
    loadingTxt: { fontSize: 13, color: t.colors.textSub, marginTop: 8 },
    emptyTxt:   { fontSize: 15, color: t.colors.textSub, textAlign: 'center' },
    backBtnLg: {
      backgroundColor:   t.colors.primary,
      borderRadius:      12,
      paddingHorizontal: 24,
      paddingVertical:   12,
      marginTop:         8,
    },
    backBtnLgTxt: { fontSize: 14, fontWeight: '700', color: '#fff' },
  })
}
