/**
 * ClozeTestScreen — Cloze Testi
 * İçerik kelimelerini (isim, fiil, sıfat) boşluklar — işlev kelimeleri atlanır.
 * Her boşluk için seçenekler metindeki gerçek kelimelerden otomatik üretilir.
 */
import React, { useState, useCallback, useMemo } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'

interface Props { onExit: () => void }

// ─── Statik geçiş metinleri ────────────────────────────────────────────────

const PASSAGES = [
  {
    title: 'Ormanlar ve Önemi',
    text: 'Ormanlar yeryüzünün yaklaşık üçte birini kaplamakta ve canlı yaşamı için büyük önem taşımaktadır. Dünyada milyonlarca farklı bitki ve hayvan türü ormanlarda yaşamaktadır. Ormanlar aynı zamanda karbondioksiti emerek atmosferi temizlemekte ve iklimi dengelemektedir. Bunun yanı sıra toprak erozyonunu önleyen ormanlar su kaynaklarının korunmasında da önemli bir işlev üstlenmektedir.',
  },
  {
    title: 'Güneş Sistemi',
    text: 'Güneş sistemi sekiz gezegen ve sayısız küçük gökcisininden oluşmaktadır. Güneş sistemimizdeki en büyük gezegen Jüpiter olup gaz yapısıyla diğer gezegenlerden ayrılmaktadır. Dünya ise yaşamı destekleyen tek gezegen olarak bilinmektedir. Gezegenler güneş etrafında elips şeklinde yörüngeler çizerek hareket etmektedir.',
  },
  {
    title: 'Sağlıklı Beslenme',
    text: 'Sağlıklı beslenme vücudun ihtiyaç duyduğu besin ögelerini dengeli biçimde almayı kapsamaktadır. Protein, karbonhidrat ve yağlar temel enerji kaynakları olarak işlev görmektedir. Vitamin ve mineraller ise vücut fonksiyonlarının düzgün çalışması için zorunludur. Düzenli su tüketimi metabolizmanın sağlıklı sürdürülmesinde kritik bir rol oynamaktadır.',
  },
]

// ─── Türkçe işlev kelimeleri (boşluk yapılmayacak) ──────────────────────────

const FUNCTION_WORDS = new Set([
  've', 'ile', 'bir', 'bu', 'şu', 'o', 'da', 'de', 'ki', 'ama', 'ya',
  'veya', 'hem', 'ne', 'mi', 'mu', 'mı', 'mü', 'için', 'gibi', 'kadar',
  'olarak', 'göre', 'daha', 'en', 'çok', 'az', 'bile', 'ancak', 'fakat',
  'ise', 'de', 'da', 'buna', 'ona', 'bunun', 'onun', 'bunlar', 'onlar',
  'ben', 'sen', 'biz', 'siz', 'olan', 'olup', 'lakin', 'yani', 'hem',
  'her', 'hiç', 'bazı', 'hangi', 'nasıl', 'neden', 'çünkü', 'eğer',
])

// ─── İçerik kelimesi mi? ─────────────────────────────────────────────────

function isContentWord(word: string): boolean {
  const clean = word.replace(/[^a-zA-ZçÇğĞıİöÖşŞüÜ]/g, '').toLowerCase()
  return clean.length >= 5 && !FUNCTION_WORDS.has(clean)
}

// ─── Cloze üretici ───────────────────────────────────────────────────────────

interface ClozeWord { word: string; isBlank: boolean; blankIdx: number }
interface BlankItem  { word: string; options: string[]; correctIndex: number }

