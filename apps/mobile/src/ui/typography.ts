/**
 * Sprinta Design System v1.0 — Typography Scale
 * H1/H2/H3 + body/small + legacy aliases
 */

export const T = {
  // ── Başlıklar ──────────────────────────────────
  h1: { fontSize: 28, fontWeight: '700' as const },   // Ekran başlığı
  h2: { fontSize: 22, fontWeight: '600' as const },   // Bölüm başlığı
  h3: { fontSize: 18, fontWeight: '600' as const },   // Kart başlığı

  // ── Gövde metni ────────────────────────────────
  body:  { fontSize: 16, fontWeight: '400' as const },
  small: { fontSize: 13, fontWeight: '400' as const },

  // ── Legacy aliases (geriye dönük uyumluluk) ────
  titleXL: { fontSize: 28, fontWeight: '700' as const },
  title:   { fontSize: 22, fontWeight: '700' as const },
  section: { fontSize: 16, fontWeight: '600' as const },
  label:   { fontSize: 14, fontWeight: '600' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
  micro:   { fontSize: 10, fontWeight: '600' as const },
} as const
