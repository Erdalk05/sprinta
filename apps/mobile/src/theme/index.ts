// Sprinta — İş Bankası + Facebook Mavi Tema Sistemi

import { getScheme } from './colorSchemes'
export { COLOR_SCHEMES, getScheme } from './colorSchemes'
export type { ColorScheme } from './colorSchemes'

// ─── Base Tonlar ─────────────────────────────────────────────────

const baseLight = {
  background:  '#D9E5FF',   // İş Bankası açık mavi zemin — belirgin mavi ton
  surface:     '#FFFFFF',   // Kart/liste zemin — beyaz kart
  surfaceSub:  '#EAF0FF',   // İkincil surface — orta mavi
  text:        '#0F2357',   // Birincil yazı — İş Bankası koyu lacivert
  textSub:     '#3A4F7A',   // İkincil yazı
  textHint:    '#7A90B8',   // İpucu yazı
  border:      '#B3C8F5',   // İş Bankası mavi kenarlık
  divider:     '#B3C8F5',
  msgGray:     '#EAF0FF',
  bubbleOut:   '#D9E5FF',
  bubbleIn:    '#FFFFFF',
  success:     '#22C55E',
  warning:     '#F5A623',
  error:       '#DC2626',
  info:        '#40C8F0',
  headerBg:    '#1A3594',   // İş Bankası royal blue header
}

const baseDark = {
  background:  '#0A1A4A',   // İş Bankası very deep blue
  surface:     '#1A3594',   // İş Bankası royal blue surface
  surfaceSub:  '#1C3A8A',   // İkincil surface
  text:        '#FFFFFF',
  textSub:     'rgba(255,255,255,0.7)',
  textHint:    'rgba(255,255,255,0.45)',
  border:      'rgba(255,255,255,0.15)',
  divider:     'rgba(255,255,255,0.12)',
  msgGray:     '#1C3A8A',
  bubbleOut:   '#1A3594',
  bubbleIn:    '#1C3A8A',
  success:     '#22C55E',
  warning:     '#F5A623',
  error:       '#FF6B6B',
  info:        '#40C8F0',
  headerBg:    '#0A1A4A',   // Very deep İş Bankası blue
}

// ─── Tema Fabrikası ───────────────────────────────────────────────

export function buildTheme(isDark: boolean, _schemeId = 'default') {
  const base   = isDark ? baseDark : baseLight
  const scheme = getScheme('whatsapp')

  const BLUE       = isDark ? '#4096FF' : '#1877F2'
  const BLUE_DARK  = isDark ? '#0F2357' : '#1A3594'
  const BLUE_LIGHT = isDark ? '#1A3594' : '#2040B0'

  return {
    colors: {
      ...base,
      primary:      BLUE,
      primaryDark:  BLUE_DARK,
      primaryLight: BLUE_LIGHT,
      accent:       '#40C8F0',
      panel:        isDark ? '#1A3594' : '#1A3594',
      iconGray:     base.textHint,
      white:        '#FFFFFF',
      // Mavi tonları — light bg için icon/badge
      greenLight:   isDark ? 'rgba(64,150,255,0.12)' : 'rgba(24,119,242,0.10)',
      greenMid:     isDark ? 'rgba(64,150,255,0.20)' : 'rgba(24,119,242,0.18)',
      // Tab bar
      tabActive:           isDark ? '#4096FF' : '#1877F2',
      tabInactive:         isDark ? 'rgba(255,255,255,0.4)' : '#9CA3AF',
      tabBackground:       isDark ? '#0F2357' : '#FFFFFF',
      // Header gradient tokens
      headerGradientStart: isDark ? '#0F2357' : '#1A3594',
      headerGradientEnd:   isDark ? '#1A3594' : '#2040B0',
      // Card border
      cardBorder:          isDark ? 'rgba(255,255,255,0.12)' : 'rgba(24,119,242,0.15)',
      // ── Sport Premium Tokens (renk güncellemesi) ─────────────────
      sportBg:      isDark ? '#0A1A4A'             : '#EEF2FD',
      sportCard:    isDark ? '#1A3594'             : '#FFFFFF',
      sportSoft:    isDark ? '#1C3A8A'             : '#F3F6FE',
      deepGreen:    '#1A3594',   // İş Bankası royal blue
      energyGreen:  '#1877F2',   // Facebook primary blue
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
      hero:         isDark ? ['#0F2357', '#1A3594'] as string[] : ['#1A3594', '#2040B0'] as string[],
      header:       isDark ? ['#0F2357', '#1A3594'] as string[] : ['#1A3594', '#2040B0'] as string[],
      primary:      ['#1A3594', '#1877F2']           as string[],
      cta:          ['#1877F2', '#40C8F0']            as string[],

      aiKoc:        ['#1A3594', '#2040B0']            as string[],
      antrenmanlar: ['#1A3594', '#1877F2']            as string[],
      basarilar:    ['#1A3594', '#40C8F0']            as string[],
      speedControl: ['#1877F2', '#2040B0']            as string[],
      chunkRsvp:    ['#1A3594', '#1877F2']            as string[],
      flowReading:  ['#0F2357', '#1A3594']            as string[],
      deepComp:     ['#0F2357', '#1A3594']            as string[],
      attention:    ['#1877F2', '#40C8F0']            as string[],
      mentalReset:  ['#1A3594', '#2040B0']            as string[],
      eyeTraining:  ['#0F2357', '#1A3594']            as string[],
      vocabulary:   ['#1A3594', '#1877F2']            as string[],
      istatistik:   ['#1A3594', '#40C8F0']            as string[],
      xp:           ['#0F2357', '#40C8F0']            as string[],
      streak:       ['#1A3594', '#1877F2']            as string[],
      arp:          ['#0F2357', '#1A3594']            as string[],
      social:       ['#1877F2', '#40C8F0']            as string[],
      leaderboard:  ['#1A3594', '#40C8F0']            as string[],
      program:      ['#1A3594', '#1877F2']            as string[],
      library:      ['#0F2357', '#1A3594']            as string[],
      ayarlar:      isDark
        ? ['#0F2357', '#1A3594']  as string[]
        : ['#1A3594', '#2040B0'] as string[],
      konuTurkce:    ['#1A3594', '#1877F2']           as string[],
      konuIngilizce: ['#0F2357', '#1A3594']           as string[],
      konuTarih:     ['#1A3594', '#40C8F0']           as string[],
      konuCografya:  ['#0F2357', '#40C8F0']           as string[],
      konuBilim:     ['#1A3594', '#2040B0']           as string[],
      konuTek:       ['#1A3594', '#1877F2']           as string[],
      konuFelsefe:   ['#0F2357', '#1A3594']           as string[],
      konuPsiko:     ['#1A3594', '#1877F2']           as string[],
      konuEdebiyat:  ['#1E3275', '#1877F2']           as string[],
      konuSosyal:    ['#1A3594', '#40C8F0']           as string[],
      konuFen:       ['#0F2357', '#1A3594']           as string[],
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
