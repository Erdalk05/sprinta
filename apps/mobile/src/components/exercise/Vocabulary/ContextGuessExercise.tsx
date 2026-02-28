import React, { useState, useRef, useCallback } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native'
import * as Haptics from 'expo-haptics'

interface VocabQuestion {
  sentence: string
  options: string[]
  correctIndex: number
  explanation?: string
}

export interface VocabMetrics {
  correct: number
  total: number
  comprehension: number   // 0-100
  avgResponseMs: number
}

interface Props {
  questions?: VocabQuestion[]
  onComplete: (metrics: VocabMetrics) => void
  onExit: () => void
}

const DEFAULT_QUESTIONS: VocabQuestion[] = [
  {
    sentence: 'Bilim insanları, iklim değişikliğinin ___ sonuçlar doğuracağını öngörüyor.',
    options: ['olumlu', 'hafif', 'dramatik', 'önemsiz'],
    correctIndex: 2,
    explanation: '"Dramatik" = çarpıcı, büyük ölçekli değişim anlamında kullanılır.',
  },
  {
    sentence: 'Uzun süre çalışmak verimli olmayabilir; zaman zaman ___ almak gerekir.',
    options: ['mola', 'test', 'ders', 'sınav'],
    correctIndex: 0,
    explanation: '"Mola" = kısa ara, dinlenme süresi.',
  },
  {
    sentence: 'Sağlıklı yaşam için düzenli egzersiz ve ___ beslenme şarttır.',
    options: ['dengesiz', 'pahalı', 'dengeli', 'hızlı'],
    correctIndex: 2,
    explanation: '"Dengeli beslenme" = tüm besin gruplarının yeterli miktarda alınması.',
  },
  {
    sentence: 'Teknoloji, insanların hayatını kolaylaştırırken bazı ___ sorunlar da ortaya çıkardı.',
    options: ['ekonomik', 'etik', 'fiziksel', 'coğrafi'],
    correctIndex: 1,
    explanation: '"Etik" = ahlaki, doğru-yanlış sorunu.',
  },
  {
    sentence: 'Bu proje ___ bir ekip çalışması gerektiriyor; tek kişi başaramaz.',
    options: ['bireysel', 'işbirlikçi', 'akademik', 'finansal'],
    correctIndex: 1,
    explanation: '"İşbirlikçi" = collaborative, birlikte çalışma temelli.',
  },
  {
    sentence: 'Tarih boyunca toplumlar, büyük felaketlerin ardından ___ süreçlere girmiştir.',
    options: ['yeniden yapılanma', 'çöküş', 'durgunluk', 'izolasyon'],
    correctIndex: 0,
    explanation: '"Yeniden yapılanma" = reconstruction, felaketten sonra toparlanma.',
  },
  {
    sentence: 'Okuma ___ geliştirilmesi, öğrencilerin sınavdaki başarısını doğrudan artırır.',
    options: ['hızının', 'süresinin', 'salonunun', 'listesinin'],
    correctIndex: 0,
    explanation: '"Okuma hızı" → WPM = sınav performansını belirler.',
  },
  {
    sentence: 'Çevre kirliliğiyle mücadelede bireysel ___ büyük önem taşıyor.',
    options: ['kazançlar', 'farkındalık', 'harcamalar', 'eğlenceler'],
    correctIndex: 1,
    explanation: '"Farkındalık" = awareness, bir konuya dikkat etme bilinci.',
  },
  {
    sentence: 'Bilgiye ___ ulaşmak, modern toplumun en önemli özelliklerinden biridir.',
    options: ['yavaşça', 'anlık', 'pahalıya', 'zorluğu'],
    correctIndex: 1,
    explanation: '"Anlık ulaşmak" = instant access, gerçek zamanlı erişim.',
  },
  {
    sentence: 'Sanatçı, eserlerinde toplumsal ___ dile getirmeyi tercih ediyor.',
    options: ['manzaraları', 'eşitsizlikleri', 'bayramları', 'yolculukları'],
    correctIndex: 1,
    explanation: '"Toplumsal eşitsizlik" = social inequality, temel sosyal bilim kavramı.',
  },
]

