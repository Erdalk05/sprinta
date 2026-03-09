/**
 * VisualMechanicsHomeScreen — Duolingo + Apple Fitness quality
 * BG #0F1F4B · Primary #243C8F · Accent #38B6D8
 * Daily AI Training hero + 3-column exercise grid
 */

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useStarStore }  from '../../../stores/starStore'
import { useAuthStore }  from '../../../stores/authStore'
import type { GamificationState } from '@sprinta/api'
import { createEyeTrainingService } from '@sprinta/api'
import type { EyeMetrics } from '@sprinta/shared'
import { supabase } from '../../../lib/supabase'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  ListRenderItemInfo,
  ScrollView,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { S, R } from '../../../ui'
import {
  EXERCISE_CONFIGS,
  EXERCISE_ID_LIST,
} from '../constants/exerciseConfig'
import type {
  ExerciseId,
  DifficultyLevel,
  VisualExerciseConfig,
} from '../constants/exerciseConfig'
import { ExerciseIntroScreen }    from '../components/ExerciseIntroScreen'
import { ExerciseResultScreen }   from '../components/ExerciseResultScreen'
import FlashJumpMatrix            from '../components/exercises/FlashJumpMatrix'
import VerticalPulseTrack         from '../components/exercises/VerticalPulseTrack'
import DiagonalLaserDash          from '../components/exercises/DiagonalLaserDash'
import PeripheralFlashHunter      from '../components/exercises/PeripheralFlashHunter'
import ExpandingRingsFocus        from '../components/exercises/ExpandingRingsFocus'
import SpeedDotStorm              from '../components/exercises/SpeedDotStorm'
import OppositePull               from '../components/exercises/OppositePull'
import RandomBlinkTrap            from '../components/exercises/RandomBlinkTrap'
import CircularOrbitChase         from '../components/exercises/CircularOrbitChase'
import ShrinkZoomFocus            from '../components/exercises/ShrinkZoomFocus'
import DoubleTargetSwitch         from '../components/exercises/DoubleTargetSwitch'
import LineScanSprint             from '../components/exercises/LineScanSprint'
import SplitScreenMirror          from '../components/exercises/SplitScreenMirror'
import MicroPauseReact            from '../components/exercises/MicroPauseReact'
import TunnelVisionBreaker        from '../components/exercises/TunnelVisionBreaker'
import YagmurHedef               from '../components/exercises/YagmurHedef'
import RenkHafiza                from '../components/exercises/RenkHafiza'
import { calculateScore }         from '../engines/scoringEngine'
import type { RawMetrics, ExerciseScore } from '../engines/scoringEngine'
import { useVisualMechanicsStore } from '../store/visualMechanicsStore'

// ── Eye Training servisi (VM skorları aynı tabloya kaydedilir) ──
const eyeService = createEyeTrainingService(supabase)

// ── Renk paleti ─────────────────────────────────────────────────
const BG        = '#0F1F4B'
const SURFACE   = '#162449'
const SURFACE2  = '#1E2E5C'
const PRIMARY   = '#243C8F'
const ACCENT    = '#38B6D8'
const W100      = '#FFFFFF'
const W80       = 'rgba(255,255,255,0.80)'
const W50       = 'rgba(255,255,255,0.50)'
const W20       = 'rgba(255,255,255,0.20)'
const W10       = 'rgba(255,255,255,0.10)'
const GOLD      = '#FFD700'
const SUCCESS   = '#34D399'

// XP ödülü: zorluk seviyesine göre
const BASE_XP: Record<1|2|3|4, number> = { 1: 20, 2: 30, 3: 40, 4: 50 }

const LEVEL_LABEL: Record<1|2|3|4, string> = {
  1: 'Kolay', 2: 'Orta', 3: 'İleri', 4: 'Uzman',
}

const { width: SW } = Dimensions.get('window')
const GRID_PAD  = 16
const GRID_GAP  = 10
const CARD_W    = (SW - GRID_PAD * 2 - GRID_GAP) / 2

// ── Tip ─────────────────────────────────────────────────────────
type ScreenState =
  | { mode: 'home' }
  | { mode: 'intro';    exerciseId: ExerciseId }
  | { mode: 'exercise'; exerciseId: ExerciseId; level: DifficultyLevel }
  | { mode: 'result';   exerciseId: ExerciseId; level: DifficultyLevel; score: ExerciseScore }

