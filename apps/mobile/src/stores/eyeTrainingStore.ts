/**
 * eyeTrainingStore — Kartal Gözü Göz Antrenman State
 * Tamamlanan egzersizler, boss kilit, kategori skorları,
 * egzersiz başına en iyi skor, milestone takibi (her 5'te).
 */
import { create } from 'zustand'
import type { CategoryType } from '@sprinta/shared'

interface EyeTrainingState {
  completedExercises: string[]
  bossUnlocked:       boolean
  categoryScores:     Record<CategoryType, number>
  bestScores:         Record<string, number>   // exerciseId → best visualAttentionScore
  milestones:         number[]                 // [5, 10, 15] tamamlandı

  markCompleted:      (exerciseId: string) => void
  updateCategoryScore:(category: CategoryType, score: number) => void
  updateBestScore:    (exerciseId: string, score: number) => void
  reset:              () => void
}

const BOSS_REQUIRED_COUNT = 8

export const useEyeTrainingStore = create<EyeTrainingState>((set, get) => ({
  completedExercises: [],
  bossUnlocked:       false,
  categoryScores: { saccadic: 0, peripheral: 0, tracking: 0, visual_mechanics: 0 },
  bestScores:     {},
  milestones:     [],

  markCompleted(exerciseId) {
    const { completedExercises, milestones } = get()
    if (completedExercises.includes(exerciseId)) return

    const updated = [...completedExercises, exerciseId]
    const count   = updated.length

    // Milestone: 5, 10, 15
    const newMilestones = [...milestones]
    for (const m of [5, 10, 15]) {
      if (count >= m && !newMilestones.includes(m)) {
        newMilestones.push(m)
      }
    }

    set({
      completedExercises: updated,
      bossUnlocked:       count >= BOSS_REQUIRED_COUNT,
      milestones:         newMilestones,
    })
  },

  updateCategoryScore(category, score) {
    set((s) => ({
      categoryScores: {
        ...s.categoryScores,
        [category]: Math.max(s.categoryScores[category], score),
      },
    }))
  },

  updateBestScore(exerciseId, score) {
    set((s) => {
      const prev = s.bestScores[exerciseId] ?? 0
      if (score <= prev) return {}
      return { bestScores: { ...s.bestScores, [exerciseId]: score } }
    })
  },

  reset() {
    set({
      completedExercises: [],
      bossUnlocked:       false,
      categoryScores:     { saccadic: 0, peripheral: 0, tracking: 0, visual_mechanics: 0 },
      bestScores:         {},
      milestones:         [],
    })
  },
}))
