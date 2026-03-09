import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { useEffect, useState } from 'react'
import { supabase } from '../../../src/lib/supabase'
import { colors, moduleColors } from '../../../src/constants/colors'
import { MODULE_CONFIGS } from '../../../src/constants/modules'
import { useSessionStore } from '../../../src/stores/sessionStore'
import { useAuthStore } from '../../../src/stores/authStore'
import { useGamificationStore } from '../../../src/stores/gamificationStore'
import { getLevelFromXP } from '../../../src/constants/levels'
import { createBadgeService, createPerformancePipeline, createUserContentService } from '@sprinta/api'
import { EventBus } from '../../../src/features/rewards/EventBus'
import { BadgeAwardModal } from '../../../src/components/gamification/BadgeAwardModal'
import { LevelUpModal } from '../../../src/components/gamification/LevelUpModal'
import type { Badge } from '@sprinta/api'

const badgeService = createBadgeService(supabase)
const pipeline = createPerformancePipeline(supabase)
const ucSvc = createUserContentService(supabase)

const FATIGUE_LABELS: Record<string, string> = {
  fresh: '💪 Zinde',
  mild: '🙂 Hafif Yorgun',
  moderate: '😐 Orta Yorgun',
  fatigued: '😓 Yorgun',
  exhausted: '😴 Çok Yorgun',
}

