import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'

export default function DiagnosticInviteScreen() {
  const router = useRouter()

  async function handleStart() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
    router.push('/diagnostic/intro')
  }

  async function handleSkip() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    router.replace('/(tabs)')
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>🎯</Text>
        <Text style={styles.title}>Önce Seni{'\n'}Tanıyalım</Text>
        <Text style={styles.subtitle}>
          Kişiselleştirilmiş antrenman planın için 5 dakikalık
          bir tanılama testi yapacağız.
        </Text>

        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>⏱</Text>
            <Text style={styles.infoText}>Yaklaşık 5 dakika sürer</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📊</Text>
            <Text style={styles.infoText}>Başlangıç ARP değerini belirler</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>🗺</Text>
            <Text style={styles.infoText}>Kişisel yol haritanı oluşturur</Text>
          </View>
        </View>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleStart}>
          <Text style={styles.primaryButtonText}>Tanılama Testini Başlat</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Şimdi değil, sonra başla</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', padding: 24 },
  content: { flex: 1, justifyContent: 'center' },
  icon: { fontSize: 64, textAlign: 'center', marginBottom: 24 },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#F1F5F9',
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  infoBox: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    gap: 14,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoIcon: { fontSize: 20, width: 28 },
  infoText: { fontSize: 15, color: '#CBD5E1', flex: 1 },
  buttons: { gap: 12, marginBottom: 16 },
  primaryButton: {
    backgroundColor: '#6366F1',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  skipButton: { padding: 16, alignItems: 'center' },
  skipButtonText: { color: '#64748B', fontSize: 15 },
})
