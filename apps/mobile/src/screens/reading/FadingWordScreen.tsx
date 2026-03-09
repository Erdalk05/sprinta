/**
 * FadingWordScreen — Kelime Silme Okuma
 * Cümle gösterilir → kelimeler birer birer kaybolur → hafızadan tamamla (MCQ)
 */
import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'

interface Props { onExit: () => void }

interface Round {
  sentence: string
  words: string[]
  question: string
  opts: string[]
  ans: number   // index of correct option
}

const ROUNDS: Round[] = [
  {
    sentence: 'Türkiye\'nin başkenti Ankara, Orta Anadolu\'da yer almaktadır.',
    words: ['Türkiye\'nin', 'başkenti', 'Ankara,', 'Orta', 'Anadolu\'da', 'yer', 'almaktadır.'],
    question: 'Cümlede Ankara\'nın konumu nasıl belirtilmiştir?',
    opts: ['Ege kıyısında', 'Orta Anadolu\'da', 'İç Anadolu\'nun güneyinde', 'Marmara yakınında'],
    ans: 1,
  },
  {
    sentence: 'Fotosentez, bitkiler tarafından güneş enerjisi kullanılarak gerçekleştirilen bir süreçtir.',
    words: ['Fotosentez,', 'bitkiler', 'tarafından', 'güneş', 'enerjisi', 'kullanılarak', 'gerçekleştirilen', 'bir', 'süreçtir.'],
    question: 'Fotosentezde hangi enerji kaynağı kullanılır?',
    opts: ['Isı enerjisi', 'Kimyasal enerji', 'Güneş enerjisi', 'Elektrik enerjisi'],
    ans: 2,
  },
  {
    sentence: 'Osmanlı İmparatorluğu, 1299 yılında kurulmuş ve 600 yılı aşkın süre hüküm sürmüştür.',
    words: ['Osmanlı', 'İmparatorluğu,', '1299', 'yılında', 'kurulmuş', 've', '600', 'yılı', 'aşkın', 'süre', 'hüküm', 'sürmüştür.'],
    question: 'Osmanlı İmparatorluğu kaç yıl hüküm sürmüştür?',
    opts: ['400 yıl', '500 yıl', '600 yıl aşkın', '700 yıl'],
    ans: 2,
  },
  {
    sentence: 'Su, oksijen ve hidrojen atomlarından oluşan bir bileşiktir.',
    words: ['Su,', 'oksijen', 've', 'hidrojen', 'atomlarından', 'oluşan', 'bir', 'bileşiktir.'],
    question: 'Su hangi atomlardan oluşmaktadır?',
    opts: ['Karbon ve hidrojen', 'Oksijen ve azot', 'Oksijen ve hidrojen', 'Hidrojen ve karbon'],
    ans: 2,
  },
  {
    sentence: 'Dünya\'nın en uzun nehri Nil, Afrika kıtasından geçmektedir.',
    words: ['Dünya\'nın', 'en', 'uzun', 'nehri', 'Nil,', 'Afrika', 'kıtasından', 'geçmektedir.'],
    question: 'Dünya\'nın en uzun nehri olarak hangi nehir gösterilmektedir?',
    opts: ['Amazon', 'Nil', 'Mississippi', 'Yangtze'],
    ans: 1,
  },
]

type Phase = 'show' | 'fading' | 'question' | 'result'

