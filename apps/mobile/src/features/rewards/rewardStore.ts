import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { setUnlockedIds, getUnlockedIds } from './RewardEngine'

interface RewardState {
  unlockedBadgeIds: string[]
  lastBadgeToast: string | null

  setLastBadgeToast: (id: string | null) => void
  syncFromEngine: () => void
  syncToEngine: () => void
}

export const useRewardStore = create<RewardState>()(
  persist(
    (set, get) => ({
      unlockedBadgeIds: [],
      lastBadgeToast: null,

      setLastBadgeToast: (id) => set({ lastBadgeToast: id }),

      syncFromEngine: () => {
        const ids = getUnlockedIds()
        set({ unlockedBadgeIds: ids })
      },

      syncToEngine: () => {
        setUnlockedIds(get().unlockedBadgeIds)
      },
    }),
    {
      name: 'reward-store',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          setUnlockedIds(state.unlockedBadgeIds)
        }
      },
    }
  )
)
