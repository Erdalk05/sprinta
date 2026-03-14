import { SafeAreaView } from 'react-native-safe-area-context'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
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

    if (userChunkId && perf && metrics) {
      await ucSvc.markChunkCompleted({
        chunkId: userChunkId,
        wpm: metrics.wpm,
        comprehension: metrics.comprehension,
        score: perf.arp,
      }).catch((e) => console.error('Chunk işaretlenemedi:', e))
    }

    try {
      await badgeService.updateStreak(student.id)
      EventBus.emit('STREAK_UPDATED', { days: 1 })
    } catch (e) { console.error('Streak güncellenemedi:', e) }

    if (perf) {
      EventBus.emit('SESSION_FINISHED', { xpEarned: perf.xpEarned, moduleType: metrics?.moduleCode ?? moduleCode })
      EventBus.emit('XP_UPDATED', { total: (student.totalXp ?? 0) + perf.xpEarned, delta: perf.xpEarned })
    }

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
    if (levelChange) setTimeout(() => setShowLevelModal(true), 300)
  }

  const handleLevelClose = () => {
    setShowLevelModal(false)
    clearPending()
  }

  if (!result) {
    return (
      <SafeAreaView style={s.container}>
        <Text style={s.error}>Sonuç bulunamadı.</Text>
        <TouchableOpacity onPress={() => router.replace('/(tabs)/sessions')}>
          <Text style={s.link}>Geri Dön</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  const arpColor = result.arpChange > 0 ? colors.success : result.arpChange < -5 ? colors.error : colors.textSecondary
  const arpSign  = result.arpChange > 0 ? '+' : ''

  const handleRepeat = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    reset()
    router.replace({ pathname: '/exercise/[moduleCode]', params: { moduleCode } })
  }

  const handleHome = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    reset()
    router.replace('/(tabs)')
  }

  return (
    <SafeAreaView style={s.container}>

      {/* ── Üst: emoji + başlık ───────────────────────────────── */}
      <View style={s.topSection}>
        <Text style={s.emoji}>🎉</Text>
        <Text style={s.title}>Tebrikler!</Text>
        <Text style={s.subtitle}>{config.label} tamamlandı</Text>
      </View>

      {/* ── ARP + XP yatay kart ───────────────────────────────── */}
      <View style={[s.arpRow, { borderColor: accentColor + '60' }]}>
        <View style={s.arpBlock}>
          <Text style={s.arpSmallLabel}>ARP PUANIN</Text>
          <Text style={[s.arpBig, { color: accentColor }]}>{result.arp}</Text>
          <Text style={[s.arpDelta, { color: arpColor }]}>
            {arpSign}{result.arpChange} bu sessionda
          </Text>
        </View>
        <View style={[s.arpSep, { backgroundColor: accentColor + '30' }]} />
        <View style={s.xpBlock}>
          <Text style={s.xpEmoji}>⭐</Text>
          <Text style={[s.xpNum, { color: accentColor }]}>+{result.xpEarned}</Text>
          <Text style={s.xpLbl}>XP</Text>
        </View>
      </View>

      {/* ── 4 metrik — yatay şerit ────────────────────────────── */}
      <View style={s.metricsRow}>
        <Chip label="REI"     value={String(result.rei)} />
        <Chip label="CSF"     value={result.csf.toFixed(2)} />
        <Chip label="WPM"     value={String(lastMetrics?.wpm ?? 0)} />
        <Chip label="Kavrama" value={`%${lastMetrics?.comprehension ?? 0}`} />
      </View>

      {/* ── Enerji + Zorluk ───────────────────────────────────── */}
      <View style={s.infoRow}>
        <Text style={s.infoTxt}>
          {FATIGUE_LABELS[result.fatigueLevel] ?? result.fatigueLevel}
        </Text>
        <View style={s.infoDot} />
        <Text style={s.infoTxt}>Sonraki zorluk: {result.suggestedDifficulty}/10</Text>
      </View>

      {/* ── Öneri ─────────────────────────────────────────────── */}
      {result.recommendedMode && (
        <View style={[s.rec, { backgroundColor: accentColor + '12', borderColor: accentColor + '30' }]}>
          <Text style={[s.recTxt, { color: accentColor }]}>
            💡 {MODULE_CONFIGS[result.recommendedMode]?.label} modülünde çalışmayı deneyebilirsin.
          </Text>
        </View>
      )}

      {result.shouldTakeBreak && (
        <View style={s.breakAlert}>
          <Text style={s.breakTxt}>☕ 15 dakika mola vermenizi öneririz.</Text>
        </View>
      )}

      <View style={{ flex: 1 }} />

      {/* ── Butonlar ──────────────────────────────────────────── */}
      <View style={s.actions}>
        <TouchableOpacity
          style={[s.repeatBtn, { borderColor: accentColor }]}
          onPress={handleRepeat}
          activeOpacity={0.8}
        >
          <Text style={[s.repeatTxt, { color: accentColor }]}>↺  Tekrar Yap</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.homeBtn, { backgroundColor: accentColor }]}
          onPress={handleHome}
          activeOpacity={0.8}
        >
          <Text style={s.homeTxt}>Ana Sayfaya Dön</Text>
        </TouchableOpacity>
      </View>

      <BadgeAwardModal visible={showBadgeModal} badges={newBadges} onClose={handleBadgeClose} />
      <LevelUpModal
        visible={showLevelModal}
        fromLevel={levelChange?.from ?? 1}
        toLevel={levelChange?.to ?? 1}
        onClose={handleLevelClose}
      />
    </SafeAreaView>
  )
}

