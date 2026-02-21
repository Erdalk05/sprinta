import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'

export default function WelcomeScreen() {
  const router = useRouter()

  async function handleStart() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    router.push('/(onboarding)/daily-goal')
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>⚡</Text>
        <Text style={styles.title}>Sprinta'ya{'\n'}Hoş Geldin!</Text>
        <Text style={styles.subtitle}>
          Okuma hızını ve anlama gücünü birlikte geliştireceğiz.
          Önce seni tanıyalım.
        </Text>

        <View style={styles.features}>
          {[
            { emoji: '🚀', text: 'Hızlı okuma teknikleri' },
            { emoji: '🧠', text: 'Derin anlama egzersizleri' },
            { emoji: '🎯', text: 'Kişisel ARP hedefleri' },
          ].map(f => (
            <View key={f.text} style={styles.featureRow}>
              <Text style={styles.featureEmoji}>{f.emoji}</Text>
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleStart}>
        <Text style={styles.buttonText}>Hadi Başlayalım →</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', padding: 24 },
  content: { flex: 1, justifyContent: 'center' },
  logo: { fontSize: 64, textAlign: 'center', marginBottom: 24 },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#F1F5F9',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 44,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  features: { gap: 16 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureEmoji: { fontSize: 24, width: 40 },
  featureText: { fontSize: 16, color: '#CBD5E1', flex: 1 },
  button: {
    backgroundColor: '#6366F1',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
})
