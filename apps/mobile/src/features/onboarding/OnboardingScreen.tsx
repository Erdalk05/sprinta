import React, { useEffect, useRef, useState, useCallback } from 'react'
import {
  View, Text, TouchableOpacity, ScrollView,
  SafeAreaView, Animated, ActivityIndicator,
  StyleSheet, Dimensions,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'
import { colors } from '../../theme/colors'
import { typography } from '../../theme/typography'
import { spacing } from '../../theme/spacing'
import { generateQuiz, type Question } from './QuizEngine'
import { calculateResult, type QuizAnswer } from './ResultEngine'
import { useOnboardingStore } from './onboardingStore'
import { getLevelInfo } from '../rewards/LevelEngine'
import { EventBus } from '../rewards/EventBus'

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window')

const CONFETTI_COLORS = ['#1877F2', '#2B3FD4', '#1A2B6B', '#40C8F0', '#FFD700', '#FF6B6B']
const TOPIC_LABELS: Record<string, string> = {
  reading_speed:   'Okuma Hızı',
  comprehension:   'Anlama',
  attention:       'Dikkat',
  visual_tracking: 'Görsel Takip',
  focus_duration:  'Odak Süresi',
}

// ─── Confetti (saf Animated, dış paket yok) ──────────────────
interface Particle {
  x: Animated.Value
  y: Animated.Value
  rot: Animated.Value
  scale: Animated.Value
  color: string
  size: number
}

function useConfetti(): { particles: Particle[]; fire: () => void } {
  const [particles, setParticles] = useState<Particle[]>([])

  const fire = useCallback(() => {
    const count = 60
    const newParticles: Particle[] = Array.from({ length: count }, (_, i) => {
      const startX = SCREEN_W * 0.3 + Math.random() * SCREEN_W * 0.4
      return {
        x:     new Animated.Value(startX),
        y:     new Animated.Value(-10),
        rot:   new Animated.Value(0),
        scale: new Animated.Value(1),
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size:  6 + Math.random() * 8,
      }
    })

    setParticles(newParticles)

    newParticles.forEach((p, i) => {
      const duration = 1200 + Math.random() * 800
      const delay    = Math.random() * 300
      const targetX  = (parseFloat(String(p.x)) || 0) + (Math.random() - 0.5) * 220

      Animated.parallel([
        Animated.timing(p.y, {
          toValue: SCREEN_H * 0.55,
          duration,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(p.x, {
          toValue: targetX,
          duration,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(p.rot, {
          toValue: (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 4),
          duration,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(p.scale, {
          toValue: 0,
          duration: duration * 0.4,
          delay: delay + duration * 0.6,
          useNativeDriver: true,
        }),
      ]).start()
    })

    // Temizle
    setTimeout(() => setParticles([]), 2500)
  }, [])

  return { particles, fire }
}

function ConfettiLayer({ particles }: { particles: Particle[] }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size * 0.5,
            backgroundColor: p.color,
            borderRadius: 2,
            transform: [
              { translateX: p.x },
              { translateY: p.y },
              { rotate: p.rot.interpolate({ inputRange: [-10, 10], outputRange: ['-360deg', '360deg'] }) },
              { scale: p.scale },
            ],
          }}
        />
      ))}
    </View>
  )
}

// ─── ProgressBar ───────────────────────────────────────────────
function StepBar({ step, total }: { step: number; total: number }) {
  return (
    <View style={pb.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[pb.seg, { backgroundColor: i < step ? colors.primary : colors.border }]}
        />
      ))}
    </View>
  )
}
const pb = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6, paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  seg: { flex: 1, height: 4, borderRadius: 2 },
})

// ─── CountUp ───────────────────────────────────────────────────
function CountUp({ target, duration = 800 }: { target: number; duration?: number }) {
  const anim = useRef(new Animated.Value(0)).current
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const listener = anim.addListener(({ value }) => setDisplay(Math.round(value)))
    Animated.timing(anim, { toValue: target, duration, useNativeDriver: false }).start()
    return () => anim.removeListener(listener)
  }, [target])

  return <Text style={cu.num}>{display}</Text>
}
const cu = StyleSheet.create({
  num: {
    fontSize: 72, fontWeight: '900',
    color: colors.primary, textAlign: 'center', letterSpacing: -2,
  },
})

