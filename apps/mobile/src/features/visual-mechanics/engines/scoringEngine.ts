/**
 * Visual Mechanics — Puanlama Motoru
 * Ham metriklerden egzersiz skoru ve XP hesaplar.
 */

import type { DifficultyLevel } from '../constants/exerciseConfig'
import { DIFFICULTY_MULTIPLIER } from '../constants/exerciseConfig'

export interface RawMetrics {
  correctFocusDurationMs: number  // Doğru odak süresi (ms)
  totalDurationMs: number         // Toplam egzersiz süresi
  reactionTimeMs: number          // Ortalama tepki süresi (ms)
  errorCount: number              // Hata sayısı
  totalTargets: number            // Toplam hedef sayısı
  fatigueIndex: number            // 0-1 (0 = hiç yorulmadı)
}

export interface ExerciseScore {
  focusStabilityScore: number          // 0-100
  reactionTimeMs: number
  errorRate: number                    // 0-1
  baseScore: number                    // 0-100
  xpEarned: number
  csfContribution: number              // ARP → CSF katkısı
  grade: 'S' | 'A' | 'B' | 'C' | 'D'
}

/**
 * Ham metriklerden egzersiz skorunu hesaplar.
 *
 * Score = (doğru odak oranı × 0.4) + (tepki hızı skoru × 0.3)
 *        - (hata oranı × 0.2) - (fatigue × 0.1)
 */
export function calculateScore(
  metrics: RawMetrics,
  level: DifficultyLevel,
): ExerciseScore {
  const errorRate =
    metrics.totalTargets > 0 ? metrics.errorCount / metrics.totalTargets : 0

  const focusRatio =
    metrics.totalDurationMs > 0
      ? metrics.correctFocusDurationMs / metrics.totalDurationMs
      : 0

  // 200ms → 100 puan, 1000ms → 0 puan (lineer)
  const reactionScore = Math.max(0, Math.min(100, (1000 - metrics.reactionTimeMs) / 8))

  const rawScore =
    focusRatio * 40 +
    reactionScore * 0.3 -
    errorRate * 20 -
    metrics.fatigueIndex * 10

  const baseScore = Math.max(0, Math.min(100, rawScore))
  const xpEarned = Math.round(baseScore * DIFFICULTY_MULTIPLIER[level])

  // CSF katkısı: visual mechanics'te regresyon proxy olarak errorRate kullanılır
  const csfContribution = 1 - (errorRate + errorRate * 0.5 + metrics.fatigueIndex) / 3

  const focusStabilityScore = Math.round(Math.min(1, focusRatio) * 100)

  const grade: ExerciseScore['grade'] =
    baseScore >= 90 ? 'S'
    : baseScore >= 75 ? 'A'
    : baseScore >= 60 ? 'B'
    : baseScore >= 40 ? 'C'
    : 'D'

  return {
    focusStabilityScore,
    reactionTimeMs: metrics.reactionTimeMs,
    errorRate,
    baseScore,
    xpEarned,
    csfContribution,
    grade,
  }
}
