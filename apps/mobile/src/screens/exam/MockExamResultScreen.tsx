/**
 * MockExamResultScreen — Sınav Sonuç Ekranı
 * - Doğru/Yanlış/Boş/Net gösterimi
 * - Ders bazlı breakdown
 * - Cevap anahtarı
 */
import React, { useMemo } from 'react'
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useAppTheme } from '../../theme/useAppTheme'
import { useMockExamStore } from '../../stores/mockExamStore'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}dk ${s}sn`
}

export default function MockExamResultScreen() {
  const t = useAppTheme()
  const router = useRouter()
  const store = useMockExamStore()
  const { result, questions, answers, examType } = store

  const s = useMemo(() => StyleSheet.create({
    container:    { flex: 1, backgroundColor: t.colors.background },
    header:       { paddingHorizontal: t.spacing.xl, paddingTop: t.spacing.xl, paddingBottom: t.spacing.lg },
    title:        { fontSize: t.font.xxl, fontWeight: '800', color: t.colors.text },
    subtitle:     { fontSize: t.font.md, color: t.colors.textSub, marginTop: 4 },
    scoreCard:    { margin: t.spacing.lg, padding: t.spacing.xl, backgroundColor: t.colors.primary + '15', borderRadius: t.radius.xl, borderWidth: 1.5, borderColor: t.colors.primary + '40' },
    netScore:     { fontSize: 48, fontWeight: '900', color: t.colors.primary, textAlign: 'center' },
    netLabel:     { fontSize: t.font.md, color: t.colors.textSub, textAlign: 'center', marginTop: 4 },
    scoreRow:     { flexDirection: 'row', justifyContent: 'space-around', marginTop: t.spacing.lg },
    scoreItem:    { alignItems: 'center' },
    scoreNum:     { fontSize: t.font.xxl, fontWeight: '800' },
    scoreLabel:   { fontSize: t.font.sm, color: t.colors.textSub, marginTop: 2 },
    sectionTitle: { fontSize: t.font.lg, fontWeight: '700', color: t.colors.text, marginHorizontal: t.spacing.lg, marginTop: t.spacing.lg, marginBottom: t.spacing.md },
    catCard:      { marginHorizontal: t.spacing.lg, marginBottom: 10, padding: t.spacing.lg, backgroundColor: t.colors.surface, borderRadius: t.radius.md, borderWidth: 1, borderColor: t.colors.border },
    catName:      { fontSize: t.font.md, fontWeight: '700', color: t.colors.text, marginBottom: 8 },
    catRow:       { flexDirection: 'row', gap: 8 },
    catBadge:     { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, flexDirection: 'row', gap: 4, alignItems: 'center' },
    catBadgeText: { fontSize: t.font.sm, fontWeight: '600' },
    answerCard:   { marginHorizontal: t.spacing.lg, marginBottom: 8, padding: t.spacing.md, backgroundColor: t.colors.surface, borderRadius: t.radius.md, borderWidth: 1, borderLeftWidth: 4 },
    answerNum:    { fontSize: t.font.sm, color: t.colors.textSub, fontWeight: '600', marginBottom: 4 },
    answerQ:      { fontSize: t.font.md, color: t.colors.text, marginBottom: 8 },
    answerRow:    { flexDirection: 'row', gap: 8, alignItems: 'center' },
    answerBadge:  { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
    answerText:   { fontSize: t.font.sm, fontWeight: '600', color: '#FFF' },
    explanation:  { fontSize: t.font.sm, color: t.colors.textSub, marginTop: 6, fontStyle: 'italic' },
    footer:       { padding: t.spacing.xl, gap: 12 },
    primaryBtn:   { paddingVertical: 14, borderRadius: t.radius.lg, backgroundColor: t.colors.primary, alignItems: 'center' },
    primaryBtnTxt:{ fontSize: t.font.lg, fontWeight: '700', color: '#FFF' },
    secondaryBtn: { paddingVertical: 14, borderRadius: t.radius.lg, backgroundColor: t.colors.surface, alignItems: 'center', borderWidth: 1, borderColor: t.colors.border },
    secondaryBtnTxt:{ fontSize: t.font.lg, fontWeight: '600', color: t.colors.text },
  }), [t])

  if (!result) {
    return (
      <SafeAreaView style={s.container}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: t.colors.text }}>Sonuç bulunamadı.</Text>
          <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={[s.primaryBtn, { marginTop: 20, paddingHorizontal: 32 }]}>
            <Text style={s.primaryBtnTxt}>Ana Sayfa</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  const LETTERS = ['A', 'B', 'C', 'D']
  const categories = Object.entries(result.byCategory)

  return (
    <SafeAreaView style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>Sınav Tamamlandı</Text>
          <Text style={s.subtitle}>{examType} · {formatTime(result.timeSpentSeconds)}</Text>
        </View>

        {/* Net Score Card */}
        <View style={s.scoreCard}>
          <Text style={s.netScore}>{result.net.toFixed(2)}</Text>
          <Text style={s.netLabel}>Net Puan</Text>
          <View style={s.scoreRow}>
            <View style={s.scoreItem}>
              <Text style={[s.scoreNum, { color: '#34C759' }]}>{result.correct}</Text>
              <Text style={s.scoreLabel}>Doğru</Text>
            </View>
            <View style={s.scoreItem}>
              <Text style={[s.scoreNum, { color: '#FF3B30' }]}>{result.wrong}</Text>
              <Text style={s.scoreLabel}>Yanlış</Text>
            </View>
            <View style={s.scoreItem}>
              <Text style={[s.scoreNum, { color: t.colors.textSub }]}>{result.empty}</Text>
              <Text style={s.scoreLabel}>Boş</Text>
            </View>
            <View style={s.scoreItem}>
              <Text style={[s.scoreNum, { color: t.colors.text }]}>{questions.length}</Text>
              <Text style={s.scoreLabel}>Toplam</Text>
            </View>
          </View>
        </View>

        {/* Category Breakdown */}
        {categories.length > 1 && (
          <>
            <Text style={s.sectionTitle}>Ders Analizi</Text>
            {categories.map(([cat, stats]) => {
              const catNet = stats.correct - stats.wrong * 0.25
              return (
                <View key={cat} style={s.catCard}>
                  <Text style={s.catName}>{cat}</Text>
                  <View style={s.catRow}>
                    <View style={[s.catBadge, { backgroundColor: '#34C75920' }]}>
                      <Text style={[s.catBadgeText, { color: '#34C759' }]}>✓ {stats.correct}</Text>
                    </View>
                    <View style={[s.catBadge, { backgroundColor: '#FF3B3020' }]}>
                      <Text style={[s.catBadgeText, { color: '#FF3B30' }]}>✗ {stats.wrong}</Text>
                    </View>
                    <View style={[s.catBadge, { backgroundColor: t.colors.border }]}>
                      <Text style={[s.catBadgeText, { color: t.colors.textSub }]}>— {stats.empty}</Text>
                    </View>
                    <View style={[s.catBadge, { backgroundColor: t.colors.primary + '20' }]}>
                      <Text style={[s.catBadgeText, { color: t.colors.primary }]}>Net: {catNet.toFixed(2)}</Text>
                    </View>
                  </View>
                </View>
              )
            })}
          </>
        )}

        {/* Answer Key */}
        <Text style={s.sectionTitle}>Cevap Anahtarı</Text>
        {questions.map((q, i) => {
          const ans = answers[q.id]
          const selected = ans?.selectedIndex
          const correct = q.correctIndex
          const isCorrect = selected === correct
          const isEmpty = selected == null

          const borderColor = isEmpty
            ? t.colors.border
            : isCorrect ? '#34C759' : '#FF3B30'

          return (
            <View key={q.id} style={[s.answerCard, { borderLeftColor: borderColor }]}>
              <Text style={s.answerNum}>Soru {i + 1}</Text>
              <Text style={s.answerQ} numberOfLines={2}>{q.questionText}</Text>
              <View style={s.answerRow}>
                {selected != null && (
                  <View style={[s.answerBadge, { backgroundColor: isCorrect ? '#34C759' : '#FF3B30' }]}>
                    <Text style={s.answerText}>
                      Cevabın: {LETTERS[selected]}
                    </Text>
                  </View>
                )}
                {isEmpty && (
                  <View style={[s.answerBadge, { backgroundColor: t.colors.border }]}>
                    <Text style={[s.answerText, { color: t.colors.textSub }]}>Boş</Text>
                  </View>
                )}
                {!isCorrect && (
                  <View style={[s.answerBadge, { backgroundColor: '#34C75920' }]}>
                    <Text style={[s.answerText, { color: '#34C759' }]}>
                      Doğru: {LETTERS[correct]}
                    </Text>
                  </View>
                )}
              </View>
              {!isCorrect && q.explanation ? (
                <Text style={s.explanation}>{q.explanation}</Text>
              ) : null}
            </View>
          )
        })}

        <View style={{ height: 16 }} />
      </ScrollView>

      {/* Footer */}
      <View style={s.footer}>
        <TouchableOpacity
          style={s.primaryBtn}
          onPress={() => { store.reset(); router.push('/exam/setup') }}
        >
          <Text style={s.primaryBtnTxt}>Yeni Sınav</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={s.secondaryBtn}
          onPress={() => { store.reset(); router.replace('/(tabs)') }}
        >
          <Text style={s.secondaryBtnTxt}>Ana Sayfa</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}
