/**
 * ChunkRSVP Engine — Saf TypeScript iş mantığı
 * Side effect yok, pure functions, Jest ile test edilebilir.
 */
import { calculateSessionARP } from '../../../../../../packages/shared/src/engine/arpCalculator'

// ─── Tipler ────────────────────────────────────────────────────────

export interface Chunk {
  words: string[]
  rawText: string
  hasPunctuation: boolean
  isParaStart: boolean
  isEndOfSentence: boolean
  difficulty: number       // 0-1 arası
  displayDuration: number  // ms (hesaplanmış)
}

export interface BionicWord {
  bold: string
  light: string
}

export interface ChunkRSVPSessionARP {
  rei: number
  csf: number
  arp: number
}

// ─── Türkçe noktalama & karakter setleri ───────────────────────────

const END_OF_SENTENCE = /[.!?…]$/
const PUNCTUATION     = /[,;:—–\-]$/
const TURKISH_CHARS   = /[a-zA-ZçÇğĞıİöÖşŞüÜ]/

// ─── 1. Metni chunk'lara böl ───────────────────────────────────────

export function tokenizeToChunks(text: string, chunkSize: number): Chunk[] {
  // Paragraflara ayır
  const paragraphs = text.split(/\n+/).filter((p) => p.trim().length > 0)
  const chunks: Chunk[] = []

  for (let pi = 0; pi < paragraphs.length; pi++) {
    const words = paragraphs[pi]
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0)

    for (let i = 0; i < words.length; i += chunkSize) {
      const slice = words.slice(i, i + chunkSize)
      const rawText = slice.join(' ')
      const lastWord = slice[slice.length - 1]
      const isParaStart = i === 0
      const isEndOfSentence = END_OF_SENTENCE.test(lastWord)
      const hasPunctuation = PUNCTUATION.test(lastWord) || isEndOfSentence

      // Zorluk: ortalama kelime uzunluğu & yabancı kelime tahmini
      const avgLen = slice.reduce((s, w) => s + w.replace(/[^a-zA-ZçÇğĞıİöÖşŞüÜ]/g, '').length, 0) / slice.length
      const foreignCount = slice.filter((w) => !TURKISH_CHARS.test(w)).length
      const lengthFactor = Math.min(1, avgLen / 10)
      const foreignFactor = foreignCount / slice.length
      const difficulty = Math.min(1, (lengthFactor * 0.6 + foreignFactor * 0.4))

      chunks.push({
        words: slice,
        rawText,
        hasPunctuation,
        isParaStart,
        isEndOfSentence,
        difficulty,
        displayDuration: 0, // sonradan hesaplanacak
      })
    }
  }

  return chunks
}

// ─── 2. Türkçe ORP (Optimal Recognition Point) ────────────────────
// Türkçe eklemeli dil — kök sol tarafta, pivot %35

export function calculateTurkishORP(word: string): number {
  const clean = word.replace(/[^a-zA-ZçÇğĞıİöÖşŞüÜ]/g, '')
  if (clean.length <= 1) return 0
  if (clean.length <= 2) return 0
  if (clean.length <= 4) return 1
  return Math.floor(clean.length * 0.35)
}

// ─── 3. displayDuration hesapla ───────────────────────────────────

export function calculateDuration(
  chunk: Chunk,
  wpm: number,
  smartSlowing: boolean
): number {
  const safeWpm = Math.max(60, wpm)
  const baseMs = (60_000 / safeWpm) * chunk.words.length

  if (!smartSlowing) return Math.round(baseMs)

  let multiplier = 1.0

  // Noktalama kuralları
  if (chunk.isEndOfSentence)  multiplier = Math.max(multiplier, 1.5)
  else if (chunk.hasPunctuation) multiplier = Math.max(multiplier, 1.3)
  if (chunk.isParaStart)      multiplier = Math.max(multiplier, 1.8)

  // Kelime zorluğu
  const avgLen = chunk.words.reduce(
    (s, w) => s + w.replace(/[^a-zA-ZçÇğĞıİöÖşŞüÜ]/g, '').length, 0
  ) / chunk.words.length
  if (avgLen > 8)             multiplier = Math.max(multiplier, 1.2)

  // Yabancı kelime tahmini
  const foreignCount = chunk.words.filter((w) => !TURKISH_CHARS.test(w)).length
  if (foreignCount > 0)       multiplier = Math.max(multiplier, 1.4)

  return Math.round(baseMs * multiplier)
}

// ─── 4. Chunk listesinin sürelerini hesapla (toplu) ───────────────

export function applyDurations(
  chunks: Chunk[],
  wpm: number,
  smartSlowing: boolean
): Chunk[] {
  return chunks.map((c) => ({
    ...c,
    displayDuration: calculateDuration(c, wpm, smartSlowing),
  }))
}

// ─── 5. Gerçek zamanlı WPM ────────────────────────────────────────

export function calculateRealTimeWPM(wordsRead: number, elapsedMs: number): number {
  if (elapsedMs <= 0) return 0
  return Math.round((wordsRead / elapsedMs) * 60_000)
}

// ─── 6. Rolling average WPM (son N chunk) ─────────────────────────

export function rollingAverageWPM(wpmHistory: number[], windowSize = 10): number {
  if (wpmHistory.length === 0) return 0
  const slice = wpmHistory.slice(-windowSize)
  return Math.round(slice.reduce((a, b) => a + b, 0) / slice.length)
}

// ─── 7. Seans ARP skoru ───────────────────────────────────────────

export function computeSessionARP(
  avgWPM: number,
  comprehensionScore: number,
  regressionCount: number,
  sessionDurationSec: number
): ChunkRSVPSessionARP {
  return calculateSessionARP({
    wpm: avgWPM,
    comprehension: comprehensionScore,
    regressionCount,
    durationSeconds: sessionDurationSec,
  })
}

// ─── 8. Bionic Reading ────────────────────────────────────────────
// İlk %40 bold, geri kalanı normal. ≤2 harf → tamamen bold.

export function applyBionicReading(word: string): BionicWord {
  const clean = word.replace(/[^a-zA-ZçÇğĞıİöÖşŞüÜ]/g, '')
  if (clean.length <= 2) return { bold: word, light: '' }
  const boldLen = Math.max(1, Math.ceil(clean.length * 0.4))
  return {
    bold: word.slice(0, boldLen),
    light: word.slice(boldLen),
  }
}

// ─── 9. Tahmini bitiş süresi ──────────────────────────────────────

export function estimateRemainingSeconds(
  remainingChunks: Chunk[],
  wpm: number
): number {
  const totalWords = remainingChunks.reduce((s, c) => s + c.words.length, 0)
  return Math.round((totalWords / Math.max(1, wpm)) * 60)
}

// ─── 10. XP hesapla ───────────────────────────────────────────────

export function calculateXP(
  arpScore: number,
  totalWords: number,
  bionicEnabled: boolean,
  sessionDurationSec: number
): number {
  const baseXP = Math.round(totalWords / 10)
  const arpBonus = Math.round(arpScore / 5)
  const durationBonus = Math.round(sessionDurationSec / 30)
  const bionicBonus = bionicEnabled ? 10 : 0
  return Math.min(500, baseXP + arpBonus + durationBonus + bionicBonus)
}
