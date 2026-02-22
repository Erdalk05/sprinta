import { useMemo } from 'react'
import { useThemeStore } from '../stores/themeStore'
import { lightTheme, darkTheme } from './index'

/**
 * Aktif temayı döndürür.
 * Gece modu açıksa darkTheme, kapalıysa lightTheme.
 *
 * Kullanım:
 *   const t = useAppTheme()
 *   // Sonra: t.colors.background, t.colors.primary, t.isDark, ...
 */
export function useAppTheme() {
  const isDark = useThemeStore((s) => s.isDark)
  return useMemo(() => (isDark ? darkTheme : lightTheme), [isDark])
}

/** Toggle'a kolay erişim için: const { isDark, toggleTheme } = useThemeToggle() */
export function useThemeToggle() {
  const isDark       = useThemeStore((s) => s.isDark)
  const toggleTheme  = useThemeStore((s) => s.toggleTheme)
  return { isDark, toggleTheme }
}
