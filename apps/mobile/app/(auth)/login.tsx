import React, { useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { useAuthStore } from '../../src/stores/authStore'
import { Button } from '../../src/components/ui/Button'
import { Input } from '../../src/components/ui/Input'
import { colors } from '../../src/theme/colors'
import { typography } from '../../src/theme/typography'
import { shadows } from '../../src/theme/shadows'
import { spacing } from '../../src/theme/spacing'

export default function LoginScreen() {
  const router = useRouter()
  const { login, isLoading } = useAuthStore()
  const [email, setEmail]       = useState('')
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
      style={s.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Üst gradient alan — %40 */}
        <LinearGradient
          colors={[colors.primaryDarker, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.hero}
        >
          <Text style={s.logo}>SPRINTA</Text>
          <Text style={s.tagline}>Odaklan. Anla. Başar.</Text>
        </LinearGradient>

        {/* Giriş kartı — -40px overlap */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Tekrar Hoş Geldin 👋</Text>
          <Text style={s.cardSub}>Hesabına giriş yap</Text>

          <Input
            label="Email"
            placeholder="ornek@mail.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon="mail-outline"
          />

          <Input
            label="Şifre"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            isPassword
            leftIcon="lock-closed-outline"
          />

          <TouchableOpacity
            onPress={() => router.push('/(auth)/forgot-password')}
            style={s.forgot}
          >
            <Text style={s.forgotTxt}>Şifremi unuttum →</Text>
          </TouchableOpacity>

          <Button
            title={isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            onPress={handleLogin}
            loading={isLoading}
            fullWidth
            size="lg"
            style={s.loginBtn}
          />

          <View style={s.dividerRow}>
            <View style={s.dividerLine} />
            <Text style={s.dividerTxt}>veya</Text>
            <View style={s.dividerLine} />
          </View>

          <TouchableOpacity
            onPress={() => router.push('/(auth)/register')}
            style={s.registerRow}
          >
            <Text style={s.registerTxt}>
              Hesabın yok mu?{' '}
              <Text style={s.registerBold}>Kayıt Ol</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1 },

  // Hero
  hero: {
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  logo:    { fontSize: 36, fontWeight: '800', color: colors.white, letterSpacing: 4 },
  tagline: { ...(typography.body as object), color: 'rgba(255,255,255,0.8)', marginTop: 8 },

  // Card
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    marginHorizontal: spacing.md,
    marginTop: -40,
    padding: spacing.lg,
    ...shadows.lg,
  },
  cardTitle: { ...(typography.h2 as object), color: colors.textPrimary, marginBottom: 4 },
  cardSub:   { ...(typography.body as object), color: colors.textSecondary, marginBottom: spacing.lg },

  // Forgot
  forgot:    { alignSelf: 'flex-end', marginBottom: spacing.md, marginTop: -8 },
  forgotTxt: { ...(typography.label as object), color: colors.primary },

  // Login button
  loginBtn: { marginBottom: spacing.md },

  // Divider
  dividerRow:  { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.sm },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerTxt:  { ...(typography.caption as object), color: colors.textSecondary, marginHorizontal: spacing.sm },

  // Register
  registerRow: { alignItems: 'center', marginTop: spacing.sm, paddingBottom: spacing.sm },
  registerTxt: { ...(typography.label as object), color: colors.textSecondary },
  registerBold:{ color: colors.primary, fontWeight: '600' },
})
