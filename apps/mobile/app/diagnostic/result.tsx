import { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  ScrollView, ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { supabase } from '../../src/lib/supabase'
import { moduleColors } from '../../src/constants/colors'
import { MODULE_CONFIGS } from '../../src/constants/modules'
import { useDiagnosticStore } from '../../src/stores/diagnosticStore'
import { useAuthStore } from '../../src/stores/authStore'
import { createDiagnosticService } from '@sprinta/api'
import { calculateExamProgress } from '@sprinta/shared'
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, withDelay, withSpring,
} from 'react-native-reanimated'

const BG     = '#080E1F'
const SURF   = '#111827'
const CARD   = '#141C2E'
const ACCENT = '#6366F1'
const TEXT   = '#F1F5F9'
const SUB    = '#94A3B8'
const BORDER = '#1E293B'
const GREEN  = '#10B981'

const diagnosticService = createDiagnosticService(supabase)

function useCountUp(target: number, duration = 1400) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (target <= 0) return
    const steps = 60
    const inc   = target / steps
    let step    = 0
    const timer = setInterval(() => {
      step++
      setValue(Math.min(target, Math.round(inc * step)))
      if (step >= steps) clearInterval(timer)
    }, duration / steps)
    return () => clearInterval(timer)
  }, [target])
  return value
}

