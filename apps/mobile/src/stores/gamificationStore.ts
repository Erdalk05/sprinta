import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { mmkvStorage } from './mmkvStorage'
import type { Badge } from '@sprinta/api'

interface GamificationState {
  // Rozet durumu (MMKV cache)
  earnedBadges: Badge[]
  lockedBadges: Badge[]

  // Session sonrası yeni kazanılanlar (modal için — persist edilmez)
  pendingBadges: Badge[]
  pendingLevelUp: { from: number; to: number } | null

  // Eylemler
  setBadges: (earned: Badge[], locked: Badge[]) => void
  addPendingBadges: (badges: Badge[]) => void
  setPendingLevelUp: (from: number, to: number) => void
  clearPending: () => void
  reset: () => void
}

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set) => ({
      earnedBadges: [],
      lockedBadges: [],
      pendingBadges: [],
      pendingLevelUp: null,

      setBadges: (earned, locked) => set({ earnedBadges: earned, lockedBadges: locked }),

      addPendingBadges: (badges) =>
        set((s) => ({ pendingBadges: [...s.pendingBadges, ...badges] })),

      setPendingLevelUp: (from, to) =>
        set({ pendingLevelUp: { from, to } }),

      clearPending: () =>
        set({ pendingBadges: [], pendingLevelUp: null }),

      reset: () =>
        set({ earnedBadges: [], lockedBadges: [], pendingBadges: [], pendingLevelUp: null }),
    }),
    {
      name: 'gamification-store',
      version: 1,
      storage: createJSONStorage(() => mmkvStorage),
      // Sadece rozetleri sakla; pending state her seans başında sıfırlanır
      partialize: (state) => ({
        earnedBadges: state.earnedBadges,
        lockedBadges: state.lockedBadges,
      }),
    }
  )
)
