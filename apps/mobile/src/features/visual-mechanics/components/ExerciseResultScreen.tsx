/**
 * ExerciseResultScreen — Tek ekran, scroll yok, GamificationStatusCard entegre
 */

import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native'
import { useAppTheme } from '../../../theme/useAppTheme'
import type { ExerciseScore } from '../engines/scoringEngine'
import type { VisualExerciseConfig, DifficultyLevel } from '../constants/exerciseConfig'
import type { GamificationState } from '@sprinta/api'

const { width: W } = Dimensions.get('window')

const NEON_CYAN  = '#00F5FF'
const NEON_GREEN = '#00FF94'
const GOLD       = '#FFD700'
const ORANGE     = '#F97316'
const DARK_BG    = '#0A0F1F'
const DARK_CARD  = '#0E1628'
const BORDER     = 'rgba(0,245,255,0.12)'

const GRADE_COLORS: Record<ExerciseScore['grade'], string> = {
  S: GOLD,
  A: NEON_CYAN,
  B: NEON_GREEN,
  C: '#F59E0B',
  D: '#EF4444',
}

const GRADE_BG: Record<ExerciseScore['grade'], string> = {
  S: 'rgba(255,215,0,0.12)',
  A: 'rgba(0,245,255,0.12)',
  B: 'rgba(0,255,148,0.12)',
  C: 'rgba(245,158,11,0.12)',
  D: 'rgba(239,68,68,0.12)',
}

const LEVEL_LABELS: Record<DifficultyLevel, string> = {
  1: 'Başlangıç',
  2: 'Orta',
  3: 'İleri',
  4: 'Uzman',
}

const MILESTONES = [
  { stars: 20,  label: 'Başlangıç', badge: '🦅' },
  { stars: 50,  label: 'Usta',      badge: '🏆' },
  { stars: 100, label: 'Efsane',    badge: '💎' },
]

interface ExerciseResultScreenProps {
  score:     ExerciseScore
  config:    VisualExerciseConfig
  level:     DifficultyLevel
  onRetry:   () => void
  onExit:    () => void
  gamState?: GamificationState | null
}

// ─── Mini stat kutusu ────────────────────────────────────────────────────────
const StatBox = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <View style={s.statBox}>
    <Text style={[s.statVal, { color }]}>{value}</Text>
    <Text style={s.statLbl}>{label}</Text>
  </View>
)

