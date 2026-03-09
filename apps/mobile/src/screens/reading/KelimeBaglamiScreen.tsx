/**
 * KelimeBaglamiScreen — Kelime Bağlamı
 * Altı çizili kelime + cümle → 4 şık anlam
 */
import React, { useState, useCallback, useRef } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
} from 'react-native'
import Animated, {
  useSharedValue, withSequence, withTiming, useAnimatedStyle,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'

interface Props { onExit: () => void }

interface WordItem {
  sentence: string
  targetWord: string
  opts: string[]
  ans: number
  category: string
}

const WORDS: WordItem[] = [
  { category: 'Türkçe', targetWord: 'kıtlık', sentence: 'Uzun süren kuraklık, bölgede büyük bir kıtlığa yol açtı.', opts: ['Bolluk', 'Yoksulluk', 'Besin yetersizliği', 'Salgın'], ans: 2 },
  { category: 'Türkçe', targetWord: 'mukayese', sentence: 'İki ülkenin eğitim sistemini mukayese etmek oldukça güçtür.', opts: ['Eleştirmek', 'Karşılaştırmak', 'İncelemek', 'Sıralamak'], ans: 1 },
  { category: 'Türkçe', targetWord: 'ihmal', sentence: 'Çocuğun sağlık sorunları, uzun süreli ihmalin sonucuydu.', opts: ['İlgi', 'İstismar', 'Dikkatsizlik/aldırmazlık', 'Tedavi'], ans: 2 },
  { category: 'Türkçe', targetWord: 'müstakil', sentence: 'Ailesi, şehrin kenarında müstakil bir ev satın aldı.', opts: ['Eski', 'Bağımsız/ayrı', 'Küçük', 'Kiracı'], ans: 1 },
  { category: 'Türkçe', targetWord: 'mütevazı', sentence: 'Ödülü alırken son derece mütevazı bir konuşma yaptı.', opts: ['Gururlu', 'Alçakgönüllü', 'Uzun', 'Heyecanlı'], ans: 1 },
  { category: 'Türkçe', targetWord: 'anlaşmazlık', sentence: 'İki şirket arasındaki anlaşmazlık mahkemeye taşındı.', opts: ['İşbirliği', 'Sözleşme', 'Uyuşmazlık/çatışma', 'Toplantı'], ans: 2 },
  { category: 'Türkçe', targetWord: 'verimli', sentence: 'Bu topraklar, tarım için son derece verimlidir.', opts: ['Sert', 'Çorak', 'Bol ürün veren', 'Sulanan'], ans: 2 },
  { category: 'Türkçe', targetWord: 'kehanet', sentence: 'Yaşlı adam, köyün geleceği hakkında bir kehanette bulundu.', opts: ['Tarih', 'Öngörü/tahmin', 'Efsane', 'Dua'], ans: 1 },
  { category: 'Türkçe', targetWord: 'kalıcı', sentence: 'Bu çözümün kalıcı olması için sistemin yeniden düzenlenmesi gerekiyor.', opts: ['Geçici', 'Hızlı', 'Sürekli', 'Pahalı'], ans: 2 },
  { category: 'Türkçe', targetWord: 'özgün', sentence: 'Sanatçının bu tablosu, oldukça özgün bir üslup taşımaktadır.', opts: ['Eski', 'Orijinal/kendine özgü', 'Pahalı', 'Renkli'], ans: 1 },
  { category: 'İngilizce', targetWord: 'resilient', sentence: 'Despite many challenges, she remained resilient throughout her career.', opts: ['Weak', 'Able to recover quickly', 'Confused', 'Isolated'], ans: 1 },
  { category: 'İngilizce', targetWord: 'ambiguous', sentence: 'The contract contained several ambiguous clauses that led to disputes.', opts: ['Clear', 'Unclear/having multiple meanings', 'Legal', 'Short'], ans: 1 },
  { category: 'İngilizce', targetWord: 'adequate', sentence: 'The team had adequate resources to complete the project on time.', opts: ['Excessive', 'Sufficient', 'Missing', 'Advanced'], ans: 1 },
  { category: 'Türkçe', targetWord: 'münasip', sentence: 'Bu davranış, bir öğrenciye münasip değildir.', opts: ['Yasaklı', 'Uygun/yakışır', 'Zor', 'Gerekli'], ans: 1 },
  { category: 'Türkçe', targetWord: 'itina', sentence: 'Tabakları itina ile temizleyip rafa dizdi.', opts: ['Hızla', 'Dikkat ve özenle', 'Dikkatsizce', 'Gecikmeli'], ans: 1 },
]

type Phase = 'quiz' | 'result'

export default function KelimeBaglamiScreen({ onExit }: Props) {
  const { student } = useAuthStore()
  const [phase, setPhase] = useState<Phase>('quiz')
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [correct, setCorrect] = useState(0)
  const [wrong, setWrong] = useState(0)
  const startMs = useRef(Date.now())

  const scaleY = useSharedValue(1)
  const scaleStyle = useAnimatedStyle(() => ({ transform: [{ scale: scaleY.value }] }))

  const q = WORDS[currentIdx]

  const renderSentence = useCallback((item: WordItem) => {
    const parts = item.sentence.split(item.targetWord)
    return (
      <Text style={s.sentenceTxt}>
        {parts[0]}
        <Text style={s.highlight}>{item.targetWord}</Text>
        {parts[1]}
      </Text>
    )
  }, [])

  const handleSelect = useCallback((optIdx: number) => {
    if (showFeedback) return
    setSelected(optIdx)
    const isCorrect = optIdx === q.ans
    if (isCorrect) {
      setCorrect(c => c + 1)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      scaleY.value = withSequence(
        withTiming(1.05, { duration: 120 }),
        withTiming(1, { duration: 120 }),
      )
    } else {
      setWrong(w => w + 1)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }
    setShowFeedback(true)
    setTimeout(() => {
      setShowFeedback(false)
      setSelected(null)
      if (currentIdx + 1 >= WORDS.length) setPhase('result')
      else setCurrentIdx(i => i + 1)
    }, 1300)
  }, [showFeedback, q, currentIdx, scaleY])

  const handleFinish = useCallback(async () => {
    if (student?.id) {
      try {
        await (supabase as any).from('reading_mode_sessions').insert({
          student_id:   student.id,
          mode:         'kelime_baglami',
          avg_wpm:      0,
          total_words:  WORDS.length,
          duration_sec: Math.round((Date.now() - startMs.current) / 1000),
          arp_score:    correct * 3,
          xp_earned:    correct * 8,
          completion:   1,
        })
      } catch { /* sessiz */ }
    }
    onExit()
  }, [student, correct, onExit])

  if (phase === 'result') {
    return (
      <SafeAreaView style={s.root}>
        <View style={s.centerWrap}>
          <Text style={s.emoji}>{correct >= 12 ? '🏆' : correct >= 8 ? '👏' : '💪'}</Text>
          <Text style={s.resTitle}>Tamamlandı!</Text>
          <View style={s.statsRow}>
            <View style={s.stat}>
              <Text style={[s.statNum, { color: '#00C853' }]}>{correct}</Text>
              <Text style={s.statLbl}>Doğru</Text>
            </View>
            <View style={s.stat}>
              <Text style={[s.statNum, { color: '#EF4444' }]}>{wrong}</Text>
              <Text style={s.statLbl}>Yanlış</Text>
            </View>
          </View>
          <Text style={s.xpTxt}>+{correct * 8} XP</Text>
          <TouchableOpacity style={s.btn} onPress={handleFinish} activeOpacity={0.85}>
            <Text style={s.btnTxt}>Bitir</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={s.root}>
      <TouchableOpacity style={s.exit} onPress={onExit}>
        <Text style={s.exitTxt}>✕</Text>
      </TouchableOpacity>

      <View style={s.topBar}>
        <Text style={s.label}>🔤 Kelime Bağlamı</Text>
        <Text style={s.prog}>{currentIdx + 1}/{WORDS.length}</Text>
      </View>

      <View style={s.scoreRow}>
        <View style={s.chip}><Text style={[s.chipTxt, { color: '#00C853' }]}>✓ {correct}</Text></View>
        <View style={s.chip}><Text style={[s.chipTxt, { color: '#EF4444' }]}>✗ {wrong}</Text></View>
        <View style={[s.chip, { backgroundColor: 'rgba(64,200,240,0.1)' }]}>
          <Text style={[s.chipTxt, { color: '#40C8F0' }]}>{q.category}</Text>
        </View>
      </View>

      <Animated.View style={[s.cont, scaleStyle]}>
        {/* Sentence with highlighted word */}
        <View style={s.sentenceCard}>
          <Text style={s.sentenceLbl}>Cümledeki anlam:</Text>
          {renderSentence(q)}
        </View>

        {/* Question */}
        <Text style={s.qTxt}>
          "{q.targetWord}" kelimesinin bu cümledeki anlamı nedir?
        </Text>

        {/* Options */}
        {q.opts.map((opt, oi) => (
          <TouchableOpacity
            key={oi}
            style={[
              s.optBtn,
              !showFeedback && selected === oi && s.optSelected,
              showFeedback && oi === q.ans && s.optCorrect,
              showFeedback && oi === selected && oi !== q.ans && s.optWrong,
            ]}
            onPress={() => handleSelect(oi)}
            activeOpacity={0.8}
          >
            <View style={[s.optLetter, showFeedback && oi === q.ans && s.optLetterCorrect, showFeedback && oi === selected && oi !== q.ans && s.optLetterWrong]}>
              <Text style={s.optLetterTxt}>{String.fromCharCode(65 + oi)}</Text>
            </View>
            <Text style={[s.optTxt, showFeedback && oi === q.ans && s.optTxtCorrect]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>
    </SafeAreaView>
  )
}

const BG = '#0A0F1F'
const ACCENT = '#40C8F0'

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: BG },
  exit:        { position: 'absolute', top: 52, right: 20, zIndex: 10, padding: 8 },
  exitTxt:     { color: 'rgba(255,255,255,0.45)', fontSize: 18 },
  topBar:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 56, paddingHorizontal: 20, marginBottom: 12 },
  label:       { color: ACCENT, fontSize: 15, fontWeight: '700' },
  prog:        { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
  scoreRow:    { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginBottom: 20 },
  chip:        { backgroundColor: '#0F1A35', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5 },
  chipTxt:     { fontSize: 13, fontWeight: '700' },
  cont:        { paddingHorizontal: 20 },
  sentenceCard:{ backgroundColor: '#0F1A35', borderRadius: 18, padding: 20, marginBottom: 20, borderLeftWidth: 3, borderLeftColor: '#F59E0B' },
  sentenceLbl: { color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  sentenceTxt: { color: '#E8F4F8', fontSize: 17, lineHeight: 28 },
  highlight:   { color: '#F59E0B', fontWeight: '800', textDecorationLine: 'underline' },
  qTxt:        { color: '#FFFFFF', fontSize: 15, fontWeight: '600', lineHeight: 22, marginBottom: 16 },
  optBtn:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F1A35', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(64,200,240,0.2)', padding: 14, marginBottom: 10 },
  optSelected: { borderColor: ACCENT, backgroundColor: 'rgba(64,200,240,0.12)' },
  optCorrect:  { borderColor: '#00C853', backgroundColor: 'rgba(0,200,83,0.15)' },
  optWrong:    { borderColor: '#EF4444', backgroundColor: 'rgba(239,68,68,0.15)' },
  optLetter:   { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  optLetterCorrect:{ backgroundColor: '#00C853' },
  optLetterWrong:{ backgroundColor: '#EF4444' },
  optLetterTxt:{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '800' },
  optTxt:      { color: 'rgba(255,255,255,0.8)', fontSize: 14, flex: 1 },
  optTxtCorrect:{ color: '#00C853', fontWeight: '700' },
  // Result
  centerWrap:  { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emoji:       { fontSize: 64, marginBottom: 16 },
  resTitle:    { color: '#FFFFFF', fontSize: 24, fontWeight: '800', marginBottom: 24 },
  statsRow:    { flexDirection: 'row', gap: 24, marginBottom: 20 },
  stat:        { alignItems: 'center', backgroundColor: '#0F1A35', borderRadius: 14, padding: 18, width: 110 },
  statNum:     { fontSize: 36, fontWeight: '900', marginBottom: 4 },
  statLbl:     { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
  xpTxt:       { color: '#FFD700', fontSize: 22, fontWeight: '800', marginBottom: 32 },
  btn:         { backgroundColor: ACCENT, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 48 },
  btnTxt:      { color: '#0A0F1F', fontSize: 16, fontWeight: '800' },
})
