/**
 * VanishingReadingScreen — Kaybolma Okuma
 * Metin 8 saniye gösterilir → Reanimated opacity 0 → 3 MCQ anlama sorusu
 */
import React, { useState, useEffect, useCallback } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView,
} from 'react-native'
import Animated, {
  useSharedValue, withTiming, useAnimatedStyle, Easing,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'

interface Props { onExit: () => void }

const PASSAGES = [
  {
    id: 1,
    title: 'İklim Değişikliği',
    text: 'Küresel ısınma, dünya genelinde ortalama sıcaklıkların artmasına yol açmaktadır. Bilim insanları, sanayi devriminden bu yana atmosferdeki karbondioksit miktarının yaklaşık iki katına çıktığını belirtmektedir. Bu durum, buzulların erimesine ve deniz seviyesinin yükselmesine neden olmaktadır. Bazı bölgelerde şiddetli kuraklıklar yaşanırken diğer bölgelerde aşırı yağışlar görülmektedir.',
    questions: [
      { q: 'Metinde küresel ısınmanın temel nedeni nedir?', opts: ['Güneş aktivitesindeki artış', 'Atmosferdeki karbondioksit artışı', 'Okyanus akıntılarındaki değişim', 'Ormanların doğal döngüsü'], ans: 1 },
      { q: 'Küresel ısınmanın su ile ilgili sonuçları hangi seçenekte doğru verilmiştir?', opts: ['Buzullar erir, deniz seviyesi düşer', 'Buzullar erir, deniz seviyesi yükselir', 'Buzullar büyür, deniz seviyesi düşer', 'Buzullar sabit kalır, deniz seviyesi yükselir'], ans: 1 },
      { q: 'Metine göre iklim değişikliğinin bölgeler arasındaki etkisi nasıldır?', opts: ['Her yerde aynı etkiyi gösterir', 'Yalnızca kuraklığa neden olur', 'Kimi yerde kuraklık kimi yerde aşırı yağış', 'Sadece kutup bölgelerini etkiler'], ans: 2 },
    ],
  },
  {
    id: 2,
    title: 'Anadolu Uygarlıkları',
    text: 'Anadolu, tarih boyunca pek çok medeniyete ev sahipliği yapmıştır. Hititler, M.Ö. 1650 yıllarında Orta Anadolu\'da güçlü bir devlet kurmuşlardır. Tunç Çağı\'nın önemli uygarlıklarından biri olan Hititler, gelişmiş bir hukuk sistemi oluşturmuşlardır. Daha sonra Frigya, Lidya ve Urartu gibi devletler de bu topraklarda hüküm sürmüştür.',
    questions: [
      { q: 'Hititler hangi dönemde Anadolu\'da devlet kurmuştur?', opts: ['M.Ö. 1000', 'M.Ö. 1650', 'M.Ö. 2000', 'M.Ö. 500'], ans: 1 },
      { q: 'Metne göre Hititlerin önemli bir özelliği nedir?', opts: ['Gelişmiş deniz ticareti', 'Güçlü mimarlık anlayışı', 'Gelişmiş hukuk sistemi', 'Güçlü deniz kuvvetleri'], ans: 2 },
      { q: 'Frigya, Lidya ve Urartu metinde nasıl tanımlanmıştır?', opts: ['Hitit\'in eyaletleri', 'Anadolu\'da hüküm sürmüş devletler', 'Anadolu dışında kurulan uygarlıklar', 'Roma\'dan önce gelen medeniyetler'], ans: 1 },
    ],
  },
]

type Phase = 'reading' | 'fading' | 'questions' | 'result'

export default function VanishingReadingScreen({ onExit }: Props) {
  const { student } = useAuthStore()
  const [passageIdx, setPassageIdx] = useState(0)
  const [phase, setPhase] = useState<Phase>('reading')
  const [timeLeft, setTimeLeft] = useState(8)
  const [answers, setAnswers] = useState<(number | null)[]>([null, null, null])
  const [score, setScore] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [round, setRound] = useState(1)

  const opacity = useSharedValue(1)
  const passage = PASSAGES[passageIdx % PASSAGES.length]

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }))

  // Countdown timer during reading phase
  useEffect(() => {
    if (phase !== 'reading') return
    if (timeLeft <= 0) {
      setPhase('fading')
      opacity.value = withTiming(0, { duration: 1500, easing: Easing.out(Easing.quad) }, () => {
        'worklet'
        // nothing needed — phase change below
      })
      setTimeout(() => setPhase('questions'), 1600)
      return
    }
    const t = setTimeout(() => setTimeLeft(tl => tl - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, timeLeft])

  const handleAnswer = useCallback((qIdx: number, optIdx: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setAnswers(prev => {
      const next = [...prev]
      next[qIdx] = optIdx
      return next
    })
  }, [])

  const handleSubmit = useCallback(async () => {
    const roundScore = answers.reduce<number>((acc, ans, i) =>
      acc + (ans === passage.questions[i].ans ? 1 : 0), 0)
    const newTotal = totalScore + roundScore
    setScore(roundScore)
    setTotalScore(newTotal)

    if (student?.id) {
      try {
        await (supabase as any).from('reading_mode_sessions').insert({
          student_id:   student.id,
          mode:         'vanishing_reading',
          avg_wpm:      0,
          total_words:  passage.text.split(' ').length,
          duration_sec: 8,
          arp_score:    roundScore * 2,
          xp_earned:    roundScore * 10,
          completion:   1,
        })
      } catch { /* sessiz */ }
    }
    setPhase('result')
  }, [answers, passage, student, totalScore])

  const handleNext = useCallback(() => {
    if (round >= 3) {
      onExit()
      return
    }
    setRound(r => r + 1)
    setPassageIdx(i => i + 1)
    setPhase('reading')
    setTimeLeft(8)
    setAnswers([null, null, null])
    opacity.value = 1
  }, [round, onExit, opacity])

  // ── Reading phase ─────────────────────────────────────────────
  if (phase === 'reading' || phase === 'fading') {
    return (
      <SafeAreaView style={s.root}>
        <TouchableOpacity style={s.exit} onPress={onExit}>
          <Text style={s.exitTxt}>✕</Text>
        </TouchableOpacity>

        <View style={s.topBar}>
          <Text style={s.label}>🌫️ Kaybolma Okuma</Text>
          <Text style={s.roundTxt}>Tur {round}/3</Text>
        </View>

        <View style={s.timerRow}>
          <Text style={[s.timerNum, timeLeft <= 3 && s.timerRed]}>{timeLeft}</Text>
          <Text style={s.timerSub}>saniye kaldı</Text>
        </View>

        <Animated.View style={[s.card, animStyle]}>
          <Text style={s.passTitle}>{passage.title}</Text>
          <Text style={s.passText}>{passage.text}</Text>
        </Animated.View>

        <Text style={s.hint}>Metni dikkatlice oku — sorular gelecek!</Text>
      </SafeAreaView>
    )
  }

  // ── Questions phase ───────────────────────────────────────────
  if (phase === 'questions') {
    return (
      <SafeAreaView style={s.root}>
        <TouchableOpacity style={s.exit} onPress={onExit}>
          <Text style={s.exitTxt}>✕</Text>
        </TouchableOpacity>
        <ScrollView contentContainerStyle={s.qScroll}>
          <Text style={s.qTitle}>🧠 Anlama Soruları</Text>
          <Text style={s.qSub}>{passage.title}</Text>

          {passage.questions.map((q, qi) => (
            <View key={qi} style={s.qBlock}>
              <Text style={s.qText}>{qi + 1}. {q.q}</Text>
              {q.opts.map((opt, oi) => (
                <TouchableOpacity
                  key={oi}
                  style={[s.optBtn, answers[qi] === oi && s.optSelected]}
                  onPress={() => handleAnswer(qi, oi)}
                  activeOpacity={0.75}
                >
                  <Text style={[s.optLetter, answers[qi] === oi && s.optLetterSel]}>
                    {String.fromCharCode(65 + oi)}
                  </Text>
                  <Text style={[s.optTxt, answers[qi] === oi && s.optTxtSel]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}

          <TouchableOpacity
            style={[s.submitBtn, answers.every(a => a !== null) && s.submitActive]}
            onPress={handleSubmit}
            disabled={!answers.every(a => a !== null)}
            activeOpacity={0.85}
          >
            <Text style={s.submitTxt}>Cevapla →</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    )
  }

  // ── Result phase ─────────────────────────────────────────────
  return (
    <SafeAreaView style={s.root}>
      <View style={s.resultWrap}>
        <Text style={s.resultEmoji}>{score === 3 ? '🏆' : score >= 2 ? '👏' : '💪'}</Text>
        <Text style={s.resultTitle}>Tur {round} Bitti!</Text>
        <Text style={s.resultScore}>{score} / 3 Doğru</Text>
        <Text style={s.resultXp}>+{score * 10} XP</Text>
        <Text style={s.totalScore}>Toplam: {totalScore} puan</Text>
        <TouchableOpacity style={s.nextBtn} onPress={handleNext} activeOpacity={0.85}>
          <Text style={s.nextTxt}>{round >= 3 ? 'Bitir' : 'Sonraki Metin →'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.exitSmall} onPress={onExit}>
          <Text style={s.exitSmallTxt}>Çıkış</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const BG = '#0A0F1F'
const CARD = '#0F1A35'
const ACCENT = '#40C8F0'

const s = StyleSheet.create({
  root:       { flex: 1, backgroundColor: BG },
  exit:       { position: 'absolute', top: 52, right: 20, zIndex: 10, padding: 8 },
  exitTxt:    { color: 'rgba(255,255,255,0.45)', fontSize: 18 },
  topBar:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 56, paddingHorizontal: 20, marginBottom: 12 },
  label:      { color: ACCENT, fontSize: 16, fontWeight: '700' },
  roundTxt:   { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
  timerRow:   { alignItems: 'center', marginBottom: 16 },
  timerNum:   { color: '#FFFFFF', fontSize: 56, fontWeight: '900', lineHeight: 60 },
  timerRed:   { color: '#EF4444' },
  timerSub:   { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4 },
  card:       { marginHorizontal: 20, backgroundColor: CARD, borderRadius: 18, padding: 22, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 14, elevation: 8 },
  passTitle:  { color: ACCENT, fontSize: 16, fontWeight: '800', marginBottom: 12 },
  passText:   { color: '#E8F4F8', fontSize: 16, lineHeight: 27, letterSpacing: 0.2 },
  hint:       { textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 20 },
  // Questions
  qScroll:    { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 40 },
  qTitle:     { color: '#FFFFFF', fontSize: 20, fontWeight: '800', marginBottom: 4 },
  qSub:       { color: ACCENT, fontSize: 13, marginBottom: 24 },
  qBlock:     { marginBottom: 24 },
  qText:      { color: '#FFFFFF', fontSize: 15, fontWeight: '600', lineHeight: 22, marginBottom: 12 },
  optBtn:     { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F1A35', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(64,200,240,0.2)', padding: 12, marginBottom: 8 },
  optSelected:{ backgroundColor: 'rgba(64,200,240,0.15)', borderColor: ACCENT },
  optLetter:  { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 10, textAlign: 'center', lineHeight: 28, color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '700' },
  optLetterSel:{ color: ACCENT },
  optTxt:     { color: 'rgba(255,255,255,0.75)', fontSize: 14, flex: 1 },
  optTxtSel:  { color: '#FFFFFF', fontWeight: '600' },
  submitBtn:  { backgroundColor: 'rgba(64,200,240,0.15)', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 8, borderWidth: 1.5, borderColor: 'rgba(64,200,240,0.3)' },
  submitActive:{ backgroundColor: ACCENT, borderColor: ACCENT },
  submitTxt:  { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  // Result
  resultWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  resultEmoji:{ fontSize: 64, marginBottom: 16 },
  resultTitle:{ color: '#FFFFFF', fontSize: 24, fontWeight: '800', marginBottom: 8 },
  resultScore:{ color: ACCENT, fontSize: 40, fontWeight: '900', marginBottom: 8 },
  resultXp:   { color: '#FFD700', fontSize: 22, fontWeight: '800', marginBottom: 6 },
  totalScore: { color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 32 },
  nextBtn:    { backgroundColor: ACCENT, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 40, alignItems: 'center', marginBottom: 12 },
  nextTxt:    { color: '#0A0F1F', fontSize: 16, fontWeight: '800' },
  exitSmall:  { padding: 12 },
  exitSmallTxt:{ color: 'rgba(255,255,255,0.4)', fontSize: 14 },
})
