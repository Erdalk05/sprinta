import React, { useMemo } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView,
} from 'react-native'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { useAppTheme } from '../../src/theme/useAppTheme'
import type { AppTheme } from '../../src/theme'

// ─── Modül Tanımları ──────────────────────────────────────────────
interface Module {
  code: string
  label: string
  subtitle: string
  icon: string
  duration: string
  gradient: readonly [string, string, ...string[]]
  route: string
}

export default function SessionsScreen() {
  const t      = useAppTheme()
  const s      = useMemo(() => ms(t), [t])
  const router = useRouter()

  const MODULES: Module[] = useMemo(() => [
    {
      code:     'speed_control',
      label:    'Hız Kontrolü',
      subtitle: 'WPM arttır · Saccade · Subvocalization kır',
      icon:     '⚡',
      duration: '10–20 dk',
      gradient: t.gradients.speedControl as [string, string],
      route:    '/exercise/speed_control',
    },
    {
      code:     'chunk_rsvp',
      label:    'Chunk RSVP',
      subtitle: 'Parça parça okuma · Bionic · Akıllı yavaşlama',
      icon:     '🔥',
      duration: '8–15 dk',
      gradient: ['#f7971e', '#ffd200'] as [string, string],
      route:    '/exercise/chunk-rsvp',
    },
    {
      code:     'flow_reading',
      label:    'Akış Okuma',
      subtitle: 'Satır pacing · Cursor animasyon · Sprint & Cruise',
      icon:     '🌊',
      duration: '10–20 dk',
      gradient: ['#4facfe', '#00f2fe'] as [string, string],
      route:    '/exercise/flow-reading',
    },
    {
      code:     'deep_comprehension',
      label:    'Derin Kavrama',
      subtitle: 'Anlama ve hatırlama gücünü geliştir',
      icon:     '🧠',
      duration: '15–25 dk',
      gradient: t.gradients.deepComp as [string, string],
      route:    '/exercise/deep_comprehension',
    },
    {
      code:     'attention_power',
      label:    'Dikkat Gücü',
      subtitle: 'Odak süreni uzat · Dikkat dağılmasını önle',
      icon:     '🎯',
      duration: '10–15 dk',
      gradient: t.gradients.attention as [string, string],
      route:    '/exercise/attention_power',
    },
    {
      code:     'mental_reset',
      label:    'Zihinsel Sıfırlama',
      subtitle: 'Nefes · Gevşeme · Bilişsel yorgunluğu at',
      icon:     '🌿',
      duration: '5–10 dk',
      gradient: t.gradients.mentalReset as [string, string],
      route:    '/exercise/mental_reset',
    },
    {
      code:     'eye_training',
      label:    'Göz Antrenmanı',
      subtitle: 'Periferik görüş · Göz hareketleri · Saccade',
      icon:     '👁️',
      duration: '10–15 dk',
      gradient: t.gradients.eyeTraining as [string, string],
      route:    '/exercise/eye_training',
    },
    {
      code:     'vocabulary',
      label:    'Kelime Hazinesi',
      subtitle: 'Aktif kelime dağarcığını genişlet · LGS / TYT',
      icon:     '📖',
      duration: '10–20 dk',
      gradient: t.gradients.vocabulary as [string, string],
      route:    '/exercise/vocabulary',
    },
  ], [t])

  const handleModule = (mod: Module) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    router.push(mod.route as any)
  }

  return (
    <SafeAreaView style={s.root}>
      {/* ── Başlık ── */}
      <LinearGradient
        colors={t.gradients.antrenmanlar as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.header}
      >
        <Text style={s.headerTitle}>Antrenmanlar</Text>
        <Text style={s.headerSub}>Modül seç ve egzersize başla</Text>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <Text style={s.sectionLabel}>TÜM MODÜLLER</Text>

        {MODULES.map((mod) => (
          <TouchableOpacity
            key={mod.code}
            onPress={() => handleModule(mod)}
            activeOpacity={0.88}
            style={s.cardWrap}
          >
            <LinearGradient
              colors={mod.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.card}
            >
              {/* Sol: ikon */}
              <View style={s.iconBox}>
                <Text style={s.icon}>{mod.icon}</Text>
              </View>

              {/* Orta: isim + açıklama + süre */}
              <View style={s.info}>
                <Text style={s.label}>{mod.label}</Text>
                <Text style={s.subtitle} numberOfLines={1}>{mod.subtitle}</Text>
                <View style={s.durationRow}>
                  <Text style={s.durationBadge}>⏱ {mod.duration}</Text>
                </View>
              </View>

              {/* Sağ: başla */}
              <View style={s.startBtn}>
                <Text style={s.startTxt}>Başla</Text>
                <Text style={s.startArrow}>›</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

// ─── Stiller ─────────────────────────────────────────────────────
function ms(t: AppTheme) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: t.colors.background },

    header: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 20,
    },
    headerTitle: { fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
    headerSub:   { fontSize: 13, color: 'rgba(255,255,255,0.80)', marginTop: 4 },

    scroll: { padding: 16, paddingBottom: 40 },

    sectionLabel: {
      fontSize: 11, fontWeight: '700', letterSpacing: 1.5,
      color: t.colors.textHint, marginBottom: 14, marginTop: 4,
    },

    cardWrap: {
      marginBottom: 14,
      borderRadius: 20,
      ...t.shadows.md,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 20,
      padding: 16,
      gap: 14,
      overflow: 'hidden',
    },

    iconBox: {
      width: 56, height: 56,
      borderRadius: 16,
      backgroundColor: 'rgba(255,255,255,0.25)',
      alignItems: 'center', justifyContent: 'center',
    },
    icon: { fontSize: 28 },

    info: { flex: 1 },
    label: {
      fontSize: 16, fontWeight: '800', color: '#fff',
      letterSpacing: -0.3,
    },
    subtitle: {
      fontSize: 12, color: 'rgba(255,255,255,0.80)',
      marginTop: 3, lineHeight: 16,
    },
    durationRow:  { marginTop: 6 },
    durationBadge: {
      fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.90)',
      backgroundColor: 'rgba(255,255,255,0.20)',
      paddingHorizontal: 8, paddingVertical: 3,
      borderRadius: 999, alignSelf: 'flex-start',
    },

    startBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.25)',
      borderRadius: 12,
      paddingHorizontal: 12, paddingVertical: 8,
      gap: 2,
    },
    startTxt:   { fontSize: 13, fontWeight: '800', color: '#fff' },
    startArrow: { fontSize: 18, fontWeight: '400', color: '#fff', lineHeight: 22 },
  })
}
