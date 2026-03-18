import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { mmkvStorage } from './mmkvStorage'
import type { ReadingThemeKey } from '../constants/readingThemes'
import { DEFAULT_READING_THEME } from '../constants/readingThemes'

interface ThemeState {
  isDark:           boolean
  toggleTheme:      () => void
  setDark:          (v: boolean) => void
  readingTheme:     ReadingThemeKey
  setReadingTheme:  (theme: ReadingThemeKey) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark:          false,
      toggleTheme:     () => set((s) => ({ isDark: !s.isDark })),
      setDark:         (v)  => set({ isDark: v }),
      readingTheme:    DEFAULT_READING_THEME,
      setReadingTheme: (theme) => set({ readingTheme: theme }),
    }),
    {
      name:    'sprinta-theme-v2',
      version: 1,
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
)
