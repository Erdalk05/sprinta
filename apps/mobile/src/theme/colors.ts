export const colors = {
  // WhatsApp Ana Palette
  primary: '#25D366',
  primaryDark: '#128C7E',
  primaryDarker: '#075E54',
  primaryLight: '#DCF8C6',

  // Nötr
  white: '#FFFFFF',
  background: '#ECE5DD',
  surface: '#FFFFFF',
  surfaceAlt: '#F0F0F0',

  // Metin
  textPrimary: '#111111',
  textSecondary: '#667781',
  textDisabled: '#8696A0',
  textOnPrimary: '#FFFFFF',

  // Durum
  success: '#25D366',
  error: '#E53935',
  warning: '#F39C12',
  info: '#2196F3',

  // Modül Gradientleri
  modules: {
    speed:         ['#25D366', '#128C7E'] as [string, string],
    comprehension: ['#667781', '#2C3E50'] as [string, string],
    attention:     ['#F39C12', '#E74C3C'] as [string, string],
    mental:        ['#8E44AD', '#3498DB'] as [string, string],
    eye:           ['#16A085', '#27AE60'] as [string, string],
    vocabulary:    ['#E67E22', '#D35400'] as [string, string],
    strategy:      ['#2980B9', '#1ABC9C'] as [string, string],
    simulation:    ['#C0392B', '#8E44AD'] as [string, string],
  },

  // ARP Kart Gradyantı
  arpGradient: ['#075E54', '#128C7E'] as [string, string],

  // Border
  border: '#E5E5E5',
  borderFocus: '#25D366',
  borderError: '#E53935',

  // Backward compat aliases
  text: '#111111',
  textTertiary: '#8696A0',
} as const
