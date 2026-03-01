// =====================================================
// PerformancePanel — Pure display component
//
// Kural: Store erişimi YOK. Tüm data props ile gelir.
// State owner: ReadingHubScreen
// =====================================================

import React, { useState, useEffect, useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { createClient } from '@supabase/supabase-js'
import { getLevelInfo, getXPProgress }  from '../../constants/levels'
import { useAuthStore }                 from '../../stores/authStore'
import { useAppTheme }                  from '../../theme/useAppTheme'
import type { AppTheme }                from '../../theme'
import { createAdaptiveService }        from '@sprinta/api'
import type { ReadingStats }            from '@sprinta/api'

// SPRINT 7 ADD — modül seviyesi supabase (re-render'da yeniden yaratılmaz)
const _supabase       = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
)
const _adaptive = createAdaptiveService(_supabase)

export interface PerformancePanelProps {
  totalXp:    number
  level:      number
  streakDays: number
  currentArp: number
}

export const PerformancePanel = React.memo(function PerformancePanel({
  totalXp,
  level,
  streakDays,
  currentArp,
}: PerformancePanelProps) {
  const t = useAppTheme()
  const s = useMemo(() => createStyles(t), [t])

  const levelInfo  = getLevelInfo(level)
  const xpProgress = getXPProgress(totalXp)
  const xpPct      = Math.round(xpProgress.progress * 100)

  // SPRINT 7 ADD — gerçek okuma istatistikleri (sessiz hata)
  const studentId = useAuthStore(st => st.student?.id)
  const [realStats, setRealStats] = useState<ReadingStats | null>(null)

  useEffect(() => {
    if (!studentId) return
    _adaptive.getUserStats()
      .then(result => { if (result.data) setRealStats(result.data) })
      .catch(() => {})
  }, [studentId])

  return (
    <View style={s.card}>

      {/* ── Seviye + XP ──────────────────────────────────── */}
      <View style={s.levelRow}>
        <View style={[s.levelBadge, { backgroundColor: levelInfo.color + '22' }]}>
          <Text style={s.levelIcon}>⚡</Text>
          <Text style={[s.levelNum, { color: levelInfo.color }]}>Sv {level}</Text>
        </View>

        <View style={s.xpBlock}>
          <View style={s.xpLabelRow}>
            <Text style={s.levelTitle}>{levelInfo.title}</Text>
            <Text style={s.xpText}>
              {xpProgress.current.toLocaleString()} / {xpProgress.needed.toLocaleString()} XP
            </Text>
          </View>
          <View style={s.xpBg}>
            <View
              style={[
                s.xpFill,
                {
                  width:           `${xpPct}%` as `${number}%`,
                  backgroundColor: levelInfo.color,
                },
              ]}
            />
          </View>
          <Text style={s.xpPct}>{xpPct}% tamamlandı</Text>
        </View>
      </View>

      {/* ── Alt istatistikler ─────────────────────────────── */}
      <View style={s.statsRow}>
        <View style={s.stat}>
          <Text style={s.statVal}>{Math.round(currentArp)}</Text>
          <Text style={s.statLbl}>📊 ARP Puanı</Text>
        </View>
        <View style={s.sep} />
        <View style={s.stat}>
          <Text style={s.statVal}>{streakDays}</Text>
          <Text style={s.statLbl}>🔥 Gün Serisi</Text>
        </View>
        <View style={s.sep} />
        <View style={s.stat}>
          <Text style={s.statVal}>{totalXp.toLocaleString()}</Text>
          <Text style={s.statLbl}>⭐ Toplam XP</Text>
        </View>
      </View>

      {/* SPRINT 7 ADD — okuma istatistikleri (gerçek veri varsa) */}
      {realStats != null && realStats.total_sessions > 0 && (
        <View style={s.readingRow}>
          <Text style={s.readingChip}>
            {realStats.total_sessions} bölüm okundu
          </Text>
          {realStats.avg_completion > 0 && (
            <Text style={s.readingChip}>
              %{Math.round(realStats.avg_completion * 100)} tamamlama
            </Text>
          )}
          {realStats.avg_wpm > 0 && (
            <Text style={s.readingChip}>
              {Math.round(realStats.avg_wpm)} ort. WPM
            </Text>
          )}
        </View>
      )}

    </View>
  )
})

// ─── Stiller ──────────────────────────────────────────
function createStyles(t: AppTheme) {
  return StyleSheet.create({
    card: {
      backgroundColor: t.colors.surface,
      borderRadius:    t.radius.lg,
      padding:         t.spacing.lg,
      gap:             t.spacing.md,
      ...t.shadows.sm,
    },
    levelRow: {
      flexDirection: 'row',
      alignItems:    'center',
      gap:           t.spacing.sm,
    },
    levelBadge: {
      alignItems:        'center',
      justifyContent:    'center',
      paddingHorizontal: t.spacing.sm,
      paddingVertical:   t.spacing.sm,
      borderRadius:      t.radius.md,
      gap:               2,
      minWidth:          52,
    },
    levelIcon: { fontSize: 16 },
    levelNum: {
      fontSize:   t.font.sm,
      fontWeight: '900',
    },
    xpBlock: { flex: 1, gap: 4 },
    xpLabelRow: {
      flexDirection:  'row',
      justifyContent: 'space-between',
      alignItems:     'center',
    },
    levelTitle: {
      fontSize:   t.font.sm,
      fontWeight: '700',
      color:      t.colors.text,
    },
    xpText: {
      fontSize: t.font.xs,
      color:    t.colors.textHint,
    },
    xpBg: {
      height:          5,
      borderRadius:    3,
      backgroundColor: t.colors.border,
      overflow:        'hidden',
    },
    xpFill: {
      height:       '100%',
      borderRadius: 3,
    },
    xpPct: {
      fontSize: t.font.xs,
      color:    t.colors.textHint,
    },
    statsRow: {
      flexDirection:  'row',
      alignItems:     'center',
      paddingTop:     t.spacing.xs,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: t.colors.divider,
    },
    stat: {
      flex:       1,
      alignItems: 'center',
      gap:        2,
    },
    statVal: {
      fontSize:   t.font.md,
      fontWeight: '800',
      color:      t.colors.text,
    },
    statLbl: {
      fontSize:  t.font.xs,
      color:     t.colors.textHint,
      textAlign: 'center',
    },
    sep: {
      width:           StyleSheet.hairlineWidth,
      height:          32,
      backgroundColor: t.colors.divider,
    },
    // SPRINT 7 ADD
    readingRow: {
      flexDirection: 'row',
      flexWrap:      'wrap',
      gap:           t.spacing.xs,
      paddingTop:    t.spacing.xs,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: t.colors.divider,
    },
    readingChip: {
      fontSize:          t.font.xs,
      color:             t.colors.primary,
      backgroundColor:   t.colors.greenLight,
      paddingHorizontal: t.spacing.sm,
      paddingVertical:   3,
      borderRadius:      20,
      overflow:          'hidden',
    },
  })
}
