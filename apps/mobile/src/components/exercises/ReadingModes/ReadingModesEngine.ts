/**
 * ReadingModesEngine.ts
 * 7 yeni okuma modu için saf TypeScript mantığı.
 * Side-effect yok, test edilebilir.
 */

// ─── Mod tanımları ─────────────────────────────────────────────────

export type ReadingModeKey =
  | 'timed'         // ⏱️ Zamanlı Okuma
  | 'academic'      // 📚 Akademik Mod
  | 'keyword'       // 🔍 Anahtar Kelime
  | 'memory'        // 🧠 Hafıza Sabitleme
  | 'prediction'    // 🔮 Tahmin Okuma
  | 'focus_filter'  // 🎯 Dikkat Filtresi
  | 'subvocal'      // 🤫 Sessiz Okuma

export interface ModeConfig {
  key:               ReadingModeKey
  icon:              string
  label:             string
  color:             string
  description:       string
  defaultWpm:        number
  timerSeconds?:     number  // timed modda varsayılan süre
  wordsPerBlock?:    number  // memory modda blok boyutu
  wordsPerLine?:     number  // academic modda satır boyutu
}

export const MODE_CONFIGS: Record<ReadingModeKey, ModeConfig> = {
  timed: {
    key: 'timed', icon: '⏱️', label: 'Zamanlı Okuma', color: '#EF4444',
    description: 'Süre bitmeden tüm metni oku — hız ve baskı altında performans',
    defaultWpm: 250, timerSeconds: 180,
  },
  academic: {
    key: 'academic', icon: '📚', label: 'Akademik Mod', color: '#3B82F6',
    description: 'Her satırı incelerek derin anlama — yavaş tempolu işleme',
    defaultWpm: 120, wordsPerLine: 8,
  },
  keyword: {
    key: 'keyword', icon: '🔍', label: 'Anahtar Kelime', color: '#8B5CF6',
    description: 'Metindeki kritik kelimeleri tarayarak yakala — tarama tekniği',
    defaultWpm: 200,
  },
  memory: {
    key: 'memory', icon: '🧠', label: 'Hafıza Sabitleme', color: '#06B6D4',
    description: 'Oku · Gizle · Hatırla döngüsü — spaced repetition temeli',
    defaultWpm: 200, wordsPerBlock: 40,
  },
  prediction: {
    key: 'prediction', icon: '🔮', label: 'Tahmin Okuma', color: '#A855F7',
    description: 'Cümle sonunu zihninde tamamla — anlamsal bağlantı geliştir',
    defaultWpm: 150,
  },
  focus_filter: {
    key: 'focus_filter', icon: '🎯', label: 'Dikkat Filtresi', color: '#10B981',
    description: 'Tek paragraf odağıyla çevresel dikkati filtrele',
    defaultWpm: 180,
  },
  subvocal: {
    key: 'subvocal', icon: '🤫', label: 'Sessiz Okuma', color: '#F59E0B',
    description: 'Görsel ritimle iç sesi bastır — subvokalizasyonu kır',
    defaultWpm: 350,
  },
}

// ─── Metin İşleme ──────────────────────────────────────────────────

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length
}

/** Paragrafları ayır — çok kısa paragrafları filtrele */
export function splitIntoParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}|\n/)
    .map(p => p.trim())
    .filter(p => countWords(p) >= 5)
}

/** Akademik mod için satırlara böl */
export function buildAcademicLines(text: string, wordsPerLine = 8): string[] {
  const words = text.trim().split(/\s+/).filter(w => w.length > 0)
  const lines: string[] = []
  for (let i = 0; i < words.length; i += wordsPerLine) {
    lines.push(words.slice(i, i + wordsPerLine).join(' '))
  }
  return lines
}

