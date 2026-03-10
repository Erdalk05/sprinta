/**
 * MockExamScreen — Tam sınav simülatörü
 * - Soru + metin gösterimi
 * - Önceki/Sonraki navigasyon
 * - Bayrak işaretleme
 * - Geri sayım sayacı
 * - Sınav gönderme
 */
import React, { useEffect, useRef, useMemo, useCallback, useState } from 'react'
import {
  View, Text, TouchableOpacity, ScrollView, Alert,
  StyleSheet, SafeAreaView, FlatList, Modal,
} from 'react-native'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { useAppTheme } from '../../theme/useAppTheme'
import { useMockExamStore } from '../../stores/mockExamStore'
import { useAuthStore } from '../../stores/authStore'

interface Props {
  examType: string
  subject?: string
  questionCount?: number
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export default function MockExamScreen({ examType, subject, questionCount = 20 }: Props) {
  const t = useAppTheme()
  const router = useRouter()
  const { student } = useAuthStore()
  const store = useMockExamStore()

  const [showPassages, setShowPassages] = useState(false)
  const [questionStartMs, setQuestionStartMs] = useState(Date.now())
  const [navModalVisible, setNavModalVisible] = useState(false)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Load questions on mount
  useEffect(() => {
    store.loadQuestions(examType, subject, questionCount)
    return () => { store.reset() }
  }, [])

  // Start exam when questions loaded
  useEffect(() => {
    if (store.questions.length > 0 && !store.isRunning && !store.startedAt) {
      store.startExam()
    }
  }, [store.questions.length])

  // Timer
  useEffect(() => {
    if (store.isRunning) {
      timerRef.current = setInterval(() => {
        store.tickTimer()
      }, 1000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [store.isRunning])

  // Auto-submit when time runs out
  useEffect(() => {
    if (store.timeRemaining === 0 && store.isRunning === false && store.questions.length > 0 && !store.result) {
      handleSubmit(true)
    }
  }, [store.timeRemaining, store.isRunning])

  const currentQuestion = store.questions[store.currentIndex]
  const currentAnswer = currentQuestion ? store.answers[currentQuestion.id] : null

  const timerColor = useMemo(() => {
    if (store.timeRemaining < 60) return '#FF3B30'
    if (store.timeRemaining < 180) return '#FF9500'
    return t.colors.primary
  }, [store.timeRemaining, t.colors.primary])

  const handleAnswer = useCallback((optionIndex: number) => {
    if (!currentQuestion) return
    const ms = Date.now() - questionStartMs
    Haptics.selectionAsync()
    store.answer(currentQuestion.id, optionIndex, ms)
  }, [currentQuestion, questionStartMs])

  const handleNext = useCallback(() => {
    setQuestionStartMs(Date.now())
    store.goTo(store.currentIndex + 1)
  }, [store.currentIndex])

  const handlePrev = useCallback(() => {
    setQuestionStartMs(Date.now())
    store.goTo(store.currentIndex - 1)
  }, [store.currentIndex])

  const handleFlag = useCallback(() => {
    if (!currentQuestion) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    store.toggleFlag(currentQuestion.id)
  }, [currentQuestion])

  const handleSubmit = useCallback(async (auto = false) => {
    const answered = Object.values(store.answers).filter(a => a.selectedIndex != null).length
    const unanswered = store.questions.length - answered

    const doSubmit = async () => {
      if (timerRef.current) clearInterval(timerRef.current)
      await store.submitExam(student?.id ?? '')
      router.replace('/exam/result')
    }

    if (auto) {
      await doSubmit()
      return
    }

    Alert.alert(
      'Sınavı Bitir',
      unanswered > 0
        ? `${unanswered} soru boş bırakıldı. Sınavı teslim etmek istiyor musunuz?`
        : 'Tüm soruları yanıtladınız. Sınavı teslim etmek istiyor musunuz?',
      [
        { text: 'Geri Dön', style: 'cancel' },
        { text: 'Teslim Et', style: 'default', onPress: doSubmit },
      ]
    )
  }, [store, student, router])

  const s = useMemo(() => StyleSheet.create({
    container:    { flex: 1, backgroundColor: t.colors.background },
    header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: t.spacing.lg, paddingVertical: t.spacing.md, backgroundColor: t.colors.background, borderBottomWidth: 1, borderBottomColor: t.colors.border },
    headerLeft:   { flex: 1 },
    examLabel:    { fontSize: t.font.sm, color: t.colors.textSub, fontWeight: '600' },
    progressText: { fontSize: t.font.md, color: t.colors.text, fontWeight: '700' },
    timer:        { fontSize: t.font.xl, fontWeight: '800', fontVariant: ['tabular-nums'] },
    headerRight:  { flexDirection: 'row', gap: 8 },
    iconBtn:      { padding: 8, borderRadius: t.radius.sm, backgroundColor: t.colors.surface },
    iconBtnText:  { fontSize: 16 },

    body:         { flex: 1 },
    passageBox:   { margin: t.spacing.lg, padding: t.spacing.lg, backgroundColor: t.colors.surface, borderRadius: t.radius.md, borderWidth: 1, borderColor: t.colors.border },
    passageTitle: { fontSize: t.font.sm, color: t.colors.primary, fontWeight: '700', marginBottom: 8 },
    passageText:  { fontSize: t.font.md, color: t.colors.text, lineHeight: 22 },

    questionBox:  { marginHorizontal: t.spacing.lg, marginTop: t.spacing.sm, padding: t.spacing.lg, backgroundColor: t.colors.surface, borderRadius: t.radius.md },
    questionNum:  { fontSize: t.font.sm, color: t.colors.textSub, fontWeight: '600', marginBottom: 6 },
    questionText: { fontSize: t.font.md, color: t.colors.text, lineHeight: 22, fontWeight: '500' },

    optionsBox:   { marginHorizontal: t.spacing.lg, marginTop: t.spacing.md },
    optionBtn:    { flexDirection: 'row', alignItems: 'flex-start', padding: 14, marginBottom: 10, borderRadius: t.radius.md, backgroundColor: t.colors.surface, borderWidth: 1.5, borderColor: t.colors.border, gap: 10 },
    optionBtnSel: { backgroundColor: t.colors.primary + '15', borderColor: t.colors.primary },
    optionLetter: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: t.colors.border },
    optionLetterSel: { backgroundColor: t.colors.primary },
    optionLetterText: { fontSize: 13, fontWeight: '700', color: t.colors.textSub },
    optionLetterTextSel: { color: '#FFF' },
    optionText:   { flex: 1, fontSize: t.font.md, color: t.colors.text, lineHeight: 20 },

    navBar:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: t.spacing.lg, paddingVertical: t.spacing.md, borderTopWidth: 1, borderTopColor: t.colors.border, backgroundColor: t.colors.background },
    navBtn:       { paddingHorizontal: 20, paddingVertical: 10, borderRadius: t.radius.md, backgroundColor: t.colors.surface, borderWidth: 1, borderColor: t.colors.border },
    navBtnDisabled: { opacity: 0.35 },
    navBtnText:   { fontSize: t.font.md, color: t.colors.text, fontWeight: '600' },
    flagBtn:      { padding: 10, borderRadius: t.radius.md, backgroundColor: t.colors.surface, borderWidth: 1, borderColor: t.colors.border },
    submitBtn:    { paddingHorizontal: 20, paddingVertical: 10, borderRadius: t.radius.md, backgroundColor: t.colors.primary },
    submitBtnText:{ fontSize: t.font.md, color: '#FFF', fontWeight: '700' },

    // Nav modal
    navModal:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    navSheet:     { backgroundColor: t.colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: t.spacing.xl, maxHeight: '60%' },
    navSheetTitle:{ fontSize: t.font.lg, fontWeight: '700', color: t.colors.text, marginBottom: t.spacing.lg },
    navGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    navCell:      { width: 44, height: 44, borderRadius: t.radius.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: t.colors.surface, borderWidth: 1, borderColor: t.colors.border },
    navCellCurrent: { borderColor: t.colors.primary, borderWidth: 2 },
    navCellAnswered: { backgroundColor: t.colors.primary + '20', borderColor: t.colors.primary },
    navCellFlagged:  { backgroundColor: '#FF9500' + '20', borderColor: '#FF9500' },
    navCellText:  { fontSize: 13, fontWeight: '700', color: t.colors.text },
  }), [t])

  if (store.loading) {
    return (
      <SafeAreaView style={s.container}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: t.colors.text, fontSize: t.font.lg }}>Sorular yükleniyor...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (store.error || store.questions.length === 0) {
    return (
      <SafeAreaView style={s.container}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Text style={{ color: t.colors.text, fontSize: t.font.lg, textAlign: 'center', marginBottom: 16 }}>
            {store.error ?? 'Bu sınav tipi için henüz soru bulunamadı.'}
          </Text>
          <TouchableOpacity onPress={() => router.back()} style={[s.submitBtn, { minWidth: 120 }]}>
            <Text style={s.submitBtnText}>Geri Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  if (!currentQuestion) return null

  const LETTERS = ['A', 'B', 'C', 'D']
  const isFlagged = currentAnswer?.isFlagged ?? false
  const isFirst = store.currentIndex === 0
  const isLast = store.currentIndex === store.questions.length - 1

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Text style={s.examLabel}>{examType} {subject ? `· ${subject}` : ''}</Text>
          <Text style={s.progressText}>
            {store.currentIndex + 1} / {store.questions.length}
          </Text>
        </View>
        <Text style={[s.timer, { color: timerColor }]}>{formatTime(store.timeRemaining)}</Text>
        <View style={s.headerRight}>
          <TouchableOpacity style={s.iconBtn} onPress={() => setShowPassages(!showPassages)}>
            <Text style={s.iconBtnText}>📖</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.iconBtn} onPress={() => setNavModalVisible(true)}>
            <Text style={s.iconBtnText}>≡</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={s.body} showsVerticalScrollIndicator={false}>
        {/* Passage */}
        {showPassages && (
          <View style={s.passageBox}>
            <Text style={s.passageTitle}>{currentQuestion.textTitle}</Text>
            <Text style={s.passageText}>{currentQuestion.textBody}</Text>
          </View>
        )}

        {/* Question */}
        <View style={s.questionBox}>
          <Text style={s.questionNum}>Soru {store.currentIndex + 1}</Text>
          <Text style={s.questionText}>{currentQuestion.questionText}</Text>
        </View>

        {/* Options */}
        <View style={s.optionsBox}>
          {currentQuestion.options.map((opt, i) => {
            const selected = currentAnswer?.selectedIndex === i
            return (
              <TouchableOpacity
                key={i}
                style={[s.optionBtn, selected && s.optionBtnSel]}
                onPress={() => handleAnswer(i)}
                activeOpacity={0.7}
              >
                <View style={[s.optionLetter, selected && s.optionLetterSel]}>
                  <Text style={[s.optionLetterText, selected && s.optionLetterTextSel]}>
                    {LETTERS[i]}
                  </Text>
                </View>
                <Text style={s.optionText}>{opt}</Text>
              </TouchableOpacity>
            )
          })}
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Bottom Nav */}
      <View style={s.navBar}>
        <TouchableOpacity
          style={[s.navBtn, isFirst && s.navBtnDisabled]}
          onPress={handlePrev}
          disabled={isFirst}
        >
          <Text style={s.navBtnText}>← Önceki</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.flagBtn, isFlagged && { borderColor: '#FF9500', backgroundColor: '#FF9500' + '20' }]}
          onPress={handleFlag}
        >
          <Text style={{ fontSize: 18 }}>{isFlagged ? '🚩' : '⚑'}</Text>
        </TouchableOpacity>

        {isLast ? (
          <TouchableOpacity style={s.submitBtn} onPress={() => handleSubmit(false)}>
            <Text style={s.submitBtnText}>Teslim Et</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={s.navBtn} onPress={handleNext}>
            <Text style={s.navBtnText}>Sonraki →</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Question Navigator Modal */}
      <Modal visible={navModalVisible} transparent animationType="slide" onRequestClose={() => setNavModalVisible(false)}>
        <TouchableOpacity style={s.navModal} activeOpacity={1} onPress={() => setNavModalVisible(false)}>
          <View style={s.navSheet}>
            <Text style={s.navSheetTitle}>Soru Navigatörü</Text>
            <ScrollView>
              <View style={s.navGrid}>
                {store.questions.map((q, i) => {
                  const ans = store.answers[q.id]
                  const answered = ans?.selectedIndex != null
                  const flagged = ans?.isFlagged
                  const isCurrent = i === store.currentIndex
                  return (
                    <TouchableOpacity
                      key={q.id}
                      style={[
                        s.navCell,
                        answered && s.navCellAnswered,
                        flagged && s.navCellFlagged,
                        isCurrent && s.navCellCurrent,
                      ]}
                      onPress={() => { setNavModalVisible(false); setQuestionStartMs(Date.now()); store.goTo(i) }}
                    >
                      <Text style={s.navCellText}>{i + 1}</Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            </ScrollView>
            <View style={{ marginTop: 20, flexDirection: 'row', gap: 16 }}>
              <TouchableOpacity style={s.submitBtn} onPress={() => { setNavModalVisible(false); handleSubmit(false) }}>
                <Text style={s.submitBtnText}>Sınavı Bitir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  )
}
