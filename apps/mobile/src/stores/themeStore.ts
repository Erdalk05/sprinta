import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface ThemeState {
  isDark: boolean
  toggleTheme: () => void
  setDark:     (v: boolean) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: false,
      toggleTheme: () => set((s) => ({ isDark: !s.isDark })),
      setDark:     (v)  => set({ isDark: v }),
    }),
    {
      name:    'sprinta-theme',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)
