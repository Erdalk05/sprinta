import { SafeAreaView } from 'react-native-safe-area-context'
import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet,  Alert } from 'react-native'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { DIAGNOSTIC_CONTENT } from '../../src/data/diagnosticContent'
import { useDiagnosticStore } from '../../src/stores/diagnosticStore'

const BG     = '#080E1F'
const SURF   = '#111827'
const ACCENT = '#6366F1'
const TEXT   = '#F1F5F9'
const SUB    = '#94A3B8'
const BORDER = '#1E293B'

function DiagProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <View style={pb.track}>
      <View style={[pb.fill, { width: `${(step / total) * 100}%` }]} />
    </View>
  )
}
const pb = StyleSheet.create({
  track: { height: 3, backgroundColor: BORDER, marginHorizontal: 24, borderRadius: 2 },
  fill:  { height: 3, backgroundColor: ACCENT, borderRadius: 2 },
})

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = Math.floor(seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export default function DiagnosticReadingScreen() {
  const router = useRouter()
  const { startReading, finishReading } = useDiagnosticStore()
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    startReading()
    const timer = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleExit = () => {
    Alert.alert(
      'Testi Bitir',
      'Tanılama testi yarıda bırakılacak. Ana sayfaya dönmek istiyor musun?',
      [
        { text: 'Devam Et', style: 'cancel' },
        { text: 'Ana Sayfaya Git', style: 'destructive', onPress: () => router.replace('/(tabs)') },
      ],
    )
  }

  const handleDone = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    const store = useDiagnosticStore.getState()
    const durationSeconds = store.readingStartTime
      ? (Date.now() - store.readingStartTime) / 1000
      : 60
    const durationMinutes = Math.max(0.1, durationSeconds / 60)
    const wpm = Math.round(DIAGNOSTIC_CONTENT.wordCount / durationMinutes)
    finishReading(Math.min(600, Math.max(50, wpm)))
    router.push('/diagnostic/comprehension')
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={handleExit} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} style={s.exitBtn}>
          <Text style={s.exitTxt}>✕</Text>
        </TouchableOpacity>
        <Text style={s.topLabel}>Okuma Testi</Text>
        <View style={s.timer}>
          <Text style={s.timerText}>{formatTime(elapsed)}</Text>
        </View>
        <Text style={s.topStep}>Adım 1 / 3</Text>
      </View>
      <DiagProgressBar step={1} total={3} />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.articleTitle}>{DIAGNOSTIC_CONTENT.title}</Text>
        <Text style={s.articleText}>{DIAGNOSTIC_CONTENT.passage}</Text>
        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={s.footer}>
        <View style={s.footerInfo}>
          <Text style={s.wordCount}>📄 {DIAGNOSTIC_CONTENT.wordCount} kelime</Text>
          <Text style={s.footerHint}>Kendi hızında oku, bitince butona bas</Text>
        </View>
        <TouchableOpacity style={s.doneBtn} onPress={handleDone} activeOpacity={0.85}>
          <Text style={s.doneTxt}>Okumayı Bitirdim →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: BG },
  topBar:        {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingVertical: 16,
  },
  exitBtn:       { padding: 4, marginRight: 8 },
  exitTxt:       { fontSize: 20, color: SUB, fontWeight: '600' },
  topLabel:      { fontSize: 15, fontWeight: '700', color: TEXT, flex: 1 },
  timer:         {
    backgroundColor: SURF, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6,
    borderWidth: 1, borderColor: BORDER,
  },
  timerText:     { fontSize: 15, fontWeight: '700', color: ACCENT, fontVariant: ['tabular-nums'] },
  topStep:       { fontSize: 13, color: ACCENT, fontWeight: '600', flex: 1, textAlign: 'right' },
  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 28 },
  articleTitle:  { fontSize: 20, fontWeight: '800', color: TEXT, marginBottom: 20, lineHeight: 28 },
  articleText:   { fontSize: 17, lineHeight: 30, color: TEXT, letterSpacing: 0.15, opacity: 0.92 },
  footer:        {
    padding: 20, paddingBottom: 32,
    borderTopWidth: 1, borderTopColor: BORDER, gap: 10,
  },
  footerInfo:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  wordCount:     { fontSize: 13, color: SUB },
  footerHint:    { fontSize: 12, color: SUB + 'AA' },
  doneBtn:       { backgroundColor: ACCENT, borderRadius: 16, paddingVertical: 18, alignItems: 'center' },
  doneTxt:       { fontSize: 17, fontWeight: '700', color: '#FFF' },
})
