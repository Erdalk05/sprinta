// =====================================================
// QuestionModal.tsx — Sprint 10
// Bölüm tamamlandığında açılan soru modal'ı
//
// Akış: sorular → her soru için A/B/C/D → anında geri bildirim
//       → tüm sorular bitince özet → onComplete(answers)
//
// Pure UI: veri fetch ve kaydetme dışarıda (ReaderScreen)
// =====================================================

import React, { useState, useRef, useCallback, useMemo } from 'react'
import {
  Modal, View, Text, TouchableOpacity, StyleSheet,
  ScrollView, SafeAreaView, Animated,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import { useAppTheme } from '../../theme/useAppTheme'
import type { AppTheme } from '../../theme'
import type { TextQuestion, QuestionAnswer } from '@sprinta/api'

// ─── Tipler ───────────────────────────────────────────

interface QuestionModalProps {
  visible:    boolean
  questions:  TextQuestion[]
  textId:     string
  chapterId:  string | null
  onComplete: (answers: QuestionAnswer[]) => void
  onSkip:     () => void
}

type AnswerState = 'idle' | 'correct' | 'wrong'

// ─── Soru tipi etiketleri ─────────────────────────────
const TYPE_LABEL: Record<TextQuestion['question_type'], string> = {
  main_idea:  'Ana Fikir',
  inference:  'Çıkarım',
  detail:     'Ayrıntı',
  vocabulary: 'Kelime Anlamı',
  tone:       'Ton / Bakış Açısı',
}

const TYPE_COLOR: Record<TextQuestion['question_type'], string> = {
  main_idea:  '#3B82F6',
  inference:  '#8B5CF6',
  detail:     '#10B981',
  vocabulary: '#F59E0B',
  tone:       '#EC4899',
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D']

// ─── Ana Bileşen ──────────────────────────────────────

export const QuestionModal = React.memo(function QuestionModal({
  visible, questions, textId, chapterId, onComplete, onSkip,
}: QuestionModalProps) {
  const t = useAppTheme()
  const s = useMemo(() => createStyles(t), [t])

  const [qIdx,         setQIdx]         = useState(0)
  const [selected,     setSelected]     = useState<number | null>(null)
  const [answerState,  setAnswerState]  = useState<AnswerState>('idle')
  const [answers,      setAnswers]      = useState<QuestionAnswer[]>([])
  const [showSummary,  setShowSummary]  = useState(false)
  const questionStartRef = useRef(Date.now())
  const feedbackAnim     = useRef(new Animated.Value(0)).current

  const question = questions[qIdx]
  const total    = questions.length
  const progress = total > 0 ? (qIdx + (answerState !== 'idle' ? 1 : 0)) / total : 0

  // Modal açıldığında sıfırla
  const handleVisible = useCallback(() => {
    setQIdx(0)
    setSelected(null)
    setAnswerState('idle')
    setAnswers([])
    setShowSummary(false)
    questionStartRef.current = Date.now()
  }, [])

  // Seçenek seç
  const handleSelect = useCallback((idx: number) => {
    if (answerState !== 'idle' || !question) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

    setSelected(idx)
    const isCorrect = idx === question.correct_index
    setAnswerState(isCorrect ? 'correct' : 'wrong')

    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }

    // Geri bildirim animasyonu
    Animated.sequence([
      Animated.timing(feedbackAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start()

    const elapsed = (Date.now() - questionStartRef.current) / 1000
    setAnswers(prev => [...prev, {
      questionId:          question.id,
      textId,
      chapterId,
      questionType:        question.question_type,
      isCorrect,
      responseTimeSeconds: elapsed,
    }])
  }, [answerState, question, textId, chapterId, feedbackAnim])

  // Sonraki soru
  const handleNext = useCallback(() => {
    feedbackAnim.setValue(0)
    if (qIdx + 1 >= total) {
      setShowSummary(true)
    } else {
      setQIdx(q => q + 1)
      setSelected(null)
      setAnswerState('idle')
      questionStartRef.current = Date.now()
    }
  }, [qIdx, total, feedbackAnim])

  // Özet ekranından tamamla
  const handleFinish = useCallback(() => {
    onComplete(answers)
  }, [answers, onComplete])

  if (!visible) return null

  // ── Özet ekranı ────────────────────────────────────────
  if (showSummary) {
    const correct = answers.filter(a => a.isCorrect).length
    const pct     = total > 0 ? Math.round((correct / total) * 100) : 0
    const color   = pct >= 70 ? '#10B981' : pct >= 40 ? '#F59E0B' : '#EF4444'

    return (
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={[s.root, { justifyContent: 'center' }]}>
          <ScrollView contentContainerStyle={{ padding: 32, gap: 20, alignItems: 'center' }}>
            <Text style={{ fontSize: 64 }}>
              {pct >= 70 ? '🏆' : pct >= 40 ? '💪' : '📖'}
            </Text>
            <Text style={s.summaryTitle}>Bölüm Tamamlandı!</Text>
            <View style={[s.scoreBadge, { backgroundColor: color }]}>
              <Text style={s.scorePct}>%{pct}</Text>
              <Text style={s.scoreLabel}>{correct}/{total} doğru</Text>
            </View>

            {/* Soru bazlı sonuçlar */}
            {answers.map((a, i) => (
              <View key={a.questionId} style={[s.resultRow,
                { borderColor: a.isCorrect ? '#10B98144' : '#EF444444' }]}>
                <Text style={{ fontSize: 16 }}>{a.isCorrect ? '✓' : '✗'}</Text>
                <Text style={[s.resultType, { color: TYPE_COLOR[a.questionType] }]}>
                  {TYPE_LABEL[a.questionType]}
                </Text>
                <Text style={[s.resultTime, { color: t.colors.textHint }]}>
                  {a.responseTimeSeconds.toFixed(1)}s
                </Text>
              </View>
            ))}

            <TouchableOpacity style={[s.nextBtn, { backgroundColor: color }]} onPress={handleFinish}>
              <Text style={s.nextBtnTxt}>Devam Et →</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    )
  }

  if (!question) return null

  const qColor = TYPE_COLOR[question.question_type]

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onShow={handleVisible}
    >
      <SafeAreaView style={s.root}>

        {/* ── Başlık + progress ─────────────────────────── */}
        <View style={s.header}>
          <View style={[s.typeBadge, { backgroundColor: qColor + '20' }]}>
            <Text style={[s.typeLabel, { color: qColor }]}>
              {TYPE_LABEL[question.question_type]}
            </Text>
          </View>
          <TouchableOpacity onPress={onSkip}>
            <Text style={s.skipTxt}>Geç</Text>
          </TouchableOpacity>
        </View>

        {/* Progress bar */}
        <View style={s.progressTrack}>
          <View style={[s.progressFill, { width: `${Math.round(progress * 100)}%` as any, backgroundColor: qColor }]} />
        </View>
        <Text style={s.counter}>{qIdx + 1} / {total}</Text>

        <ScrollView contentContainerStyle={s.content}>

          {/* ── Soru metni ─────────────────────────────── */}
          <View style={[s.questionBox, { borderColor: qColor + '40' }]}>
            <Text style={s.questionTxt}>{question.question_text}</Text>
          </View>

          {/* ── Seçenekler ─────────────────────────────── */}
          <View style={s.optionsBox}>
            {question.options.map((opt, i) => {
              const isSelected  = selected === i
              const isCorrect   = i === question.correct_index
              const showCorrect = answerState !== 'idle' && isCorrect
              const showWrong   = answerState !== 'idle' && isSelected && !isCorrect

              return (
                <TouchableOpacity
                  key={i}
                  style={[
                    s.option,
                    showCorrect && s.optionCorrect,
                    showWrong   && s.optionWrong,
                    isSelected && answerState === 'idle' && { borderColor: qColor },
                  ]}
                  onPress={() => handleSelect(i)}
                  disabled={answerState !== 'idle'}
                  activeOpacity={0.75}
                >
                  <View style={[
                    s.optionLetter,
                    showCorrect && { backgroundColor: '#10B981' },
                    showWrong   && { backgroundColor: '#EF4444' },
                    !showCorrect && !showWrong && { backgroundColor: qColor + '20' },
                  ]}>
                    <Text style={[
                      s.optionLetterTxt,
                      (showCorrect || showWrong) && { color: '#fff' },
                      !showCorrect && !showWrong && { color: qColor },
                    ]}>
                      {OPTION_LETTERS[i]}
                    </Text>
                  </View>
                  <Text style={[
                    s.optionTxt,
                    showCorrect && { color: '#10B981', fontWeight: '700' },
                    showWrong   && { color: '#EF4444' },
                  ]}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>

          {/* ── Açıklama (cevap sonrası) ─────────────────── */}
          {answerState !== 'idle' && question.explanation && (
            <Animated.View style={[s.explanationBox, { opacity: feedbackAnim,
              borderColor: answerState === 'correct' ? '#10B98144' : '#EF444444' }]}>
              <Text style={s.explanationTitle}>
                {answerState === 'correct' ? '✓ Doğru!' : '✗ Yanlış'}
              </Text>
              <Text style={s.explanationTxt}>{question.explanation}</Text>
            </Animated.View>
          )}

          {/* ── Sonraki buton (cevap sonrası) ────────────── */}
          {answerState !== 'idle' && (
            <TouchableOpacity
              style={[s.nextBtn, { backgroundColor: answerState === 'correct' ? '#10B981' : qColor }]}
              onPress={handleNext}
            >
              <Text style={s.nextBtnTxt}>
                {qIdx + 1 >= total ? 'Sonuçları Gör →' : 'Sonraki Soru →'}
              </Text>
            </TouchableOpacity>
          )}

          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  )
})

// ─── Stiller ──────────────────────────────────────────
function createStyles(t: AppTheme) {
  return StyleSheet.create({
    root: {
      flex:            1,
      backgroundColor: t.colors.background,
    },
    header: {
      flexDirection:     'row',
      justifyContent:    'space-between',
      alignItems:        'center',
      paddingHorizontal: 20,
      paddingVertical:   14,
    },
    typeBadge: {
      paddingHorizontal: 12,
      paddingVertical:   5,
      borderRadius:      20,
    },
    typeLabel: {
      fontSize:   t.font.xs,
      fontWeight: '700',
    },
    skipTxt: {
      fontSize:  t.font.sm,
      color:     t.colors.textHint,
    },
    progressTrack: {
      height:          4,
      backgroundColor: t.colors.border,
      marginHorizontal: 20,
      borderRadius:    2,
      overflow:        'hidden',
    },
    progressFill: {
      height:       4,
      borderRadius: 2,
    },
    counter: {
      textAlign:  'center',
      fontSize:   t.font.xs,
      color:      t.colors.textHint,
      marginTop:  6,
      marginBottom: 4,
    },
    content: {
      paddingHorizontal: 20,
      paddingTop:        8,
      gap:               14,
    },
    questionBox: {
      backgroundColor: t.colors.surface,
      borderRadius:    t.radius.lg,
      padding:         t.spacing.md,
      borderWidth:     1,
    },
    questionTxt: {
      fontSize:   t.font.md,
      fontWeight: '600',
      color:      t.colors.text,
      lineHeight: 26,
    },
    optionsBox: { gap: 10 },
    option: {
      flexDirection:   'row',
      alignItems:      'center',
      gap:             12,
      backgroundColor: t.colors.surface,
      borderRadius:    t.radius.md,
      padding:         14,
      borderWidth:     1.5,
      borderColor:     t.colors.border,
    },
    optionCorrect: {
      borderColor:     '#10B981',
      backgroundColor: '#10B98110',
    },
    optionWrong: {
      borderColor:     '#EF4444',
      backgroundColor: '#EF444410',
    },
    optionLetter: {
      width:        32,
      height:       32,
      borderRadius: 16,
      alignItems:   'center',
      justifyContent: 'center',
      flexShrink:   0,
    },
    optionLetterTxt: {
      fontSize:   t.font.sm,
      fontWeight: '900',
    },
    optionTxt: {
      flex:       1,
      fontSize:   t.font.sm,
      color:      t.colors.text,
      lineHeight: 20,
    },
    explanationBox: {
      borderWidth:  1,
      borderRadius: t.radius.md,
      padding:      t.spacing.md,
      gap:          6,
    },
    explanationTitle: {
      fontSize:   t.font.sm,
      fontWeight: '800',
      color:      t.colors.text,
    },
    explanationTxt: {
      fontSize:  t.font.sm,
      color:     t.colors.textHint,
      lineHeight: 20,
    },
    nextBtn: {
      borderRadius:    t.radius.md,
      paddingVertical: 18,
      alignItems:      'center',
    },
    nextBtnTxt: {
      fontSize:   t.font.md,
      fontWeight: '800',
      color:      '#fff',
    },

    // Özet ekranı
    summaryTitle: {
      fontSize:   24,
      fontWeight: '900',
      color:      t.colors.text,
    },
    scoreBadge: {
      borderRadius:  24,
      paddingVertical:   24,
      paddingHorizontal: 48,
      alignItems:    'center',
      width:         '100%',
    },
    scorePct: {
      fontSize:   56,
      fontWeight: '900',
      color:      '#fff',
      lineHeight: 64,
    },
    scoreLabel: {
      fontSize:  t.font.sm,
      color:     'rgba(255,255,255,0.8)',
      fontWeight: '600',
    },
    resultRow: {
      flexDirection:   'row',
      alignItems:      'center',
      gap:             12,
      width:           '100%',
      backgroundColor: t.colors.surface,
      borderRadius:    t.radius.md,
      padding:         12,
      borderWidth:     1,
    },
    resultType: {
      flex:       1,
      fontSize:   t.font.sm,
      fontWeight: '700',
    },
    resultTime: {
      fontSize:  t.font.xs,
    },
  })
}
