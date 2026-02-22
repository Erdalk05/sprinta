import React, { useEffect, useRef, useCallback } from 'react'
import {
  View, Text, TouchableOpacity, ScrollView,
  SafeAreaView, Animated, StyleSheet,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../stores/authStore'
import { calculateExamProgress, getLevelFromXp } from '@sprinta/shared'
import { colors } from '../../theme/colors'
import { typography } from '../../theme/typography'
import { shadows } from '../../theme/shadows'
import { spacing } from '../../theme/spacing'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { Badge } from '../../components/ui/Badge'

const DEFAULT_ROUTE = '/exercise/speed_control' as const

// ─────────────────────────────────────────────────────────────
// HomeHeader — minimal, sol: selamlama  sağ: streak+xp badge
// ─────────────────────────────────────────────────────────────
interface HomeHeaderProps {
  greeting:   string
  userName:   string
  streakDays: number
  totalXp:    number
}

function HomeHeader({ greeting, userName, streakDays, totalXp }: HomeHeaderProps) {
  const pulse = useRef(new Animated.Value(1)).current

  useEffect(() => {
    const run = () =>
      Animated.sequence([
        Animated.spring(pulse, { toValue: 1.05, useNativeDriver: true, speed: 20, bounciness: 8 }),
        Animated.spring(pulse, { toValue: 1,    useNativeDriver: true, speed: 20, bounciness: 8 }),
      ]).start()

    const id = setInterval(run, 3000)
    return () => clearInterval(id)
  }, [pulse])

  return (
    <View style={sh.root}>
      <View style={sh.left}>
        <Text style={sh.greeting}>{greeting},</Text>
        <Text style={sh.name}>{userName}</Text>
      </View>
      <View style={sh.right}>
        <Animated.View style={{ transform: [{ scale: pulse }] }}>
          <Badge type="streak" value={streakDays} size="sm" />
        </Animated.View>
        <Badge type="xp" value={totalXp.toLocaleString('tr')} size="sm" />
      </View>
    </View>
  )
}

const sh = StyleSheet.create({
  root: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  left:    { flex: 1 },
  greeting:{ ...(typography.caption as object), color: colors.textSecondary },
  name:    { ...(typography.h3 as object), color: colors.textPrimary, marginTop: 2 },
  right:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
})

// ─────────────────────────────────────────────────────────────
// DailyMissionCard — ekranın ~%50'si, ana CTA
// ─────────────────────────────────────────────────────────────
interface DailyMissionCardProps {
  examTarget:      string
  progressPercent: number
  remainingArp:    number
  onContinue:      () => void
}

function DailyMissionCard({
  examTarget, progressPercent, remainingArp, onContinue,
}: DailyMissionCardProps) {
  const scale = useRef(new Animated.Value(1)).current

  const onPressIn  = () =>
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50, bounciness: 4 }).start()
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1,    useNativeDriver: true, speed: 50, bounciness: 4 }).start()

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    onContinue()
  }

  return (
    <View style={sc.root}>
      <Text style={sc.title}>Bugünkü Görev 🎯</Text>
      <Text style={sc.sub}>Hedef: 200 ARP · {examTarget} hazırlığı</Text>

      <ProgressBar
        progress={Math.min(progressPercent / 100, 1)}
        color={colors.primary}
        trackColor={colors.border}
        height={10}
        showPercent
        style={sc.bar}
      />

      <Text style={sc.remaining}>
        {remainingArp > 0 ? `Hedefe ${remainingArp} ARP kaldı` : 'Hedefe ulaştın! 🎉'}
      </Text>

      <Animated.View style={{ transform: [{ scale }] }}>
        <TouchableOpacity
          style={sc.btn}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          onPress={handlePress}
          activeOpacity={1}
        >
          <Text style={sc.btnTxt}>DEVAM ET →</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  )
}

const sc = StyleSheet.create({
  root: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    padding: spacing.lg,
    ...shadows.md,
  },
  title:    { ...(typography.h2 as object), color: colors.textPrimary, marginBottom: 6 },
  sub:      { ...(typography.label as object), color: colors.textSecondary, marginBottom: spacing.md },
  bar:      { marginBottom: 10 },
  remaining:{ ...(typography.caption as object), color: colors.textSecondary, marginBottom: spacing.lg },
  btn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnTxt: {
    fontSize: 18, fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.5,
  },
})

