/**
 * ExerciseIntroScreen — Her egzersiz öncesi tanıtım ve level seçim ekranı
 */

import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native'
import { useAppTheme } from '../../../theme/useAppTheme'
import type { DifficultyLevel, VisualExerciseConfig } from '../constants/exerciseConfig'
import { DURATION_BY_LEVEL } from '../constants/exerciseConfig'
import { useVisualMechanicsStore } from '../store/visualMechanicsStore'

// ─── Sabit renkler (neon cyber teması — tema bağımsız) ─────────────────────
const NEON_CYAN = '#00F5FF'
const NEON_GREEN = '#00FF94'
const DARK_BG = '#0A0F1F'
const DARK_SURFACE = '#0E1628'
const DARK_BORDER = 'rgba(0,245,255,0.15)'

interface ExerciseIntroScreenProps {
  config: VisualExerciseConfig
  onStart: (level: DifficultyLevel) => void
  onBack: () => void
}

const LEVEL_LABELS: Record<DifficultyLevel, string> = {
  1: 'Başlangıç',
  2: 'Orta',
  3: 'İleri',
  4: 'Uzman',
}

// ─── InfoCard ───────────────────────────────────────────────────────────────
interface InfoCardProps {
  icon: string
  label: string
  value: string
}

const InfoCard: React.FC<InfoCardProps> = ({ icon, label, value }) => (
  <View style={styles.infoCard}>
    <Text style={styles.infoIcon}>{icon}</Text>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
)

// ─── ExerciseIntroScreen ────────────────────────────────────────────────────
export const ExerciseIntroScreen: React.FC<ExerciseIntroScreenProps> = ({
  config,
  onStart,
  onBack,
}) => {
  const t = useAppTheme()
  const lastLevel = useVisualMechanicsStore((s) => s.lastSelectedLevel)
  const setLastSelectedLevel = useVisualMechanicsStore((s) => s.setLastSelectedLevel)
  const [selectedLevel, setSelectedLevel] = useState<DifficultyLevel>(lastLevel)

  const dur = DURATION_BY_LEVEL[selectedLevel]

  const handleStart = () => {
    setLastSelectedLevel(selectedLevel)
    onStart(selectedLevel)
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Geri butonu */}
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backText}>← Geri</Text>
      </TouchableOpacity>

      {/* Başlık */}
      <Text style={styles.exerciseTitle}>{config.titleTR}</Text>
      <Text style={[styles.exerciseDesc, { color: t.colors.textHint }]}>
        {config.descriptionTR}
      </Text>

      {/* Bilgi kartları */}
      <View style={styles.infoGrid}>
        <InfoCard icon="💪" label="Göz Kasları" value={config.targetMusclesTR} />
        <InfoCard icon="📖" label="Okuma Katkısı" value={config.readingBenefitTR} />
        <InfoCard icon="📝" label="Sınav Katkısı" value={config.examBenefitTR} />
      </View>

      {/* ARP Katkısı */}
      <View style={styles.arpCard}>
        <Text style={styles.arpTitle}>🧠 ARP Katkısı</Text>
        <View style={styles.arpRow}>
          <Text style={styles.arpLabel}>Regresyon Azalma</Text>
          <Text style={styles.arpValue}>
            {Math.round(config.arpEffect.regressionReduction * 100)}%
          </Text>
        </View>
        <View style={styles.arpRow}>
          <Text style={styles.arpLabel}>Hata Azalma</Text>
          <Text style={styles.arpValue}>
            {Math.round(config.arpEffect.errorRateReduction * 100)}%
          </Text>
        </View>
        <View style={styles.arpRow}>
          <Text style={styles.arpLabel}>Yorgunluk Azalma</Text>
          <Text style={styles.arpValue}>
            {Math.round(config.arpEffect.fatigueReduction * 100)}%
          </Text>
        </View>
      </View>

      {/* Level seçimi */}
      <Text style={styles.sectionLabel}>Seviye Seç</Text>
      <View style={styles.levelRow}>
        {([1, 2, 3, 4] as DifficultyLevel[]).map((lvl) => (
          <TouchableOpacity
            key={lvl}
            style={[styles.levelBtn, selectedLevel === lvl && styles.levelBtnActive]}
            onPress={() => setSelectedLevel(lvl)}
          >
            <Text
              style={[
                styles.levelNum,
                { color: selectedLevel === lvl ? '#0A0F1F' : NEON_CYAN },
              ]}
            >
              {lvl}
            </Text>
            <Text
              style={[
                styles.levelLbl,
                { color: selectedLevel === lvl ? '#0A0F1F' : '#8696A0' },
              ]}
            >
              {LEVEL_LABELS[lvl]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tahmini süre */}
      <Text style={styles.durationText}>
        ⏱ {dur.min}–{dur.max} saniye
      </Text>

      {/* Başlat butonu */}
      <TouchableOpacity style={styles.startBtn} onPress={handleStart} activeOpacity={0.85}>
        <Text style={styles.startBtnText}>Egzersizi Başlat</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: DARK_BG,
  },
  content: {
    padding: 20,
    paddingBottom: 48,
  },
  backBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    marginBottom: 16,
  },
  backText: {
    fontSize: 15,
    color: '#8696A0',
  },
  exerciseTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: NEON_CYAN,
    marginBottom: 8,
  },
  exerciseDesc: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  infoGrid: {
    gap: 12,
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: DARK_SURFACE,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: DARK_BORDER,
  },
  infoIcon: {
    fontSize: 20,
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 11,
    color: '#8696A0',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  infoValue: {
    fontSize: 14,
    color: '#E9EDEF',
    lineHeight: 20,
  },
  arpCard: {
    backgroundColor: DARK_SURFACE,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,255,148,0.15)',
    marginBottom: 24,
  },
  arpTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: NEON_GREEN,
    marginBottom: 12,
  },
  arpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  arpLabel: {
    fontSize: 13,
    color: '#8696A0',
  },
  arpValue: {
    fontSize: 13,
    fontWeight: '700',
    color: NEON_GREEN,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8696A0',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  levelRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  levelBtn: {
    flex: 1,
    backgroundColor: DARK_SURFACE,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DARK_BORDER,
  },
  levelBtnActive: {
    backgroundColor: NEON_CYAN,
    borderColor: NEON_CYAN,
  },
  levelNum: {
    fontSize: 20,
    fontWeight: '800',
  },
  levelLbl: {
    fontSize: 10,
    marginTop: 4,
  },
  durationText: {
    fontSize: 14,
    color: '#8696A0',
    textAlign: 'center',
    marginBottom: 28,
  },
  startBtn: {
    backgroundColor: NEON_CYAN,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  startBtnText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0A0F1F',
    letterSpacing: 0.5,
  },
})
