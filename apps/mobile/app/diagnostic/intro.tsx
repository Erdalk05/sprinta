import { useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { useDiagnosticStore } from '../../src/stores/diagnosticStore'
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, withSpring, withDelay,
} from 'react-native-reanimated'

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

const STEPS = [
  { icon: '📖', title: 'Okuma Testi',      desc: 'Bir metin okuyacaksın. Kendi hızınla oku.' },
  { icon: '❓', title: 'Anlama Soruları',  desc: '5 soru ile metni ne kadar kavradığını ölçeceğiz.' },
  { icon: '📊', title: 'ARP Puanın',       desc: 'Kişisel başlangıç ARP değerin hesaplanacak.' },
]

export default function DiagnosticIntroScreen() {
  const router = useRouter()
  const { reset } = useDiagnosticStore()

  const op = useSharedValue(0)
  const y  = useSharedValue(20)
  useEffect(() => {
    op.value = withDelay(100, withTiming(1, { duration: 500 }))
    y.value  = withDelay(100, withSpring(0, { damping: 18, stiffness: 100 }))
  }, [])
  const anim = useAnimatedStyle(() => ({ opacity: op.value, transform: [{ translateY: y.value }] }))

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    reset()
    router.push('/diagnostic/reading')
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.topBar}>
        <Text style={s.topLabel}>Tanılama Testi</Text>
        <Text style={s.topStep}>Adım 1 / 3</Text>
      </View>
      <DiagProgressBar step={1} total={3} />

      <Animated.View style={[anim, s.content]}>
        <Text style={s.emoji}>🎯</Text>
        <Text style={s.title}>Ne Yapacağız?</Text>
        <Text style={s.subtitle}>
          Sana özel antrenman planı oluşturmak için başlangıç{'\n'}seviyeni belirliyoruz. ~5 dakika sürecek.
        </Text>

        <View style={s.stepsContainer}>
          {STEPS.map((step, i) => (
            <View key={i} style={s.stepRow}>
              <View style={s.stepNum}>
                <Text style={s.stepNumText}>{i + 1}</Text>
              </View>
              <View style={s.stepIconBox}>
                <Text style={{ fontSize: 20 }}>{step.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.stepTitle}>{step.title}</Text>
                <Text style={s.stepDesc}>{step.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={s.tipBox}>
          <Text style={s.tipText}>
            💡 Normal hızında oku — bu bir yarış değil, başlangıç noktanı bulmak için.
          </Text>
        </View>
      </Animated.View>

      <View style={s.footer}>
        <TouchableOpacity style={s.startBtn} onPress={handleStart} activeOpacity={0.85}>
          <Text style={s.startTxt}>Teste Başla →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: BG },
  topBar:         {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingVertical: 16,
  },
  topLabel:       { fontSize: 16, fontWeight: '700', color: TEXT },
  topStep:        { fontSize: 13, color: ACCENT, fontWeight: '600' },
  content:        { flex: 1, paddingHorizontal: 24, paddingTop: 28 },
  emoji:          { fontSize: 56, textAlign: 'center', marginBottom: 16 },
  title:          { fontSize: 26, fontWeight: '800', color: TEXT, textAlign: 'center', marginBottom: 10 },
  subtitle:       { fontSize: 15, color: SUB, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  stepsContainer: { gap: 18, marginBottom: 24 },
  stepRow:        { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepNum:        {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: ACCENT, alignItems: 'center', justifyContent: 'center',
  },
  stepNumText:    { fontSize: 13, fontWeight: '800', color: '#FFF' },
  stepIconBox:    {
    width: 42, height: 42, borderRadius: 10,
    backgroundColor: SURF, borderWidth: 1, borderColor: BORDER,
    alignItems: 'center', justifyContent: 'center',
  },
  stepTitle:      { fontSize: 15, fontWeight: '700', color: TEXT, marginBottom: 2 },
  stepDesc:       { fontSize: 13, color: SUB, lineHeight: 18 },
  tipBox:         { backgroundColor: '#1E1B4B', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: ACCENT + '30' },
  tipText:        { fontSize: 14, color: '#A5B4FC', lineHeight: 20 },
  footer:         { padding: 24, paddingBottom: 32 },
  startBtn:       { backgroundColor: ACCENT, borderRadius: 16, paddingVertical: 18, alignItems: 'center' },
  startTxt:       { fontSize: 17, fontWeight: '700', color: '#FFF' },
})