export default function ResultScreen() {
  const { moduleCode, userChunkId, userContentId } = useLocalSearchParams<{
    moduleCode: string
    userChunkId?: string
    userContentId?: string
  }>()
  const router = useRouter()
  const { result, lastMetrics, reset } = useSessionStore()
  const { student, refreshProfile } = useAuthStore()
  const { addPendingBadges, setPendingLevelUp, pendingBadges, pendingLevelUp, clearPending } = useGamificationStore()
  const [showBadgeModal, setShowBadgeModal] = useState(false)
  const [showLevelModal, setShowLevelModal] = useState(false)
  const [newBadges, setNewBadges] = useState<Badge[]>([])
  const [levelChange, setLevelChange] = useState<{ from: number; to: number } | null>(null)

  const config = MODULE_CONFIGS[moduleCode] ?? MODULE_CONFIGS.speed_control
  const accentColor = moduleColors[moduleCode] ?? colors.primary

  useEffect(() => {
    if (!result || !student) return
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    runGamification()
  }, [])

  const runGamification = async () => {
    if (!student) return
    const prevLevel = getLevelFromXP(student.totalXp)

    // ── Session'ı Supabase'e kaydet (DB trigger → total_xp güncellenir) ──
    const { exerciseId, lastMetrics: metrics, result: perf } = useSessionStore.getState()
    if (metrics && perf && exerciseId) {
      try {
        const { error: sessionError } = await supabase.from('sessions').insert({
          student_id: student.id,
          exercise_id: exerciseId,
          module_code: metrics.moduleCode,
          session_type: 'exercise',
          difficulty_level: metrics.difficultyLevel,
          duration_seconds: metrics.durationSeconds,
          is_completed: true,
          metrics: {
            wpm: metrics.wpm,
            comprehension: metrics.comprehension,
            accuracy: metrics.accuracy,
            score: metrics.score,
            errorsPerMinute: metrics.errorsPerMinute ?? 0,
          },
          rei: perf.rei,
          csf: perf.csf,
          arp: perf.arp,
          fatigue_score: perf.fatigueScore,
          xp_earned: perf.xpEarned,
        })
        if (!sessionError) {
          // arpHistory → cognitiveProfile sıralı; dailyStats paralel
          const arpHistory = await pipeline.getArpHistory(student.id)
          await Promise.allSettled([
            pipeline.updateCognitiveProfile(student.id, metrics, perf.arp, arpHistory),
            pipeline.upsertDailyStats({
              studentId: student.id,
              xpEarned: perf.xpEarned,
              durationSeconds: metrics.durationSeconds,
              arp: perf.arp,
            }),
          ])
        } else {
          console.error('Session kaydedilemedi:', sessionError.message)
        }
      } catch (e) {
        console.error('Session kayıt hatası:', e)
      }
    }
    // ─────────────────────────────────────────────────────────────────────

    // Kullanıcı chunk'ı tamamlandı olarak işaretle
    if (userChunkId && perf && metrics) {
      await ucSvc.markChunkCompleted({
        chunkId: userChunkId,
        wpm: metrics.wpm,
        comprehension: metrics.comprehension,
        score: perf.arp,
      }).catch((e) => console.error('Chunk işaretlenemedi:', e))
    }

    // Streak güncelle — hata sessizce geçer
    try {
      await badgeService.updateStreak(student.id)
      EventBus.emit('STREAK_UPDATED', { days: 1 })
    } catch (e) { console.error('Streak güncellenemedi:', e) }

    // Events
    if (perf) {
      EventBus.emit('SESSION_FINISHED', { xpEarned: perf.xpEarned, moduleType: metrics?.moduleCode ?? moduleCode })
      EventBus.emit('XP_UPDATED', { total: (student.totalXp ?? 0) + perf.xpEarned, delta: perf.xpEarned })
    }

    // Rozet kontrolü — hata sessizce geçer
    try {
      const stats = await badgeService.getStudentStats(student.id)
      if (stats) {
        const awarded = await badgeService.checkAndAwardBadges(student.id, stats)
        if (awarded.length > 0) {
          setNewBadges(awarded)
          addPendingBadges(awarded)
          setShowBadgeModal(true)
        }
      }
    } catch (e) { console.error('Rozet kontrolü başarısız:', e) }

    // Profil yenile — her zaman çalışır
    try {
      await refreshProfile()
      const updatedStudent = useAuthStore.getState().student
      const newLevel = getLevelFromXP(updatedStudent?.totalXp ?? 0)
      if (newLevel > prevLevel) {
        setLevelChange({ from: prevLevel, to: newLevel })
        setPendingLevelUp(prevLevel, newLevel)
      }
    } catch (e) { console.error('Profil yenilenemedi:', e) }
  }

  const handleBadgeClose = () => {
    setShowBadgeModal(false)
    if (levelChange) {
      setTimeout(() => setShowLevelModal(true), 300)
    }
  }

  const handleLevelClose = () => {
    setShowLevelModal(false)
    clearPending()
  }

  if (!result) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.error}>Sonuç bulunamadı.</Text>
        <TouchableOpacity onPress={() => router.replace('/(tabs)/sessions')}>
          <Text style={styles.link}>Geri Dön</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  const arpColor = result.arpChange > 0 ? colors.success : result.arpChange < -5 ? colors.error : colors.textSecondary
  const arpSign = result.arpChange > 0 ? '+' : ''

  const handleRepeat = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    reset()
    router.replace({
      pathname: '/exercise/[moduleCode]',
      params: { moduleCode },
    })
  }

  const handleHome = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    reset()
    router.replace('/(tabs)')
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Başlık */}
        <View style={styles.topSection}>
          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.title}>Tebrikler!</Text>
          <Text style={styles.subtitle}>{config.label} tamamlandı</Text>
        </View>

        {/* ARP Kartı */}
        <View style={[styles.arpCard, { borderColor: accentColor }]}>
          <Text style={styles.arpLabel}>ARP Puanın</Text>
          <Text style={[styles.arpValue, { color: accentColor }]}>{result.arp}</Text>
          <Text style={[styles.arpChange, { color: arpColor }]}>
            {arpSign}{result.arpChange} bu sessionda
          </Text>
        </View>

        {/* XP Kazanıldı */}
        <View style={styles.xpBadge}>
          <Text style={styles.xpText}>+{result.xpEarned} XP kazandın! ⭐</Text>
        </View>

        {/* Metrik grid */}
        <View style={styles.metricsGrid}>
          <MetricCard label="REI" value={String(result.rei)} sub="Verimlilik İndeksi" />
          <MetricCard label="CSF" value={result.csf.toFixed(2)} sub="Stabilite Faktörü" />
          <MetricCard label="WPM" value={String(lastMetrics?.wpm ?? 0)} sub="Kelime/Dakika" />
          <MetricCard label="Kavrama" value={`%${lastMetrics?.comprehension ?? 0}`} sub="Anlama Oranı" />
        </View>

        {/* Yorgunluk */}
        <View style={styles.fatigueRow}>
          <Text style={styles.fatigueLabel}>Enerji Durumu:</Text>
          <Text style={styles.fatigueValue}>
            {FATIGUE_LABELS[result.fatigueLevel] ?? result.fatigueLevel}
          </Text>
        </View>

        {result.shouldTakeBreak && (
          <View style={styles.breakAlert}>
            <Text style={styles.breakText}>
              ☕ Şimdi 15 dakika mola vermenizi öneririz.
            </Text>
          </View>
        )}

        {/* Öneri */}
        {result.recommendedMode && (
          <View style={styles.recommendation}>
            <Text style={styles.recLabel}>💡 Öneri</Text>
            <Text style={styles.recText}>
              {MODULE_CONFIGS[result.recommendedMode]?.label} modülünde çalışmayı deneyebilirsin.
            </Text>
          </View>
        )}

        {/* Sonraki zorluk */}
        <View style={styles.nextDifficulty}>
          <Text style={styles.nextLabel}>Sonraki oturum zorluğu:</Text>
          <Text style={styles.nextValue}>{result.suggestedDifficulty}/10</Text>
        </View>

        {/* Butonlar */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.repeatButton, { borderColor: accentColor }]}
            onPress={handleRepeat}
            activeOpacity={0.8}
          >
            <Text style={[styles.repeatText, { color: accentColor }]}>Tekrar Yap</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.homeButton, { backgroundColor: accentColor }]}
            onPress={handleHome}
            activeOpacity={0.8}
          >
            <Text style={styles.homeText}>Ana Sayfaya Dön</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <BadgeAwardModal
        visible={showBadgeModal}
        badges={newBadges}
        onClose={handleBadgeClose}
      />
      <LevelUpModal
        visible={showLevelModal}
        fromLevel={levelChange?.from ?? 1}
        toLevel={levelChange?.to ?? 1}
        onClose={handleLevelClose}
      />
    </SafeAreaView>
  )
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricSub}>{sub}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 24, paddingBottom: 48 },
  topSection: { alignItems: 'center', marginBottom: 28 },
  emoji: { fontSize: 56, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 15, color: colors.textSecondary, marginTop: 4 },
  arpCard: {
    borderWidth: 2, borderRadius: 20, padding: 24,
    alignItems: 'center', marginBottom: 16,
  },
  arpLabel: { fontSize: 14, color: colors.textSecondary, marginBottom: 6 },
  arpValue: { fontSize: 64, fontWeight: '900' },
  arpChange: { fontSize: 15, fontWeight: '600', marginTop: 4 },
  xpBadge: {
    backgroundColor: '#E8F0FE', borderRadius: 12,
    paddingVertical: 10, paddingHorizontal: 20,
    alignItems: 'center', marginBottom: 24,
  },
  xpText: { fontSize: 16, fontWeight: '700', color: '#92400E' },
  metricsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20,
  },
  metricCard: {
    flex: 1, minWidth: '44%', backgroundColor: colors.surface,
    borderRadius: 14, padding: 16, alignItems: 'center',
  },
  metricValue: { fontSize: 22, fontWeight: '800', color: colors.text },
  metricLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginTop: 2 },
  metricSub: { fontSize: 11, color: colors.textTertiary, marginTop: 2, textAlign: 'center' },
  fatigueRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 12,
    paddingHorizontal: 4,
  },
  fatigueLabel: { fontSize: 14, color: colors.textSecondary },
  fatigueValue: { fontSize: 15, fontWeight: '600', color: colors.text },
  breakAlert: {
    backgroundColor: '#FEF9C3', borderRadius: 12,
    padding: 14, marginBottom: 16,
  },
  breakText: { fontSize: 14, color: '#854D0E', textAlign: 'center' },
  recommendation: {
    backgroundColor: '#EDE9FE', borderRadius: 12,
    padding: 14, marginBottom: 16,
  },
  recLabel: { fontSize: 13, fontWeight: '700', color: '#5B21B6', marginBottom: 4 },
  recText: { fontSize: 14, color: '#5B21B6', lineHeight: 20 },
  nextDifficulty: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 28, paddingHorizontal: 4,
  },
  nextLabel: { fontSize: 14, color: colors.textSecondary },
  nextValue: { fontSize: 16, fontWeight: '700', color: colors.text },
  actions: { gap: 12 },
  repeatButton: {
    borderWidth: 2, borderRadius: 16,
    paddingVertical: 16, alignItems: 'center',
  },
  repeatText: { fontSize: 16, fontWeight: '700' },
  homeButton: {
    borderRadius: 16, paddingVertical: 16, alignItems: 'center',
  },
  homeText: { fontSize: 16, fontWeight: '700', color: colors.white },
  error: { fontSize: 16, color: colors.textSecondary, textAlign: 'center', marginTop: 80 },
  link: { fontSize: 15, color: colors.primary, textAlign: 'center', marginTop: 16 },
})
