import { useMemo } from 'react'
import { useThemeStore } from '../stores/themeStore'
import { buildTheme } from './index'

/**
 * Aktif temayı döndürür.
 * WhatsApp renk sistemi — isDark toggle ile açık/koyu geçiş.
 */
export function useAppTheme() {
  const isDark = useThemeStore((s) => s.isDark)
  return useMemo(() => buildTheme(isDark), [isDark])
}

/** Toggle için kolay erişim */
export function useThemeToggle() {
  const isDark       = useThemeStore((s) => s.isDark)
  const toggleTheme  = useThemeStore((s) => s.toggleTheme)
  return { isDark, toggleTheme }
}