export default function FadingWordScreen({ onExit }: Props) {
  const { student } = useAuthStore()
  const [roundIdx, setRoundIdx] = useState(0)
  const [phase, setPhase] = useState<Phase>('show')
  const [visibleCount, setVisibleCount] = useState<number>(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [correct, setCorrect] = useState(0)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrectAns, setIsCorrectAns] = useState(false)

  const round = ROUNDS[roundIdx]
  const totalWords = round.words.length

  // Show all words first
  useEffect(() => {
    if (phase !== 'show') return
    setVisibleCount(totalWords)
    const t = setTimeout(() => setPhase('fading'), 2000)
    return () => clearTimeout(t)
  }, [phase, totalWords])

  // Fading phase: remove words one by one
  const fadingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  useEffect(() => {
    if (phase !== 'fading') {
      if (fadingRef.current) clearInterval(fadingRef.current)
      return
    }
    let remaining = totalWords
    fadingRef.current = setInterval(() => {
      remaining--
      setVisibleCount(remaining)
      if (remaining <= 0) {
        clearInterval(fadingRef.current!)
        setTimeout(() => setPhase('question'), 400)
      }
    }, 500)
    return () => {
      if (fadingRef.current) clearInterval(fadingRef.current)
    }
  }, [phase, totalWords])

  const handleAnswer = useCallback((idx: number) => {
    if (selected !== null) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setSelected(idx)
    const correct_ = idx === round.ans
    setIsCorrectAns(correct_)
    if (correct_) {
      setCorrect(c => c + 1)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }
    setShowFeedback(true)
    setTimeout(() => {
      setShowFeedback(false)
      setSelected(null)
      if (roundIdx + 1 >= ROUNDS.length) {
        setPhase('result')
      } else {
        setRoundIdx(r => r + 1)
        setPhase('show')
      }
    }, 1200)
  }, [selected, round, roundIdx])

  const handleFinish = useCallback(async () => {
    if (student?.id) {
      try {
        await (supabase as any).from('reading_mode_sessions').insert({
          student_id:   student.id,
          mode:         'fading_word',
          avg_wpm:      0,
          total_words:  ROUNDS.reduce((a, r) => a + r.words.length, 0),
          duration_sec: ROUNDS.length * 5,
          arp_score:    correct * 3,
          xp_earned:    correct * 12,
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
          <Text style={s.resultEmoji}>{correct >= 4 ? '🏆' : correct >= 3 ? '👏' : '💪'}</Text>
          <Text style={s.resultTitle}>Tamamlandı!</Text>
          <Text style={s.resultScore}>{correct} / {ROUNDS.length}</Text>
          <Text style={s.resultXp}>+{correct * 12} XP</Text>
          <TouchableOpacity style={s.nextBtn} onPress={handleFinish} activeOpacity={0.85}>
            <Text style={s.nextTxt}>Bitir</Text>
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
        <Text style={s.label}>🗑️ Kelime Silme</Text>
        <Text style={s.progress}>{roundIdx + 1} / {ROUNDS.length}</Text>
      </View>

      {/* Word display */}
      {(phase === 'show' || phase === 'fading') && (
        <View style={s.sentenceCard}>
          <Text style={s.phaseHint}>
            {phase === 'show' ? 'Cümleyi oku...' : 'Kelimeler siliniyor...'}
          </Text>
          <View style={s.wordsWrap}>
            {round.words.map((word, i) => (
              <Text
                key={i}
                style={[s.word, i >= visibleCount && s.wordHidden]}
              >
                {word}{' '}
              </Text>
            ))}
          </View>
        </View>
      )}

      {/* Question */}
      {phase === 'question' && (
        <View style={s.qWrap}>
          <Text style={s.qText}>{round.question}</Text>
          {round.opts.map((opt, i) => {
            let bg = s.opt
            if (showFeedback && selected === i) bg = isCorrectAns ? s.optCorrect : s.optWrong
            if (showFeedback && i === round.ans && !isCorrectAns) bg = s.optCorrect
            return (
              <TouchableOpacity
                key={i}
                style={[s.optBtn, selected === i && !showFeedback && s.optSelected, showFeedback && selected === i && (isCorrectAns ? s.optCorrect : s.optWrong), showFeedback && i === round.ans && !isCorrectAns && s.optCorrect]}
                onPress={() => handleAnswer(i)}
                activeOpacity={0.8}
              >
                <Text style={s.optTxt}>{String.fromCharCode(65 + i)}. {opt}</Text>
              </TouchableOpacity>
            )
          })}
        </View>
      )}
    </SafeAreaView>
  )
}

const BG = '#0A0F1F'
const ACCENT = '#40C8F0'

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: BG },
  exit:        { position: 'absolute', top: 52, right: 20, zIndex: 10, padding: 8 },
  exitTxt:     { color: 'rgba(255,255,255,0.45)', fontSize: 18 },
  topBar:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 56, paddingHorizontal: 20, marginBottom: 32 },
  label:       { color: ACCENT, fontSize: 16, fontWeight: '700' },
  progress:    { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
  sentenceCard:{ marginHorizontal: 20, backgroundColor: '#0F1A35', borderRadius: 18, padding: 24, minHeight: 160, justifyContent: 'center' },
  phaseHint:   { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 16, textAlign: 'center' },
  wordsWrap:   { flexDirection: 'row', flexWrap: 'wrap' },
  word:        { color: '#E8F4F8', fontSize: 18, lineHeight: 30, fontWeight: '500' },
  wordHidden:  { opacity: 0 },
  qWrap:       { marginHorizontal: 20, marginTop: 16 },
  qText:       { color: '#FFFFFF', fontSize: 17, fontWeight: '700', lineHeight: 26, marginBottom: 20 },
  opt:         {},
  optBtn:      { backgroundColor: '#0F1A35', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(64,200,240,0.2)', padding: 14, marginBottom: 10 },
  optSelected: { borderColor: ACCENT, backgroundColor: 'rgba(64,200,240,0.12)' },
  optCorrect:  { backgroundColor: 'rgba(0,200,83,0.18)', borderColor: '#00C853' },
  optWrong:    { backgroundColor: 'rgba(239,68,68,0.18)', borderColor: '#EF4444' },
  optTxt:      { color: 'rgba(255,255,255,0.85)', fontSize: 15 },
  // Result
  centerWrap:  { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  resultEmoji: { fontSize: 64, marginBottom: 16 },
  resultTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', marginBottom: 8 },
  resultScore: { color: ACCENT, fontSize: 48, fontWeight: '900', marginBottom: 8 },
  resultXp:    { color: '#FFD700', fontSize: 22, fontWeight: '800', marginBottom: 32 },
  nextBtn:     { backgroundColor: ACCENT, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 48, alignItems: 'center' },
  nextTxt:     { color: '#0A0F1F', fontSize: 16, fontWeight: '800' },
})
