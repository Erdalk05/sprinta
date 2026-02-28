/**
 * VisualMechanicsHomeScreen — 15 göz egzersizinin ana ekranı
 *
 * Dahili navigasyon state machine:
 *   home → intro → exercise → result → home
 *
 * Expo-router gerektirmez — tüm geçişler içeride yönetilir.
 */

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useStarStore } from '../../../stores/starStore'
import { useAuthStore } from '../../../stores/authStore'
import type { GamificationState } from '@sprinta/api'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ListRenderItemInfo,
} from 'react-native'
import { useAppTheme } from '../../../theme/useAppTheme'
import {
  EXERCISE_CONFIGS,
  EXERCISE_ID_LIST,
} from '../constants/exerciseConfig'
import type {
  ExerciseId,
  DifficultyLevel,
  VisualExerciseConfig,
} from '../constants/exerciseConfig'
import { ExerciseIntroScreen } from '../components/ExerciseIntroScreen'
import { ExerciseResultScreen } from '../components/ExerciseResultScreen'
import FlashJumpMatrix         from '../components/exercises/FlashJumpMatrix'
import VerticalPulseTrack     from '../components/exercises/VerticalPulseTrack'
import DiagonalLaserDash      from '../components/exercises/DiagonalLaserDash'
import PeripheralFlashHunter  from '../components/exercises/PeripheralFlashHunter'
import ExpandingRingsFocus    from '../components/exercises/ExpandingRingsFocus'
import SpeedDotStorm          from '../components/exercises/SpeedDotStorm'
import OppositePull           from '../components/exercises/OppositePull'
import RandomBlinkTrap        from '../components/exercises/RandomBlinkTrap'
import CircularOrbitChase     from '../components/exercises/CircularOrbitChase'
import ShrinkZoomFocus        from '../components/exercises/ShrinkZoomFocus'
import DoubleTargetSwitch     from '../components/exercises/DoubleTargetSwitch'
import LineScanSprint         from '../components/exercises/LineScanSprint'
import SplitScreenMirror      from '../components/exercises/SplitScreenMirror'
import MicroPauseReact        from '../components/exercises/MicroPauseReact'
import TunnelVisionBreaker    from '../components/exercises/TunnelVisionBreaker'
import { calculateScore } from '../engines/scoringEngine'
import type { RawMetrics, ExerciseScore } from '../engines/scoringEngine'
import { useVisualMechanicsStore } from '../store/visualMechanicsStore'

// ─── Sabitler ────────────────────────────────────────────────────────────────
const NEON_CYAN = '#00F5FF'
const DARK_BG = '#0A0F1F'
const DARK_SURFACE = '#0E1628'

/** Kart aksan renkleri — 15 egzersiz için döngüsel */
const CARD_ACCENTS = [
  '#00F5FF', '#00FF94', '#6C3EE8', '#F59E0B', '#EF4444',
  '#3B82F6', '#8B5CF6', '#10B981', '#F97316', '#06B6D4',
  '#84CC16', '#EC4899', '#14B8A6', '#A855F7', '#F43F5E',
]

// ─── Screen state machine ────────────────────────────────────────────────────
type ScreenState =
  | { mode: 'home' }
  | { mode: 'intro'; exerciseId: ExerciseId }
  | { mode: 'exercise'; exerciseId: ExerciseId; level: DifficultyLevel }
  | { mode: 'result'; exerciseId: ExerciseId; level: DifficultyLevel; score: ExerciseScore }

// ─── ExerciseCard ────────────────────────────────────────────────────────────
interface ExerciseCardProps {
  config: VisualExerciseConfig
  index: number
  onPress: (id: ExerciseId) => void
  lastScore: ExerciseScore | undefined
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  config,
  index,
  onPress,
  lastScore,
}) => {
  const accent = CARD_ACCENTS[index % CARD_ACCENTS.length]
  return (
    <TouchableOpacity
      style={[styles.card, { borderColor: accent + '30' }]}
      onPress={() => onPress(config.id)}
      activeOpacity={0.8}
    >
      <View style={[styles.cardNum, { backgroundColor: accent + '18' }]}>
        <Text style={[styles.cardNumText, { color: accent }]}>{index + 1}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{config.titleTR}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>
          {config.descriptionTR}
        </Text>
        {lastScore !== undefined && (
          <Text style={[styles.cardGrade, { color: accent }]}>
            Son: {lastScore.grade}  •  {lastScore.xpEarned} XP
          </Text>
        )}
      </View>
      <Text style={styles.cardChevron}>›</Text>
    </TouchableOpacity>
  )
}

// ─── VisualMechanicsHomeScreen ────────────────────────────────────────────────
interface VisualMechanicsHomeScreenProps {
  /** Üst navigator (expo-router) 'geri' butonu için */
  onBack?: () => void
}

