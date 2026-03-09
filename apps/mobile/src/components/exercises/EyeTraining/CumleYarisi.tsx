/**
 * CumleYarisi — Cümle Yarışı (Periferik)
 * Cümle gösterilir → "Okudum!" tap → WPM hesaplanır → 5 tur
 */
import React, { useState, useCallback, useRef } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
} from 'react-native'
import Animated, {
  useSharedValue, withTiming, useAnimatedStyle,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { useEyeSoundFeedback } from './useEyeSoundFeedback'
import type { EyeExerciseProps, EyeMetrics } from '@sprinta/shared'

const ACCENT = '#0EA5E9'

const SENTENCES = [
  'Türkiye\'nin en yüksek dağı Ağrı Dağı\'dır ve deniz seviyesinden 5137 metre yüksektedir.',
  'Fotosentez, bitkilerin güneş ışığını kullanarak karbondioksit ve suyu glikoza dönüştürdüğü süreçtir.',
  'Osmanlı İmparatorluğu altı yüzyıl boyunca üç kıtada geniş bir coğrafyaya hükmetmiştir.',
  'İnsan beyni yaklaşık seksen altı milyar nörondan oluşmakta ve sürekli olarak bilgi işlemektedir.',
  'Matematiğin temel dalları olan aritmetik, cebir, geometri ve analiz birbiriyle derin bağlar içindedir.',
  'Yerçekimi, kütleli cisimler arasındaki çekim kuvveti olup evrenin dört temel kuvvetinden biridir.',
  'Anadolu yarımadası binlerce yıllık tarihiyle pek çok medeniyetin beşiği olmaya devam etmektedir.',
  'Işık hızı saniyede yaklaşık üç yüz bin kilometre olup evrenin en hızlı bilgi taşıyıcısıdır.',
  'Hücre, tüm canlıların temel yapı ve işlev birimidir; prokaryot ya da ökaryot olarak sınıflandırılır.',
  'Dil, insanların düşüncelerini ve duygularını aktarmak için kullandığı en güçlü iletişim aracıdır.',
  'Coğrafi keşifler sayesinde Avrupa ulusları yeni ticaret yolları ve kıtalar keşfetmiştir.',
  'Elektriğin icadıyla birlikte sanayi devrimi hız kazanmış ve modern yaşam biçimi şekillenmiştir.',
]

function countWords(s: string): number {
  return s.trim().split(/\s+/).length
}

function calcMetrics(wpms: number[], startMs: number): EyeMetrics {
  const avgWpm = wpms.length > 0 ? wpms.reduce((a, b) => a + b, 0) / wpms.length : 0
  const acc = Math.min(100, (avgWpm / 250) * 100)
  return {
    reactionTimeMs:        Math.round(60000 / Math.max(avgWpm, 1) * 10),
    accuracyPercent:       Math.round(acc),
    trackingErrorPx:       0,
    visualAttentionScore:  Math.round(Math.min(100, (avgWpm / 300) * 100)),
    saccadicSpeedEstimate: parseFloat((avgWpm / 60).toFixed(2)),
    taskCompletionMs:      Math.round(performance.now() - startMs),
    arpContribution:       4,
  }
}

export default function CumleYarisi({
  difficulty, durationSeconds, onComplete, onExit,
}: EyeExerciseProps) {
  const rounds = Math.min(SENTENCES.length, Math.floor(durationSeconds / 5))
  const [round, setRound]         = useState(0)
  const [phase, setPhase]         = useState<'reading' | 'result'>('reading')
  const [lastWpm, setLastWpm]     = useState(0)
  const [allWpms, setAllWpms]     = useState<number[]>([])
  const [avgWpm, setAvgWpm]       = useState(0)
  const { playSuccess, playAppear } = useEyeSoundFeedback()
  const startMs   = useRef(performance.now())
  const sentStart = useRef(performance.now())

  const opacity = useSharedValue(0)
  const opStyle = useAnimatedStyle(() => ({ opacity: opacity.value }))

  const currentSentence = SENTENCES[round % SENTENCES.length]

  const handleShow = useCallback(() => {
    sentStart.current = performance.now()
    opacity.value = withTiming(1, { duration: 300 })
  }, [opacity])

  // Auto-show on mount and each new round
  React.useEffect(() => {
    opacity.value = 0
    const t = setTimeout(handleShow, 200)
    return () => clearTimeout(t)
  }, [round])

  const handleRead = useCallback(() => {
    const elapsed = (performance.now() - sentStart.current) / 1000
    const wc = countWords(currentSentence)
    const wpm = Math.round((wc / elapsed) * 60)
    setLastWpm(wpm)
    const newWpms = [...allWpms, wpm]
    setAllWpms(newWpms)
    setAvgWpm(Math.round(newWpms.reduce((a, b) => a + b, 0) / newWpms.length))
    setPhase('result')
    opacity.value = withTiming(0, { duration: 200 })
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    playSuccess()
  }, [currentSentence, allWpms, opacity, playSuccess])

  const handleNext = useCallback(() => {
    if (round + 1 >= rounds) {
      const finalWpms = allWpms
      onComplete(calcMetrics(finalWpms, startMs.current))
      return
    }
    setRound(r => r + 1)
    setPhase('reading')
    playAppear()
  }, [round, rounds, allWpms, onComplete, playAppear])

  const getWpmColor = (wpm: number) => {
    if (wpm >= 300) return '#00C853'
    if (wpm >= 200) return '#FFD700'
    return ACCENT
  }

  return (
    <SafeAreaView style={s.root}>
      <TouchableOpacity style={s.exitBtn} onPress={onExit}>
        <Text style={s.exitTxt}>✕</Text>
      </TouchableOpacity>

      <Text style={s.title}>Cümle Yarışı</Text>

      <View style={s.stats}>
        <Text style={s.statWpm}>⚡ {avgWpm > 0 ? avgWpm : '--'} WPM ort.</Text>
        <Text style={s.statRound}>{round + 1}/{rounds}</Text>
      </View>

      {phase === 'reading' ? (
        <>
          <Animated.View style={[s.sentCard, opStyle]}>
            <Text style={s.sentTxt}>{currentSentence}</Text>
          </Animated.View>
          <TouchableOpacity style={s.readBtn} onPress={handleRead} activeOpacity={0.85}>
            <Text style={s.readBtnTxt}>✓ Okudum!</Text>
          </TouchableOpacity>
          <Text style={s.hint}>Cümleyi okur okumaz butona bas</Text>
        </>
      ) : (
        <View style={s.resultCard}>
          <Text style={s.resultLabel}>Okuma Hızı</Text>
          <Text style={[s.resultWpm, { color: getWpmColor(lastWpm) }]}>{lastWpm}</Text>
          <Text style={s.resultUnit}>kelime/dakika</Text>
          <Text style={s.resultHint}>
            {lastWpm >= 300 ? '🔥 Mükemmel!' : lastWpm >= 200 ? '👍 İyi!' : '📈 Gelişiyor!'}
          </Text>
          <TouchableOpacity style={s.nextBtn} onPress={handleNext} activeOpacity={0.85}>
            <Text style={s.nextBtnTxt}>{round + 1 >= rounds ? 'Tamamla' : 'Devam →'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root:       { flex: 1, backgroundColor: '#0A0F1F', alignItems: 'center' },
  exitBtn:    { position: 'absolute', top: 52, right: 20, zIndex: 10, padding: 8 },
  exitTxt:    { color: 'rgba(255,255,255,0.5)', fontSize: 18 },
  title:      { marginTop: 56, fontSize: 22, fontWeight: '800', color: '#FFFFFF', marginBottom: 12 },
  stats:      { flexDirection: 'row', gap: 20, alignItems: 'center', marginBottom: 24 },
  statWpm:    { color: ACCENT, fontSize: 15, fontWeight: '700' },
  statRound:  { color: 'rgba(255,255,255,0.4)', fontSize: 14 },
  sentCard:   { backgroundColor: '#0F1A35', borderRadius: 20, paddingHorizontal: 28, paddingVertical: 28, marginHorizontal: 20, width: '88%', marginBottom: 28, borderWidth: 2, borderColor: 'rgba(14,165,233,0.4)', minHeight: 140, justifyContent: 'center' },
  sentTxt:    { color: '#FFFFFF', fontSize: 17, fontWeight: '600', lineHeight: 28, textAlign: 'center' },
  readBtn:    { backgroundColor: ACCENT, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 48, marginBottom: 14 },
  readBtnTxt: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  hint:       { color: 'rgba(255,255,255,0.3)', fontSize: 12 },
  resultCard: { backgroundColor: '#0F1A35', borderRadius: 22, padding: 32, width: '85%', alignItems: 'center', gap: 10, borderWidth: 2, borderColor: 'rgba(14,165,233,0.35)' },
  resultLabel:{ color: 'rgba(255,255,255,0.45)', fontSize: 12 },
  resultWpm:  { fontSize: 72, fontWeight: '900' },
  resultUnit: { color: 'rgba(255,255,255,0.45)', fontSize: 13 },
  resultHint: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  nextBtn:    { backgroundColor: ACCENT, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 40, marginTop: 6 },
  nextBtnTxt: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
})
