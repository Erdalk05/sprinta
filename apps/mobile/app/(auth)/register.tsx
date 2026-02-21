import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
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
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Hesap Oluştur</Text>
      <Text style={styles.subtitle}>Sınav başarın için ilk adım</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Ad Soyad</Text>
        <TextInput
          style={[styles.input, errors.fullName ? styles.inputError : null]}
          placeholder="Adın ve soyadın"
          placeholderTextColor="#64748B"
          value={form.fullName}
          onChangeText={v => setForm(f => ({ ...f, fullName: v }))}
          autoCapitalize="words"
        />
        {errors.fullName ? <Text style={styles.error}>{errors.fullName}</Text> : null}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, errors.email ? styles.inputError : null]}
          placeholder="ornek@email.com"
          placeholderTextColor="#64748B"
          value={form.email}
          onChangeText={v => setForm(f => ({ ...f, email: v.toLowerCase() }))}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email ? <Text style={styles.error}>{errors.email}</Text> : null}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Şifre</Text>
        <TextInput
          style={[styles.input, errors.password ? styles.inputError : null]}
          placeholder="En az 8 karakter"
          placeholderTextColor="#64748B"
          value={form.password}
          onChangeText={v => setForm(f => ({ ...f, password: v }))}
          secureTextEntry
        />
        {errors.password ? <Text style={styles.error}>{errors.password}</Text> : null}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Sınıf Seviyesi</Text>
        <View style={styles.optionGrid}>
          {GRADE_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.optionChip,
                form.gradeLevel === opt.value ? styles.optionChipSelected : null,
              ]}
              onPress={() => {
                Haptics.selectionAsync()
                setForm(f => ({ ...f, gradeLevel: opt.value }))
              }}
            >
              <Text style={[
                styles.optionChipText,
                form.gradeLevel === opt.value ? styles.optionChipTextSelected : null,
              ]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Hedef Sınav</Text>
        <View style={styles.optionGrid}>
          {EXAM_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.optionChip,
                form.examTarget === opt.value ? styles.optionChipSelected : null,
              ]}
              onPress={() => {
                Haptics.selectionAsync()
                setForm(f => ({ ...f, examTarget: opt.value }))
              }}
            >
              <Text style={[
                styles.optionChipText,
                form.examTarget === opt.value ? styles.optionChipTextSelected : null,
              ]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, isLoading ? styles.buttonDisabled : null]}
        onPress={handleRegister}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Kaydediliyor...' : 'Devam Et →'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.loginLink}
        onPress={() => router.push('/(auth)/login')}
      >
        <Text style={styles.loginLinkText}>
          Zaten hesabın var mı?{' '}
          <Text style={styles.loginLinkBold}>Giriş yap</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', padding: 24 },
  title: { fontSize: 28, fontWeight: '700', color: '#F1F5F9', marginTop: 48, marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#94A3B8', marginBottom: 32 },
  field: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#CBD5E1', marginBottom: 8 },
  input: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#F1F5F9',
  },
  inputError: { borderColor: '#EF4444' },
  error: { color: '#EF4444', fontSize: 12, marginTop: 4 },
  optionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#1E293B',
  },
  optionChipSelected: { borderColor: '#6366F1', backgroundColor: '#312E81' },
  optionChipText: { color: '#94A3B8', fontSize: 13 },
  optionChipTextSelected: { color: '#A5B4FC', fontWeight: '600' },
  button: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  loginLink: { alignItems: 'center', paddingBottom: 40 },
  loginLinkText: { color: '#64748B', fontSize: 14 },
  loginLinkBold: { color: '#6366F1', fontWeight: '600' },
})
