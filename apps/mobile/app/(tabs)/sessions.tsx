import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { colors, moduleColors } from '../../src/constants/colors'
import { MODULE_CONFIGS } from '../../src/constants/modules'
import { useAuthStore } from '../../src/stores/authStore'

const MODULES = ['speed_control', 'deep_comprehension', 'attention_power', 'mental_reset']

export default function SessionsScreen() {
  const router = useRouter()
  const { student } = useAuthStore()

  const dailyGoal = 3 // TODO: onboarding'den al
  const sessionsToday = 0 // TODO: daily_stats'tan al

  const handleStart = (moduleCode: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    router.push({
      pathname: '/exercise/[moduleCode]',
      params: { moduleCode },
    })
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Başlık */}
        <View style={styles.header}>
          <Text style={styles.title}>Çalış</Text>
          <Text style={styles.subtitle}>Hangi modülle çalışmak istersin?</Text>
        </View>

        {/* Günlük hedef */}
        <View style={styles.dailyCard}>
          <View style={styles.dailyRow}>
            <Text style={styles.dailyTitle}>Günlük Hedef</Text>
            <Text style={styles.dailyCount}>
              {sessionsToday}/{dailyGoal} oturum
            </Text>
          </View>
          <View style={styles.dailyTrack}>
            {Array.from({ length: dailyGoal }).map((_, i) => (
              <View
                key={i}
                style={[styles.dailyDot, i < sessionsToday && styles.dailyDotFilled]}
              />
            ))}
          </View>
        </View>

        {/* Modül Kartları */}
        {MODULES.map((moduleCode) => {
          const config = MODULE_CONFIGS[moduleCode]
          const accent = moduleColors[moduleCode]

          return (
            <TouchableOpacity
              key={moduleCode}
              style={styles.moduleCard}
              onPress={() => handleStart(moduleCode)}
              activeOpacity={0.8}
            >
              {/* Sol renkli çubuk */}
              <View style={[styles.moduleStripe, { backgroundColor: accent }]} />

              <View style={styles.moduleBody}>
                <View style={styles.moduleTop}>
                  <View style={[styles.moduleIcon, { backgroundColor: accent + '20' }]}>
                    <Text style={styles.moduleEmoji}>{config.icon}</Text>
                  </View>
                  <View style={styles.moduleInfo}>
                    <Text style={styles.moduleName}>{config.label}</Text>
                    <Text style={styles.moduleDesc}>{config.description}</Text>
                  </View>
                </View>

                <View style={styles.moduleFooter}>
                  <View style={styles.durationBadge}>
                    <Text style={styles.durationText}>⏱ {config.duration}</Text>
                  </View>
                  <View style={[styles.startBtn, { backgroundColor: accent }]}>
                    <Text style={styles.startBtnText}>Başla →</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )
        })}

        {/* Öğrenci ARP bilgisi */}
        {student && (
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{student.currentArp}</Text>
              <Text style={styles.statLabel}>ARP</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{student.totalXp.toLocaleString('tr')}</Text>
              <Text style={styles.statLabel}>Toplam XP</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{student.streakDays}</Text>
              <Text style={styles.statLabel}>Günlük Seri 🔥</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 20, paddingBottom: 32 },
  header: { marginBottom: 20 },
  title: { fontSize: 26, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  dailyCard: {
    backgroundColor: colors.surface, borderRadius: 16,
    padding: 16, marginBottom: 20,
  },
  dailyRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  dailyTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  dailyCount: { fontSize: 14, color: colors.textSecondary },
  dailyTrack: { flexDirection: 'row', gap: 8 },
  dailyDot: {
    flex: 1, height: 8, borderRadius: 4,
    backgroundColor: colors.border,
  },
  dailyDotFilled: { backgroundColor: colors.success },
  moduleCard: {
    flexDirection: 'row', backgroundColor: colors.white,
    borderRadius: 18, marginBottom: 14,
    borderWidth: 1, borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  moduleStripe: { width: 6 },
  moduleBody: { flex: 1, padding: 16 },
  moduleTop: { flexDirection: 'row', gap: 14, marginBottom: 14 },
  moduleIcon: {
    width: 52, height: 52, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  moduleEmoji: { fontSize: 26 },
  moduleInfo: { flex: 1, justifyContent: 'center' },
  moduleName: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 4 },
  moduleDesc: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  moduleFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  durationBadge: {
    backgroundColor: colors.surface, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  durationText: { fontSize: 12, color: colors.textSecondary },
  startBtn: {
    borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8,
  },
  startBtnText: { fontSize: 13, fontWeight: '700', color: colors.white },
  statsRow: {
    flexDirection: 'row', backgroundColor: colors.surface,
    borderRadius: 16, padding: 16, marginTop: 8,
    justifyContent: 'space-around',
  },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 11, color: colors.textTertiary, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: colors.border },
})
