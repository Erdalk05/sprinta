import React, { useState, useMemo } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform,
} from 'react-native'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { useAppTheme } from '../../src/theme/useAppTheme'
import type { AppTheme } from '../../src/theme'
import { useAuthStore } from '../../src/stores/authStore'

export default function LoginScreen() {
  const t = useAppTheme()
  const s = useMemo(() => ms(t), [t])
  const router = useRouter()
  const { login, isLoading } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleLogin() {
    if (!email || !password) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      Alert.alert('Eksik Bilgi', 'Email ve şifrenizi girin')
      return
    }

    const result = await login({ email, password })

    if (result.success) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      router.replace('/(tabs)')
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      Alert.alert('Giriş Başarısız', result.error ?? 'Bir hata oluştu')
    }
  }

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Text style={s.title}>Tekrar Hoş Geldin</Text>
      <Text style={s.subtitle}>Hesabına giriş yap</Text>

      <TextInput
        style={s.input}
        placeholder="Email adresi"
        placeholderTextColor={t.colors.textHint}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={s.input}
        placeholder="Şifre"
        placeholderTextColor={t.colors.textHint}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        onPress={() => router.push('/(auth)/forgot-password')}
        style={s.forgotPassword}
      >
        <Text style={s.forgotPasswordText}>Şifremi unuttum</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[s.button, isLoading ? s.buttonDisabled : null]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        <Text style={s.buttonText}>
          {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push('/(auth)/register')}
        style={s.registerLink}
      >
        <Text style={s.registerLinkText}>
          Hesabın yok mu?{' '}
          <Text style={s.registerLinkBold}>Kayıt ol</Text>
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  )
}

function ms(t: AppTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: t.colors.background,
      padding: 24,
      justifyContent: 'center',
    },
    title:    { fontSize: 28, fontWeight: '700', color: t.colors.text, marginBottom: 8 },
    subtitle: { fontSize: 16, color: t.colors.textSub, marginBottom: 40 },
    input: {
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.border,
      borderRadius: 12,
      padding: 14,
      fontSize: 16,
      color: t.colors.text,
      marginBottom: 16,
    },
    forgotPassword:     { alignSelf: 'flex-end', marginBottom: 24 },
    forgotPasswordText: { color: t.colors.primary, fontSize: 14 },
    button: {
      backgroundColor: t.colors.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginBottom: 16,
    },
    buttonDisabled:  { opacity: 0.6 },
    buttonText:      { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
    registerLink:    { alignItems: 'center' },
    registerLinkText:{ color: t.colors.textSub, fontSize: 14 },
    registerLinkBold:{ color: t.colors.primary, fontWeight: '600' },
  })
}
