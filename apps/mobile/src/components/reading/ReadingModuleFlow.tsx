/**
 * ReadingModuleFlow
 * Tüm okuma modülleri için birleşik akış:
 *   1. İçerik Seç (ContentImportModal)
 *   2. Egzersiz (renderExercise prop)
 *   3. Anlama Soruları (3-5 MCQ from text_library)
 *   4. Sonuç Ekranı (rich result)
 */
import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import ContentImportModal, { type ImportedContent } from '../exercises/shared/ContentImportModal'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { createBadgeService } from '@sprinta/api'
import { MODULE_INTRO } from '../exercise/ReadingModuleIntro'
import type { Badge } from '@sprinta/api'

const badgeSvc = createBadgeService(supabase)
const { width: SW } = Dimensions.get('window')

// ─── Public Types ───────────────────────────────────────────────────

export interface BaseReadingMetrics {
  avgWPM:          number
  totalWords:      number
  durationSeconds: number
  completionRatio: number   // 0-1
  arpScore:        number   // 0-400
  xpEarned:        number
  libraryTextId?:  string   // for fetching questions
}

// ─── Internal Types ─────────────────────────────────────────────────

interface QuestionRow {
  id:            string
  question_text: string
  options:       string[]
  correct_index: number
  explanation?:  string | null
}

type Phase = 'picking' | 'exercising' | 'questioning' | 'results'

// ─── Props ──────────────────────────────────────────────────────────

interface Props {
  moduleKey: string
  onBack:    () => void
  renderExercise: (
    content:    ImportedContent,
    onComplete: (m: BaseReadingMetrics) => void,
    onExit:     () => void,
  ) => React.ReactNode
}

// ─── Helpers ────────────────────────────────────────────────────────

function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60)
  const s = Math.round(secs % 60)
  return m > 0 ? `${m}dk ${s}sn` : `${s}sn`
}

function shuffleArray<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

// ─── QuestionPhase ──────────────────────────────────────────────────

interface QuestionPhaseProps {
  question:       QuestionRow
  index:          number
  total:          number
  accentColor:    string
  moduleLabel:    string
  selectedAnswer: number | null
  showFeedback:   boolean
  onAnswer:       (idx: number) => void
}

