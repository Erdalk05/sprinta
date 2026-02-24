/**
 * Shared exercise types
 * Visual Mechanics ve diğer egzersiz bileşenleri bu tiplerden türer.
 */

/** Tüm egzersiz bileşenlerinin paylaştığı temel props */
export interface ExerciseProps {
  /** Kullanıcı egzersizden çıkmak istediğinde */
  onExit: () => void
}

/** Visual mechanics egzersizlerinin tamamlanma metrikleri */
export interface VisualExerciseCompletionMetrics {
  totalTargetsShown: number
  correctHits: number
  totalDurationMs: number
  avgReactionTimeMs: number
}

/** Standart oturum metrikleri (sessionStore ile uyumlu) */
export interface SessionMetrics {
  moduleCode: string
  exerciseId: string
  difficultyLevel: number
  durationSeconds: number
  wpm: number
  comprehension: number
  accuracy: number
  score: number
  errorsPerMinute?: number
}
