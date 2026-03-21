/**
 * ReadingModuleFlow
 * Tüm okuma modülleri için birleşik akış:
 *   1. İçerik Seç (ContentImportModal)
 *   2. Egzersiz (renderExercise prop)
 *   3. Anlama Soruları (3-5 MCQ from text_library)
 *   4. Sonuç Ekranı (rich result)
 */
import { SafeAreaView } from 'react-native-safe-area-context'
import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Animated as RNAnimated,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import { soundService } from '../../services/soundService'
import { type ImportedContent } from '../exercises/shared/ContentImportModal'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { createBadgeService } from '@sprinta/api'
import { MODULE_INTRO } from '../exercise/ReadingModuleIntro'
import ModuleSetupScreen from '../../screens/reading/ModuleSetupScreen'
import ContentLibraryScreen from '../../screens/reading/ContentLibraryScreen'
import type { Badge } from '@sprinta/api'
import type { SpeedTier, ComprehensionTier } from '../../types/reading'

const badgeSvc = createBadgeService(supabase)

// Hızlı Başlat için örnek içerik (egzersizler boş metni kendi varsayılanıyla doldurur)
const QUICK_START_CONTENT: ImportedContent = {
  text:             'Okuma hızı ve anlama kapasitesi, düzenli pratikle geliştirilebilir. Beyin, kelime gruplarını bir bütün olarak algılamayı öğrendiğinde göz hareketleri azalır ve okuma hızı artar. Araştırmalar, günde on beş dakika bilinçli okuma pratiğinin üç ayda WPM değerini yüzde otuz artırdığını göstermektedir. Hızlı okumanın sırrı, gözü daha az hareket ettirirken daha fazla bilgiyi aynı anda işlemektir.',
  title:            'Örnek Metin',
  wordCount:        65,
  source:           'text',
  estimatedMinutes: 1,
}

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

type Phase = 'setup' | 'picking' | 'exercising' | 'questioning' | 'results'

// ─── Props ──────────────────────────────────────────────────────────

