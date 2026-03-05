/**
 * starStore — Zustand store for Stars + Streak gamification
 * Wraps createStarService from @sprinta/api
 */

import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { createStarService } from '@sprinta/api'
import type { GamificationState } from '@sprinta/api'

const starSvc = createStarService(supabase)

interface StarStoreState {
  gamState:      GamificationState | null
  loading:       boolean
  /** Call after exercise completes. accuracy = focusStabilityScore (0–100) */
  recordExercise: (
    userId:     string,
    exerciseId: string,
    accuracy:   number,
  ) => Promise<GamificationState | null>
  /** Fetch current state (e.g. on home screen mount) */
  fetchState:    (userId: string) => Promise<void>
  clearGamState: () => void
}

export const useStarStore = create<StarStoreState>((set) => ({
  gamState: null,
  loading:  false,

  recordExercise: async (userId, exerciseId, accuracy) => {
    set({ loading: true })
    try {
      const state = await starSvc.recordExercise(userId, exerciseId, accuracy)
      set({ gamState: state, loading: false })
      return state
    } catch (err) {
      console.warn('[starStore] recordExercise error:', err)
      set({ loading: false })
      return null
    }
  },

  fetchState: async (userId) => {
    set({ loading: true })
    try {
      const state = await starSvc.getState(userId)
      set({ gamState: state, loading: false })
    } catch (err) {
      console.warn('[starStore] fetchState error:', err)
      set({ loading: false })
    }
  },

  clearGamState: () => set({ gamState: null }),
}))
