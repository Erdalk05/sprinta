/**
 * Sprinta Typography System
 * Primary: Inter — digital reading optimized, excellent x-height
 * Fallback: System UI / SF Pro / Roboto / Helvetica Neue
 * Grid: 8px base spacing
 */

import { TextStyle, Platform } from 'react-native'

// ─── Font Family Tokens ───────────────────────────────────────────

export const FONT = {
  regular:   'Inter_400Regular',
  medium:    'Inter_500Medium',
  semiBold:  'Inter_600SemiBold',
  bold:      'Inter_700Bold',
  extraBold: 'Inter_800ExtraBold',
  system:    Platform.select({ ios: 'System', android: 'Roboto', default: 'System' }) as string,
  mono:      Platform.select({ ios: 'Courier New', android: 'monospace', default: 'monospace' }) as string,
}

// Tüm bileşenlerde kullanılacak Inter font ailesi
export const INTER = {
  regular:  { fontFamily: 'Inter_400Regular' } as TextStyle,
  medium:   { fontFamily: 'Inter_500Medium'  } as TextStyle,
  semiBold: { fontFamily: 'Inter_600SemiBold'} as TextStyle,
  bold:     { fontFamily: 'Inter_700Bold'    } as TextStyle,
  extraBold:{ fontFamily: 'Inter_800ExtraBold'} as TextStyle,
}

// ─── Typography Scale ─────────────────────────────────────────────
//
//  H1 → H4 : Headings
//  Body L/M/S : Reading & UI text
//  Label / Caption / Micro : Supporting text
//  Button : CTA typography
//  Reading : In-module reading text (CRITICAL)
//  Stat : Numeric gamification
//  Marketing : Hero / onboarding
//  Overline : Section labels (uppercase)
//

export const typography: Record<string, TextStyle> = {

  // ── Headings ──────────────────────────────────────────────────
  h1: {
    fontFamily: 'Inter_700Bold',
    fontSize: 32, fontWeight: '700',
    lineHeight: 38, letterSpacing: -0.5,
  },
  h2: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 26, fontWeight: '600',
    lineHeight: 32, letterSpacing: -0.3,
  },
  h3: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 22, fontWeight: '600',
    lineHeight: 28, letterSpacing: -0.2,
  },
  h4: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20, fontWeight: '600',
    lineHeight: 26, letterSpacing: -0.1,
  },

  // ── Body ──────────────────────────────────────────────────────
  bodyLarge: {
    fontFamily: 'Inter_400Regular',
    fontSize: 18, fontWeight: '400',
    lineHeight: 28, letterSpacing: 0.1,
  },
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16, fontWeight: '400',
    lineHeight: 26, letterSpacing: 0.1,
  },
  bodyMedium: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16, fontWeight: '500',
    lineHeight: 26, letterSpacing: 0.1,
  },
  bodySemiBold: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16, fontWeight: '600',
    lineHeight: 26, letterSpacing: 0.1,
  },
  bodySmall: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14, fontWeight: '400',
    lineHeight: 22, letterSpacing: 0.1,
  },
  bodySmallMedium: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14, fontWeight: '500',
    lineHeight: 22, letterSpacing: 0.1,
  },

  // ── Labels & Captions ─────────────────────────────────────────
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14, fontWeight: '500',
    lineHeight: 20,
  },
  labelSmall: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12, fontWeight: '600',
    lineHeight: 18, letterSpacing: 0.5,
  },
  caption: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12, fontWeight: '400',
    lineHeight: 18,
  },
  captionMedium: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12, fontWeight: '600',
    lineHeight: 18,
  },
  micro: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10, fontWeight: '500',
    lineHeight: 14, letterSpacing: 0.4,
  },

  // ── Overline ──────────────────────────────────────────────────
  overline: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11, fontWeight: '700',
    lineHeight: 16, letterSpacing: 1.2,
    textTransform: 'uppercase',
  },

  // ── Buttons ───────────────────────────────────────────────────
  buttonPrimary: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16, fontWeight: '600',
    lineHeight: 22, letterSpacing: 0.5,
  },
  buttonSmall: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14, fontWeight: '600',
    lineHeight: 20, letterSpacing: 0.4,
  },

  // ── Marketing / Onboarding ─────────────────────────────────────
  hero: {
    fontFamily: 'Inter_700Bold',
    fontSize: 36, fontWeight: '700',
    lineHeight: 44, letterSpacing: -0.8,
  },
  heroSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 20, fontWeight: '400',
    lineHeight: 30, letterSpacing: 0,
  },
  display: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 48, fontWeight: '800',
    lineHeight: 56, letterSpacing: -1.2,
  },

  // ── Numeric / Stats ───────────────────────────────────────────
  statHero:   { fontFamily: 'Inter_800ExtraBold', fontSize: 48, fontWeight: '800', lineHeight: 56 },
  statLarge:  { fontFamily: 'Inter_700Bold',      fontSize: 32, fontWeight: '700', lineHeight: 38 },
  statMedium: { fontFamily: 'Inter_700Bold',      fontSize: 22, fontWeight: '700', lineHeight: 28 },
  statSmall:  { fontFamily: 'Inter_700Bold',      fontSize: 16, fontWeight: '700', lineHeight: 22 },

  // ── Code ──────────────────────────────────────────────────────
  code: {
    fontSize: 13, fontWeight: '400',
    lineHeight: 20,
  },
}

