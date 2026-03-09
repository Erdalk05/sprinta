/**
 * HataliCumleScreen — Hatalı Cümle Avcısı
 * Dil bilgisi hatalı cümleyi bul, 4 şık, 20 tur
 */
import React, { useState, useCallback, useRef } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView,
} from 'react-native'
import Animated, { useSharedValue, withSequence, withTiming, useAnimatedStyle } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'

interface Props { onExit: () => void }

interface Item {
  question: string     // Soru metni
  opts: string[]       // 4 cümle seçeneği
  correct: number      // Hangi şık DOĞRU (hatasız)
  error: number        // Hangi şıkta hata var (kullanıcının bulması gereken HATALI şık)
  explanation: string
}

// Her soruda hangi şık HATALI (kullanıcı bunu seçmeli)
const QUESTIONS: Item[] = [
  {
    question: 'Aşağıdaki cümlelerin hangisinde dil bilgisi hatası vardır?',
    opts: ['Öğrenciler yarın okula gidecek.', 'Ben dün kitabı okudu.', 'Hava bugün çok güzel.', 'Ali ve Veli okula gitti.'],
    correct: 0, error: 1,
    explanation: '"Ben" için "okudu" değil "okudum" kullanılmalıdır.',
  },
  {
    question: 'Hangi cümlede yanlış bir kullanım vardır?',
    opts: ['Kitapları rafına koy.', 'Annem çarşıya gitti.', 'Çocuklar bahçede oynuyor.', 'O adam konuşuyor çok.'],
    correct: 0, error: 3,
    explanation: 'Türkçe\'de fiil cümle sonuna gelir: "O adam çok konuşuyor."',
  },
  {
    question: 'Aşağıdaki cümlelerden hangisinde yazım yanlışı vardır?',
    opts: ['Türkiye\'nin başkenti Ankara\'dır.', 'Fen bilimleri çok zevklidir.', 'Hava yarin çok sıcak olacak.', 'Matematiği seviyorum.'],
    correct: 0, error: 2,
    explanation: '"yarın" sözcüğü yanlış yazılmıştır.',
  },
  {
    question: 'Hangi cümle özne-yüklem uyumsuzluğu içermektedir?',
    opts: ['Çocuklar uyuyor.', 'Ayşe koşuyor.', 'Öğrenciler derse geliyor.', 'Kuşlar uçuyor.'],
    correct: 0, error: -1,
    explanation: 'Tüm cümleler doğrudur. (Zorluk sorusu)',
  },
  {
    question: 'Hangi cümlede bağlaç yanlış kullanılmıştır?',
    opts: ['Ali hem akıllı hem de çalışkan.', 'O kitap okudu ya da film izledi.', 'Yağmur yağdı fakat şemsiye açmadı.', 'Hem yorgun hem de mutlu.'],
    correct: 3, error: 1,
    explanation: '"ya da" bağlacı seçenek bağlacıdır; burada "veya" da kullanılabilir ancak "ya da" doğru.',
  },
  {
    question: 'Aşağıdaki cümlelerden hangisi yanlış noktalama içermektedir?',
    opts: ['Bugün hava çok güzeldi.', 'Merhaba nasılsın,', 'Ali koştu ve yoruldu.', 'Ödev yapıldı mı?'],
    correct: 0, error: 1,
    explanation: '"Merhaba nasılsın," — virgül değil soru işareti gelmelidir: "Merhaba, nasılsın?"',
  },
  {
    question: 'Hangi cümlede fiil çekimi yanlıştır?',
    opts: ['Siz yarın geleceksiniz.', 'O dün gelmiş.', 'Ben her gün koşerim.', 'Biz çalışıyoruz.'],
    correct: 0, error: 2,
    explanation: '"koşerim" yerine "koşarım" yazılmalıdır.',
  },
  {
    question: 'Aşağıdaki cümlelerden hangisinde ad tamlaması yanlış kurulmuştur?',
    opts: ['Türkiye\'nin başkenti', 'Okulun bahçesi', 'Annemin çantası', 'Arabanın hız'],
    correct: 0, error: 3,
    explanation: '"arabanın hızı" olmalıdır — iyelik eki eksik.',
  },
  {
    question: 'Hangi cümlede olumsuzluk yanlış kurulmuştur?',
    opts: ['Gitmedim.', 'Okumuyorum.', 'Gelmedik.', 'Bakınmıyor.'],
    correct: 0, error: 3,
    explanation: '"bakmıyor" yerine "bakınmıyor" — anlamsız; doğru form "bakmıyor"dur.',
  },
  {
    question: 'Aşağıdaki cümlelerden hangisinde sıfat yanlış kullanılmıştır?',
    opts: ['Güzel bir ev', 'Büyük bir araba', 'Çok uzun yol', 'Kırmızı çiçekler'],
    correct: 0, error: 2,
    explanation: '"Çok uzun yol" — belirsizlik artikelı eksik ya da "çok uzun bir yol" olmalı.',
  },
  {
    question: 'Hangi cümlede anlatım bozukluğu vardır?',
    opts: ['Güneş doğudan doğar.', 'Herkesin bir evi vardır.', 'Bu problem çok zordu.', 'Hepimiz gülüp güldük.'],
    correct: 0, error: 3,
    explanation: '"Gülüp güldük" anlam yinelemesi içermektedir.',
  },
  {
    question: 'Aşağıdaki cümlelerden hangisinde ekfiil yanlış kullanılmıştır?',
    opts: ['O çalışkandır.', 'Ben öğrenciyim.', 'Siz doktordur.', 'Biz mutluyuz.'],
    correct: 0, error: 2,
    explanation: '"Siz doktordur" değil "Siz doktorsunuz" olmalıdır.',
  },
  {
    question: 'Hangi sözcük yanlış heceleme ile ayrılmıştır?',
    opts: ['Ar-ka-daş', 'Ka-le-m', 'Ka-lem', 'Dost-luk'],
    correct: 2, error: 1,
    explanation: '"Ka-le-m" yanlış — "ka-lem" doğru bölünüştür.',
  },
  {
    question: 'Aşağıdaki cümlelerden hangisinde gereksiz sözcük kullanılmıştır?',
    opts: ['Eve gittim.', 'Hep her zaman çalışırım.', 'Yarın geleceğim.', 'Bugün hava soğuk.'],
    correct: 0, error: 1,
    explanation: '"Hep her zaman" yinelemedir — ikisinden biri yeterlidir.',
  },
  {
    question: 'Hangi cümlede iyelik eki yanlış kullanılmıştır?',
    opts: ['Benim arabam', 'Senin kitabın', 'Onun evisi', 'Bizim okulumuz'],
    correct: 0, error: 2,
    explanation: '"Evisi" yanlış — "evi" olmalıdır.',
  },
  {
    question: 'Aşağıdaki cümlelerden hangisinde bağlaç gereksiz kullanılmıştır?',
    opts: ['Hem güzel hem zarif.', 'Ama fakat gelmedi.', 'Ya bu ya şu.', 'Ne o ne bu.'],
    correct: 0, error: 1,
    explanation: '"Ama fakat" yinelemesidir — ikisinden biri yeterlidir.',
  },
  {
    question: 'Hangi cümlede yüklem eksikliği vardır?',
    opts: ['Ali okula gitti.', 'Güzel çiçekler.', 'Hava bugün sıcak.', 'Çocuk ağlıyor.'],
    correct: 0, error: 1,
    explanation: '"Güzel çiçekler" yüklemsiz bir ifadedir.',
  },
  {
    question: 'Aşağıdaki cümlelerden hangisinde zaman uyumsuzluğu vardır?',
    opts: ['Dün geldim, bugün gidiyorum.', 'Yarın gidecektim.', 'Sabah kalktı, akşam uyudu.', 'Şimdi yiyorum, az sonra içeceğim.'],
    correct: 0, error: 1,
    explanation: '"Yarın gidecektim" — "yarın" geleceği, "-ecektim" geçmişteki niyeti anlatır; anlam bozukluğu var.',
  },
  {
    question: 'Hangi cümlede sözcük yanlış anlamda kullanılmıştır?',
    opts: ['Kitabı raflara dizdim.', 'Soğuktan dolayı üşüdüm.', 'Sevinçten güldüm.', 'Ağladım çünkü mutluydum.'],
    correct: 0, error: 3,
    explanation: '"Ağladım çünkü mutluydum" — Türkçe anlatımda sebebi verilen duygu ile eylem çelişmektedir; anlam bozukluğu.',
  },
  {
    question: 'Aşağıdakilerin hangisinde özne belirtisizdir?',
    opts: ['Öğretmen geldi.', 'Ali uyudu.', 'Kitap okundu.', 'Ayşe güldü.'],
    correct: 0, error: 2,
    explanation: '"Kitap okundu" — edilgen çatılıdır; yapan belli değildir (özne belirsiz/yok).',
  },
]