function buildCloze(text: string, maxBlanks = 5): { parts: ClozeWord[]; blanks: BlankItem[] } {
  const words = text.split(/\s+/)

  // İçerik kelimelerinin indekslerini bul
  const contentIndices = words
    .map((w, i) => isContentWord(w) ? i : -1)
    .filter(i => i >= 0)

  // Eşit aralıklı seçim (maks. maxBlanks boşluk)
  const count = Math.min(maxBlanks, contentIndices.length)
  const step = Math.max(1, Math.floor(contentIndices.length / count))
  const blankSet = new Set<number>()
  for (let b = 0; b < count; b++) blankSet.add(contentIndices[b * step])

  // Metinden temizlenmiş kelimeler (distraktör üretiminde)
  const allClean = words.map(w => w.replace(/[^a-zA-ZçÇğĞıİöÖşŞüÜ]/g, ''))

  let blankIdx = 0
  const blanks: BlankItem[] = []
  const parts: ClozeWord[] = words.map((word, i) => {
    if (!blankSet.has(i)) return { word, isBlank: false, blankIdx: -1 }

    const targetClean = allClean[i].toLowerCase()

    // 3 distraktör: içerik kelimelerinden, hedeften farklı
    const distractors: string[] = []
    let d = 1
    while (distractors.length < 3 && d < words.length * 2) {
      const idx = Math.abs(i + (d % 2 === 0 ? d : -d)) % words.length
      const cand = words[idx]
      const candClean = allClean[idx].toLowerCase()
      if (
        candClean.length >= 4 &&
        candClean !== targetClean &&
        !FUNCTION_WORDS.has(candClean) &&
        !distractors.some(x => x.toLowerCase() === cand.toLowerCase())
      ) {
        distractors.push(cand)
      }
      d++
    }
    // Yeterli distraktör bulunamazsa genel sözcüklerle tamamla
    const fallbacks = ['şekilde', 'ayrıca', 'önemli', 'büyük', 'farklı']
    while (distractors.length < 3) distractors.push(fallbacks[distractors.length] ?? 'diğer')

    // Seçenekleri karıştır
    const opts = [word, ...distractors].sort(() => Math.random() - 0.5)
    const correctIndex = opts.indexOf(word)
    blanks.push({ word, options: opts, correctIndex })

    const idx2 = blankIdx++
    return { word, isBlank: true, blankIdx: idx2 }
  })

  return { parts, blanks }
}

// ─── Bileşen ──────────────────────────────────────────────────────────────

type Phase = 'exercise' | 'result'

