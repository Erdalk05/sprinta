import React, { useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { useAuthStore } from '../../src/stores/authStore'
import { useOnboardingStore } from '../../src/features/onboarding/onboardingStore'
import { createClient } from '@supabase/supabase-js'
import { Button } from '../../src/components/ui/Button'
import { Input } from '../../src/components/ui/Input'
import { colors } from '../../src/theme/colors'
import { typography } from '../../src/theme/typography'
import { shadows } from '../../src/theme/shadows'
import { spacing } from '../../src/theme/spacing'

const EXAM_OPTIONS = [
  { value: 'lgs',  label: 'LGS' },
  { value: 'tyt',  label: 'TYT' },
  { value: 'ayt',  label: 'AYT' },
  { value: 'kpss', label: 'KPSS' },
  { value: 'ales', label: 'ALES' },
  { value: 'yds',  label: 'YDS' },
]

const GRADE_GROUPS = [
  {
    group: 'Ortaokul',
    options: [
      { value: 'ilkokul_5',  label: '5. Sınıf' },
      { value: 'ortaokul_6', label: '6. Sınıf' },
      { value: 'ortaokul_7', label: '7. Sınıf' },
      { value: 'ortaokul_8', label: '8. Sınıf' },
    ],
  },
  {
    group: 'Lise',
    options: [
      { value: 'lise_9',  label: '9. Sınıf'  },
      { value: 'lise_10', label: '10. Sınıf' },
      { value: 'lise_11', label: '11. Sınıf' },
      { value: 'lise_12', label: '12. Sınıf' },
    ],
  },
  {
    group: 'Diğer',
    options: [
      { value: 'universite', label: 'Üniversite' },
      { value: 'yetiskin',   label: 'Mezun'       },
    ],
  },
]

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
)