/** Anahtar kelime çıkar (frekans + uzunluk bazlı) */
export function extractKeywords(text: string, maxCount = 24): string[] {
  const STOP = new Set([
    'bir', 'bu', 'da', 'de', 'ile', 'için', 've', 'ya', 'veya',
    'gibi', 'çok', 'daha', 'en', 'her', 'hiç', 'ne', 'ki', 'mi',
    'mu', 'mü', 'o', 'şu', 'ben', 'sen', 'biz', 'siz', 'onlar',
    'ama', 'fakat', 'ise', 'var', 'yok', 'olan', 'oldu', 'edildi',
    'tarafından', 'göre', 'kadar', 'sonra', 'önce', 'ancak', 'çünkü',
  ])
  const freq: Record<string, number> = {}
  for (const raw of text.split(/\s+/)) {
    const w = raw.toLowerCase().replace(/[^a-zA-ZçÇğĞıİöÖşŞüÜ]/g, '')
    if (w.length < 5 || STOP.has(w)) continue
    freq[w] = (freq[w] || 0) + 1
  }
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxCount)
    .map(([w]) => w)
}

/** Hafıza blokları — N kelimelik parçalar */
export interface MemoryBlock {
  text:      string
  wordCount: number
}

export function buildMemoryBlocks(text: string, wordsPerBlock = 40): MemoryBlock[] {
  const words = text.trim().split(/\s+/).filter(w => w.length > 0)
  const blocks: MemoryBlock[] = []
  for (let i = 0; i < words.length; i += wordsPerBlock) {
    const slice = words.slice(i, i + wordsPerBlock)
    blocks.push({ text: slice.join(' '), wordCount: slice.length })
  }
  return blocks
}

/** Tahmin okuma cümleleri — son N kelimeyi gizle */
export interface PredictionItem {
  full:    string
  visible: string
  masked:  string
}

export function buildPredictionItems(text: string): PredictionItem[] {
  const sentences = text
    .replace(/\n+/g, ' ')
    .match(/[^.!?]+[.!?]+/g) ?? []

  return sentences
    .map(s => s.trim())
    .filter(s => countWords(s) >= 5)
    .slice(0, 25)
    .map(full => {
      const words     = full.split(/\s+/)
      const hideCount = Math.max(1, Math.min(3, Math.floor(words.length * 0.2)))
      return {
        full,
        visible: words.slice(0, words.length - hideCount).join(' '),
        masked:  words.slice(words.length - hideCount).join(' '),
      }
    })
}

/** Subvocal mod için RSVP chunk'ları */
export function buildRsvpChunks(text: string, groupSize = 1): string[] {
  const words = text.trim().split(/\s+/).filter(w => w.length > 0)
  const chunks: string[] = []
  for (let i = 0; i < words.length; i += groupSize) {
    chunks.push(words.slice(i, i + groupSize).join(' '))
  }
  return chunks
}

// ─── Seans Matematiği ─────────────────────────────────────────────

export function calcWPM(wordsRead: number, elapsedMs: number): number {
  if (elapsedMs <= 0) return 0
  return Math.round((wordsRead / elapsedMs) * 60_000)
}

/** Adaptif Reading Performance (0–400) */
export function calcARP(
  wpm:              number,
  comprehension:    number,  // 0–100
  regressionCount:  number,
  durationSec:      number,
): number {
  const wpmFactor  = Math.min(wpm / 250, 2)
  const compFactor = Math.max(0, comprehension) / 100
  const regPenalty = Math.max(0.5, 1 - regressionCount * 0.04)
  const durBonus   = Math.min(1.25, 1 + durationSec / 600)
  return Math.min(400, Math.round(wpmFactor * compFactor * regPenalty * durBonus * 100))
}

/** XP hesapla (0–500) */
export function calcXP(
  arpScore:   number,
  totalWords: number,
  durationSec: number,
): number {
  const base     = Math.round(totalWords / 12)
  const arpBonus = Math.round(arpScore / 4)
  const durBonus = Math.round(durationSec / 30)
  return Math.min(500, base + arpBonus + durBonus)
}

/** Süre formatla */
export function formatDuration(seconds: number): string {
  const m  = Math.floor(seconds / 60)
  const ss = seconds % 60
  return `${m}dk ${ss.toString().padStart(2, '0')}sn`
}
