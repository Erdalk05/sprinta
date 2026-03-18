/**
 * GraphReadingScreen — İstatistik Grafik Okuma
 * Bar/line grafik verileri → anlama soruları → AYT/LGS/TYT veri yorumlama
 */
import React, { useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'

interface Props { onExit: () => void }

interface DataRow { label: string; value: number }

interface GraphItem {
  title: string
  type: 'bar' | 'line' | 'pie'
  unit: string
  source: string
  data: DataRow[]
  questions: { q: string; opts: string[]; answer: number }[]
}

const GRAPHS: GraphItem[] = [
  {
    title: 'Türkiye\'de Üniversite Mezun Sayısı (1990–2020)',
    type: 'bar',
    unit: 'milyon kişi',
    source: 'TÜİK 2021',
    data: [
      { label: '1990', value: 1.2 },
      { label: '1995', value: 1.8 },
      { label: '2000', value: 2.5 },
      { label: '2005', value: 3.6 },
      { label: '2010', value: 5.1 },
      { label: '2015', value: 7.2 },
      { label: '2020', value: 9.8 },
    ],
    questions: [
      {
        q: '1990\'dan 2020\'ye üniversite mezun sayısı kaç kat artmıştır?',
        opts: ['Yaklaşık 5 kat', 'Yaklaşık 8 kat', 'Yaklaşık 12 kat', 'Yaklaşık 3 kat'],
        answer: 1,
      },
      {
        q: 'En yüksek artış oranı hangi iki dönem arasındadır?',
        opts: ['1990–1995', '2005–2010', '2010–2015', '2015–2020'],
        answer: 1,
      },
    ],
  },
  {
    title: 'Türkiye Yenilenebilir Enerji Kapasitesi (2015–2022)',
    type: 'line',
    unit: 'GW',
    source: 'EPDK Raporu',
    data: [
      { label: '2015', value: 28 },
      { label: '2016', value: 32 },
      { label: '2017', value: 38 },
      { label: '2018', value: 43 },
      { label: '2019', value: 47 },
      { label: '2020', value: 52 },
      { label: '2021', value: 58 },
      { label: '2022', value: 65 },
    ],
    questions: [
      {
        q: '2015–2022 arasında yenilenebilir enerji kapasitesi toplam kaç GW artmıştır?',
        opts: ['27 GW', '37 GW', '45 GW', '20 GW'],
        answer: 1,
      },
      {
        q: 'Ortalama yıllık artış miktarı yaklaşık kaç GW\'dır?',
        opts: ['3 GW', '4 GW', '5.3 GW', '7 GW'],
        answer: 2,
      },
    ],
  },
  {
    title: 'Öğrencilerin Ders Çalışma Süreleri (Günlük Ortalama)',
    type: 'bar',
    unit: 'saat',
    source: 'MEB Araştırması 2023',
    data: [
      { label: 'Matematik',   value: 1.8 },
      { label: 'Türkçe',      value: 1.4 },
      { label: 'Fen',         value: 1.5 },
      { label: 'Sosyal',      value: 1.1 },
      { label: 'İngilizce',   value: 0.9 },
    ],
    questions: [
      {
        q: 'En çok çalışılan ders ile en az çalışılan ders arasındaki fark kaç saattir?',
        opts: ['0.5 saat', '0.9 saat', '1.2 saat', '1.5 saat'],
        answer: 1,
      },
      {
        q: 'Tüm dersler için toplam günlük ortalama çalışma süresi kaç saattir?',
        opts: ['5.7 saat', '6.7 saat', '7.5 saat', '8 saat'],
        answer: 1,
      },
    ],
  },
  {
    title: 'Türkiye Nüfus Artış Hızı (1980–2020)',
    type: 'line',
    unit: '‰ (binde)',
    source: 'TÜİK Nüfus İstatistikleri',
    data: [
      { label: '1980', value: 24.8 },
      { label: '1985', value: 22.1 },
      { label: '1990', value: 21.7 },
      { label: '1995', value: 18.3 },
      { label: '2000', value: 15.2 },
      { label: '2005', value: 13.1 },
      { label: '2010', value: 12.5 },
      { label: '2015', value: 13.4 },
      { label: '2020', value: 14.1 },
    ],
    questions: [
      {
        q: 'Nüfus artış hızı hangi yıllar arasında kesintisiz azalmıştır?',
        opts: ['1980–2000', '1980–2010', '1990–2015', '1985–2010'],
        answer: 1,
      },
      {
        q: '2010 sonrası nüfus artış hızında ne gözlemlenmektedir?',
        opts: ['Azalmaya devam etmiştir', 'Sabit kalmıştır', 'Hafif artış göstermiştir', 'Büyük sıçrama yaşanmıştır'],
        answer: 2,
      },
    ],
  },
]

type Phase = 'graph' | 'quiz' | 'result'

const MAX_BAR_WIDTH = 260

export default function GraphReadingScreen({ onExit }: Props) {
  const { student } = useAuthStore()
  const [graphIdx,   setGraphIdx]   = useState(0)
  const [phase,      setPhase]      = useState<Phase>('graph')
  const [qIdx,       setQIdx]       = useState(0)
  const [selected,   setSelected]   = useState<number | null>(null)
  const [totalScore, setTotalScore] = useState(0)
  const [answered,   setAnswered]   = useState(0)

  const graph   = GRAPHS[graphIdx]
  const question = graph.questions[qIdx]
  const totalQuestions = GRAPHS.reduce((s, g) => s + g.questions.length, 0)

  const maxVal = Math.max(...graph.data.map(d => d.value))

  const handleOption = useCallback((idx: number) => {
    if (selected !== null) return
    setSelected(idx)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }, [selected])

  const handleNext = useCallback(async () => {
    const isCorrect  = selected === question.answer
    const newScore   = totalScore + (isCorrect ? 1 : 0)
    const newAnswered = answered + 1
    setTotalScore(newScore)
    setAnswered(newAnswered)

    const nextQIdx = qIdx + 1
    if (nextQIdx < graph.questions.length) {
      setQIdx(nextQIdx)
      setSelected(null)
      return
    }

    const nextGIdx = graphIdx + 1
    if (nextGIdx < GRAPHS.length) {
      setGraphIdx(nextGIdx)
      setQIdx(0)
      setSelected(null)
      setPhase('graph')
      return
    }

    if (student?.id) {
      try {
        await (supabase as any).from('reading_mode_sessions').insert({
          student_id:   student.id,
          mode:         'graph_reading',
          avg_wpm:      0,
          total_words:  200,
          duration_sec: GRAPHS.length * 60,
          arp_score:    newScore * 5,
          xp_earned:    newScore * 20,
          completion:   1,
        })
      } catch { /* sessiz */ }
    }
    setPhase('result')
  }, [selected, question, qIdx, graph, graphIdx, totalScore, answered, student])

  // ── Result ─────────────────────────────────────────────────────
  if (phase === 'result') {
    const pct = Math.round((totalScore / totalQuestions) * 100)
    return (
      <SafeAreaView style={s.root}>
        <View style={s.centerWrap}>
          <Text style={s.emoji}>{pct >= 80 ? '📊' : pct >= 60 ? '📈' : '💪'}</Text>
          <Text style={s.resTitle}>Grafik Okuma Tamamlandı!</Text>
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

  // ── Graph Phase ────────────────────────────────────────────────
  if (phase === 'graph') {
    return (
      <SafeAreaView style={s.root}>
        <TouchableOpacity style={s.exit} onPress={onExit}>
          <Text style={s.exitTxt}>✕</Text>
        </TouchableOpacity>

        <ScrollView contentContainerStyle={s.scroll}>
          <Text style={s.title}>📊 Grafik Okuma</Text>
          <Text style={s.progress}>Grafik {graphIdx + 1} / {GRAPHS.length}</Text>

          <View style={s.graphCard}>
            <Text style={s.graphTitle}>{graph.title}</Text>
            <Text style={s.graphMeta}>Kaynak: {graph.source} · Birim: {graph.unit}</Text>

            {/* Bar Chart */}
            <View style={s.chartWrap}>
              {graph.data.map((row, i) => {
                const barWidth = Math.round((row.value / maxVal) * MAX_BAR_WIDTH)
                return (
                  <View key={i} style={s.barRow}>
                    <Text style={s.barLabel}>{row.label}</Text>
                    <View style={[s.bar, { width: barWidth }]} />
                    <Text style={s.barVal}>{row.value}</Text>
                  </View>
                )
              })}
            </View>
          </View>

          <Text style={s.hint}>Grafiği dikkatle inceleyin, ardından soruları yanıtlayın.</Text>

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
        <Text style={s.title}>📊 Grafik Okuma</Text>
        <Text style={s.progress}>
          Grafik {graphIdx + 1} / {GRAPHS.length} · Soru {qIdx + 1} / {graph.questions.length}
        </Text>

        {/* Mini grafik */}
        <View style={s.miniChart}>
          {graph.data.map((row, i) => {
            const bw = Math.round((row.value / maxVal) * 160)
            return (
              <View key={i} style={s.miniBarRow}>
                <Text style={s.miniLabel}>{row.label}</Text>
                <View style={[s.miniBar, { width: bw }]} />
                <Text style={s.miniVal}>{row.value}</Text>
              </View>
            )
          })}
        </View>

        <View style={s.qCard}>
          <Text style={s.qText}>{question.q}</Text>
        </View>

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
              onPress={() => handleOption(i)}
              activeOpacity={0.8}
              disabled={selected !== null}
            >
              <Text style={s.optLabel}>{String.fromCharCode(65 + i)}.</Text>
              <Text style={s.optTxt}>{opt}</Text>
            </TouchableOpacity>
          )
        })}

        {selected !== null && (
          <TouchableOpacity style={s.btn} onPress={handleNext} activeOpacity={0.85}>
            <Text style={s.btnTxt}>
              {graphIdx === GRAPHS.length - 1 && qIdx === graph.questions.length - 1
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
const BG      = '#0A1A4A'
const SURFACE = '#1A3594'
const ACCENT  = '#4F7FFF'
const GOLD    = '#F59E0B'
const BAR_COLOR = '#4F7FFF'

const s = StyleSheet.create({
  root:      { flex: 1, backgroundColor: BG },
  scroll:    { paddingHorizontal: 31, paddingVertical: 20, paddingBottom: 40 },
  exit:      { position: 'absolute', top: 52, right: 20, zIndex: 10, padding: 8 },
  exitTxt:   { color: '#fff', fontSize: 18 },
  title:     { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 4 },
  progress:  { color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 16 },

  graphCard: { backgroundColor: SURFACE, borderRadius: 16, padding: 20, marginBottom: 16,
               borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  graphTitle:{ color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 4 },
  graphMeta: { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginBottom: 20 },

  chartWrap: { gap: 10 },
  barRow:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barLabel:  { color: 'rgba(255,255,255,0.6)', fontSize: 11, width: 44, textAlign: 'right' },
  bar:       { height: 18, backgroundColor: BAR_COLOR, borderRadius: 4, minWidth: 4 },
  barVal:    { color: GOLD, fontSize: 11, fontWeight: '600', marginLeft: 4 },

  hint:      { color: 'rgba(255,255,255,0.4)', fontSize: 12, textAlign: 'center', marginBottom: 20 },

  miniChart: { backgroundColor: '#0D2060', borderRadius: 12, padding: 12, marginBottom: 16,
               borderWidth: 1, borderColor: 'rgba(79,127,255,0.2)' },
  miniBarRow:{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  miniLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10, width: 36, textAlign: 'right' },
  miniBar:   { height: 12, backgroundColor: BAR_COLOR + '99', borderRadius: 3, minWidth: 2 },
  miniVal:   { color: GOLD, fontSize: 10, marginLeft: 3 },

  qCard:     { backgroundColor: '#0D2060', borderRadius: 14, padding: 16, marginBottom: 16,
               borderWidth: 1, borderColor: 'rgba(79,127,255,0.3)' },
  qText:     { color: '#fff', fontSize: 15, lineHeight: 22 },

  optBtn:    { flexDirection: 'row', alignItems: 'center', gap: 10,
               backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 12,
               borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
               padding: 14, marginBottom: 10 },
  optCorrect:{ flexDirection: 'row', alignItems: 'center', gap: 10,
               backgroundColor: 'rgba(34,197,94,0.2)', borderRadius: 12,
               borderWidth: 1, borderColor: '#22C55E',
               padding: 14, marginBottom: 10 },
  optWrong:  { flexDirection: 'row', alignItems: 'center', gap: 10,
               backgroundColor: 'rgba(239,68,68,0.2)', borderRadius: 12,
               borderWidth: 1, borderColor: '#EF4444',
               padding: 14, marginBottom: 10 },
  optLabel:  { color: GOLD, fontWeight: '700', fontSize: 15, width: 20 },
  optTxt:    { color: '#fff', fontSize: 14, flex: 1 },

  btn:       { backgroundColor: ACCENT, borderRadius: 14, paddingVertical: 16,
               alignItems: 'center', marginTop: 8 },
  btnTxt:    { color: '#fff', fontWeight: '700', fontSize: 16 },

  centerWrap:{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emoji:     { fontSize: 64, marginBottom: 16 },
  resTitle:  { color: '#fff', fontSize: 24, fontWeight: '700', marginBottom: 8 },
  resScore:  { color: GOLD, fontSize: 20, fontWeight: '700', marginBottom: 4 },
  resPct:    { color: 'rgba(255,255,255,0.6)', fontSize: 16, marginBottom: 8 },
  resXp:     { color: '#22C55E', fontSize: 18, fontWeight: '700', marginBottom: 32 },
})
