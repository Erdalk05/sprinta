import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform,
} from 'react-native'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { createClient } from '@supabase/supabase-js'
import { createAuthService } from '@sprinta/api'

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
)
const authService = createAuthService(supabase)

export default function ForgotPasswordScreen() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleReset() {
    if (!email.includes('@')) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      Alert.alert('Geçersiz Email', 'Geçerli bir email adresi girin')
      return
    }

    setIsLoading(true)
    try {
      const result = await authService.resetPassword(email)
      if (result.success) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        setSent(true)
      } else {
        Alert.alert('Hata', result.error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (sent) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Email Gönderildi</Text>
        <Text style={styles.subtitle}>
          {email} adresine şifre sıfırlama bağlantısı gönderildi.
        </Text>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Text style={styles.backText}>← Geri</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Şifremi Unuttum</Text>
      <Text style={styles.subtitle}>
        Email adresini gir, sana sıfırlama bağlantısı gönderelim.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email adresi"
        placeholderTextColor="#64748B"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableOpacity
        style={[styles.button, isLoading ? styles.buttonDisabled : null]}
        onPress={handleReset}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', padding: 24, justifyContent: 'center' },
  back: { position: 'absolute', top: 60, left: 24 },
  backText: { color: '#6366F1', fontSize: 16 },
  title: { fontSize: 28, fontWeight: '700', color: '#F1F5F9', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#94A3B8', marginBottom: 32 },
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
  button: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
})
