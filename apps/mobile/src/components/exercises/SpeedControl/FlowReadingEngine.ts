/**
 * FlowReading Engine — Saf TypeScript iş mantığı
 * Side effect yok, pure functions, Jest ile test edilebilir.
 * ChunkRSVPEngine ile tutarlı pattern.
 */
import { calculateSessionARP } from '../../../../../../packages/shared/src/engine/arpCalculator'

// ─── Tipler ────────────────────────────────────────────────────────

export interface TextLine {
  id: number
  text: string
  words: string[]
  wordCount: number
  isParaStart: boolean
  isParaEnd: boolean
  hasPunctuation: boolean
  endsWithSentence: boolean
  difficulty: number          // 0-1
  estimatedReadMs: number     // hesaplanmış
}

export interface CursorKeyframe {
  xPercent: number
  timeOffset: number          // ms, 0'dan başlar
  speed: 'normal' | 'slow' | 'pause'
}

export interface HighlightState {
  lineIndex: number
  startWord: number
  endWord: number             // vurgulanan kelime aralığı
  opacity: number             // 0-1
}

export interface FlowReadingSessionARP {
  rei: number
  csf: number
  arp: number
}

// ─── Türkçe noktalama & karakter setleri ───────────────────────────

const END_OF_SENTENCE = /[.!?…]$/
const PUNCTUATION     = /[,;:—–\-]$/
const TURKISH_CHARS   = /[a-zA-ZçÇğĞıİöÖşŞüÜ]/

// ─── 1. Metni satırlara böl ────────────────────────────────────────

export function parseTextToLines(
  text: string,
  wordsPerLine: number = 10,
): TextLine[] {
  const paragraphs = text.split(/\n+/).filter((p) => p.trim().length > 0)
  const lines: TextLine[] = []
  let lineId = 0

  for (let pi = 0; pi < paragraphs.length; pi++) {
    const words = paragraphs[pi]
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0)

    const lineCount = Math.ceil(words.length / wordsPerLine)

    for (let li = 0; li < lineCount; li++) {
      const slice = words.slice(li * wordsPerLine, (li + 1) * wordsPerLine)
      const lastWord = slice[slice.length - 1]
      const firstLine = li === 0
      const lastLine  = li === lineCount - 1

      const endsWithSentence = END_OF_SENTENCE.test(lastWord)
      const hasPunctuation   = PUNCTUATION.test(lastWord) || endsWithSentence

      // Zorluk hesabı — ChunkRSVP Engine ile aynı
      const avgLen = slice.reduce(
        (s, w) => s + w.replace(/[^a-zA-ZçÇğĞıİöÖşŞüÜ]/g, '').length, 0
      ) / slice.length
      const foreignCount  = slice.filter((w) => !TURKISH_CHARS.test(w)).length
      const lengthFactor  = Math.min(1, avgLen / 10)
      const foreignFactor = foreignCount / slice.length
      const difficulty    = Math.min(1, lengthFactor * 0.6 + foreignFactor * 0.4)

      lines.push({
        id: lineId++,
        text: slice.join(' '),
        words: slice,
        wordCount: slice.length,
        isParaStart: firstLine,
        isParaEnd: lastLine,
        hasPunctuation,
        endsWithSentence,
        difficulty,
        estimatedReadMs: 0, // sonradan doldurulur
      })
    }
  }

  return lines
}

// ─── 2. Satır okuma süresini hesapla ──────────────────────────────

export function calculateLineDuration(
  line: TextLine,
  wpm: number,
  mode: 'sprint' | 'cruise',
  smartSlowing: boolean,
): number {
  const safeWpm = Math.max(60, wpm)
  const baseMs  = (line.wordCount / safeWpm) * 60_000

  if (!smartSlowing) {
    return Math.round(mode === 'cruise' ? baseMs * 1.2 : baseMs)
  }

  let multiplier = mode === 'cruise' ? 1.2 : 1.0

  if (line.isParaStart)        multiplier = Math.max(multiplier, 1.8)
  if (line.isParaEnd)          multiplier = Math.max(multiplier, 1.6)
  if (line.endsWithSentence)   multiplier = Math.max(multiplier, 1.5)
  else if (line.hasPunctuation) multiplier = Math.max(multiplier, 1.25)
  if (line.difficulty > 0.7)   multiplier = Math.max(multiplier, 1.3)

  if (mode === 'cruise') multiplier *= 1.2

  return Math.round(baseMs * multiplier)
}

