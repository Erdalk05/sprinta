import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { colors, moduleColors } from '../../src/constants/colors'
import { MODULE_CONFIGS } from '../../src/constants/modules'
import { useAuthStore } from '../../src/stores/authStore'
import { calculateExamProgress, rankWeaknesses } from '@sprinta/shared'
import type { CognitiveProfile } from '@sprinta/shared'
import { createBadgeService } from '@sprinta/api'
import type { Badge } from '@sprinta/api'
import { BadgeCard } from '../../src/components/gamification/BadgeCard'

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
)
const badgeService = createBadgeService(supabase)

export default function ProgressScreen() {
  const { student } = useAuthStore()
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([])
  const [lockedBadges, setLockedBadges] = useState<Badge[]>([])

  useEffect(() => {
    if (!student) return
    badgeService.getStudentBadges(student.id).then(({ earned, locked }) => {
      setEarnedBadges(earned)
      setLockedBadges(locked)
    })
  }, [student?.id])

  const currentArp = student?.currentArp ?? 0
  const examTarget = student?.examTarget?.toLowerCase() ?? 'tyt'
  const examProgress = calculateExamProgress(currentArp, examTarget)

  // Profil tahmini (gerçek değerler Step 06 tanılamadan gelecek)
  const estimatedProfile: CognitiveProfile = {
    sustainableWpm: Math.round(currentArp / 0.8) || 0,
    peakWpm: Math.round(currentArp / 0.7) || 0,
    comprehensionBaseline: 75,
    stabilityIndex: 0.7,
    fatigueThreshold: 50,
    speedSkill: Math.min(100, Math.round((currentArp / 300) * 100)),
    comprehensionSkill: 75,
    attentionSkill: 70,
    primaryWeakness: null,
    secondaryWeakness: null,
  }

  const weaknesses = currentArp > 0 ? rankWeaknesses(estimatedProfile) : []

  const levelLabel =
    examProgress.level === 'elite' ? '🏆 Elite' :
    examProgress.level === 'target' ? '🎯 Hedef' :
    examProgress.level === 'min' ? '📈 Gelişiyor' : '🌱 Başlangıç'

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>İlerleme</Text>

        {/* ARP Özeti */}
        <View style={styles.arpCard}>
          <View style={styles.arpTop}>
            <View>
              <Text style={styles.arpLabel}>Mevcut ARP</Text>
              <Text style={styles.arpValue}>{currentArp}</Text>
            </View>
            <View style={styles.levelChip}>
              <Text style={styles.levelText}>{levelLabel}</Text>
            </View>
          </View>

          {/* Hedef çubuğu */}
          <View style={styles.examInfo}>
            <Text style={styles.examLabel}>{examTarget.toUpperCase()} Hedefi</Text>
            <Text style={styles.examPercent}>%{examProgress.progressPercent}</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${examProgress.progressPercent}%` }]} />
          </View>
          {examProgress.remainingArp > 0 && (
            <Text style={styles.remainingText}>Hedefe {examProgress.remainingArp} ARP kaldı</Text>
          )}
        </View>

        {/* Beceri Çubukları */}
        <Text style={styles.sectionTitle}>Beceri Profili</Text>
        <View style={styles.skillsCard}>
          <SkillBar label="Hız Kontrolü" skill={estimatedProfile.speedSkill} color={moduleColors.speed_control} />
          <SkillBar label="Derin Kavrama" skill={estimatedProfile.comprehensionSkill} color={moduleColors.deep_comprehension} />
          <SkillBar label="Dikkat Gücü" skill={estimatedProfile.attentionSkill} color={moduleColors.attention_power} />
          <SkillBar
            label="Stabilite"
            skill={Math.round(estimatedProfile.stabilityIndex * 100)}
            color={moduleColors.mental_reset}
          />
        </View>

        {/* Zayıf Noktalar */}
        {weaknesses.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Odaklanılacak Alanlar</Text>
            <View style={styles.weaknessCard}>
              {weaknesses.slice(0, 2).map((w, i) => {
                const mod = MODULE_CONFIGS[w.module]
                const accent = moduleColors[w.module]
                return (
                  <View key={w.module} style={[styles.weaknessRow, i > 0 && styles.weaknessBorder]}>
                    <Text style={styles.weaknessRank}>{i + 1}</Text>
                    <Text style={styles.weaknessIcon}>{mod?.icon}</Text>
                    <View style={styles.weaknessInfo}>
                      <Text style={styles.weaknessLabel}>{w.label}</Text>
                      <Text style={styles.weaknessScore}>Skor: {w.score}</Text>
                    </View>
                    <View style={[styles.weaknessBadge, { backgroundColor: accent + '20' }]}>
                      <Text style={[styles.weaknessBadgeText, { color: accent }]}>Çalış</Text>
                    </View>
                  </View>
                )
              })}
            </View>
          </>
        )}

        {/* İstatistikler */}
        <Text style={styles.sectionTitle}>Genel Durum</Text>
        <View style={styles.statsGrid}>
          <StatCard label="Sürdürülebilir WPM" value={estimatedProfile.sustainableWpm} />
          <StatCard label="Toplam XP" value={student?.totalXp ?? 0} />
          <StatCard label="Günlük Seri" value={student?.streakDays ?? 0} suffix="gün 🔥" />
          <StatCard label="Stabilite" value={`%${Math.round(estimatedProfile.stabilityIndex * 100)}`} isString />
        </View>

        {/* Rozetler */}
        {(earnedBadges.length > 0 || lockedBadges.length > 0) && (
          <>
            <Text style={styles.sectionTitle}>Rozetler</Text>
            <View style={styles.badgesList}>
              {earnedBadges.map((badge) => (
                <BadgeCard key={badge.id} badge={badge} earned size="small" />
              ))}
              {lockedBadges.slice(0, 3).map((badge) => (
                <BadgeCard key={badge.id} badge={badge} earned={false} size="small" />
              ))}
            </View>
          </>
        )}

        {!student?.hasCompletedDiagnostic && (
          <View style={styles.diagnosticBanner}>
            <Text style={styles.diagnosticTitle}>🧪 Tanılama Testi Bekleniyor</Text>
            <Text style={styles.diagnosticText}>
              Kişisel ARP başlangıç değerini belirlemek için tanılama testini tamamla.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

function SkillBar({ label, skill, color }: { label: string; skill: number; color: string }) {
  return (
    <View style={styles.skillRow}>
      <Text style={styles.skillLabel}>{label}</Text>
      <View style={styles.skillTrack}>
        <View style={[styles.skillFill, { width: `${Math.min(100, skill)}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.skillValue}>{skill}</Text>
    </View>
  )
}

