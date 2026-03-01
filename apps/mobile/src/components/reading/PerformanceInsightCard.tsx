// =====================================================
// PerformanceInsightCard — Sprint 7
//
// Okuma seviyesi + XP ilerleme kartı.
// Boş profil: "Okumaya devam et!" mesajı.
// =====================================================

import React, { useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useAppTheme } from '../../theme/useAppTheme'
import type { AppTheme } from '../../theme'
import type { UserDifficultyProfile } from '@sprinta/api'

// ─── Props ───────────────────────────────────────────
export interface PerformanceInsightCardProps {
  profile: UserDifficultyProfile | null
  xp:      number
  level:   number
}

// ─── Yardımcı: seviye dot'ları ───────────────────────
function LevelDots({ filled, s }: { filled: number; s: ReturnType<typeof createStyles> }) {
  return (
    <View style={s.dots}>
      {[1, 2, 3, 4, 5].map(i => (
        <View key={i} style={[s.dot, i <= filled ? s.dotFilled : s.dotEmpty]} />
      ))}
    </View>
  )
}

const LEVEL_LABELS: Record<number, string> = {
  1: 'Başlangıç',
  2: 'Temel',
  3: 'Orta',
  4: 'İleri',
  5: 'Uzman',
}

// ─── Bileşen ─────────────────────────────────────────
export function PerformanceInsightCard({
  profile,
  xp,
  level,
}: PerformanceInsightCardProps) {
  const t = useAppTheme()
  const s = useMemo(() => createStyles(t), [t])

  const xpInLevel   = xp % 500
  const xpToNext    = 500
  const progressRatio = xpInLevel / xpToNext
  const remaining   = xpToNext - xpInLevel

  // Profil yok — yeterli okuma yapılmamış
  if (!profile) {
    return (
      <View style={s.card}>
        <Text style={s.emptyText}>
          📚 Okumaya devam et! İlk 2 bölümden sonra seviyeni ölçeceğiz.
        </Text>
      </View>
    )
  }

  const recLabel = LEVEL_LABELS[profile.recommended_level] ?? 'Orta'

  return (
    <View style={s.card}>
      {/* ── Okuma Seviyesi ───────────────────────────── */}
      <View style={s.sectionRow}>
        <View style={s.sectionLeft}>
          <Text style={s.sectionLabel}>Okuma Seviyesi</Text>
          <View style={s.levelRow}>
            <LevelDots filled={profile.recommended_level} s={s} />
            <Text style={s.levelText}>{recLabel}</Text>
          </View>
        </View>
      </View>

      {/* ── İstatistikler ────────────────────────────── */}
      <View style={s.statsRow}>
        <View style={s.statBox}>
          <Text style={s.statValue}>
            %{Math.round(profile.avg_completion * 100)}
          </Text>
          <Text style={s.statLabel}>Tamamlama Oranı</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statBox}>
          <Text style={s.statValue}>
            {Math.round(profile.avg_wpm) > 0 ? Math.round(profile.avg_wpm) : '—'}
          </Text>
          <Text style={s.statLabel}>Ortalama WPM</Text>
        </View>
      </View>

      {/* ── XP İlerleme Çubuğu ──────────────────────── */}
      <View style={s.xpSection}>
        <View style={s.xpLabelRow}>
          <Text style={s.xpLevel}>Seviye {level}</Text>
          <Text style={s.xpHint}>
            Seviye {level + 1}'e {remaining.toLocaleString('tr-TR')} XP kaldı
          </Text>
        </View>
        <View style={s.xpBg}>
          <View style={[s.xpFill, { width: `${Math.round(progressRatio * 100)}%` as `${number}%` }]} />
        </View>
        <Text style={s.xpCount}>
          {xpInLevel.toLocaleString('tr-TR')} / {xpToNext.toLocaleString('tr-TR')} XP
        </Text>
      </View>
    </View>
  )
}

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
    emptyText: {
      fontSize:  t.font.sm,
      color:     t.colors.textHint,
      textAlign: 'center',
      lineHeight: 20,
    },
    sectionRow: {
      flexDirection:  'row',
      alignItems:     'center',
      justifyContent: 'space-between',
    },
    sectionLeft: { gap: 4 },
    sectionLabel: {
      fontSize:   t.font.xs,
      color:      t.colors.textHint,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing:  0.8,
    },
    levelRow: {
      flexDirection: 'row',
      alignItems:    'center',
      gap:           t.spacing.sm,
    },
    dots: {
      flexDirection: 'row',
      gap:           4,
    },
    dot: {
      width:        10,
      height:       10,
      borderRadius: 5,
    },
    dotFilled: {
      backgroundColor: t.colors.primary,
    },
    dotEmpty: {
      backgroundColor: t.colors.border,
    },
    levelText: {
      fontSize:   t.font.sm,
      fontWeight: '700',
      color:      t.colors.text,
    },
    statsRow: {
      flexDirection: 'row',
      alignItems:    'center',
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: t.colors.divider,
      paddingTop:    t.spacing.md,
    },
    statBox: {
      flex:       1,
      alignItems: 'center',
      gap:        2,
    },
    statValue: {
      fontSize:   t.font.xl,
      fontWeight: '800',
      color:      t.colors.text,
    },
    statLabel: {
      fontSize:  t.font.xs,
      color:     t.colors.textHint,
    },
    statDivider: {
      width:           StyleSheet.hairlineWidth,
      height:          36,
      backgroundColor: t.colors.divider,
    },
    xpSection: { gap: 6 },
    xpLabelRow: {
      flexDirection:  'row',
      justifyContent: 'space-between',
      alignItems:     'center',
    },
    xpLevel: {
      fontSize:   t.font.sm,
      fontWeight: '700',
      color:      t.colors.text,
    },
    xpHint: {
      fontSize: t.font.xs,
      color:    t.colors.textHint,
    },
    xpBg: {
      height:          8,
      borderRadius:    4,
      backgroundColor: t.colors.border,
      overflow:        'hidden',
    },
    xpFill: {
      height:          '100%',
      borderRadius:    4,
      backgroundColor: t.colors.primary,
    },
    xpCount: {
      fontSize:  t.font.xs,
      color:     t.colors.textHint,
      textAlign: 'right',
    },
  })
}
