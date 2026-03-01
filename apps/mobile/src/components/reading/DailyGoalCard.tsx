// =====================================================
// DailyGoalCard — Günlük okuma hedefi + ilerleme
//
// Veri: daily_stats (bugün) + students.streak_days
// Görsel: circular ring + süre + streak sayacı
// =====================================================

import React, { useState, useEffect, useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { supabase } from '../../lib/supabase'
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, Easing,
} from 'react-native-reanimated'
import { useAuthStore } from '../../stores/authStore'
import { useAppTheme } from '../../theme/useAppTheme'
import type { AppTheme } from '../../theme'

const DEFAULT_GOAL_MIN = 15   // 15 dk varsayılan hedef

interface DailyStats {
  total_minutes:    number
  daily_goal_minutes: number | null
  goal_completed:   boolean
  xp_earned:        number
}

// ─── Streak motivasyon mesajı ─────────────────────
function streakMessage(days: number): string {
  if (days === 0) return 'Okumaya başla! 🚀'
  if (days === 1) return 'Harika başlangıç! ✨'
  if (days < 7)  return `${days} gün üst üste! 💪`
  if (days < 14) return `${days} günlük seri! 🔥`
  if (days < 30) return `${days} gün — müthiş! ⚡`
  return `${days} gün — efsane! 🏆`
}

// ─── Ana Bileşen ──────────────────────────────────

