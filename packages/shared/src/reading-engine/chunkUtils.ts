// =====================================================
// Reading Engine v2 — Chunk Yardımcı Fonksiyonlar
//
// Saf (pure) fonksiyonlar — yan etki yok, test edilebilir.
// ChunkRSVPEngine'deki tokenizeToChunks ile paralel çalışır,
// onu değiştirmez. Bu fonksiyonlar ReadingEngine sınıfı için
// soyutlama katmanı görevi görür.
// =====================================================

import type { TextChunk, ReadingEngineConfig } from './types'

const MIN_INTERVAL_MS = 100
const MAX_INTERVAL_MS = 5000

/**
 * Metni groupSize kelimelik TextChunk dizisine böler.
 * - Satır sonları ve fazla boşluklar normalize edilir.
 * - Noktalama işaretleri kelimelerin içinde korunur.
 * - groupSize 1–7 arasında clamp edilir.
 */
export function splitIntoChunks(text: string, groupSize: number): TextChunk[] {
  const normalized = text
    .replace(/\r\n|\r|\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const words = normalized.split(' ').filter(w => w.length > 0)
  const effectiveGroupSize = Math.max(1, Math.min(7, groupSize))
  const chunks: TextChunk[] = []

  for (let i = 0; i < words.length; i += effectiveGroupSize) {
    const sliced = words.slice(i, i + effectiveGroupSize)
    chunks.push({
      index: chunks.length,
      words: sliced,
      displayText: sliced.join(' '),
      intervalMs: 0, // applyModeAdjustments tarafından doldurulur
    })
  }

  return chunks
}

/**
 * WPM ve groupSize'a göre chunk gösterim süresini (ms) hesaplar.
 *
 * Formül: (groupSize / wpm) * 60 * 1000
 * Örnek: wpm=300, groupSize=2 → (2/300)*60000 = 400ms
 *
 * Sınırlar: [100ms, 5000ms]
 */
export function calculateIntervalMs(wpm: number, groupSize: number): number {
  const safeWpm = Math.max(1, wpm)
  const safeGroupSize = Math.max(1, groupSize)
  const raw = (safeGroupSize / safeWpm) * 60 * 1000
  return Math.max(MIN_INTERVAL_MS, Math.min(MAX_INTERVAL_MS, Math.round(raw)))
}

/**
 * Okuma moduna göre chunk intervallarını ayarlar.
 *
 * - academicMode true → tüm chunk'lar %20 daha uzun
 *   (ağır akademik metinler için işlem süresi artar)
 * - focusMode true → her 5. chunk %10 daha kısa
 *   (dikkat egzersizi için ritim değişimi yaratır)
 * - Her iki mod birlikte aktif olabilir (önce academic, sonra focus)
 * - Diğer modlarda chunk'lara dokunulmaz
 *
 * intervalMs sonuçları [100ms, 5000ms] aralığında clamp edilir.
 */
export function applyModeAdjustments(
  chunks: TextChunk[],
  config: ReadingEngineConfig,
): TextChunk[] {
  const baseInterval = calculateIntervalMs(config.wpm, config.groupSize ?? 2)

  return chunks.map(chunk => {
    let interval = baseInterval

    if (config.academicMode) {
      interval = Math.round(interval * 1.2)
    }

    // Her 5. chunk'ta (index 4, 9, 14...) ritim kır
    if (config.focusMode && (chunk.index + 1) % 5 === 0) {
      interval = Math.round(interval * 0.9)
    }

    return {
      ...chunk,
      intervalMs: Math.max(MIN_INTERVAL_MS, Math.min(MAX_INTERVAL_MS, interval)),
    }
  })
}