// ── Daily AI Training kartı ─────────────────────────────────────
function DailyTrainingCard({
  exerciseId,
  completedCount,
  onPress,
}: {
  exerciseId: ExerciseId
  completedCount: number
  onPress: (id: ExerciseId) => void
}) {
  const cfg = EXERCISE_CONFIGS[exerciseId]
  return (
    <TouchableOpacity
      style={st.dailyWrap}
      onPress={() => onPress(exerciseId)}
      activeOpacity={0.88}
    >
      <LinearGradient
        colors={['#1A3080', '#243C8F', '#38B6D8']}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={st.dailyCard}
      >
        {/* Dekoratif daireler */}
        <View style={st.decCircle1} />
        <View style={st.decCircle2} />

        {/* Üst satır */}
        <View style={st.dailyTop}>
          <View style={st.dailyBadge}>
            <Text style={st.dailyBadgeTxt}>🤖  GÜNLÜK ANTRENMAN</Text>
          </View>
          <View style={st.streakPill}>
            <Text style={st.streakTxt}>🔥 {completedCount}</Text>
          </View>
        </View>

        {/* İçerik */}
        <Text style={st.dailyTitle} numberOfLines={2}>{cfg.titleTR}</Text>
        <Text style={st.dailyDesc}  numberOfLines={2}>{cfg.descriptionTR}</Text>

        {/* Alt satır */}
        <View style={st.dailyBottom}>
          <View style={st.dailyMeta}>
            <View style={st.metaPill}>
              <Text style={st.metaTxt}>⏱ {cfg.baseDurationSec} sn</Text>
            </View>
            <View style={st.metaPill}>
              <Text style={st.metaTxt}>⚡ {BASE_XP[cfg.difficultyDots]} XP</Text>
            </View>
          </View>
          <View style={st.startBtn}>
            <Text style={st.startBtnTxt}>Başla  ▶</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  )
}

