/**
 * FlashJumpMatrix — Egzersiz 1 (TAM IMPLEMENT)
 *
 * Level 1-2: 4×4 grid
 * Level 3-4: 6×6 grid
 *
 * Hücreler sırayla rastgele yanar. Kullanıcı yanan hücreye dokunur.
 * - Doğru: selectionAsync + yeşil flash
 * - Yanlış: notificationAsync(Error) + kırmızı flash
 * - Süre dolunca (ExerciseProgressBar) → onComplete(metrics)
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import { useAppTheme } from '../../../../theme/useAppTheme'
import type { ExerciseProps } from '../../../../components/exercises/types'
import type { DifficultyLevel } from '../../constants/exerciseConfig'
import { buildDifficultyParams } from '../../engines/difficultyEngine'
import type { RawMetrics } from '../../engines/scoringEngine'
import { ExerciseProgressBar } from '../ExerciseProgressBar'

// ─── Neon Cyber Tema Renkleri ────────────────────────────────────────────────
const NEON_CYAN = '#00F5FF'
const NEON_GREEN = '#00FF94'
const NEON_RED = '#FF3333'
const CELL_INACTIVE = '#1A2040'
const EXERCISE_BG = '#0A0F1F'

// ─── Props ───────────────────────────────────────────────────────────────────
interface FlashJumpMatrixProps extends ExerciseProps {
  level: DifficultyLevel
  onComplete: (metrics: RawMetrics) => void
}

// ─── Component ───────────────────────────────────────────────────────────────
const FlashJumpMatrix: React.FC<FlashJumpMatrixProps> = ({
  level,
  onComplete,
  onExit,
}) => {
  const t = useAppTheme()
  const params = useMemo(() => buildDifficultyParams(level), [level])

  const gridSize = level <= 2 ? 4 : 6
  const cellCount = gridSize * gridSize

  // ── Görsel state ────────────────────────────────────────────────────────
  const [activeCell, setActiveCell] = useState(-1)
  const [flashCell, setFlashCell] = useState<{ index: number; correct: boolean } | null>(
    null,
  )

  // ── Display state (render tetikler) ─────────────────────────────────────
  const [displayHits, setDisplayHits] = useState(0)
  const [displayMisses, setDisplayMisses] = useState(0)

  // ── Metrik refs (kapanış sorununu önler) ────────────────────────────────
  const hitCountRef = useRef(0)
  const missCountRef = useRef(0)
  const reactionTimesRef = useRef<number[]>([])
  const activeCellRef = useRef(-1)
  const activeSinceRef = useRef(0)
  const totalShownRef = useRef(0)
  const startTimeRef = useRef(0)
  const doneRef = useRef(false)

  // ── Hücre döngüsü ───────────────────────────────────────────────────────
  useEffect(() => {
    startTimeRef.current = Date.now()
    const cycleMs = Math.round(1500 / params.animationSpeedMultiplier)

    const showNext = () => {
      if (doneRef.current) return
      const next = Math.floor(Math.random() * cellCount)
      activeSinceRef.current = Date.now()
      activeCellRef.current = next
      setActiveCell(next)
      totalShownRef.current++
    }

    showNext()
    const timer = setInterval(showNext, cycleMs)
    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cellCount, params.animationSpeedMultiplier])

  // ── Egzersiz tamamlandı ──────────────────────────────────────────────────
  const handleDone = useCallback(() => {
    if (doneRef.current) return
    doneRef.current = true

    const totalDurationMs = Date.now() - startTimeRef.current
    const rts = reactionTimesRef.current
    const avgRt =
      rts.length > 0
        ? Math.round(rts.reduce((s, v) => s + v, 0) / rts.length)
        : 600

    const metrics: RawMetrics = {
      correctFocusDurationMs: hitCountRef.current * avgRt,
      totalDurationMs,
      reactionTimeMs: avgRt,
      errorCount: missCountRef.current,
      totalTargets: Math.max(1, totalShownRef.current),
      fatigueIndex: Math.min(
        1,
        (totalDurationMs / (params.durationSeconds * 1000)) * 0.15,
      ),
    }

    onComplete(metrics)
  }, [params.durationSeconds, onComplete])

  // ── Hücreye dokunma ─────────────────────────────────────────────────────
  const handleCellPress = useCallback((index: number) => {
    if (doneRef.current) return

    if (index === activeCellRef.current) {
      // Doğru
      const rt = Date.now() - activeSinceRef.current
      reactionTimesRef.current.push(rt)
      hitCountRef.current++
      setDisplayHits((prev) => prev + 1)
      void Haptics.selectionAsync()
      setFlashCell({ index, correct: true })
      setTimeout(() => setFlashCell(null), 150)
    } else {
      // Yanlış
      missCountRef.current++
      setDisplayMisses((prev) => prev + 1)
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      setFlashCell({ index, correct: false })
      setTimeout(() => setFlashCell(null), 200)
    }
  }, [])

  // ── Grid hücre boyutu ────────────────────────────────────────────────────
  const screenWidth = Dimensions.get('window').width
  const cellSize = Math.floor((screenWidth - 48 - (gridSize - 1) * 4) / gridSize)

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onExit}
          style={styles.exitBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.exitText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Flash Atlama Matrisi</Text>
        <View style={styles.exitBtn} />
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <ExerciseProgressBar
          durationSeconds={params.durationSeconds}
          onComplete={handleDone}
        />
      </View>

      {/* İstatistikler */}
      <View style={styles.statsRow}>
        <View style={styles.statChip}>
          <Text style={[styles.statValue, { color: NEON_GREEN }]}>{displayHits}</Text>
          <Text style={[styles.statLabel, { color: t.colors.textHint }]}>Doğru</Text>
        </View>
        <View style={styles.statChip}>
          <Text style={[styles.statValue, { color: NEON_RED }]}>{displayMisses}</Text>
          <Text style={[styles.statLabel, { color: t.colors.textHint }]}>Hata</Text>
        </View>
        <View style={styles.statChip}>
          <Text style={[styles.statValue, { color: NEON_CYAN }]}>
            {gridSize}×{gridSize}
          </Text>
          <Text style={[styles.statLabel, { color: t.colors.textHint }]}>Grid</Text>
        </View>
      </View>

      {/* Grid */}
      <View style={[styles.grid, { width: screenWidth - 32 }]}>
        {Array.from({ length: cellCount }, (_, i) => {
          const isActive = i === activeCell
          const isFlashing = flashCell?.index === i
          const bg = isFlashing
            ? flashCell?.correct
              ? NEON_GREEN
              : NEON_RED
            : isActive
              ? NEON_CYAN
              : CELL_INACTIVE

          return (
            <TouchableOpacity
              key={i}
              style={[
                styles.cell,
                {
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: bg,
                  borderColor: isActive
                    ? NEON_CYAN
                    : 'rgba(0,245,255,0.12)',
                  shadowColor: isActive ? NEON_CYAN : CELL_INACTIVE,
                  shadowOpacity: isActive ? 0.9 : 0,
                  shadowRadius: isActive ? 10 : 0,
                  elevation: isActive ? 10 : 0,
                },
              ]}
              onPress={() => handleCellPress(i)}
              activeOpacity={0.75}
            />
          )
        })}
      </View>

      {/* Yönerge */}
      <Text style={[styles.instruction, { color: t.colors.textHint }]}>
        Yanan hücreye dokun!
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: EXERCISE_BG,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  exitBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exitText: {
    fontSize: 20,
    color: '#8696A0',
    fontWeight: '300',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: NEON_CYAN,
    letterSpacing: 0.5,
  },
  progressContainer: {
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 28,
    marginBottom: 28,
  },
  statChip: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    justifyContent: 'flex-start',
    alignContent: 'flex-start',
  },
  cell: {
    borderRadius: 8,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 0 },
  },
  instruction: {
    marginTop: 28,
    fontSize: 13,
    letterSpacing: 0.5,
    opacity: 0.7,
  },
})

export default FlashJumpMatrix
