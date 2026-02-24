/**
 * Visual Mechanics — Adaptif Zorluk Motoru
 * Verilen level için egzersiz parametrelerini ve süreyi hesaplar.
 */

import type { DifficultyLevel } from '../constants/exerciseConfig'
import { DURATION_BY_LEVEL } from '../constants/exerciseConfig'

export interface DifficultyParams {
  level: DifficultyLevel
  durationSeconds: number
  targetSize: number               // dp cinsinden hedef boyutu
  animationSpeedMultiplier: number // 1.0 = normal hız
  peripheralSurprises: boolean     // Level 4'te aktif
  targetCountMultiplier: number    // Level 4'te daha fazla hedef
}

const LEVEL_CONFIGS: Record<
  DifficultyLevel,
  Omit<DifficultyParams, 'durationSeconds'>
> = {
  1: {
    level: 1,
    targetSize: 48,
    animationSpeedMultiplier: 0.6,
    peripheralSurprises: false,
    targetCountMultiplier: 1.0,
  },
  2: {
    level: 2,
    targetSize: 40,
    animationSpeedMultiplier: 1.0,
    peripheralSurprises: false,
    targetCountMultiplier: 1.2,
  },
  3: {
    level: 3,
    targetSize: 32,
    animationSpeedMultiplier: 1.5,
    peripheralSurprises: false,
    targetCountMultiplier: 1.5,
  },
  4: {
    level: 4,
    targetSize: 24,
    animationSpeedMultiplier: 2.2,
    peripheralSurprises: true,
    targetCountMultiplier: 2.0,
  },
}

/**
 * Verilen level için egzersiz parametrelerini hesaplar.
 * Süre, min-max arasında rastgele seçilir (her seans farklı hissettirmek için).
 */
export function buildDifficultyParams(level: DifficultyLevel): DifficultyParams {
  const { min, max } = DURATION_BY_LEVEL[level]
  const durationSeconds = Math.floor(Math.random() * (max - min + 1)) + min
  return { ...LEVEL_CONFIGS[level], durationSeconds }
}

/**
 * Adaptive difficulty: önceki performansa göre sonraki level'ı önerir.
 * errorRate: 0-1, reactionTimeMs: ms cinsinden
 */
export function suggestNextLevel(
  currentLevel: DifficultyLevel,
  errorRate: number,
  reactionTimeMs: number,
): DifficultyLevel {
  const isExcellent = errorRate < 0.05 && reactionTimeMs < 300
  const isPoor = errorRate > 0.3 || reactionTimeMs > 800

  if (isExcellent && currentLevel < 4) return (currentLevel + 1) as DifficultyLevel
  if (isPoor && currentLevel > 1) return (currentLevel - 1) as DifficultyLevel
  return currentLevel
}
