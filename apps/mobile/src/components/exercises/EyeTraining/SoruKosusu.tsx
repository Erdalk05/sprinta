/**
 * SoruKosusu — Soru Koşusu (Göz Takibi)
 * Kısa pasaj 8sn → anlama sorusu → 5 tur
 */
import { SafeAreaView } from 'react-native-safe-area-context'
import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, 
} from 'react-native'
import Animated, {
  useSharedValue, withTiming, useAnimatedStyle,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { useEyeSoundFeedback } from './useEyeSoundFeedback'
import type { EyeExerciseProps, EyeMetrics } from '@sprinta/shared'

const ACCENT = '#6366F1'

interface Round {
  passage: string
  question: string
  opts: string[]
  ans: number
}

const ROUNDS: Round[] = [
  {
    passage: 'Fotosentez sırasında bitkiler klorofil pigmenti sayesinde güneş enerjisini kimyasal enerjiye dönüştürür. Bu süreçte karbondioksit ve su kullanılarak glikoz üretilir, oksijen ise yan ürün olarak serbest bırakılır.',
    question: 'Fotosentezde oksijen hangi aşamada serbest kalır?',
    opts: ['Glikoz tüketiminde', 'Klorofil sentezinde', 'Yan ürün olarak', 'Karbondioksit alımında'],
    ans: 2,
  },
  {
    passage: 'Osmanlı Devleti\'nin kuruluşu 1299 yılına dayanmaktadır. Kurucusu Osman Bey\'dir. İmparatorluk en geniş sınırlarına Kanuni Sultan Süleyman döneminde ulaşmış, Avrupa, Asya ve Afrika\'nın önemli bölgelerini kontrol altında tutmuştur.',
    question: 'Osmanlı en geniş sınırlarına hangi dönemde ulaştı?',
    opts: ['Osman Bey döneminde', 'Fatih dönemi', 'Kanuni dönemi', 'II. Mahmut dönemi'],
    ans: 2,
  },
  {
    passage: 'Depremler, yer kabuğundaki tektonik plakaların birbirine sürtünmesi veya kırılması sonucunda oluşur. Sismograf cihazları, depremlerin şiddetini ve derinliğini ölçmek için kullanılır. Richter ölçeği depremin büyüklüğünü ifade eder.',
    question: 'Sismograf ne için kullanılır?',
    opts: ['Volkan izlemek', 'Depremi ölçmek', 'Hava durumu', 'Plaka hareketi ölçmek'],
    ans: 1,
  },
  {
    passage: 'DNA, canlıların kalıtsal bilgisini taşıyan çift sarmal yapılı bir moleküldür. Adenin, Timin, Guanin ve Sitozin olmak üzere dört farklı baz içerir. DNA\'nın replikasyonu hücre bölünmesinden önce gerçekleşir.',
    question: 'DNA\'nın replikasyonu ne zaman gerçekleşir?',
    opts: ['Hücre ölümünde', 'Protein sentezinde', 'Hücre bölünmesinden önce', 'Mutasyon sırasında'],
    ans: 2,
  },
  {
    passage: 'Newton\'un ikinci hareket yasasına göre bir cismin ivmesi, uygulanan kuvvetle doğru orantılı, cismin kütlesiyle ters orantılıdır. Bu yasa F=ma formülüyle ifade edilir; F kuvveti, m kütleyi, a ise ivmeyi temsil eder.',
    question: 'F=ma formülünde "a" neyi temsil eder?',
    opts: ['Kütle', 'Kuvvet', 'İvme', 'Enerji'],
    ans: 2,
  },
  {
    passage: 'Türk alfabesi 29 harften oluşmakta olup 1928 yılında Latin alfabesine geçilmiştir. Bu reform, Mustafa Kemal Atatürk önderliğinde gerçekleştirilmiş ve okuma yazma oranının artmasında önemli rol oynamıştır.',
    question: 'Türk alfabesinin Latin kökenli hali kaç yılında kabul edildi?',
    opts: ['1923', '1928', '1934', '1938'],
    ans: 1,
  },
  {
    passage: 'Su, hidrojen ve oksijen atomlarından oluşan inorganik bir bileşiktir. Oda sıcaklığında sıvı hâlde bulunan su, 0°C\'de katılaşır ve 100°C\'de buharlaşır. Yaşamın temel koşullarından biri olan su, evrensel çözücü olarak bilinir.',
    question: 'Su kaç derecede buharlaşır?',
    opts: ['0°C', '37°C', '100°C', '212°C'],
    ans: 2,
  },
  {
    passage: 'Güneş sistemi, Güneş ve çevresinde dönen sekiz gezegenden oluşur. Güneş\'e en yakın gezegen Merkür, en uzak gezegen ise Neptün\'dür. Jüpiter, sistemin en büyük gezegeni olup büyük kırmızı leke adı verilen dev fırtınasıyla bilinir.',
    question: 'Güneş\'e en yakın gezegen hangisidir?',
    opts: ['Venüs', 'Mars', 'Merkür', 'Dünya'],
    ans: 2,
  },
]

function calcMetrics(hits: number, total: number, reactionTimes: number[], startMs: number): EyeMetrics {
  const acc = total > 0 ? (hits / total) * 100 : 0
  const avgReact = reactionTimes.length > 0 ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length : 2000
  return {
    reactionTimeMs:        Math.round(avgReact),
    accuracyPercent:       Math.round(acc),
    trackingErrorPx:       0,
    visualAttentionScore:  Math.round(acc * 0.7 + Math.min(100, (3000 / Math.max(avgReact, 1))) * 0.3),
    saccadicSpeedEstimate: parseFloat((hits / Math.max((performance.now() - startMs) / 1000, 1)).toFixed(2)),
    taskCompletionMs:      Math.round(performance.now() - startMs),
    arpContribution:       5,
  }
}

export default function SoruKosusu({
  difficulty, durationSeconds, onComplete, onExit,
}: EyeExerciseProps) {
  const rounds = Math.min(ROUNDS.length, Math.floor(durationSeconds / 8))
  const readTime = [8, 7, 6, 5][difficulty - 1]

  const [roundIdx, setRoundIdx]     = useState(0)
  const [phase, setPhase]           = useState<'reading' | 'question'>('reading')
  const [timer, setTimer]           = useState(readTime)
  const [selected, setSelected]     = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [hits, setHits]             = useState(0)
  const { playHit, playMiss, playTick, playAppear } = useEyeSoundFeedback()
  const startMs = useRef(performance.now())
  const questionStart = useRef(0)
  const hitsRef = useRef(0)
  const reactionTimes = useRef<number[]>([])

  const opacity = useSharedValue(1)
  const opStyle = useAnimatedStyle(() => ({ opacity: opacity.value }))

  const round = ROUNDS[roundIdx % ROUNDS.length]

  useEffect(() => {
    if (phase !== 'reading') return
    setTimer(readTime)
    opacity.value = withTiming(1, { duration: 300 })
    const interval = setInterval(() => {
      setTimer(t => {
        if (t <= 1) {
          clearInterval(interval)
          opacity.value = withTiming(0, { duration: 400 })
          setTimeout(() => {
            questionStart.current = performance.now()
            playAppear()
            setPhase('question')
          }, 400)
          return 0
        }
        if (t <= 2) { playTick() }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [phase, roundIdx, readTime])

  const handleAnswer = useCallback((optIdx: number) => {
    if (showFeedback || selected !== null) return
    const reactionMs = performance.now() - questionStart.current
    reactionTimes.current.push(reactionMs)

    const isCorrect = optIdx === round.ans
    setSelected(optIdx)
    hitsRef.current += isCorrect ? 1 : 0
    setHits(hitsRef.current)
    setShowFeedback(true)

    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      playHit()
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      playMiss()
    }

    setTimeout(() => {
      setShowFeedback(false)
      setSelected(null)
      if (roundIdx + 1 >= rounds) {
        onComplete(calcMetrics(hitsRef.current, rounds, reactionTimes.current, startMs.current))
      } else {
        setRoundIdx(r => r + 1)
        setPhase('reading')
      }
    }, 900)
  }, [showFeedback, selected, round, roundIdx, rounds, onComplete])

  return (
    <SafeAreaView style={s.root}>
      <TouchableOpacity style={s.exitBtn} onPress={onExit}>
        <Text style={s.exitTxt}>✕</Text>
      </TouchableOpacity>

      <Text style={s.title}>Soru Koşusu</Text>

      <View style={s.stats}>
        <Text style={s.statHit}>✓ {hits}/{rounds}</Text>
        <Text style={s.statRound}>{roundIdx + 1}. tur</Text>
      </View>

      {phase === 'reading' ? (
        <>
          <View style={s.timerBar}>
            <Text style={[s.timerTxt, timer <= 2 && s.timerRed]}>{timer}s</Text>
          </View>
          <Animated.View style={[s.passageCard, opStyle]}>
            <Text style={s.passageTxt}>{round.passage}</Text>
          </Animated.View>
          <Text style={s.hint}>Metni oku — soru geliyor!</Text>
        </>
      ) : (
        <>
          <View style={s.qCard}>
            <Text style={s.qTxt}>{round.question}</Text>
          </View>
          <View style={s.opts}>
            {round.opts.map((opt, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  s.optBtn,
                  showFeedback && i === round.ans && s.optCorrect,
                  showFeedback && i === selected && i !== round.ans && s.optWrong,
                ]}
                onPressIn={() => handleAnswer(i)}
                hitSlop={6}
                activeOpacity={0.8}
              >
                <Text style={[s.optTxt, showFeedback && i === round.ans && s.optTxtCorrect]}>
                  {String.fromCharCode(65 + i)}. {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: '#0A0F1F', alignItems: 'center' },
  exitBtn:     { position: 'absolute', top: 52, right: 20, zIndex: 10, padding: 8 },
  exitTxt:     { color: 'rgba(255,255,255,0.5)', fontSize: 18 },
  title:       { marginTop: 56, fontSize: 22, fontWeight: '800', color: '#FFFFFF', marginBottom: 10 },
  stats:       { flexDirection: 'row', gap: 16, alignItems: 'center', marginBottom: 12 },
  statHit:     { color: '#00C853', fontSize: 16, fontWeight: '700' },
  statRound:   { color: 'rgba(255,255,255,0.4)', fontSize: 14 },
  timerBar:    { marginBottom: 12 },
  timerTxt:    { color: ACCENT, fontSize: 28, fontWeight: '900' },
  timerRed:    { color: '#EF4444' },
  passageCard: { backgroundColor: '#0F1A35', borderRadius: 18, paddingHorizontal: 22, paddingVertical: 22, marginHorizontal: 20, width: '90%', marginBottom: 16, borderWidth: 1.5, borderColor: 'rgba(99,102,241,0.4)', minHeight: 160, justifyContent: 'center' },
  passageTxt:  { color: '#FFFFFF', fontSize: 14, lineHeight: 22, textAlign: 'left' },
  hint:        { color: 'rgba(255,255,255,0.35)', fontSize: 12 },
  qCard:       { backgroundColor: '#0F1A35', borderRadius: 16, paddingHorizontal: 20, paddingVertical: 18, marginHorizontal: 20, width: '90%', marginBottom: 18, borderWidth: 1.5, borderColor: 'rgba(99,102,241,0.5)', alignItems: 'center' },
  qTxt:        { color: '#FFFFFF', fontSize: 15, fontWeight: '700', textAlign: 'center', lineHeight: 22 },
  opts:        { width: '90%', gap: 10 },
  optBtn:      { backgroundColor: '#0F1A35', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(99,102,241,0.3)', padding: 14 },
  optCorrect:  { borderColor: '#00C853', backgroundColor: 'rgba(0,200,83,0.12)' },
  optWrong:    { borderColor: '#EF4444', backgroundColor: 'rgba(239,68,68,0.12)' },
  optTxt:      { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600' },
  optTxtCorrect:{ color: '#00C853' },
})