// ── Metrik chip ───────────────────────────────────────────────────────
function Chip({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.chip}>
      <Text style={s.chipVal}>{value}</Text>
      <Text style={s.chipLbl}>{label}</Text>
    </View>
  )
}

// ── Stiller ───────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // Üst başlık
  topSection: { alignItems: 'center', paddingTop: 16, paddingBottom: 12 },
  emoji:    { fontSize: 40, marginBottom: 4 },
  title:    { fontSize: 24, fontWeight: '900', color: colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },

  // ARP + XP kart
  arpRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    borderWidth: 1.5,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 12,
  },
  arpBlock: {
    flex: 2,
    alignItems: 'center',
    paddingVertical: 14,
    gap: 2,
  },
  arpSmallLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, color: colors.textSecondary },
  arpBig:  { fontSize: 52, fontWeight: '900', lineHeight: 60, letterSpacing: -2 },
  arpDelta:{ fontSize: 12, fontWeight: '600' },
  arpSep:  { width: 1, marginVertical: 12 },
  xpBlock: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 1 },
  xpEmoji: { fontSize: 22 },
  xpNum:   { fontSize: 28, fontWeight: '900', letterSpacing: -1 },
  xpLbl:   { fontSize: 11, fontWeight: '700', color: colors.textSecondary },

  // Metrik şeridi
  metricsRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    gap: 8,
    marginBottom: 10,
  },
  chip: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 2,
  },
  chipVal: { fontSize: 16, fontWeight: '900', color: colors.text },
  chipLbl: { fontSize: 9,  fontWeight: '700', color: colors.textSecondary, letterSpacing: 0.3 },

  // Info satırı
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  infoTxt: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  infoDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.textSecondary, opacity: 0.4 },

  // Öneri
  rec: {
    marginHorizontal: 20,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },
  recTxt: { fontSize: 13, lineHeight: 18, fontWeight: '500' },

  // Mola uyarısı
  breakAlert: {
    marginHorizontal: 20,
    backgroundColor: '#FEF9C3',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
  },
  breakTxt: { fontSize: 13, color: '#854D0E', textAlign: 'center' },

  // Butonlar
  actions: { paddingHorizontal: 20, paddingBottom: 12, gap: 10 },
  repeatBtn: {
    borderWidth: 2, borderRadius: 14,
    paddingVertical: 13, alignItems: 'center',
  },
  repeatTxt: { fontSize: 15, fontWeight: '700' },
  homeBtn: {
    borderRadius: 14, paddingVertical: 13, alignItems: 'center',
  },
  homeTxt: { fontSize: 15, fontWeight: '700', color: '#fff' },

  error: { fontSize: 16, color: colors.textSecondary, textAlign: 'center', marginTop: 80 },
  link:  { fontSize: 15, color: colors.primary, textAlign: 'center', marginTop: 16 },
})