export const VisualMechanicsHomeScreen: React.FC<VisualMechanicsHomeScreenProps> = ({
  onBack,
}) => {
  const t = useAppTheme()
  const [screen, setScreen] = useState<ScreenState>({ mode: 'home' })
  const [lastGamState, setLastGamState] = useState<GamificationState | null>(null)

  const studentId    = useAuthStore((s) => s.student?.id ?? null)
  const recordExercise = useStarStore((s) => s.recordExercise)

  // Dışarıdan (TrainingBottomSheet) doğrudan girildiyse geri tuşu home'u
  // göstermeden router.back() çağırır
  const directEntry = useRef(false)

  const totalXp = useVisualMechanicsStore((s) => s.getTotalXpFromVisualMechanics())
  const { completeExercise, startExercise, exitExercise, completedExercises,
          pendingExerciseId, setPendingExerciseId } = useVisualMechanicsStore()

  // Sessions tab'dan doğrudan egzersiz açma
  useEffect(() => {
    if (pendingExerciseId) {
      directEntry.current = true
      setPendingExerciseId(null)
      setScreen({ mode: 'intro', exerciseId: pendingExerciseId })
    }
  }, [pendingExerciseId, setPendingExerciseId])

  /** Egzersiz ID'sine göre son skoru bul */
  const lastScoreMap = useMemo(() => {
    const map: Partial<Record<ExerciseId, ExerciseScore>> = {}
    for (const r of completedExercises) {
      // Hata oranı → ExerciseScore benzeri nesne oluştur
      map[r.exerciseId] = {
        focusStabilityScore: r.focusStabilityScore,
        reactionTimeMs: r.reactionTimeMs,
        errorRate: r.errorRate,
        baseScore: r.focusStabilityScore, // proxy
        xpEarned: r.xpEarned,
        csfContribution: 1 - r.errorRate,
        grade:
          r.focusStabilityScore >= 90
            ? 'S'
            : r.focusStabilityScore >= 75
              ? 'A'
              : r.focusStabilityScore >= 60
                ? 'B'
                : r.focusStabilityScore >= 40
                  ? 'C'
                  : 'D',
      }
    }
    return map
  }, [completedExercises])

  // ── Kart seçimi ──────────────────────────────────────────────────────────
  const handleCardPress = useCallback((id: ExerciseId) => {
    setScreen({ mode: 'intro', exerciseId: id })
  }, [])

  // ── Intro → Egzersiz başlat ──────────────────────────────────────────────
  const handleStart = useCallback(
    (level: DifficultyLevel) => {
      if (screen.mode !== 'intro') return
      const { exerciseId } = screen
      startExercise(exerciseId)
      setScreen({ mode: 'exercise', exerciseId, level })
    },
    [screen, startExercise],
  )

  // ── Egzersiz tamamlandı ──────────────────────────────────────────────────
  const handleExerciseComplete = useCallback(
    (metrics: RawMetrics) => {
      if (screen.mode !== 'exercise') return
      const { exerciseId, level } = screen
      const score = calculateScore(metrics, level)
      const config = EXERCISE_CONFIGS[exerciseId]

      completeExercise({
        exerciseId,
        completedAt: new Date().toISOString(),
        level,
        focusStabilityScore: score.focusStabilityScore,
        reactionTimeMs: score.reactionTimeMs,
        errorRate: score.errorRate,
        xpEarned: score.xpEarned,
        arpContribution: config.arpEffect,
      })

      // ── Gamification: yıldız kaydet ──
      if (studentId) {
        recordExercise(studentId, exerciseId, score.focusStabilityScore)
          .then((gamState) => setLastGamState(gamState))
          .catch(() => {/* sessiz hata — gamification kritik değil */})
      }

      setScreen({ mode: 'result', exerciseId, level, score })
    },
    [screen, completeExercise, studentId, recordExercise],
  )

  // ── Çıkış / Geri ─────────────────────────────────────────────────────────
  const handleExit = useCallback(() => {
    exitExercise()
    if (directEntry.current) {
      // Dışarıdan (TrainingBottomSheet) gelindi → önceki ekrana dön
      onBack?.()
    } else {
      setScreen({ mode: 'home' })
    }
  }, [exitExercise, onBack])

  const handleRetry = useCallback(() => {
    if (screen.mode !== 'result') return
    const { exerciseId, level } = screen
    startExercise(exerciseId)
    setScreen({ mode: 'exercise', exerciseId, level })
  }, [screen, startExercise])

  // ── Render: Egzersiz ─────────────────────────────────────────────────────
  if (screen.mode === 'exercise') {
    const { exerciseId, level } = screen
    const exProps = { level, onComplete: handleExerciseComplete, onExit: handleExit }

    const ExerciseComponent: React.ReactNode = (() => {
      switch (exerciseId) {
        case 'flash_jump_matrix':      return <FlashJumpMatrix        {...exProps} />
        case 'vertical_pulse_track':   return <VerticalPulseTrack     {...exProps} />
        case 'diagonal_laser_dash':    return <DiagonalLaserDash      {...exProps} />
        case 'peripheral_flash_hunter':return <PeripheralFlashHunter  {...exProps} />
        case 'expanding_rings_focus':  return <ExpandingRingsFocus    {...exProps} />
        case 'speed_dot_storm':        return <SpeedDotStorm          {...exProps} />
        case 'opposite_pull':          return <OppositePull           {...exProps} />
        case 'random_blink_trap':      return <RandomBlinkTrap        {...exProps} />
        case 'circular_orbit_chase':   return <CircularOrbitChase     {...exProps} />
        case 'shrink_zoom_focus':      return <ShrinkZoomFocus        {...exProps} />
        case 'double_target_switch':   return <DoubleTargetSwitch     {...exProps} />
        case 'line_scan_sprint':       return <LineScanSprint         {...exProps} />
        case 'split_screen_mirror':    return <SplitScreenMirror      {...exProps} />
        case 'micro_pause_react':      return <MicroPauseReact        {...exProps} />
        case 'tunnel_vision_breaker':  return <TunnelVisionBreaker    {...exProps} />
        default:                       return null
      }
    })()

    return (
      <SafeAreaView style={styles.fill}>
        {ExerciseComponent}
      </SafeAreaView>
    )
  }

  // ── Render: Intro ─────────────────────────────────────────────────────────
  if (screen.mode === 'intro') {
    return (
      <SafeAreaView style={styles.fill}>
        <ExerciseIntroScreen
          config={EXERCISE_CONFIGS[screen.exerciseId]}
          onStart={handleStart}
          onBack={handleExit}
        />
      </SafeAreaView>
    )
  }

  // ── Render: Sonuç ─────────────────────────────────────────────────────────
  if (screen.mode === 'result') {
    return (
      <SafeAreaView style={styles.fill}>
        <ExerciseResultScreen
          score={screen.score}
          config={EXERCISE_CONFIGS[screen.exerciseId]}
          level={screen.level}
          onRetry={handleRetry}
          onExit={handleExit}
          gamState={lastGamState}
        />
      </SafeAreaView>
    )
  }

  // ── Render: Home ──────────────────────────────────────────────────────────
  const renderItem = ({ item, index }: ListRenderItemInfo<ExerciseId>) => (
    <ExerciseCard
      config={EXERCISE_CONFIGS[item]}
      index={index}
      onPress={handleCardPress}
      lastScore={lastScoreMap[item]}
    />
  )

  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: DARK_BG }]}>
      {/* Header */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={[styles.backText, { color: t.colors.textHint }]}>← Geri</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>Kartal Gözü</Text>
        <Text style={[styles.headerSub, { color: t.colors.textHint }]}>
          Okuma hızın için gözlerini güçlendir
        </Text>

        {/* Toplam XP */}
        <View style={styles.totalXpRow}>
          <Text style={styles.totalXpValue}>{totalXp} XP</Text>
          <Text style={[styles.totalXpLabel, { color: t.colors.textHint }]}>
            toplam kazanıldı
          </Text>
        </View>
      </View>

      {/* Egzersiz listesi */}
      <FlatList
        data={EXERCISE_ID_LIST}
        keyExtractor={(item) => item}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  fill: { flex: 1 },

  // Header
  header: {
    backgroundColor: DARK_BG,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,245,255,0.08)',
  },
  backBtn: {
    marginBottom: 8,
  },
  backText: {
    fontSize: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: NEON_CYAN,
    marginBottom: 4,
  },
  headerSub: {
    fontSize: 14,
    marginBottom: 12,
  },
  totalXpRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  totalXpValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#00FF94',
  },
  totalXpLabel: {
    fontSize: 13,
  },

  // Liste
  list: {
    padding: 16,
    paddingBottom: 32,
  },

  // Kart
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DARK_SURFACE,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 12,
  },
  cardNum: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardNumText: {
    fontSize: 16,
    fontWeight: '800',
  },
  cardBody: {
    flex: 1,
    gap: 3,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#E9EDEF',
  },
  cardDesc: {
    fontSize: 12,
    color: '#8696A0',
    lineHeight: 17,
  },
  cardGrade: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  cardChevron: {
    fontSize: 22,
    color: '#8696A0',
    flexShrink: 0,
  },
})
