/**
 * DailyTrainingSession — Günlük Karışık Antrenman Ana Orkestratörü
 *
 * Flow: intro → exercise[0] → miniscore[0] → exercise[1] → miniscore[1]
 *             → exercise[2] → miniscore[2] → exercise[3] → summary
 *
 * Coming-soon egzersizler: "Geri Dön" basıldığında varsayılan C skoru üretilir
 * ve oturum normal ilerler — antrenman kırılmaz.
 */

import React, { useState, useCallback, useMemo } from 'react'
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView,
} from 'react-native'

import {
  generateDailyPlan,
  CATEGORY_META,
} from '../../services/dailyTrainingEngine'
import type { DailyPlan } from '../../services/dailyTrainingEngine'

import { useVisualMechanicsStore } from '../../features/visual-mechanics/store/visualMechanicsStore'
import { calculateScore } from '../../features/visual-mechanics/engines/scoringEngine'
import type { ExerciseScore, RawMetrics } from '../../features/visual-mechanics/engines/scoringEngine'
import { EXERCISE_CONFIGS } from '../../features/visual-mechanics/constants/exerciseConfig'

import FlashJumpMatrix         from '../../features/visual-mechanics/components/exercises/FlashJumpMatrix'
import VerticalPulseTrack     from '../../features/visual-mechanics/components/exercises/VerticalPulseTrack'
import DiagonalLaserDash      from '../../features/visual-mechanics/components/exercises/DiagonalLaserDash'
import PeripheralFlashHunter  from '../../features/visual-mechanics/components/exercises/PeripheralFlashHunter'
import ExpandingRingsFocus    from '../../features/visual-mechanics/components/exercises/ExpandingRingsFocus'
import SpeedDotStorm          from '../../features/visual-mechanics/components/exercises/SpeedDotStorm'
import OppositePull           from '../../features/visual-mechanics/components/exercises/OppositePull'
import RandomBlinkTrap        from '../../features/visual-mechanics/components/exercises/RandomBlinkTrap'
import CircularOrbitChase     from '../../features/visual-mechanics/components/exercises/CircularOrbitChase'
import ShrinkZoomFocus        from '../../features/visual-mechanics/components/exercises/ShrinkZoomFocus'
import DoubleTargetSwitch     from '../../features/visual-mechanics/components/exercises/DoubleTargetSwitch'
import LineScanSprint         from '../../features/visual-mechanics/components/exercises/LineScanSprint'
import SplitScreenMirror      from '../../features/visual-mechanics/components/exercises/SplitScreenMirror'
import MicroPauseReact        from '../../features/visual-mechanics/components/exercises/MicroPauseReact'
import TunnelVisionBreaker    from '../../features/visual-mechanics/components/exercises/TunnelVisionBreaker'

import MiniScoreCard from './MiniScoreCard'
import DailyTrainingSummary from './DailyTrainingSummary'

// ─── Phase state machine ──────────────────────────────────────────
type Phase =
  | { name: 'intro' }
  | { name: 'exercise';  idx: number }
  | { name: 'miniscore'; idx: number; score: ExerciseScore }
  | { name: 'summary' }

/** Coming-soon egzersiz için varsayılan C-dereceli skor */
function makeDefaultScore(): ExerciseScore {
  return {
    focusStabilityScore: 55,
    reactionTimeMs:      450,
    errorRate:           0.25,
    baseScore:           55,
    xpEarned:            30,
    csfContribution:     0.65,
    grade:               'C',
  }
}

// ─── Props ────────────────────────────────────────────────────────
interface Props {
  onFinish:    () => void
  streakDays?: number
}