// ─── ExerciseResultScreen ────────────────────────────────────────────────────
export const ExerciseResultScreen: React.FC<ExerciseResultScreenProps> = ({
  score,
  config,
  level,
  onRetry,
  onExit,
  gamState,
}) => {
  const t         = useAppTheme()
  const gradeColor = GRADE_COLORS[score.grade]
  const gradeBg    = GRADE_BG[score.grade]
  const errorPct   = Math.round(score.errorRate * 100)
  const errorColor = score.errorRate > 0.25 ? '#EF4444' : NEON_GREEN
  const totalStars = gamState?.stats.totalStars ?? 0

  return (
    <View style={s.root}>

      {/* ── HEADER: Grade + İsim ─────────────────────────────────────── */}
      <View style={[s.header, { backgroundColor: gradeBg, borderColor: gradeColor + '30' }]}>
        {/* Grade dairesi */}
        <View style={[s.gradeCircle, { borderColor: gradeColor, shadowColor: gradeColor }]}>
          <Text style={[s.gradeText, { color: gradeColor }]}>{score.grade}</Text>
        </View>

        {/* Egzersiz bilgisi */}
        <View style={s.headerInfo}>
          <Text style={s.exerciseName} numberOfLines={2}>{config.titleTR}</Text>
          <Text style={[s.levelBadge, { color: t.colors.textHint }]}>
            Seviye {level} · {LEVEL_LABELS[level]}
          </Text>
          {/* Yeni yıldızlar */}
          {gamState && gamState.newStars > 0 && (
            <View style={s.newStarRow}>
              {Array.from({ length: 3 }).map((_, i) => (
                <Text key={i} style={s.starIcon}>
                  {i < gamState.newStars ? '⭐' : '☆'}
                </Text>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* ── 4 STAT SATIRI ────────────────────────────────────────────── */}
      <View style={s.statsRow}>
        <StatBox label="Odak"   value={`${score.focusStabilityScore}%`} color={NEON_GREEN} />
        <View style={s.statDivider} />
        <StatBox label="Tepki"  value={`${score.reactionTimeMs}ms`}     color={NEON_CYAN}  />
        <View style={s.statDivider} />
        <StatBox label="Hata"   value={`${errorPct}%`}                  color={errorColor} />
        <View style={s.statDivider} />
        <StatBox label="Skor"   value={String(Math.round(score.baseScore))} color={gradeColor} />
      </View>

      {/* ── XP + GAMİFİKASYON SATIRI ─────────────────────────────────── */}
      <View style={s.gamRow}>
        {/* XP */}
        <View style={[s.gamBox, s.xpBox]}>
          <Text style={s.xpVal}>+{score.xpEarned}</Text>
          <Text style={s.xpLbl}>XP ⚡</Text>
        </View>
        <View style={s.gamDivider} />
        {/* Bugün */}
        <View style={s.gamBox}>
          <Text style={s.gamBigVal}>{gamState?.daily.starsToday ?? 0}/3</Text>
          <Text style={s.gamLbl}>BUGÜN {'⭐'.repeat(Math.min(gamState?.daily.starsToday ?? 0, 3))}</Text>
        </View>
        <View style={s.gamDivider} />
        {/* Seri */}
        <View style={s.gamBox}>
          <Text style={[s.gamBigVal, { color: ORANGE }]}>{gamState?.streak.currentStreak ?? 0}</Text>
          <Text style={s.gamLbl}>SERİ 🔥</Text>
        </View>
        <View style={s.gamDivider} />
        {/* Toplam */}
        <View style={s.gamBox}>
          <Text style={[s.gamBigVal, { color: GOLD }]}>{totalStars}</Text>
          <Text style={s.gamLbl}>TOPLAM ⭐</Text>
        </View>
      </View>

      {/* ── MİLESTONE ROZETLERİ ──────────────────────────────────────── */}
      <View style={s.milestoneRow}>
        {MILESTONES.map((m) => {
          const unlocked = totalStars >= m.stars
          return (
            <View
              key={m.stars}
              style={[s.milestoneBadge, unlocked && s.milestoneBadgeUnlocked]}
            >
              <Text style={s.milestoneIcon}>{unlocked ? m.badge : '🔒'}</Text>
              <Text style={[s.milestoneLabel, unlocked && s.milestoneLabelUnlocked]}>
                {m.label}
              </Text>
              <Text style={[s.milestoneStars, unlocked && s.milestoneStarsUnlocked]}>
                {m.stars}⭐
              </Text>
            </View>
          )
        })}
      </View>

      {/* ── ARP KATKISI ──────────────────────────────────────────────── */}
      <View style={s.arpRow}>
        <Text style={s.arpIcon}>📈</Text>
        <Text style={[s.arpText, { color: t.colors.textHint }]} numberOfLines={2}>
          {config.readingBenefitTR}
        </Text>
      </View>

      {/* ── BUTONLAR ─────────────────────────────────────────────────── */}
      <TouchableOpacity style={s.retryBtn} onPress={onRetry} activeOpacity={0.85}>
        <Text style={s.retryBtnText}>↺  Tekrar Dene</Text>
      </TouchableOpacity>

      <TouchableOpacity style={s.exitBtn} onPress={onExit} activeOpacity={0.7}>
        <Text style={[s.exitBtnText, { color: t.colors.textHint }]}>Ana Menüye Dön</Text>
      </TouchableOpacity>

    </View>
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DARK_BG,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    justifyContent: 'space-between',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
  },
  gradeCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 14,
    elevation: 10,
  },
  gradeText: {
    fontSize: 38,
    fontWeight: '900',
  },
  headerInfo: {
    flex: 1,
    gap: 4,
  },
  exerciseName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#E9EDEF',
    lineHeight: 22,
  },
  levelBadge: {
    fontSize: 12,
  },
  newStarRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
  },
  starIcon: {
    fontSize: 16,
  },

  // 4-stat row
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DARK_CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 12,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  statVal: {
    fontSize: 18,
    fontWeight: '800',
  },
  statLbl: {
    fontSize: 10,
    color: '#8696A0',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: BORDER,
  },

  // Gamification row
  gamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DARK_CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 10,
  },
  gamBox: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  xpBox: {
    flex: 1.2,
  },
  xpVal: {
    fontSize: 22,
    fontWeight: '900',
    color: NEON_GREEN,
  },
  xpLbl: {
    fontSize: 10,
    color: '#8696A0',
  },
  gamBigVal: {
    fontSize: 20,
    fontWeight: '900',
    color: NEON_CYAN,
  },
  gamLbl: {
    fontSize: 9,
    color: '#8696A0',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  gamDivider: {
    width: 1,
    height: 28,
    backgroundColor: BORDER,
  },

  // Milestones
  milestoneRow: {
    flexDirection: 'row',
    gap: 8,
  },
  milestoneBadge: {
    flex: 1,
    backgroundColor: DARK_CARD,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: BORDER,
  },
  milestoneBadgeUnlocked: {
    borderColor: 'rgba(245,158,11,0.5)',
    backgroundColor: '#1A1205',
  },
  milestoneIcon: {
    fontSize: 22,
  },
  milestoneLabel: {
    fontSize: 11,
    color: '#8696A0',
    fontWeight: '600',
    textAlign: 'center',
  },
  milestoneLabelUnlocked: {
    color: '#F59E0B',
  },
  milestoneStars: {
    fontSize: 11,
    color: '#8696A0',
  },
  milestoneStarsUnlocked: {
    color: GOLD,
    fontWeight: '800',
  },

  // ARP
  arpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: DARK_CARD,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: BORDER,
  },
  arpIcon: { fontSize: 16, flexShrink: 0 },
  arpText: { flex: 1, fontSize: 12, lineHeight: 17 },

  // Buttons
  retryBtn: {
    backgroundColor: NEON_CYAN,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
  },
  retryBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0A0F1F',
  },
  exitBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  exitBtnText: {
    fontSize: 14,
  },
})
