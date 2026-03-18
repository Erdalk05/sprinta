/**
 * PoetryAnalysisScreen — AYT Türk Edebiyatı Şiir Analizi
 * 5 klasik/modern şiir → anlama + edebi sanat soruları
 */
import React, { useState, useCallback } from 'react'
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
  answer: number
  explanation: string
}

interface Poem {
  title: string
  poet: string
  era: string
  lines: string[]
  questions: Question[]
}

const POEMS: Poem[] = [
  {
    title: 'Ağrı Dağı',
    poet: 'Ahmet Hamdi Tanpınar',
    era: 'Cumhuriyet Dönemi',
    lines: [
      'Uzak ve yakın, karanlık ve aydınlık,',
      'Her şey bir seste toplandı bu seste.',
      'Ben de uzaktan sana baktım, dağ,',
      'Hem sana hem de kendime baktım.',
    ],
    questions: [
      {
        q: 'Şiirde "uzak ve yakın" ifadesiyle hangi edebi sanat kullanılmıştır?',
        opts: ['Benzetme', 'Tezat (Antitez)', 'Kişileştirme', 'Abartma'],
        answer: 1,
        explanation: '"Uzak ve yakın" birbirine karşıt kavramları bir arada kullanma, yani tezat (antitez) sanatıdır.',
      },
      {
        q: '"Ben de uzaktan sana baktım, dağ" dizesinde şair dağa sesleniyor. Bu hangi edebi sanata örnektir?',
        opts: ['İstiare', 'Teşbih', 'Nida (Seslenme)', 'Tenasüp'],
        answer: 2,
        explanation: 'Cansız bir varlığa (dağa) doğrudan seslenme, nida (seslenme) sanatıdır.',
      },
    ],
  },
  {
    title: 'Kaldırımlar',
    poet: 'Necip Fazıl Kısakürek',
    era: 'Cumhuriyet Dönemi',
    lines: [
      'Kaldırımlar, ıslak kaldırımlar,',
      'İçimde kalmış bir kor, bir ateş.',
      'Gece yarısı ıslak sokaklarda,',
      'Kalbimin sesi gelir uzaktan.',
    ],
    questions: [
      {
        q: '"İçimde kalmış bir kor, bir ateş" dizesinde hangi edebi sanat kullanılmıştır?',
        opts: ['Aliterasyon', 'Teşbih-i beliğ', 'Mübalağa', 'Kinaye'],
        answer: 1,
        explanation: '"Bir kor, bir ateş" ifadesi benzeyeni (şairin iç dünyasını) ve benzetileni (kor, ateş) bir arada vererek teşbih-i beliğ oluşturur.',
      },
      {
        q: 'Şiirde "kaldırımlar" kelimesinin tekrarı hangi amaçla kullanılmıştır?',
        opts: ['Ölçüyü düzeltmek için', 'Ritim ve vurgu oluşturmak için', 'Uyak sağlamak için', 'Anlam genişletmek için'],
        answer: 1,
        explanation: 'Sözcük tekrarı (tekrir) ritim oluşturur ve söz konusu nesnenin şiirdeki ağırlığını pekiştirir.',
      },
    ],
  },
  {
    title: 'Garip',
    poet: 'Orhan Veli Kanık',
    era: 'I. Yeni (Garip)',
    lines: [
      'Ben garip çektim, sen garip çektin,',
      'İkimiz de garip çektik.',
      'Ama nasıl da güzeldi',
      'Beraber çekilmiş o garipler.',
    ],
    questions: [
      {
        q: 'Orhan Veli\'nin "Garip" şiiri hangi akıma aittir?',
        opts: ['Hece Şiiri', 'Divan Şiiri', 'Garip (I. Yeni)', 'İkinci Yeni'],
        answer: 2,
        explanation: 'Orhan Veli, Melih Cevdet ve Oktay Rifat 1941\'de Garip akımını başlattı; şiir seçkin olmayan günlük dile yöneldi.',
      },
      {
        q: '"Ben garip çektim, sen garip çektin" dizesinde "garip" sözcüğü hangi anlamda kullanılmıştır?',
        opts: ['Tuhaf, garip', 'Yoksulluk, sıkıntı', 'Yabancı, gurbet', 'Ağlama, hüzün'],
        answer: 1,
        explanation: 'Şiirdeki bağlamda "garip çekmek", maddi sıkıntı ve yoksulluk çekmek anlamında kullanılmıştır.',
      },
    ],
  },
  {
    title: 'Saatleri Ayarlama Enstitüsü',
    poet: 'Ahmet Hamdi Tanpınar',
    era: 'Roman / Şiir',
    lines: [
      'Ne içindeyim zamanın,',
      'Ne de büsbütün dışında;',
      'Yekpare, geniş bir anın',
      'Parçalanmaz akışında.',
    ],
    questions: [
      {
        q: '"Yekpare, geniş bir anın / Parçalanmaz akışında" dizeleri hangi temayı işler?',
        opts: ['Ölüm ve yas', 'Zaman algısı ve süreklilik', 'Savaş ve acı', 'Aşk ve özlem'],
        answer: 1,
        explanation: 'Tanpınar bu dizede zamanın bütünleşik akışını, geçmiş-şimdi-gelecek ayrımını aşan bir süreklilik anlayışını işler.',
      },
      {
        q: '"Ne içindeyim zamanın, / Ne de büsbütün dışında" dizeleri hangi anlatım biçimini yansıtır?',
        opts: ['Betimleyici anlatım', 'Dışavurumcu lirizm', 'Didaktik anlatım', 'Epik anlatım'],
        answer: 1,
        explanation: 'Şair kendi iç dünyasını ve öznel zaman deneyimini aktardığından dışavurumcu lirik bir anlatım söz konusudur.',
      },
    ],
  },
  {
    title: 'Çöle İnen Nur',
    poet: 'Mehmet Akif Ersoy',
    era: 'Milli Edebiyat',
    lines: [
      'Doğrudan doğruya Kuran\'dan alıp ilhamı,',
      'Asrın idrakine söyletmeliyiz İslam\'ı.',
      'Kuru dağlarda esen bir rüzgar gibi geliyor,',
      'Safahat\'ın sesi yüksekten alçağa siliyor.',
    ],
    questions: [
      {
        q: 'Mehmet Akif Ersoy\'un şiirlerinin toplandığı eser aşağıdakilerden hangisidir?',
        opts: ['Harname', 'Safahat', 'Kendi Gök Kubbemiz', 'Türkçe Şiirler'],
        answer: 1,
        explanation: 'Mehmet Akif Ersoy\'un tüm şiirlerini bir araya getiren eser "Safahat"tır (7 kitap).',
      },
      {
        q: '"Kuru dağlarda esen bir rüzgar gibi geliyor" dizesinde ne tür bir benzetme yapılmıştır?',
        opts: ['Teşbih-i müfret', 'Teşbih-i beliğ', 'Teşbih-i mufassal', 'Temsil'],
        answer: 2,
        explanation: 'Benzeyen, kendine benzetilen, benzetme yönü ve benzetme edatı (gibi) hepsi mevcuttur — bu ayrıntılı (mufassal) benzetmedir.',
      },
    ],
  },
]

