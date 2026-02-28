/**
 * Visual Mechanics — Zustand Store
 * Egzersiz geçmişini ve tercihlerini persist eder.
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { mmkvStorage } from '../../../stores/mmkvStorage'
import type { DifficultyLevel, ExerciseId } from '../constants/exerciseConfig'

export interface ExerciseResult {
  exerciseId: ExerciseId
  completedAt: string          // ISO string
  level: DifficultyLevel
  focusStabilityScore: number  // 0-100
  reactionTimeMs: number
  errorRate: number            // 0-1
  xpEarned: number
  arpContribution: {
    regressionReduction: number
    errorRateReduction: number
    fatigueReduction: number
  }
}

interface VisualMechanicsState {
  // Tercihler
  lastSelectedLevel: DifficultyLevel

  // Geçmiş
  completedExercises: ExerciseResult[]

  // Aktif egzersiz state'i
  activeExerciseId: ExerciseId | null
  isExerciseActive: boolean

  // Dışarıdan doğrudan egzersiz açmak için (sessions tab → intro ekranı)
  pendingExerciseId: ExerciseId | null

  // Actions
  setLastSelectedLevel: (level: DifficultyLevel) => void
  startExercise: (exerciseId: ExerciseId) => void
  completeExercise: (result: ExerciseResult) => void
  exitExercise: () => void
  getExerciseHistory: (exerciseId: ExerciseId) => ExerciseResult[]
  getTotalXpFromVisualMechanics: () => number
  setPendingExerciseId: (id: ExerciseId | null) => void
}

export const useVisualMechanicsStore = create<VisualMechanicsState>()(
  persist(
    (set, get) => ({
      lastSelectedLevel: 1,
      completedExercises: [],
      activeExerciseId: null,
      isExerciseActive: false,
      pendingExerciseId: null,

      setLastSelectedLevel: (level) => set({ lastSelectedLevel: level }),

      startExercise: (exerciseId) =>
        set({ activeExerciseId: exerciseId, isExerciseActive: true }),

      completeExercise: (result) =>
        set((state) => ({
          completedExercises: [...state.completedExercises, result],
          isExerciseActive: false,
          activeExerciseId: null,
        })),

      exitExercise: () =>
        set({ isExerciseActive: false, activeExerciseId: null }),

      getExerciseHistory: (exerciseId) =>
        get().completedExercises.filter((r) => r.exerciseId === exerciseId),

      getTotalXpFromVisualMechanics: () =>
        get().completedExercises.reduce((sum, r) => sum + r.xpEarned, 0),

      setPendingExerciseId: (id) => set({ pendingExerciseId: id }),
    }),
    {
      name: 'visual-mechanics-store',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
)
