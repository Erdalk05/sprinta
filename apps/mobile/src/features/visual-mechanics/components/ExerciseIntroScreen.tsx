/**
 * ExerciseIntroScreen — Sprinta Design System v1.0
 * BG #0F1F4B · Surface #162449 · Accent #38B6D8
 * Press animasyonu: scale 0.97 / 120ms
 */

// Sprinta DS v1.0 renkleri (yerel sabit — immersive dark ekran)
const ACCENT   = '#38B6D8'   // Sprinta accent cyan
const SURFACE  = '#162449'   // Dark card surface

import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  ScrollView,
  Platform,
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { S, R, T } from '../../../ui'
import type { DifficultyLevel, VisualExerciseConfig } from '../constants/exerciseConfig'
import { DURATION_BY_LEVEL } from '../constants/exerciseConfig'
import { useVisualMechanicsStore } from '../store/visualMechanicsStore'

const { height: SH } = Dimensions.get('window')
const sc = (v: number) => Math.round(v * Math.min(SH / 812, 1))

interface ExerciseIntroScreenProps {
  config: VisualExerciseConfig
  onStart: (level: DifficultyLevel) => void
  onBack:  () => void
}

const LEVEL_META: Record<DifficultyLevel, { label: string; emoji: string }> = {
  1: { label: 'Başlangıç', emoji: '🌱' },
  2: { label: 'Orta',      emoji: '⚡' },
  3: { label: 'İleri',     emoji: '🔥' },
  4: { label: 'Uzman',     emoji: '🦅' },
}

// ─── InfoCard ─────────────────────────────────────────────────────
function InfoCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <View style={s.infoCard}>
      <Text style={s.infoIcon}>{icon}</Text>
      <Text style={s.infoTitle}>{title}</Text>
      <Text style={s.infoDesc} numberOfLines={3}>{desc}</Text>
    </View>
  )
}

// ─── LevelCard ────────────────────────────────────────────────────
function LevelCard({ lvl, selected, onPress }: {
  lvl: DifficultyLevel; selected: boolean; onPress: () => void
}) {
  const meta  = LEVEL_META[lvl]
  const scale = useSharedValue(1)
  const anim  = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))
  return (
    <Animated.View style={[{ flex: 1 }, anim]}>
      <TouchableOpacity
        style={[s.lvlCard, selected && s.lvlCardActive]}
        onPress={onPress}
        onPressIn={() => { scale.value = withTiming(0.96, { duration: 120, easing: Easing.out(Easing.quad) }) }}
        onPressOut={() => { scale.value = withTiming(1.00, { duration: 120, easing: Easing.out(Easing.quad) }) }}
        activeOpacity={1}
      >
        <Text style={s.lvlEmoji}>{meta.emoji}</Text>
        <Text style={[s.lvlNum, selected && s.lvlNumActive]}>{lvl}</Text>
        <Text style={[s.lvlLabel, selected && s.lvlLabelActive]}>{meta.label}</Text>
        {selected && <View style={s.lvlDot} />}
      </TouchableOpacity>
    </Animated.View>
  )
}

