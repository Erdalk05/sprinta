import React, { useEffect, useRef, useCallback, useMemo, useState } from 'react'
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
import { EventBus } from '../rewards/EventBus'
import { getBadgeById } from '../rewards/RewardEngine'

const DEFAULT_ROUTE = '/exercise/speed_control' as const

const MOTIVATION_MESSAGES = [
  'Harika gidiyorsun! 🚀',
  'Serini bozma! 🔥',
  'Bugün bir adım daha! 💪',
  'Zirveye oynuyorsun! 🏆',
  'Odaklan ve başar! 🎯',
  'Her gün biraz daha iyi! 📈',
]

// ─── CountUp animasyon ────────────────────────────────────────
function useCountUp(target: number, duration = 800): number {
  const anim = useRef(new Animated.Value(target)).current
  const [display, setDisplay] = useState(target)
  const prevTarget = useRef(target)

  useEffect(() => {
    if (prevTarget.current === target) return
    prevTarget.current = target
    anim.setValue(prevTarget.current)
    const listener = anim.addListener(({ value }) => setDisplay(Math.round(value)))
    Animated.timing(anim, { toValue: target, duration, useNativeDriver: false }).start(() => {
      anim.removeListener(listener)
    })
    return () => anim.removeAllListeners()
  }, [target])

  return display
}

// ─── BadgeToast ───────────────────────────────────────────────
function BadgeToast({ badgeId, onHide }: { badgeId: string; onHide: () => void }) {
  const badge = getBadgeById(badgeId)
  const slideY = useRef(new Animated.Value(-80)).current
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideY, { toValue: 0, useNativeDriver: true, speed: 18, bounciness: 8 }),
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start()

    const t = setTimeout(() => {
      Animated.parallel([
        Animated.timing(slideY, { toValue: -80, duration: 300, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(onHide)
    }, 2000)

    return () => clearTimeout(t)
  }, [])

  if (!badge) return null

  return (
    <Animated.View style={[bt.root, { transform: [{ translateY: slideY }], opacity }]}>
      <Text style={bt.emoji}>{badge.emoji}</Text>
      <Text style={bt.txt}>{badge.title} rozeti kazandın!</Text>
    </Animated.View>
  )
}
const bt = StyleSheet.create({
  root: {
    position: 'absolute', top: 12, left: spacing.md, right: spacing.md, zIndex: 999,
    backgroundColor: colors.primaryDarker, borderRadius: 14,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 12,
    ...shadows.md,
  },
  emoji: { fontSize: 20 },
  txt:   { ...(typography.label as object), color: '#fff', fontWeight: '600', flex: 1 },
})

// ─── HomeHeader ───────────────────────────────────────────────
interface HomeHeaderProps {
  greeting:   string
  userName:   string
  streakDays: number
  totalXp:    number
  message:    string
}

function HomeHeader({ greeting, userName, streakDays, totalXp, message }: HomeHeaderProps) {
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
        <Text style={sh.message}>{message}</Text>
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
    flexDirection: 'row', alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  left:    { flex: 1 },
  greeting:{ ...(typography.caption as object), color: colors.textSecondary },
  name:    { ...(typography.h3 as object), color: colors.textPrimary, marginTop: 2 },
  message: { ...(typography.caption as object), color: colors.primary, marginTop: 4, fontWeight: '600' },
  right:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
})

// ─── StreakWarningBanner ─────────────────────────────────────
function StreakWarningBanner() {
  return (
    <View style={sw.root}>
      <Text style={sw.txt}>
        🔥 Serini korumak için bugün 1 antrenman yeterli!
      </Text>
    </View>
  )
}
const sw = StyleSheet.create({
  root: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1.5, borderColor: colors.primary,
    borderRadius: 14,
    marginHorizontal: spacing.md, marginTop: spacing.sm,
    padding: spacing.md,
  },
  txt: { ...(typography.label as object), color: colors.primaryDarker, fontWeight: '600' },
})

// ─── DailyMissionCard ─────────────────────────────────────────
interface DailyMissionCardProps {
  examTarget:      string
  progressPercent: number
  remainingArp:    number
  hasLastSession:  boolean
  onContinue:      () => void
}

function DailyMissionCard({
  examTarget, progressPercent, remainingArp, hasLastSession, onContinue,
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

  const ctaText = hasLastSession ? 'Kaldığın Yerden Devam Et ▶' : 'Hızlı Başla (3 dk) ⚡'

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
          <Text style={sc.btnTxt}>{ctaText}</Text>
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
    borderRadius: 12, paddingVertical: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  btnTxt: { fontSize: 17, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },
})

// ─── MomentumStats (micro animasyon) ─────────────────────────
interface MomentumStatsProps {
  arpDisplay: string
  xpValue:    number
  badgePct:   number
}

