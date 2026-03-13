/**
 * KelimeSniper — Kelime Sniper (Göz Takibi)
 * Tanım gösterilir → 3×3 kelime grid'inden doğruyu seç
 */
import React, { useState, useCallback, useRef } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
} from 'react-native'
import Animated, {
  useSharedValue, withSequence, withTiming, useAnimatedStyle,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { useEyeSoundFeedback } from './useEyeSoundFeedback'
import type { EyeExerciseProps, EyeMetrics } from '@sprinta/shared'

const ACCENT = '#6366F1'

interface QItem {
  definition: string
  answer: string
  distractors: string[]
}

const QUESTIONS: QItem[] = [
  { definition: 'Güneşin etrafında dönen gök cismi', answer: 'Gezegen', distractors: ['Yıldız','Kuyruklu Yıldız','Nebula','Uydu','Asteroid','Galaksi','Kuasar','Pulsar'] },
  { definition: 'Kelime ve dilbilgisi kurallarını inceleyen bilim dalı', answer: 'Dilbilim', distractors: ['Tarih','Coğrafya','Felsefe','Arkeoloji','Sosyoloji','Antropoloji','Psikoloji','Kimya'] },
  { definition: 'Suyun katı hali', answer: 'Buz', distractors: ['Kar','Dolu','Sis','Bulut','Yağmur','Fırtına','Rüzgar','Tipi'] },
  { definition: 'Işığın prizmadan geçince oluşturduğu renkler dizisi', answer: 'Tayfı', distractors: ['Kırınım','Yansıma','Kırılma','Polarizasyon','Girişim','Kırpma','Sapma','Dalga'] },
  { definition: 'İki sayının toplamına verilen isim', answer: 'Toplam', distractors: ['Fark','Çarpım','Bölüm','Kalan','Üs','Kök','Ortalama','Orantı'] },
  { definition: 'Hücrelerin enerji fabrikası', answer: 'Mitokondri', distractors: ['Ribozom','Çekirdek','Golgi','Lizozom','Sentrozom','Vakuol','Kloroplast','Hücre Zarı'] },
  { definition: 'Yer kabuğunun ani sarsılması', answer: 'Deprem', distractors: ['Volkan','Tsunami','Kasırga','Hortum','Çığ','Sel','Heyelan','Fırtına'] },
  { definition: 'Roman, şiir, hikâye gibi eserlerin bütünü', answer: 'Edebiyat', distractors: ['Müzik','Resim','Heykel','Tiyatro','Sinema','Mimari','Dans','Fotoğraf'] },
  { definition: 'Kimyasal elementlerin periyodik çizelgedeki konumu', answer: 'Grup', distractors: ['Dönem','Blok','Değerlik','İzotop','Allotrop','İyon','Bileşik','Karışım'] },
  { definition: 'Toprak altında büyüyen bitki kökü', answer: 'Yumru', distractors: ['Filiz','Tohum','Çiçek','Meyve','Yaprak','Dal','Gövde','Kabuk'] },
  { definition: 'İnsanların bir arada yaşadığı yerleşim birimi', answer: 'Toplum', distractors: ['Aile','Köy','Okul','Devlet','Meclis','Şehir','Köy','Semt'] },
  { definition: 'Atmosferdeki su buharının yoğunlaşması', answer: 'Bulut', distractors: ['Sis','Çiğ','Kırağı','Dolu','Kar','Yağmur','Fırtına','Kasırga'] },
]

function makeGrid(q: QItem): string[] {
  const opts = [q.answer, ...q.distractors.slice(0, 8)]
  for (let i = opts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [opts[i], opts[j]] = [opts[j], opts[i]]
  }
  return opts.slice(0, 9)
}

function calcMetrics(hits: number, total: number, startMs: number): EyeMetrics {
  const acc = total > 0 ? (hits / total) * 100 : 0
  const elapsed = (performance.now() - startMs) / 1000
  return {
    reactionTimeMs:        Math.round(elapsed * 1000 / Math.max(total, 1)),
    accuracyPercent:       Math.round(acc),
    trackingErrorPx:       0,
    visualAttentionScore:  Math.round(acc * 0.6 + Math.min(100, (hits / Math.max(elapsed, 1)) * 12) * 0.4),
    saccadicSpeedEstimate: parseFloat((hits / Math.max(elapsed, 1)).toFixed(2)),
    taskCompletionMs:      Math.round(performance.now() - startMs),
    arpContribution:       4,
  }
}

export default function KelimeSniper({
  difficulty, durationSeconds, onComplete, onExit,
}: EyeExerciseProps) {
  const maxQ = Math.min(QUESTIONS.length, Math.floor(durationSeconds / 5))
  const [qIdx, setQIdx]           = useState(0)
  const [grid, setGrid]           = useState<string[]>(() => makeGrid(QUESTIONS[0]))
  const [selected, setSelected]   = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [hits, setHits]           = useState(0)
  const [total, setTotal]         = useState(0)
  const { playHit, playMiss, playAppear } = useEyeSoundFeedback()
  const startMs = useRef(performance.now())
  const hitsRef = useRef(0)
  const totalRef = useRef(0)

  const scaleVal = useSharedValue(1)
  const scaleStyle = useAnimatedStyle(() => ({ transform: [{ scale: scaleVal.value }] }))

  const q = QUESTIONS[qIdx % QUESTIONS.length]

  const handleTap = useCallback((word: string) => {
    if (showFeedback) return
    const isCorrect = word === q.answer
    setSelected(word)
    hitsRef.current += isCorrect ? 1 : 0
    totalRef.current++
    setHits(hitsRef.current)
    setTotal(totalRef.current)
    setShowFeedback(true)

    if (isCorrect) {
      scaleVal.value = withSequence(withTiming(1.08, { duration: 100 }), withTiming(1, { duration: 100 }))
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      playHit()
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      playMiss()
    }

    setTimeout(() => {
      setShowFeedback(false)
      setSelected(null)
      if (totalRef.current >= maxQ) {
        onComplete(calcMetrics(hitsRef.current, totalRef.current, startMs.current))
      } else {
        const next = (qIdx + 1) % QUESTIONS.length
        setQIdx(next)
        setGrid(makeGrid(QUESTIONS[next]))
        playAppear()
      }
    }, 900)
  }, [showFeedback, q, qIdx, maxQ, onComplete, scaleVal])

  return (
    <SafeAreaView style={s.root}>
      <TouchableOpacity style={s.exitBtn} onPress={onExit}>
        <Text style={s.exitTxt}>✕</Text>
      </TouchableOpacity>

      <Text style={s.title}>Kelime Sniper</Text>

      <View style={s.stats}>
        <Text style={s.statHit}>🎯 {hits}</Text>
        <Text style={s.statSep}>/</Text>
        <Text style={s.statTotal}>{total}</Text>
      </View>

      <Animated.View style={[s.defCard, scaleStyle]}>
        <Text style={s.defLabel}>Tanım:</Text>
        <Text style={s.defTxt}>{q.definition}</Text>
      </Animated.View>

      <View style={s.grid}>
        {grid.map((word, i) => (
          <TouchableOpacity
            key={i}
            style={[
              s.gridBtn,
              showFeedback && word === q.answer && s.gridCorrect,
              showFeedback && word === selected && word !== q.answer && s.gridWrong,
            ]}
            onPressIn={() => handleTap(word)}
            hitSlop={8}
            activeOpacity={0.75}
          >
            <Text style={[
              s.gridTxt,
              showFeedback && word === q.answer && s.gridTxtCorrect,
              showFeedback && word === selected && word !== q.answer && s.gridTxtWrong,
            ]}>
              {word}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={s.progress}>{qIdx + 1}/{maxQ}</Text>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root:         { flex: 1, backgroundColor: '#0A0F1F', alignItems: 'center' },
  exitBtn:      { position: 'absolute', top: 52, right: 20, zIndex: 10, padding: 8 },
  exitTxt:      { color: 'rgba(255,255,255,0.5)', fontSize: 18 },
  title:        { marginTop: 56, fontSize: 22, fontWeight: '800', color: '#FFFFFF', marginBottom: 10 },
  stats:        { flexDirection: 'row', gap: 6, alignItems: 'center', marginBottom: 18 },
  statHit:      { color: '#00C853', fontSize: 20, fontWeight: '900' },
  statSep:      { color: 'rgba(255,255,255,0.3)', fontSize: 18 },
  statTotal:    { color: 'rgba(255,255,255,0.5)', fontSize: 18, fontWeight: '700' },
  defCard:      { backgroundColor: '#0F1A35', borderRadius: 18, paddingHorizontal: 24, paddingVertical: 20, marginHorizontal: 20, width: '88%', alignItems: 'center', marginBottom: 22, borderWidth: 2, borderColor: `rgba(99,102,241,0.5)`, minHeight: 90, justifyContent: 'center' },
  defLabel:     { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginBottom: 8 },
  defTxt:       { color: '#FFFFFF', fontSize: 15, fontWeight: '700', textAlign: 'center', lineHeight: 22 },
  grid:         { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, width: '90%' },
  gridBtn:      { backgroundColor: '#0F1A35', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(99,102,241,0.35)', paddingHorizontal: 10, paddingVertical: 14, width: '30%', alignItems: 'center', justifyContent: 'center' },
  gridCorrect:  { borderColor: '#00C853', backgroundColor: 'rgba(0,200,83,0.15)' },
  gridWrong:    { borderColor: '#EF4444', backgroundColor: 'rgba(239,68,68,0.15)' },
  gridTxt:      { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '600', textAlign: 'center' },
  gridTxtCorrect:{ color: '#00C853' },
  gridTxtWrong: { color: '#EF4444' },
  progress:     { color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 18 },
})
