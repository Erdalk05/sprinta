// =====================================================
// ModeGrid — Pure display component
//
// Kural: Router ve premiumGate YOK.
// Navigation kararı parent'a (ReadingHubScreen) bırakılır.
// State owner: ReadingHubScreen
// =====================================================

import React, { useMemo } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useAppTheme } from '../../theme/useAppTheme'
import type { AppTheme } from '../../theme'

// ─── Tip — ReadingHubScreen tarafından da import edilir ───
export interface ModeItem {
  icon:       string
  label:      string
  subtitle:   string
  route:      string | null
  free:       boolean
  comingSoon: boolean
}

// ─── Statik mod listesi (module-level sabit) ──────────
export const READING_MODES: ModeItem[] = [
  {
    icon: '🏕️', label: 'Hızlı Okuma Kampı',
    subtitle: 'Günlük devreniz · WPM trend',
    route: '/exercise/speed-camp', free: true, comingSoon: false,
  },
  {
    icon: '👁️', label: 'Göz Genişliği',
    subtitle: 'Flash kelime grupları · Span artır',
    route: '/exercise/fixation-trainer', free: true, comingSoon: false,
  },
  {
    icon: '⚡', label: 'Chunk Okuma',
    subtitle: 'RSVP · Bionic · Hız kontrolü',
    route: '/exercise/chunk-rsvp', free: true, comingSoon: false,
  },
  {
    icon: '🌊', label: 'Akış Okuma',
    subtitle: 'Satır pacing · Sprint modu',
    route: '/exercise/flow-reading', free: true, comingSoon: false,
  },
  {
    icon: '📖', label: 'Kelime Haznesi',
    subtitle: 'Bağlamsal öğrenme · LGS / TYT',
    route: '/exercise/vocabulary', free: true, comingSoon: false,
  },
  {
    icon: '⏱️', label: 'Zamanlı Okuma',
    subtitle: 'Süre baskısı · Hız rekoru',
    route: '/exercise/timed-reading', free: true, comingSoon: false,
  },
  {
    icon: '📚', label: 'Akademik Mod',
    subtitle: 'Yavaş tempo · Ağır metinler',
    route: '/exercise/academic-mode', free: true, comingSoon: false,
  },
  {
    icon: '🔍', label: 'Anahtar Kelime',
    subtitle: 'Tarama tekniği · Hızlı bulma',
    route: '/exercise/keyword-scan', free: true, comingSoon: false,
  },
  {
    icon: '🧠', label: 'Hafıza Sabitleme',
    subtitle: 'Spaced repetition · Geri çağırma',
    route: '/exercise/memory-anchor', free: true, comingSoon: false,
  },
  {
    icon: '🔮', label: 'Tahmin Okuma',
    subtitle: 'Anlamsal bağlantı · Tahmin',
    route: '/exercise/prediction-reading', free: true, comingSoon: false,
  },
  {
    icon: '🎯', label: 'Dikkat Filtresi',
    subtitle: 'Ritim egzersizi · Odak geliştirme',
    route: '/exercise/focus-filter', free: true, comingSoon: false,
  },
  {
    icon: '🤫', label: 'Sessiz Okuma',
    subtitle: 'Alt ses bastırma · Hız artırımı',
    route: '/exercise/subvocal-free', free: true, comingSoon: false,
  },
]

// ─── Props ────────────────────────────────────────────
interface ModeGridProps {
  onModePress: (mode: ModeItem) => void
}

// ─── ModeCard — React.memo ile gereksiz render engellenir ─
interface ModeCardProps {
  mode:    ModeItem
  onPress: (mode: ModeItem) => void
  s:       ReturnType<typeof createStyles>
}

const ModeCard = React.memo(function ModeCard({ mode, onPress, s }: ModeCardProps) {
  return (
    <TouchableOpacity
      style={[s.card, mode.comingSoon && s.cardDim]}
      onPress={() => onPress(mode)}
      activeOpacity={mode.comingSoon ? 1 : 0.75}
    >
      <Text style={s.icon}>{mode.icon}</Text>
      <Text style={s.label} numberOfLines={2}>{mode.label}</Text>
      <Text style={s.subtitle} numberOfLines={2}>{mode.subtitle}</Text>

      {mode.comingSoon && (
        <View style={s.comingSoonBadge}>
          <Text style={s.comingSoonTxt}>Yakında</Text>
        </View>
      )}
      {!mode.free && !mode.comingSoon && (
        <View style={s.premiumDot}>
          <Text style={s.premiumIcon}>👑</Text>
        </View>
      )}
    </TouchableOpacity>
  )
})

// ─── ModeGrid — görsel katman, logic yok ──────────────
export const ModeGrid = React.memo(function ModeGrid({ onModePress }: ModeGridProps) {
  const t = useAppTheme()
  const s = useMemo(() => createStyles(t), [t])

  // 2-kolonlu satırlar (stable — READING_MODES module sabiti)
  const rows = useMemo(() => {
    const result: ModeItem[][] = []
    for (let i = 0; i < READING_MODES.length; i += 2) {
      result.push(READING_MODES.slice(i, i + 2))
    }
    return result
  }, [])

  return (
    <View style={s.container}>
      {rows.map((row, ri) => (
        <View key={row[0]?.label ?? ri} style={s.row}>
          {row.map(mode => (
            <ModeCard
              key={mode.label}
              mode={mode}
              onPress={onModePress}
              s={s}
            />
          ))}
          {row.length === 1 && <View style={{ flex: 1 }} />}
        </View>
      ))}
    </View>
  )
})

// ─── Stiller ──────────────────────────────────────────
function createStyles(t: AppTheme) {
  return StyleSheet.create({
    container: { gap: 10 },
    row: {
      flexDirection: 'row',
      gap:           10,
    },
    card: {
      flex:            1,
      backgroundColor: t.colors.surface,
      borderRadius:    t.radius.lg,
      padding:         t.spacing.md,
      minHeight:       108,
      borderWidth:     StyleSheet.hairlineWidth,
      borderColor:     t.colors.border,
      ...t.shadows.sm,
    },
    cardDim: { opacity: 0.52 },
    icon:  { fontSize: 24, marginBottom: 6 },
    label: {
      fontSize:   t.font.sm,
      fontWeight: '700',
      color:      t.colors.text,
      marginBottom: 3,
    },
    subtitle: {
      fontSize:   t.font.xs,
      color:      t.colors.textHint,
      lineHeight: 14,
    },
    comingSoonBadge: {
      marginTop:         8,
      alignSelf:         'flex-start',
      backgroundColor:   t.colors.border,
      borderRadius:      6,
      paddingHorizontal: 7,
      paddingVertical:   2,
    },
    comingSoonTxt: {
      fontSize:   t.font.xs,
      color:      t.colors.textHint,
      fontWeight: '700',
    },
    premiumDot: {
      position: 'absolute',
      top:      8,
      right:    8,
    },
    premiumIcon: { fontSize: 13 },
  })
}
