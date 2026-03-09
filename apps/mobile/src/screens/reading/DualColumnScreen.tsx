/**
 * DualColumnScreen — Çift Sütun Okuma
 * 2 kolon layout, göz ortada sabit, periferik span egzersizi
 */
import React, { useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'

interface Props { onExit: () => void }

const SESSIONS = [
  {
    id: 1,
    leftCol: [
      'Sanayi devrimi,',
      '18. yüzyılda',
      'İngiltere\'de',
      'başladı ve tüm',
      'dünyaya yayıldı.',
      'Fabrikalar kuruldu,',
      'kentler büyüdü,',
      'nüfus arttı.',
    ],
    rightCol: [
      'Bu dönemde buhar',
      'makinesi icat edildi.',
      'Demiryolları inşa',
      'edildi ve ticaret',
      'hızlandı. Ancak',
      'işçi sınıfı ağır',
      'koşullarda çalışmak',
      'zorunda kaldı.',
    ],
    questions: [
      { q: 'Sanayi devrimi nerede başladı?', opts: ['Fransa', 'Almanya', 'İngiltere', 'Amerika'], ans: 2 },
      { q: 'Bu dönemde ne icat edildi?', opts: ['Elektrik motoru', 'Buhar makinesi', 'Dizel motor', 'Türbin'], ans: 1 },
      { q: 'Sanayi devrimi hangi sonuçlara yol açtı?', opts: ['Nüfus azaldı', 'Kentler küçüldü', 'Kentler büyüdü', 'Fabrikalar kapandı'], ans: 2 },
    ],
  },
  {
    id: 2,
    leftCol: [
      'Güneş sistemi',
      'yaklaşık 4.6 milyar',
      'yıl önce bir gaz',
      've toz bulutu',
      'içinde oluştu.',
      'Güneş, sistemin',
      'merkezinde yer',
      'almaktadır.',
    ],
    rightCol: [
      'Sekiz gezegen',
      'Güneş etrafında',
      'döner: Merkür,',
      'Venüs, Dünya,',
      'Mars, Jüpiter,',
      'Satürn, Uranüs',
      've Neptün.',
      'Dünya 3. gezegendir.',
    ],
    questions: [
      { q: 'Güneş sistemi ne zaman oluştu?', opts: ['2 milyar yıl önce', '4.6 milyar yıl önce', '6 milyar yıl önce', '1 milyar yıl önce'], ans: 1 },
      { q: 'Dünya güneş sisteminin kaçıncı gezegenidir?', opts: ['2.', '3.', '4.', '5.'], ans: 1 },
      { q: 'Kaç gezegen Güneş etrafında döner?', opts: ['Altı', 'Yedi', 'Sekiz', 'Dokuz'], ans: 2 },
    ],
  },
]

type Phase = 'reading' | 'questions' | 'result'

export default function DualColumnScreen({ onExit }: Props) {
  const { student } = useAuthStore()
  const [sessionIdx, setSessionIdx] = useState(0)
  const [phase, setPhase] = useState<Phase>('reading')
  const [answers, setAnswers] = useState<(number | null)[]>([null, null, null])
  const [totalScore, setTotalScore] = useState(0)
  const [round, setRound] = useState(1)

  const session = SESSIONS[sessionIdx % SESSIONS.length]

  const handleAnswer = useCallback((qi: number, oi: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setAnswers(prev => { const n = [...prev]; n[qi] = oi; return n })
  }, [])

  const handleSubmit = useCallback(async () => {
    const roundScore = answers.reduce<number>((acc, ans, i) =>
      acc + (ans === session.questions[i].ans ? 1 : 0), 0)
    setTotalScore(t => t + roundScore)
    if (student?.id) {
      try {
        await (supabase as any).from('reading_mode_sessions').insert({
          student_id:   student.id,
          mode:         'dual_column',
          avg_wpm:      0,
          total_words:  (session.leftCol.join(' ') + ' ' + session.rightCol.join(' ')).split(' ').length,
          duration_sec: 60,
          arp_score:    roundScore * 3,
          xp_earned:    roundScore * 12,
          completion:   1,
        })
      } catch { /* sessiz */ }
    }
    setPhase('result')
  }, [answers, session, student])

  const handleNext = useCallback(() => {
    if (round >= 2) { onExit(); return }
    setRound(r => r + 1)
    setSessionIdx(i => i + 1)
    setPhase('reading')
    setAnswers([null, null, null])
  }, [round, onExit])

  if (phase === 'result') {
    const roundScore = answers.reduce<number>((acc, ans, i) =>
      acc + (ans === session.questions[i].ans ? 1 : 0), 0)
    return (
      <SafeAreaView style={s.root}>
        <View style={s.centerWrap}>
          <Text style={s.emoji}>{roundScore >= 2 ? '🏆' : '💪'}</Text>
          <Text style={s.resTitle}>Tur {round} Bitti!</Text>
          <Text style={s.resScore}>{totalScore} puan</Text>
          <Text style={s.resXp}>+{roundScore * 12} XP</Text>
          <TouchableOpacity style={s.btn} onPress={handleNext} activeOpacity={0.85}>
            <Text style={s.btnTxt}>{round >= 2 ? 'Bitir' : 'Sonraki →'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  if (phase === 'questions') {
    return (
      <SafeAreaView style={s.root}>
        <TouchableOpacity style={s.exit} onPress={onExit}>
          <Text style={s.exitTxt}>✕</Text>
        </TouchableOpacity>
        <ScrollView contentContainerStyle={s.qScroll}>
          <Text style={s.qTitle}>🧠 Anlama Soruları</Text>
          {session.questions.map((q, qi) => (
            <View key={qi} style={s.qBlock}>
              <Text style={s.qText}>{qi + 1}. {q.q}</Text>
              {q.opts.map((opt, oi) => (
                <TouchableOpacity
                  key={oi}
                  style={[s.optBtn, answers[qi] === oi && s.optSel]}
                  onPress={() => handleAnswer(qi, oi)}
                  activeOpacity={0.8}
                >
                  <Text style={[s.optTxt, answers[qi] === oi && s.optTxtSel]}>
                    {String.fromCharCode(65 + oi)}. {opt}
                  </Text>
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
            <Text style={s.submitTxt}>Teslim Et →</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={s.root}>
      <TouchableOpacity style={s.exit} onPress={onExit}>
        <Text style={s.exitTxt}>✕</Text>
      </TouchableOpacity>

      <View style={s.topBar}>
        <Text style={s.label}>📰 Çift Sütun Okuma</Text>
        <Text style={s.roundTxt}>Tur {round}/2</Text>
      </View>

      <View style={s.hint}>
        <Text style={s.hintTxt}>↕ Ortaya bak · Çevresel görüşünü kullan</Text>
      </View>

      <View style={s.columnsWrap}>
        {/* Center divider */}
        <View style={s.divider} />

        {/* Left column */}
        <View style={s.col}>
          {session.leftCol.map((line, i) => (
            <Text key={i} style={s.lineText}>{line}</Text>
          ))}
        </View>

        {/* Right column */}
        <View style={s.col}>
          {session.rightCol.map((line, i) => (
            <Text key={i} style={s.lineText}>{line}</Text>
          ))}
        </View>
      </View>

      <View style={s.centerFocus}>
        <View style={s.focusDot} />
        <Text style={s.focusLabel}>ODAK NOKTASI</Text>
      </View>

      <TouchableOpacity style={s.doneBtn} onPress={() => setPhase('questions')} activeOpacity={0.85}>
        <Text style={s.doneTxt}>Sorulara Geç →</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const BG = '#0A0F1F'
const ACCENT = '#40C8F0'

const s = StyleSheet.create({
  root:       { flex: 1, backgroundColor: BG },
  exit:       { position: 'absolute', top: 52, right: 20, zIndex: 10, padding: 8 },
  exitTxt:    { color: 'rgba(255,255,255,0.45)', fontSize: 18 },
  topBar:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 56, paddingHorizontal: 20, marginBottom: 10 },
  label:      { color: ACCENT, fontSize: 16, fontWeight: '700' },
  roundTxt:   { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
  hint:       { alignItems: 'center', marginBottom: 16 },
  hintTxt:    { color: 'rgba(64,200,240,0.6)', fontSize: 12, fontStyle: 'italic' },
  columnsWrap:{ flex: 1, flexDirection: 'row', marginHorizontal: 10, gap: 4 },
  divider:    { position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(64,200,240,0.2)', zIndex: 1 },
  col:        { flex: 1, backgroundColor: '#0F1A35', borderRadius: 12, padding: 14 },
  lineText:   { color: '#E8F4F8', fontSize: 15, lineHeight: 30, fontWeight: '500' },
  centerFocus:{ alignItems: 'center', paddingVertical: 12 },
  focusDot:   { width: 10, height: 10, borderRadius: 5, backgroundColor: ACCENT, marginBottom: 4 },
  focusLabel: { color: 'rgba(64,200,240,0.5)', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  doneBtn:    { marginHorizontal: 20, marginBottom: 24, backgroundColor: ACCENT, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  doneTxt:    { color: '#0A0F1F', fontSize: 16, fontWeight: '800' },
  // Questions
  qScroll:    { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40 },
  qTitle:     { color: '#FFFFFF', fontSize: 20, fontWeight: '800', marginBottom: 24 },
  qBlock:     { marginBottom: 24 },
  qText:      { color: '#FFFFFF', fontSize: 15, fontWeight: '600', lineHeight: 22, marginBottom: 12 },
  optBtn:     { backgroundColor: '#0F1A35', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(64,200,240,0.2)', padding: 12, marginBottom: 8 },
  optSel:     { backgroundColor: 'rgba(64,200,240,0.15)', borderColor: ACCENT },
  optTxt:     { color: 'rgba(255,255,255,0.75)', fontSize: 14 },
  optTxtSel:  { color: '#FFFFFF', fontWeight: '600' },
  submitBtn:  { backgroundColor: 'rgba(64,200,240,0.15)', borderRadius: 16, paddingVertical: 16, alignItems: 'center', borderWidth: 1.5, borderColor: 'rgba(64,200,240,0.3)' },
  submitActive:{ backgroundColor: ACCENT, borderColor: ACCENT },
  submitTxt:  { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  // Result
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emoji:      { fontSize: 64, marginBottom: 16 },
  resTitle:   { color: '#FFFFFF', fontSize: 24, fontWeight: '800', marginBottom: 8 },
  resScore:   { color: ACCENT, fontSize: 48, fontWeight: '900', marginBottom: 8 },
  resXp:      { color: '#FFD700', fontSize: 22, fontWeight: '800', marginBottom: 32 },
  btn:        { backgroundColor: ACCENT, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 48, alignItems: 'center' },
  btnTxt:     { color: '#0A0F1F', fontSize: 16, fontWeight: '800' },
})
