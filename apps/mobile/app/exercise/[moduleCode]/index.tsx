import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { colors, moduleColors } from '../../../src/constants/colors'
import { MODULE_CONFIGS } from '../../../src/constants/modules'
import { SAMPLE_EXERCISES } from '../../../src/data/sampleContent'
import { useAuthStore } from '../../../src/stores/authStore'

export default function ExerciseIntroScreen() {
  const { moduleCode } = useLocalSearchParams<{ moduleCode: string }>()
  const router = useRouter()
  const { student } = useAuthStore()

  const config = MODULE_CONFIGS[moduleCode] ?? MODULE_CONFIGS.speed_control
  const exercise = SAMPLE_EXERCISES[moduleCode]
  const accentColor = moduleColors[moduleCode] ?? colors.primary

  // Öğrencinin mevcut ARP'ına göre zorluk belirle
  const currentArp = student?.currentArp ?? 0
  const difficulty = currentArp > 200 ? 7 : currentArp > 150 ? 5 : 3

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    router.push({
      pathname: '/exercise/[moduleCode]/session',
      params: {
        moduleCode,
        difficulty: String(difficulty),
        exerciseId: exercise?.id ?? 'sample',
      },
    })
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Geri */}
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Text style={styles.backText}>← Geri</Text>
      </TouchableOpacity>

      {/* İkon + Başlık */}
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: accentColor + '20' }]}>
          <Text style={styles.icon}>{config.icon}</Text>
        </View>
        <Text style={styles.title}>{config.label}</Text>
        <Text style={styles.description}>{config.description}</Text>
      </View>

      {/* Bilgi kartları */}
      <View style={styles.infoGrid}>
        <View style={styles.infoCard}>
          <Text style={styles.infoValue}>{config.duration}</Text>
          <Text style={styles.infoLabel}>Süre</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoValue}>{difficulty}/10</Text>
          <Text style={styles.infoLabel}>Zorluk</Text>
        </View>
        {exercise?.wordCount ? (
          <View style={styles.infoCard}>
            <Text style={styles.infoValue}>{exercise.wordCount}</Text>
            <Text style={styles.infoLabel}>Kelime</Text>
          </View>
        ) : null}
      </View>

      {/* İpucu */}
      <View style={[styles.tipBox, { borderLeftColor: accentColor }]}>
        <Text style={styles.tipLabel}>💡 İpucu</Text>
        <Text style={styles.tipText}>{config.tip}</Text>
      </View>

      {/* Başla butonu */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.startButton, { backgroundColor: accentColor }]}
          onPress={handleStart}
          activeOpacity={0.85}
        >
          <Text style={styles.startText}>Egzersizi Başlat</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 16,
    paddingBottom: 32,
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  icon: {
    fontSize: 44,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 24,
    marginBottom: 24,
    justifyContent: 'center',
  },
  infoCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  tipBox: {
    marginHorizontal: 24,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    marginBottom: 32,
  },
  tipLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  tipText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 24,
    marginTop: 'auto',
    paddingBottom: 24,
  },
  startButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  startText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.white,
  },
})
