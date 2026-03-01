// =====================================================================
// FixationTrainerEngine.ts — Sprint 11
// Göz Genişliği (Visual Span) Antrenman Motoru
//
// Bilimsel temel:
//   • Ortalama okuyucu: 1.1 kelime/fiksasyon
//   • Elite hızlı okuyucu: 3–5 kelime/fiksasyon
//   • Bu antrenman: flash → tanı → genişlet
//
// Algoritma:
//   flash(N kelime, Xms) → 4 seçenek → doğru/yanlış
//   ≥ %80 doğruluk → span++   (max 5)
//   < %50 doğruluk → span--   (min 1)
//
// Pure TypeScript — React/RN bağımlılığı yok.
// =====================================================================

export const MAX_SPAN = 5
export const MIN_SPAN = 1

// ─── Tipler ──────────────────────────────────────────────────────

export interface FixationItem {
  id:           number
  words:        string[]          // Ekranda flash olacak N kelime
  options:      string[][]        // 4 seçenek (her biri N kelimeli grup)
  correctIndex: number            // 0-3
  flashMs:      number            // Kaç ms gösterilecek
}

export interface FixationResult {
  fixationId:  number
  isCorrect:   boolean
  responseMs:  number             // Kullanıcı ne kadar sürede cevap verdi
}

export interface FixationSessionSummary {
  spanLevel:      number
  totalFixations: number
  correctCount:   number
  accuracy:       number          // 0.0 – 1.0
  effectiveWPM:   number
  avgResponseMs:  number
  newSpanLevel:   number
  xpEarned:       number
  levelChanged:   boolean
  levelDirection: 'up' | 'down' | 'same'
}

// ─── Sabitleri ───────────────────────────────────────────────────

// Flash süresi: span büyüdükçe biraz daha uzun
const FLASH_MS: Record<number, number> = {
  1: 180,
  2: 260,
  3: 340,
  4: 420,
  5: 500,
}

// Her seviyenin hedef WPM değeri
export const SPAN_WPM: Record<number, number> = {
  1: 280,
  2: 420,
  3: 580,
  4: 720,
  5: 900,
}

export const SPAN_LABELS: Record<number, string> = {
  1: 'Başlangıç',
  2: 'Temel',
  3: 'Orta',
  4: 'İleri',
  5: 'Uzman',
}

export const SPAN_DESCRIPTION: Record<number, string> = {
  1: 'Her seferinde 1 kelime flash — temelden başlıyoruz',
  2: '2 kelimelik gruplar — göz alışıyor',
  3: '3 kelimelik gruplar — usta okuyucu sınırı',
  4: '4 kelimelik gruplar — elit okuyucu bölgesi',
  5: '5 kelimelik gruplar — hızlı okuma uzmanı',
}

export const SPAN_COLORS: Record<number, string> = {
  1: '#6B7280',
  2: '#3B82F6',
  3: '#8B5CF6',
  4: '#F59E0B',
  5: '#10B981',
}

// ─── Yardımcı Fonksiyonlar ────────────────────────────────────────

export function getFlashMs(span: number): number {
  return FLASH_MS[Math.max(MIN_SPAN, Math.min(MAX_SPAN, span))] ?? 340
}

function tokenize(text: string): string[] {
  return text
    .replace(/[^\wığüşöçĞÜŞÖÇİ\s]/g, ' ')
    .split(/\s+/)
    .map(w => w.trim())
    .filter(w => w.length > 1)
}

// N kelimeden 3 farklı distraktör grubu üret
function buildDistractors(
  allWords: string[],
  target:   string[],
  span:     number,
  count = 3,
): string[][] {
  const distrs: string[][] = []
  const used = new Set<string>([target.join('|')])
  let tries = 0

  while (distrs.length < count && tries < 300) {
    tries++
    const start = Math.floor(Math.random() * Math.max(1, allWords.length - span))
    const cand  = allWords.slice(start, start + span)
    if (cand.length < span) continue
    const key = cand.join('|')
    if (!used.has(key)) {
      used.add(key)
      distrs.push(cand)
    }
  }

  // Yeterli distraktör bulunamamışsa rastgele kelimelerle tamamla
  while (distrs.length < count) {
    const shuffled = [...allWords].sort(() => Math.random() - 0.5)
    distrs.push(shuffled.slice(0, span))
  }

  return distrs
}

// ─── Ana Fonksiyonlar ─────────────────────────────────────────────

/**
 * Verilen metinden `count` adet FixationItem üretir.
 * Her item: doğru kelime grubu + 3 distraktör (4 seçenek).
 */
export function buildFixations(
  text:  string,
  span:  number,
  count: number = 20,
): FixationItem[] {
  const words = tokenize(text)
  if (words.length < span * 4) return []

  const items: FixationItem[]    = []
  const step  = Math.max(1, Math.floor((words.length - span) / count))

  for (let i = 0; i < count; i++) {
    const start  = (i * step) % Math.max(1, words.length - span)
    const target = words.slice(start, start + span)
    if (target.length < span) continue

    const distractors  = buildDistractors(words, target, span)
    const correctIndex = Math.floor(Math.random() * 4)
    const options: string[][] = []
    let dIdx = 0
    for (let j = 0; j < 4; j++) {
      options.push(j === correctIndex ? target : (distractors[dIdx++] ?? target))
    }

    items.push({
      id:           i,
      words:        target,
      options,
      correctIndex,
      flashMs:      getFlashMs(span),
    })
  }

  return items
}

/**
 * Sonuçlara göre yeni span seviyesi hesapla.
 */
export function calculateNextSpan(
  results:     FixationResult[],
  currentSpan: number,
): { newSpan: number; direction: 'up' | 'down' | 'same' } {
  if (results.length === 0) return { newSpan: currentSpan, direction: 'same' }

  const accuracy = results.filter(r => r.isCorrect).length / results.length

  if (accuracy >= 0.80 && currentSpan < MAX_SPAN) return { newSpan: currentSpan + 1, direction: 'up' }
  if (accuracy <  0.50 && currentSpan > MIN_SPAN) return { newSpan: currentSpan - 1, direction: 'down' }
  return { newSpan: currentSpan, direction: 'same' }
}

/**
 * Oturum özetini hesapla.
 */
export function buildSessionSummary(
  results:     FixationResult[],
  spanLevel:   number,
  totalMs:     number,
): FixationSessionSummary {
  const correct  = results.filter(r => r.isCorrect).length
  const total    = results.length
  const accuracy = total > 0 ? correct / total : 0

  const { newSpan, direction } = calculateNextSpan(results, spanLevel)

  const totalWords   = spanLevel * total
  const minutes      = totalMs / 60_000
  const effectiveWPM = minutes > 0 ? Math.round(totalWords / minutes) : 0

  const avgResponseMs = total > 0
    ? Math.round(results.reduce((s, r) => s + r.responseMs, 0) / total)
    : 0

  // XP: temel 15 + doğruluk bonusu + span bonusu + hız bonusu
  const xpEarned = Math.round(
    15 +
    accuracy * 25 +
    spanLevel * 5 +
    (avgResponseMs < 800 ? 5 : 0),
  )

  return {
    spanLevel,
    totalFixations: total,
    correctCount:   correct,
    accuracy,
    effectiveWPM,
    avgResponseMs,
    newSpanLevel:  newSpan,
    xpEarned,
    levelChanged:  direction !== 'same',
    levelDirection: direction,
  }
}
