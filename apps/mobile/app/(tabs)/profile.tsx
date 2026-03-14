import { SafeAreaView } from 'react-native-safe-area-context'
import React, { useMemo, useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet,  Alert, Linking } from 'react-native'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { supabase } from '../../src/lib/supabase'
import { useAppTheme } from '../../src/theme/useAppTheme'
import type { AppTheme } from '../../src/theme'
import { useAuthStore } from '../../src/stores/authStore'
import { useGamificationStore } from '../../src/stores/gamificationStore'
import { XPBar } from '../../src/components/gamification/XPBar'
import { BadgeCard } from '../../src/components/gamification/BadgeCard'


interface SessionStats {
  totalSessions: number
  totalMinutes: number
  weeklyArpChange: number
}

const EXAM_LABELS: Record<string, string> = {
  lgs: 'LGS', tyt: 'TYT', ayt: 'AYT',
  kpss: 'KPSS', ales: 'ALES', yds: 'YDS',
}

const GRADE_LABELS: Record<string, string> = {
  lise_9: '9. Sınıf', lise_10: '10. Sınıf', lise_11: '11. Sınıf', lise_12: '12. Sınıf',
  universite: 'Üniversite', mezun: 'Mezun',
}

type Styles = ReturnType<typeof ms>

export default function ProfileScreen() {
  const t = useAppTheme()
  const s = useMemo(() => ms(t), [t])
  const router = useRouter()
  const { student, logout, isLoading } = useAuthStore()
  const { earnedBadges } = useGamificationStore()
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null)

  useEffect(() => {
    if (!student) return
    const fetchStats = async () => {
      try {
        const { data: sessions } = await supabase
          .from('sessions')
          .select('duration_seconds, arp, created_at')
          .eq('student_id', student.id)
          .eq('is_completed', true)

        const totalSessions = sessions?.length ?? 0
        const totalMinutes = Math.round(
          (sessions?.reduce((sum, s) => sum + (s.duration_seconds ?? 0), 0) ?? 0) / 60
        )
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        const weekSessions = (sessions ?? [])
          .filter(s => new Date(s.created_at) >= weekAgo)
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        const weeklyArpChange = weekSessions.length >= 2
          ? Math.round(weekSessions[weekSessions.length - 1].arp - weekSessions[0].arp)
          : 0
        setSessionStats({ totalSessions, totalMinutes, weeklyArpChange })
      } catch (e) {
        console.warn('[Profile] fetchStats:', e)
      }
    }
    fetchStats()
  }, [student])

  const handleNotifications = () => {
    Haptics.selectionAsync()
    Linking.openSettings()
  }

  const handleChangePassword = () => {
    Haptics.selectionAsync()
    Alert.alert(
      'Şifre Sıfırlama',
      `${student?.email} adresine sıfırlama bağlantısı gönderilsin mi?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Gönder',
          onPress: async () => {
            const { error } = await supabase.auth.resetPasswordForEmail(student?.email ?? '')
            if (error) {
              Alert.alert('Hata', 'E-posta gönderilemedi.')
            } else {
              Alert.alert('✅ Gönderildi', 'E-postanı kontrol et ve bağlantıya tıkla.')
            }
          },
        },
      ],
    )
  }

  const handleHelp = () => {
    Haptics.selectionAsync()
    Alert.alert(
      'Yardım & Destek',
      'Sorun mu yaşıyorsun?\n\n📧 destek@sprinta.app\n\nYa da aşağıdan destek sayfasını ziyaret et.',
      [
        { text: 'Kapat', style: 'cancel' },
        {
          text: 'Destek Sayfası',
          onPress: () => Linking.openURL('https://sprinta.app/destek'),
        },
      ],
    )
  }

  const handleLogout = () => {
    Alert.alert('Çıkış Yap', 'Hesabından çıkmak istediğine emin misin?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Çıkış Yap',
        style: 'destructive',
        onPress: async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
          await logout()
        },
      },
    ])
  }

  if (!student) return null

  const initials = student.fullName
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const diagBg = student.hasCompletedDiagnostic
    ? (t.isDark ? '#0F2357' : '#E8F0FE')
    : (t.isDark ? '#1A3594' : '#FEF9E7')

  return (
    <SafeAreaView style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Avatar */}
        <View style={s.avatarSection}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{initials}</Text>
          </View>
          <Text style={s.name}>{student.fullName}</Text>
          <Text style={s.email}>{student.email}</Text>
          {student.isPremium && (
            <View style={s.premiumBadge}>
              <Text style={s.premiumText}>⭐ Premium</Text>
            </View>
          )}
        </View>

        {/* XP Bar */}
        <View style={s.xpBar}>
          <XPBar totalXp={student.totalXp} />
        </View>

        {/* Genel Bilgiler */}
        <View style={s.card}>
          <InfoRow t={t} s={s} label="Sınav Hedefi" value={EXAM_LABELS[student.examTarget] ?? student.examTarget.toUpperCase()} />
          <InfoRow t={t} s={s} label="Sınıf" value={GRADE_LABELS[student.gradeLevel] ?? student.gradeLevel} border />
          <InfoRow t={t} s={s} label="Seviye" value={`Seviye ${student.level}`} border />
          <InfoRow t={t} s={s} label="Günlük Seri" value={`${student.streakDays} gün 🔥`} border />
        </View>

        {/* Performans */}
        <Text style={s.sectionTitle}>Performans</Text>
        <View style={s.perf}>
          <PerfItem t={t} s={s} label="ARP" value={student.currentArp} accent="#6C3EE8" />
          <PerfItem t={t} s={s} label="Toplam XP" value={student.totalXp} accent="#D97706" />
        </View>

        {/* Seans İstatistikleri */}
        {sessionStats && (
          <View style={s.perf}>
            <PerfItem t={t} s={s} label="Seans" value={sessionStats.totalSessions} accent="#059669" />
            <PerfItem t={t} s={s} label="Dakika" value={sessionStats.totalMinutes} accent="#0EA5E9" />
            <PerfItem
              t={t} s={s} label="Haftalık ARP"
              value={sessionStats.weeklyArpChange}
              accent={sessionStats.weeklyArpChange >= 0 ? '#059669' : '#EF4444'}
              prefix={sessionStats.weeklyArpChange > 0 ? '+' : ''}
            />
          </View>
        )}

        {/* Kazanılan Rozetler */}
        {earnedBadges.length > 0 && (
          <>
            <Text style={s.sectionTitle}>🏅 Rozetlerim ({earnedBadges.length})</Text>
            <View style={{ gap: 8, marginBottom: 20 }}>
              {earnedBadges.map(badge => (
                <BadgeCard key={badge.id} badge={badge} earned size="small" />
              ))}
            </View>
          </>
        )}

        {/* Tanılama Durumu */}
        <View style={[s.diagCard, { backgroundColor: diagBg }]}>
          <Text style={s.diagTitle}>
            {student.hasCompletedDiagnostic ? '✅ Tanılama Tamamlandı' : '⏳ Tanılama Bekleniyor'}
          </Text>
          <Text style={s.diagText}>
            {student.hasCompletedDiagnostic
              ? 'Başlangıç ARP değerin belirlendi.'
              : 'Kişisel ARP hedefini belirlemek için tanılama testini tamamla.'}
          </Text>
        </View>

        {/* Ayarlar Bölümü */}
        <Text style={s.sectionTitle}>Hesap</Text>
        <View style={s.card}>
          <TouchableOpacity style={s.menuRow} onPress={handleNotifications} activeOpacity={0.7}>
            <Text style={s.menuLabel}>🔔 Bildirimler</Text>
            <Text style={s.menuArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.menuRow, s.menuBorder]} onPress={handleChangePassword} activeOpacity={0.7}>
            <Text style={s.menuLabel}>🔒 Şifre Değiştir</Text>
            <Text style={s.menuArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.menuRow, s.menuBorder]} onPress={handleHelp} activeOpacity={0.7}>
            <Text style={s.menuLabel}>❓ Yardım</Text>
            <Text style={s.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Çıkış */}
        <TouchableOpacity
          style={s.logoutButton}
          onPress={handleLogout}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <Text style={s.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>

        <Text style={s.version}>SPRINTA v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

function InfoRow({ t, s, label, value, border }: { t: AppTheme; s: Styles; label: string; value: string; border?: boolean }) {
  return (
    <View style={[s.infoRow, border && s.infoBorder]}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value}</Text>
    </View>
  )
}

function PerfItem({ t, s, label, value, accent, prefix = '' }: { t: AppTheme; s: Styles; label: string; value: number; accent: string; prefix?: string }) {
  return (
    <View style={[s.perfItem, { borderTopColor: accent, borderTopWidth: 3 }]}>
      <Text style={[s.perfValue, { color: accent }]}>{prefix}{value.toLocaleString('tr')}</Text>
      <Text style={s.perfLabel}>{label}</Text>
    </View>
  )
}

function ms(t: AppTheme) {
  return StyleSheet.create({
    container:     { flex: 1, backgroundColor: t.colors.background },
    scroll:        { padding: 20, paddingBottom: 48 },
    avatarSection: { alignItems: 'center', marginBottom: 28, marginTop: 8 },
    avatar: {
      width: 84, height: 84, borderRadius: 42,
      backgroundColor: t.colors.primary, alignItems: 'center', justifyContent: 'center',
      marginBottom: 12,
    },
    avatarText:   { fontSize: 32, fontWeight: '800', color: '#FFFFFF' },
    name:         { fontSize: 22, fontWeight: '800', color: t.colors.text, marginBottom: 4 },
    email:        { fontSize: 14, color: t.colors.textSub, marginBottom: 10 },
    premiumBadge: {
      backgroundColor: t.isDark ? '#1A3594' : '#E8F0FE',
      borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6,
    },
    premiumText:  { fontSize: 13, fontWeight: '700', color: t.isDark ? '#F59E0B' : '#92400E' },
    card: {
      backgroundColor: t.colors.surface, borderRadius: 16,
      overflow: 'hidden', marginBottom: 20,
    },
    infoRow:    { flexDirection: 'row', justifyContent: 'space-between', padding: 16 },
    infoBorder: { borderTopWidth: 1, borderTopColor: t.colors.border },
    infoLabel:  { fontSize: 14, color: t.colors.textSub },
    infoValue:  { fontSize: 14, fontWeight: '600', color: t.colors.text },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: t.colors.text, marginBottom: 12 },
    perf:       { flexDirection: 'row', gap: 12, marginBottom: 20 },
    perfItem: {
      flex: 1, backgroundColor: t.colors.surface,
      borderRadius: 14, padding: 16, alignItems: 'center',
    },
    perfValue:  { fontSize: 28, fontWeight: '900', marginBottom: 4 },
    perfLabel:  { fontSize: 12, color: t.colors.textHint },
    diagCard:   { borderRadius: 14, padding: 16, marginBottom: 24 },
    diagTitle:  { fontSize: 14, fontWeight: '700', color: t.colors.text, marginBottom: 6 },
    diagText:   { fontSize: 13, color: t.colors.textSub, lineHeight: 20 },
    xpBar:      { marginBottom: 20 },
    menuRow:    { flexDirection: 'row', justifyContent: 'space-between', padding: 16, alignItems: 'center' },
    menuBorder: { borderTopWidth: 1, borderTopColor: t.colors.border },
    menuLabel:  { fontSize: 15, color: t.colors.text },
    menuArrow:  { fontSize: 20, color: t.colors.textHint },
    logoutButton: {
      borderWidth: 1.5, borderColor: t.colors.error,
      borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 16,
    },
    logoutText: { fontSize: 15, fontWeight: '700', color: t.colors.error },
    version:    { textAlign: 'center', fontSize: 12, color: t.colors.textHint },
  })
}
