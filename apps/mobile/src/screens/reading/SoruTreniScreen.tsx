/**
 * SoruTreniScreen — Soru Treni
 * 40 LGS sorusu, 45dk timer, doğru/yanlış takibi
 */
import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'

interface Props { onExit: () => void }

interface Question {
  q: string
  opts: string[]
  ans: number
  subject: string
}

// Cevap dağılımı dengeli tutulmuştur: A=10, B=10, C=10, D=10
const QUESTIONS: Question[] = [
  // ── Türkçe (8 soru) ───────────────────────────────────────────────────────
  { subject: 'Türkçe', q: '"Kafası karışmak" deyiminin anlamı nedir?', opts: ['Ne yapacağını bilememek', 'Uykusu gelmek', 'Çok yorulmak', 'Hayal kurmak'], ans: 0 },
  { subject: 'Türkçe', q: '"Kesmek" sözcüğünün hangisinde mecaz anlamda kullanılmıştır?', opts: ['Saçını kesti.', 'Ekmeği kesti.', 'Odunu kesti.', 'Sözünü kesti.'], ans: 3 },
  { subject: 'Türkçe', q: '"Yağmur yağmak" cümlesinde "yağmur" sözcüğü hangi ögedir?', opts: ['Nesne', 'Zarf tümleci', 'Özne', 'Yüklem'], ans: 2 },
  { subject: 'Türkçe', q: 'Aşağıdakilerden hangisi sıfat değildir?', opts: ['Güzel', 'Büyük', 'Mavi', 'Koşmak'], ans: 3 },
  { subject: 'Türkçe', q: '"Göz atmak" deyiminin anlamı nedir?', opts: ['Ağlamak', 'Görmezden gelmek', 'Kısaca bakmak', 'Dikkatle incelemek'], ans: 2 },
  { subject: 'Türkçe', q: '"Ne yazık ki" hangi anlam ilişkisini kurar?', opts: ['Sıralama', 'Pekiştirme', 'Sonuç', 'Üzüntü / pişmanlık'], ans: 3 },
  { subject: 'Türkçe', q: 'Aşağıdakilerin hangisi bileşik sözcüktür?', opts: ['Okul', 'Masa', 'Kapı', 'Kahvaltı'], ans: 3 },
  { subject: 'Türkçe', q: '"Zaman geçmek" tamlamasında "zaman" sözcüğü ne işlev üstlenmiştir?', opts: ['Yüklem', 'Nesne', 'Özne', 'Zarf tümleci'], ans: 2 },

  // ── Matematik (8 soru) ────────────────────────────────────────────────────
  { subject: 'Matematik', q: 'Bir sayının %25\'i 15 ise bu sayı kaçtır?', opts: ['45', '55', '70', '60'], ans: 3 },
  { subject: 'Matematik', q: '3 + 5 × 2 - 1 işleminin sonucu nedir?', opts: ['15', '16', '12', '14'], ans: 2 },
  { subject: 'Matematik', q: 'Bir dikdörtgenin uzun kenarı 8 cm, kısa kenarı 5 cm ise çevresi kaç cm\'dir?', opts: ['40', '13', '24', '26'], ans: 3 },
  { subject: 'Matematik', q: 'x + 5 = 12 denkleminde x değeri nedir?', opts: ['5', '8', '17', '7'], ans: 3 },
  { subject: 'Matematik', q: 'Bir üçgenin açıları toplamı kaç derecedir?', opts: ['90°', '270°', '180°', '360°'], ans: 2 },
  { subject: 'Matematik', q: '2³ + 3² = ?', opts: ['13', '19', '15', '17'], ans: 3 },
  { subject: 'Matematik', q: 'Bir çemberin yarıçapı 7 cm ise alanı kaç cm²\'dir? (π≈22/7)', opts: ['44', '88', '22', '154'], ans: 3 },
  { subject: 'Matematik', q: '0.5 + 1/4 = ?', opts: ['1', '0.50', '0.25', '0.75'], ans: 3 },

  // ── Fen Bilimleri (8 soru) ────────────────────────────────────────────────
  { subject: 'Fen Bilimleri', q: 'Işığın madde ile etkileşiminde oluşmayan olay hangisidir?', opts: ['Kırılma', 'Soğurulma', 'Ağırlık', 'Yansıma'], ans: 2 },
  { subject: 'Fen Bilimleri', q: 'Hücrenin enerji merkezi olarak bilinen organel hangisidir?', opts: ['Çekirdek', 'Ribozom', 'Golgi', 'Mitokondri'], ans: 3 },
  { subject: 'Fen Bilimleri', q: 'Klorofil pigmenti hangi organelde bulunur?', opts: ['Kloroplast', 'Mitokondri', 'Ribozom', 'Lizozom'], ans: 0 },
  { subject: 'Fen Bilimleri', q: 'Suyun kimyasal formülü nedir?', opts: ['CO2', 'O2', 'H2O', 'NaCl'], ans: 2 },
  { subject: 'Fen Bilimleri', q: 'Güneş sistemimizdeki en büyük gezegen hangisidir?', opts: ['Satürn', 'Neptün', 'Uranüs', 'Jüpiter'], ans: 3 },
  { subject: 'Fen Bilimleri', q: 'Elektriği ileten maddeler nasıl adlandırılır?', opts: ['Yalıtkan', 'Mıknatıs', 'Yarı iletken', 'İletken'], ans: 3 },
  { subject: 'Fen Bilimleri', q: 'Besinlerin sindirimde emilimi nerede gerçekleşir?', opts: ['Kalın bağırsak', 'Mide', 'İnce bağırsak', 'Karaciğer'], ans: 2 },
  { subject: 'Fen Bilimleri', q: 'Işığın kırılması hangi durumda gözlemlenir?', opts: ['Aynı yoğunlukta ortam', 'Sadece suda', 'Sadece havada', 'Farklı yoğunluklarda'], ans: 3 },

  // ── Sosyal Bilgiler (8 soru) ──────────────────────────────────────────────
  { subject: 'Sosyal Bilgiler', q: 'Türkiye\'nin yüzölçümü yaklaşık kaç km²\'dir?', opts: ['781.000', '580.000', '680.000', '900.000'], ans: 0 },
  { subject: 'Sosyal Bilgiler', q: 'İpek Yolu\'nun başlangıç noktası olarak kabul edilen şehir hangisidir?', opts: ['Bağdat', 'İstanbul', 'Xi\'an (Çin)', 'Semerkant'], ans: 2 },
  { subject: 'Sosyal Bilgiler', q: 'Türkiye\'de en fazla yağış hangi bölgede görülür?', opts: ['Ege', 'Doğu Anadolu', 'Akdeniz', 'Karadeniz'], ans: 3 },
  { subject: 'Sosyal Bilgiler', q: 'Cumhuriyet hangi yılda ilan edilmiştir?', opts: ['1919', '1920', '1925', '1923'], ans: 3 },
  { subject: 'Sosyal Bilgiler', q: 'Türkiye kaç ilde yönetilmektedir?', opts: ['72', '81', '78', '85'], ans: 1 },
  { subject: 'Sosyal Bilgiler', q: 'Türkiye\'nin komşu ülke sayısı kaçtır?', opts: ['6', '9', '8', '7'], ans: 2 },
  { subject: 'Sosyal Bilgiler', q: 'Türkiye\'nin en uzun nehri hangisidir?', opts: ['Dicle', 'Sakarya', 'Fırat', 'Kızılırmak'], ans: 3 },
  { subject: 'Sosyal Bilgiler', q: 'Sanayi Devrimi önce hangi ülkede gerçekleşti?', opts: ['Fransa', 'İngiltere', 'ABD', 'Almanya'], ans: 1 },

  // ── İngilizce (8 soru) ────────────────────────────────────────────────────
  { subject: 'İngilizce', q: 'Which word is a synonym of "happy"?', opts: ['Sad', 'Angry', 'Joyful', 'Tired'], ans: 2 },
  { subject: 'İngilizce', q: 'I ___ a student. (doğru fiili seçin)', opts: ['be', 'are', 'am', 'is'], ans: 2 },
  { subject: 'İngilizce', q: 'What is the plural of "child"?', opts: ['Child', 'Childs', 'Childes', 'Children'], ans: 3 },
  { subject: 'İngilizce', q: 'She ___ to school every day.', opts: ['going', 'gone', 'go', 'goes'], ans: 3 },
  { subject: 'İngilizce', q: '"Big" kelimesinin zıt anlamlısı nedir?', opts: ['Wide', 'Fat', 'Large', 'Small'], ans: 3 },
  { subject: 'İngilizce', q: 'Which tense is used: "She was reading when I called."', opts: ['Present Perfect', 'Future Simple', 'Past Continuous', 'Simple Past'], ans: 2 },
  { subject: 'İngilizce', q: '"However" hangi bağlaç türüdür?', opts: ['Sebep', 'Zaman', 'Amaç', 'Zıtlık/bağlantı zarfı'], ans: 3 },
  { subject: 'İngilizce', q: '"Although" cümlede ne işlev görür?', opts: ['Sonuç bağlacı', 'Zaman bağlacı', 'Zıtlık bağlacı', 'Sebep bağlacı'], ans: 2 },
]