function MomentumStats({ arpDisplay, xpValue, badgePct }: MomentumStatsProps) {
  const xpAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.sequence([
      Animated.spring(xpAnim, { toValue: 1.08, useNativeDriver: true, speed: 40, bounciness: 6 }),
      Animated.spring(xpAnim, { toValue: 1,    useNativeDriver: true, speed: 40, bounciness: 6 }),
    ]).start()
  }, [xpValue])

  const xpDisplay = useCountUp(xpValue)

  const items: ReadonlyArray<{ emoji: string; value: string; label: string; scale?: Animated.Value }> = [
    { emoji: '🏆', value: arpDisplay,              label: 'Haftalık\nİlerleme' },
    { emoji: '⚡', value: xpDisplay.toLocaleString('tr'), label: 'Kazanılan\nXP', scale: xpAnim },
    { emoji: '⭐', value: `%${badgePct}`,           label: 'Rozet\nİlerlemesi' },
  ]

  return (
    <View style={sm.row}>
      {items.map((it, i) => (
        <Animated.View
          key={i}
          style={[sm.card, it.scale ? { transform: [{ scale: it.scale }] } : undefined]}
        >
          <Text style={sm.emoji}>{it.emoji}</Text>
          <Text style={sm.val}>{it.value}</Text>
          <Text style={sm.lbl}>{it.label}</Text>
        </Animated.View>
      ))}
    </View>
  )
}
const sm = StyleSheet.create({
  row:  { flexDirection: 'row', marginHorizontal: spacing.md, gap: 10, marginTop: spacing.md },
  card: { flex: 1, backgroundColor: '#F4F4F4', borderRadius: 12, padding: 12, alignItems: 'center' },
  emoji:{ fontSize: 22, marginBottom: 4 },
  val:  { ...(typography.h3 as object), color: colors.textPrimary, marginBottom: 2 },
  lbl:  { ...(typography.caption as object), color: colors.textSecondary, textAlign: 'center', lineHeight: 16 },
})

// ─── StreakMotivation ─────────────────────────────────────────
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
    backgroundColor: colors.primaryLight, borderRadius: 16,
    marginHorizontal: spacing.md, marginTop: spacing.md, padding: spacing.md,
  },
  txt: { ...(typography.label as object), color: colors.primaryDarker, fontWeight: '600' },
})

// ─── GameHomeScreen ───────────────────────────────────────────
export default function GameHomeScreen() {
  const router  = useRouter()
  const { student } = useAuthStore()
  const fadeAnim = useRef(new Animated.Value(0)).current
  const [badgeToast, setBadgeToast] = useState<string | null>(null)

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start()
  }, [fadeAnim])

  // EventBus: badge unlock toast
  useEffect(() => {
    const handler = ({ badgeId }: { badgeId: string }) => {
      setBadgeToast(badgeId)
    }
    EventBus.on('BADGE_UNLOCKED', handler)
    return () => EventBus.off('BADGE_UNLOCKED', handler)
  }, [])

  const name       = student?.fullName?.split(' ')[0] ?? 'Öğrenci'
  const currentArp = student?.currentArp  ?? 0
  const examTarget = (student?.examTarget ?? 'tyt').toUpperCase()
  const totalXp    = student?.totalXp    ?? 0
  const streakDays = student?.streakDays ?? 0
  const level      = getLevelFromXp(totalXp)

  const hour     = new Date().getHours()
  const greeting = hour < 12 ? 'Günaydın' : hour < 18 ? 'İyi günler' : 'İyi akşamlar'

  // Random motivasyon mesajı (mount'ta sabit)
  const message = useMemo(
    () => MOTIVATION_MESSAGES[Math.floor(Math.random() * MOTIVATION_MESSAGES.length)],
    []
  )

  // Streak korku motoru: saat 20:00+ ve bugün aktivite yok
  const showStreakWarning = streakDays > 0 && hour >= 20

  const examProg = calculateExamProgress(currentArp, examTarget.toLowerCase())
  const badgePct = Math.min(99, level * 15 + 10)

  const handleContinue = useCallback(() => {
    router.push(DEFAULT_ROUTE as any)
  }, [router])

  return (
    <SafeAreaView style={s.root}>
      {badgeToast && (
        <BadgeToast badgeId={badgeToast} onHide={() => setBadgeToast(null)} />
      )}

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
          <HomeHeader
            greeting={greeting}
            userName={name}
            streakDays={streakDays}
            totalXp={totalXp}
            message={message}
          />

          {showStreakWarning && <StreakWarningBanner />}

          <DailyMissionCard
            examTarget={examTarget}
            progressPercent={examProg.progressPercent}
            remainingArp={examProg.remainingArp}
            hasLastSession={totalXp > 0}
            onContinue={handleContinue}
          />

          <StreakMotivation streakDays={streakDays} />

          <MomentumStats
            arpDisplay={`+${currentArp}`}
            xpValue={totalXp}
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
