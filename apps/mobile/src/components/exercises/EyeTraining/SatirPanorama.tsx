/**
 * SatirPanorama — Çevresel Görüş (Periferik) Egzersizi
 *
 * Geniş alan tarama: Cümle göster (dikey çizgi bölümlenmiş)
 * Kullanıcı tek bakışta okumaya çalışır.
 * Anlama sorusu → doğru/yanlış seçim.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions, SafeAreaView,
} from 'react-native'
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { useEyeSoundFeedback } from './useEyeSoundFeedback'
import type { EyeExerciseProps, EyeMetrics } from '@sprinta/shared'

const { width: SW } = Dimensions.get('window')
const BG = '#0A0F1F'
const ACCENT = '#00B890'

interface Sentence {
  text: string
  question: string
  answer: boolean   // true = Doğru seçenek cevap
}

const SENTENCES: Sentence[] = [
  { text: 'Güneş sabah doğudan doğar ve akşam batıya gider', question: 'Güneş batıdan doğar mı?', answer: false },
  { text: 'Türkiye nüfusu yaklaşık seksen beş milyon kişidir', question: 'Türkiye nüfusu 85 milyon civarında mıdır?', answer: true },
  { text: 'Su yüz derecede kaynar ve sıfır derecede donar', question: 'Su sıfır derecede kaynar mı?', answer: false },
  { text: 'Ankara Türkiye cumhuriyetinin başkentidir', question: 'İstanbul başkent midir?', answer: false },
  { text: 'Atatürk on dört kasım bin dokuz yüz otuz sekizde vefat etti', question: 'Atatürk 1938 yılında mı vefat etti?', answer: true },
  { text: 'Dünya güneş etrafında bir yılda tam bir tur atar', question: 'Dünya güneş etrafında bir yılda mı döner?', answer: true },
  { text: 'İnsan vücudu yüzde atmış su içermektedir', question: 'İnsan vücudu çoğunlukla sudan mı oluşur?', answer: true },
  { text: 'Elma meyvesi vitaminler ve lif açısından zengindir', question: 'Elma sadece vitamin kaynağı mıdır?', answer: false },
]

type Phase = 'reading' | 'question' | 'feedback'

export default function SatirPanorama({
  durationSeconds,
  onComplete,
  onExit,
}: EyeExerciseProps) {
  const { playHit, playMiss, playAppear } = useEyeSoundFeedback()
  const startTime = useRef(performance.now())
  const [elapsed, setElapsed] = useState(0)
  const [round, setRound] = useState(0)
  const [phase, setPhase] = useState<Phase>('reading')
  const [sentenceIdx, setSentenceIdx] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [wrong, setWrong] = useState(0)
  const reactionTimes = useRef<number[]>([])
  const questionAt = useRef(0)
  const finished = useRef(false)

  const textOpacity = useSharedValue(1)
  const textStyle = useAnimatedStyle(() => ({ opacity: textOpacity.value }))

  const sentence = SENTENCES[sentenceIdx % SENTENCES.length]

  // ── Timer ──────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      const e = (performance.now() - startTime.current) / 1000
      setElapsed(e)
      if (e >= durationSeconds && !finished.current) {
        finished.current = true
        clearInterval(interval)
        finishExercise()
      }
    }, 500)
    return () => clearInterval(interval)
  }, [durationSeconds])

  // ── Tur başlatıcı ──────────────────────────────────────────────
  useEffect(() => {
    if (finished.current) return
    setPhase('reading')
    playAppear()
    textOpacity.value = withTiming(1, { duration: 150 })

    // Okuma süresi: 2sn
    const t = setTimeout(() => {
      textOpacity.value = withTiming(0, { duration: 200 })
      setTimeout(() => {
        questionAt.current = performance.now()
        setPhase('question')
      }, 250)
    }, 2000)
    return () => clearTimeout(t)
  }, [round, sentenceIdx])

  function handleAnswer(userAnswer: boolean) {
    if (phase !== 'question' || finished.current) return
    const rt = performance.now() - questionAt.current
    reactionTimes.current.push(rt)

    if (userAnswer === sentence.answer) {
      setCorrect(c => c + 1)
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      playHit()
    } else {
      setWrong(w => w + 1)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      playMiss()
    }
    setPhase('feedback')

    setTimeout(() => {
      if (!finished.current) {
        setSentenceIdx(prev => prev + 1)
        setRound(r => r + 1)
      }
    }, 600)
  }

  const finishExercise = useCallback(() => {
    const rts = reactionTimes.current
    const total = correct + wrong
    const avgRt = rts.length ? rts.reduce((a, b) => a + b, 0) / rts.length : 999
    const accuracy = total > 0 ? (correct / total) * 100 : 0
    const speed = Math.max(0, Math.min(100, (1 - avgRt / 3000) * 100))

    const metrics: EyeMetrics = {
      reactionTimeMs:        avgRt,
      accuracyPercent:       accuracy,
      trackingErrorPx:       0,
      visualAttentionScore:  accuracy * 0.6 + speed * 0.4,
      saccadicSpeedEstimate: 0,
      taskCompletionMs:      performance.now() - startTime.current,
      arpContribution:       6,
    }
    onComplete(metrics)
  }, [correct, wrong, onComplete])

  const timeLeft = Math.max(0, durationSeconds - Math.floor(elapsed))

  // Cümleyi bölümlere ayır (dikey çizgi için)
  const words = sentence.text.split(' ')
  const mid = Math.ceil(words.length / 2)
  const leftPart  = words.slice(0, mid).join(' ')
  const rightPart = words.slice(mid).join(' ')

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onExit} style={styles.exitBtn}>
          <Text style={styles.exitText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.timerText}>{timeLeft}sn</Text>
        <Text style={styles.scoreText}>✓ {correct}</Text>
      </View>

      <View style={styles.titleRow}>
        <Text style={styles.title}>Satır Panorama</Text>
        <Text style={styles.subtitle}>Çevresel Görüş (Periferik) · Tek bakışta oku</Text>
      </View>

      {/* Okuma alanı */}
      <View style={styles.readingArea}>
        {(phase === 'reading') && (
          <Animated.View style={[styles.sentenceBox, textStyle]}>
            <Text style={styles.leftText}>{leftPart}</Text>
            <View style={styles.divider} />
            <Text style={styles.rightText}>{rightPart}</Text>
          </Animated.View>
        )}

        {(phase === 'question' || phase === 'feedback') && (
          <View style={styles.questionBox}>
            <Text style={styles.questionText}>{sentence.question}</Text>
            <View style={styles.answerRow}>
              <TouchableOpacity
                style={[
                  styles.answerBtn,
                  styles.trueBtn,
                  phase === 'feedback' && sentence.answer === true && styles.answerBtnCorrect,
                  phase === 'feedback' && sentence.answer === false && styles.answerBtnWrong,
                ]}
                onPress={() => handleAnswer(true)}
                activeOpacity={0.75}
              >
                <Text style={styles.answerText}>✓ Doğru</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.answerBtn,
                  styles.falseBtn,
                  phase === 'feedback' && sentence.answer === false && styles.answerBtnCorrect,
                  phase === 'feedback' && sentence.answer === true && styles.answerBtnWrong,
                ]}
                onPress={() => handleAnswer(false)}
                activeOpacity={0.75}
              >
                <Text style={styles.answerText}>✗ Yanlış</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <View style={styles.bottomInfo}>
        <Text style={styles.infoText}>Cümleyi tek bakışla oku, sonra soruyu yanıtla</Text>
        {wrong > 0 && <Text style={styles.wrongText}>Hatalı: {wrong}</Text>}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8,
  },
  exitBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  exitText:  { color: '#fff', fontSize: 16 },
  timerText: { color: '#fff', fontSize: 24, fontWeight: '800' },
  scoreText: { color: ACCENT, fontSize: 18, fontWeight: '700' },

  titleRow: { alignItems: 'center', marginBottom: 12 },
  title:    { color: '#fff', fontSize: 20, fontWeight: '800' },
  subtitle: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 4 },

  readingArea: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },

  sentenceBox: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius:    14,
    padding:         20,
    gap:             0,
  },
  leftText: {
    flex:       1,
    color:      '#FFFFFF',
    fontSize:   18,
    fontWeight: '600',
    textAlign:  'right',
    lineHeight: 26,
    paddingRight: 10,
  },
  divider: {
    width:           2,
    height:          60,
    backgroundColor: ACCENT,
    borderRadius:    1,
    opacity:         0.6,
  },
  rightText: {
    flex:       1,
    color:      '#FFFFFF',
    fontSize:   18,
    fontWeight: '600',
    textAlign:  'left',
    lineHeight: 26,
    paddingLeft: 10,
  },

  questionBox: {
    alignItems: 'center',
    gap:        20,
    width:      '100%',
  },
  questionText: {
    color:      '#FFFFFF',
    fontSize:   18,
    fontWeight: '700',
    textAlign:  'center',
    lineHeight: 26,
  },
  answerRow: {
    flexDirection: 'row',
    gap:           16,
    width:         '100%',
  },
  answerBtn: {
    flex:           1,
    borderRadius:   14,
    paddingVertical: 16,
    alignItems:     'center',
    borderWidth:    2,
  },
  trueBtn:  { backgroundColor: 'rgba(34,197,94,0.15)', borderColor: '#22C55E' },
  falseBtn: { backgroundColor: 'rgba(239,68,68,0.15)', borderColor: '#EF4444' },
  answerBtnCorrect: { backgroundColor: 'rgba(0,184,144,0.35)' },
  answerBtnWrong:   { opacity: 0.4 },
  answerText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  bottomInfo: { alignItems: 'center', paddingBottom: 24, gap: 4 },
  infoText:   { color: 'rgba(255,255,255,0.45)', fontSize: 12, textAlign: 'center' },
  wrongText:  { color: '#FF6B6B', fontSize: 13 },
})
