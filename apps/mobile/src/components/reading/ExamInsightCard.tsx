// =====================================================
// ExamInsightCard.tsx — Sprint 8
// Sınav risk profili + reading–exam correlation özeti
// Pure component (props-only, no async)
// =====================================================

import React, { useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useAppTheme } from '../../theme/useAppTheme'
import type { AppTheme } from '../../theme'
import type { UserExamProfile, ReadingExamCorrelation } from '@sprinta/api'

interface ExamInsightCardProps {
  profile:     UserExamProfile      | null
  correlation: ReadingExamCorrelation | null
}

// Soru tipi Türkçe etiketleri
const TYPE_LABELS: Record<string, string> = {
  main_idea:  'Ana Fikir',
  inference:  'Çıkarım',
  detail:     'Ayrıntı',
  vocabulary: 'Kelime',
  tone:       'Ton / Bakış',
}

// Risk seviyesi renkleri
function riskColor(level: number, t: AppTheme): string {
  if (level >= 4) return '#EF4444'   // kırmızı
  if (level >= 3) return '#F59E0B'   // sarı
  return t.colors.energyGreen ?? '#00C853'
}

// Risk seviyesi etiketi
function riskLabel(level: number): string {
  if (level >= 5) return 'Çok Yüksek'
  if (level >= 4) return 'Yüksek'
  if (level >= 3) return 'Orta'
  if (level >= 2) return 'Düşük'
  return 'Çok Düşük'
}

// Reading style Türkçe
function styleLabel(style: ReadingExamCorrelation['reading_style']): string {
  if (style === 'surface_reader') return 'Yüzeysel Okuyucu'
  if (style === 'deep_slow')      return 'Derin Analizci'
  return 'Dengeli Okuyucu'
}

