/**
 * Paragraf Pratiği — Sonuç Ekranı
 *
 * Gösterir:
 *  - Doğru / Yanlış / Boş / Net skor
 *  - Okuma hızı (WPM) + Süre
 *  - Soru bazlı özet accordion
 *
 * DB Kaydı:
 *  - user_question_sessions (questionService.recordAnswers)
 *  - reading_mode_sessions (WPM + arp_score)
 */

import React, { useEffect, useRef, useState, useMemo } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView,
} from 'react-native'
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming, withDelay,
} from 'react-native-reanimated'
import { useRouter, useLocalSearchParams } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { useAppTheme } from '../../src/theme/useAppTheme'
import type { AppTheme } from '../../src/theme'
import { supabase } from '../../src/lib/supabase'
import { createQuestionService } from '@sprinta/api'
import type { QuestionAnswer, TextQuestion } from '@sprinta/api'

// ─── Renk paleti ──────────────────────────────────────────────────
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

const OPTION_LETTERS = ['A', 'B', 'C', 'D']

const TYPE_LABEL: Record<string, string> = {
  main_idea:  'Ana Fikir',
  inference:  'Çıkarım',
  detail:     'Ayrıntı',
  vocabulary: 'Kelime Anlamı',
  tone:       'Ton',
}

// ─── Yardımcı ─────────────────────────────────────────────────────
function formatTime(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  if (m === 0) return `${s} sn`
  return `${m} dk ${s} sn`
}

