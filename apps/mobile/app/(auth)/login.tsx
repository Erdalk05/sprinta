import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform,
} from 'react-native'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { useAuthStore } from '../../src/stores/authStore'

export default function LoginScreen() {
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
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Text style={styles.title}>Tekrar Hoş Geldin</Text>
      <Text style={styles.subtitle}>Hesabına giriş yap</Text>

      <TextInput
        style={styles.input}
        placeholder="Email adresi"
        placeholderTextColor="#64748B"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Şifre"
        placeholderTextColor="#64748B"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        onPress={() => router.push('/(auth)/forgot-password')}
        style={styles.forgotPassword}
      >
        <Text style={styles.forgotPasswordText}>Şifremi unuttum</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, isLoading ? styles.buttonDisabled : null]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push('/(auth)/register')}
        style={styles.registerLink}
      >
        <Text style={styles.registerLinkText}>
          Hesabın yok mu?{' '}
          <Text style={styles.registerLinkBold}>Kayıt ol</Text>
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 24,
    justifyContent: 'center',
  },
  title: { fontSize: 28, fontWeight: '700', color: '#F1F5F9', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#94A3B8', marginBottom: 40 },
  input: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#F1F5F9',
    marginBottom: 16,
  },
  forgotPassword: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotPasswordText: { color: '#6366F1', fontSize: 14 },
  button: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  registerLink: { alignItems: 'center' },
  registerLinkText: { color: '#64748B', fontSize: 14 },
  registerLinkBold: { color: '#6366F1', fontWeight: '600' },
})