export const ExamInsightCard = React.memo(function ExamInsightCard({
  profile,
  correlation,
}: ExamInsightCardProps) {
  const t = useAppTheme()
  const s = useMemo(() => createStyles(t), [t])

  // Hiç veri yok → teşvik mesajı
  if (!profile) {
    return (
      <View style={s.card}>
        <View style={s.headerRow}>
          <Text style={s.icon}>🎯</Text>
          <Text style={s.title}>Sınav Zeka Analizi</Text>
        </View>
        <Text style={s.emptyText}>
          İlk soruları yanıtla!{'\n'}
          Sınav zeka profilin oluşturulsun.
        </Text>
      </View>
    )
  }

  const accEntries: Array<{ key: string; label: string; acc: number }> = [
    { key: 'main_idea',  label: TYPE_LABELS.main_idea,  acc: profile.main_idea_accuracy },
    { key: 'inference',  label: TYPE_LABELS.inference,  acc: profile.inference_accuracy },
    { key: 'detail',     label: TYPE_LABELS.detail,     acc: profile.detail_accuracy },
    { key: 'vocabulary', label: TYPE_LABELS.vocabulary,  acc: profile.vocabulary_accuracy },
    { key: 'tone',       label: TYPE_LABELS.tone,        acc: profile.tone_accuracy },
  ]

  // En zayıf alan
  const weakEntry = accEntries.reduce((min, e) => e.acc < min.acc ? e : min, accEntries[0])
  const rColor    = riskColor(profile.risk_level, t)

  return (
    <View style={s.card}>
      {/* ── Başlık ──────────────────────────────────── */}
      <View style={s.headerRow}>
        <Text style={s.icon}>🎯</Text>
        <Text style={s.title}>Sınav Zeka Analizi</Text>
        <View style={[s.riskBadge, { backgroundColor: rColor + '22' }]}>
          <Text style={[s.riskBadgeTxt, { color: rColor }]}>
            Risk {profile.risk_level}/5 · {riskLabel(profile.risk_level)}
          </Text>
        </View>
      </View>

      {/* ── Soru tipi accuracy barları ──────────────── */}
      <View style={s.barsSection}>
        {accEntries.map(({ key, label, acc }) => {
          const pct   = Math.round(acc * 100)
          const isWeak = key === weakEntry.key && acc < 0.65
          return (
            <View key={key} style={s.barRow}>
              <Text style={[s.barLabel, isWeak && s.barLabelWeak]}>
                {label}
              </Text>
              <View style={s.barTrack}>
                <View
                  style={[
                    s.barFill,
                    {
                      width:           `${Math.min(100, pct)}%`,
                      backgroundColor: isWeak ? rColor : (t.colors.energyGreen ?? '#00C853'),
                    },
                  ]}
                />
              </View>
              <Text style={[s.barPct, isWeak && { color: rColor }]}>
                %{pct}
              </Text>
            </View>
          )
        })}
      </View>

      {/* ── Correlation / Reading Style ─────────────── */}
      {correlation != null && (
        <View style={s.correlSection}>
          <View style={s.correlRow}>
            <Text style={s.correlLabel}>Okuma Stili</Text>
            <Text style={s.correlValue}>{styleLabel(correlation.reading_style)}</Text>
          </View>
          {correlation.risk_flags.length > 0 && (
            <View style={s.flagBox}>
              {correlation.risk_flags.map((flag, idx) => (
                <View key={idx} style={s.flagRow}>
                  <Text style={s.flagIcon}>⚠</Text>
                  <Text style={s.flagText}>{flag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* ── Zayıf alan uyarısı ──────────────────────── */}
      {weakEntry.acc < 0.65 && (
        <View style={[s.warnBox, { borderColor: rColor + '44' }]}>
          <Text style={[s.warnText, { color: rColor }]}>
            ⚠ {weakEntry.label} sorularında{' '}
            {correlation?.improvement_focus === 'speed_control'
              ? 'hız kontrolü önerilir'
              : 'odaklanmalısın'}
          </Text>
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
      padding:         t.spacing.md,
      gap:             t.spacing.md,
      ...t.shadows.sm,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems:    'center',
      gap:           t.spacing.sm,
    },
    icon:  { fontSize: 18 },
    title: {
      flex:       1,
      fontSize:   t.font.md,
      fontWeight: '800',
      color:      t.colors.text,
    },
    riskBadge: {
      paddingHorizontal: t.spacing.sm,
      paddingVertical:   3,
      borderRadius:      20,
    },
    riskBadgeTxt: {
      fontSize:   t.font.xs,
      fontWeight: '700',
    },

    // Accuracy barları
    barsSection: { gap: t.spacing.xs },
    barRow: {
      flexDirection: 'row',
      alignItems:    'center',
      gap:           t.spacing.sm,
    },
    barLabel: {
      fontSize:  t.font.xs,
      color:     t.colors.textHint,
      width:     72,
    },
    barLabelWeak: {
      color:      t.colors.text,
      fontWeight: '700',
    },
    barTrack: {
      flex:            1,
      height:          6,
      backgroundColor: t.colors.border,
      borderRadius:    3,
      overflow:        'hidden',
    },
    barFill: {
      height:       6,
      borderRadius: 3,
    },
    barPct: {
      fontSize: t.font.xs,
      color:    t.colors.textHint,
      width:    32,
      textAlign: 'right',
    },

    // Correlation
    correlSection: { gap: t.spacing.xs },
    correlRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    correlLabel: {
      fontSize: t.font.xs,
      color:    t.colors.textHint,
    },
    correlValue: {
      fontSize:   t.font.xs,
      fontWeight: '700',
      color:      t.colors.text,
    },
    flagBox: { gap: 4 },
    flagRow: {
      flexDirection: 'row',
      alignItems:    'center',
      gap:           t.spacing.xs,
    },
    flagIcon: { fontSize: 11, color: '#F59E0B' },
    flagText: {
      fontSize: t.font.xs,
      color:    t.colors.textHint,
      flex:     1,
    },

    // Uyarı kutusu
    warnBox: {
      borderWidth:   1,
      borderRadius:  t.radius.md,
      padding:       t.spacing.sm,
    },
    warnText: {
      fontSize:   t.font.xs,
      fontWeight: '600',
    },

    emptyText: {
      fontSize:   t.font.sm,
      color:      t.colors.textHint,
      textAlign:  'center',
      lineHeight: 20,
      paddingVertical: t.spacing.sm,
    },
  })
}
