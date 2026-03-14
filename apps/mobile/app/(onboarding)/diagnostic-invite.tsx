import { SafeAreaView } from 'react-native-safe-area-context'
import { useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withSequence, withTiming, withSpring, withDelay,
} from 'react-native-reanimated'

const BG     = '#080E1F'
const SURF   = '#111827'
const ACCENT = '#6366F1'
const TEXT   = '#F1F5F9'
const SUB    = '#94A3B8'
const BORDER = '#1E293B'
const GREEN  = '#10B981'

function ProgressDots({ current }: { current: number }) {
  return (
    <View style={dots.row}>
      {[1, 2, 3].map(i => (
        <View key={i} style={[dots.dot, i === current && dots.active, i < current && dots.done]} />
      ))}
    </View>
  )
}
const dots = StyleSheet.create({
  row:    { flexDirection: 'row', gap: 6, justifyContent: 'center', marginBottom: 28 },
  dot:    { width: 8, height: 8, borderRadius: 4, backgroundColor: BORDER },
  active: { width: 28, backgroundColor: ACCENT },
  done:   { backgroundColor: ACCENT + '60' },
})

const INFO = [
  { icon: '⏱', text: 'Yaklaşık 5 dakika sürer' },
  { icon: '📊', text: 'Başlangıç ARP değerini belirler' },
  { icon: '🗺', text: 'Kişisel yol haritanı oluşturur' },
]

export default function DiagnosticInviteScreen() {
  const router = useRouter()

  // Nabız animasyonu
  const pulse = useSharedValue(1)
  const ring1 = useSharedValue(0.6)
  const ring2 = useSharedValue(0.4)
  // Giriş animasyonu
  const contentOp = useSharedValue(0)
  const contentY  = useSharedValue(24)

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 900 }),
        withTiming(1.0,  { duration: 900 }),
      ), -1, true,
    )
    ring1.value = withRepeat(withSequence(withTiming(0.15, { duration: 1200 }), withTiming(0.6, { duration: 1200 })), -1, true)
    ring2.value = withRepeat(withSequence(withTiming(0.08, { duration: 1600 }), withTiming(0.4, { duration: 1600 })), -1, true)
    contentOp.value = withDelay(100, withTiming(1, { duration: 500 }))
    contentY.value  = withDelay(100, withSpring(0, { damping: 18, stiffness: 100 }))
  }, [])

  const pulseStyle   = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }))
  const ring1Style   = useAnimatedStyle(() => ({ opacity: ring1.value }))
  const ring2Style   = useAnimatedStyle(() => ({ opacity: ring2.value }))
  const contentStyle = useAnimatedStyle(() => ({ opacity: contentOp.value, transform: [{ translateY: contentY.value }] }))

  async function handleStart() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
    router.push('/diagnostic/intro')
  }

  async function handleSkip() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    router.replace('/(tabs)')
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>
        <ProgressDots current={3} />

        <Animated.View style={[contentStyle, s.content]}>
          {/* Animasyonlu ikon */}
          <View style={s.iconWrap}>
            <Animated.View style={[s.ring2, ring2Style]} />
            <Animated.View style={[s.ring1, ring1Style]} />
            <Animated.View style={[s.iconCircle, pulseStyle]}>
              <Text style={s.icon}>🎯</Text>
            </Animated.View>
          </View>

          <Text style={s.title}>Önce Seni{'\n'}Tanıyalım</Text>
          <Text style={s.subtitle}>
            Kişiselleştirilmiş antrenman planın için{'\n'}5 dakikalık bir tanılama testi yapacağız.
          </Text>

          {/* Bilgi kutuları */}
          <View style={s.infoBox}>
            {INFO.map(item => (
              <View key={item.text} style={s.infoRow}>
                <View style={s.infoIconWrap}>
                  <Text style={s.infoIcon}>{item.icon}</Text>
                </View>
                <Text style={s.infoText}>{item.text}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        <View style={s.buttons}>
          <TouchableOpacity style={s.primaryBtn} onPress={handleStart} activeOpacity={0.85}>
            <Text style={s.primaryTxt}>Tanılama Testini Başlat →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.skipBtn} onPress={handleSkip} activeOpacity={0.7}>
            <Text style={s.skipTxt}>Şimdi değil, sonra başla</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: BG },
  container:  { flex: 1, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16 },
  content:    { flex: 1, justifyContent: 'center', alignItems: 'center' },
  // Animasyonlu ikon
  iconWrap:   { alignItems: 'center', justifyContent: 'center', width: 140, height: 140, marginBottom: 28 },
  ring2:      {
    position: 'absolute', width: 140, height: 140, borderRadius: 70,
    backgroundColor: ACCENT + '18', borderWidth: 1, borderColor: ACCENT + '30',
  },
  ring1:      {
    position: 'absolute', width: 110, height: 110, borderRadius: 55,
    backgroundColor: ACCENT + '25', borderWidth: 1.5, borderColor: ACCENT + '50',
  },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: ACCENT + '35',
    alignItems: 'center', justifyContent: 'center',
  },
  icon:       { fontSize: 36 },
  title:      { fontSize: 30, fontWeight: '800', color: TEXT, textAlign: 'center', lineHeight: 38, marginBottom: 12 },
  subtitle:   { fontSize: 15, color: SUB, textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  // Info box
  infoBox:    { backgroundColor: SURF, borderRadius: 16, padding: 20, gap: 14, width: '100%', borderWidth: 1, borderColor: BORDER },
  infoRow:    { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: ACCENT + '18', alignItems: 'center', justifyContent: 'center',
  },
  infoIcon:   { fontSize: 18 },
  infoText:   { fontSize: 15, color: TEXT, flex: 1 },
  // Buttons
  buttons:    { gap: 10 },
  primaryBtn: { backgroundColor: ACCENT, borderRadius: 16, paddingVertical: 18, alignItems: 'center' },
  primaryTxt: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  skipBtn:    { paddingVertical: 14, alignItems: 'center' },
  skipTxt:    { color: SUB, fontSize: 14 },
})
