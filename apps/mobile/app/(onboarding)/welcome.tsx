import { useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
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

const FEATURES = [
  { emoji: '🚀', title: 'Hızlı Okuma',    desc: 'Kanıtlanmış tekniklerle 3× daha hızlı' },
  { emoji: '🧠', title: 'Derin Anlama',    desc: 'Kavrama gücünü %40 artır' },
  { emoji: '🎯', title: 'Kişisel Yol',    desc: 'Sana özel ARP tabanlı antrenman' },
]

export default function WelcomeScreen() {
  const router = useRouter()

  const logoOp  = useSharedValue(0)
  const logoY   = useSharedValue(24)
  const titleOp = useSharedValue(0)
  const titleY  = useSharedValue(24)
  const bodyOp  = useSharedValue(0)
  const bodyY   = useSharedValue(24)
  const btnOp   = useSharedValue(0)

  useEffect(() => {
    logoOp.value  = withDelay(80,  withTiming(1, { duration: 500 }))
    logoY.value   = withDelay(80,  withSpring(0, { damping: 18, stiffness: 110 }))
    titleOp.value = withDelay(260, withTiming(1, { duration: 500 }))
    titleY.value  = withDelay(260, withSpring(0, { damping: 18, stiffness: 110 }))
    bodyOp.value  = withDelay(440, withTiming(1, { duration: 500 }))
    bodyY.value   = withDelay(440, withSpring(0, { damping: 18, stiffness: 110 }))
    btnOp.value   = withDelay(680, withTiming(1, { duration: 400 }))
  }, [])

  const logoStyle  = useAnimatedStyle(() => ({ opacity: logoOp.value,  transform: [{ translateY: logoY.value  }] }))
  const titleStyle = useAnimatedStyle(() => ({ opacity: titleOp.value, transform: [{ translateY: titleY.value }] }))
  const bodyStyle  = useAnimatedStyle(() => ({ opacity: bodyOp.value,  transform: [{ translateY: bodyY.value  }] }))
  const btnStyle   = useAnimatedStyle(() => ({ opacity: btnOp.value }))

  async function handleStart() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    router.push('/(onboarding)/daily-goal')
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>
        <ProgressDots current={1} />

        <View style={s.content}>
          <Animated.View style={[logoStyle, s.logoWrap]}>
            <View style={s.logoRing}>
              <Text style={s.logoEmoji}>⚡</Text>
            </View>
          </Animated.View>

          <Animated.View style={titleStyle}>
            <Text style={s.title}>Sprinta'ya{'\n'}Hoş Geldin!</Text>
            <Text style={s.subtitle}>
              Okuma hızını ve anlama gücünü{'\n'}bilimsel yöntemlerle geliştir.
            </Text>
          </Animated.View>

          <Animated.View style={[bodyStyle, s.features]}>
            {FEATURES.map(f => (
              <View key={f.title} style={s.featureCard}>
                <View style={s.featureIcon}>
                  <Text style={{ fontSize: 22 }}>{f.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.featureTitle}>{f.title}</Text>
                  <Text style={s.featureDesc}>{f.desc}</Text>
                </View>
              </View>
            ))}
          </Animated.View>
        </View>

        <Animated.View style={btnStyle}>
          <TouchableOpacity style={s.button} onPress={handleStart} activeOpacity={0.85}>
            <Text style={s.buttonText}>Hadi Başlayalım →</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: BG },
  container:   { flex: 1, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16 },
  content:     { flex: 1, justifyContent: 'center', gap: 28 },
  logoWrap:    { alignItems: 'center' },
  logoRing:    {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: ACCENT + '1A',
    borderWidth: 2, borderColor: ACCENT + '40',
    alignItems: 'center', justifyContent: 'center',
  },
  logoEmoji:   { fontSize: 48 },
  title:       { fontSize: 34, fontWeight: '800', color: TEXT, textAlign: 'center', lineHeight: 42 },
  subtitle:    { fontSize: 16, color: SUB, textAlign: 'center', lineHeight: 24, marginTop: 10 },
  features:    { gap: 10 },
  featureCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: SURF, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: BORDER,
  },
  featureIcon:  {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: ACCENT + '18', alignItems: 'center', justifyContent: 'center',
  },
  featureTitle: { fontSize: 15, fontWeight: '700', color: TEXT, marginBottom: 2 },
  featureDesc:  { fontSize: 13, color: SUB },
  button:       { backgroundColor: ACCENT, borderRadius: 16, paddingVertical: 18, alignItems: 'center' },
  buttonText:   { color: '#FFF', fontSize: 17, fontWeight: '700' },
})