export default function RegisterScreen() {
  const router = useRouter()
  const { register, isLoading, student } = useAuthStore()
  const { quizResult, startedAt, setCompleted, saveToStorage } = useOnboardingStore()

  const [form, setForm] = useState({
    fullName:    '',
    email:       '',
    password:    '',
    examTarget:  'tyt',
    gradeLevel:  'lise_11',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({})

  function validate() {
    const e: Partial<Record<keyof typeof form, string>> = {}
    if (form.fullName.trim().length < 2) e.fullName = 'Ad soyad en az 2 karakter olmalı'
    if (!form.email.includes('@'))       e.email    = 'Geçerli bir email girin'
    if (form.password.length < 8)        e.password = 'Şifre en az 8 karakter olmalı'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleRegister() {
    if (!validate()) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      return
    }
    const result = await register(form)
    if (result.success) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      // Quiz sonucu varsa kaydet
      if (quizResult && student?.id) {
        try {
          await supabase.from('students').update({
            baseline_arp: quizResult.baseARP,
            current_arp: quizResult.baseARP,
          }).eq('id', student.id)

          await supabase.from('onboarding_telemetry').insert({
            user_id: student.id,
            onboarding_duration_ms: startedAt ? Date.now() - startedAt : null,
            quiz_accuracy: quizResult.accuracy,
            avg_response_time_ms: quizResult.avgResponseTimeMs,
            strong_topic: quizResult.strongTopic,
            weak_topic: quizResult.weakTopic,
            base_arp: quizResult.baseARP,
          })
        } catch {
          // telemetri hatası uygulamayı durdurmasın
        }
      }
      setCompleted(true)
      await saveToStorage()
      router.replace('/(onboarding)/welcome')
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      Alert.alert('Kayıt Başarısız', result.error ?? 'Bir hata oluştu')
    }
  }

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Üst gradient alan */}
        <LinearGradient
          colors={[colors.primaryDarker, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.hero}
        >
          <Text style={s.logo}>SPRINTA</Text>
          <Text style={s.tagline}>Sınav başarın için ilk adım</Text>
        </LinearGradient>

        {/* Kayıt kartı */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Hesap Oluştur 🚀</Text>
          <Text style={s.cardSub}>Birkaç saniyede başla</Text>

          <Input
            label="Ad Soyad"
            placeholder="Adın ve soyadın"
            value={form.fullName}
            onChangeText={v => setForm(f => ({ ...f, fullName: v }))}
            autoCapitalize="words"
            leftIcon="person-outline"
            error={errors.fullName}
          />

          <Input
            label="Email"
            placeholder="ornek@mail.com"
            value={form.email}
            onChangeText={v => setForm(f => ({ ...f, email: v.toLowerCase() }))}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon="mail-outline"
            error={errors.email}
          />

          <Input
            label="Şifre"
            placeholder="En az 8 karakter"
            value={form.password}
            onChangeText={v => setForm(f => ({ ...f, password: v }))}
            isPassword
            leftIcon="lock-closed-outline"
            error={errors.password}
          />

          {/* Sınıf seçimi */}
          <Text style={s.sectionLabel}>Sınıf Seviyesi</Text>
          <View style={s.gradeGrid}>
            {GRADE_GROUPS.map(({ group, options }) => (
              <View key={group} style={s.gradeGroup}>
                <Text style={s.gradeGroupLabel}>{group}</Text>
                <View style={s.chipRow}>
                  {options.map(opt => {
                    const sel = form.gradeLevel === opt.value
                    return (
                      <TouchableOpacity
                        key={opt.value}
                        style={[s.chipFlex, sel && s.chipSelected]}
                        onPress={() => { Haptics.selectionAsync(); setForm(f => ({ ...f, gradeLevel: opt.value })) }}
                      >
                        <Text style={[s.chipTxt, sel && s.chipTxtSelected]}>{opt.label}</Text>
                      </TouchableOpacity>
                    )
                  })}
                </View>
              </View>
            ))}
          </View>

          {/* Sınav seçimi */}
          <Text style={s.sectionLabel}>Hedef Sınav</Text>
          <View style={s.chipGrid}>
            {EXAM_OPTIONS.map(opt => {
              const sel = form.examTarget === opt.value
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[s.chip, sel && s.chipSelected]}
                  onPress={() => { Haptics.selectionAsync(); setForm(f => ({ ...f, examTarget: opt.value })) }}
                >
                  <Text style={[s.chipTxt, sel && s.chipTxtSelected]}>{opt.label}</Text>
                </TouchableOpacity>
              )
            })}
          </View>

          <Button
            title={isLoading ? 'Kaydediliyor...' : 'Kayıt Ol →'}
            onPress={handleRegister}
            loading={isLoading}
            fullWidth
            size="lg"
            style={s.registerBtn}
          />

          <TouchableOpacity
            style={s.loginRow}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={s.loginTxt}>
              Zaten hesabın var mı?{' '}
              <Text style={s.loginBold}>Giriş Yap</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, paddingBottom: spacing.xxl },

  hero: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 32,
  },
  logo:    { fontSize: 36, fontWeight: '800', color: colors.white, letterSpacing: 4 },
  tagline: { ...(typography.body as object), color: 'rgba(255,255,255,0.8)', marginTop: 8 },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    marginHorizontal: spacing.md,
    marginTop: -32,
    padding: spacing.lg,
    ...shadows.lg,
  },
  cardTitle:    { ...(typography.h2 as object), color: colors.textPrimary, marginBottom: 4 },
  cardSub:      { ...(typography.body as object), color: colors.textSecondary, marginBottom: spacing.lg },

  sectionLabel: { ...(typography.label as object), color: colors.textSecondary, marginBottom: 8, marginTop: 4 },

  chipGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.md },

  // Gruplu sınıf seviyesi grid
  gradeGrid:       { gap: 10, marginBottom: spacing.md },
  gradeGroup:      { gap: 6 },
  gradeGroupLabel: {
    fontSize: 11, fontWeight: '700', color: colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.8,
  },
  chipRow:  { flexDirection: 'row', gap: 8 },
  chipFlex: {
    flex: 1, paddingVertical: 9,
    borderRadius: 8, borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },

  chip: {
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 8, borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: { borderColor: colors.primary, backgroundColor: colors.primary + '20' },
  chipTxt:         { ...(typography.label as object), color: colors.textSecondary },
  chipTxtSelected: { color: colors.primary, fontWeight: '600' },

  registerBtn: { marginTop: spacing.md, marginBottom: spacing.sm },

  loginRow: { alignItems: 'center', paddingVertical: spacing.sm },
  loginTxt: { ...(typography.label as object), color: colors.textSecondary },
  loginBold:{ color: colors.primary, fontWeight: '600' },
})
