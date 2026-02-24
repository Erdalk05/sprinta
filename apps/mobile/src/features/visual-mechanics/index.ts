/**
 * Visual Mechanics — Public API
 * Bu dosya dışarıya açılan tek giriş noktasıdır.
 */

// Ana ekran
export { VisualMechanicsHomeScreen } from './screens/VisualMechanicsHomeScreen'

// Store
export { useVisualMechanicsStore } from './store/visualMechanicsStore'
export type { ExerciseResult } from './store/visualMechanicsStore'

// Engine — Difficulty
export { buildDifficultyParams, suggestNextLevel } from './engines/difficultyEngine'
export type { DifficultyParams } from './engines/difficultyEngine'

// Engine — Scoring
export { calculateScore } from './engines/scoringEngine'
export type { RawMetrics, ExerciseScore } from './engines/scoringEngine'

// Config + Tipler
export {
  EXERCISE_CONFIGS,
  EXERCISE_ID_LIST,
  DIFFICULTY_MULTIPLIER,
  DURATION_BY_LEVEL,
} from './constants/exerciseConfig'
export type {
  DifficultyLevel,
  ExerciseId,
  VisualExerciseConfig,
} from './constants/exerciseConfig'