function QuestionPhase({
  question,
  index,
  total,
  accentColor,
  moduleLabel,
  selectedAnswer,
  showFeedback,
  onAnswer,
}: QuestionPhaseProps) {
  const LETTERS = ['A', 'B', 'C', 'D', 'E']

  const getOptionStyle = (optIdx: number) => {
    if (!showFeedback) {
      return [qs.optionBtn]
    }
    if (optIdx === question.correct_index) {
      return [qs.optionBtn, qs.optionCorrect]
    }
    if (optIdx === selectedAnswer && optIdx !== question.correct_index) {
      return [qs.optionBtn, qs.optionWrong]
    }
    return [qs.optionBtn, qs.optionDimmed]
  }

  const getOptionTextStyle = (optIdx: number) => {
    if (!showFeedback) return [qs.optionText]
    if (optIdx === question.correct_index) return [qs.optionText, qs.optionTextCorrect]
    if (optIdx === selectedAnswer && optIdx !== question.correct_index) return [qs.optionText, qs.optionTextWrong]
    return [qs.optionText, qs.optionTextDimmed]
  }

  const getPrefix = (optIdx: number) => {
    if (!showFeedback) return LETTERS[optIdx]
    if (optIdx === question.correct_index) return '✓'
    if (optIdx === selectedAnswer && optIdx !== question.correct_index) return '✗'
    return LETTERS[optIdx]
  }

  return (
    <SafeAreaView style={qs.root}>
      {/* Top bar */}
      <View style={qs.topBar}>
        <Text style={[qs.moduleLabel, { color: accentColor }]}>{moduleLabel}</Text>
        <Text style={qs.topTitle}>Anlama Sorusu</Text>
        <Text style={qs.counter}>{index + 1}/{total}</Text>
      </View>

      {/* Progress bar */}
      <View style={qs.progressTrack}>
        <View
          style={[
            qs.progressFill,
            {
              width: `${((index + 1) / total) * 100}%`,
              backgroundColor: accentColor,
            },
          ]}
        />
      </View>

      <ScrollView
        style={qs.scroll}
        contentContainerStyle={qs.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Question */}
        <View style={qs.questionBox}>
          <Text style={qs.questionText}>{question.question_text}</Text>
        </View>

        {/* Options */}
        <View style={qs.optionsContainer}>
          {(question.options as string[]).map((opt, optIdx) => (
            <TouchableOpacity
              key={optIdx}
              style={getOptionStyle(optIdx)}
              onPress={() => onAnswer(optIdx)}
              activeOpacity={0.8}
              disabled={showFeedback}
            >
              <View style={[qs.letterBadge, { backgroundColor: accentColor + '20', borderColor: accentColor + '40' }]}>
                <Text style={[qs.letterText, { color: accentColor }]}>
                  {getPrefix(optIdx)}
                </Text>
              </View>
              <Text style={getOptionTextStyle(optIdx)}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Explanation */}
        {showFeedback && question.explanation ? (
          <View style={[qs.explanationCard, { borderColor: accentColor + '40', backgroundColor: accentColor + '0A' }]}>
            <Text style={[qs.explanationTitle, { color: accentColor }]}>💡 Açıklama</Text>
            <Text style={qs.explanationText}>{question.explanation}</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  )
}

// ─── ResultPhase ─────────────────────────────────────────────────────

interface ResultPhaseProps {
  moduleKey:       string
  metrics:         BaseReadingMetrics
  correctAnswers:  number
  totalQuestions:  number
  accentColor:     string
  moduleLabel:     string
  moduleIcon:      string
  badges:          Badge[]
  onRetry:         () => void
  onHome:          () => void
}

function ResultPhase({
  metrics,
  correctAnswers,
  totalQuestions,
  accentColor,
  moduleLabel,
  moduleIcon,
  badges,
  onRetry,
  onHome,
}: ResultPhaseProps) {
  const arpShared = useSharedValue(0)
  const cardScale = useSharedValue(0.85)
  const headerOpacity = useSharedValue(0)

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.quad) })
    cardScale.value = withDelay(200, withSpring(1, { damping: 14, stiffness: 120 }))
    arpShared.value = withDelay(
      400,
      withTiming(metrics.arpScore, { duration: 1500, easing: Easing.out(Easing.cubic) })
    )
  }, [])

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: (1 - headerOpacity.value) * -20 }],
  }))

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }))

  const arpStyle = useAnimatedStyle(() => ({
    // drives text update via state
  }))

  const [displayArp, setDisplayArp] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    let start = 0
    const target = metrics.arpScore
    const duration = 1500
    const steps = 60
    const increment = target / steps
    const stepTime = duration / steps

    intervalRef.current = setInterval(() => {
      start += increment
      if (start >= target) {
        setDisplayArp(target)
        if (intervalRef.current) clearInterval(intervalRef.current)
      } else {
        setDisplayArp(Math.round(start))
      }
    }, stepTime)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [metrics.arpScore])

  const motivationalMessage = () => {
    if (metrics.arpScore >= 300) return 'Mükemmel performans! Okuma ustalığına yaklaşıyorsun.'
    if (metrics.arpScore >= 200) return 'Harika iş! Hızın ve kavraman gelişiyor.'
    if (metrics.arpScore >= 100) return 'İyi gidiyorsun! Her seans seni güçlendiriyor.'
    return 'Devam et! Düzenli pratik seni zirveye taşır.'
  }

  return (
    <SafeAreaView style={rs.root}>
      <ScrollView
        style={rs.scroll}
        contentContainerStyle={rs.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header gradient */}
        <Animated.View style={[rs.headerWrap, headerStyle]}>
          <LinearGradient
            colors={[accentColor + 'CC', accentColor + '44']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={rs.headerGradient}
          >
            <LinearGradient
              colors={[accentColor, accentColor + 'BB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={rs.iconCircle}
            >
              <Text style={rs.iconText}>{moduleIcon}</Text>
            </LinearGradient>
            <Text style={rs.completedTitle}>Tamamlandı! 🎉</Text>
            <Text style={rs.moduleNameLabel}>{moduleLabel}</Text>
            <Text style={rs.motivational}>{motivationalMessage()}</Text>
          </LinearGradient>
        </Animated.View>

        {/* ARP Score Card */}
        <Animated.View style={[rs.arpCardWrap, cardStyle]}>
          <View style={[rs.arpCard, { backgroundColor: accentColor }]}>
            <Text style={rs.arpLabel}>ARP SKORU</Text>
            <Text style={rs.arpNumber}>{displayArp}</Text>
            <Text style={rs.arpSubLabel}>/400</Text>
          </View>
        </Animated.View>

        {/* Stats grid */}
        <View style={rs.statsGrid}>
          {/* Row 1 */}
          <View style={rs.statsRow}>
            <View style={[rs.statCard, { borderColor: accentColor + '30' }]}>
              <Text style={rs.statEmoji}>⚡</Text>
              <Text style={[rs.statValue, { color: accentColor }]}>{Math.round(metrics.avgWPM)}</Text>
              <Text style={rs.statLabel}>WPM</Text>
            </View>
            <View style={[rs.statCard, { borderColor: accentColor + '30' }]}>
              <Text style={rs.statEmoji}>📖</Text>
              <Text style={[rs.statValue, { color: accentColor }]}>{metrics.totalWords}</Text>
              <Text style={rs.statLabel}>Kelimeler</Text>
            </View>
          </View>

          {/* Row 2 */}
          <View style={rs.statsRow}>
            <View style={[rs.statCard, { borderColor: accentColor + '30' }]}>
              <Text style={rs.statEmoji}>⏱</Text>
              <Text style={[rs.statValue, { color: accentColor }]}>{formatDuration(metrics.durationSeconds)}</Text>
              <Text style={rs.statLabel}>Süre</Text>
            </View>
            <View style={[rs.statCard, { borderColor: accentColor + '30' }]}>
              <Text style={rs.statEmoji}>✅</Text>
              <Text style={[rs.statValue, { color: accentColor }]}>%{Math.round(metrics.completionRatio * 100)}</Text>
              <Text style={rs.statLabel}>Tamamlama</Text>
            </View>
          </View>

          {/* Row 3 */}
          <View style={rs.statsRow}>
            {totalQuestions > 0 ? (
              <>
                <View style={[rs.statCard, { borderColor: accentColor + '30' }]}>
                  <Text style={rs.statEmoji}>🧠</Text>
                  <Text style={[rs.statValue, { color: accentColor }]}>{correctAnswers}/{totalQuestions}</Text>
                  <Text style={rs.statLabel}>Soru</Text>
                </View>
                <View style={[rs.statCard, { borderColor: accentColor + '30' }]}>
                  <Text style={rs.statEmoji}>⭐</Text>
                  <Text style={[rs.statValue, { color: accentColor }]}>+{metrics.xpEarned}</Text>
                  <Text style={rs.statLabel}>XP</Text>
                </View>
              </>
            ) : (
              <>
                <View style={[rs.statCard, rs.statCardWide, { borderColor: accentColor + '30' }]}>
                  <Text style={rs.statEmoji}>⭐</Text>
                  <Text style={[rs.statValue, { color: accentColor }]}>+{metrics.xpEarned}</Text>
                  <Text style={rs.statLabel}>XP Kazandın</Text>
                </View>
                <View style={rs.statCardEmpty} />
              </>
            )}
          </View>
        </View>

        {/* Badges */}
        {badges.length > 0 && (
          <View style={rs.badgesSection}>
            <Text style={rs.badgesTitle}>🏆 Bu Seans Kazanılan Rozetler</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={rs.badgesScroll}
            >
              {badges.map((badge) => (
                <View
                  key={badge.id}
                  style={[
                    rs.badgeCard,
                    { borderColor: accentColor, backgroundColor: accentColor + '1A' },
                  ]}
                >
                  <Text style={rs.badgeIcon}>{badge.iconName}</Text>
                  <Text style={[rs.badgeName, { color: accentColor }]}>{badge.name}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Action buttons */}
        <View style={rs.buttonsRow}>
          <TouchableOpacity
            style={[rs.retryBtn, { borderColor: accentColor }]}
            onPress={onRetry}
            activeOpacity={0.8}
          >
            <Text style={[rs.retryBtnText, { color: accentColor }]}>↺ Tekrar Dene</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[rs.homeBtn, { backgroundColor: accentColor }]}
            onPress={onHome}
            activeOpacity={0.8}
          >
            <Text style={rs.homeBtnText}>🏠 Ana Sayfa</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

// ─── Main Component ─────────────────────────────────────────────────

export default function ReadingModuleFlow({ moduleKey, onBack, renderExercise }: Props) {
  const student = useAuthStore((s) => s.student)

  const info   = MODULE_INTRO[moduleKey]
  const accent = info?.accent ?? '#0891B2'

  const [phase,        setPhase]        = useState<Phase>('picking')
  const [content,      setContent]      = useState<ImportedContent | null>(null)
  const [metrics,      setMetrics]      = useState<BaseReadingMetrics | null>(null)
  const [questions,    setQuestions]    = useState<QuestionRow[]>([])
  const [currentQ,     setCurrentQ]     = useState(0)
  const [answers,      setAnswers]      = useState<boolean[]>([])
  const [selectedAns,  setSelectedAns]  = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [savedBadges,  setSavedBadges]  = useState<Badge[]>([])

  // ── Content selected ──────────────────────────────────────────────
  const handleContentSelected = useCallback((c: ImportedContent) => {
    setContent(c)
    setPhase('exercising')
  }, [])

  // ── Exercise complete ─────────────────────────────────────────────
  const handleExerciseComplete = useCallback(async (m: BaseReadingMetrics) => {
    setMetrics(m)
    setLoading(true)

    const textId = m.libraryTextId ?? content?.libraryTextId
    let fetchedQuestions: QuestionRow[] = []

    if (textId) {
      try {
        const { data } = await (supabase as any)
          .from('text_questions')
          .select('id, question_text, options, correct_index, explanation')
          .eq('text_id', textId)
          .limit(5)

        if (data && (data as QuestionRow[]).length > 0) {
          fetchedQuestions = shuffleArray(data as QuestionRow[]).slice(0, Math.min(5, data.length))
        }
      } catch {
        fetchedQuestions = []
      }
    }

    setLoading(false)

    if (fetchedQuestions.length > 0) {
      setQuestions(fetchedQuestions)
      setCurrentQ(0)
      setAnswers([])
      setSelectedAns(null)
      setShowFeedback(false)
      setPhase('questioning')
    } else {
      await finalize(m, [])
      setPhase('results')
    }
  }, [content])

  // ── Handle answer ─────────────────────────────────────────────────
  const handleAnswer = useCallback((idx: number) => {
    if (selectedAns !== null || showFeedback) return

    setSelectedAns(idx)
    setShowFeedback(true)

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    const correct    = idx === questions[currentQ].correct_index
    const newAnswers = [...answers, correct]

    setTimeout(() => {
      setShowFeedback(false)
      setSelectedAns(null)

      if (currentQ >= questions.length - 1) {
        setAnswers(newAnswers)
        finalize(metrics!, newAnswers).then(() => {
          setPhase('results')
        })
      } else {
        setAnswers(newAnswers)
        setCurrentQ((q) => q + 1)
      }
    }, 1300)
  }, [selectedAns, showFeedback, questions, currentQ, answers, metrics])

  // ── Finalize: save session + badges ──────────────────────────────
  const finalize = useCallback(async (m: BaseReadingMetrics, ans: boolean[]) => {
    if (!student) return

    try {
      const correctCount = ans.filter(Boolean).length
      const comprehensionScore = ans.length > 0
        ? Math.round((correctCount / ans.length) * 100)
        : 0

      await (supabase as any).from('reading_mode_sessions').insert({
        student_id:          student.id,
        module_key:          moduleKey,
        avg_wpm:             Math.round(m.avgWPM),
        total_words:         m.totalWords,
        duration_seconds:    Math.round(m.durationSeconds),
        completion_ratio:    m.completionRatio,
        arp_score:           m.arpScore,
        xp_earned:           m.xpEarned,
        comprehension_score: comprehensionScore,
        correct_answers:     correctCount,
        total_questions:     ans.length,
        library_text_id:     m.libraryTextId ?? content?.libraryTextId ?? null,
      })
    } catch {
      // silently fail — session save is best-effort
    }

    try {
      const stats = await badgeSvc.getStudentStats(student.id)
      if (stats) {
        const newBadges = await badgeSvc.checkAndAwardBadges(student.id, stats)
        if (newBadges.length > 0) {
          setSavedBadges(newBadges)
        }
      }
    } catch {
      // silently fail
    }
  }, [student, moduleKey, content])

  // ── Retry ─────────────────────────────────────────────────────────
  const handleRetry = useCallback(() => {
    setPhase('picking')
    setContent(null)
    setMetrics(null)
    setQuestions([])
    setCurrentQ(0)
    setAnswers([])
    setSelectedAns(null)
    setShowFeedback(false)
    setSavedBadges([])
  }, [])

  // ─── Render ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaView style={fl.loadingRoot}>
        <ActivityIndicator size="large" color={accent} />
        <Text style={[fl.loadingText, { color: accent }]}>Sorular yükleniyor…</Text>
      </SafeAreaView>
    )
  }

  if (phase === 'picking') {
    return (
      <SafeAreaView style={fl.pickingRoot}>
        <ContentImportModal
          visible={true}
          onClose={onBack}
          onContentSelected={handleContentSelected}
        />
      </SafeAreaView>
    )
  }

  if (phase === 'exercising') {
    return (
      <>
        {renderExercise(content!, handleExerciseComplete, onBack)}
      </>
    )
  }

  if (phase === 'questioning' && questions.length > 0) {
    return (
      <QuestionPhase
        question={questions[currentQ]}
        index={currentQ}
        total={questions.length}
        accentColor={accent}
        moduleLabel={info?.label ?? moduleKey}
        selectedAnswer={selectedAns}
        showFeedback={showFeedback}
        onAnswer={handleAnswer}
      />
    )
  }

  if (phase === 'results' && metrics) {
    const correctCount = answers.filter(Boolean).length

    return (
      <ResultPhase
        moduleKey={moduleKey}
        metrics={metrics}
        correctAnswers={correctCount}
        totalQuestions={answers.length}
        accentColor={accent}
        moduleLabel={info?.label ?? moduleKey}
        moduleIcon={info?.icon ?? '📖'}
        badges={savedBadges}
        onRetry={handleRetry}
        onHome={onBack}
      />
    )
  }

  // Fallback
  return (
    <SafeAreaView style={fl.loadingRoot}>
      <ActivityIndicator size="large" color={accent} />
    </SafeAreaView>
  )
}

// ─── Flow StyleSheet ─────────────────────────────────────────────────

const fl = StyleSheet.create({
  loadingRoot: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 15,
    fontWeight: '600',
  },
  pickingRoot: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
})

// ─── Question StyleSheet ─────────────────────────────────────────────

const qs = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
    gap: 8,
  },
  moduleLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  topTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  counter: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    minWidth: 36,
    textAlign: 'right',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    marginHorizontal: 20,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 48,
    gap: 16,
  },
  questionBox: {
    paddingVertical: 24,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  questionText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 28,
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 10,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  optionCorrect: {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
  },
  optionWrong: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  optionDimmed: {
    opacity: 0.5,
  },
  letterBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    flexShrink: 0,
  },
  letterText: {
    fontSize: 13,
    fontWeight: '800',
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    lineHeight: 20,
  },
  optionTextCorrect: {
    color: '#065F46',
    fontWeight: '600',
  },
  optionTextWrong: {
    color: '#991B1B',
    fontWeight: '600',
  },
  optionTextDimmed: {
    color: '#9CA3AF',
  },
  explanationCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  explanationTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  explanationText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 20,
    fontWeight: '500',
  },
})