type Phase = 'quiz' | 'result'

export default function HataliCumleScreen({ onExit }: Props) {
  const { student } = useAuthStore()
  const [phase, setPhase] = useState<Phase>('quiz')
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [correct, setCorrect] = useState(0)
  const [wrong, setWrong] = useState(0)

  const shakeX = useSharedValue(0)
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shakeX.value }] }))

  const q = QUESTIONS[currentIdx]

  const handleSelect = useCallback((optIdx: number) => {
    if (showFeedback) return
    setSelected(optIdx)
    const isCorrect = optIdx === q.error
    if (isCorrect) {
      setCorrect(c => c + 1)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    } else {
      setWrong(w => w + 1)
      shakeX.value = withSequence(
        withTiming(-8, { duration: 60 }),
        withTiming(8, { duration: 60 }),
        withTiming(-8, { duration: 60 }),
        withTiming(0, { duration: 60 }),
      )
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }
    setShowFeedback(true)
    setTimeout(() => {
      setShowFeedback(false)
      setSelected(null)
      if (currentIdx + 1 >= QUESTIONS.length) {
        setPhase('result')
      } else {
        setCurrentIdx(i => i + 1)
      }
    }, 1400)
  }, [showFeedback, q, currentIdx, shakeX])

  const handleFinish = useCallback(async () => {
    if (student?.id) {
      try {
        await (supabase as any).from('reading_mode_sessions').insert({
          student_id:   student.id,
          mode:         'hatali_cumle',
          avg_wpm:      0,
          total_words:  0,
          duration_sec: QUESTIONS.length * 15,
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
          <Text style={s.emoji}>{correct >= 16 ? '🏆' : correct >= 10 ? '👏' : '💪'}</Text>
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
        <Text style={s.label}>🔎 Hatalı Cümle Avcısı</Text>
        <Text style={s.prog}>{currentIdx + 1}/{QUESTIONS.length}</Text>
      </View>

      {/* Score chips */}
      <View style={s.scoreRow}>
        <View style={s.chip}><Text style={[s.chipTxt, { color: '#00C853' }]}>✓ {correct}</Text></View>
        <View style={s.chip}><Text style={[s.chipTxt, { color: '#EF4444' }]}>✗ {wrong}</Text></View>
      </View>

      <ScrollView contentContainerStyle={s.cont}>
        <Animated.View style={shakeStyle}>
          <View style={s.qCard}>
            <Text style={s.qTxt}>{q.question}</Text>
          </View>

          {q.opts.map((opt, oi) => {
            let style = s.optBtn
            if (showFeedback) {
              if (oi === q.error) Object.assign(style, s.optCorrect)
              else if (oi === selected && oi !== q.error) Object.assign(style, s.optWrong)
            } else if (selected === oi) {
              Object.assign(style, s.optSelected)
            }
            return (
              <TouchableOpacity
                key={oi}
                style={[
                  s.optBtn,
                  !showFeedback && selected === oi && s.optSelected,
                  showFeedback && oi === q.error && s.optCorrect,
                  showFeedback && oi === selected && oi !== q.error && s.optWrong,
                ]}
                onPress={() => handleSelect(oi)}
                activeOpacity={0.8}
              >
                <Text style={s.optLetter}>{String.fromCharCode(65 + oi)}</Text>
                <Text style={s.optTxt}>{opt}</Text>
              </TouchableOpacity>
            )
          })}

          {showFeedback && (
            <View style={s.expBox}>
              <Text style={s.expTxt}>💡 {q.explanation}</Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  )
}

const BG = '#0A0F1F'
const ACCENT = '#40C8F0'

const s = StyleSheet.create({
  root:      { flex: 1, backgroundColor: BG },
  exit:      { position: 'absolute', top: 52, right: 20, zIndex: 10, padding: 8 },
  exitTxt:   { color: 'rgba(255,255,255,0.45)', fontSize: 18 },
  topBar:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 56, paddingHorizontal: 20, marginBottom: 12 },
  label:     { color: ACCENT, fontSize: 15, fontWeight: '700' },
  prog:      { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
  scoreRow:  { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 16 },
  chip:      { backgroundColor: '#0F1A35', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5 },
  chipTxt:   { fontSize: 14, fontWeight: '800' },
  cont:      { paddingHorizontal: 20, paddingBottom: 40 },
  qCard:     { backgroundColor: '#0F1A35', borderRadius: 16, padding: 18, marginBottom: 16, borderLeftWidth: 3, borderLeftColor: '#F59E0B' },
  qTxt:      { color: '#FFFFFF', fontSize: 15, fontWeight: '600', lineHeight: 24 },
  optBtn:    { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#0F1A35', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(64,200,240,0.2)', padding: 14, marginBottom: 10 },
  optSelected:{ borderColor: ACCENT, backgroundColor: 'rgba(64,200,240,0.12)' },
  optCorrect: { borderColor: '#00C853', backgroundColor: 'rgba(0,200,83,0.15)' },
  optWrong:   { borderColor: '#EF4444', backgroundColor: 'rgba(239,68,68,0.15)' },
  optLetter: { color: ACCENT, fontSize: 14, fontWeight: '800', marginRight: 10, minWidth: 20 },
  optTxt:    { color: 'rgba(255,255,255,0.85)', fontSize: 14, flex: 1, lineHeight: 20 },
  expBox:    { backgroundColor: 'rgba(245,158,11,0.12)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(245,158,11,0.4)', padding: 14, marginTop: 4 },
  expTxt:    { color: '#F59E0B', fontSize: 13, lineHeight: 20 },
  // Result
  centerWrap:{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emoji:     { fontSize: 64, marginBottom: 16 },
  resTitle:  { color: '#FFFFFF', fontSize: 24, fontWeight: '800', marginBottom: 24 },
  statsRow:  { flexDirection: 'row', gap: 24, marginBottom: 20 },
  stat:      { alignItems: 'center', backgroundColor: '#0F1A35', borderRadius: 14, padding: 18, width: 100 },
  statNum:   { fontSize: 36, fontWeight: '900', marginBottom: 4 },
  statLbl:   { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
  xpTxt:     { color: '#FFD700', fontSize: 22, fontWeight: '800', marginBottom: 32 },
  btn:       { backgroundColor: ACCENT, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 48 },
  btnTxt:    { color: '#0A0F1F', fontSize: 16, fontWeight: '800' },
})