// ─── Ana Ekran ────────────────────────────────────────────────────
export default function PracticeResultScreen() {
  const t      = useAppTheme()
  const s      = useMemo(() => ms(t), [t])
  const router = useRouter()

  const {
    textId,
    textTitle,
    examType,
    wordCount,
    wpm,
    durationSec,
    answersJson,
    questionsJson,
  } = useLocalSearchParams<{
    textId:       string
    textTitle:    string
    examType:     string
    wordCount:    string
    wpm:          string
    durationSec:  string
    answersJson:  string
    questionsJson: string
  }>()

  // ── Parse ─────────────────────────────────────────────────────
  const answers: (QuestionAnswer & { selectedIndex: number })[] = useMemo(() => {
    try { return JSON.parse(answersJson ?? '[]') } catch { return [] }
  }, [answersJson])

  const questions: TextQuestion[] = useMemo(() => {
    try { return JSON.parse(questionsJson ?? '[]') } catch { return [] }
  }, [questionsJson])

  // ── Net hesapla ───────────────────────────────────────────────
  const correct  = answers.filter(a => a.isCorrect).length
  const wrong    = answers.filter(a => !a.isCorrect).length
  const blank    = questions.length - answers.length
  const net      = correct - wrong * 0.25
  const total    = questions.length
  const pct      = total > 0 ? Math.round((correct / total) * 100) : 0

  const wpmNum      = parseInt(wpm ?? '0', 10)
  const durationNum = parseInt(durationSec ?? '0', 10)
  const wcNum       = parseInt(wordCount ?? '0', 10)
  const headerCol   = examColor(examType ?? 'tyt')
  const examLabel   = (examType ?? 'TYT').toUpperCase()

  const emoji = pct >= 80 ? '🏆' : pct >= 60 ? '💪' : pct >= 40 ? '📖' : '💡'
  const scoreColor = pct >= 60 ? CORRECT_COLOR : pct >= 40 ? '#F59E0B' : WRONG_COLOR

  // ── Animasyonlar ──────────────────────────────────────────────
  const scoreScale = useSharedValue(0)
  const statOpacity = useSharedValue(0)
  const scoreAnim = useAnimatedStyle(() => ({
    transform: [{ scale: scoreScale.value }],
  }))
  const statAnim = useAnimatedStyle(() => ({
    opacity: statOpacity.value,
    transform: [{ translateY: (1 - statOpacity.value) * 20 }],
  }))

  useEffect(() => {
    scoreScale.value = withSpring(1, { damping: 10, stiffness: 100 })
    statOpacity.value = withDelay(300, withTiming(1, { duration: 500 }))
  }, [])

  // ── DB Kaydet ─────────────────────────────────────────────────
  const savedRef = useRef(false)
  useEffect(() => {
    if (savedRef.current || answers.length === 0) return
    savedRef.current = true

    async function save() {
      try {
        // 1) Soru cevaplarını kaydet
        const qService = createQuestionService(supabase)
        await qService.recordAnswers(answers.map(a => ({
          questionId:          a.questionId,
          textId:              a.textId,
          chapterId:           a.chapterId,
          questionType:        a.questionType,
          isCorrect:           a.isCorrect,
          responseTimeSeconds: a.responseTimeSeconds,
        })))

        // 2) WPM istatistiğini kaydet
        const { data: { user } } = await supabase.auth.getUser()
        if (user && textId) {
          await supabase.from('reading_mode_sessions').insert({
            student_id:       user.id,
            text_id:          textId,
            wpm:              wpmNum || null,
            reading_mode:     'practice_quiz',
            duration_seconds: durationNum,
            arp_score:        total > 0 ? Math.round((correct / total) * 100) : 0,
          })

          // 3) Yanlış cevapları wrong_answers (SRS) tablosuna kaydet
          const wrongAnswers = answers.filter(a => !a.isCorrect)
          if (wrongAnswers.length > 0) {
            const tomorrow = new Date()
            tomorrow.setDate(tomorrow.getDate() + 1)
            const tomorrowStr = tomorrow.toISOString().split('T')[0]

            const waRows = wrongAnswers.map(a => ({
              student_id:     user.id,
              question_id:    a.questionId,
              ease_factor:    2.5,
              interval_days:  1,
              repetitions:    0,
              next_review_at: tomorrowStr,
              attempt_count:  1,
              correct_count:  0,
            }))

            await supabase.from('wrong_answers').upsert(waRows, {
              onConflict: 'student_id,question_id',
              ignoreDuplicates: false,
            })
          }
        }
      } catch (_) {
        // sessizce geç — ana akışı bozma
      }
    }
    save()
  }, [answers, textId, wpmNum, durationNum, correct, total])

  // ── Soru inceleme accordion ───────────────────────────────────
  const [showDetail, setShowDetail] = useState(false)

  // ── Render ────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.root}>

      {/* Header */}
      <View style={[s.header, { backgroundColor: headerCol }]}>
        <Text style={s.headerLabel}>{examLabel} SONUCU</Text>
        <Text style={s.headerTitle} numberOfLines={1}>{textTitle}</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >

        {/* ── Skor hero ─────────────────────────────────────────── */}
        <Animated.View style={[s.scoreCard, { borderColor: scoreColor + '40' }, scoreAnim]}>
          <Text style={s.scoreEmoji}>{emoji}</Text>
          <Text style={[s.scoreNet, { color: scoreColor }]}>
            {net.toFixed(2)} <Text style={s.scoreNetLabel}>Net</Text>
          </Text>
          <Text style={s.scoreSub}>{correct} Doğru · {wrong} Yanlış · {blank} Boş</Text>
          <View style={[s.scorePct, { backgroundColor: scoreColor }]}>
            <Text style={s.scorePctTxt}>%{pct} Başarı</Text>
          </View>
        </Animated.View>

        {/* ── İstatistikler ──────────────────────────────────────── */}
        <Animated.View style={[s.statsRow, statAnim]}>
          <View style={s.statItem}>
            <Text style={s.statVal}>{wcNum > 0 ? wcNum : '—'}</Text>
            <Text style={s.statLabel}>Kelime</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={s.statVal}>{wpmNum > 0 ? wpmNum : '—'}</Text>
            <Text style={s.statLabel}>WPM ⚡</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={s.statVal}>{formatTime(durationNum)}</Text>
            <Text style={s.statLabel}>Süre ⏱</Text>
          </View>
        </Animated.View>

        {/* ── Soru inceleme ──────────────────────────────────────── */}
        <TouchableOpacity
          style={s.detailToggle}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            setShowDetail(v => !v)
          }}
          activeOpacity={0.8}
        >
          <Text style={s.detailToggleTxt}>📊 Soruları İncele {showDetail ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {showDetail && (
          <View style={s.detailBox}>
            {questions.map((q, i) => {
              const ans     = answers.find(a => a.questionId === q.id)
              const isRight = ans?.isCorrect ?? false
              const selIdx  = ans?.selectedIndex ?? -1

              return (
                <View key={q.id} style={[s.detailRow, { borderColor: isRight ? CORRECT_COLOR + '30' : WRONG_COLOR + '30' }]}>
                  <View style={s.detailHeader}>
                    <View style={[s.detailNum, { backgroundColor: isRight ? CORRECT_COLOR : WRONG_COLOR }]}>
                      <Text style={s.detailNumTxt}>{i + 1}</Text>
                    </View>
                    <Text style={[s.detailTypeTxt]}>
                      {TYPE_LABEL[q.question_type] ?? q.question_type}
                    </Text>
                    <Text style={{ fontSize: 16, marginLeft: 'auto' as any }}>
                      {isRight ? '✓' : ans ? '✗' : '○'}
                    </Text>
                  </View>
                  <Text style={s.detailQ} numberOfLines={2}>{q.question_text}</Text>
                  {/* Seçilen şık */}
                  {selIdx >= 0 && (
                    <Text style={[s.detailSel, { color: isRight ? CORRECT_COLOR : WRONG_COLOR }]}>
                      Seçilen: {OPTION_LETTERS[selIdx]}  {q.options[selIdx]}
                    </Text>
                  )}
                  {/* Doğru şık (yanlışsa) */}
                  {!isRight && (
                    <Text style={[s.detailSel, { color: CORRECT_COLOR }]}>
                      Doğru: {OPTION_LETTERS[q.correct_index]}  {q.options[q.correct_index]}
                    </Text>
                  )}
                </View>
              )
            })}
          </View>
        )}

        {/* ── Eylem butonları ────────────────────────────────────── */}
        <View style={s.actionRow}>
          <TouchableOpacity
            style={[s.actionBtn, { borderColor: headerCol + '50' }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
              router.back()
              router.back()
            }}
            activeOpacity={0.8}
          >
            <Text style={s.actionBtnIcon}>🔄</Text>
            <Text style={s.actionBtnTxt}>Başka Metin</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.actionBtn, { backgroundColor: headerCol, borderColor: headerCol }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
              router.push('/(tabs)/index' as any)
            }}
            activeOpacity={0.85}
          >
            <Text style={s.actionBtnIcon}>🏠</Text>
            <Text style={[s.actionBtnTxt, { color: '#fff' }]}>Ana Sayfa</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