export function ContextGuessExercise({ questions = DEFAULT_QUESTIONS, onComplete, onExit }: Props) {
  const [idx, setIdx] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [showExpl, setShowExpl] = useState(false)
  const [qStartTime, setQStartTime] = useState(Date.now())
  const [responseTimes, setResponseTimes] = useState<number[]>([])
  const fadeAnim = useRef(new Animated.Value(1)).current

  const current = questions[idx]

  const handleSelect = useCallback((optIdx: number) => {
    if (selected !== null) return
    const ms = Date.now() - qStartTime
    setResponseTimes(prev => [...prev, ms])
    setSelected(optIdx)
    const isCorrect = optIdx === current.correctIndex
    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      setCorrectCount(c => c + 1)
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }
    if (current.explanation) setShowExpl(true)
  }, [selected, current, qStartTime])

  const handleNext = useCallback(() => {
    const nextIdx = idx + 1
    if (nextIdx >= questions.length) {
      const allTimes = [...responseTimes]
      const avgMs = allTimes.length
        ? Math.round(allTimes.reduce((a, b) => a + b, 0) / allTimes.length)
        : 3000
      const finalCorrect = correctCount + (selected === current.correctIndex ? 1 : 0)
      onComplete({
        correct: finalCorrect,
        total: questions.length,
        comprehension: Math.round((finalCorrect / questions.length) * 100),
        avgResponseMs: avgMs,
      })
    } else {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start()
      setIdx(nextIdx)
      setSelected(null)
      setShowExpl(false)
      setQStartTime(Date.now())
    }
  }, [idx, questions.length, correctCount, selected, current, responseTimes, fadeAnim, onComplete])

  const optionStyle = (optIdx: number) => {
    if (selected === null) return { bg: '#FFF', border: '#E5E7EB', text: '#111' }
    if (optIdx === current.correctIndex) return { bg: '#D1FAE5', border: '#059669', text: '#065F46' }
    if (optIdx === selected) return { bg: '#FEE2E2', border: '#EF4444', text: '#991B1B' }
    return { bg: '#FFF', border: '#E5E7EB', text: '#9CA3AF' }
  }

  return (
    <View style={styles.container}>
      <View style={styles.progress}>
        <Text style={styles.progressText}>{idx + 1} / {questions.length}</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(idx / questions.length) * 100}%` as any }]} />
        </View>
      </View>

      <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
        <Text style={styles.sentence}>{current.sentence}</Text>
        <View style={styles.options}>
          {current.options.map((opt, i) => {
            const c = optionStyle(i)
            return (
              <TouchableOpacity
                key={i}
                style={[styles.option, { backgroundColor: c.bg, borderColor: c.border }]}
                onPress={() => handleSelect(i)}
                activeOpacity={selected !== null ? 1 : 0.7}
              >
                <Text style={styles.optionLetter}>{String.fromCharCode(65 + i)}</Text>
                <Text style={[styles.optionText, { color: c.text }]}>{opt}</Text>
              </TouchableOpacity>
            )
          })}
        </View>
        {showExpl && current.explanation && (
          <View style={styles.explanation}>
            <Text style={styles.explText}>💡 {current.explanation}</Text>
          </View>
        )}
      </Animated.View>

      <View style={styles.footer}>
        {selected !== null && (
          <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
            <Text style={styles.nextText}>
              {idx + 1 < questions.length ? 'Sonraki →' : 'Tamamla ✓'}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.exitBtn} onPress={onExit}>
          <Text style={styles.exitText}>Çıkış</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 20 },
  progress: { marginBottom: 20 },
  progressText: { fontSize: 13, color: '#6B7280', marginBottom: 6, textAlign: 'right' },
  progressBar: { height: 4, backgroundColor: '#E5E7EB', borderRadius: 2 },
  progressFill: { height: 4, backgroundColor: '#8B5CF6', borderRadius: 2 },
  card: { flex: 1 },
  sentence: {
    fontSize: 18, lineHeight: 28, color: '#111827', fontWeight: '600',
    marginBottom: 28, textAlign: 'center', paddingHorizontal: 8,
  },
  options: { gap: 12 },
  option: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, borderRadius: 14, borderWidth: 2, gap: 12,
  },
  optionLetter: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#F3F4F6', textAlign: 'center',
    lineHeight: 28, fontSize: 14, fontWeight: '700',
    color: '#374151', overflow: 'hidden',
  },
  optionText: { fontSize: 16, fontWeight: '500', flex: 1 },
  explanation: {
    marginTop: 16, backgroundColor: '#EFF6FF',
    borderRadius: 12, padding: 14,
    borderLeftWidth: 3, borderLeftColor: '#3B82F6',
  },
  explText: { fontSize: 14, color: '#1E40AF', lineHeight: 20 },
  footer: { gap: 10, paddingTop: 16 },
  nextBtn: { backgroundColor: '#8B5CF6', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  nextText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  exitBtn: { alignItems: 'center', paddingVertical: 10 },
  exitText: { fontSize: 14, color: '#9CA3AF' },
})
