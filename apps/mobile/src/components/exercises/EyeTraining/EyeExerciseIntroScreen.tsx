/**
 * EyeExerciseIntroScreen — Göz Egzersizi Giriş Ekranı
 * Beyaz / açık tema. Kategori rengiyle accent.
 * Seviye seçimi (1-4), ARP katkısı, bilgi kartları.
 */
import { SafeAreaView } from 'react-native-safe-area-context'
import React, { useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions,
   ScrollView, Platform,
} from 'react-native'
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, Easing,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import type { EyeExerciseConfig } from '@sprinta/shared'
import { CATEGORY_COLORS } from '@sprinta/shared'

const { height: SH } = Dimensions.get('window')
const sc = (v: number) => Math.round(v * Math.min(SH / 812, 1))

export type DifficultyLevel = 1 | 2 | 3 | 4

interface Props {
  config:   EyeExerciseConfig
  onStart:  (level: DifficultyLevel) => void
  onBack:   () => void
}

const LEVEL_META: Record<DifficultyLevel, { label: string; emoji: string }> = {
  1: { label: 'Başlangıç', emoji: '🌱' },
  2: { label: 'Orta',      emoji: '⚡' },
  3: { label: 'İleri',     emoji: '🔥' },
  4: { label: 'Uzman',     emoji: '🦅' },
}

const DURATION_BY_LEVEL: Record<DifficultyLevel, { min: number; max: number }> = {
  1: { min: 20, max: 30 },
  2: { min: 25, max: 35 },
  3: { min: 30, max: 45 },
  4: { min: 40, max: 55 },
}

// ─── Bilgi Kartı ─────────────────────────────────────────────────
function InfoCard({
  icon, title, desc, accent,
}: { icon: string; title: string; desc: string; accent: string }) {
  return (
    <View style={[s.infoCard, { borderTopColor: accent, borderTopWidth: 3 }]}>
      <Text style={s.infoIcon}>{icon}</Text>
      <Text style={[s.infoTitle, { color: accent }]}>{title}</Text>
      <Text style={s.infoDesc} numberOfLines={3}>{desc}</Text>
    </View>
  )
}

// ─── Seviye Kartı ─────────────────────────────────────────────────
function LevelCard({
  lvl, selected, onPress, accent,
}: { lvl: DifficultyLevel; selected: boolean; onPress: () => void; accent: string }) {
  const meta  = LEVEL_META[lvl]
  const scale = useSharedValue(1)
  const anim  = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  return (
    <Animated.View style={[{ flex: 1 }, anim]}>
      <TouchableOpacity
        style={[s.lvlCard, selected && { borderColor: accent, borderWidth: 2, backgroundColor: accent + '10' }]}
        onPress={onPress}
        onPressIn={() => { scale.value = withTiming(0.96, { duration: 120, easing: Easing.out(Easing.quad) }) }}
        onPressOut={() => { scale.value = withTiming(1.00, { duration: 120, easing: Easing.out(Easing.quad) }) }}
        activeOpacity={1}
      >
        <Text style={s.lvlEmoji}>{meta.emoji}</Text>
        <Text style={[s.lvlNum, selected && { color: accent }]}>{lvl}</Text>
        <Text style={[s.lvlLabel, selected && { color: accent }]}>{meta.label}</Text>
        {selected && <View style={[s.lvlDot, { backgroundColor: accent }]} />}
      </TouchableOpacity>
    </Animated.View>
  )
}

