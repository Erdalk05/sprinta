/**
 * Email Verification Screen
 * Gösterildiğinde: kayıt sonrası __DEV__ dışındaki üretim modunda
 * Kullanıcı emailini doğrulayana kadar bu ekranda bekler.
 */
import React, { useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, Alert, ActivityIndicator,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { supabase } from '../../src/lib/supabase'
import { colors } from '../../src/theme/colors'
import { typography } from '../../src/theme/typography'
import { spacing } from '../../src/theme/spacing'

export default function VerifyEmailScreen() {
  const router = useRouter()
  const { email } = useLocalSearchParams<{ email: string }>()
  const [resending, setResending] = useState(false)
  const [resent,    setResent]    = useState(false)

  async function handleResend() {
    if (!email) return
    setResending(true)
    try {
      const { error } = await supabase.auth.resend({
        type:  'signup',
        email: email,
      })
      if (error) throw error
      setResent(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bir hata oluştu'
      Alert.alert('Hata', msg)
    } finally {
      setResending(false)
    }
  }

  return (
    <SafeAreaView style={s.root}>
      <View style={s.container}>
        {/* Icon */}
        <View style={s.iconCircle}>
          <Text style={s.iconEmoji}>✉️</Text>
        </View>

        {/* Title */}
        <Text style={s.title}>Emailini Doğrula</Text>
        <Text style={s.sub}>
          <Text style={s.emailText}>{email ?? 'e-posta adresine'}</Text>
          {' '}doğrulama linki gönderdik.{'\n'}
          Gelen kutunu kontrol et ve linke tıkla.
        </Text>

        {/* Steps */}
        <View style={s.stepsCard}>
          <Step num="1" text="Gelen kutunu kontrol et (spam klasörü dahil)" />
          <Step num="2" text="Sprinta'dan gelen emaili bul" />
          <Step num="3" text="Emaili Dogrula butonuna tikla" />
          <Step num="4" text="Uygulamaya dön ve giriş yap" />
        </View>

        {/* Resend */}
        {resent ? (
          <View style={s.resentBanner}>
            <Text style={s.resentText}>✓ Yeni link gönderildi</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={s.resendBtn}
            onPress={handleResend}
            disabled={resending}
            activeOpacity={0.75}
          >
            {resending
              ? <ActivityIndicator size="small" color={colors.primary} />
              : <Text style={s.resendTxt}>Email gelmedi mi? Yeniden Gönder</Text>
            }
          </TouchableOpacity>
        )}

        {/* Back to login */}
        <TouchableOpacity
          style={s.loginBtn}
          onPress={() => router.replace('/(auth)/login')}
          activeOpacity={0.85}
        >
          <Text style={s.loginTxt}>Giriş Yap →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

function Step({ num, text }: { num: string; text: string }) {
  return (
    <View style={s.step}>
      <View style={s.stepNum}>
        <Text style={s.stepNumTxt}>{num}</Text>
      </View>
      <Text style={s.stepTxt}>{text}</Text>
    </View>
  )
}

const s = StyleSheet.create({
  root:      { flex: 1, backgroundColor: colors.background },
  container: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl,
  },

  iconCircle: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: colors.primary + '18',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  iconEmoji: { fontSize: 44 },

  title: {
    ...(typography.h2 as object),
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  sub: {
    ...(typography.body as object),
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  emailText: { color: colors.primary, fontWeight: '600' },

  stepsCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 16, padding: spacing.md,
    gap: 12, marginBottom: spacing.lg,
    borderWidth: 1, borderColor: colors.border,
  },
  step:      { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  stepNum:   {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 1,
  },
  stepNumTxt: { fontSize: 12, fontWeight: '700', color: '#fff' },
  stepTxt:    { ...(typography.label as object), color: colors.textSecondary, flex: 1, lineHeight: 20 },

  resentBanner: {
    backgroundColor: '#D1FAE5', borderRadius: 10,
    paddingVertical: 10, paddingHorizontal: 20,
    marginBottom: spacing.md,
  },
  resentText: { color: '#065F46', fontWeight: '600', fontSize: 14 },

  resendBtn: {
    paddingVertical: 10, marginBottom: spacing.md,
  },
  resendTxt: {
    ...(typography.label as object),
    color: colors.primary,
    textDecorationLine: 'underline',
  },

  loginBtn: {
    width: '100%', backgroundColor: colors.primary,
    borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginTop: spacing.sm,
  },
  loginTxt: { fontSize: 16, fontWeight: '700', color: '#fff' },
})
