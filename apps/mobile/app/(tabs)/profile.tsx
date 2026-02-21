import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { colors } from '../../src/constants/colors'
import { useAuthStore } from '../../src/stores/authStore'
import { XPBar } from '../../src/components/gamification/XPBar'

const EXAM_LABELS: Record<string, string> = {
  lgs: 'LGS', tyt: 'TYT', ayt: 'AYT',
  kpss: 'KPSS', ales: 'ALES', yds: 'YDS',
}

const GRADE_LABELS: Record<string, string> = {
  lise_9: '9. Sınıf', lise_10: '10. Sınıf', lise_11: '11. Sınıf', lise_12: '12. Sınıf',
  universite: 'Üniversite', mezun: 'Mezun',
}

export default function ProfileScreen() {
  const router = useRouter()
  const { student, logout, isLoading } = useAuthStore()

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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{student.fullName}</Text>
          <Text style={styles.email}>{student.email}</Text>
          {student.isPremium && (
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumText}>⭐ Premium</Text>
            </View>
          )}
        </View>

        {/* XP Bar */}
        <View style={styles.xpBar}>
          <XPBar totalXp={student.totalXp} />
        </View>

        {/* Genel Bilgiler */}
        <View style={styles.card}>
          <InfoRow label="Sınav Hedefi" value={EXAM_LABELS[student.examTarget] ?? student.examTarget.toUpperCase()} />
          <InfoRow label="Sınıf" value={GRADE_LABELS[student.gradeLevel] ?? student.gradeLevel} border />
          <InfoRow label="Seviye" value={`Seviye ${student.level}`} border />
          <InfoRow label="Günlük Seri" value={`${student.streakDays} gün 🔥`} border />
        </View>

        {/* Performans */}
        <Text style={styles.sectionTitle}>Performans</Text>
        <View style={styles.perf}>
          <PerfItem label="ARP" value={student.currentArp} accent="#6C3EE8" />
          <PerfItem label="Toplam XP" value={student.totalXp} accent="#D97706" />
        </View>

        {/* Tanılama Durumu */}
        <View style={[
          styles.diagCard,
          { backgroundColor: student.hasCompletedDiagnostic ? '#D1FAE5' : '#FEF3C7' }
        ]}>
          <Text style={styles.diagTitle}>
            {student.hasCompletedDiagnostic ? '✅ Tanılama Tamamlandı' : '⏳ Tanılama Bekleniyor'}
          </Text>
          <Text style={styles.diagText}>
            {student.hasCompletedDiagnostic
              ? 'Başlangıç ARP değerin belirlendi.'
              : 'Kişisel ARP hedefini belirlemek için tanılama testini tamamla.'}
          </Text>
        </View>

        {/* Ayarlar Bölümü */}
        <Text style={styles.sectionTitle}>Hesap</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.menuRow} activeOpacity={0.7}>
            <Text style={styles.menuLabel}>🔔 Bildirimler</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuRow, styles.menuBorder]} activeOpacity={0.7}>
            <Text style={styles.menuLabel}>🔒 Şifre Değiştir</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuRow, styles.menuBorder]} activeOpacity={0.7}>
            <Text style={styles.menuLabel}>❓ Yardım</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Çıkış */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>

        <Text style={styles.version}>SPRINTA v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

function InfoRow({ label, value, border }: { label: string; value: string; border?: boolean }) {
  return (
    <View style={[styles.infoRow, border && styles.infoBorder]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  )
}

function PerfItem({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <View style={[styles.perfItem, { borderTopColor: accent, borderTopWidth: 3 }]}>
      <Text style={[styles.perfValue, { color: accent }]}>{value.toLocaleString('tr')}</Text>
      <Text style={styles.perfLabel}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 20, paddingBottom: 48 },
  avatarSection: { alignItems: 'center', marginBottom: 28, marginTop: 8 },
  avatar: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 32, fontWeight: '800', color: colors.white },
  name: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 4 },
  email: { fontSize: 14, color: colors.textSecondary, marginBottom: 10 },
  premiumBadge: {
    backgroundColor: '#FEF3C7', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 6,
  },
  premiumText: { fontSize: 13, fontWeight: '700', color: '#92400E' },
  card: {
    backgroundColor: colors.surface, borderRadius: 16,
    overflow: 'hidden', marginBottom: 20,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 16 },
  infoBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  infoLabel: { fontSize: 14, color: colors.textSecondary },
  infoValue: { fontSize: 14, fontWeight: '600', color: colors.text },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 12 },
  perf: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  perfItem: {
    flex: 1, backgroundColor: colors.surface,
    borderRadius: 14, padding: 16, alignItems: 'center',
  },
  perfValue: { fontSize: 28, fontWeight: '900', marginBottom: 4 },
  perfLabel: { fontSize: 12, color: colors.textTertiary },
  diagCard: { borderRadius: 14, padding: 16, marginBottom: 24 },
  diagTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 6 },
  diagText: { fontSize: 13, color: colors.textSecondary, lineHeight: 20 },
  xpBar: { marginBottom: 20 },
  menuRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, alignItems: 'center' },
  menuBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  menuLabel: { fontSize: 15, color: colors.text },
  menuArrow: { fontSize: 20, color: colors.textTertiary },
  logoutButton: {
    borderWidth: 1.5, borderColor: colors.error,
    borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 16,
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: colors.error },
  version: { textAlign: 'center', fontSize: 12, color: colors.textTertiary },
})