// ── 3-sütun egzersiz kartı ──────────────────────────────────────
function ExerciseCard({
  config,
  index,
  onPress,
  completed,
  lastGrade,
}: {
  config: VisualExerciseConfig
  index: number
  onPress: (id: ExerciseId) => void
  completed: boolean
  lastGrade?: string
}) {
  const xp = BASE_XP[config.difficultyDots]
  return (
    <TouchableOpacity
      style={[st.exCard, completed && st.exCardDone]}
      onPress={() => onPress(config.id)}
      activeOpacity={0.80}
    >
      {/* Tamamlandı rozeti */}
      {completed && (
        <View style={st.doneTag}>
          <Text style={st.doneTagTxt}>{lastGrade ?? '✓'}</Text>
        </View>
      )}

      {/* İkon */}
      <Text style={st.exIcon}>{config.categoryIcon}</Text>

      {/* Başlık */}
      <Text style={st.exTitle} numberOfLines={2}>{config.titleTR}</Text>

      {/* Seviye */}
      <Text style={st.exLevel}>{LEVEL_LABEL[config.difficultyDots]}</Text>

      {/* Alt: XP + oynat */}
      <View style={st.exBottom}>
        <Text style={st.exXp}>⚡{xp}</Text>
        <View style={st.playCircle}>
          <Text style={st.playIcon}>▶</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

// ── Ana ekran ────────────────────────────────────────────────────
interface Props { onBack?: () => void }

export const VisualMechanicsHomeScreen: React.FC<Props> = ({ onBack }) => {
  const [screen, setScreen]             = useState<ScreenState>({ mode: 'home' })
  const [lastGamState, setLastGamState] = useState<GamificationState | null>(null)
  const studentId      = useAuthStore((s) => s.student?.id ?? null)
  const recordExercise = useStarStore((s) => s.recordExercise)
  const directEntry    = useRef(false)
  const totalXp        = useVisualMechanicsStore((s) => s.getTotalXpFromVisualMechanics())
  const { completeExercise, startExercise, exitExercise, completedExercises,
          pendingExerciseId, setPendingExerciseId } = useVisualMechanicsStore()

  useEffect(() => {
    if (pendingExerciseId) {
      directEntry.current = true
      setPendingExerciseId(null)
      setScreen({ mode: 'intro', exerciseId: pendingExerciseId })
    }
  }, [pendingExerciseId, setPendingExerciseId])

  // Tamamlananlar seti
  const completedSet = useMemo(
    () => new Set(completedExercises.map((e) => e.exerciseId)),
    [completedExercises],
  )

  // Son skor haritası
  const lastScoreMap = useMemo(() => {
    const map: Partial<Record<ExerciseId, ExerciseScore>> = {}
    for (const r of completedExercises) {
      map[r.exerciseId] = {
        focusStabilityScore: r.focusStabilityScore, reactionTimeMs: r.reactionTimeMs,
        errorRate: r.errorRate, baseScore: r.focusStabilityScore,
        xpEarned: r.xpEarned, csfContribution: 1 - r.errorRate,
        grade: r.focusStabilityScore >= 90 ? 'S' : r.focusStabilityScore >= 75 ? 'A' :
               r.focusStabilityScore >= 60 ? 'B' : r.focusStabilityScore >= 40 ? 'C' : 'D',
      }
    }
    return map
  }, [completedExercises])

  // AI günlük öneri: ilk tamamlanmamış egzersiz
  const dailyExerciseId = useMemo(
    () => EXERCISE_ID_LIST.find((id) => !completedSet.has(id)) ?? EXERCISE_ID_LIST[0],
    [completedSet],
  )

  const handleCardPress = useCallback((id: ExerciseId) => setScreen({ mode: 'intro', exerciseId: id }), [])

  const handleStart = useCallback((level: DifficultyLevel) => {
    if (screen.mode !== 'intro') return
    startExercise(screen.exerciseId)
    setScreen({ mode: 'exercise', exerciseId: screen.exerciseId, level })
  }, [screen, startExercise])

  const handleExerciseComplete = useCallback((metrics: RawMetrics) => {
    if (screen.mode !== 'exercise') return
    const { exerciseId, level } = screen
    const score = calculateScore(metrics, level)
    const cfg = EXERCISE_CONFIGS[exerciseId]

    completeExercise({
      exerciseId, completedAt: new Date().toISOString(), level,
      focusStabilityScore: score.focusStabilityScore, reactionTimeMs: score.reactionTimeMs,
      errorRate: score.errorRate, xpEarned: score.xpEarned,
      arpContribution: cfg.arpEffect,
    })

    // Gamification (stars + streak)
    if (studentId) {
      recordExercise(studentId, exerciseId, score.focusStabilityScore)
        .then((g) => setLastGamState(g)).catch(() => {})
    }

    // Supabase kayıt — EyeMetrics'e dönüştür
    if (studentId) {
      const eyeMetrics: EyeMetrics = {
        reactionTimeMs:        score.reactionTimeMs,
        accuracyPercent:       Math.round((1 - score.errorRate) * 100),
        trackingErrorPx:       0,
        visualAttentionScore:  score.focusStabilityScore,
        saccadicSpeedEstimate: parseFloat(
          (metrics.totalTargets / Math.max(metrics.totalDurationMs / 1000, 1)).toFixed(2),
        ),
        taskCompletionMs:      metrics.totalDurationMs,
        arpContribution:       Math.round(cfg.arpEffect.regressionReduction * 10),
      }
      eyeService.saveSession({
        studentId,
        exerciseId,
        category:        'visual_mechanics',
        difficulty:      level,
        durationSeconds: Math.round(metrics.totalDurationMs / 1000),
        metrics:         eyeMetrics,
        xpEarned:        score.xpEarned,
        isBoss:          false,
      }).catch(() => {})
    }

    setScreen({ mode: 'result', exerciseId, level, score })
  }, [screen, completeExercise, studentId, recordExercise])

  const handleExit = useCallback(() => {
    exitExercise()
    if (directEntry.current) { onBack?.() } else { setScreen({ mode: 'home' }) }
  }, [exitExercise, onBack])

  const handleRetry = useCallback(() => {
    if (screen.mode !== 'result') return
    startExercise(screen.exerciseId)
    setScreen({ mode: 'exercise', exerciseId: screen.exerciseId, level: screen.level })
  }, [screen, startExercise])

  // ── Egzersiz router ─────────────────────────────────────────
  if (screen.mode === 'exercise') {
    const p = { level: screen.level, onComplete: handleExerciseComplete, onExit: handleExit }
    const Ex: React.ReactNode = (() => {
      switch (screen.exerciseId) {
        case 'flash_jump_matrix':       return <FlashJumpMatrix       {...p} />
        case 'vertical_pulse_track':    return <VerticalPulseTrack    {...p} />
        case 'diagonal_laser_dash':     return <DiagonalLaserDash     {...p} />
        case 'peripheral_flash_hunter': return <PeripheralFlashHunter {...p} />
        case 'expanding_rings_focus':   return <ExpandingRingsFocus   {...p} />
        case 'speed_dot_storm':         return <SpeedDotStorm         {...p} />
        case 'opposite_pull':           return <OppositePull          {...p} />
        case 'random_blink_trap':       return <RandomBlinkTrap       {...p} />
        case 'circular_orbit_chase':    return <CircularOrbitChase    {...p} />
        case 'shrink_zoom_focus':       return <ShrinkZoomFocus       {...p} />
        case 'double_target_switch':    return <DoubleTargetSwitch    {...p} />
        case 'line_scan_sprint':        return <LineScanSprint        {...p} />
        case 'split_screen_mirror':     return <SplitScreenMirror     {...p} />
        case 'micro_pause_react':       return <MicroPauseReact       {...p} />
        case 'tunnel_vision_breaker':   return <TunnelVisionBreaker   {...p} />
        case 'yagmur_hedef':            return <YagmurHedef           {...p} />
        case 'renk_hafiza':             return <RenkHafiza            {...p} />
        default:                        return null
      }
    })()
    return <SafeAreaView style={st.fill}>{Ex}</SafeAreaView>
  }

  if (screen.mode === 'intro') {
    return (
      <SafeAreaView style={st.fill}>
        <ExerciseIntroScreen config={EXERCISE_CONFIGS[screen.exerciseId]}
          onStart={handleStart} onBack={handleExit} />
      </SafeAreaView>
    )
  }

  if (screen.mode === 'result') {
    return (
      <SafeAreaView style={st.fill}>
        <ExerciseResultScreen score={screen.score} config={EXERCISE_CONFIGS[screen.exerciseId]}
          level={screen.level} onRetry={handleRetry} onExit={handleExit} gamState={lastGamState} />
      </SafeAreaView>
    )
  }

  // ── Home ────────────────────────────────────────────────────
  const completedCount = completedExercises.length

  return (
    <SafeAreaView style={st.fill}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={st.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ─────────────────────────────────────────── */}
        <View style={st.header}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={st.backBtn}>
              <Text style={st.backTxt}>← Geri</Text>
            </TouchableOpacity>
          )}
          <View style={st.headerRow}>
            <View>
              <Text style={st.headerEyebrow}>👁  GÖRSEL MEKANİKLER</Text>
              <Text style={st.headerTitle}>Kartal Gözü</Text>
            </View>
            {/* XP + ilerleme */}
            <View style={st.xpBlock}>
              <Text style={st.xpNum}>{totalXp}</Text>
              <Text style={st.xpLbl}>XP ⚡</Text>
              <View style={st.progressBar}>
                <View style={[st.progressFill, {
                  width: `${Math.min((completedCount / 15) * 100, 100)}%`,
                }]} />
              </View>
              <Text style={st.progressLbl}>{completedCount}/15</Text>
            </View>
          </View>
        </View>

        {/* ── Daily AI Training ──────────────────────────────── */}
        <View style={st.section}>
          <DailyTrainingCard
            exerciseId={dailyExerciseId}
            completedCount={completedCount}
            onPress={handleCardPress}
          />
        </View>

        {/* ── Egzersiz Grid ──────────────────────────────────── */}
        <View style={st.section}>
          <View style={st.sectionHeader}>
            <Text style={st.sectionTitle}>Tüm Egzersizler</Text>
            <Text style={st.sectionCount}>{EXERCISE_ID_LIST.length} egzersiz</Text>
          </View>
          <View style={st.grid}>
            {EXERCISE_ID_LIST.map((id, index) => (
              <ExerciseCard
                key={id}
                config={EXERCISE_CONFIGS[id]}
                index={index}
                onPress={handleCardPress}
                completed={completedSet.has(id)}
                lastGrade={lastScoreMap[id]?.grade}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

// ── Styles ───────────────────────────────────────────────────────
const st = StyleSheet.create({
  fill:   { flex: 1, backgroundColor: BG },
  scroll: { paddingBottom: 40 },

  // Header
  header: {
    paddingHorizontal: GRID_PAD,
    paddingTop: 8,
    paddingBottom: 20,
  },
  backBtn: { marginBottom: 8 },
  backTxt: { fontSize: 15, color: ACCENT, fontWeight: '500' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerEyebrow: {
    fontSize: 10, fontWeight: '700', color: ACCENT,
    letterSpacing: 1.2, marginBottom: 4,
  },
  headerTitle: {
    fontSize: 30, fontWeight: '800', color: W100,
    letterSpacing: -0.5,
  },
  xpBlock: { alignItems: 'flex-end', gap: 2 },
  xpNum:   { fontSize: 22, fontWeight: '800', color: GOLD },
  xpLbl:   { fontSize: 10, color: W50, fontWeight: '600', marginTop: -2 },
  progressBar: {
    width: 72, height: 5, backgroundColor: W10,
    borderRadius: 3, marginTop: 4, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: SUCCESS, borderRadius: 3 },
  progressLbl:  { fontSize: 9, color: W50, marginTop: 2 },

  // Section
  section:       { paddingHorizontal: GRID_PAD, marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle:  { fontSize: 16, fontWeight: '700', color: W100 },
  sectionCount:  { fontSize: 12, color: W50 },

  // Daily Training card
  dailyWrap: {
    borderRadius: 22,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.40,
    shadowRadius: 20,
    elevation: 10,
  },
  dailyCard: {
    borderRadius: 22,
    padding: 20,
    overflow: 'hidden',
    minHeight: 180,
  },
  decCircle1: {
    position: 'absolute', width: 180, height: 180,
    borderRadius: 90, backgroundColor: W10,
    right: -40, top: -60,
  },
  decCircle2: {
    position: 'absolute', width: 100, height: 100,
    borderRadius: 50, backgroundColor: W10,
    right: 60, bottom: -40,
  },
  dailyTop: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 14,
  },
  dailyBadge: {
    backgroundColor: W20,
    borderRadius: R.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  dailyBadgeTxt: { fontSize: 11, fontWeight: '700', color: W100, letterSpacing: 0.5 },
  streakPill: {
    backgroundColor: 'rgba(255,215,0,0.20)',
    borderRadius: R.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.40)',
  },
  streakTxt: { fontSize: 12, fontWeight: '700', color: GOLD },
  dailyTitle: {
    fontSize: 20, fontWeight: '800', color: W100,
    lineHeight: 26, marginBottom: 6,
  },
  dailyDesc: {
    fontSize: 13, color: W80, lineHeight: 18, marginBottom: 16,
  },
  dailyBottom: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
  },
  dailyMeta: { flexDirection: 'row', gap: 8 },
  metaPill: {
    backgroundColor: W10,
    borderRadius: R.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  metaTxt: { fontSize: 11, fontWeight: '600', color: W80 },
  startBtn: {
    backgroundColor: W100,
    borderRadius: R.pill,
    paddingHorizontal: 20,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  startBtnTxt: { fontSize: 14, fontWeight: '800', color: PRIMARY },

  // Exercise grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
  exCard: {
    width: CARD_W,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    paddingTop: 16,
    minHeight: 150,
    justifyContent: 'space-between',
    // Mavi derinlik gölgesi
    shadowColor: PRIMARY,
    shadowOffset: { width: 2, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
    // Kenarlık — üstte mavi kapak (lid), yanlarda açık mavi
    borderWidth: 1,
    borderColor: '#E5ECFF',
    borderTopWidth: 3,
    borderTopColor: ACCENT,
  },
  exCardDone: {
    borderTopColor: SUCCESS,
    backgroundColor: '#F0FFF8',
    borderColor: SUCCESS + '80',
  },
  doneTag: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: SUCCESS,
    borderRadius: 8,
    width: 22, height: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  doneTagTxt:  { fontSize: 9, fontWeight: '900', color: '#FFFFFF' },
  exIcon:      { fontSize: 26, marginBottom: 6 },
  exTitle: {
    fontSize: 12, fontWeight: '700', color: PRIMARY,
    lineHeight: 17, flex: 1,
  },
  exLevel: {
    fontSize: 10, color: ACCENT,
    fontWeight: '600', marginTop: 4,
  },
  exBottom: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginTop: 10,
  },
  exXp: { fontSize: 12, fontWeight: '800', color: PRIMARY },
  playCircle: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: PRIMARY,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  playIcon: { fontSize: 11, color: W100, marginLeft: 2 },
})
