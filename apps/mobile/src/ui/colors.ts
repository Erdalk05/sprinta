/**
 * Sprinta Design System v1.0 — Color Tokens
 * Primary #243C8F · Accent #38B6D8 · BG #0F1F4B
 */

export const C = {
  // ── Ana arka planlar ──────────────────────────────
  bg:          '#0F1F4B',   // Deep Navy — ana arka plan
  surface:     '#FFFFFF',   // Kart yüzeyi — beyaz
  surfaceAlt:  '#162449',   // Koyu kart (immersive ekranlar)
  surfaceHigh: '#1E2E5C',   // Elevated koyu kart

  // ── Marka renkleri ───────────────────────────────
  primary:     '#243C8F',              // Ana marka mavisi
  accent:      '#38B6D8',              // Aksan cyan-mavi
  accentLight: '#4FD1FF',              // Açık aksan
  accentGlow:  'rgba(56,182,216,0.15)',// Soft glow bg

  // ── Durum renkleri ───────────────────────────────
  success: '#3DDC84',
  warning: '#F5A623',
  danger:  '#EF4444',
  gold:    '#FFD700',

  // ── Metin (beyaz kart üzerinde) ──────────────────
  text:     '#1C1E21',
  textSec:  '#6B7A99',
  textHint: 'rgba(28,30,33,0.40)',

  // ── Metin (koyu arka plan üzerinde) ──────────────
  textOnDark:     '#FFFFFF',
  textSecOnDark:  'rgba(255,255,255,0.75)',
  textHintOnDark: 'rgba(255,255,255,0.45)',

  // ── Kenarlık ────────────────────────────────────
  border:       '#E5ECFF',
  borderAccent: 'rgba(56,182,216,0.35)',

  // ── Yardımcılar ─────────────────────────────────
  overlay: 'rgba(0,0,0,0.5)',
} as const
