// =====================================================
// VocabularyExercise — MCQ Kelime Öğrenme Egzersizi
//
// Akış: kelime göster → 4 seçenekli anlam sorusu
//       → skor → XP kazanımı
// Veri: vocabulary_words (Supabase, anon read)
// Oturum: reading_mode_sessions ile kayıt altına alınır
// =====================================================

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  SafeAreaView, Animated, ActivityIndicator,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import { soundService } from '../../services/soundService'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { useAppTheme } from '../../theme/useAppTheme'
import type { AppTheme } from '../../theme'

// ─── Tipler ───────────────────────────────────────────────────────

interface VocabWord {
  id:              string
  word:            string
  meaning:         string
  example_sentence: string | null
  exam_type:       string
  difficulty:      number
  wrong_option_1:  string
  wrong_option_2:  string
  wrong_option_3:  string
}

interface AnswerRecord {
  word:    string
  correct: boolean
  timeMs:  number
}

type Phase = 'loading' | 'word' | 'question' | 'feedback' | 'result'
type ExamFilter = 'all' | 'lgs' | 'tyt' | 'ayt'

export interface VocabularyExerciseProps {
  examFilter?:   ExamFilter
  wordCount?:    number    // kaç kelime oynansın (varsayılan 10)
  onComplete?:   (score: number, xp: number) => void
  onExit?:       () => void
}

// ─── Yardımcılar ──────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildOptions(word: VocabWord): string[] {
  return shuffle([
    word.meaning,
    word.wrong_option_1,
    word.wrong_option_2,
    word.wrong_option_3,
  ])
}

function calcXP(score: number, total: number, avgTimeMs: number): number {
  const pct    = score / total
  const base   = Math.round(pct * 80)
  const speed  = avgTimeMs < 5000 ? 20 : avgTimeMs < 10000 ? 10 : 0
  const bonus  = score === total ? 30 : 0
  return base + speed + bonus
}

// ─── Bileşen ──────────────────────────────────────────────────────