// ─── Reading Mode Typography (CRITICAL) ───────────────────────────
//
// Optimized for fixation efficiency & reduced eye fatigue.
// 85% of screen width max-line, 1.6 line-height, 0.2 letter-spacing.
//

export const READING_TYPOGRAPHY = {
  standard: {
    fontFamily:    'Inter_400Regular',
    fontSize:      18,
    lineHeight:    29,
    letterSpacing: 0.2,
    fontWeight:    '400' as TextStyle['fontWeight'],
  },
  large: {
    fontFamily:    'Inter_400Regular',
    fontSize:      20,
    lineHeight:    32,
    letterSpacing: 0.2,
    fontWeight:    '400' as TextStyle['fontWeight'],
  },
  rsvp: {
    fontFamily:    'Inter_700Bold',
    fontSize:      30,
    lineHeight:    40,
    letterSpacing: 0,
    fontWeight:    '700' as TextStyle['fontWeight'],
  },
  bionicNormal: {
    fontFamily:    'Inter_400Regular',
    fontSize:      18,
    lineHeight:    30,
    letterSpacing: 0.15,
    fontWeight:    '400' as TextStyle['fontWeight'],
  },
  bionicBold: {
    fontFamily:    'Inter_800ExtraBold',
    fontSize:      18,
    lineHeight:    30,
    letterSpacing: 0.15,
    fontWeight:    '800' as TextStyle['fontWeight'],
  },
  academic: {
    fontFamily:    'Inter_400Regular',
    fontSize:      17,
    lineHeight:    28,
    letterSpacing: 0.15,
    fontWeight:    '400' as TextStyle['fontWeight'],
  },
}

// Max reading width = 85% of screen
export const READING_MAX_WIDTH_RATIO   = 0.85
// Paragraph spacing = 1.2em
export const READING_PARAGRAPH_SPACING = 1.2
// Min accessible font size (WCAG)
export const MIN_FONT_SIZE             = 16

// ─── ORP (Optimal Recognition Point) Helper ───────────────────────
//
// Highlights the fixation point (35% of word) for faster recognition.
// Compatible with bionic reading and svr highlight modes.
//
export function buildORPWord(word: string): {
  prefix: string
  orp:    string
  suffix: string
} {
  const clean = word.replace(/[^a-zA-ZçÇğĞıİöÖşŞüÜ]/g, '')
  if (clean.length <= 1) return { prefix: '', orp: word, suffix: '' }
  const orpIdx = Math.floor(clean.length * 0.35)
  return {
    prefix: word.slice(0, orpIdx),
    orp:    word.slice(orpIdx, orpIdx + 1),
    suffix: word.slice(orpIdx + 1),
  }
}