// ─────────────────────────────────────────────────────────────
// MomentumStats — 3 sade istatistik kartı
// ─────────────────────────────────────────────────────────────
interface MomentumStatsProps {
  arpDisplay: string
  xpDisplay:  string
  badgePct:   number
}

function MomentumStats({ arpDisplay, xpDisplay, badgePct }: MomentumStatsProps) {
  const items: ReadonlyArray<{ emoji: string; value: string; label: string }> = [
    { emoji: '🏆', value: arpDisplay,   label: 'Haftalık\nİlerleme'   },
    { emoji: '⚡', value: xpDisplay,    label: 'Kazanılan\nXP'        },
    { emoji: '⭐', value: `%${badgePct}`, label: 'Rozet\nİlerlemesi'  },
  ]

  return (
    <View style={sm.row}>
      {items.map((it, i) => (
        <View key={i} style={sm.card}>
          <Text style={sm.emoji}>{it.emoji}</Text>
          <Text style={sm.val}>{it.value}</Text>
          <Text style={sm.lbl}>{it.label}</Text>
        </View>
      ))}
    </View>
  )
}

const sm = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    gap: 10,
    marginTop: spacing.md,
  },
  card: {
    flex: 1,
    backgroundColor: '#F4F4F4',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  emoji: { fontSize: 22, marginBottom: 4 },
  val:   { ...(typography.h3 as object), color: colors.textPrimary, marginBottom: 2 },
  lbl:   {
    ...(typography.caption as object),
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
})

// ─────────────────────────────────────────────────────────────
// StreakMotivation — streak >= 3 ise göster
// ─────────────────────────────────────────────────────────────
function StreakMotivation({ streakDays }: { streakDays: number }) {
  if (streakDays < 3) return null
  return (
    <View style={ss.root}>
      <Text style={ss.txt}>🔥 {streakDays} günlük seri! Bugün de devam et.</Text>
    </View>
  )
}

const ss = StyleSheet.create({
  root: {
    backgroundColor: colors.primaryLight,
    borderRadius: 16,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  txt: {
    ...(typography.label as object),
    color: colors.primaryDarker,
    fontWeight: '600',
  },
})

// ─────────────────────────────────────────────────────────────
// GameHomeScreen — ana ekran
// ─────────────────────────────────────────────────────────────
export default function GameHomeScreen() {
  const router  = useRouter()
  const { student } = useAuthStore()
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1, duration: 400, useNativeDriver: true,
    }).start()
  }, [fadeAnim])

  const name       = student?.fullName?.split(' ')[0] ?? 'Öğrenci'
  const currentArp = student?.currentArp  ?? 0
  const examTarget = (student?.examTarget ?? 'tyt').toUpperCase()
  const totalXp    = student?.totalXp    ?? 0
  const streakDays = student?.streakDays ?? 0
  const level      = getLevelFromXp(totalXp)

  const hour     = new Date().getHours()
  const greeting = hour < 12 ? 'Günaydın' : hour < 18 ? 'İyi günler' : 'İyi akşamlar'

  const examProg = calculateExamProgress(currentArp, examTarget.toLowerCase())
  const badgePct = Math.min(99, level * 15 + 10)

  const handleContinue = useCallback(() => {
    router.push(DEFAULT_ROUTE as any)
  }, [router])

  return (
    <SafeAreaView style={s.root}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.scroll}
        >
          <HomeHeader
            greeting={greeting}
            userName={name}
            streakDays={streakDays}
            totalXp={totalXp}
          />

          <DailyMissionCard
            examTarget={examTarget}
            progressPercent={examProg.progressPercent}
            remainingArp={examProg.remainingArp}
            onContinue={handleContinue}
          />

          <StreakMotivation streakDays={streakDays} />

          <MomentumStats
            arpDisplay={`+${currentArp}`}
            xpDisplay={totalXp.toLocaleString('tr')}
            badgePct={badgePct}
          />

          <View style={{ height: 32 }} />
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: 32 },
})