// ─── Stiller ─────────────────────────────────────────────────────
function ms(t: AppTheme) {
  return StyleSheet.create({
    root:   { flex: 1, backgroundColor: t.colors.background },
    scroll: { paddingBottom: 24 },

    // Header
    header: {
      paddingHorizontal: 20,
      paddingTop:        18,
      paddingBottom:     20,
      gap:               4,
      alignItems:        'center',
    },
    headerLabel: {
      fontSize:   11,
      fontWeight: '700',
      letterSpacing: 2,
      color:      'rgba(255,255,255,0.7)',
    },
    headerTitle: {
      fontSize:   16,
      fontWeight: '800',
      color:      '#fff',
      textAlign:  'center',
    },

    // Skor kartı
    scoreCard: {
      margin:          16,
      backgroundColor: t.colors.surface,
      borderRadius:    20,
      padding:         24,
      alignItems:      'center',
      gap:             10,
      borderWidth:     2,
      ...t.shadow.md,
    },
    scoreEmoji: { fontSize: 52, lineHeight: 60 },
    scoreNet: {
      fontSize:   52,
      fontWeight: '900',
      lineHeight: 60,
    },
    scoreNetLabel: { fontSize: 20, fontWeight: '600' },
    scoreSub: {
      fontSize:   14,
      color:      t.colors.textSub,
      fontWeight: '600',
    },
    scorePct: {
      borderRadius:      12,
      paddingHorizontal: 20,
      paddingVertical:   6,
    },
    scorePctTxt: {
      fontSize:   14,
      fontWeight: '800',
      color:      '#fff',
    },

    // İstatistikler
    statsRow: {
      flexDirection:   'row',
      marginHorizontal: 16,
      backgroundColor: t.colors.surface,
      borderRadius:    14,
      padding:         16,
      borderWidth:     StyleSheet.hairlineWidth,
      borderColor:     t.colors.border,
      ...t.shadow.sm,
    },
    statItem: {
      flex:       1,
      alignItems: 'center',
      gap:        4,
    },
    statDivider: {
      width:           1,
      backgroundColor: t.colors.divider,
      marginVertical:  4,
    },
    statVal: {
      fontSize:   18,
      fontWeight: '800',
      color:      t.colors.text,
    },
    statLabel: {
      fontSize: 11,
      color:    t.colors.textHint,
    },

    // Soru inceleme toggle
    detailToggle: {
      marginHorizontal: 16,
      marginTop:        14,
      backgroundColor:  t.colors.surface,
      borderRadius:     12,
      paddingVertical:  14,
      alignItems:       'center',
      borderWidth:      StyleSheet.hairlineWidth,
      borderColor:      t.colors.border,
    },
    detailToggleTxt: {
      fontSize:   14,
      fontWeight: '700',
      color:      t.colors.text,
    },

    // Soru detay kutuları
    detailBox: {
      marginHorizontal: 16,
      marginTop:        8,
      gap:              8,
    },
    detailRow: {
      backgroundColor: t.colors.surface,
      borderRadius:    12,
      padding:         12,
      borderWidth:     1,
      gap:             6,
    },
    detailHeader: {
      flexDirection: 'row',
      alignItems:    'center',
      gap:           8,
    },
    detailNum: {
      width:          24,
      height:         24,
      borderRadius:   12,
      alignItems:     'center',
      justifyContent: 'center',
    },
    detailNumTxt: {
      fontSize:   11,
      fontWeight: '800',
      color:      '#fff',
    },
    detailTypeTxt: {
      fontSize:   12,
      fontWeight: '700',
      color:      t.colors.textSub,
    },
    detailQ: {
      fontSize:  13,
      color:     t.colors.text,
      lineHeight: 19,
    },
    detailSel: {
      fontSize:   12,
      fontWeight: '600',
      lineHeight: 18,
    },

    // Eylem butonları
    actionRow: {
      flexDirection:    'row',
      marginHorizontal: 16,
      marginTop:        16,
      gap:              10,
    },
    actionBtn: {
      flex:              1,
      flexDirection:     'row',
      alignItems:        'center',
      justifyContent:    'center',
      paddingVertical:   14,
      borderRadius:      14,
      borderWidth:       1.5,
      backgroundColor:   t.colors.surface,
      gap:               8,
    },
    actionBtnIcon: { fontSize: 18 },
    actionBtnTxt: {
      fontSize:   14,
      fontWeight: '700',
      color:      t.colors.text,
    },
  })
}