type Phase = 'read' | 'quiz' | 'result'

export default function PoetryAnalysisScreen({ onExit }: Props) {
  const { student } = useAuthStore()
  const [poemIdx,    setPoemIdx]    = useState(0)
  const [phase,      setPhase]      = useState<Phase>('read')
  const [qIdx,       setQIdx]       = useState(0)
  const [selected,   setSelected]   = useState<number | null>(null)
  const [totalScore, setTotalScore] = useState(0)
  const [answered,   setAnswered]   = useState(0)
  const [showExp,    setShowExp]    = useState(false)

  const poem = POEMS[poemIdx]
  const question = poem.questions[qIdx]
  const totalQuestions = POEMS.reduce((s, p) => s + p.questions.length, 0)

  const handleOptionPress = useCallback((idx: number) => {
    if (selected !== null) return
    setSelected(idx)
    setShowExp(true)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }, [selected])

  const handleNext = useCallback(async () => {
    const isCorrect = selected === question.answer
    const newScore  = totalScore + (isCorrect ? 1 : 0)
    const newAnswered = answered + 1

    setTotalScore(newScore)
    setAnswered(newAnswered)

    const nextQIdx = qIdx + 1
    if (nextQIdx < poem.questions.length) {
      setQIdx(nextQIdx)
      setSelected(null)
      setShowExp(false)
      return
    }

    const nextPoemIdx = poemIdx + 1
    if (nextPoemIdx < POEMS.length) {
      setPoemIdx(nextPoemIdx)
      setQIdx(0)
      setSelected(null)
      setShowExp(false)
      setPhase('read')
      return
    }

    // Tüm şiirler bitti — kaydet
    if (student?.id) {
      try {
        await (supabase as any).from('reading_mode_sessions').insert({
          student_id:   student.id,
          mode:         'poetry_analysis',
          avg_wpm:      0,
          total_words:  POEMS.reduce((s, p) => s + p.lines.join(' ').split(' ').length, 0),
          duration_sec: POEMS.length * 90,
          arp_score:    newScore * 5,
          xp_earned:    newScore * 20,
          completion:   1,
        })
      } catch { /* sessiz */ }
    }
    setPhase('result')
  }, [selected, question, qIdx, poem, poemIdx, totalScore, answered, student])

  // ── Result Screen ──────────────────────────────────────────────
  if (phase === 'result') {
    const pct = Math.round((totalScore / totalQuestions) * 100)
    return (
      <SafeAreaView style={s.root}>
        <View style={s.centerWrap}>
          <Text style={s.emoji}>{pct >= 80 ? '🏆' : pct >= 60 ? '📜' : '💪'}</Text>
          <Text style={s.resTitle}>Şiir Analizi Tamamlandı!</Text>
          <Text style={s.resScore}>{totalScore} / {totalQuestions} Doğru</Text>
          <Text style={s.resPct}>Başarı: %{pct}</Text>
          <Text style={s.resXp}>+{totalScore * 20} XP</Text>
          <TouchableOpacity style={s.btn} onPress={onExit} activeOpacity={0.85}>
            <Text style={s.btnTxt}>Bitir</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  // ── Reading Phase ──────────────────────────────────────────────
  if (phase === 'read') {
    return (
      <SafeAreaView style={s.root}>
        <TouchableOpacity style={s.exit} onPress={onExit}>
          <Text style={s.exitTxt}>✕</Text>
        </TouchableOpacity>

        <ScrollView contentContainerStyle={s.scroll}>
          <Text style={s.title}>🖊️ Şiir Analizi</Text>
          <Text style={s.progress}>Şiir {poemIdx + 1} / {POEMS.length}</Text>

          <View style={s.poemCard}>
            <View style={s.poemHeader}>
              <Text style={s.poemTitle}>{poem.title}</Text>
              <Text style={s.poemMeta}>{poem.poet} · {poem.era}</Text>
            </View>
            <View style={s.linesWrap}>
              {poem.lines.map((line, i) => (
                <Text key={i} style={s.poemLine}>{line}</Text>
              ))}
            </View>
          </View>

          <Text style={s.readHint}>
            Şiiri dikkatle okuyun, edebi sanatlara ve anlama odaklanın.
          </Text>

          <TouchableOpacity
            style={s.btn}
            onPress={() => { setPhase('quiz'); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium) }}
            activeOpacity={0.85}
          >
            <Text style={s.btnTxt}>Soruları Yanıtla →</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    )
  }

  // ── Quiz Phase ─────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.root}>
      <TouchableOpacity style={s.exit} onPress={onExit}>
        <Text style={s.exitTxt}>✕</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={s.scroll}>
        <Text style={s.title}>🖊️ Şiir Analizi</Text>
        <Text style={s.progress}>
          Şiir {poemIdx + 1} / {POEMS.length} · Soru {qIdx + 1} / {poem.questions.length}
        </Text>

        {/* Mini şiir gösterimi */}
        <View style={s.miniPoem}>
          {poem.lines.map((line, i) => (
            <Text key={i} style={s.miniLine}>{line}</Text>
          ))}
          <Text style={s.miniMeta}>{poem.poet}</Text>
        </View>

        {/* Soru */}
        <View style={s.qCard}>
          <Text style={s.qText}>{question.q}</Text>
        </View>

        {/* Seçenekler */}
        {question.opts.map((opt, i) => {
          let style = s.optBtn
          if (selected !== null) {
            if (i === question.answer) style = s.optCorrect
            else if (i === selected)  style = s.optWrong
          }
          return (
            <TouchableOpacity
              key={i}
              style={style}
              onPress={() => handleOptionPress(i)}
              activeOpacity={0.8}
              disabled={selected !== null}
            >
              <Text style={s.optLabel}>{String.fromCharCode(65 + i)}.</Text>
              <Text style={s.optTxt}>{opt}</Text>
            </TouchableOpacity>
          )
        })}

        {/* Açıklama */}
        {showExp && (
          <View style={[s.expCard, selected === question.answer ? s.expGreen : s.expRed]}>
            <Text style={s.expTitle}>
              {selected === question.answer ? '✓ Doğru!' : '✗ Yanlış'}
            </Text>
            <Text style={s.expText}>{question.explanation}</Text>
          </View>
        )}

        {selected !== null && (
          <TouchableOpacity style={s.btn} onPress={handleNext} activeOpacity={0.85}>
            <Text style={s.btnTxt}>
              {poemIdx === POEMS.length - 1 && qIdx === poem.questions.length - 1
                ? 'Sonucu Gör'
                : 'Devam'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

// ── Styles ─────────────────────────────────────────────────────
const BG = '#0A1A4A'
const SURFACE = '#1A3594'
const ACCENT = '#4F7FFF'
const GOLD = '#F59E0B'

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: BG },
  scroll:      { paddingHorizontal: 31, paddingVertical: 20, paddingBottom: 40 },
  exit:        { position: 'absolute', top: 52, right: 20, zIndex: 10, padding: 8 },
  exitTxt:     { color: '#fff', fontSize: 18 },
  title:       { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 4 },
  progress:    { color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 16 },

  poemCard:    { backgroundColor: SURFACE, borderRadius: 16, padding: 20, marginBottom: 16,
                 borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  poemHeader:  { marginBottom: 16 },
  poemTitle:   { color: GOLD, fontSize: 18, fontWeight: '700' },
  poemMeta:    { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2 },
  linesWrap:   { gap: 6 },
  poemLine:    { color: '#fff', fontSize: 16, lineHeight: 26, fontStyle: 'italic' },

  readHint:    { color: 'rgba(255,255,255,0.5)', fontSize: 13, textAlign: 'center',
                 marginBottom: 20 },

  miniPoem:    { backgroundColor: SURFACE, borderRadius: 12, padding: 14, marginBottom: 16,
                 borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  miniLine:    { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontStyle: 'italic', lineHeight: 20 },
  miniMeta:    { color: GOLD, fontSize: 11, marginTop: 8 },

  qCard:       { backgroundColor: '#0D2060', borderRadius: 14, padding: 16, marginBottom: 16,
                 borderWidth: 1, borderColor: 'rgba(79,127,255,0.3)' },
  qText:       { color: '#fff', fontSize: 15, lineHeight: 22 },

  optBtn:      { flexDirection: 'row', alignItems: 'center', gap: 10,
                 backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 12,
                 borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
                 padding: 14, marginBottom: 10 },
  optCorrect:  { flexDirection: 'row', alignItems: 'center', gap: 10,
                 backgroundColor: 'rgba(34,197,94,0.2)', borderRadius: 12,
                 borderWidth: 1, borderColor: '#22C55E',
                 padding: 14, marginBottom: 10 },
  optWrong:    { flexDirection: 'row', alignItems: 'center', gap: 10,
                 backgroundColor: 'rgba(239,68,68,0.2)', borderRadius: 12,
                 borderWidth: 1, borderColor: '#EF4444',
                 padding: 14, marginBottom: 10 },
  optLabel:    { color: GOLD, fontWeight: '700', fontSize: 15, width: 20 },
  optTxt:      { color: '#fff', fontSize: 14, flex: 1 },

  expCard:     { borderRadius: 14, padding: 16, marginBottom: 16, marginTop: 4 },
  expGreen:    { backgroundColor: 'rgba(34,197,94,0.15)', borderWidth: 1, borderColor: '#22C55E' },
  expRed:      { backgroundColor: 'rgba(239,68,68,0.15)', borderWidth: 1, borderColor: '#EF4444' },
  expTitle:    { color: '#fff', fontWeight: '700', fontSize: 15, marginBottom: 6 },
  expText:     { color: 'rgba(255,255,255,0.8)', fontSize: 13, lineHeight: 20 },

  btn:         { backgroundColor: ACCENT, borderRadius: 14, paddingVertical: 16,
                 alignItems: 'center', marginTop: 8 },
  btnTxt:      { color: '#fff', fontWeight: '700', fontSize: 16 },

  centerWrap:  { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emoji:       { fontSize: 64, marginBottom: 16 },
  resTitle:    { color: '#fff', fontSize: 24, fontWeight: '700', marginBottom: 8 },
  resScore:    { color: GOLD, fontSize: 20, fontWeight: '700', marginBottom: 4 },
  resPct:      { color: 'rgba(255,255,255,0.6)', fontSize: 16, marginBottom: 8 },
  resXp:       { color: '#22C55E', fontSize: 18, fontWeight: '700', marginBottom: 32 },
})
