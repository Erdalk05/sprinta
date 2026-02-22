import React, { useState, useMemo } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { useAppTheme } from '../../src/theme/useAppTheme'
import type { AppTheme } from '../../src/theme'
import { useAuthStore } from '../../src/stores/authStore'

const EXAM_OPTIONS = [
  { value: 'lgs',   label: 'LGS (8. Sınıf)' },
  { value: 'tyt',   label: 'TYT' },
  { value: 'ayt',   label: 'AYT' },
  { value: 'kpss',  label: 'KPSS' },
  { value: 'ales',  label: 'ALES' },
  { value: 'yds',   label: 'YDS' },
]

const GRADE_OPTIONS = [
  { value: 'ortaokul_8', label: '8. Sınıf' },
  { value: 'lise_9',     label: '9. Sınıf' },
  { value: 'lise_10',    label: '10. Sınıf' },
  { value: 'lise_11',    label: '11. Sınıf' },
  { value: 'lise_12',    label: '12. Sınıf' },
  { value: 'universite', label: 'Üniversite' },
  { value: 'yetiskin',   label: 'Mezun / Yetişkin' },
]

export default function RegisterScreen() {
  const t = useAppTheme()
  const s = useMemo(() => ms(t), [t])
  const router = useRouter()
  const { register, isLoading } = useAuthStore()

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    examTarget: 'tyt',
    gradeLevel: 'lise_11',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({})

  function validate() {
    const newErrors: Partial<Record<keyof typeof form, string>> = {}
    if (form.fullName.trim().length < 2) {
      newErrors.fullName = 'Ad soyad en az 2 karakter olmalı'
    }
    if (!form.email.includes('@')) {
      newErrors.email = 'Geçerli bir email girin'
    }
    if (form.password.length < 8) {
      newErrors.password = 'Şifre en az 8 karakter olmalı'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleRegister() {
    if (!validate()) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      return
    }

    const result = await register(form)

    if (result.success) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      router.replace('/(onboarding)/welcome')
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      Alert.alert('Kayıt Başarısız', result.error ?? 'Bir hata oluştu')
    }
  }

  return (
    <ScrollView style={s.container} keyboardShouldPersistTaps="handled">
      <Text style={s.title}>Hesap Oluştur</Text>
      <Text style={s.subtitle}>Sınav başarın için ilk adım</Text>

      <View style={s.field}>
        <Text style={s.label}>Ad Soyad</Text>
        <TextInput
          style={[s.input, errors.fullName ? s.inputError : null]}
          placeholder="Adın ve soyadın"
          placeholderTextColor={t.colors.textHint}
          value={form.fullName}
          onChangeText={v => setForm(f => ({ ...f, fullName: v }))}
          autoCapitalize="words"
        />
        {errors.fullName ? <Text style={s.error}>{errors.fullName}</Text> : null}
      </View>

      <View style={s.field}>
        <Text style={s.label}>Email</Text>
        <TextInput
          style={[s.input, errors.email ? s.inputError : null]}
          placeholder="ornek@email.com"
          placeholderTextColor={t.colors.textHint}
          value={form.email}
          onChangeText={v => setForm(f => ({ ...f, email: v.toLowerCase() }))}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email ? <Text style={s.error}>{errors.email}</Text> : null}
      </View>

      <View style={s.field}>
        <Text style={s.label}>Şifre</Text>
        <TextInput
          style={[s.input, errors.password ? s.inputError : null]}
          placeholder="En az 8 karakter"
          placeholderTextColor={t.colors.textHint}
          value={form.password}
          onChangeText={v => setForm(f => ({ ...f, password: v }))}
          secureTextEntry
        />
        {errors.password ? <Text style={s.error}>{errors.password}</Text> : null}
      </View>

      <View style={s.field}>
        <Text style={s.label}>Sınıf Seviyesi</Text>
        <View style={s.optionGrid}>
          {GRADE_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.value}
              style={[
                s.optionChip,
                form.gradeLevel === opt.value ? s.optionChipSelected : null,
              ]}
              onPress={() => {
                Haptics.selectionAsync()
                setForm(f => ({ ...f, gradeLevel: opt.value }))
              }}
            >
              <Text style={[
                s.optionChipText,
                form.gradeLevel === opt.value ? s.optionChipTextSelected : null,
              ]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={s.field}>
        <Text style={s.label}>Hedef Sınav</Text>
        <View style={s.optionGrid}>
          {EXAM_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.value}
              style={[
                s.optionChip,
                form.examTarget === opt.value ? s.optionChipSelected : null,
              ]}
              onPress={() => {
                Haptics.selectionAsync()
                setForm(f => ({ ...f, examTarget: opt.value }))
              }}
            >
              <Text style={[
                s.optionChipText,
                form.examTarget === opt.value ? s.optionChipTextSelected : null,
              ]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[s.button, isLoading ? s.buttonDisabled : null]}
        onPress={handleRegister}
        disabled={isLoading}
      >
        <Text style={s.buttonText}>
          {isLoading ? 'Kaydediliyor...' : 'Devam Et →'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={s.loginLink}
        onPress={() => router.push('/(auth)/login')}
      >
        <Text style={s.loginLinkText}>
          Zaten hesabın var mı?{' '}
          <Text style={s.loginLinkBold}>Giriş yap</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

function ms(t: AppTheme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: t.colors.background, padding: 24 },
    title:    { fontSize: 28, fontWeight: '700', color: t.colors.text, marginTop: 48, marginBottom: 8 },
    subtitle: { fontSize: 16, color: t.colors.textSub, marginBottom: 32 },
    field:    { marginBottom: 20 },
    label:    { fontSize: 14, fontWeight: '600', color: t.colors.textSub, marginBottom: 8 },
    input: {
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.border,
      borderRadius: 12,
      padding: 14,
      fontSize: 16,
      color: t.colors.text,
    },
    inputError:            { borderColor: t.colors.error },
    error:                 { color: t.colors.error, fontSize: 12, marginTop: 4 },
    optionGrid:            { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    optionChip: {
      paddingHorizontal: 12, paddingVertical: 8,
      borderRadius: 8, borderWidth: 1,
      borderColor: t.colors.border,
      backgroundColor: t.colors.surface,
    },
    optionChipSelected:     { borderColor: t.colors.primary, backgroundColor: t.colors.primary + '25' },
    optionChipText:         { color: t.colors.textSub, fontSize: 13 },
    optionChipTextSelected: { color: t.colors.primary, fontWeight: '600' },
    button: {
      backgroundColor: t.colors.primary,
      borderRadius: 12, padding: 16,
      alignItems: 'center', marginTop: 8, marginBottom: 16,
    },
    buttonDisabled: { opacity: 0.6 },
    buttonText:     { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
    loginLink:      { alignItems: 'center', paddingBottom: 40 },
    loginLinkText:  { color: t.colors.textSub, fontSize: 14 },
    loginLinkBold:  { color: t.colors.primary, fontWeight: '600' },
  })
}