// ─── Result StyleSheet ───────────────────────────────────────────────

const rs = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 48,
  },
  headerWrap: {
    marginBottom: 0,
  },
  headerGradient: {
    paddingTop: 40,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  iconText: {
    fontSize: 38,
  },
  completedTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  moduleNameLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.3,
  },
  motivational: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.90)',
    textAlign: 'center',
    lineHeight: 21,
    fontWeight: '500',
    maxWidth: SW - 64,
  },
  arpCardWrap: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 4,
  },
  arpCard: {
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  arpLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.80)',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  arpNumber: {
    fontSize: 64,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -2,
    lineHeight: 72,
  },
  arpSubLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.70)',
    marginTop: 2,
  },
  statsGrid: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statCardWide: {
    flex: 2,
  },
  statCardEmpty: {
    flex: 1,
  },
  statEmoji: {
    fontSize: 20,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  badgesSection: {
    marginTop: 24,
    paddingHorizontal: 16,
    gap: 12,
  },
  badgesTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  badgesScroll: {
    paddingRight: 16,
    gap: 10,
  },
  badgeCard: {
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 12,
    alignItems: 'center',
    gap: 6,
    minWidth: 80,
  },
  badgeIcon: {
    fontSize: 28,
  },
  badgeName: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 28,
  },
  retryBtn: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  retryBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  homeBtn: {
    flex: 1.5,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  homeBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
})