// ─── Main component ───────────────────────────────────────────────
export default function DailyTrainingSession({ onFinish, streakDays = 1 }: Props) {
  const { completedExercises, lastSelectedLevel, completeExercise } =
    useVisualMechanicsStore()

  // Plan bir kez üretilir (mount'ta)
  const plan = useMemo<DailyPlan>(
    () => generateDailyPlan({ completedExercises, lastSelectedLevel }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const [phase,  setPhase]  = useState<Phase>({ name: 'intro' })
  const [scores, setScores] = useState<ExerciseScore[]>([])

  // ── FlashJumpMatrix tamamlandı → gerçek metriklerden skor ─────
  const handleRawMetrics = useCallback(
    (metrics: RawMetrics) => {
      if (phase.name !== 'exercise') return
      const { idx } = phase
      const ex    = plan.exercises[idx]
      const score = calculateScore(metrics, ex.level)

      completeExercise({
        exerciseId:           ex.exerciseId,
        completedAt:          new Date().toISOString(),
        level:                ex.level,
        focusStabilityScore:  score.focusStabilityScore,
        reactionTimeMs:       score.reactionTimeMs,
        errorRate:            score.errorRate,
        xpEarned:             score.xpEarned,
        arpContribution:      EXERCISE_CONFIGS[ex.exerciseId].arpEffect,
      })

      setScores((prev) => [...prev, score])
      setPhase({ name: 'miniscore', idx, score })
    },
    [phase, plan, completeExercise],
  )

  // ── Coming-soon egzersiz atlandı → varsayılan C skoru ─────────
  const handleComingSoonExit = useCallback(() => {
    if (phase.name !== 'exercise') return
    const { idx } = phase
    const ex    = plan.exercises[idx]
    const score = makeDefaultScore()

    completeExercise({
      exerciseId:           ex.exerciseId,
      completedAt:          new Date().toISOString(),
      level:                ex.level,
      focusStabilityScore:  score.focusStabilityScore,
      reactionTimeMs:       score.reactionTimeMs,
      errorRate:            score.errorRate,
      xpEarned:             score.xpEarned,
      arpContribution:      EXERCISE_CONFIGS[ex.exerciseId].arpEffect,
    })

    setScores((prev) => [...prev, score])
    setPhase({ name: 'miniscore', idx, score })
  }, [phase, plan, completeExercise])

  // ── MiniScoreCard devam et ────────────────────────────────────
  const handleContinue = useCallback(() => {
    if (phase.name !== 'miniscore') return
    const nextIdx = phase.idx + 1
    if (nextIdx < plan.exercises.length) {
      setPhase({ name: 'exercise', idx: nextIdx })
    } else {
      setPhase({ name: 'summary' })
    }
  }, [phase, plan.exercises.length])

  // ── RENDER ────────────────────────────────────────────────────

  // 1. Özet
  if (phase.name === 'summary') {
    return (
      <DailyTrainingSummary
        plan={plan}
        scores={scores}
        streakDays={streakDays}
        onFinish={onFinish}
      />
    )
  }

  // 2. Egzersiz arası kart
  if (phase.name === 'miniscore') {
    const { idx, score } = phase
    const ex     = plan.exercises[idx]
    const config = EXERCISE_CONFIGS[ex.exerciseId]
    return (
      <MiniScoreCard
        score={score}
        exerciseTitle={config.titleTR}
        category={ex.category}
        exerciseNum={idx + 1}
        totalExercises={plan.exercises.length}
        onContinue={handleContinue}
      />
    )
  }

  // 3. Egzersiz
  if (phase.name === 'exercise') {
    const { idx } = phase
    const ex = plan.exercises[idx]
    const exProps = { level: ex.level, onComplete: handleRawMetrics, onExit: handleComingSoonExit }

    const ExNode: React.ReactNode = (() => {
      switch (ex.exerciseId) {
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
      <SafeAreaView style={s.fill}>
        {ExNode}
      </SafeAreaView>
    )
  }

  // 4. Intro
  return (
    <SafeAreaView style={s.fill}>
      <DailyIntro
        plan={plan}
        onStart={() => setPhase({ name: 'exercise', idx: 0 })}
        onBack={onFinish}
      />
    </SafeAreaView>
  )
}

// ─── DailyIntro ───────────────────────────────────────────────────
function DailyIntro({
  plan, onStart, onBack,
}: { plan: DailyPlan; onStart: () => void; onBack: () => void }) {
  const weak = CATEGORY_META[plan.weakestCategory]

  return (
    <ScrollView style={s.introRoot} contentContainerStyle={s.introContent} showsVerticalScrollIndicator={false}>

      {/* Geri */}
      <TouchableOpacity style={s.backBtn} onPress={onBack}>
        <Text style={s.backTxt}>← Geri</Text>
      </TouchableOpacity>

      {/* Başlık */}
      <Text style={s.introTitle}>Günlük Antrenman</Text>
      <Text style={s.introSub}>Bugün 4 egzersiz · AI tarafından seçildi</Text>

      {/* Zayıf kategori vurgusu */}
      <View style={[s.weakCard, { borderColor: weak.color + '50' }]}>
        <Text style={s.weakPre}>Gelişim odağı</Text>
        <View style={s.weakRow}>
          <Text style={s.weakIcon}>{weak.icon}</Text>
          <Text style={[s.weakLabel, { color: weak.color }]}>{weak.label}</Text>
        </View>
        <Text style={s.weakHint}>Bu kategoriye 1.3× ağırlık verildi</Text>
      </View>

      {/* Egzersiz listesi */}
      <Text style={s.listLabel}>BUGÜNKÜ EGZERSİZLER</Text>
      {plan.exercises.map((ex, i) => {
        const cfg  = EXERCISE_CONFIGS[ex.exerciseId]
        const meta = CATEGORY_META[ex.category]
        return (
          <View key={ex.exerciseId} style={[s.exItem, { borderColor: meta.color + '25' }]}>
            <View style={[s.exNum, { backgroundColor: meta.color + '20' }]}>
              <Text style={[s.exNumTxt, { color: meta.color }]}>{i + 1}</Text>
            </View>
            <View style={s.exBody}>
              <Text style={s.exTitle} numberOfLines={1}>{cfg.titleTR}</Text>
              <Text style={[s.exCat, { color: meta.color }]}>{meta.icon} {meta.label}</Text>
            </View>
            <Text style={s.exLvl}>Lv{ex.level}</Text>
          </View>
        )
      })}

      {/* Başlat */}
      <TouchableOpacity style={s.startBtn} onPress={onStart} activeOpacity={0.85}>
        <Text style={s.startTxt}>Antrenmanı Başlat  ▶</Text>
      </TouchableOpacity>

      <View style={{ height: 24 }} />
    </ScrollView>
  )
}

// ─── Stiller ─────────────────────────────────────────────────────
const s = StyleSheet.create({
  fill: { flex: 1, backgroundColor: '#0A0F1F' },

  // Intro
  introRoot:    { flex: 1, backgroundColor: '#0A0F1F' },
  introContent: { padding: 20, paddingTop: 52 },

  backBtn: { marginBottom: 16 },
  backTxt: { fontSize: 15, color: '#8696A0' },

  introTitle: {
    fontSize: 28, fontWeight: '900', color: '#E9EDEF', marginBottom: 6,
  },
  introSub: { fontSize: 14, color: '#8696A0', marginBottom: 20 },

  weakCard: {
    backgroundColor: '#0E1628', borderRadius: 16, padding: 16,
    borderWidth: 1.5, marginBottom: 24,
  },
  weakPre:   { fontSize: 11, color: '#8696A0', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 },
  weakRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  weakIcon:  { fontSize: 26 },
  weakLabel: { fontSize: 20, fontWeight: '900' },
  weakHint:  { fontSize: 12, color: '#8696A0' },

  listLabel: {
    fontSize: 11, fontWeight: '700', color: '#8696A0',
    letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10,
  },
  exItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#0E1628', borderRadius: 14, padding: 14,
    borderWidth: 1, marginBottom: 8,
  },
  exNum: {
    width: 34, height: 34, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
  },
  exNumTxt: { fontSize: 15, fontWeight: '800' },
  exBody:   { flex: 1 },
  exTitle:  { fontSize: 14, fontWeight: '700', color: '#E9EDEF' },
  exCat:    { fontSize: 11, marginTop: 3 },
  exLvl:    { fontSize: 12, fontWeight: '700', color: '#8696A0' },

  startBtn: {
    backgroundColor: '#00F5FF', borderRadius: 16,
    paddingVertical: 18, alignItems: 'center', marginTop: 20,
  },
  startTxt: { fontSize: 17, fontWeight: '900', color: '#0A0F1F' },
})