interface Props {
  moduleKey:      string
  onBack:         () => void
  initialPhase?:  Phase
  initialContent?: ImportedContent | null
  renderExercise: (
    content:     ImportedContent | null,
    onComplete:  (m: BaseReadingMetrics) => void,
    onExit:      () => void,
    accentColor: string,
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
  const progressAnim = useRef(new RNAnimated.Value(0)).current
  useEffect(() => {
    RNAnimated.timing(progressAnim, { toValue: (index + 1) / Math.max(1, total), duration: 300, useNativeDriver: false }).start()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, total])

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
        <RNAnimated.View
          style={[
            qs.progressFill,
            {
              width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
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

// ─── Tier Helpers ────────────────────────────────────────────────────

function getSpeedTierInfo(wpm: number) {
  if (wpm < 150) return { label: 'Yeni Başlayan' as SpeedTier,  icon: '🌱', color: '#6B7280', desc: '< 150 WPM — Temelleri öğreniyorsun' }
  if (wpm < 200) return { label: 'Geliştiriyor'  as SpeedTier,  icon: '📈', color: '#3B82F6', desc: '150-200 WPM — İyi bir başlangıç' }
  if (wpm < 280) return { label: 'Orta Seviye'   as SpeedTier,  icon: '⚡', color: '#10B981', desc: '200-280 WPM — Ortalamanın üzerinde' }
  if (wpm < 350) return { label: 'Hızlı Okuyucu' as SpeedTier,  icon: '🚀', color: '#F59E0B', desc: '280-350 WPM — İleri seviye' }
  return           { label: 'Uzman'            as SpeedTier,    icon: '🏆', color: '#8B5CF6', desc: '350+ WPM — Elit okuyucu' }
}

function getComprehensionTierInfo(score: number) {
  if (score < 40) return { label: 'Geliştirilmeli' as ComprehensionTier, icon: '📚', color: '#EF4444', desc: 'Anlama odakla çalış' }
  if (score < 60) return { label: 'Orta'           as ComprehensionTier, icon: '📖', color: '#F59E0B', desc: 'Daha fazla pratik yap' }
  if (score < 75) return { label: 'İyi'            as ComprehensionTier, icon: '💡', color: '#10B981', desc: 'Dengeli okuma profili' }
  if (score < 90) return { label: 'Çok İyi'        as ComprehensionTier, icon: '🌟', color: '#3B82F6', desc: 'Yüksek anlama kapasitesi' }
  return           { label: 'Mükemmel'          as ComprehensionTier,    icon: '💎', color: '#8B5CF6', desc: 'Elit kavrama seviyesi' }
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
  onExit:          () => void
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
  onExit,
}: ResultPhaseProps) {
  const comprehensionPct = totalQuestions > 0
    ? Math.round((correctAnswers / totalQuestions) * 100)
    : 0
  const speedTier = getSpeedTierInfo(metrics.avgWPM)
  const compTier  = getComprehensionTierInfo(comprehensionPct)

  const { student } = useAuthStore()
  const [weeklyBest, setWeeklyBest] = useState<number | null>(null)
  const [rank,       setRank]       = useState<number | null>(null)
  const [streak,     setStreak]     = useState<number>(0)
  const isNewRecord = weeklyBest !== null && metrics.arpScore >= weeklyBest

  const [displayArp, setDisplayArp] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    let start = 0
    const target = metrics.arpScore
    const steps = 60
    const increment = target / steps
    const stepTime = 1500 / steps
    intervalRef.current = setInterval(() => {
      start += increment
      if (start >= target) {
        setDisplayArp(target)
        if (intervalRef.current) clearInterval(intervalRef.current)
      } else {
        setDisplayArp(Math.round(start))
      }
    }, stepTime)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [metrics.arpScore])

  useEffect(() => {
    if (!student?.id) return
    const sid = student.id
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    ;(supabase as any)
      .from('reading_mode_sessions').select('arp_score')
      .eq('student_id', sid).gte('created_at', weekAgo)
      .order('arp_score', { ascending: false }).limit(1).single()
      .then(({ data }: any) => { if (data?.arp_score) setWeeklyBest(data.arp_score as number) })
    ;(supabase as any)
      .from('daily_stats').select('streak_days')
      .eq('student_id', sid).order('date', { ascending: false }).limit(1).single()
      .then(({ data }: any) => { if (data?.streak_days) setStreak(data.streak_days as number) })
    ;(supabase as any)
      .rpc('get_reading_rank', { p_arp: metrics.arpScore })
      .then(({ data }: any) => { if (typeof data === 'number') setRank(data) })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <SafeAreaView style={rs.root}>
      {/* X Kapat */}
      <View style={{ paddingHorizontal: 16, paddingTop: 8, alignItems: 'flex-end' }}>
        <TouchableOpacity
          onPress={onExit}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={rs.closeBtn}
        >
          <Text style={rs.closeBtnTxt}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={rs.scroll} contentContainerStyle={rs.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={rs.resultEmoji}>{moduleIcon}</Text>
        <Text style={rs.resultTitle}>Seans Tamamlandı!</Text>
        <Text style={rs.resultSub}>{moduleLabel}</Text>

        {/* ARP Kartı — speedTier inline */}
        <View style={[rs.arpCard, { backgroundColor: accentColor }]}>
          <View style={rs.arpHeaderRow}>
            <Text style={rs.arpLabel}>ARP Skoru</Text>
            <View style={rs.arpTierBadge}>
              <Text style={rs.arpTierTxt}>{speedTier.icon} {speedTier.label}</Text>
            </View>
          </View>
          <Text style={rs.arpNumber}>{displayArp}</Text>
          {isNewRecord && (
            <View style={rs.newRecordBadge}>
              <Text style={rs.newRecordTxt}>🆕 Haftalık Rekor!</Text>
            </View>
          )}
        </View>

        {/* 4 Metrik */}
        <View style={rs.metricsGrid}>
          {[
            { label: 'Ort. WPM',  value: String(Math.round(metrics.avgWPM)) },
            { label: 'Kelimeler', value: metrics.totalWords.toLocaleString('tr') },
            { label: 'Süre',      value: formatDuration(metrics.durationSeconds) },
            { label: 'Tamamlama', value: `%${Math.round(metrics.completionRatio * 100)}` },
          ].map((m) => (
            <View key={m.label} style={rs.metricCard}>
              <Text style={rs.metricValue}>{m.value}</Text>
              <Text style={rs.metricLabel}>{m.label}</Text>
            </View>
          ))}
        </View>

        {/* Kazanılan Rozetler */}
        {badges.length > 0 && (
          <View style={rs.badgesSection}>
            <Text style={rs.badgesTitle}>🏆 Bu Seans Kazanılan Rozetler</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={rs.badgesScroll}>
              {badges.map((badge) => (
                <View key={badge.id} style={[rs.badgeCard, { borderColor: accentColor, backgroundColor: accentColor + '1A' }]}>
                  <Text style={rs.badgeIcon}>{badge.iconName}</Text>
                  <Text style={[rs.badgeName, { color: accentColor }]}>{badge.name}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* BAŞARILAR */}
        <View style={rs.achieveSection}>
          <Text style={rs.achieveTitle}>BAŞARILAR</Text>

          {/* SpeedTier */}
          <View style={[rs.achieveRow, { borderLeftColor: speedTier.color }]}>
            <View style={[rs.achieveIconWrap, { backgroundColor: speedTier.color + '18' }]}>
              <Text style={rs.achieveIcon}>{speedTier.icon}</Text>
            </View>
            <View style={rs.achieveInfo}>
              <Text style={[rs.achieveLabel, { color: speedTier.color }]}>{speedTier.label}</Text>
              <Text style={rs.achieveDesc}>{speedTier.desc}</Text>
            </View>
            <View style={[rs.achievePill, { backgroundColor: speedTier.color }]}>
              <Text style={rs.achievePillTxt}>{Math.round(metrics.avgWPM)} WPM</Text>
            </View>
          </View>

          {/* ComprehensionTier (sadece sorular varsa) */}
          {totalQuestions > 0 && (
            <View style={[rs.achieveRow, { borderLeftColor: compTier.color }]}>
              <View style={[rs.achieveIconWrap, { backgroundColor: compTier.color + '18' }]}>
                <Text style={rs.achieveIcon}>{compTier.icon}</Text>
              </View>
              <View style={rs.achieveInfo}>
                <Text style={[rs.achieveLabel, { color: compTier.color }]}>{compTier.label}</Text>
                <Text style={rs.achieveDesc}>{compTier.desc}</Text>
              </View>
              <View style={[rs.achievePill, { backgroundColor: compTier.color }]}>
                <Text style={rs.achievePillTxt}>%{comprehensionPct}</Text>
              </View>
            </View>
          )}

          {/* Streak */}
          {streak > 0 && (
            <View style={[rs.achieveRow, { borderLeftColor: '#F59E0B' }]}>
              <View style={[rs.achieveIconWrap, { backgroundColor: '#FEF3C7' }]}>
                <Text style={rs.achieveIcon}>🔥</Text>
              </View>
              <View style={rs.achieveInfo}>
                <Text style={[rs.achieveLabel, { color: '#D97706' }]}>{streak} Günlük Seri</Text>
                <Text style={rs.achieveDesc}>Her gün çalışmaya devam et!</Text>
              </View>
              <View style={[rs.achievePill, { backgroundColor: '#F59E0B' }]}>
                <Text style={rs.achievePillTxt}>{streak} gün</Text>
              </View>
            </View>
          )}
        </View>

        {/* Kişisel Kıyaslama */}
        <View style={rs.socialRow}>
          <View style={rs.socialBox}>
            <Text style={rs.socialIcon}>📊</Text>
            <Text style={rs.socialValue}>{weeklyBest ? (isNewRecord ? 'Rekor!' : String(weeklyBest)) : '—'}</Text>
            <Text style={rs.socialLabel}>Haftalık en iyi</Text>
          </View>
          <View style={[rs.socialBox, rs.socialBoxBorder]}>
            <Text style={rs.socialIcon}>🏅</Text>
            <Text style={rs.socialValue}>{rank ? `#${rank}` : '—'}</Text>
            <Text style={rs.socialLabel}>Genel sıralama</Text>
          </View>
          <View style={[rs.socialBox, rs.socialBoxBorder]}>
            <Text style={rs.socialIcon}>⭐</Text>
            <Text style={rs.socialValue}>+{metrics.xpEarned}</Text>
            <Text style={rs.socialLabel}>XP kazanıldı</Text>
          </View>
        </View>

        {/* Butonlar */}
        <View style={rs.buttonsRow}>
          <TouchableOpacity style={[rs.retryBtn, { borderColor: accentColor }]} onPress={onRetry} activeOpacity={0.8}>
            <Text style={[rs.retryBtnText, { color: accentColor }]}>Tekrar Yap</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[rs.homeBtn, { backgroundColor: accentColor }]} onPress={onHome} activeOpacity={0.8}>
            <Text style={rs.homeBtnText}>Ana Sayfa</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

// ─── Main Component ─────────────────────────────────────────────────

export default function ReadingModuleFlow({ moduleKey, onBack, initialPhase, initialContent, renderExercise }: Props) {
  const student = useAuthStore((s) => s.student)

  const info   = MODULE_INTRO[moduleKey]
  const accent = info?.accent ?? '#0891B2'

  const [phase,        setPhase]        = useState<Phase>(initialPhase ?? 'setup')
  const [content,      setContent]      = useState<ImportedContent | null>(initialContent ?? null)
  const [metrics,      setMetrics]      = useState<BaseReadingMetrics | null>(null)
  const [questions,    setQuestions]    = useState<QuestionRow[]>([])
  const [currentQ,     setCurrentQ]     = useState(0)
  const [answers,      setAnswers]      = useState<boolean[]>([])
  const [selectedAns,  setSelectedAns]  = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [savedBadges,  setSavedBadges]  = useState<Badge[]>([])

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

    // Ses geri bildirimi
    soundService.play(correct ? 'correct' : 'wrong')
    const newAnswers = [...answers, correct]

    // SM-2 SRS güncelle (best-effort, non-blocking)
    if (student?.id && questions[currentQ].id) {
      ;(supabase as any).rpc('update_sm2', {
        p_student_id:  student.id,
        p_question_id: questions[currentQ].id,
        p_quality:     correct ? 4 : 1,
      }).catch(() => { /* silent */ })
    }

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
    setPhase('setup')
    setContent(null)
    setMetrics(null)
    setQuestions([])
    setCurrentQ(0)
    setAnswers([])
    setSelectedAns(null)
    setShowFeedback(false)
    setSavedBadges([])
  }, [])

  // ── Setup / Picking handlers ───────────────────────────────────────
  const handleSelectText  = useCallback(() => setPhase('picking'),     [])
  const handleQuickStart  = useCallback(() => setPhase('exercising'),  [])

  // ─── Render ────────────────────────────────────────────────────────

  if (phase === 'setup') {
    return (
      <ModuleSetupScreen
        moduleKey={moduleKey}
        onSelectText={handleSelectText}
        onQuickStart={handleQuickStart}
        onBack={onBack}
      />
    )
  }

  if (phase === 'picking') {
    return (
      <ContentLibraryScreen
        accentColor={accent}
        moduleKey={moduleKey}
        onContentSelected={(c) => { setContent(c); setPhase('exercising') }}
        onBack={() => setPhase('setup')}
      />
    )
  }

  if (loading) {
    return (
      <SafeAreaView style={fl.loadingRoot}>
        <ActivityIndicator size="large" color={accent} />
        <Text style={[fl.loadingText, { color: accent }]}>Sorular yükleniyor…</Text>
      </SafeAreaView>
    )
  }

  if (phase === 'exercising') {
    return (
      <>
        {renderExercise(content ?? QUICK_START_CONTENT, handleExerciseComplete, onBack, accent)}
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
        onExit={onBack}
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
  root:        { flex: 1, backgroundColor: '#FFFFFF' },
  scroll:      { flex: 1 },
  scrollContent: { paddingBottom: 48 },

  closeBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB',
    alignItems: 'center', justifyContent: 'center',
  },
  closeBtnTxt: { fontSize: 18, color: '#6B7280', fontWeight: '700' },

  resultEmoji: { fontSize: 40, textAlign: 'center', marginTop: 12 },
  resultTitle: { fontSize: 22, fontWeight: '900', color: '#111827', textAlign: 'center', marginTop: 6, letterSpacing: -0.4 },
  resultSub:   { fontSize: 13, color: '#6B7280', textAlign: 'center', marginTop: 2, fontWeight: '500' },

  arpCard: {
    borderRadius: 20, paddingVertical: 20, paddingHorizontal: 20,
    alignItems: 'center', marginHorizontal: 16, marginTop: 16,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 6, gap: 6,
  },
  arpHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  arpLabel:     { fontSize: 11, fontWeight: '900', color: 'rgba(255,255,255,0.80)', letterSpacing: 1.5, textTransform: 'uppercase' },
  arpTierBadge: { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 2 },
  arpTierTxt:   { fontSize: 11, color: '#fff', fontWeight: '800' },
  arpNumber:    { fontSize: 64, fontWeight: '900', color: '#FFFFFF', letterSpacing: -2, lineHeight: 72 },
  newRecordBadge: { backgroundColor: '#F59E0B', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 3 },
  newRecordTxt:   { fontSize: 11, color: '#fff', fontWeight: '900' },

  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, marginTop: 12 },
  metricCard:  { width: '47%', backgroundColor: '#F9FAFB', borderRadius: 14, padding: 14, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: '#E5E7EB' },
  metricValue: { fontSize: 20, fontWeight: '900', color: '#111827', letterSpacing: -0.4 },
  metricLabel: { fontSize: 11, fontWeight: '600', color: '#6B7280', textAlign: 'center' },

  badgesSection: { marginTop: 20, paddingHorizontal: 16, gap: 10 },
  badgesTitle:   { fontSize: 14, fontWeight: '800', color: '#111827' },
  badgesScroll:  { paddingRight: 16, gap: 10 },
  badgeCard:     { borderRadius: 12, borderWidth: 1.5, padding: 12, alignItems: 'center', gap: 6, minWidth: 80 },
  badgeIcon:     { fontSize: 28 },
  badgeName:     { fontSize: 11, fontWeight: '700', textAlign: 'center' },

  achieveSection: { paddingHorizontal: 16, marginTop: 20, gap: 8 },
  achieveTitle:   { fontSize: 11, fontWeight: '800', color: '#9CA3AF', letterSpacing: 1.5 },
  achieveRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#FAFAFA', borderRadius: 14, padding: 12,
    borderLeftWidth: 4, borderWidth: 1, borderColor: '#F3F4F6',
  },
  achieveIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  achieveIcon:     { fontSize: 18 },
  achieveInfo:     { flex: 1, gap: 2 },
  achieveLabel:    { fontSize: 14, fontWeight: '800' },
  achieveDesc:     { fontSize: 11, color: '#6B7280', fontWeight: '500' },
  achievePill:     { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  achievePillTxt:  { fontSize: 11, color: '#fff', fontWeight: '800' },

  socialRow: {
    flexDirection: 'row', backgroundColor: '#FAFAFA',
    marginHorizontal: 16, marginTop: 16,
    borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', overflow: 'hidden',
  },
  socialBox:       { flex: 1, alignItems: 'center', paddingVertical: 14, gap: 4 },
  socialBoxBorder: { borderLeftWidth: 1, borderLeftColor: '#E5E7EB' },
  socialIcon:      { fontSize: 18 },
  socialValue:     { fontSize: 15, fontWeight: '900', color: '#111827' },
  socialLabel:     { fontSize: 10, color: '#6B7280', fontWeight: '600', textAlign: 'center' },

  buttonsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginTop: 20, marginBottom: 8 },
  retryBtn: {
    flex: 1, borderWidth: 2, borderRadius: 16, paddingVertical: 16,
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF',
  },
  retryBtnText: { fontSize: 15, fontWeight: '700' },
  homeBtn: {
    flex: 1.5, borderRadius: 16, paddingVertical: 16,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 }, elevation: 4,
  },
  homeBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
})
