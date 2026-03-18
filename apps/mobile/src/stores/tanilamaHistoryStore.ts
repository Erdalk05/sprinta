/**
 * Tanılama History Store — son 5 testId + son kategori
 * MMKV'ye persist edilir (uygulama kapanınca kaybolmaz)
 */
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { mmkvStorage } from './mmkvStorage'
import type { TanilamaCategory } from '../data/tanilamaPool'

interface TanilamaHistoryState {
  lastTestIds:   string[]                // son 5 test (circular buffer)
  lastCategory:  TanilamaCategory | null

  recordTest: (testId: string, category: TanilamaCategory) => void
  reset:      () => void
}

export const useTanilamaHistoryStore = create<TanilamaHistoryState>()(
  persist(
    (set) => ({
      lastTestIds:  [],
      lastCategory: null,

      recordTest: (testId, category) => {
        set((s) => ({
          lastTestIds:  [...s.lastTestIds, testId].slice(-5),
          lastCategory: category,
        }))
      },

      reset: () => set({ lastTestIds: [], lastCategory: null }),
    }),
    {
      name:    'tanilama-history-store',
      version: 1,
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
)