// ─── 3. Satır sürelerini toplu hesapla ────────────────────────────

export function applyLineDurations(
  lines: TextLine[],
  wpm: number,
  mode: 'sprint' | 'cruise',
  smartSlowing: boolean,
): TextLine[] {
  return lines.map((l) => ({
    ...l,
    estimatedReadMs: calculateLineDuration(l, wpm, mode, smartSlowing),
  }))
}

// ─── 4. Cursor keyframe path'i hesapla ────────────────────────────

export function calculateCursorPath(
  line: TextLine,
  durationMs: number,
): CursorKeyframe[] {
  if (line.words.length === 0) {
    return [{ xPercent: 0, timeOffset: 0, speed: 'normal' },
            { xPercent: 100, timeOffset: durationMs, speed: 'normal' }]
  }

  const keyframes: CursorKeyframe[] = [
    { xPercent: 0, timeOffset: 0, speed: 'normal' },
  ]

  const wordStep = 100 / line.words.length
  let elapsed    = 0

  for (let i = 0; i < line.words.length; i++) {
    const word        = line.words[i]
    const isLast      = i === line.words.length - 1
    const wordMs      = durationMs / line.words.length
    const hasPunct    = PUNCTUATION.test(word) || END_OF_SENTENCE.test(word)
    const isEndOfSent = END_OF_SENTENCE.test(word)

    elapsed += wordMs

    let speed: 'normal' | 'slow' | 'pause' = 'normal'
    if (isEndOfSent) speed = 'pause'
    else if (hasPunct) speed = 'slow'

    keyframes.push({
      xPercent: isLast ? 100 : (i + 1) * wordStep,
      timeOffset: elapsed,
      speed,
    })
  }

  return keyframes
}

// ─── 5. Gerçek zamanlı WPM ────────────────────────────────────────

export function calculateRealTimeWPM(wordsRead: number, elapsedMs: number): number {
  if (elapsedMs <= 0) return 0
  return Math.round((wordsRead / elapsedMs) * 60_000)
}

// ─── 6. Rolling average WPM (son N satır) ─────────────────────────

export function rollingAverageWPM(wpmHistory: number[], windowSize = 10): number {
  if (wpmHistory.length === 0) return 0
  const slice = wpmHistory.slice(-windowSize)
  return Math.round(slice.reduce((a, b) => a + b, 0) / slice.length)
}

// ─── 7. Regresyon tespit ───────────────────────────────────────────

export function detectRegression(
  previousLineIndex: number,
  currentLineIndex: number,
): boolean {
  return currentLineIndex < previousLineIndex
}

// ─── 8. Seans ARP skoru ───────────────────────────────────────────

export function computeFlowSessionARP(
  avgWPM: number,
  comprehensionScore: number,
  regressionCount: number,
  sessionDurationSec: number,
): FlowReadingSessionARP {
  return calculateSessionARP({
    wpm: avgWPM,
    comprehension: comprehensionScore,
    regressionCount,
    durationSeconds: sessionDurationSec,
  })
}

// ─── 9. Vurgulama durumu hesabı ────────────────────────────────────

export function calculateHighlightState(
  lineIndex: number,
  progressPercent: number,
  words: string[],
): HighlightState {
  const endWord = Math.round((progressPercent / 100) * words.length)
  return {
    lineIndex,
    startWord: 0,
    endWord: Math.min(endWord, words.length),
    opacity: 0.85,
  }
}

// ─── 10. Tahmini kalan süre ────────────────────────────────────────

export function estimateRemainingSeconds(
  remainingLines: TextLine[],
  wpm: number,
): number {
  const totalWords = remainingLines.reduce((s, l) => s + l.wordCount, 0)
  return Math.round((totalWords / Math.max(1, wpm)) * 60)
}

// ─── 11. XP hesapla (ChunkRSVP ile aynı formül) ───────────────────

export function calculateXP(
  arpScore: number,
  totalWords: number,
  sessionDurationSec: number,
): number {
  const baseXP     = Math.round(totalWords / 10)
  const arpBonus   = Math.round(arpScore / 5)
  const durBonus   = Math.round(sessionDurationSec / 30)
  return Math.min(500, baseXP + arpBonus + durBonus)
}
