/**
 * BossExamScreen — Boss Savaşı Modu
 * Epik turnuva savaşı: 50 soru · 60 dakika · karanlık tema
 * phase: 'lobby' → 'exam' → 'result'
 */
import React, { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import {
  View, Text, TouchableOpacity, ScrollView, Alert,
  StyleSheet, SafeAreaView, FlatList,
} from 'react-native'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { useAppTheme } from '../../theme/useAppTheme'
import { useMockExamStore } from '../../stores/mockExamStore'
import { useAuthStore } from '../../stores/authStore'

// ─── Renkler ───────────────────────────────────────────────────
const BOSS_BG      = '#0D0520'
const BOSS_SURFACE = '#1A0A2E'
const BOSS_RED     = '#FF3366'
const BOSS_PURPLE  = '#8B5CF6'
const BOSS_GOLD    = '#F59E0B'
const BOSS_GREEN   = '#10B981'
const BOSS_GRAY    = '#374151'

// ─── Yardımcılar ───────────────────────────────────────────────
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

interface Props {
  examType: string
  subject: string
}

type Phase = 'lobby' | 'exam' | 'result'

export default function BossExamScreen({ examType, subject }: Props) {
  const t = useAppTheme()
  const router = useRouter()
  const { student } = useAuthStore()
  const store = useMockExamStore()

  const [phase, setPhase] = useState<Phase>('lobby')
  const [questionStartMs, setQuestionStartMs] = useState(Date.now())
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Boss HP: 50 can, her doğru -1
  const correctCount = useMemo(() => {
    if (!store.questions.length) return 0
    return store.questions.filter(q => {
      const ans = store.answers[q.id]
      return ans?.selectedIndex != null && ans.selectedIndex === q.correctIndex
    }).length
  }, [store.questions, store.answers])

  const bossHp = Math.max(0, 50 - correctCount)
  const bossHpPct = bossHp / 50

  // Timer
  useEffect(() => {
    if (phase === 'exam' && store.isRunning) {
      timerRef.current = setInterval(() => store.tickTimer(), 1000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [phase, store.isRunning])

  // Süre dolunca otomatik gönder
  useEffect(() => {
    if (store.timeRemaining === 0 && !store.isRunning && store.questions.length > 0 && !store.result && phase === 'exam') {
      handleSubmit()
    }
  }, [store.timeRemaining, store.isRunning, phase])

  // Sonuç gelince result phase'e geç
  useEffect(() => {
    if (store.result) setPhase('result')
  }, [store.result])

  const currentQuestion = store.questions[store.currentIndex]
  const currentAnswer   = currentQuestion ? store.answers[currentQuestion.id] : null

  const timerColor = useMemo(() => {
    if (store.timeRemaining < 60) return BOSS_RED
    if (store.timeRemaining < 300) return BOSS_GOLD
    return BOSS_GREEN
  }, [store.timeRemaining])

  // ─── Aksiyonlar ───────────────────────────────────────────────
  const handleStart = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
    await store.loadQuestions(examType, subject, 50)
    setPhase('exam')
    store.startExam()
    setQuestionStartMs(Date.now())
  }, [examType, subject])

  const handleAnswer = useCallback((idx: number) => {
    if (!currentQuestion) return
    const ms = Date.now() - questionStartMs
    Haptics.selectionAsync()
    store.answer(currentQuestion.id, idx, ms)
  }, [currentQuestion, questionStartMs])

  const handleNext = useCallback(() => {
    setQuestionStartMs(Date.now())
    store.goTo(store.currentIndex + 1)
  }, [store.currentIndex])

  const handlePrev = useCallback(() => {
    setQuestionStartMs(Date.now())
    store.goTo(store.currentIndex - 1)
  }, [store.currentIndex])

  const handleSubmit = useCallback(() => {
    if (!student?.id) return
    store.submitExam(student.id)
  }, [student])

  const handleSubmitConfirm = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
    Alert.alert(
      '⚔️ Savaşı Bitir',
      'Sınavı teslim etmek istediğine emin misin?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Bitir', style: 'destructive', onPress: handleSubmit },
      ]
    )
  }, [handleSubmit])

  const handleReset = useCallback(() => {
    store.reset()
    setPhase('lobby')
  }, [])

  // ─── LOBİ ──────────────────────────────────────────────────────
  if (phase === 'lobby') {
    return (
      <SafeAreaView style={styles.root}>
        <ScrollView contentContainerStyle={styles.lobbyContent}>

          {/* Boss Header */}
          <View style={styles.bossHeader}>
            <Text style={styles.bossEmoji}>👹</Text>
            <Text style={styles.bossTitle}>BOSS SAVAŞI</Text>
            <Text style={styles.bossSubject}>{examType} — {subject}</Text>
          </View>

          {/* Stats */}
          <View style={styles.statRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNum}>50</Text>
              <Text style={styles.statLbl}>Soru</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNum}>60</Text>
              <Text style={styles.statLbl}>Dakika</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNum}>50</Text>
              <Text style={styles.statLbl}>Boss HP</Text>
            </View>
          </View>

          {/* Kurallar */}
          <View style={styles.rulesBox}>
            <Text style={styles.rulesTitle}>⚔️ SAVAŞ KURALLARI</Text>
            <Text style={styles.ruleItem}>• Her doğru cevap → Boss -1 HP 🩸</Text>
            <Text style={styles.ruleItem}>• Her yanlış cevap → -0.25 puan</Text>
            <Text style={styles.ruleItem}>• Süre dolunca savaş biter</Text>
            <Text style={styles.ruleItem}>• 35+ doğru → Boss yıkılır! 🏆</Text>
            <Text style={styles.ruleItem}>• 20-34 doğru → Berabere ⚔️</Text>
            <Text style={styles.ruleItem}>• 0-19 doğru → Boss kazanır 💀</Text>
          </View>

          {/* Başla */}
          {store.loading ? (
            <Text style={styles.loadingText}>Sorular yükleniyor...</Text>
          ) : (
            <TouchableOpacity style={styles.startBtn} onPress={handleStart} activeOpacity={0.8}>
              <Text style={styles.startBtnText}>⚔️ SAVAŞA GİR</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>← Geri</Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    )
  }

  // ─── SINAV ─────────────────────────────────────────────────────
  if (phase === 'exam') {

    if (!currentQuestion) {
      return (
        <SafeAreaView style={styles.root}>
          <View style={styles.centerBox}>
            <Text style={styles.loadingText}>Sorular yükleniyor...</Text>
          </View>
        </SafeAreaView>
      )
    }

    const opts: string[] = Array.isArray(currentQuestion.options) ? currentQuestion.options : []

    return (
      <SafeAreaView style={styles.root}>

        {/* Üst Bar */}
        <View style={styles.topBar}>
          {/* Boss HP */}
          <View style={styles.hpContainer}>
            <Text style={styles.hpLabel}>👹 {bossHp}/50 HP</Text>
            <View style={styles.hpTrack}>
              <View style={[styles.hpFill, { width: `${bossHpPct * 100}%` as any }]} />
            </View>
          </View>

          {/* Timer */}
          <Text style={[styles.timerText, { color: timerColor }]}>
            ⏱ {formatTime(store.timeRemaining)}
          </Text>

          {/* Soru */}
          <Text style={styles.qCount}>{store.currentIndex + 1}/{store.questions.length}</Text>
        </View>

        {/* Metin + Soru */}
        <ScrollView style={styles.examScroll} contentContainerStyle={{ paddingBottom: 120 }}>
          {currentQuestion.textBody ? (
            <View style={styles.passageBox}>
              <Text style={styles.passageText}>{currentQuestion.textBody}</Text>
            </View>
          ) : null}

          <Text style={styles.questionText}>{currentQuestion.questionText}</Text>

          {opts.map((opt, i) => {
            const selected = currentAnswer?.selectedIndex === i
            return (
              <TouchableOpacity
                key={i}
                style={[styles.optBtn, selected && styles.optBtnSelected]}
                onPress={() => handleAnswer(i)}
                activeOpacity={0.7}
              >
                <Text style={[styles.optLetter, selected && styles.optLetterSel]}>
                  {String.fromCharCode(65 + i)}
                </Text>
                <Text style={[styles.optText, selected && styles.optTextSel]}>{opt}</Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>

        {/* Alt Nav */}
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={[styles.navBtn, store.currentIndex === 0 && styles.navBtnDisabled]}
            onPress={handlePrev}
            disabled={store.currentIndex === 0}
          >
            <Text style={styles.navBtnText}>‹ Önceki</Text>
          </TouchableOpacity>

          {store.currentIndex < store.questions.length - 1 ? (
            <TouchableOpacity style={styles.navBtn} onPress={handleNext}>
              <Text style={styles.navBtnText}>Sonraki ›</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitConfirm}>
              <Text style={styles.submitBtnText}>⚔️ TESLİM ET</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Soru Grid Modal Butonu */}
        <View style={styles.qGrid}>
          <FlatList
            data={store.questions}
            keyExtractor={q => q.id}
            numColumns={10}
            horizontal={false}
            scrollEnabled={false}
            getItemLayout={(_data, index) => ({ length: 30, offset: 30 * Math.floor(index / 10), index })}
            renderItem={({ item, index }) => {
              const ans = store.answers[item.id]
              const isActive = index === store.currentIndex
              const hasAns = ans?.selectedIndex != null
              return (
                <TouchableOpacity
                  onPress={() => store.goTo(index)}
                  style={[
                    styles.qDot,
                    isActive && styles.qDotActive,
                    hasAns && !isActive && styles.qDotAnswered,
                  ]}
                >
                  <Text style={styles.qDotText}>{index + 1}</Text>
                </TouchableOpacity>
              )
            }}
          />
        </View>

      </SafeAreaView>
    )
  }

  // ─── SONUÇ ─────────────────────────────────────────────────────
  if (phase === 'result' && store.result) {
    const { correct, wrong, empty, net } = store.result
    const bossDefeated = correct >= 35
    const draw         = !bossDefeated && correct >= 20

    const resultEmoji  = bossDefeated ? '🏆' : draw ? '⚔️' : '💀'
    const resultTitle  = bossDefeated ? 'BOSS YIKILDI!' : draw ? 'İYİ SAVAŞ!' : 'BOSS KAZANDI!'
    const resultColor  = bossDefeated ? BOSS_GREEN : draw ? BOSS_GOLD : BOSS_RED
    const resultMsg    = bossDefeated
      ? 'Harika! Bossu devirdin ve efsane rozeti kazandın!'
      : draw
      ? 'Yakındın! Biraz daha çalışarak bossu yenebilirsin.'
      : 'Bu sefer Boss güçlüydü. Tekrar dene ve intikamını al!'

    return (
      <SafeAreaView style={styles.root}>
        <ScrollView contentContainerStyle={styles.resultContent}>

          <Text style={{ fontSize: 80, textAlign: 'center', marginTop: 20 }}>{resultEmoji}</Text>
          <Text style={[styles.resultTitle, { color: resultColor }]}>{resultTitle}</Text>
          <Text style={styles.resultMsg}>{resultMsg}</Text>

          {/* Stats */}
          <View style={styles.resultGrid}>
            <View style={styles.resultStat}>
              <Text style={[styles.resultStatNum, { color: BOSS_GREEN }]}>{correct}</Text>
              <Text style={styles.resultStatLbl}>Doğru</Text>
            </View>
            <View style={styles.resultStat}>
              <Text style={[styles.resultStatNum, { color: BOSS_RED }]}>{wrong}</Text>
              <Text style={styles.resultStatLbl}>Yanlış</Text>
            </View>
            <View style={styles.resultStat}>
              <Text style={[styles.resultStatNum, { color: BOSS_GRAY }]}>{empty}</Text>
              <Text style={styles.resultStatLbl}>Boş</Text>
            </View>
            <View style={styles.resultStat}>
              <Text style={[styles.resultStatNum, { color: BOSS_GOLD }]}>{net.toFixed(2)}</Text>
              <Text style={styles.resultStatLbl}>Net</Text>
            </View>
          </View>

          <Text style={styles.xpText}>⚡ {correct * 20} XP kazandın!</Text>

          <TouchableOpacity style={styles.retryBtn} onPress={handleReset}>
            <Text style={styles.retryBtnText}>⚔️ Yeniden Savaş</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.exitBtn} onPress={() => { store.reset(); router.back() }}>
            <Text style={styles.exitBtnText}>← Çıkış</Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    )
  }

  return null
}

// ─── Stiller ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  root:           { flex: 1, backgroundColor: BOSS_BG },
  lobbyContent:   { padding: 24, alignItems: 'center' },

  bossHeader:     { alignItems: 'center', marginBottom: 32, marginTop: 16 },
  bossEmoji:      { fontSize: 64, marginBottom: 8 },
  bossTitle:      { fontSize: 32, fontWeight: '900', color: BOSS_RED, letterSpacing: 4 },
  bossSubject:    { fontSize: 16, color: BOSS_PURPLE, fontWeight: '600', marginTop: 4 },

  statRow:        { flexDirection: 'row', gap: 16, marginBottom: 28 },
  statCard:       { backgroundColor: BOSS_SURFACE, borderRadius: 12, padding: 16, alignItems: 'center', minWidth: 80, borderWidth: 1, borderColor: BOSS_PURPLE + '40' },
  statNum:        { fontSize: 28, fontWeight: '900', color: BOSS_GOLD },
  statLbl:        { fontSize: 12, color: '#9CA3AF', marginTop: 2 },

  rulesBox:       { backgroundColor: BOSS_SURFACE, borderRadius: 16, padding: 20, width: '100%', marginBottom: 32, borderWidth: 1, borderColor: BOSS_RED + '40' },
  rulesTitle:     { fontSize: 14, fontWeight: '800', color: BOSS_RED, marginBottom: 12, textAlign: 'center', letterSpacing: 2 },
  ruleItem:       { fontSize: 14, color: '#D1D5DB', marginBottom: 6 },

  loadingText:    { color: '#9CA3AF', fontSize: 16, textAlign: 'center', marginVertical: 20 },

  startBtn:       { backgroundColor: BOSS_RED, borderRadius: 16, paddingHorizontal: 48, paddingVertical: 18, width: '100%', alignItems: 'center', shadowColor: BOSS_RED, shadowRadius: 16, shadowOpacity: 0.6, shadowOffset: { width: 0, height: 4 }, elevation: 8 },
  startBtnText:   { fontSize: 18, fontWeight: '900', color: '#FFFFFF', letterSpacing: 3 },

  backBtn:        { marginTop: 16, padding: 12 },
  backBtnText:    { color: '#6B7280', fontSize: 15 },

  centerBox:      { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Exam
  topBar:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: BOSS_SURFACE, borderBottomWidth: 1, borderBottomColor: BOSS_PURPLE + '30' },
  hpContainer:    { flex: 1 },
  hpLabel:        { fontSize: 11, color: '#EF4444', fontWeight: '700', marginBottom: 3 },
  hpTrack:        { height: 6, backgroundColor: '#1F2937', borderRadius: 3, overflow: 'hidden' },
  hpFill:         { height: 6, backgroundColor: '#EF4444', borderRadius: 3 },
  timerText:      { fontSize: 18, fontWeight: '900', marginHorizontal: 12 },
  qCount:         { fontSize: 13, color: '#9CA3AF', fontWeight: '700' },

  examScroll:     { flex: 1, padding: 16 },
  passageBox:     { backgroundColor: BOSS_SURFACE, borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: BOSS_PURPLE + '30' },
  passageText:    { fontSize: 13, color: '#D1D5DB', lineHeight: 20 },
  questionText:   { fontSize: 15, fontWeight: '700', color: '#F9FAFB', marginBottom: 16, lineHeight: 22 },

  optBtn:         { flexDirection: 'row', alignItems: 'center', backgroundColor: BOSS_SURFACE, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#374151' },
  optBtnSelected: { borderColor: BOSS_PURPLE, backgroundColor: BOSS_PURPLE + '22' },
  optLetter:      { width: 28, height: 28, borderRadius: 14, backgroundColor: '#374151', textAlign: 'center', lineHeight: 28, fontSize: 13, fontWeight: '800', color: '#9CA3AF', marginRight: 12 },
  optLetterSel:   { backgroundColor: BOSS_PURPLE, color: '#FFFFFF' },
  optText:        { flex: 1, fontSize: 14, color: '#D1D5DB' },
  optTextSel:     { color: '#FFFFFF', fontWeight: '600' },

  bottomNav:      { flexDirection: 'row', justifyContent: 'space-between', padding: 12, backgroundColor: BOSS_SURFACE, borderTopWidth: 1, borderTopColor: '#1F2937' },
  navBtn:         { backgroundColor: '#1F2937', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 12 },
  navBtnDisabled: { opacity: 0.3 },
  navBtnText:     { color: '#9CA3AF', fontWeight: '700', fontSize: 14 },
  submitBtn:      { backgroundColor: BOSS_RED, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 12 },
  submitBtnText:  { color: '#FFFFFF', fontWeight: '900', fontSize: 14, letterSpacing: 1 },

  qGrid:          { maxHeight: 90, padding: 8, backgroundColor: BOSS_SURFACE },
  qDot:           { width: 26, height: 26, borderRadius: 5, backgroundColor: '#1F2937', margin: 2, alignItems: 'center', justifyContent: 'center' },
  qDotActive:     { backgroundColor: BOSS_PURPLE },
  qDotAnswered:   { backgroundColor: '#065F46' },
  qDotText:       { fontSize: 9, color: '#9CA3AF', fontWeight: '700' },

  // Result
  resultContent:  { padding: 24, alignItems: 'center' },
  resultTitle:    { fontSize: 30, fontWeight: '900', letterSpacing: 3, marginVertical: 8, textAlign: 'center' },
  resultMsg:      { fontSize: 15, color: '#D1D5DB', textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  resultGrid:     { flexDirection: 'row', gap: 16, marginBottom: 20 },
  resultStat:     { backgroundColor: BOSS_SURFACE, borderRadius: 12, padding: 16, alignItems: 'center', minWidth: 72 },
  resultStatNum:  { fontSize: 26, fontWeight: '900' },
  resultStatLbl:  { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  xpText:         { fontSize: 20, fontWeight: '900', color: BOSS_GOLD, marginBottom: 28, letterSpacing: 1 },
  retryBtn:       { backgroundColor: BOSS_RED, borderRadius: 16, paddingHorizontal: 48, paddingVertical: 16, width: '100%', alignItems: 'center', marginBottom: 12 },
  retryBtnText:   { color: '#FFFFFF', fontWeight: '900', fontSize: 16, letterSpacing: 2 },
  exitBtn:        { paddingVertical: 12 },
  exitBtnText:    { color: '#6B7280', fontSize: 15 },
})
