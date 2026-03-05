// Sprinta — İş Bankası + Facebook Mavi Tema Sistemi

import { getScheme } from './colorSchemes'
export { COLOR_SCHEMES, getScheme } from './colorSchemes'
export type { ColorScheme } from './colorSchemes'

// ─── Base Tonlar ─────────────────────────────────────────────────

const baseLight = {
  background:  '#F0F2F5',   // Facebook açık zemin
  surface:     '#FFFFFF',   // Kart/liste zemin
  surfaceSub:  '#F5F6FA',   // İkincil surface
  text:        '#1C1C1E',   // Birincil yazı
  textSub:     '#6B7280',   // İkincil yazı
  textHint:    '#9CA3AF',   // İpucu yazı
  border:      '#E5E7EB',   // Ayraç
  divider:     '#E5E7EB',
  msgGray:     '#F5F6FA',
  bubbleOut:   '#E8F0FE',
  bubbleIn:    '#FFFFFF',
  success:     '#22C55E',
  warning:     '#F5A623',
  error:       '#DC2626',
  info:        '#40C8F0',
  headerBg:    '#1A2B6B',   // Koyu lacivert header
}

const baseDark = {
  background:  '#0D1B4B',   // Koyu lacivert zemin
  surface:     '#1A2B6B',   // Kart zemin
  surfaceSub:  '#1E3275',   // İkincil surface
  text:        '#FFFFFF',
  textSub:     'rgba(255,255,255,0.6)',
  textHint:    'rgba(255,255,255,0.4)',
  border:      'rgba(255,255,255,0.12)',
  divider:     'rgba(255,255,255,0.1)',
  msgGray:     '#1E3275',
  bubbleOut:   '#1A2B6B',
  bubbleIn:    '#1E3275',
  success:     '#22C55E',
  warning:     '#F5A623',
  error:       '#FF6B6B',
  info:        '#40C8F0',
  headerBg:    '#0D1B4B',   // Çok koyu lacivert header
}

// ─── Tema Fabrikası ───────────────────────────────────────────────