export const VocabularyExercise = React.memo(function VocabularyExercise({
  examFilter = 'all',
  wordCount  = 10,
  onComplete,
  onExit,
}: VocabularyExerciseProps) {
  const t        = useAppTheme()
  const s        = useMemo(() => ms(t), [t])
  const { student } = useAuthStore()

  const [phase,   setPhase]   = useState<Phase>('loading')
  const [words,   setWords]   = useState<VocabWord[]>([])
  const [idx,     setIdx]     = useState(0)
  const [options, setOptions] = useState<string[]>([])
  const [answers, setAnswers] = useState<AnswerRecord[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [wordStartMs, setWordStartMs] = useState(Date.now())
  const [saving, setSaving] = useState(false)

  // animasyon
  const fadeAnim  = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.92)).current

  const fadeIn = useCallback(() => {
    fadeAnim.setValue(0)
    scaleAnim.setValue(0.92)
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, speed: 18, bounciness: 6, useNativeDriver: true }),
    ]).start()
  }, [fadeAnim, scaleAnim])

  // Kelimeleri yükle
  useEffect(() => {
    ;(async () => {
      try {
        let query = (supabase as any).from('vocabulary_words').select('*')
        if (examFilter !== 'all') {
          query = query.in('exam_type', [examFilter, 'all'])
        }
        const { data } = await query
        if (!data || data.length === 0) { setPhase('result'); return }
        const picked = shuffle(data as VocabWord[]).slice(0, wordCount)
        setWords(picked)
        setOptions(buildOptions(picked[0]))
        setWordStartMs(Date.now())
        setPhase('word')
        fadeIn()
      } catch {
        setPhase('result')
      }
    })()
  }, [examFilter, wordCount, fadeIn])

  const currentWord = words[idx]
  const totalWords  = words.length

  // Kelime ekranından soru ekranına geç
  const handleNext = useCallback(() => {
    setPhase('question')
    fadeIn()
  }, [fadeIn])

  // Seçenek seç
  const handleSelect = useCallback((option: string) => {
    if (!currentWord || selected !== null) return
    const correct = option === currentWord.meaning
    const timeMs  = Date.now() - wordStartMs
    setSelected(option)
    setIsCorrect(correct)
    setPhase('feedback')
    setAnswers(prev => [...prev, { word: currentWord.word, correct, timeMs }])
    if (correct) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      soundService.play('correct')
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      soundService.play('wrong')
    }
    // 1.2 sn sonra ileri git
    setTimeout(() => {
      const next = idx + 1
      if (next >= totalWords) {
        saveSession([...answers, { word: currentWord.word, correct, timeMs }])
        setPhase('result')
      } else {
        setIdx(next)
        setOptions(buildOptions(words[next]))
        setSelected(null)
        setIsCorrect(null)
        setWordStartMs(Date.now())
        setPhase('word')
        fadeIn()
      }
    }, 1200)
  }, [currentWord, selected, wordStartMs, idx, totalWords, answers, words, fadeIn])

  const saveSession = useCallback(async (finalAnswers: AnswerRecord[]) => {
    if (!student?.id) return
    const correctCount = finalAnswers.filter(a => a.correct).length
    const avgTime      = finalAnswers.reduce((s, a) => s + a.timeMs, 0) / (finalAnswers.length || 1)
    const xp           = calcXP(correctCount, finalAnswers.length, avgTime)
    setSaving(true)
    try {
      await (supabase as any).from('reading_mode_sessions').insert({
        student_id:       student.id,
        mode:             'vocabulary',
        avg_wpm:          0,
        total_words:      finalAnswers.length,
        duration_seconds: Math.round(finalAnswers.reduce((s, a) => s + a.timeMs, 0) / 1000),
        arp_score:        0,
        xp_earned:        xp,
        completion_ratio: correctCount / (finalAnswers.length || 1),
      })
    } catch { /* sessiz */ }
    finally { setSaving(false) }
    onComplete?.(correctCount, xp)
  }, [student?.id, onComplete])

  // ─── Render: Loading ────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <SafeAreaView style={s.root}>
        <View style={s.center}>
          <ActivityIndicator size="large" color={t.colors.primary} />
          <Text style={s.loadingTxt}>Kelimeler hazırlanıyor…</Text>
        </View>
      </SafeAreaView>
    )
  }

  // ─── Render: Result ──────────────────────────────────────────────
  if (phase === 'result') {
    const correctCount = answers.filter(a => a.correct).length
    const avgTime      = answers.reduce((s, a) => s + a.timeMs, 0) / (answers.length || 1)
    const xp           = calcXP(correctCount, answers.length, avgTime)
    const pct          = answers.length > 0 ? Math.round(correctCount / answers.length * 100) : 0

    return (
      <SafeAreaView style={s.root}>
        <ScrollView contentContainerStyle={s.resultScroll}>
          <Text style={s.resultEmoji}>
            {pct >= 80 ? '🏆' : pct >= 60 ? '⭐' : '📖'}
          </Text>
          <Text style={s.resultTitle}>
            {pct >= 80 ? 'Mükemmel!' : pct >= 60 ? 'İyi İş!' : 'Devam Et!'}
          </Text>
          <Text style={s.resultSub}>
            {correctCount}/{answers.length} doğru · %{pct}
          </Text>

          {/* XP */}
          <View style={s.xpCard}>
            <Text style={s.xpEmoji}>💎</Text>
            <Text style={[s.xpValue, { color: t.colors.primary }]}>+{xp} XP</Text>
            <Text style={s.xpLabel}>Kazandın!</Text>
          </View>

          {/* Kelime özeti */}
          {answers.map((a, i) => (
            <View key={i} style={[s.answerRow, { borderLeftColor: a.correct ? '#10B981' : '#EF4444' }]}>
              <Text style={s.answerWord}>{a.correct ? '✓' : '✗'} {a.word}</Text>
              <Text style={[s.answerTime, { color: t.colors.textHint }]}>
                {(a.timeMs / 1000).toFixed(1)}s
              </Text>
            </View>
          ))}

          <TouchableOpacity style={s.exitBtn} onPress={onExit}>
            <Text style={s.exitBtnTxt}>Tamam</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    )
  }

  // ─── Render: Word / Question / Feedback ─────────────────────────
  if (!currentWord) return null

  const progress = (idx + 1) / totalWords

  return (
    <SafeAreaView style={s.root}>

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity onPress={onExit} style={s.exitIcon}>
          <Text style={s.exitIconTxt}>✕</Text>
        </TouchableOpacity>
        <View style={s.progressBar}>
          <View style={[s.progressFill, { width: `${progress * 100}%` as any }]} />
        </View>
        <Text style={s.progressTxt}>{idx + 1}/{totalWords}</Text>
      </View>

      <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

          {/* ── Kelime kartı ── */}
          <View style={s.wordCard}>
            <View style={s.difficultyRow}>
              {Array.from({ length: currentWord.difficulty }).map((_, i) => (
                <View key={i} style={[s.diffDot, { backgroundColor: t.colors.primary }]} />
              ))}
            </View>
            <Text style={s.wordText}>{currentWord.word}</Text>
            {currentWord.example_sentence && phase !== 'word' && (
              <Text style={s.exampleTxt}>"{currentWord.example_sentence}"</Text>
            )}
            {phase === 'word' && (
              <Text style={s.examTag}>{currentWord.exam_type.toUpperCase()}</Text>
            )}
          </View>

          {/* ── Word phase: Anladım butonu ── */}
          {phase === 'word' && (
            <>
              <Text style={s.instruct}>Kelimeyi incele, hazır olunca devam et</Text>
              <TouchableOpacity style={s.nextBtn} onPress={handleNext} activeOpacity={0.85}>
                <Text style={s.nextBtnTxt}>Anladım →</Text>
              </TouchableOpacity>
            </>
          )}

          {/* ── Question & Feedback phase: seçenekler ── */}
          {(phase === 'question' || phase === 'feedback') && (
            <>
              <Text style={s.questionTxt}>Bu kelimenin anlamı nedir?</Text>
              <View style={s.optionsWrap}>
                {options.map((opt) => {
                  const isSelected = opt === selected
                  const isRightOpt  = opt === currentWord.meaning
                  let bg = t.colors.surface
                  let border = t.colors.border
                  if (phase === 'feedback') {
                    if (isRightOpt) { bg = '#10B98120'; border = '#10B981' }
                    else if (isSelected && !isRightOpt) { bg = '#EF444420'; border = '#EF4444' }
                  } else if (isSelected) {
                    bg = t.colors.primary + '25'
                    border = t.colors.primary
                  }
                  return (
                    <TouchableOpacity
                      key={opt}
                      style={[s.optBtn, { backgroundColor: bg, borderColor: border }]}
                      onPress={() => handleSelect(opt)}
                      activeOpacity={0.8}
                      disabled={phase === 'feedback'}
                    >
                      <Text style={[s.optTxt, { color: t.colors.text }]}>{opt}</Text>
                      {phase === 'feedback' && isRightOpt && (
                        <Text style={s.optIcon}>✓</Text>
                      )}
                      {phase === 'feedback' && isSelected && !isRightOpt && (
                        <Text style={[s.optIcon, { color: '#EF4444' }]}>✗</Text>
                      )}
                    </TouchableOpacity>
                  )
                })}
              </View>
            </>
          )}

        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  )
})