// ─── Ana bileşen ─────────────────────────────────────────────────
export default function EyeExerciseIntroScreen({ config, onStart, onBack }: Props) {
  const [selectedLevel, setSelectedLevel] = useState<DifficultyLevel>(config.difficulty as DifficultyLevel)
  const dur = DURATION_BY_LEVEL[selectedLevel]

  const catKey = config.isBoss ? 'boss' : config.category
  const accent = CATEGORY_COLORS[catKey] ?? '#1877F2'

  const catLabel = config.isBoss
    ? `${config.categoryIcon}  Boss Testi`
    : `${config.categoryIcon}  ${
        config.category === 'saccadic'   ? 'Göz Atlaması (Sakkadik)' :
        config.category === 'peripheral' ? 'Çevresel Görüş (Periferik)' :
        'Göz Takibi (Smooth Pursuit)'
      }`

  return (
    <SafeAreaView style={s.root}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Geri */}
        <TouchableOpacity style={s.backBtn} onPress={onBack}>
          <Text style={[s.backTxt, { color: accent }]}>← Geri</Text>
        </TouchableOpacity>

        {/* Hero kart */}
        <LinearGradient
          colors={[accent + '18', '#FFFFFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[s.heroCard, { borderColor: accent + '35', borderTopWidth: 4, borderTopColor: accent }]}
        >
          <Text style={[s.catLabel, { color: accent }]}>{catLabel}</Text>
          <Text style={s.heroTitle}>{config.title}</Text>
          <Text style={s.heroDesc}>{config.description}</Text>
        </LinearGradient>

        {/* 3 bilgi kartı */}
        <Text style={s.sectionTitle}>Egzersiz Detayları</Text>
        <View style={s.infoRow}>
          <InfoCard icon="💪" title="Göz Kasları"  desc={config.musclesTR}       accent={accent} />
          <InfoCard icon="📖" title="Okuma"         desc={config.readingBenefitTR} accent={accent} />
          <InfoCard icon="📝" title="Sınav"         desc={config.examBenefitTR}    accent={accent} />
        </View>

        {/* ARP katkısı */}
        <View style={[s.arpCard, { borderColor: accent + '20' }]}>
          <View style={s.arpHeader}>
            <Text style={s.arpIcon}>🧠</Text>
            <View>
              <Text style={s.arpHeading}>ARP Katkısı</Text>
              <Text style={s.arpSub}>Okuma Performans Skoru üzerindeki etki</Text>
            </View>
          </View>
          <View style={s.arpGrid}>
            <View style={s.arpItem}>
              <Text style={[s.arpVal, { color: accent }]}>
                {Math.round(config.arpEffect.regressionReduction * 100)}%
              </Text>
              <Text style={s.arpLbl}>Regresyon ↓</Text>
            </View>
            <View style={s.arpDiv} />
            <View style={s.arpItem}>
              <Text style={[s.arpVal, { color: accent }]}>
                {Math.round(config.arpEffect.errorRateReduction * 100)}%
              </Text>
              <Text style={s.arpLbl}>Hata ↓</Text>
            </View>
            <View style={s.arpDiv} />
            <View style={s.arpItem}>
              <Text style={[s.arpVal, { color: accent }]}>
                {Math.round(config.arpEffect.fatigueReduction * 100)}%
              </Text>
              <Text style={s.arpLbl}>Yorgunluk ↓</Text>
            </View>
          </View>
        </View>

        {/* Seviye seç */}
        <Text style={s.sectionTitle}>Seviye Seç</Text>
        <View style={s.levelGrid}>
          {([1, 2, 3, 4] as DifficultyLevel[]).map((lvl) => (
            <LevelCard
              key={lvl}
              lvl={lvl}
              selected={selectedLevel === lvl}
              onPress={() => setSelectedLevel(lvl)}
              accent={accent}
            />
          ))}
        </View>
      </ScrollView>

      {/* Başlat butonu */}
      <View style={s.bottomBar}>
        <TouchableOpacity
          style={[s.startBtn, { backgroundColor: accent }]}
          onPress={() => onStart(selectedLevel)}
          activeOpacity={0.85}
        >
          <Text style={s.startTxt}>Egzersizi Başlat</Text>
          <Text style={s.startSub}>⏱ {dur.min}–{dur.max} saniye</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root:          { flex: 1, backgroundColor: '#F5F9FF' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 24 },

  backBtn: { paddingTop: sc(12), paddingBottom: sc(8), alignSelf: 'flex-start' },
  backTxt: { fontSize: 15, fontWeight: '600' },

  heroCard: {
    borderRadius: 20, padding: sc(20), marginBottom: sc(20),
    borderWidth: 1, gap: sc(6),
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  catLabel:  { fontSize: 12, fontWeight: '700', letterSpacing: 0.3 },
  heroTitle: { fontSize: sc(24), fontWeight: '800', color: '#0F1F4B', lineHeight: sc(30) },
  heroDesc:  { fontSize: sc(14), color: '#4A5568', lineHeight: sc(20) },

  sectionTitle: {
    fontSize: 11, fontWeight: '700', color: '#8896AE',
    letterSpacing: 1.0, textTransform: 'uppercase', marginBottom: sc(10),
  },

  infoRow:  { flexDirection: 'row', gap: sc(8), marginBottom: sc(18) },
  infoCard: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16,
    padding: sc(12), borderWidth: 1, borderColor: '#E8EEF8',
    alignItems: 'center', gap: sc(4),
    shadowColor: '#243C8F', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  infoIcon:  { fontSize: sc(20) },
  infoTitle: { fontSize: sc(11), fontWeight: '700', textAlign: 'center' },
  infoDesc:  { fontSize: sc(10), color: '#6B7A99', textAlign: 'center', lineHeight: sc(14) },

  arpCard: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: sc(16),
    borderWidth: 1, marginBottom: sc(18), gap: sc(14),
    shadowColor: '#243C8F', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07, shadowRadius: 12, elevation: 4,
  },
  arpHeader:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  arpIcon:    { fontSize: sc(20) },
  arpHeading: { fontSize: sc(15), fontWeight: '700', color: '#0F1F4B' },
  arpSub:     { fontSize: sc(11), color: '#8896AE', marginTop: 1 },
  arpGrid:    { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  arpItem:    { alignItems: 'center', flex: 1 },
  arpVal:     { fontSize: sc(22), fontWeight: '800' },
  arpLbl:     { fontSize: sc(11), color: '#8896AE', marginTop: sc(3) },
  arpDiv:     { width: 1, height: 36, backgroundColor: '#E8EEF8' },

  levelGrid: { flexDirection: 'row', gap: sc(8) },
  lvlCard: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16,
    paddingVertical: sc(14), alignItems: 'center',
    borderWidth: 1.5, borderColor: '#E8EEF8', gap: sc(3),
    shadowColor: '#243C8F', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  lvlEmoji:  { fontSize: sc(18) },
  lvlNum:    { fontSize: sc(18), fontWeight: '800', color: '#8896AE' },
  lvlLabel:  { fontSize: sc(9), color: '#8896AE', fontWeight: '600', textAlign: 'center' },
  lvlDot:    { width: 6, height: 6, borderRadius: 3, marginTop: sc(2) },

  bottomBar: {
    paddingHorizontal: 20, paddingBottom: Platform.OS === 'ios' ? 24 : 16, paddingTop: 8,
    backgroundColor: '#F5F9FF',
    borderTopWidth: 1, borderTopColor: '#E8EEF8',
  },
  startBtn: {
    height: sc(60), borderRadius: 18,
    alignItems: 'center', justifyContent: 'center', gap: 3,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  startTxt: { fontSize: sc(17), fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.3 },
  startSub: { fontSize: sc(12), color: 'rgba(255,255,255,0.80)' },
})