function StatCard({ label, value, suffix, isString }: { label: string; value: number | string; suffix?: string; isString?: boolean }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{isString ? value : value.toLocaleString('tr')}{suffix ?? ''}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: '800', color: colors.text, marginBottom: 20 },
  arpCard: {
    backgroundColor: colors.primary, borderRadius: 20, padding: 20, marginBottom: 24,
  },
  arpTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  arpLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  arpValue: { fontSize: 52, fontWeight: '900', color: colors.white },
  levelChip: {
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  levelText: { fontSize: 13, fontWeight: '700', color: colors.white },
  examInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  examLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  examPercent: { fontSize: 13, fontWeight: '700', color: colors.white },
  progressTrack: {
    height: 6, backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3, overflow: 'hidden',
  },
  progressFill: {
    height: 6, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 3,
  },
  remainingText: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 6, textAlign: 'right' },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 12 },
  skillsCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 20 },
  skillRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  skillLabel: { fontSize: 13, color: colors.text, width: 110 },
  skillTrack: { flex: 1, height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden' },
  skillFill: { height: 8, borderRadius: 4 },
  skillValue: { fontSize: 13, fontWeight: '700', color: colors.text, width: 30, textAlign: 'right' },
  weaknessCard: { backgroundColor: colors.surface, borderRadius: 16, marginBottom: 20, overflow: 'hidden' },
  weaknessRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  weaknessBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  weaknessRank: { fontSize: 18, fontWeight: '800', color: colors.textTertiary, width: 20, textAlign: 'center' },
  weaknessIcon: { fontSize: 24 },
  weaknessInfo: { flex: 1 },
  weaknessLabel: { fontSize: 15, fontWeight: '600', color: colors.text },
  weaknessScore: { fontSize: 12, color: colors.textTertiary, marginTop: 2 },
  weaknessBadge: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  weaknessBadgeText: { fontSize: 12, fontWeight: '700' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  statCard: {
    width: '47%', backgroundColor: colors.surface,
    borderRadius: 14, padding: 16,
  },
  statValue: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 4 },
  statLabel: { fontSize: 12, color: colors.textTertiary },
  diagnosticBanner: {
    backgroundColor: '#FEF3C7', borderRadius: 14, padding: 16,
  },
  diagnosticTitle: { fontSize: 15, fontWeight: '700', color: '#92400E', marginBottom: 6 },
  diagnosticText: { fontSize: 13, color: '#78350F', lineHeight: 20 },
  badgesList: { gap: 8, marginBottom: 20 },
})