export const DailyGoalCard = React.memo(function DailyGoalCard() {
  const t       = useAppTheme()
  const s       = useMemo(() => createStyles(t), [t])
  const student = useAuthStore(st => st.student)

  const [stats,   setStats]   = useState<DailyStats | null>(null)
  const [loading, setLoading] = useState(true)

  // Animasyon: ring dolumu (0→1)
  const ringProgress = useSharedValue(0)

  useEffect(() => {
    if (!student?.id) { setLoading(false); return }
    let cancelled = false

    ;(async () => {
      try {
        const today = new Date().toISOString().slice(0, 10)
        const { data } = await (supabase as any)
          .from('daily_stats')
          .select('total_minutes, daily_goal_minutes, goal_completed, xp_earned')
          .eq('student_id', student.id)
          .eq('date', today)
          .maybeSingle()

        if (cancelled) return
        setStats(data ?? null)

        // Ring animasyonu
        const goal = (data?.daily_goal_minutes ?? DEFAULT_GOAL_MIN)
        const done = data?.total_minutes ?? 0
        const pct  = Math.min(1, goal > 0 ? done / goal : 0)
        ringProgress.value = withTiming(pct, { duration: 900, easing: Easing.out(Easing.cubic) })
      } catch {
        // sessiz
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => { cancelled = true }
  }, [student?.id])

  const goalMin     = stats?.daily_goal_minutes ?? DEFAULT_GOAL_MIN
  const doneMin     = stats?.total_minutes ?? 0
  const pct         = Math.min(1, goalMin > 0 ? doneMin / goalMin : 0)
  const isCompleted = stats?.goal_completed ?? (pct >= 1)
  const streak      = student?.streakDays ?? 0
  const xpToday     = stats?.xp_earned ?? 0

  // Ring renkler
  const ACCENT = isCompleted ? '#10B981' : '#3B82F6'
  const RING_SIZE = 72
  const STROKE    = 6
  const RADIUS    = (RING_SIZE - STROKE * 2) / 2
  const CIRC      = 2 * Math.PI * RADIUS
  const fillOffset = useAnimatedStyle(() => ({
    transform: [{ rotate: `${-90 + ringProgress.value * 360}deg` }],
  }))

  return (
    <View style={s.card}>

      {/* ── Sol: Ring + süre ──────────────────────────── */}
      <View style={s.ringWrap}>
        {/* Track */}
        <View style={[s.ringTrack, { width: RING_SIZE, height: RING_SIZE, borderRadius: RING_SIZE / 2,
          borderWidth: STROKE, borderColor: t.colors.border }]} />
        {/* Fill — animasyonlu slice */}
        <Animated.View
          style={[
            s.ringFillContainer,
            { width: RING_SIZE, height: RING_SIZE, borderRadius: RING_SIZE / 2 },
            fillOffset,
          ]}
        >
          <View
            style={{
              width: RING_SIZE / 2,
              height: RING_SIZE,
              overflow: 'hidden',
              position: 'absolute',
              left: RING_SIZE / 2,
            }}
          >
            <View
              style={{
                width: RING_SIZE,
                height: RING_SIZE,
                borderRadius: RING_SIZE / 2,
                borderWidth: STROKE,
                borderColor: ACCENT,
                position: 'absolute',
                left: -RING_SIZE / 2,
              }}
            />
          </View>
        </Animated.View>

        {/* Merkez metin */}
        <View style={s.ringCenter}>
          {isCompleted ? (
            <Text style={{ fontSize: 22 }}>✅</Text>
          ) : (
            <>
              <Text style={[s.ringPct, { color: ACCENT }]}>{Math.round(pct * 100)}%</Text>
            </>
          )}
        </View>
      </View>

      {/* ── Sağ: Detaylar ─────────────────────────────── */}
      <View style={s.details}>
        <Text style={s.cardTitle}>Günlük Hedef</Text>

        {/* Süre çubuğu */}
        <View style={s.progressRow}>
          <View style={[s.progressTrack, { backgroundColor: t.colors.border }]}>
            <View style={[s.progressFill, {
              width: `${Math.round(pct * 100)}%` as any,
              backgroundColor: ACCENT,
            }]} />
          </View>
          <Text style={[s.progressLabel, { color: ACCENT }]}>
            {doneMin}/{goalMin} dk
          </Text>
        </View>

        {/* XP bugün */}
        {xpToday > 0 && (
          <Text style={s.xpTxt}>+{xpToday} XP bugün ⭐</Text>
        )}

        {/* Streak */}
        <View style={s.streakRow}>
          <Text style={{ fontSize: 14 }}>{streak > 0 ? '🔥' : '💤'}</Text>
          <Text style={s.streakTxt}>{streakMessage(streak)}</Text>
        </View>

        {isCompleted && (
          <View style={s.completedBadge}>
            <Text style={s.completedTxt}>Tamamlandı 🎉</Text>
          </View>
        )}
      </View>

    </View>
  )
})

// ─── Stiller ──────────────────────────────────────────
function createStyles(t: AppTheme) {
  return StyleSheet.create({
    card: {
      backgroundColor: t.colors.surface,
      borderRadius:    t.radius.lg,
      padding:         t.spacing.md,
      borderWidth:     StyleSheet.hairlineWidth,
      borderColor:     t.colors.border,
      flexDirection:   'row',
      alignItems:      'center',
      gap:             t.spacing.md,
    },
    ringWrap: {
      width:           72,
      height:          72,
      alignItems:      'center',
      justifyContent:  'center',
      flexShrink:      0,
    },
    ringTrack: {
      position: 'absolute',
    },
    ringFillContainer: {
      position: 'absolute',
    },
    ringCenter: {
      alignItems:     'center',
      justifyContent: 'center',
    },
    ringPct: {
      fontSize:   13,
      fontWeight: '900',
    },
    details: {
      flex: 1,
      gap:  6,
    },
    cardTitle: {
      fontSize:   t.font.sm,
      fontWeight: '800',
      color:      t.colors.text,
    },
    progressRow: {
      gap: 4,
    },
    progressTrack: {
      height:       5,
      borderRadius: 3,
      overflow:     'hidden',
    },
    progressFill: {
      height:       5,
      borderRadius: 3,
    },
    progressLabel: {
      fontSize:   t.font.xs,
      fontWeight: '700',
    },
    xpTxt: {
      fontSize:  t.font.xs,
      color:     '#F59E0B',
      fontWeight: '600',
    },
    streakRow: {
      flexDirection: 'row',
      alignItems:    'center',
      gap:           4,
    },
    streakTxt: {
      fontSize:  t.font.xs,
      color:     t.colors.textHint,
      fontWeight: '600',
    },
    completedBadge: {
      backgroundColor: '#10B98122',
      borderRadius:    6,
      paddingHorizontal: 8,
      paddingVertical:   3,
      alignSelf:       'flex-start',
    },
    completedTxt: {
      fontSize:   t.font.xs,
      fontWeight: '800',
      color:      '#10B981',
    },
  })
}
