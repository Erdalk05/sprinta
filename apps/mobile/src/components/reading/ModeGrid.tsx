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

// ─── Statik mod listesi — en popülerden en aza (sınav odaklı) ─────
export const READING_MODES: ModeItem[] = [
  {
    icon: '⚡', label: 'Chunk Okuma',
    subtitle: 'Kelimeyi grup grup gör · hızını 2×',
    route: '/exercise/chunk-rsvp', free: true, comingSoon: false,
  },
  {
    icon: '⏱️', label: 'Zamanlı Okuma',
    subtitle: 'Süre baskısı · YKS/TYT simülasyonu',
    route: '/exercise/timed-reading', free: true, comingSoon: false,
  },
  {
    icon: '🌊', label: 'Akış Okuma',
    subtitle: 'Satır pacing · anlama + hız dengesi',
    route: '/exercise/flow-reading', free: true, comingSoon: false,
  },
  {
    icon: '🪜', label: 'Hız Merdiveni',
    subtitle: 'Her 30 kelimede +25 WPM · limitini zorla',
    route: '/exercise/speed-ladder', free: true, comingSoon: false,
  },
  {
    icon: '🧬', label: 'Biyonik Okuma',
    subtitle: 'İlk heceler kalın · beyin tamamlar',
    route: '/exercise/bionic-reading', free: true, comingSoon: false,
  },
  {
    icon: '🔍', label: 'Anahtar Kelime',
    subtitle: 'Kritik bilgiyi tara · pasaj tekniği',
    route: '/exercise/keyword-scan', free: true, comingSoon: false,
  },
  {
    icon: '👁️', label: 'Göz Genişliği',
    subtitle: 'Flash gruplar · daha az göz hareketi',
    route: '/exercise/fixation-trainer', free: true, comingSoon: false,
  },
  {
    icon: '💫', label: 'Çok Kelime',
    subtitle: '2-4 kelime aynı anda · span artır',
    route: '/exercise/word-burst', free: true, comingSoon: false,
  },
  {
    icon: '📜', label: 'Oto Kaydırma',
    subtitle: 'Metin kendi hızında akar · ritim kur',
    route: '/exercise/auto-scroll', free: true, comingSoon: false,
  },
  {
    icon: '📝', label: 'Cümle Adım',
    subtitle: 'Cümle cümle ilerle · anlama odaklı',
    route: '/exercise/sentence-step', free: true, comingSoon: false,
  },
  {
    icon: '📚', label: 'Akademik Mod',
    subtitle: 'Derin anlama · ağır paragraf çözme',
    route: '/exercise/academic-mode', free: true, comingSoon: false,
  },
  {
    icon: '🎯', label: 'Dikkat Filtresi',
    subtitle: 'Tek satırı gör · odaklanmayı güçlendir',
    route: '/exercise/focus-filter', free: true, comingSoon: false,
  },
  {
    icon: '🧠', label: 'Hafıza Sabitleme',
    subtitle: 'Oku-gizle-hatırla · bilgiyi kalıcı yap',
    route: '/exercise/memory-anchor', free: true, comingSoon: false,
  },
  {
    icon: '📖', label: 'Kelime Haznesi',
    subtitle: 'Kelime öğren · bağlamsal anlam · LGS',
    route: '/exercise/vocabulary', free: true, comingSoon: false,
  },
  {
    icon: '🔮', label: 'Tahmin Okuma',
    subtitle: 'Cümle sonunu tahmin et · anlam bağlantısı',
    route: '/exercise/prediction-reading', free: true, comingSoon: false,
  },
  {
    icon: '🤫', label: 'Sessiz Okuma',
    subtitle: 'İç sesi bastır · subvokalizasyonu kır',
    route: '/exercise/subvocal-free', free: true, comingSoon: false,
  },
  {
    icon: '🏕️', label: 'Hızlı Okuma Kampı',
    subtitle: 'Günlük antrenman · WPM gelişimini izle',
    route: '/exercise/speed-camp', free: true, comingSoon: false,
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
      activeOpacity={mode.comingSoon ? 1 : 0.72}
    >
      <View style={s.iconWrap}>
        <Text style={s.icon}>{mode.icon}</Text>
      </View>
      <Text style={s.label} numberOfLines={1}>{mode.label}</Text>
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
      padding:         t.spacing.sm,
      paddingVertical: 14,
      minHeight:       112,
      borderWidth:     StyleSheet.hairlineWidth,
      borderColor:     t.colors.border,
      ...t.shadows.sm,
      gap: 4,
    },
    cardDim: { opacity: 0.45 },
    iconWrap: {
      width: 36, height: 36,
      borderRadius: 10,
      backgroundColor: t.colors.background,
      alignItems: 'center', justifyContent: 'center',
      marginBottom: 4,
    },
    icon:  { fontSize: 20 },
    label: {
      fontSize:   t.font.sm,
      fontWeight: '700',
      color:      t.colors.text,
    },
    subtitle: {
      fontSize:   11,
      color:      t.colors.textHint,
      lineHeight: 15,
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
