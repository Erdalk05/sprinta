// Sprinta — WhatsApp Renk Sistemi
// Flat, temiz, tanıdık. Yeşil sadece header + icon + buton kenarlığında.

import { getScheme } from './colorSchemes'
export { COLOR_SCHEMES, getScheme } from './colorSchemes'
export type { ColorScheme } from './colorSchemes'

// ─── Base Tonlar ─────────────────────────────────────────────────

const baseLight = {
  background:  '#ECE5DD',   // WhatsApp açık zemin
  surface:     '#FFFFFF',   // Kart/liste zemin
  surfaceSub:  '#F0F2F5',   // İkincil surface
  text:        '#111B21',   // WhatsApp birincil yazı
  textSub:     '#54656F',   // İkincil yazı
  textHint:    '#8696A0',   // İpucu yazı
  border:      '#E9EDEF',   // WhatsApp ayraç
  divider:     '#E9EDEF',
  msgGray:     '#F0F2F5',
  bubbleOut:   '#DCF8C6',
  bubbleIn:    '#FFFFFF',
  success:     '#25D366',
  warning:     '#F59E0B',
  error:       '#EF4444',
  info:        '#34B7F1',
  headerBg:    '#075E54',   // WhatsApp header — koyu yeşil
}

const baseDark = {
  background:  '#0B141A',   // WhatsApp koyu zemin
  surface:     '#111B21',   // Kart zemin
  surfaceSub:  '#1F2C34',   // İkincil surface
  text:        '#E9EDEF',
  textSub:     '#8696A0',
  textHint:    '#667781',
  border:      'rgba(134,150,160,0.15)',
  divider:     'rgba(134,150,160,0.12)',
  msgGray:     '#1F2C34',
  bubbleOut:   '#005C4B',
  bubbleIn:    '#1F2C34',
  success:     '#25D366',
  warning:     '#FBBF24',
  error:       '#F87171',
  info:        '#34B7F1',
  headerBg:    '#1F2C34',   // WhatsApp koyu header
}

// ─── Tema Fabrikası ───────────────────────────────────────────────

export function buildTheme(isDark: boolean, _schemeId = 'whatsapp') {
  const base   = isDark ? baseDark : baseLight
  const scheme = getScheme('whatsapp')

  const WA_GREEN = '#25D366'
  const WA_TEAL  = '#128C7E'
  const WA_DARK  = '#075E54'

  return {
    colors: {
      ...base,
      primary:      WA_GREEN,
      primaryDark:  WA_DARK,
      primaryLight: WA_TEAL,
      accent:       WA_TEAL,
      panel:        isDark ? '#1F2C34' : WA_DARK,
      iconGray:     base.textHint,
      white:        '#FFFFFF',
      // Yeşil tonları — light bg için icon/badge
      greenLight:   '#25D36618',  // çok hafif yeşil arka plan
      greenMid:     '#25D36630',  // orta yeşil arka plan
      // ── Sport Premium Tokens ─────────────────────────────────────
      sportBg:      isDark ? '#0B141A'             : '#F7F6F2',
      sportCard:    isDark ? '#111B21'             : '#FFFFFF',
      sportSoft:    isDark ? '#1F2C34'             : '#F0EFEA',
      deepGreen:    '#0F3D2E',
      energyGreen:  '#00C853',
      energyLight:  'rgba(0,200,83,0.15)' as string,
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

    // ─── GRADIENTS — sadece header/hero için ───────────────────────
    // Kart gradyanları kaldırıldı. Ekranlar flat beyaz kart kullanır.
    gradients: {
      // WhatsApp header gradient (hero, header bannerı)
      hero:         isDark ? ['#0B141A', '#1F2C34'] as string[] : ['#075E54', '#128C7E'] as string[],
      header:       isDark ? ['#1F2C34', '#2A3942'] as string[] : ['#075E54', '#128C7E'] as string[],
      primary:      ['#075E54', '#25D366']           as string[],
      cta:          ['#25D366', '#128C7E']            as string[],

      // Tüm modül/fonksiyon gradyanları → aynı yeşil header tonu
      // (geriye uyumluluk için, ekranlar artık bunları kart bg olarak kullanmıyor)
      aiKoc:        ['#075E54', '#128C7E']            as string[],
      antrenmanlar: ['#075E54', '#128C7E']            as string[],
      basarilar:    ['#075E54', '#25D366']            as string[],
      speedControl: ['#075E54', '#25D366']            as string[],
      chunkRsvp:    ['#075E54', '#128C7E']            as string[],
      flowReading:  ['#075E54', '#128C7E']            as string[],
      deepComp:     ['#0B141A', '#075E54']            as string[],
      attention:    ['#128C7E', '#25D366']            as string[],
      mentalReset:  ['#075E54', '#25D366']            as string[],
      eyeTraining:  ['#0B141A', '#128C7E']            as string[],
      vocabulary:   ['#1F2C34', '#25D366']            as string[],
      istatistik:   ['#075E54', '#25D366']            as string[],
      xp:           ['#0B141A', '#34B7F1']            as string[],
      streak:       ['#1F2C34', '#25D366']            as string[],
      arp:          ['#0B141A', '#128C7E']            as string[],
      social:       ['#128C7E', '#25D366']            as string[],
      leaderboard:  ['#075E54', '#34B7F1']            as string[],
      program:      ['#1F2C34', '#128C7E']            as string[],
      library:      ['#0B141A', '#128C7E']            as string[],
      ayarlar:      isDark
        ? ['#0B141A', '#111B21']  as string[]
        : ['#1F2C34', '#2A3942'] as string[],
      konuTurkce:    ['#1F2C34', '#25D366']           as string[],
      konuIngilizce: ['#0B141A', '#128C7E']           as string[],
      konuTarih:     ['#075E54', '#25D366']           as string[],
      konuCografya:  ['#0B141A', '#34B7F1']           as string[],
      konuBilim:     ['#075E54', '#128C7E']           as string[],
      konuTek:       ['#1F2C34', '#128C7E']           as string[],
      konuFelsefe:   ['#0B141A', '#075E54']           as string[],
      konuPsiko:     ['#1F2C34', '#25D366']           as string[],
      konuEdebiyat:  ['#2A3942', '#25D366']           as string[],
      konuSosyal:    ['#075E54', '#34B7F1']           as string[],
      konuFen:       ['#0B141A', '#128C7E']           as string[],
      konuSaglik:    ['#128C7E', '#25D366']           as string[],
    },

    typography: {
      heroNumber: 72, displayLg: 48, displayMd: 36, displaySm: 28,
      titleLg: 22, titleMd: 18, body: 15, caption: 12,
    },

    module: {
      speed_control:      { color: WA_GREEN, icon: '⚡', label: 'Hız Kontrolü' },
      deep_comprehension: { color: WA_TEAL,  icon: '🧠', label: 'Derin Kavrama' },
      attention_power:    { color: WA_GREEN, icon: '🎯', label: 'Dikkat Gücü' },
      mental_reset:       { color: WA_GREEN, icon: '🌿', label: 'Zihinsel Sıfırlama' },
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
