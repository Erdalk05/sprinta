export const READING_THEMES = {
  sepia: {
    background: '#F5F0E8',
    text:        '#2C1810',
    label:       'Krem',
    icon:        '☕',
  },
  white: {
    background: '#FFFFFF',
    text:        '#1C1C1E',
    label:       'Beyaz',
    icon:        '📄',
  },
  night: {
    background: '#1A1A1A',
    text:        '#E8E0D0',
    label:       'Gece',
    icon:        '🌙',
  },
  gray: {
    background: '#2D2D2D',
    text:        '#CCCCCC',
    label:       'Gri',
    icon:        '🌫',
  },
} as const

export type ReadingThemeKey = keyof typeof READING_THEMES
export const DEFAULT_READING_THEME: ReadingThemeKey = 'sepia'
