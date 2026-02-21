import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { colors, moduleColors } from '../../src/constants/colors'
import { MODULE_CONFIGS } from '../../src/constants/modules'
import { useAuthStore } from '../../src/stores/authStore'
import { calculateExamProgress, getLevelFromXp, getXpToNextLevel, LEVEL_NAMES } from '@sprinta/shared'

const QUICK_MODULES = ['speed_control', 'deep_comprehension', 'attention_power', 'mental_reset']

export default function HomeScreen() {
  const router = useRouter()
  const { student } = useAuthStore()

  const name = student?.fullName?.split(' ')[0] ?? 'Öğrenci'
  const currentArp = student?.currentArp ?? 0
  const examTarget = student?.examTarget?.toLowerCase() ?? 'tyt'
  const totalXp = student?.totalXp ?? 0
  const streakDays = student?.streakDays ?? 0

  const examProgress = calculateExamProgress(currentArp, examTarget)
  const level = getLevelFromXp(totalXp)
  const xpProgress = getXpToNextLevel(totalXp)
  const levelName = LEVEL_NAMES[level] ?? 'Titan'

  const greetingHour = new Date().getHours()
  const greeting = greetingHour < 12 ? 'Günaydın' : greetingHour < 18 ? 'İyi günler' : 'İyi akşamlar'

  const handleModuleTap = (moduleCode: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    router.push({
      pathname: '/exercise/[moduleCode]',
      params: { moduleCode },
    })
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Karşılama */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}, {name} 👋</Text>
            <Text style={styles.tagline}>Oku. Anla. Kazan.</Text>
          </View>
          <View style={styles.streakBadge}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.streakCount}>{streakDays}</Text>
          </View>
        </View>

        {/* ARP İlerleme Kartı */}
        <View style={styles.arpCard}>
          <View style={styles.arpRow}>
            <View>
              <Text style={styles.arpLabel}>ARP Puanın</Text>
              <Text style={styles.arpValue}>{currentArp}</Text>
              <Text style={styles.arpExam}>
                {examTarget.toUpperCase()} hedefi: {examProgress.progressPercent}%
              </Text>
            </View>
            <View style={styles.levelBadge}>
              <Text style={styles.levelEmoji}>Lv.{level}</Text>
              <Text style={styles.levelText}>{levelName}</Text>
              <Text style={styles.levelXp}>{totalXp.toLocaleString('tr')} XP</Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${examProgress.progressPercent}%` },
                examProgress.level === 'elite' && { backgroundColor: '#F59E0B' },
                examProgress.level === 'target' && { backgroundColor: colors.success },
              ]}
            />
          </View>
          <Text style={styles.progressLabel}>
            {examProgress.level === 'elite' ? '🏆 Elite seviye!' :
             examProgress.level === 'target' ? '🎯 Hedefe ulaştın!' :
             `${examProgress.remainingArp} ARP daha`}
          </Text>
        </View>

        {/* XP İlerleme Çubuğu */}
        <View style={styles.xpCard}>
          <View style={styles.xpRow}>
            <Text style={styles.xpLabel}>Seviye İlerlemesi</Text>
            <Text style={styles.xpPercent}>%{xpProgress.percent}</Text>
          </View>
          <View style={styles.xpTrack}>
            <View style={[styles.xpFill, { width: `${xpProgress.percent}%` as any }]} />
          </View>
          <Text style={styles.xpDetail}>
            {xpProgress.current.toLocaleString('tr')} / {xpProgress.required.toLocaleString('tr')} XP
          </Text>
        </View>

        {/* Hızlı Çalış */}
        <Text style={styles.sectionTitle}>Hızlı Çalış</Text>
        <View style={styles.modulesGrid}>
          {QUICK_MODULES.map((mod) => {
            const cfg = MODULE_CONFIGS[mod]
            const accent = moduleColors[mod]
            return (
              <TouchableOpacity
                key={mod}
                style={[styles.moduleCard, { borderTopColor: accent, borderTopWidth: 3 }]}
                onPress={() => handleModuleTap(mod)}
                activeOpacity={0.8}
              >
                <Text style={styles.moduleIcon}>{cfg.icon}</Text>
                <Text style={styles.moduleName}>{cfg.label}</Text>
                <Text style={styles.moduleDuration}>{cfg.duration}</Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Günlük ipucu */}
        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 Günün İpucu</Text>
          <Text style={styles.tipText}>
            Fiksasyon sayısını azaltarak okuma hızını artırabilirsin. Her bakışta 2-3 kelime görmeye çalış.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 20, paddingBottom: 32 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 20,
  },
  greeting: { fontSize: 22, fontWeight: '800', color: colors.text },
  tagline: { fontSize: 13, color: colors.textTertiary, marginTop: 2 },
  streakBadge: {
    backgroundColor: '#FEF3C7', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 8,
    alignItems: 'center',
  },
  streakEmoji: { fontSize: 20 },
  streakCount: { fontSize: 16, fontWeight: '800', color: '#D97706' },
  arpCard: {
    backgroundColor: colors.primary, borderRadius: 20,
    padding: 20, marginBottom: 24,
  },
  arpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  arpLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  arpValue: { fontSize: 48, fontWeight: '900', color: colors.white },
  arpExam: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  levelBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14,
    padding: 12, alignItems: 'center',
  },
  levelEmoji: { fontSize: 16, fontWeight: '800', color: colors.white, marginBottom: 2 },
  levelText: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.85)' },
  levelXp: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  xpCard: {
    backgroundColor: colors.surface, borderRadius: 16,
    padding: 16, marginBottom: 24,
  },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  xpLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  xpPercent: { fontSize: 13, fontWeight: '700', color: colors.primary },
  xpTrack: {
    height: 8, backgroundColor: '#1E293B', borderRadius: 4,
    overflow: 'hidden', marginBottom: 6,
  },
  xpFill: { height: 8, backgroundColor: '#6366F1', borderRadius: 4 },
  xpDetail: { fontSize: 12, color: colors.textTertiary },
  progressTrack: {
    height: 6, backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3, overflow: 'hidden',
  },
  progressFill: {
    height: 6, backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 12, color: 'rgba(255,255,255,0.8)',
    marginTop: 6, textAlign: 'right',
  },
  sectionTitle: {
    fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 14,
  },
  modulesGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24,
  },
  moduleCard: {
    width: '47%', backgroundColor: colors.surface,
    borderRadius: 16, padding: 16,
  },
  moduleIcon: { fontSize: 28, marginBottom: 8 },
  moduleName: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 4 },
  moduleDuration: { fontSize: 12, color: colors.textTertiary },
  tipCard: {
    backgroundColor: '#EDE9FE', borderRadius: 16, padding: 16,
  },
  tipTitle: { fontSize: 14, fontWeight: '700', color: '#5B21B6', marginBottom: 6 },
  tipText: { fontSize: 14, color: '#5B21B6', lineHeight: 20 },
})