export default function DiagnosticResultScreen() {
  const router = useRouter()
  const { result, markSaved, reset } = useDiagnosticStore()
  const { student, refreshProfile }  = useAuthStore()
  const [saving,    setSaving]    = useState(false)
  const [saved,     setSaved]     = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Animasyonlar
  const cardOp  = useSharedValue(0)
  const cardY   = useSharedValue(30)
  const metrOp  = useSharedValue(0)
  const recOp   = useSharedValue(0)
  const btnOp   = useSharedValue(0)

  const displayARP = useCountUp(result?.baselineArp ?? 0, 1400)

  useEffect(() => {
    cardOp.value = withDelay(100, withTiming(1, { duration: 600 }))
    cardY.value  = withDelay(100, withSpring(0, { damping: 18, stiffness: 90 }))
    metrOp.value = withDelay(500, withTiming(1, { duration: 500 }))
    recOp.value  = withDelay(800, withTiming(1, { duration: 400 }))
    btnOp.value  = withDelay(1000, withTiming(1, { duration: 400 }))

    if (result && student) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      handleSave()
    }
  }, [])

  const cardStyle = useAnimatedStyle(() => ({ opacity: cardOp.value, transform: [{ translateY: cardY.value }] }))
  const metrStyle = useAnimatedStyle(() => ({ opacity: metrOp.value }))
  const recStyle  = useAnimatedStyle(() => ({ opacity: recOp.value }))
  const btnStyle  = useAnimatedStyle(() => ({ opacity: btnOp.value }))

  const handleSave = async () => {
    if (!result || !student || saving || saved) return
    setSaving(true)
    try {
      const { success, error } = await diagnosticService.saveInitialDiagnostic({
        studentId:              student.id,
        baselineWpm:            result.baselineWpm,
        baselineComprehension:  result.baselineComprehension,
        baselineArp:            result.baselineArp,
        durationSeconds:        result.durationSeconds,
        primaryWeakness:        result.primaryWeakness,
        secondaryWeakness:      result.secondaryWeakness,
        recommendedPath:        result.recommendedPath,
      })
      if (success) {
        markSaved()
        setSaved(true)
        refreshProfile()
      } else {
        setSaveError(error ?? 'Kaydedilemedi')
      }
    } catch {
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
      <SafeAreaView style={s.safe}>
        <View style={s.emptyWrap}>
          <Text style={s.emptyText}>Sonuç bulunamadı.</Text>
          <TouchableOpacity onPress={() => router.replace('/(tabs)')}>
            <Text style={s.emptyLink}>Ana Sayfaya Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  const examTarget   = student?.examTarget?.toLowerCase() ?? 'tyt'
  const examProgress = calculateExamProgress(result.baselineArp, examTarget)
  const progressPct  = Math.max(1, examProgress.progressPercent) // en az 1% göster

  const arpLevel =
    examProgress.level === 'elite'  ? { label: '🏆 Elite Seviye',      color: '#F59E0B' } :
    examProgress.level === 'target' ? { label: '🎯 Hedef Seviye',      color: GREEN } :
    examProgress.level === 'min'    ? { label: '📈 Minimum Seviye',    color: '#3B82F6' } :
                                      { label: '🌱 Başlangıç Seviyesi', color: SUB }

  const primaryMod   = result.primaryWeakness ? MODULE_CONFIGS[result.primaryWeakness] : null
  const primaryColor = result.primaryWeakness ? moduleColors[result.primaryWeakness] : ACCENT

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={s.hero}>
          <Text style={s.heroEmoji}>🎉</Text>
          <Text style={s.heroTitle}>Tanılama Tamamlandı!</Text>
          <Text style={s.heroSub}>İşte başlangıç profil değerlerin</Text>
        </View>

        {/* ARP Kart */}
        <Animated.View style={[s.arpCard, cardStyle]}>
          <Text style={s.arpLabel}>Başlangıç ARP Puanın</Text>
          <Text style={s.arpValue}>{displayARP}</Text>
          <View style={[s.levelBadge, { backgroundColor: arpLevel.color + '25', borderColor: arpLevel.color + '50' }]}>
            <Text style={[s.levelBadgeTxt, { color: arpLevel.color }]}>{arpLevel.label}</Text>
          </View>

          {/* Progress bar */}
          <View style={s.progressTrack}>
            <View style={[s.progressFill, { width: `${progressPct}%` as never }]} />
          </View>
          <Text style={s.progressLabel}>
            {examTarget.toUpperCase()} hedefine %{progressPct}
          </Text>
        </Animated.View>

        {/* Metrikler */}
        <Animated.View style={[s.metricsRow, metrStyle]}>
          <View style={s.metricCard}>
            <Text style={s.metricValue}>{result.baselineWpm}</Text>
            <Text style={s.metricUnit}>WPM</Text>
            <Text style={s.metricLabel}>Okuma Hızı</Text>
          </View>
          <View style={s.metricCard}>
            <Text style={s.metricValue}>%{result.baselineComprehension}</Text>
            <Text style={s.metricUnit}>Kavrama</Text>
            <Text style={s.metricLabel}>Anlama Oranı</Text>
          </View>
        </Animated.View>

        {/* Öneri modülü */}
        {primaryMod && (
          <Animated.View style={[recStyle, s.recommendBox, { borderColor: primaryColor + '60' }]}>
            <Text style={s.recommendTitle}>💡 Önerilen Başlangıç Modülü</Text>
            <View style={s.recommendRow}>
              <View style={[s.recommendIconWrap, { backgroundColor: primaryColor + '20' }]}>
                <Text style={s.recommendIcon}>{primaryMod.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.recommendName, { color: primaryColor }]}>{primaryMod.label}</Text>
                <Text style={s.recommendDesc}>{primaryMod.description}</Text>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Kayıt durumu */}
        {saving && (
          <View style={s.savingRow}>
            <ActivityIndicator size="small" color={ACCENT} />
            <Text style={s.savingTxt}>Sonuçlar kaydediliyor...</Text>
          </View>
        )}
        {saveError && (
          <View style={s.errorBox}>
            <Text style={s.errorTxt}>⚠️ {saveError}</Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={s.retryTxt}>Tekrar Dene</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* CTA */}
        <Animated.View style={btnStyle}>
          <TouchableOpacity
            style={[s.ctaBtn, saving && !saved && s.ctaBtnDisabled]}
            onPress={handleContinue}
            activeOpacity={0.85}
          >
            <Text style={s.ctaTxt}>
              {saved ? '🚀 Antrenmanına Başla →' : 'Devam Et →'}
            </Text>
          </TouchableOpacity>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe:             { flex: 1, backgroundColor: BG },
  scroll:           { padding: 24, paddingBottom: 48 },
  // Empty state
  emptyWrap:        { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText:        { fontSize: 16, color: SUB },
  emptyLink:        { fontSize: 15, color: ACCENT, fontWeight: '600' },
  // Hero
  hero:             { alignItems: 'center', marginBottom: 24, marginTop: 8 },
  heroEmoji:        { fontSize: 56, marginBottom: 10 },
  heroTitle:        { fontSize: 24, fontWeight: '800', color: TEXT, marginBottom: 4 },
  heroSub:          { fontSize: 15, color: SUB },
  // ARP card
  arpCard:          {
    backgroundColor: CARD, borderRadius: 20,
    padding: 24, marginBottom: 14, alignItems: 'center',
    borderWidth: 1.5, borderColor: ACCENT + '40',
  },
  arpLabel:         { fontSize: 13, color: SUB, marginBottom: 6 },
  arpValue:         { fontSize: 80, fontWeight: '900', color: TEXT, lineHeight: 90 },
  levelBadge:       {
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5,
    borderWidth: 1, marginBottom: 16, marginTop: 4,
  },
  levelBadgeTxt:    { fontSize: 14, fontWeight: '700' },
  progressTrack:    { width: '100%', height: 6, backgroundColor: SURF, borderRadius: 3, overflow: 'hidden' },
  progressFill:     { height: 6, backgroundColor: ACCENT, borderRadius: 3 },
  progressLabel:    { fontSize: 12, color: SUB, marginTop: 8 },
  // Metrikler
  metricsRow:       { flexDirection: 'row', gap: 12, marginBottom: 14 },
  metricCard:       {
    flex: 1, backgroundColor: CARD,
    borderRadius: 16, padding: 18, alignItems: 'center',
    borderWidth: 1, borderColor: BORDER,
  },
  metricValue:      { fontSize: 30, fontWeight: '900', color: TEXT },
  metricUnit:       { fontSize: 13, fontWeight: '700', color: ACCENT, marginTop: 2 },
  metricLabel:      { fontSize: 11, color: SUB, marginTop: 2 },
  // Öneri
  recommendBox:     {
    backgroundColor: CARD, borderWidth: 1.5,
    borderRadius: 16, padding: 16, marginBottom: 20,
  },
  recommendTitle:   { fontSize: 12, fontWeight: '700', color: SUB, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  recommendRow:     { flexDirection: 'row', alignItems: 'center', gap: 12 },
  recommendIconWrap:{ width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  recommendIcon:    { fontSize: 26 },
  recommendName:    { fontSize: 17, fontWeight: '800', marginBottom: 3 },
  recommendDesc:    { fontSize: 13, color: SUB },
  // Saving
  savingRow:        { flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 14 },
  savingTxt:        { fontSize: 14, color: SUB },
  errorBox:         {
    backgroundColor: '#2D0A0A', borderRadius: 12, padding: 14,
    alignItems: 'center', gap: 8, marginBottom: 14,
    borderWidth: 1, borderColor: '#7F1D1D',
  },
  errorTxt:         { fontSize: 14, color: '#FCA5A5' },
  retryTxt:         { fontSize: 14, fontWeight: '700', color: '#F87171' },
  // CTA
  ctaBtn:           { backgroundColor: ACCENT, borderRadius: 16, paddingVertical: 18, alignItems: 'center' },
  ctaBtnDisabled:   { opacity: 0.6 },
  ctaTxt:           { fontSize: 17, fontWeight: '700', color: '#FFF' },
})
