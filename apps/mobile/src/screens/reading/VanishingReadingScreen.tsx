/**
 * VanishingReadingScreen — Kaybolma Okuma
 * Metin 8 saniye gösterilir → Reanimated opacity 0 → 3 MCQ anlama sorusu (tek tek)
 */
import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Animated as RNAnimated,
} from 'react-native'
import Animated, {
  useSharedValue, withTiming, useAnimatedStyle, Easing,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { Audio } from 'expo-av'
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

async function playFeedback(correct: boolean) {
  try {
    const asset = correct
      ? require('../../../assets/sounds/success.wav')
      : require('../../../assets/sounds/miss.wav')
    const { sound } = await Audio.Sound.createAsync(asset)
    await sound.playAsync()
    sound.setOnPlaybackStatusUpdate(status => {
      if (status.isLoaded && status.didJustFinish) sound.unloadAsync()
    })
  } catch { /* sessiz */ }
}

export default function VanishingReadingScreen({ onExit }: Props) {
  const { student } = useAuthStore()
  const [passageIdx,    setPassageIdx]    = useState(0)
  const [phase,         setPhase]         = useState<Phase>('reading')
  const [timeLeft,      setTimeLeft]      = useState(8)
  const [round,         setRound]         = useState(1)

  // Tek-tek soru state
  const [currentQ,      setCurrentQ]      = useState(0)
  const [selectedOpt,   setSelectedOpt]   = useState<number | null>(null)
  const [showFeedback,  setShowFeedback]  = useState(false)
  const [answers,       setAnswers]       = useState<boolean[]>([])  // doğru/yanlış listesi

  const [score,         setScore]         = useState(0)
  const [totalScore,    setTotalScore]    = useState(0)

  const advanceTimer   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const progressAnim   = useRef(new RNAnimated.Value(0)).current
  const opacity        = useSharedValue(1)
  const passage      = PASSAGES[passageIdx % PASSAGES.length]
  const animStyle    = useAnimatedStyle(() => ({ opacity: opacity.value }))

  useEffect(() => {
    const qTotal = PASSAGES[passageIdx % PASSAGES.length]?.questions.length ?? 1
    const val = (currentQ + (showFeedback ? 1 : 0)) / qTotal
    RNAnimated.timing(progressAnim, { toValue: Math.min(1, val), duration: 300, useNativeDriver: false }).start()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQ, showFeedback, passageIdx])

  // Temizlik
  useEffect(() => () => { if (advanceTimer.current) clearTimeout(advanceTimer.current) }, [])

  // Countdown timer
  useEffect(() => {
    if (phase !== 'reading') return
    if (timeLeft <= 0) {
      setPhase('fading')
      opacity.value = withTiming(0, { duration: 1500, easing: Easing.out(Easing.quad) })
      setTimeout(() => setPhase('questions'), 1600)
      return
    }
    const t = setTimeout(() => setTimeLeft(tl => tl - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, timeLeft])

  const handleAnswer = useCallback((optIdx: number) => {
    if (showFeedback) return  // zaten cevaplandı
    const q       = passage.questions[currentQ]
    const correct = optIdx === q.ans

    setSelectedOpt(optIdx)
    setShowFeedback(true)
    setAnswers(prev => [...prev, correct])

    if (correct) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }
    playFeedback(correct)

    // 1.1 saniye sonra sonraki soruya geç
    advanceTimer.current = setTimeout(async () => {
      const nextQ = currentQ + 1
      if (nextQ >= passage.questions.length) {
        // Tüm sorular bitti → sonuç hesapla
        const newAnswers = [...answers, correct]
        const roundScore = newAnswers.filter(Boolean).length
        const newTotal   = totalScore + roundScore
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
      } else {
        setCurrentQ(nextQ)
        setSelectedOpt(null)
        setShowFeedback(false)
      }
    }, 1100)
  }, [showFeedback, currentQ, passage, answers, totalScore, student])

  const handleNext = useCallback(() => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current)
    if (round >= 3) { onExit(); return }
    setRound(r => r + 1)
    setPassageIdx(i => i + 1)
    setPhase('reading')
    setTimeLeft(8)
    setCurrentQ(0)
    setSelectedOpt(null)
    setShowFeedback(false)
    setAnswers([])
    opacity.value = 1
  }, [round, onExit, opacity])

  // ── Reading phase ──────────────────────────────────────────────
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

  // ── Questions phase (tek tek) ──────────────────────────────────
  if (phase === 'questions') {
    const q     = passage.questions[currentQ]
    const total = passage.questions.length

    return (
      <SafeAreaView style={s.root}>
        <TouchableOpacity style={s.exit} onPress={onExit}>
          <Text style={s.exitTxt}>✕</Text>
        </TouchableOpacity>

        <View style={s.qHeader}>
          <Text style={s.qTitle}>🧠 Anlama Sorusu</Text>
          <Text style={s.qCounter}>{currentQ + 1} / {total}</Text>
        </View>

        {/* İlerleme çubuğu */}
        <View style={s.progressTrack}>
          <RNAnimated.View style={[s.progressFill, { width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
        </View>

        <View style={s.qBody}>
          <Text style={s.qText}>{q.q}</Text>

          {q.opts.map((opt, oi) => {
            const isSelected = selectedOpt === oi
            const isCorrect  = oi === q.ans
            let optStyle = s.optBtn
            let letterStyle = s.optLetter
            let txtStyle    = s.optTxt

            if (showFeedback) {
              if (isCorrect)                    { optStyle = s.optCorrect; letterStyle = s.optLetterCorrect; txtStyle = s.optTxtCorrect }
              else if (isSelected && !isCorrect){ optStyle = s.optWrong;   letterStyle = s.optLetterWrong;   txtStyle = s.optTxtWrong   }
              else                              { optStyle = s.optDimmed }
            } else if (isSelected) {
              optStyle = s.optSelected
              letterStyle = s.optLetterSel
              txtStyle    = s.optTxtSel
            }

            return (
              <TouchableOpacity
                key={oi}
                style={[s.optBase, optStyle]}
                onPress={() => handleAnswer(oi)}
                activeOpacity={showFeedback ? 1 : 0.75}
                disabled={showFeedback}
              >
                <Text style={[s.optLetterBase, letterStyle]}>
                  {showFeedback ? (isCorrect ? '✓' : isSelected ? '✗' : String.fromCharCode(65 + oi)) : String.fromCharCode(65 + oi)}
                </Text>
                <Text style={[s.optTxtBase, txtStyle]}>{opt}</Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </SafeAreaView>
    )
  }

  // ── Result phase ───────────────────────────────────────────────
  return (
    <SafeAreaView style={s.root}>
      <View style={s.resultWrap}>
        <Text style={s.resultEmoji}>{score === 3 ? '🏆' : score >= 2 ? '👏' : '💪'}</Text>
        <Text style={s.resultTitle}>Tur {round} Bitti!</Text>
        <Text style={s.resultScore}>{score} / 3 Doğru</Text>
        <Text style={s.resultXp}>+{score * 10} XP</Text>
        <Text style={s.totalTxt}>Toplam: {totalScore} puan</Text>
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

const BG     = '#0A0F1F'
const CARD   = '#0F1A35'
const ACCENT = '#40C8F0'
const GREEN  = '#22C55E'
const RED    = '#EF4444'

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: BG },
  exit:        { position: 'absolute', top: 52, right: 20, zIndex: 10, padding: 8 },
  exitTxt:     { color: 'rgba(255,255,255,0.45)', fontSize: 18 },
  topBar:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 56, paddingHorizontal: 20, marginBottom: 12 },
  label:       { color: ACCENT, fontSize: 16, fontWeight: '700' },
  roundTxt:    { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
  timerRow:    { alignItems: 'center', marginBottom: 16 },
  timerNum:    { color: '#FFFFFF', fontSize: 56, fontWeight: '900', lineHeight: 60 },
  timerRed:    { color: RED },
  timerSub:    { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4 },
  card:        { marginHorizontal: 10, backgroundColor: CARD, borderRadius: 18, paddingHorizontal: 34, paddingVertical: 22, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 14, elevation: 8 },
  passTitle:   { color: ACCENT, fontSize: 16, fontWeight: '800', marginBottom: 12 },
  passText:    { color: '#E8F4F8', fontSize: 16, lineHeight: 27, letterSpacing: 0.2 },
  hint:        { textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 20 },

  // Questions
  qHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 56, paddingHorizontal: 24, marginBottom: 10 },
  qTitle:      { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  qCounter:    { color: ACCENT, fontSize: 15, fontWeight: '700' },
  progressTrack:{ height: 3, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 24, borderRadius: 2, marginBottom: 28 },
  progressFill: { height: 3, backgroundColor: ACCENT, borderRadius: 2 },
  qBody:       { flex: 1, paddingHorizontal: 24 },
  qText:       { color: '#FFFFFF', fontSize: 16, fontWeight: '600', lineHeight: 24, marginBottom: 20 },

  // Option base
  optBase:          { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1.5, padding: 14, marginBottom: 10 },
  optBtn:           { backgroundColor: CARD, borderColor: 'rgba(64,200,240,0.2)' },
  optSelected:      { backgroundColor: 'rgba(64,200,240,0.12)', borderColor: ACCENT },
  optCorrect:       { backgroundColor: 'rgba(34,197,94,0.15)', borderColor: GREEN },
  optWrong:         { backgroundColor: 'rgba(239,68,68,0.15)', borderColor: RED },
  optDimmed:        { backgroundColor: CARD, borderColor: 'rgba(255,255,255,0.05)', opacity: 0.4 },

  // Letter badge
  optLetterBase:    { width: 30, height: 30, borderRadius: 15, textAlign: 'center', lineHeight: 30, fontSize: 13, fontWeight: '700', marginRight: 12, backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' },
  optLetter:        {},
  optLetterSel:     { color: ACCENT, backgroundColor: 'rgba(64,200,240,0.15)' },
  optLetterCorrect: { color: GREEN, backgroundColor: 'rgba(34,197,94,0.15)' },
  optLetterWrong:   { color: RED, backgroundColor: 'rgba(239,68,68,0.15)' },

  // Option text
  optTxtBase:       { color: 'rgba(255,255,255,0.7)', fontSize: 14, flex: 1, lineHeight: 20 },
  optTxt:           {},
  optTxtSel:        { color: '#FFFFFF', fontWeight: '600' },
  optTxtCorrect:    { color: GREEN, fontWeight: '700' },
  optTxtWrong:      { color: RED },

  // Result
  resultWrap:  { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  resultEmoji: { fontSize: 64, marginBottom: 16 },
  resultTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', marginBottom: 8 },
  resultScore: { color: ACCENT, fontSize: 40, fontWeight: '900', marginBottom: 8 },
  resultXp:    { color: '#FFD700', fontSize: 22, fontWeight: '800', marginBottom: 6 },
  totalTxt:    { color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 32 },
  nextBtn:     { backgroundColor: ACCENT, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 40, alignItems: 'center', marginBottom: 12 },
  nextTxt:     { color: '#0A0F1F', fontSize: 16, fontWeight: '800' },
  exitSmall:   { padding: 12 },
  exitSmallTxt:{ color: 'rgba(255,255,255,0.4)', fontSize: 14 },
})