const TOTAL_TIME = 2700  // 45 dakika

type Phase = 'quiz' | 'result'

function pad(n: number) { return String(n).padStart(2, '0') }

export default function SoruTreniScreen({ onExit }: Props) {
  const { student } = useAuthStore()
  const [phase, setPhase] = useState<Phase>('quiz')
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(Array(QUESTIONS.length).fill(null))
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME)
  const [selected, setSelected] = useState<number | null>(null)
  const startMs = useRef(Date.now())

  // Timer
  useEffect(() => {
    if (phase !== 'quiz') return
    const t = setInterval(() => {
      setTimeLeft(tl => {
        if (tl <= 1) { clearInterval(t); setPhase('result'); return 0 }
        return tl - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [phase])

  const handleSelect = useCallback((optIdx: number) => {
    if (answers[currentIdx] !== null) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setSelected(optIdx)
    setAnswers(prev => { const n = [...prev]; n[currentIdx] = optIdx; return n })
  }, [answers, currentIdx])

  const handleNext = useCallback(() => {
    if (currentIdx + 1 >= QUESTIONS.length) {
      setPhase('result')
    } else {
      setCurrentIdx(i => i + 1)
      setSelected(answers[currentIdx + 1])
    }
    Haptics.selectionAsync()
  }, [currentIdx, answers])

  const handlePrev = useCallback(() => {
    if (currentIdx > 0) {
      setCurrentIdx(i => i - 1)
      setSelected(answers[currentIdx - 1])
    }
  }, [currentIdx, answers])

  const handleFinish = useCallback(async () => {
    const correct = answers.filter((a, i) => a === QUESTIONS[i].ans).length
    const duration = Math.round((Date.now() - startMs.current) / 1000)
    if (student?.id) {
      try {
        await (supabase as any).from('reading_mode_sessions').insert({
          student_id:   student.id,
          mode:         'soru_treni',
          avg_wpm:      0,
          total_words:  0,
          duration_sec: duration,
          arp_score:    correct * 2,
          xp_earned:    correct * 5,
          completion:   answers.filter(a => a !== null).length / QUESTIONS.length,
        })
      } catch { /* sessiz */ }
    }
    setPhase('result')
  }, [answers, student])

  if (phase === 'result') {
    const correct = answers.filter((a, i) => a === QUESTIONS[i].ans).length
    const wrong   = answers.filter((a, i) => a !== null && a !== QUESTIONS[i].ans).length
    const blank   = answers.filter(a => a === null).length
    return (
      <SafeAreaView style={s.root}>
        <ScrollView contentContainerStyle={s.resCont}>
          <Text style={s.resEmoji}>🚂</Text>
          <Text style={s.resTitle}>Soru Treni Bitti!</Text>
          <View style={s.statsGrid}>
            <View style={s.statBox}>
              <Text style={[s.statVal, { color: '#00C853' }]}>{correct}</Text>
              <Text style={s.statLabel}>Doğru</Text>
            </View>
            <View style={s.statBox}>
              <Text style={[s.statVal, { color: '#EF4444' }]}>{wrong}</Text>
              <Text style={s.statLabel}>Yanlış</Text>
            </View>
            <View style={s.statBox}>
              <Text style={[s.statVal, { color: '#94A3B8' }]}>{blank}</Text>
              <Text style={s.statLabel}>Boş</Text>
            </View>
          </View>
          <Text style={s.xpText}>+{correct * 5} XP</Text>
          <Text style={s.netText}>Net: {(correct - wrong / 3).toFixed(2)}</Text>
          <TouchableOpacity style={s.doneBtn} onPress={onExit} activeOpacity={0.85}>
            <Text style={s.doneTxt}>Bitir</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    )
  }

  const q = QUESTIONS[currentIdx]
  const mins = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60
  const answered = answers.filter(a => a !== null).length

  return (
    <SafeAreaView style={s.root}>
      <TouchableOpacity style={s.exit} onPress={onExit}>
        <Text style={s.exitTxt}>✕</Text>
      </TouchableOpacity>

      <View style={s.topBar}>
        <View>
          <Text style={s.label}>🚂 Soru Treni</Text>
          <Text style={s.subLabel}>{answered}/{QUESTIONS.length} cevaplandı</Text>
        </View>
        <View style={s.timerBox}>
          <Text style={[s.timerTxt, timeLeft < 300 && s.timerRed]}>{pad(mins)}:{pad(secs)}</Text>
        </View>
      </View>

      {/* Progress */}
      <View style={s.progressBg}>
        <View style={[s.progressFill, { width: `${(answered / QUESTIONS.length) * 100}%` }]} />
      </View>

      <ScrollView contentContainerStyle={s.qCont}>
        {/* Subject tag */}
        <Text style={s.subjTag}>{q.subject} · Soru {currentIdx + 1}/{QUESTIONS.length}</Text>

        <View style={s.qCard}>
          <Text style={s.qTxt}>{q.q}</Text>
        </View>

        {q.opts.map((opt, oi) => (
          <TouchableOpacity
            key={oi}
            style={[
              s.optBtn,
              answers[currentIdx] === oi && s.optSelected,
            ]}
            onPress={() => handleSelect(oi)}
            activeOpacity={0.8}
          >
            <View style={[s.optLetter, answers[currentIdx] === oi && s.optLetterSel]}>
              <Text style={[s.optLetterTxt, answers[currentIdx] === oi && s.optLetterTxtSel]}>
                {String.fromCharCode(65 + oi)}
              </Text>
            </View>
            <Text style={[s.optTxt, answers[currentIdx] === oi && s.optTxtSel]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={s.navRow}>
        <TouchableOpacity
          style={[s.navBtn, currentIdx === 0 && s.navBtnDisabled]}
          onPress={handlePrev}
          disabled={currentIdx === 0}
        >
          <Text style={s.navTxt}>← Geri</Text>
        </TouchableOpacity>
        {currentIdx < QUESTIONS.length - 1 ? (
          <TouchableOpacity style={s.navBtnPrimary} onPress={handleNext}>
            <Text style={s.navTxtPrimary}>İleri →</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={s.navBtnPrimary} onPress={handleFinish}>
            <Text style={s.navTxtPrimary}>Bitir ✓</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  )
}

const BG = '#0A0F1F'
const ACCENT = '#40C8F0'

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: BG },
  exit:        { position: 'absolute', top: 52, right: 20, zIndex: 10, padding: 8 },
  exitTxt:     { color: 'rgba(255,255,255,0.45)', fontSize: 18 },
  topBar:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 56, paddingHorizontal: 20, marginBottom: 10 },
  label:       { color: ACCENT, fontSize: 16, fontWeight: '700' },
  subLabel:    { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 },
  timerBox:    { backgroundColor: '#0F1A35', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(64,200,240,0.3)' },
  timerTxt:    { color: '#FFFFFF', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  timerRed:    { color: '#EF4444' },
  progressBg:  { height: 3, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 20, marginBottom: 16, borderRadius: 2 },
  progressFill:{ height: 3, backgroundColor: ACCENT, borderRadius: 2 },
  qCont:       { paddingHorizontal: 20, paddingBottom: 100 },
  subjTag:     { color: ACCENT, fontSize: 11, fontWeight: '700', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  qCard:       { backgroundColor: '#0F1A35', borderRadius: 16, padding: 18, marginBottom: 16, borderLeftWidth: 3, borderLeftColor: ACCENT },
  qTxt:        { color: '#FFFFFF', fontSize: 16, lineHeight: 26, fontWeight: '600' },
  optBtn:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F1A35', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(64,200,240,0.2)', padding: 14, marginBottom: 10 },
  optSelected: { backgroundColor: 'rgba(64,200,240,0.15)', borderColor: ACCENT },
  optLetter:   { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  optLetterSel:{ backgroundColor: ACCENT },
  optLetterTxt:{ color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '800' },
  optLetterTxtSel:{ color: '#0A0F1F' },
  optTxt:      { color: 'rgba(255,255,255,0.8)', fontSize: 14, flex: 1, lineHeight: 20 },
  optTxtSel:   { color: '#FFFFFF', fontWeight: '600' },
  navRow:      { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', padding: 16, gap: 12, backgroundColor: BG, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  navBtn:      { flex: 1, backgroundColor: '#0F1A35', borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(64,200,240,0.2)' },
  navBtnDisabled:{ opacity: 0.35 },
  navBtnPrimary:{ flex: 1, backgroundColor: ACCENT, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  navTxt:      { color: 'rgba(255,255,255,0.7)', fontSize: 15, fontWeight: '700' },
  navTxtPrimary:{ color: '#0A0F1F', fontSize: 15, fontWeight: '800' },
  // Result
  resCont:     { alignItems: 'center', justifyContent: 'center', flex: 1, padding: 32 },
  resEmoji:    { fontSize: 64, marginBottom: 16 },
  resTitle:    { color: '#FFFFFF', fontSize: 24, fontWeight: '800', marginBottom: 24 },
  statsGrid:   { flexDirection: 'row', gap: 24, marginBottom: 20 },
  statBox:     { alignItems: 'center', backgroundColor: '#0F1A35', borderRadius: 14, padding: 16, width: 88 },
  statVal:     { fontSize: 32, fontWeight: '900', marginBottom: 4 },
  statLabel:   { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
  xpText:      { color: '#FFD700', fontSize: 22, fontWeight: '800', marginBottom: 6 },
  netText:     { color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 32 },
  doneBtn:     { backgroundColor: ACCENT, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 48 },
  doneTxt:     { color: '#0A0F1F', fontSize: 16, fontWeight: '800' },
})