export function buildTheme(isDark: boolean, _schemeId = 'default') {
  const base   = isDark ? baseDark : baseLight
  const scheme = getScheme('whatsapp')

  const BLUE       = isDark ? '#4096FF' : '#1877F2'
  const BLUE_DARK  = isDark ? '#0D1B4B' : '#1A2B6B'
  const BLUE_LIGHT = isDark ? '#1A2B6B' : '#2B3FD4'

  return {
    colors: {
      ...base,
      primary:      BLUE,
      primaryDark:  BLUE_DARK,
      primaryLight: BLUE_LIGHT,
      accent:       '#40C8F0',
      panel:        isDark ? '#1A2B6B' : '#1A2B6B',
      iconGray:     base.textHint,
      white:        '#FFFFFF',
      // Mavi tonları — light bg için icon/badge
      greenLight:   isDark ? 'rgba(64,150,255,0.12)' : 'rgba(24,119,242,0.10)',
      greenMid:     isDark ? 'rgba(64,150,255,0.20)' : 'rgba(24,119,242,0.18)',
      // Tab bar
      tabActive:           isDark ? '#4096FF' : '#1877F2',
      tabInactive:         isDark ? 'rgba(255,255,255,0.4)' : '#9CA3AF',
      tabBackground:       isDark ? '#0D1B4B' : '#FFFFFF',
      // Header gradient tokens
      headerGradientStart: isDark ? '#0D1B4B' : '#1A2B6B',
      headerGradientEnd:   isDark ? '#1A2B6B' : '#2B3FD4',
      // Card border
      cardBorder:          isDark ? 'rgba(255,255,255,0.12)' : 'rgba(24,119,242,0.15)',
      // ── Sport Premium Tokens (renk güncellemesi) ─────────────────
      sportBg:      isDark ? '#0D1B4B'             : '#F0F2F5',
      sportCard:    isDark ? '#1A2B6B'             : '#FFFFFF',
      sportSoft:    isDark ? '#1E3275'             : '#F5F6FA',
      deepGreen:    '#1A2B6B',   // Artık koyu lacivert
      energyGreen:  '#1877F2',   // Artık ana mavi
      energyLight:  isDark ? 'rgba(64,150,255,0.15)' : 'rgba(24,119,242,0.12)',
    },

    spacing: {
      xs: 4, sm: 8, md: 12, lg: 16,
      xl: 20, xxl: 24, xxxl: 32, huge: 48,
    },

    radius: {
      sm: 8, md: 12, lg: 16, xl: 20,
      xxl: 24, pill: 999, bubble: 18,
    },

    font: {
      xs: 11, sm: 12, md: 14, lg: 16,
      xl: 18, xxl: 22, h1: 28, h2: 24, display: 48,
    },

    shadow: {
      sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: isDark ? 0.3 : 0.06, shadowRadius: 3, elevation: 1 },
      md: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.4 : 0.08, shadowRadius: 6, elevation: 3 },
      lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: isDark ? 0.5 : 0.10, shadowRadius: 10, elevation: 6 },
    },

    shadows: {
      sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: isDark ? 0.30 : 0.06, shadowRadius: 3, elevation: 1 },
      md: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.40 : 0.08, shadowRadius: 6, elevation: 3 },
      lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: isDark ? 0.50 : 0.10, shadowRadius: 10, elevation: 6 },
      glow: (color: string) => ({
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.35,
        shadowRadius: 10, elevation: 6,
      }),
    },

    // ─── GRADIENTS ──────────────────────────────────────────────
    gradients: {
      hero:         isDark ? ['#0D1B4B', '#1A2B6B'] as string[] : ['#1A2B6B', '#2B3FD4'] as string[],
      header:       isDark ? ['#0D1B4B', '#1A2B6B'] as string[] : ['#1A2B6B', '#2B3FD4'] as string[],
      primary:      ['#1A2B6B', '#1877F2']           as string[],
      cta:          ['#1877F2', '#40C8F0']            as string[],

      aiKoc:        ['#1A2B6B', '#2B3FD4']            as string[],
      antrenmanlar: ['#1A2B6B', '#1877F2']            as string[],
      basarilar:    ['#1A2B6B', '#40C8F0']            as string[],
      speedControl: ['#1877F2', '#2B3FD4']            as string[],
      chunkRsvp:    ['#1A2B6B', '#1877F2']            as string[],
      flowReading:  ['#0D1B4B', '#1A2B6B']            as string[],
      deepComp:     ['#0D1B4B', '#1A2B6B']            as string[],
      attention:    ['#1877F2', '#40C8F0']            as string[],
      mentalReset:  ['#1A2B6B', '#2B3FD4']            as string[],
      eyeTraining:  ['#0D1B4B', '#1A2B6B']            as string[],
      vocabulary:   ['#1A2B6B', '#1877F2']            as string[],
      istatistik:   ['#1A2B6B', '#40C8F0']            as string[],
      xp:           ['#0D1B4B', '#40C8F0']            as string[],
      streak:       ['#1A2B6B', '#1877F2']            as string[],
      arp:          ['#0D1B4B', '#1A2B6B']            as string[],
      social:       ['#1877F2', '#40C8F0']            as string[],
      leaderboard:  ['#1A2B6B', '#40C8F0']            as string[],
      program:      ['#1A2B6B', '#1877F2']            as string[],
      library:      ['#0D1B4B', '#1A2B6B']            as string[],
      ayarlar:      isDark
        ? ['#0D1B4B', '#1A2B6B']  as string[]
        : ['#1A2B6B', '#2B3FD4'] as string[],
      konuTurkce:    ['#1A2B6B', '#1877F2']           as string[],
      konuIngilizce: ['#0D1B4B', '#1A2B6B']           as string[],
      konuTarih:     ['#1A2B6B', '#40C8F0']           as string[],
      konuCografya:  ['#0D1B4B', '#40C8F0']           as string[],
      konuBilim:     ['#1A2B6B', '#2B3FD4']           as string[],
      konuTek:       ['#1A2B6B', '#1877F2']           as string[],
      konuFelsefe:   ['#0D1B4B', '#1A2B6B']           as string[],
      konuPsiko:     ['#1A2B6B', '#1877F2']           as string[],
      konuEdebiyat:  ['#1E3275', '#1877F2']           as string[],
      konuSosyal:    ['#1A2B6B', '#40C8F0']           as string[],
      konuFen:       ['#0D1B4B', '#1A2B6B']           as string[],
      konuSaglik:    ['#1877F2', '#40C8F0']           as string[],
    },

    typography: {
      heroNumber: 72, displayLg: 48, displayMd: 36, displaySm: 28,
      titleLg: 22, titleMd: 18, body: 15, caption: 12,
    },

    module: {
      speed_control:      { color: BLUE,       icon: '⚡', label: 'Hız Kontrolü' },
      deep_comprehension: { color: BLUE_LIGHT, icon: '🧠', label: 'Derin Kavrama' },
      attention_power:    { color: BLUE,       icon: '🎯', label: 'Dikkat Gücü' },
      mental_reset:       { color: '#40C8F0',  icon: '🌿', label: 'Zihinsel Sıfırlama' },
    } as Record<string, { color: string; icon: string; label: string }>,

    scheme,
    isDark,
  }
}

export const lightTheme = buildTheme(false)
export const darkTheme  = buildTheme(true)
export const theme      = lightTheme
export type AppTheme    = ReturnType<typeof buildTheme>

export * from './colors'
export * from './typography'
export * from './spacing'
export * from './shadows'