// ─── QuizStep ──────────────────────────────────────────────────
function QuizStep({ questions, onComplete }: { questions: Question[]; onComplete: (a: QuizAnswer[]) => void }) {
  const [qIndex, setQIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [answered, setAnswered] = useState(false)
  const [startTime, setStartTime] = useState(Date.now())
  const [answers, setAnswers] = useState<QuizAnswer[]>([])
  const scale = useRef(new Animated.Value(1)).current

  const question = questions[qIndex]
  const isLast = qIndex === questions.length - 1

  useEffect(() => { setStartTime(Date.now()) }, [qIndex])

  function handleSelect(id: string) {
    if (answered) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setSelected(id)
  }

  function handleNext() {
    if (!selected || answered) return
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50, bounciness: 4 }),
      Animated.spring(scale, { toValue: 1,    useNativeDriver: true, speed: 50, bounciness: 4 }),
    ]).start()

    const newAnswer: QuizAnswer = { questionId: question.id, selectedOptionId: selected, responseTimeMs: Date.now() - startTime }
    const allAnswers = [...answers, newAnswer]
    setAnswers(allAnswers)
    setAnswered(true)
    setTimeout(() => {
      if (isLast) { onComplete(allAnswers) }
      else { setQIndex(i => i + 1); setSelected(null); setAnswered(false) }
    }, 400)
  }

  return (
    <View style={qs.root}>
      <Text style={qs.counter}>Soru {qIndex + 1} / {questions.length}</Text>
      <Text style={qs.questionText}>{question.text}</Text>
      <View style={qs.options}>
        {question.options.map((opt) => {
          const sel = selected === opt.id
          return (
            <TouchableOpacity key={opt.id} style={[qs.option, sel && qs.optionSel]} onPress={() => handleSelect(opt.id)} activeOpacity={0.7}>
              <View style={[qs.dot, sel && qs.dotSel]} />
              <Text style={[qs.optTxt, sel && qs.optTxtSel]}>{opt.text}</Text>
            </TouchableOpacity>
          )
        })}
      </View>
      <Animated.View style={{ transform: [{ scale }] }}>
        <TouchableOpacity style={[qs.btn, !selected && qs.btnOff]} onPress={handleNext} disabled={!selected} activeOpacity={0.8}>
          <Text style={qs.btnTxt}>{isLast ? 'Sonucu Gör →' : 'İleri →'}</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  )
}
const qs = StyleSheet.create({
  root:       { flex: 1, paddingHorizontal: spacing.md, paddingTop: spacing.lg },
  counter:    { ...(typography.caption as object), color: colors.textSecondary, marginBottom: spacing.sm },
  questionText:{ ...(typography.h3 as object), color: colors.textPrimary, marginBottom: spacing.lg, lineHeight: 28 },
  options:    { gap: 12, marginBottom: spacing.xl },
  option:     { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 2, borderColor: colors.border },
  optionSel:  { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  dot:        { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.border },
  dotSel:     { backgroundColor: colors.primary, borderColor: colors.primary },
  optTxt:     { ...(typography.body as object), color: colors.textPrimary, flex: 1 },
  optTxtSel:  { color: colors.primaryDarker, fontWeight: '600' },
  btn:        { backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  btnOff:     { backgroundColor: colors.border },
  btnTxt:     { fontSize: 16, fontWeight: '700', color: '#fff' },
})

// ─── LoadingStep ───────────────────────────────────────────────
function LoadingStep() {
  return (
    <View style={ls.root}>
      <ActivityIndicator size="large" color="#fff" />
      <Text style={ls.text}>Performansın analiz ediliyor...</Text>
    </View>
  )
}
const ls = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primaryDarker, gap: 20 },
  text: { ...(typography.h2 as object), color: '#fff', textAlign: 'center' },
})

// ─── ResultStep ────────────────────────────────────────────────
function ResultStep({
  arp, level, levelTitle, levelEmoji, levelColor, strongTopic, weakTopic, onRegister, onLogin,
}: {
  arp: number; level: number; levelTitle: string; levelEmoji: string; levelColor: string
  strongTopic: string; weakTopic: string; onRegister: () => void; onLogin: () => void
}) {
  const { particles, fire } = useConfetti()

  useEffect(() => {
    setTimeout(() => fire(), 200)
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    EventBus.emit('QUIZ_COMPLETED', { arp, level })
  }, [])

  const glow = useRef(new Animated.Value(1)).current
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 0.5, duration: 1000, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 1,   duration: 1000, useNativeDriver: true }),
      ])
    ).start()
  }, [])

  return (
    <View style={{ flex: 1 }}>
      <ConfettiLayer particles={particles} />
      <ScrollView contentContainerStyle={rs.scroll} showsVerticalScrollIndicator={false}>
        <Text style={rs.headline}>🎉 Harika Başlangıç!</Text>
        <Text style={rs.arpLabel}>Başlangıç ARP Puanın</Text>
        <CountUp target={arp} />

        <Animated.View style={[rs.levelBadge, { borderColor: levelColor, opacity: glow }]}>
          <Text style={rs.levelEmoji}>{levelEmoji}</Text>
          <Text style={[rs.levelText, { color: levelColor }]}>Seviye {level}: {levelTitle}</Text>
        </Animated.View>

        <View style={rs.topicRow}>
          <View style={rs.topicCard}>
            <Text style={rs.topicIcon}>✅</Text>
            <Text style={rs.topicLbl}>Güçlü Alan</Text>
            <Text style={rs.topicVal}>{TOPIC_LABELS[strongTopic] ?? strongTopic}</Text>
          </View>
          <View style={rs.topicCard}>
            <Text style={rs.topicIcon}>📈</Text>
            <Text style={rs.topicLbl}>Gelişim Alanı</Text>
            <Text style={rs.topicVal}>{TOPIC_LABELS[weakTopic] ?? weakTopic}</Text>
          </View>
        </View>

        <View style={rs.divider} />
        <Text style={rs.cta}>Sonucunu kaydetmek için{'\n'}ücretsiz hesabını oluştur</Text>

        <TouchableOpacity style={rs.btnPrimary} onPress={onRegister} activeOpacity={0.85}>
          <Text style={rs.btnPrimaryTxt}>Hesap Oluştur →</Text>
        </TouchableOpacity>
        <TouchableOpacity style={rs.btnGhost} onPress={onLogin} activeOpacity={0.85}>
          <Text style={rs.btnGhostTxt}>Zaten hesabım var</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}
