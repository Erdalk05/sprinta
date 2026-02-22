import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { ARPResult } from './ResultEngine'

const STORAGE_KEY = 'sprinta_onboarding'

interface OnboardingState {
  completed: boolean
  quizResult: ARPResult | null
  currentStep: 0 | 1 | 2
  startedAt: number | null

  setCompleted: (v: boolean) => void
  setQuizResult: (r: ARPResult) => void
  setStep: (n: 0 | 1 | 2) => void
  loadFromStorage: () => Promise<void>
  saveToStorage: () => Promise<void>
  reset: () => void
}

const initialState = {
  completed: false,
  quizResult: null as ARPResult | null,
  currentStep: 0 as 0 | 1 | 2,
  startedAt: null as number | null,
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  ...initialState,

  setCompleted: (v) => set({ completed: v }),

  setQuizResult: (r) => set({ quizResult: r }),

  setStep: (n) => set({ currentStep: n }),

  reset: () => set({ ...initialState }),

  loadFromStorage: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (typeof parsed !== 'object' || parsed === null) {
        get().reset()
        return
      }
      set({
        completed: Boolean(parsed.completed),
        quizResult: parsed.quizResult ?? null,
        currentStep: parsed.currentStep ?? 0,
        startedAt: parsed.startedAt ?? null,
      })
    } catch {
      get().reset()
    }
  },

  saveToStorage: async () => {
    try {
      const { completed, quizResult, currentStep, startedAt } = get()
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ completed, quizResult, currentStep, startedAt })
      )
    } catch {
      // ignore
    }
  },
}))