// ─── Ana bileşen ──────────────────────────────────────────────────
export const ExerciseIntroScreen: React.FC<ExerciseIntroScreenProps> = ({
  config, onStart, onBack,
}) => {
  const lastLevel            = useVisualMechanicsStore((st) => st.lastSelectedLevel)
  const setLastSelectedLevel = useVisualMechanicsStore((st) => st.setLastSelectedLevel)
  const [selectedLevel, setSelectedLevel] = useState<DifficultyLevel>(lastLevel)
  const dur = DURATION_BY_LEVEL[selectedLevel]

  const handleStart = () => {
    setLastSelectedLevel(selectedLevel)
    onStart(selectedLevel)
  }

  return (
    <SafeAreaView style={s.root}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollIndicatorInsets={{ right: 8 }}
      >
        {/* Geri */}
        <TouchableOpacity style={s.backBtn} onPress={onBack}>
          <Text style={s.backTxt}>← Geri</Text>
        </TouchableOpacity>

        {/* Hero */}
        <LinearGradient
          colors={['rgba(56,182,216,0.12)', SURFACE]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.heroCard}
        >
          <Text style={s.catLabel}>
            {config.categoryIcon}  {config.categoryTR}
          </Text>
          <Text style={s.heroTitle}>{config.titleTR}</Text>
          <Text style={s.heroDesc}>{config.descriptionTR}</Text>
        </LinearGradient>

        {/* 3 bilgi kartı */}
        <Text style={s.sectionTitle}>Egzersiz Detayları</Text>
        <View style={s.infoRow}>
          <InfoCard icon="💪" title="Göz Kasları"   desc={config.targetMusclesTR} />
          <InfoCard icon="📖" title="Okuma"         desc={config.readingBenefitTR} />
          <InfoCard icon="📝" title="Sınav"         desc={config.examBenefitTR} />
        </View>

        {/* ARP */}
        <View style={s.arpCard}>
          <View style={s.arpHeader}>
            <Text style={s.arpIcon}>🧠</Text>
            <View>
              <Text style={s.arpHeading}>ARP Katkısı</Text>
              <Text style={s.arpSub}>Okuma Performans Skoru üzerindeki etki</Text>
            </View>
          </View>
          <View style={s.arpGrid}>
            <View style={s.arpItem}>
              <Text style={s.arpVal}>{Math.round(config.arpEffect.regressionReduction * 100)}%</Text>
              <Text style={s.arpLbl}>Regresyon ↓</Text>
            </View>
            <View style={s.arpDiv} />
            <View style={s.arpItem}>
              <Text style={s.arpVal}>{Math.round(config.arpEffect.errorRateReduction * 100)}%</Text>
              <Text style={s.arpLbl}>Hata ↓</Text>
            </View>
            <View style={s.arpDiv} />
            <View style={s.arpItem}>
              <Text style={s.arpVal}>{Math.round(config.arpEffect.fatigueReduction * 100)}%</Text>
              <Text style={s.arpLbl}>Yorgunluk ↓</Text>
            </View>
          </View>
        </View>

        {/* Seviye */}
        <Text style={s.sectionTitle}>Seviye Seç</Text>
        <View style={s.levelGrid}>
          {([1, 2, 3, 4] as DifficultyLevel[]).map((lvl) => (
            <LevelCard
              key={lvl}
              lvl={lvl}
              selected={selectedLevel === lvl}
              onPress={() => setSelectedLevel(lvl)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Başlat */}
      <View style={s.bottomBar}>
        <TouchableOpacity style={s.startWrap} onPress={handleStart} activeOpacity={0.85}>
          <LinearGradient
            colors={['#4DA3F5', ACCENT]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.startBtn}
          >
            <Text style={s.startTxt}>Egzersizi Başlat</Text>
            <Text style={s.startSub}>⏱ {dur.min}–{dur.max} saniye</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root:          { flex: 1, backgroundColor: '#0F1F4B' },
  scrollContent: { paddingHorizontal: S.xxl, paddingBottom: S.xxl },

  backBtn: { paddingTop: sc(12), paddingBottom: sc(8), alignSelf: 'flex-start' },
  backTxt: { ...T.body, color: ACCENT },

  heroCard: {
    borderRadius: R.xl, padding: S.xl, marginBottom: S.xxl, gap: sc(6),
    borderWidth: 1, borderColor: 'rgba(56,182,216,0.35)',
    shadowColor: ACCENT, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25, shadowRadius: 16, elevation: 8,
  },
  catLabel:  { fontSize: 12, fontWeight: '700', color: ACCENT, letterSpacing: 0.3 },
  heroTitle: { fontSize: sc(24), fontWeight: '700', color: '#FFFFFF', lineHeight: sc(30) },
  heroDesc:  { fontSize: sc(14), color: 'rgba(255,255,255,0.80)', lineHeight: sc(20) },

  sectionTitle: {
    fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.40)',
    letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: S.md,
  },

  infoRow:  { flexDirection: 'row', gap: sc(10), marginBottom: S.xxl },
  infoCard: {
    flex: 1, backgroundColor: '#162449', borderRadius: R.lg,
    padding: sc(12), borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center', gap: sc(4),
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18, shadowRadius: 8, elevation: 4,
  },
  infoIcon:  { fontSize: sc(20) },
  infoTitle: { fontSize: sc(11), fontWeight: '600', color: '#FFFFFF', textAlign: 'center' },
  infoDesc:  { fontSize: sc(10), color: 'rgba(255,255,255,0.55)', textAlign: 'center', lineHeight: sc(14) },

  arpCard: {
    backgroundColor: '#162449', borderRadius: R.xl, padding: sc(16),
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)', marginBottom: S.xxl, gap: sc(14),
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22, shadowRadius: 12, elevation: 6,
  },
  arpHeader:  { flexDirection: 'row', alignItems: 'center', gap: S.md },
  arpIcon:    { fontSize: sc(20) },
  arpHeading: { fontSize: sc(15), fontWeight: '700', color: '#FFFFFF' },
  arpSub:     { fontSize: sc(11), color: 'rgba(255,255,255,0.55)', marginTop: 1 },
  arpGrid:    { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  arpItem:    { alignItems: 'center', flex: 1 },
  arpVal:     { fontSize: sc(22), fontWeight: '700', color: '#38B6D8' },
  arpLbl:     { fontSize: sc(11), color: 'rgba(255,255,255,0.55)', marginTop: sc(3) },
  arpDiv:     { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.10)' },

  levelGrid: { flexDirection: 'row', gap: sc(10) },
  lvlCard: {
    flex: 1, backgroundColor: '#162449', borderRadius: R.lg,
    paddingVertical: sc(14), alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)', gap: sc(3),
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18, shadowRadius: 8, elevation: 4,
  },
  lvlCardActive:  { backgroundColor: '#1877F220', borderColor: ACCENT, borderWidth: 1.5 },
  lvlEmoji:       { fontSize: sc(18) },
  lvlNum:         { fontSize: sc(18), fontWeight: '700', color: 'rgba(255,255,255,0.50)' },
  lvlNumActive:   { color: '#FFFFFF' },
  lvlLabel:       { fontSize: sc(9), color: 'rgba(255,255,255,0.40)', fontWeight: '600', textAlign: 'center' },
  lvlLabelActive: { color: ACCENT },
  lvlDot:         { width: 6, height: 6, borderRadius: 3, backgroundColor: ACCENT, marginTop: sc(2) },

  bottomBar: {
    paddingHorizontal: S.xxl, paddingBottom: sc(16), paddingTop: sc(8),
    backgroundColor: '#0F1F4B', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)',
  },
  startWrap: { borderRadius: R.xl, overflow: 'hidden' },
  startBtn:  {
    height: sc(60), borderRadius: R.xl,
    alignItems: 'center', justifyContent: 'center', gap: 3,
  },
  startTxt: { fontSize: sc(17), fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.3 },
  startSub: { fontSize: sc(12), color: 'rgba(255,255,255,0.72)' },
})
