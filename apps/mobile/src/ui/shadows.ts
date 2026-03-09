/**
 * Sprinta Design System v1.0 — Shadow Presets
 * iOS shadow sistemi: shadowColor + offset + opacity + radius
 */

export const SH = {
  // Standart kart gölgesi: yumuşak, nötr
  card: {
    shadowColor:   '#000000',
    shadowOffset:  { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius:  20,
    elevation:     4,
  },
  // Orta yoğunluk: liste öğesi, mini kart
  soft: {
    shadowColor:   '#000000',
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius:  10,
    elevation:     2,
  },
  // Hero kart / CTA: marka mavisi glow
  hero: {
    shadowColor:   '#243C8F',
    shadowOffset:  { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius:  24,
    elevation:     10,
  },
  // Buton: aksan cyan glow
  accent: {
    shadowColor:   '#38B6D8',
    shadowOffset:  { width: 0, height: 6 },
    shadowOpacity: 0.40,
    shadowRadius:  14,
    elevation:     8,
  },
} as const
