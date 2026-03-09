/**
 * FlashcardBankScreen — Flash Kart Soru Bankası
 * Soruları kart flip formatında göster, işaretle/tekrar sistemi
 */
import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView,
} from 'react-native'
import Animated, {
  useSharedValue, withTiming, useAnimatedStyle, interpolate, Extrapolation,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'

interface Props { onExit: () => void }

interface FlashCard {
  id: string
  front: string
  back: string
  subject: string
  status: 'unseen' | 'known' | 'review'
}

const SAMPLE_CARDS: FlashCard[] = [
  { id: '1', front: 'Fotosentez nedir?', back: 'Bitkilerin güneş enerjisi kullanarak CO₂ ve H₂O\'dan organik madde ve O₂ üretmesi sürecidir.', subject: 'Fen', status: 'unseen' },
  { id: '2', front: 'Türkiye\'nin başkenti hangi şehirdir?', back: 'Ankara (1923\'ten beri). İstanbul büyük şehirdir ama başkent değildir.', subject: 'Sosyal', status: 'unseen' },
  { id: '3', front: 'Osmanlı devleti kaç yılında kurulmuştur?', back: '1299 yılında Söğüt\'te Osman Bey tarafından kurulmuştur.', subject: 'Tarih', status: 'unseen' },
  { id: '4', front: 'DNA\'nın tam açılımı nedir?', back: 'Deoksiribonükleik Asit (Deoxyribonucleic Acid). Genetik bilgiyi taşıyan moleküldür.', subject: 'Fen', status: 'unseen' },
  { id: '5', front: 'Türkiye kaç km² yüzölçümüne sahiptir?', back: 'Yaklaşık 783.562 km². Avrupa ve Asya kıtalarında yer alır.', subject: 'Coğrafya', status: 'unseen' },
  { id: '6', front: 'Sakkad ne demektir?', back: 'Gözün bir noktadan diğerine hızlı atlama hareketi. Okuma hızının temel bileşenidir.', subject: 'Fen', status: 'unseen' },
  { id: '7', front: 'Işığın en hızlı ilerlediği ortam hangisidir?', back: 'Işık en hızlı vakumda (boşlukta) ilerler: yaklaşık 300.000 km/s.', subject: 'Fizik', status: 'unseen' },
  { id: '8', front: 'Cumhuriyet ne zaman ilan edildi?', back: '29 Ekim 1923\'te Mustafa Kemal Atatürk önderliğinde ilan edildi.', subject: 'Tarih', status: 'unseen' },
  { id: '9', front: 'Ekosistem nedir?', back: 'Canlılar ile cansız çevrelerinin birlikte oluşturduğu sistemdir. Örnek: orman, göl, çöl.', subject: 'Fen', status: 'unseen' },
  { id: '10', front: 'Karadeniz bölgesinin en belirgin iklim özelliği nedir?', back: 'Yüksek yağış ve ılıman iklim. Türkiye\'nin en fazla yağış alan bölgesidir.', subject: 'Coğrafya', status: 'unseen' },
  { id: '11', front: 'Newton\'un 1. hareket yasası nedir?', back: 'Eylemsizlik yasası: Bir kuvvet uygulanmadıkça cisim duruyorsa durmaya, hareket ediyorsa hareket etmeye devam eder.', subject: 'Fizik', status: 'unseen' },
  { id: '12', front: '"Mahkum" sözcüğünün anlamı nedir?', back: 'Suçlu bulunan ve ceza verilen kişi. Aynı zamanda "mahkum olmak" = mecbur kalmak anlamında kullanılır.', subject: 'Türkçe', status: 'unseen' },
  { id: '13', front: 'Klorofil hangi organelde bulunur?', back: 'Kloroplastta bulunur. Klorofil, ışığı soğuran ve fotosentezi sağlayan pigmenttir.', subject: 'Fen', status: 'unseen' },
  { id: '14', front: 'İpek Yolu\'nun önemi nedir?', back: 'Çin\'den Avrupa\'ya uzanan ticaret yolu. İpek, baharat, fikirler ve kültürler bu yolda taşındı.', subject: 'Tarih', status: 'unseen' },
  { id: '15', front: 'Türkçe\'de iyelik eki nedir?', back: 'İsmin kime/neye ait olduğunu gösteren ek. Örnek: kitabım, kitabın, kitabı, kitabımız...', subject: 'Türkçe', status: 'unseen' },
]

type Phase = 'cards' | 'result'

export default function FlashcardBankScreen({ onExit }: Props) {
  const { student } = useAuthStore()
  const [cards, setCards] = useState<FlashCard[]>(SAMPLE_CARDS)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [phase, setPhase] = useState<Phase>('cards')
  const [sessionQueue, setSessionQueue] = useState<string[]>(SAMPLE_CARDS.map(c => c.id))
  const startMs = useRef(Date.now())

  const flip = useSharedValue(0)

  const frontStyle = useAnimatedStyle(() => ({
    opacity: interpolate(flip.value, [0, 0.5, 1], [1, 0, 0], Extrapolation.CLAMP),
    transform: [{ rotateY: `${interpolate(flip.value, [0, 1], [0, 180])}deg` }],
  }))
  const backStyle = useAnimatedStyle(() => ({
    opacity: interpolate(flip.value, [0, 0.5, 1], [0, 0, 1], Extrapolation.CLAMP),
    transform: [{ rotateY: `${interpolate(flip.value, [0, 1], [180, 360])}deg` }],
  }))

  const handleFlip = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    flip.value = withTiming(flipped ? 0 : 1, { duration: 350 })
    setFlipped(f => !f)
  }, [flipped, flip])

  const currentCardId = sessionQueue[currentIdx]
  const currentCard = cards.find(c => c.id === currentCardId)

  const handleKnown = useCallback(() => {
    setCards(prev => prev.map(c => c.id === currentCardId ? { ...c, status: 'known' } : c))
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    flip.value = withTiming(0, { duration: 200 })
    setFlipped(false)
    if (currentIdx + 1 >= sessionQueue.length) setPhase('result')
    else setCurrentIdx(i => i + 1)
  }, [currentCardId, currentIdx, sessionQueue, flip])

  const handleReview = useCallback(() => {
    setCards(prev => prev.map(c => c.id === currentCardId ? { ...c, status: 'review' } : c))
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    // Move to end of queue
    setSessionQueue(q => {
      const next = q.filter((_, i) => i !== currentIdx)
      return [...next, currentCardId]
    })
    flip.value = withTiming(0, { duration: 200 })
    setFlipped(false)
    if (currentIdx >= sessionQueue.length - 1) setCurrentIdx(0)
  }, [currentCardId, currentIdx, sessionQueue, flip])

  const handleFinish = useCallback(async () => {
    const known = cards.filter(c => c.status === 'known').length
    if (student?.id) {
      try {
        await (supabase as any).from('reading_mode_sessions').insert({
          student_id:   student.id,
          mode:         'flashcard_bank',
          avg_wpm:      0,
          total_words:  0,
          duration_sec: Math.round((Date.now() - startMs.current) / 1000),
          arp_score:    known * 2,
          xp_earned:    known * 6,
          completion:   known / cards.length,
        })
      } catch { /* sessiz */ }
    }
    onExit()
  }, [cards, student, onExit])

  if (phase === 'result') {
    const known = cards.filter(c => c.status === 'known').length
    const review = cards.filter(c => c.status === 'review').length
    return (
      <SafeAreaView style={s.root}>
        <View style={s.centerWrap}>
          <Text style={s.emoji}>{known >= 12 ? '🏆' : '👏'}</Text>
          <Text style={s.resTitle}>Oturum Bitti!</Text>
          <View style={s.statsRow}>
            <View style={s.stat}>
              <Text style={[s.statNum, { color: '#00C853' }]}>{known}</Text>
              <Text style={s.statLbl}>Biliyorum</Text>
            </View>
            <View style={s.stat}>
              <Text style={[s.statNum, { color: '#F59E0B' }]}>{review}</Text>
              <Text style={s.statLbl}>Tekrar</Text>
            </View>
          </View>
          <Text style={s.xpTxt}>+{known * 6} XP</Text>
          <TouchableOpacity style={s.btn} onPress={handleFinish} activeOpacity={0.85}>
            <Text style={s.btnTxt}>Bitir</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  if (!currentCard) return null

  const known = cards.filter(c => c.status === 'known').length
  const prog = (known / cards.length) * 100

  return (
    <SafeAreaView style={s.root}>
      <TouchableOpacity style={s.exit} onPress={onExit}>
        <Text style={s.exitTxt}>✕</Text>
      </TouchableOpacity>

      <View style={s.topBar}>
        <Text style={s.label}>🃏 Flash Kart Bankası</Text>
        <Text style={s.progTxt}>{known}/{cards.length} biliniyor</Text>
      </View>

      <View style={s.progressBg}>
        <View style={[s.progressFill, { width: `${prog}%` }]} />
      </View>

      {/* Card */}
      <View style={s.cardContainer}>
        <TouchableOpacity style={s.cardTouchable} onPress={handleFlip} activeOpacity={0.95}>
          {/* Front */}
          <Animated.View style={[s.cardSide, s.cardFront, frontStyle]}>
            <Text style={s.cardSubj}>{currentCard.subject}</Text>
            <Text style={s.cardQ}>{currentCard.front}</Text>
            <Text style={s.tapHint}>Cevabı görmek için dokun 👆</Text>
          </Animated.View>
          {/* Back */}
          <Animated.View style={[s.cardSide, s.cardBack, backStyle]}>
            <Text style={s.cardSubjBack}>{currentCard.subject} — Cevap</Text>
            <Text style={s.cardA}>{currentCard.back}</Text>
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Status indicator */}
      <View style={s.statusRow}>
        {['known', 'review', 'unseen'].map(st => (
          <View key={st} style={[s.statusDot, currentCard.status === st && s.statusDotActive,
            { backgroundColor: st === 'known' ? '#00C853' : st === 'review' ? '#F59E0B' : 'rgba(255,255,255,0.2)' }]}
          />
        ))}
      </View>

      {/* Action buttons — show only when flipped */}
      {flipped && (
        <View style={s.actionRow}>
          <TouchableOpacity style={s.reviewBtn} onPress={handleReview} activeOpacity={0.85}>
            <Text style={s.reviewTxt}>🔁 Tekrar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.knownBtn} onPress={handleKnown} activeOpacity={0.85}>
            <Text style={s.knownTxt}>✓ Biliyorum</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={s.cardCount}>{currentIdx + 1} / {sessionQueue.length}</Text>
    </SafeAreaView>
  )
}

const BG = '#0A0F1F'
const ACCENT = '#40C8F0'

const s = StyleSheet.create({
  root:         { flex: 1, backgroundColor: BG },
  exit:         { position: 'absolute', top: 52, right: 20, zIndex: 10, padding: 8 },
  exitTxt:      { color: 'rgba(255,255,255,0.45)', fontSize: 18 },
  topBar:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 56, paddingHorizontal: 20, marginBottom: 10 },
  label:        { color: ACCENT, fontSize: 15, fontWeight: '700' },
  progTxt:      { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
  progressBg:   { height: 3, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 20, marginBottom: 24, borderRadius: 2 },
  progressFill: { height: 3, backgroundColor: '#00C853', borderRadius: 2 },
  cardContainer:{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  cardTouchable:{ width: '100%', aspectRatio: 0.75, maxHeight: 380 },
  cardSide:     { position: 'absolute', width: '100%', height: '100%', borderRadius: 24, padding: 28, backfaceVisibility: 'hidden', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
  cardFront:    { backgroundColor: '#0F1A35', borderWidth: 1.5, borderColor: 'rgba(64,200,240,0.3)' },
  cardBack:     { backgroundColor: '#162845', borderWidth: 1.5, borderColor: 'rgba(0,200,83,0.4)' },
  cardSubj:     { color: ACCENT, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 20 },
  cardQ:        { color: '#FFFFFF', fontSize: 20, fontWeight: '700', lineHeight: 30, textAlign: 'center', marginBottom: 24 },
  tapHint:      { color: 'rgba(255,255,255,0.3)', fontSize: 12 },
  cardSubjBack: { color: '#00C853', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 20 },
  cardA:        { color: '#E8F4F8', fontSize: 16, lineHeight: 26, textAlign: 'center' },
  statusRow:    { flexDirection: 'row', justifyContent: 'center', gap: 6, marginVertical: 12 },
  statusDot:    { width: 8, height: 8, borderRadius: 4, opacity: 0.4 },
  statusDotActive:{ opacity: 1 },
  actionRow:    { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 8 },
  reviewBtn:    { flex: 1, backgroundColor: 'rgba(245,158,11,0.15)', borderRadius: 16, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(245,158,11,0.4)' },
  reviewTxt:    { color: '#F59E0B', fontSize: 15, fontWeight: '700' },
  knownBtn:     { flex: 1, backgroundColor: '#00C853', borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  knownTxt:     { color: '#0A0F1F', fontSize: 15, fontWeight: '800' },
  cardCount:    { textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 12, marginBottom: 20 },
  // Result
  centerWrap:   { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emoji:        { fontSize: 64, marginBottom: 16 },
  resTitle:     { color: '#FFFFFF', fontSize: 24, fontWeight: '800', marginBottom: 24 },
  statsRow:     { flexDirection: 'row', gap: 24, marginBottom: 20 },
  stat:         { alignItems: 'center', backgroundColor: '#0F1A35', borderRadius: 14, padding: 18, width: 110 },
  statNum:      { fontSize: 36, fontWeight: '900', marginBottom: 4 },
  statLbl:      { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
  xpTxt:        { color: '#FFD700', fontSize: 22, fontWeight: '800', marginBottom: 32 },
  btn:          { backgroundColor: ACCENT, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 48 },
  btnTxt:       { color: '#0A0F1F', fontSize: 16, fontWeight: '800' },
})