const rs = StyleSheet.create({
  scroll:      { paddingHorizontal: spacing.md, paddingTop: spacing.xl, paddingBottom: 48, alignItems: 'center' },
  headline:    { ...(typography.h1 as object), color: colors.textPrimary, textAlign: 'center', marginBottom: 8 },
  arpLabel:    { ...(typography.label as object), color: colors.textSecondary, marginBottom: 4 },
  levelBadge:  { marginTop: 16, borderWidth: 2, borderRadius: 20, paddingHorizontal: 20, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 8 },
  levelEmoji:  { fontSize: 24 },
  levelText:   { ...(typography.h3 as object) },
  topicRow:    { flexDirection: 'row', gap: 12, marginTop: spacing.lg, width: '100%' },
  topicCard:   { flex: 1, backgroundColor: colors.surface, borderRadius: 14, padding: 14, alignItems: 'center', gap: 4 },
  topicIcon:   { fontSize: 22 },
  topicLbl:    { ...(typography.caption as object), color: colors.textSecondary },
  topicVal:    { ...(typography.label as object), color: colors.textPrimary, fontWeight: '700', textAlign: 'center' },
  divider:     { width: '80%', height: 1, backgroundColor: colors.border, marginVertical: spacing.lg },
  cta:         { ...(typography.body as object), color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.md },
  btnPrimary:  { width: '100%', backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 12 },
  btnPrimaryTxt:{ fontSize: 16, fontWeight: '700', color: '#fff' },
  btnGhost:    { width: '100%', borderWidth: 2, borderColor: colors.border, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  btnGhostTxt: { ...(typography.label as object), color: colors.textSecondary },
})

// ─── OnboardingScreen ─────────────────────────────────────────
export default function OnboardingScreen() {
  const router  = useRouter()
  const store   = useOnboardingStore()
  const fadeAnim = useRef(new Animated.Value(0)).current

  const [questions, setQuestions] = useState<Question[]>([])
  const [result, setResult] = useState<ReturnType<typeof calculateResult> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start()
    store.setStep(0)
    generateQuiz().then(q => { setQuestions(q); setLoading(false) })
  }, [])

  const handleQuizComplete = useCallback(async (answers: QuizAnswer[]) => {
    store.setStep(1)
    const r = calculateResult(answers, questions)
    store.setQuizResult(r)
    setResult(r)
    setTimeout(() => store.setStep(2), 1500)
  }, [questions, store])

  const goTo = useCallback(async (path: string) => {
    await store.saveToStorage()
    router.replace(path as any)
  }, [store, router])

  if (loading) {
    return (
      <SafeAreaView style={s.root}>
        <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1 }} />
      </SafeAreaView>
    )
  }

  const step = store.currentStep
  const levelInfo = result ? getLevelInfo(result.baseARP) : null

  return (
    <SafeAreaView style={s.root}>
      <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>
        {step !== 1 && <StepBar step={step + 1} total={3} />}

        {step === 0 && questions.length > 0 && (
          <QuizStep questions={questions} onComplete={handleQuizComplete} />
        )}

        {step === 1 && <LoadingStep />}

        {step === 2 && result && levelInfo && (
          <ResultStep
            arp={result.baseARP}
            level={result.level}
            levelTitle={levelInfo.title}
            levelEmoji={levelInfo.emoji}
            levelColor={levelInfo.color}
            strongTopic={result.strongTopic}
            weakTopic={result.weakTopic}
            onRegister={() => goTo('/(auth)/register')}
            onLogin={() => goTo('/(auth)/login')}
          />
        )}
      </Animated.View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
})
