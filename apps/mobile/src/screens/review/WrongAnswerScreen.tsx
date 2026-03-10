/**
 * WrongAnswerScreen — SRS (SM-2) Tekrar Modu
 * - Bugün tekrar edilecek yanlış cevaplar
 * - Kolay / Normal / Zor / Bilmiyorum butonları
 * - SM-2 algoritması (update_sm2 RPC)
 * - Tamamlama animasyonu
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  View, Text, TouchableOpacity, ScrollView, ActivityIndicator,
  StyleSheet, SafeAreaView, Animated,
} from 'react-native'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { useAppTheme } from '../../theme/useAppTheme'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'

interface ReviewItem {
  wrongAnswerId: string
  questionId: string
  questionText: string
  options: string[]
  correctIndex: number
  explanation: string
  textTitle: string
  textBody: string
  category: string
  nextReviewAt: string
  repetitions: number
}

interface RatingResult {
  quality: number   // SM-2: 0=bilmiyorum, 2=zor, 3=normal, 5=kolay
  label: string
  color: string
}

const RATINGS: RatingResult[] = [
  { quality: 0, label: 'Bilmiyorum', color: '#FF3B30' },
  { quality: 2, label: 'Zor',        color: '#FF9500' },
  { quality: 3, label: 'Normal',     color: '#1877F2' },
  { quality: 5, label: 'Kolay',      color: '#34C759' },
]

export default function WrongAnswerScreen() {
  const t = useAppTheme()
  const router = useRouter()
  const { student } = useAuthStore()

  const [items, setItems] = useState<ReviewItem[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [showPassage, setShowPassage] = useState(false)
  const [stats, setStats] = useState({ reviewed: 0, easy: 0, hard: 0 })
  const [fadeAnim] = useState(new Animated.Value(1))

  useEffect(() => {
    loadDueItems()
  }, [student?.id])

  const loadDueItems = async () => {
    if (!student?.id) return
    setLoading(true)

    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('wrong_answers')
      .select(`
        id,
        question_id,
        next_review_at,
        repetitions,
        text_questions!inner (
          id,
          question_text,
          options,
          correct_index,
          explanation,
          text_library!inner (
            title,
            body,
            category
          )
        )
      `)
      .eq('student_id', student.id)
      .lte('next_review_at', today)
      .order('next_review_at', { ascending: true })
      .limit(30)

    if (error) { setLoading(false); return }

    const mapped: ReviewItem[] = (data ?? []).map((row: any) => ({
      wrongAnswerId: row.id,
      questionId: row.question_id,
      questionText: row.text_questions?.question_text ?? '',
      options: Array.isArray(row.text_questions?.options) ? row.text_questions.options : [],
      correctIndex: row.text_questions?.correct_index ?? 0,
      explanation: row.text_questions?.explanation ?? '',
      textTitle: row.text_questions?.text_library?.title ?? '',
      textBody: row.text_questions?.text_library?.body ?? '',
      category: row.text_questions?.text_library?.category ?? '',
      nextReviewAt: row.next_review_at,
      repetitions: row.repetitions ?? 0,
    }))

    setItems(mapped)
    setLoading(false)
  }

  const handleRating = useCallback(async (quality: number) => {
    const item = items[currentIndex]
    if (!item || !student?.id) return

    Haptics.impactAsync(quality >= 3 ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium)

    // SM-2 güncelle
    await supabase.rpc('update_sm2', {
      p_student_id: student.id,
      p_question_id: item.questionId,
      p_quality: quality,
    })

    setStats(prev => ({
      reviewed: prev.reviewed + 1,
      easy: prev.easy + (quality >= 4 ? 1 : 0),
      hard: prev.hard + (quality <= 2 ? 1 : 0),
    }))

    // Animate out
    Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setShowAnswer(false)
      setShowPassage(false)
      setCurrentIndex(i => i + 1)
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start()
    })
  }, [items, currentIndex, student, fadeAnim])

  const s = useMemo(() => StyleSheet.create({
    container:    { flex: 1, backgroundColor: t.colors.background },
    header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: t.spacing.lg, paddingVertical: t.spacing.md, backgroundColor: t.colors.background, borderBottomWidth: 1, borderBottomColor: t.colors.border },
    headerLeft:   { gap: 2 },
    headerTitle:  { fontSize: t.font.lg, fontWeight: '700', color: t.colors.text },
    headerSub:    { fontSize: t.font.sm, color: t.colors.textSub },
    closeBtn:     { padding: 8 },
    closeBtnTxt:  { fontSize: 18, color: t.colors.textSub },
    progress:     { height: 4, backgroundColor: t.colors.border, marginHorizontal: t.spacing.lg, marginTop: 8, borderRadius: 2 },
    progressFill: { height: 4, backgroundColor: t.colors.primary, borderRadius: 2 },
    body:         { flex: 1 },
    passageBtn:   { margin: t.spacing.lg, padding: 12, borderRadius: t.radius.md, backgroundColor: t.colors.surface, borderWidth: 1, borderColor: t.colors.border, flexDirection: 'row', alignItems: 'center', gap: 8 },
    passageBtnTxt:{ fontSize: t.font.md, color: t.colors.text, flex: 1 },
    passageBox:   { marginHorizontal: t.spacing.lg, marginBottom: 12, padding: t.spacing.lg, backgroundColor: t.colors.surface, borderRadius: t.radius.md, borderWidth: 1, borderColor: t.colors.border },
    passageTitle: { fontSize: t.font.sm, color: t.colors.primary, fontWeight: '700', marginBottom: 8 },
    passageText:  { fontSize: 13, color: t.colors.text, lineHeight: 20 },
    qCard:        { marginHorizontal: t.spacing.lg, padding: t.spacing.lg, backgroundColor: t.colors.surface, borderRadius: t.radius.md, borderWidth: 1, borderColor: t.colors.border, marginBottom: 12 },
    qCategory:    { fontSize: t.font.sm, color: t.colors.primary, fontWeight: '700', marginBottom: 6 },
    qText:        { fontSize: t.font.md, color: t.colors.text, lineHeight: 22, fontWeight: '500' },
    showAnsBtn:   { marginHorizontal: t.spacing.lg, padding: 14, borderRadius: t.radius.lg, backgroundColor: t.colors.primary, alignItems: 'center', marginBottom: 12 },
    showAnsBtnTxt:{ fontSize: t.font.lg, fontWeight: '700', color: '#FFF' },
    answerBox:    { marginHorizontal: t.spacing.lg, padding: t.spacing.lg, backgroundColor: '#34C75915', borderRadius: t.radius.md, borderWidth: 1.5, borderColor: '#34C759', marginBottom: 12 },
    answerLabel:  { fontSize: t.font.sm, color: '#34C759', fontWeight: '700', marginBottom: 6 },
    answerText:   { fontSize: t.font.md, color: t.colors.text, fontWeight: '600', marginBottom: 8 },
    explanation:  { fontSize: t.font.sm, color: t.colors.textSub, fontStyle: 'italic' },
    ratingsBox:   { paddingHorizontal: t.spacing.lg, paddingBottom: t.spacing.xl },
    ratingsLabel: { fontSize: t.font.sm, color: t.colors.textSub, textAlign: 'center', marginBottom: 12 },
    ratingsRow:   { flexDirection: 'row', gap: 10 },
    ratingBtn:    { flex: 1, paddingVertical: 12, borderRadius: t.radius.md, alignItems: 'center' },
    ratingBtnTxt: { fontSize: t.font.sm, fontWeight: '700', color: '#FFF' },
    // Completion
    doneBox:      { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
    doneIcon:     { fontSize: 64, marginBottom: 16 },
    doneTitle:    { fontSize: t.font.xxl, fontWeight: '800', color: t.colors.text, marginBottom: 8, textAlign: 'center' },
    doneSub:      { fontSize: t.font.md, color: t.colors.textSub, textAlign: 'center', marginBottom: 32 },
    statRow:      { flexDirection: 'row', gap: 20, marginBottom: 32 },
    statItem:     { alignItems: 'center' },
    statNum:      { fontSize: 28, fontWeight: '900' },
    statLabel:    { fontSize: t.font.sm, color: t.colors.textSub },
    doneBtn:      { paddingHorizontal: 32, paddingVertical: 14, borderRadius: t.radius.lg, backgroundColor: t.colors.primary },
    doneBtnTxt:   { fontSize: t.font.lg, fontWeight: '700', color: '#FFF' },
  }), [t])

  if (loading) {
    return (
      <SafeAreaView style={s.container}>
        <ActivityIndicator style={{ flex: 1 }} size="large" color={t.colors.primary} />
      </SafeAreaView>
    )
  }

  // Completion screen
  if (currentIndex >= items.length) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.doneBox}>
          <Text style={s.doneIcon}>🎉</Text>
          <Text style={s.doneTitle}>
            {items.length === 0 ? 'Harika! Bugün tekrar yapılacak soru yok.' : 'Tüm tekrarlar tamamlandı!'}
          </Text>
          <Text style={s.doneSub}>
            {items.length > 0 ? `${stats.reviewed} soru gözden geçirildi.` : 'Daha fazla soru çözünce burada görünecek.'}
          </Text>
          {stats.reviewed > 0 && (
            <View style={s.statRow}>
              <View style={s.statItem}>
                <Text style={[s.statNum, { color: '#34C759' }]}>{stats.easy}</Text>
                <Text style={s.statLabel}>Kolay</Text>
              </View>
              <View style={s.statItem}>
                <Text style={[s.statNum, { color: t.colors.primary }]}>{stats.reviewed - stats.easy - stats.hard}</Text>
                <Text style={s.statLabel}>Normal</Text>
              </View>
              <View style={s.statItem}>
                <Text style={[s.statNum, { color: '#FF3B30' }]}>{stats.hard}</Text>
                <Text style={s.statLabel}>Zor</Text>
              </View>
            </View>
          )}
          <TouchableOpacity style={s.doneBtn} onPress={() => router.back()}>
            <Text style={s.doneBtnTxt}>Ana Sayfaya Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  const item = items[currentIndex]
  const LETTERS = ['A', 'B', 'C', 'D']
  const progress = items.length > 0 ? currentIndex / items.length : 0

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Text style={s.headerTitle}>Tekrar Zamanı</Text>
          <Text style={s.headerSub}>{currentIndex + 1} / {items.length} · {item.category}</Text>
        </View>
        <TouchableOpacity style={s.closeBtn} onPress={() => router.back()}>
          <Text style={s.closeBtnTxt}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      <View style={s.progress}>
        <View style={[s.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>
        <ScrollView style={s.body} showsVerticalScrollIndicator={false}>
          {/* Passage toggle */}
          <TouchableOpacity style={s.passageBtn} onPress={() => setShowPassage(v => !v)}>
            <Text style={s.passageBtnTxt}>📖 {item.textTitle}</Text>
            <Text style={{ color: t.colors.primary }}>{showPassage ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {showPassage && (
            <View style={s.passageBox}>
              <Text style={s.passageTitle}>{item.textTitle}</Text>
              <Text style={s.passageText} numberOfLines={showPassage ? undefined : 5}>
                {item.textBody}
              </Text>
            </View>
          )}

          {/* Question */}
          <View style={s.qCard}>
            <Text style={s.qCategory}>{item.category}</Text>
            <Text style={s.qText}>{item.questionText}</Text>
          </View>

          {/* Show Answer button */}
          {!showAnswer && (
            <TouchableOpacity style={s.showAnsBtn} onPress={() => setShowAnswer(true)}>
              <Text style={s.showAnsBtnTxt}>Cevabı Göster</Text>
            </TouchableOpacity>
          )}

          {/* Answer */}
          {showAnswer && (
            <View style={s.answerBox}>
              <Text style={s.answerLabel}>✓ Doğru Cevap</Text>
              <Text style={s.answerText}>
                {LETTERS[item.correctIndex]}. {item.options[item.correctIndex]}
              </Text>
              {item.explanation ? (
                <Text style={s.explanation}>{item.explanation}</Text>
              ) : null}
            </View>
          )}

          <View style={{ height: 16 }} />
        </ScrollView>

        {/* Rating buttons (only after showing answer) */}
        {showAnswer && (
          <View style={s.ratingsBox}>
            <Text style={s.ratingsLabel}>Bu soruyu ne kadar iyi bildiniz?</Text>
            <View style={s.ratingsRow}>
              {RATINGS.map((r) => (
                <TouchableOpacity
                  key={r.quality}
                  style={[s.ratingBtn, { backgroundColor: r.color }]}
                  onPress={() => handleRating(r.quality)}
                >
                  <Text style={s.ratingBtnTxt}>{r.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </Animated.View>
    </SafeAreaView>
  )
}
