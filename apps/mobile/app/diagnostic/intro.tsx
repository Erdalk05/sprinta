import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { colors } from '../../src/constants/colors'
import { useDiagnosticStore } from '../../src/stores/diagnosticStore'

const STEPS = [
  { icon: '📖', title: 'Okuma Testi', desc: 'Bir metin okuyacaksın. Kendi hızınla oku.' },
  { icon: '❓', title: 'Anlama Soruları', desc: '5 soru ile metni ne kadar kavradığını ölçeceğiz.' },
  { icon: '📊', title: 'ARP Puanın', desc: 'Kişisel başlangıç ARP değerin hesaplanacak.' },
]

export default function DiagnosticIntroScreen() {
  const router = useRouter()
  const { reset } = useDiagnosticStore()

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    reset()
    router.push('/diagnostic/reading')
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🎯</Text>
        <Text style={styles.title}>Tanılama Testi</Text>
        <Text style={styles.subtitle}>
          Sana özel antrenman planı oluşturmak için başlangıç seviyeni belirliyoruz.
          Yaklaşık 5 dakika sürecek.
        </Text>

        <View style={styles.stepsContainer}>
          {STEPS.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{i + 1}</Text>
              </View>
              <View style={styles.stepIcon}>
                <Text style={styles.stepIconText}>{step.icon}</Text>
              </View>
              <View style={styles.stepInfo}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDesc}>{step.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.tipBox}>
          <Text style={styles.tipText}>
            💡 Normal hızında oku — bu bir yarış değil, başlangıç noktanı bulmak için.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.startButton} onPress={handleStart} activeOpacity={0.85}>
          <Text style={styles.startText}>Teste Başla →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: 24, paddingTop: 32 },
  emoji: { fontSize: 64, textAlign: 'center', marginBottom: 16 },
  title: {
    fontSize: 28, fontWeight: '800', color: colors.text,
    textAlign: 'center', marginBottom: 12,
  },
  subtitle: {
    fontSize: 15, color: colors.textSecondary, textAlign: 'center',
    lineHeight: 22, marginBottom: 36,
  },
  stepsContainer: { gap: 20, marginBottom: 28 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepNumber: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  stepNumberText: { fontSize: 13, fontWeight: '800', color: colors.white },
  stepIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  stepIconText: { fontSize: 22 },
  stepInfo: { flex: 1 },
  stepTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 2 },
  stepDesc: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  tipBox: {
    backgroundColor: '#EDE9FE', borderRadius: 12, padding: 14,
  },
  tipText: { fontSize: 14, color: '#5B21B6', lineHeight: 20 },
  footer: { padding: 24, paddingBottom: 36 },
  startButton: {
    backgroundColor: colors.primary, borderRadius: 16,
    paddingVertical: 18, alignItems: 'center',
  },
  startText: { fontSize: 17, fontWeight: '700', color: colors.white },
})