// ─── Stiller ──────────────────────────────────────────────────────
function ms(t: AppTheme) {
  return StyleSheet.create({
    root:   { flex: 1, backgroundColor: t.colors.background },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
    loadingTxt: { fontSize: t.font.sm, color: t.colors.textSub },

    header: {
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: 16, paddingVertical: 14, gap: 10,
    },
    exitIcon: {
      width: 32, height: 32, borderRadius: 16,
      backgroundColor: t.colors.surfaceSub,
      alignItems: 'center', justifyContent: 'center',
    },
    exitIconTxt:  { fontSize: 13, color: t.colors.textHint, fontWeight: '700' },
    progressBar:  { flex: 1, height: 6, backgroundColor: t.colors.surfaceSub, borderRadius: 3, overflow: 'hidden' },
    progressFill: { height: 6, backgroundColor: t.colors.primary, borderRadius: 3 },
    progressTxt:  { fontSize: t.font.xs, color: t.colors.textHint, fontWeight: '700', width: 36, textAlign: 'right' },

    scroll: { padding: 20, paddingBottom: 60, gap: 16 },

    wordCard: {
      backgroundColor: t.colors.surface,
      borderRadius: t.radius.lg,
      padding: 28,
      alignItems: 'center', gap: 14,
      borderWidth: 1, borderColor: t.colors.border,
    },
    difficultyRow: { flexDirection: 'row', gap: 4 },
    diffDot:       { width: 8, height: 8, borderRadius: 4 },
    wordText: {
      fontSize: 38, fontWeight: '900', color: t.colors.text,
      textAlign: 'center', letterSpacing: -0.5,
    },
    exampleTxt: {
      fontSize: t.font.sm, color: t.colors.textSub,
      textAlign: 'center', lineHeight: 20, fontStyle: 'italic',
    },
    examTag: {
      fontSize: t.font.xs, fontWeight: '800',
      color: t.colors.primary,
      backgroundColor: t.colors.primary + '15',
      paddingHorizontal: 10, paddingVertical: 3,
      borderRadius: 999, letterSpacing: 1,
    },

    instruct: {
      fontSize: t.font.sm, color: t.colors.textHint,
      textAlign: 'center', marginTop: 4,
    },
    nextBtn: {
      backgroundColor: t.colors.primary,
      borderRadius: t.radius.md, paddingVertical: 18,
      alignItems: 'center', marginTop: 8,
    },
    nextBtnTxt: { fontSize: t.font.md, fontWeight: '800', color: '#fff' },

    questionTxt: {
      fontSize: t.font.md, fontWeight: '800', color: t.colors.text,
      textAlign: 'center',
    },
    optionsWrap: { gap: 10, marginTop: 4 },
    optBtn: {
      borderRadius: t.radius.md, padding: 16,
      borderWidth: 1.5,
      flexDirection: 'row', alignItems: 'center',
    },
    optTxt:  { flex: 1, fontSize: t.font.sm, fontWeight: '600' },
    optIcon: { fontSize: 18, color: '#10B981', fontWeight: '800' },

    // Result
    resultScroll: { padding: 24, alignItems: 'center', gap: 16, paddingBottom: 60 },
    resultEmoji: { fontSize: 72, marginTop: 20 },
    resultTitle: { fontSize: 28, fontWeight: '900', color: t.colors.text },
    resultSub:   { fontSize: t.font.md, color: t.colors.textSub },
    xpCard: {
      backgroundColor: t.colors.surface,
      borderRadius: t.radius.lg, padding: 20,
      alignItems: 'center', gap: 4, width: '100%',
      borderWidth: 1, borderColor: t.colors.border,
    },
    xpEmoji: { fontSize: 36 },
    xpValue: { fontSize: 32, fontWeight: '900' },
    xpLabel: { fontSize: t.font.sm, color: t.colors.textHint },
    answerRow: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: t.colors.surface,
      borderRadius: t.radius.sm, paddingVertical: 10, paddingHorizontal: 14,
      borderLeftWidth: 4, width: '100%', gap: 8,
    },
    answerWord: { flex: 1, fontSize: t.font.sm, fontWeight: '700', color: t.colors.text },
    answerTime: { fontSize: t.font.xs },
    exitBtn: {
      backgroundColor: t.colors.primary,
      borderRadius: t.radius.md, paddingVertical: 18,
      paddingHorizontal: 48, marginTop: 8,
    },
    exitBtnTxt: { fontSize: t.font.md, fontWeight: '800', color: '#fff' },
  })
}