export default function ClozeTestScreen({ onExit }: Props) {
  const { student } = useAuthStore()
  const [selected, setSelected] = useState<(number | null)[]>(Array(5).fill(null))
  const [phase, setPhase] = useState<Phase>('exercise')
  const [score, setScore] = useState(0)
  const [activeBlank, setActiveBlank] = useState<number | null>(null)

  const passage = useMemo(() => PASSAGES[Math.floor(Math.random() * PASSAGES.length)], [])
  const { parts, blanks } = useMemo(() => buildCloze(passage.text), [passage])
  const blankCount = blanks.length

  const handleBlankTap = useCallback((idx: number) => {
    setActiveBlank(idx)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }, [])

  const handleOption = useCallback((blankIdx: number, optIdx: number) => {
    setSelected(prev => {
      const next = [...prev]
      next[blankIdx] = optIdx
      return next
    })
    setActiveBlank(null)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }, [])

  const handleSubmit = useCallback(async () => {
    let s = 0
    for (let i = 0; i < blankCount; i++) {
      if (selected[i] === blanks[i].correctIndex) s++
    }
    setScore(s)
    if (student?.id) {
      try {
        await (supabase as any).from('reading_mode_sessions').insert({
          student_id:   student.id,
          mode:         'cloze_test',
          avg_wpm:      0,
          total_words:  passage.text.split(' ').length,
          duration_sec: 120,
          arp_score:    s * 4,
          xp_earned:    s * 15,
          completion:   1,
        })
      } catch { /* sessiz */ }
    }
    setPhase('result')
  }, [selected, blankCount, blanks, passage, student])

  if (phase === 'result') {
    return (
      <SafeAreaView style={s.root}>
        <View style={s.centerWrap}>
          <Text style={s.emoji}>{score >= blankCount - 1 ? '🏆' : score >= blankCount / 2 ? '👏' : '💪'}</Text>
          <Text style={s.resTitle}>Cloze Tamamlandı!</Text>
          <Text style={s.resScore}>{score} / {blankCount} Doğru</Text>
          <Text style={s.resXp}>+{score * 15} XP</Text>
          <TouchableOpacity style={s.btn} onPress={onExit} activeOpacity={0.85}>
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

      <ScrollView contentContainerStyle={s.scroll}>
        <Text style={s.title}>📝 Cloze Testi</Text>
        <Text style={s.sub}>{passage.title} — boşlukları doldurun</Text>

        {/* Inline text with blanks */}
        <View style={s.textCard}>
          <View style={s.inlineWrap}>
            {parts.map((p, i) => {
              if (!p.isBlank) {
                return <Text key={i} style={s.word}>{p.word} </Text>
              }
              const sel = selected[p.blankIdx]
              const isFilled = sel !== null
              return (
                <TouchableOpacity
                  key={i}
                  style={[s.blank, isFilled && s.blankFilled, activeBlank === p.blankIdx && s.blankActive]}
                  onPress={() => handleBlankTap(p.blankIdx)}
                >
                  <Text style={[s.blankTxt, isFilled && s.blankTxtFilled]}>
                    {isFilled ? blanks[p.blankIdx].options[sel] : '___'}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        {/* Option panel */}
        {activeBlank !== null && activeBlank < blankCount && (
          <View style={s.optPanel}>
            <Text style={s.optPanelTitle}>Boşluk {activeBlank + 1} için seçeneğiniz:</Text>
            {blanks[activeBlank].options.map((opt, oi) => (
              <TouchableOpacity
                key={oi}
                style={[s.optBtn, selected[activeBlank] === oi && s.optSelected]}
                onPress={() => handleOption(activeBlank, oi)}
                activeOpacity={0.8}
              >
                <Text style={[s.optTxt, selected[activeBlank] === oi && s.optTxtSel]}>
                  {String.fromCharCode(65 + oi)}. {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={[s.submitBtn, selected.slice(0, blankCount).every(a => a !== null) && s.submitActive]}
          onPress={handleSubmit}
          disabled={!selected.slice(0, blankCount).every(a => a !== null)}
          activeOpacity={0.85}
        >
          <Text style={s.submitTxt}>Teslim Et →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const BG = '#0A0F1F'
const ACCENT = '#40C8F0'

const s = StyleSheet.create({
  root:         { flex: 1, backgroundColor: BG },
  exit:         { position: 'absolute', top: 52, right: 20, zIndex: 10, padding: 8 },
  exitTxt:      { color: 'rgba(255,255,255,0.45)', fontSize: 18 },
  scroll:       { paddingHorizontal: 31, paddingTop: 60, paddingBottom: 40 },
  title:        { color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginBottom: 4 },
  sub:          { color: ACCENT, fontSize: 13, marginBottom: 24 },
  textCard:     { backgroundColor: '#0F1A35', borderRadius: 18, padding: 18, marginBottom: 20 },
  inlineWrap:   { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 2 },
  word:         { color: '#E8F4F8', fontSize: 16, lineHeight: 30 },
  blank:        { backgroundColor: 'rgba(64,200,240,0.12)', borderRadius: 6, borderWidth: 1.5, borderColor: 'rgba(64,200,240,0.4)', paddingHorizontal: 8, paddingVertical: 3, marginHorizontal: 2, marginVertical: 4 },
  blankFilled:  { backgroundColor: 'rgba(0,200,83,0.15)', borderColor: '#00C853' },
  blankActive:  { backgroundColor: 'rgba(64,200,240,0.25)', borderColor: ACCENT },
  blankTxt:     { color: 'rgba(255,255,255,0.5)', fontSize: 15, fontWeight: '600' },
  blankTxtFilled: { color: '#00C853' },
  optPanel:     { backgroundColor: '#0F1A35', borderRadius: 16, padding: 16, marginBottom: 16 },
  optPanelTitle: { color: ACCENT, fontSize: 13, fontWeight: '700', marginBottom: 10 },
  optBtn:       { borderRadius: 12, borderWidth: 1, borderColor: 'rgba(64,200,240,0.2)', padding: 12, marginBottom: 8 },
  optSelected:  { backgroundColor: 'rgba(0,200,83,0.15)', borderColor: '#00C853' },
  optTxt:       { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  optTxtSel:    { color: '#00C853', fontWeight: '700' },
  submitBtn:    { backgroundColor: 'rgba(64,200,240,0.15)', borderRadius: 16, paddingVertical: 16, alignItems: 'center', borderWidth: 1.5, borderColor: 'rgba(64,200,240,0.3)', marginTop: 8 },
  submitActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  submitTxt:    { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  centerWrap:   { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emoji:        { fontSize: 64, marginBottom: 16 },
  resTitle:     { color: '#FFFFFF', fontSize: 24, fontWeight: '800', marginBottom: 8 },
  resScore:     { color: ACCENT, fontSize: 48, fontWeight: '900', marginBottom: 8 },
  resXp:        { color: '#FFD700', fontSize: 22, fontWeight: '800', marginBottom: 32 },
  btn:          { backgroundColor: ACCENT, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 48, alignItems: 'center' },
  btnTxt:       { color: '#0A0F1F', fontSize: 16, fontWeight: '800' },
})
