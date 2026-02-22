import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { createClient } from '@supabase/supabase-js'
import { colors, moduleColors } from '../../src/constants/colors'
import { MODULE_CONFIGS } from '../../src/constants/modules'
import { useDiagnosticStore } from '../../src/stores/diagnosticStore'
import { useAuthStore } from '../../src/stores/authStore'
import { createDiagnosticService } from '@sprinta/api'
import { calculateExamProgress } from '@sprinta/shared'

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
)
const diagnosticService = createDiagnosticService(supabase)

export default function DiagnosticResultScreen() {
  const router = useRouter()
  const { result, markSaved, reset } = useDiagnosticStore()
  const { student, refreshProfile } = useAuthStore()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (!result || !student) return
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    handleSave()
  }, [])

  const handleSave = async () => {
    if (!result || !student || saving || saved) return
    setSaving(true)
    try {
      const { success, error } = await diagnosticService.saveInitialDiagnostic({
        studentId: student.id,
        baselineWpm: result.baselineWpm,
        baselineComprehension: result.baselineComprehension,
        baselineArp: result.baselineArp,
        durationSeconds: result.durationSeconds,
        primaryWeakness: result.primaryWeakness,
        secondaryWeakness: result.secondaryWeakness,
        recommendedPath: result.recommendedPath,
      })
      if (success) {
        markSaved()
        setSaved(true)
        await refreshProfile()
      } else {
        setSaveError(error ?? 'Kaydedilemedi')
      }
    } catch (e) {
      setSaveError('Bağlantı hatası')
    } finally {
      setSaving(false)
    }
  }

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    reset()
    router.replace('/(tabs)')
  }

  if (!result) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Sonuç bulunamadı.</Text>
        <TouchableOpacity onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.link}>Ana Sayfaya Dön</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  const examTarget = student?.examTarget?.toLowerCase() ?? 'tyt'
  const examProgress = calculateExamProgress(result.baselineArp, examTarget)

  const arpLevel =
    examProgress.level === 'elite' ? '🏆 Elite Seviye' :
    examProgress.level === 'target' ? '🎯 Hedef Seviye' :
    examProgress.level === 'min' ? '📈 Minimum Seviye' : '🌱 Başlangıç Seviyesi'

  const primaryMod = result.primaryWeakness ? MODULE_CONFIGS[result.primaryWeakness] : null
  const primaryColor = result.primaryWeakness ? moduleColors[result.primaryWeakness] : colors.primary

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Başlık */}
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>🎉</Text>
          <Text style={styles.heroTitle}>Tanılama Tamamlandı!</Text>
          <Text style={styles.heroSub}>İşte başlangıç profil değerlerin</Text>
        </View>

        {/* ARP Kartı */}
        <View style={styles.arpCard}>
          <Text style={styles.arpLabel}>Başlangıç ARP Puanın</Text>
          <Text style={styles.arpValue}>{result.baselineArp}</Text>
          <Text style={styles.arpLevel}>{arpLevel}</Text>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${examProgress.progressPercent}%` }]} />
          </View>
          <Text style={styles.progressLabel}>
            {examTarget.toUpperCase()} hedefine %{examProgress.progressPercent}
          </Text>
        </View>

        {/* Temel Metrikler */}
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{result.baselineWpm}</Text>
            <Text style={styles.metricLabel}>WPM</Text>
            <Text style={styles.metricSub}>Okuma Hızı</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>%{result.baselineComprehension}</Text>
            <Text style={styles.metricLabel}>Kavrama</Text>
            <Text style={styles.metricSub}>Anlama Oranı</Text>
          </View>
        </View>

        {/* Öneri Yolu */}
        {primaryMod && (
          <View style={[styles.recommendBox, { borderColor: primaryColor }]}>
            <Text style={styles.recommendTitle}>💡 Önerilen Başlangıç Modülü</Text>
            <View style={styles.recommendRow}>
              <Text style={styles.recommendEmoji}>{primaryMod.icon}</Text>
              <View>
                <Text style={[styles.recommendName, { color: primaryColor }]}>{primaryMod.label}</Text>
                <Text style={styles.recommendDesc}>{primaryMod.description}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Kayıt durumu */}
        {saving && (
          <View style={styles.savingRow}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.savingText}>Sonuçlar kaydediliyor...</Text>
          </View>
        )}
        {saveError && (
          <View style={styles.errorBox}>
            <Text style={styles.errorBoxText}>⚠️ {saveError}</Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.retryText}>Tekrar Dene</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* CTA */}
        <TouchableOpacity
          style={[styles.continueButton, (!saved && saving) && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={saving}
          activeOpacity={0.85}
        >
          <Text style={styles.continueText}>
            {saved ? 'Antrenmanına Başla →' : 'Devam Et →'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 24, paddingBottom: 48 },
  hero: { alignItems: 'center', marginBottom: 28, marginTop: 8 },
  heroEmoji: { fontSize: 60, marginBottom: 12 },
  heroTitle: { fontSize: 26, fontWeight: '800', color: colors.text, marginBottom: 6 },
  heroSub: { fontSize: 15, color: colors.textSecondary },
  arpCard: {
    backgroundColor: colors.primary, borderRadius: 20,
    padding: 24, marginBottom: 16, alignItems: 'center',
  },
  arpLabel: { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginBottom: 8 },
  arpValue: { fontSize: 72, fontWeight: '900', color: colors.white, lineHeight: 80 },
  arpLevel: { fontSize: 16, color: 'rgba(255,255,255,0.9)', fontWeight: '600', marginBottom: 16, marginTop: 4 },
  progressTrack: {
    width: '100%', height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3, overflow: 'hidden',
  },
  progressFill: { height: 6, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 3 },
  progressLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 6 },
  metricsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  metricCard: {
    flex: 1, backgroundColor: colors.surface,
    borderRadius: 16, padding: 18, alignItems: 'center',
  },
  metricValue: { fontSize: 28, fontWeight: '900', color: colors.text },
  metricLabel: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, marginTop: 4 },
  metricSub: { fontSize: 11, color: colors.textTertiary, marginTop: 2 },
  recommendBox: {
    borderWidth: 2, borderRadius: 16, padding: 16, marginBottom: 20,
  },
  recommendTitle: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, marginBottom: 10 },
  recommendRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  recommendEmoji: { fontSize: 36 },
  recommendName: { fontSize: 17, fontWeight: '800', marginBottom: 4 },
  recommendDesc: { fontSize: 13, color: colors.textSecondary },
  savingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 16 },
  savingText: { fontSize: 14, color: colors.textSecondary },
  errorBox: {
    backgroundColor: '#FEE2E2', borderRadius: 12, padding: 14,
    alignItems: 'center', gap: 8, marginBottom: 16,
  },
  errorBoxText: { fontSize: 14, color: '#991B1B' },
  retryText: { fontSize: 14, fontWeight: '700', color: colors.error },
  continueButton: {
    backgroundColor: colors.primary, borderRadius: 16,
    paddingVertical: 18, alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  continueText: { fontSize: 17, fontWeight: '700', color: colors.white },
  errorText: { fontSize: 16, color: colors.textSecondary, textAlign: 'center', marginTop: 100 },
  link: { fontSize: 15, color: colors.primary, textAlign: 'center', marginTop: 16 },
})
