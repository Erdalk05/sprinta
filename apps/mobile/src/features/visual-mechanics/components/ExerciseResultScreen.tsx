/**
 * ExerciseResultScreen — Egzersiz tamamlandıktan sonra gösterilen skor ekranı
 */

import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native'
import { useAppTheme } from '../../../theme/useAppTheme'
import type { ExerciseScore } from '../engines/scoringEngine'
import type { VisualExerciseConfig, DifficultyLevel } from '../constants/exerciseConfig'

const NEON_CYAN = '#00F5FF'
const NEON_GREEN = '#00FF94'
const DARK_BG = '#0A0F1F'
const DARK_SURFACE = '#0E1628'
const DARK_BORDER = 'rgba(0,245,255,0.15)'

const GRADE_COLORS: Record<ExerciseScore['grade'], string> = {
  S: '#FFD700',
  A: NEON_CYAN,
  B: NEON_GREEN,
  C: '#F59E0B',
  D: '#EF4444',
}

const LEVEL_LABELS: Record<DifficultyLevel, string> = {
  1: 'Başlangıç',
  2: 'Orta',
  3: 'İleri',
  4: 'Uzman',
}

interface ExerciseResultScreenProps {
  score: ExerciseScore
  config: VisualExerciseConfig
  level: DifficultyLevel
  onRetry: () => void
  onExit: () => void
}

// ─── ScoreCard ──────────────────────────────────────────────────────────────
interface ScoreCardProps {
  label: string
  value: string
  color: string
}

const ScoreCard: React.FC<ScoreCardProps> = ({ label, value, color }) => (
  <View style={styles.scoreCard}>
    <Text style={[styles.scoreValue, { color }]}>{value}</Text>
    <Text style={styles.scoreLabel}>{label}</Text>
  </View>
)

// ─── ExerciseResultScreen ───────────────────────────────────────────────────
export const ExerciseResultScreen: React.FC<ExerciseResultScreenProps> = ({
  score,
  config,
  level,
  onRetry,
  onExit,
}) => {
  const t = useAppTheme()
  const gradeColor = GRADE_COLORS[score.grade]
  const errorPct = Math.round(score.errorRate * 100)
  const errorColor = score.errorRate > 0.2 ? '#EF4444' : NEON_GREEN

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Derece dairesi */}
      <View
        style={[
          styles.gradeCircle,
          {
            borderColor: gradeColor,
            shadowColor: gradeColor,
          },
        ]}
      >
        <Text style={[styles.gradeText, { color: gradeColor }]}>{score.grade}</Text>
      </View>

      <Text style={styles.exerciseName}>{config.titleTR}</Text>
      <Text style={[styles.levelLabel, { color: t.colors.textHint }]}>
        Seviye {level} · {LEVEL_LABELS[level]}
      </Text>

      {/* Skor kartları */}
      <View style={styles.scoreGrid}>
        <ScoreCard
          label="Odak Stabilitesi"
          value={`${score.focusStabilityScore}%`}
          color={NEON_GREEN}
        />
        <ScoreCard
          label="Tepki Süresi"
          value={`${score.reactionTimeMs}ms`}
          color={NEON_CYAN}
        />
        <ScoreCard
          label="Hata Oranı"
          value={`${errorPct}%`}
          color={errorColor}
        />
        <ScoreCard
          label="Base Skor"
          value={String(Math.round(score.baseScore))}
          color={gradeColor}
        />
      </View>

      {/* XP banner */}
      <View style={styles.xpBanner}>
        <Text style={styles.xpLabel}>Kazanılan XP</Text>
        <Text style={styles.xpValue}>+{score.xpEarned} ⚡</Text>
      </View>

      {/* ARP katkısı */}
      <View style={styles.arpCard}>
        <Text style={styles.arpTitle}>📈 ARP Katkısı</Text>
        <Text style={[styles.arpDesc, { color: t.colors.textHint }]}>
          {config.readingBenefitTR}
        </Text>
      </View>

      {/* Butonlar */}
      <TouchableOpacity style={styles.retryBtn} onPress={onRetry} activeOpacity={0.85}>
        <Text style={styles.retryBtnText}>Tekrar Dene</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.exitBtn} onPress={onExit}>
        <Text style={[styles.exitBtnText, { color: t.colors.textHint }]}>
          Ana Menüye Dön
        </Text>
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
    padding: 24,
    alignItems: 'center',
    paddingBottom: 48,
  },
  gradeCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 12,
  },
  gradeText: {
    fontSize: 56,
    fontWeight: '800',
  },
  exerciseName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#E9EDEF',
    marginBottom: 4,
    textAlign: 'center',
  },
  levelLabel: {
    fontSize: 14,
    marginBottom: 28,
  },
  scoreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    width: '100%',
    marginBottom: 20,
    justifyContent: 'center',
  },
  scoreCard: {
    width: '47%',
    backgroundColor: DARK_SURFACE,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DARK_BORDER,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 6,
  },
  scoreLabel: {
    fontSize: 12,
    color: '#8696A0',
    textAlign: 'center',
  },
  xpBanner: {
    width: '100%',
    backgroundColor: 'rgba(0,255,148,0.1)',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,255,148,0.25)',
    marginBottom: 16,
  },
  xpLabel: {
    fontSize: 13,
    color: '#8696A0',
    marginBottom: 4,
  },
  xpValue: {
    fontSize: 32,
    fontWeight: '800',
    color: NEON_GREEN,
  },
  arpCard: {
    width: '100%',
    backgroundColor: DARK_SURFACE,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: DARK_BORDER,
    marginBottom: 28,
  },
  arpTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: NEON_CYAN,
    marginBottom: 8,
  },
  arpDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  retryBtn: {
    width: '100%',
    backgroundColor: NEON_CYAN,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  retryBtnText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0A0F1F',
  },
  exitBtn: {
    width: '100%',
    paddingVertical: 14,
    alignItems: 'center',
  },
  exitBtnText: {
    fontSize: 15,
  },
})
