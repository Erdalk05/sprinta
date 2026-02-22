/**
 * Son N session'ın ARP stabilite indeksini hesapla
 * 0 = çok tutarsız, 1 = çok tutarlı
 */
export function calculateStabilityIndex(arpHistory: number[]): number {
  if (arpHistory.length < 3) return 0.5

  const mean = arpHistory.reduce((a, b) => a + b, 0) / arpHistory.length
  if (mean === 0) return 0

  const variance =
    arpHistory.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) /
    arpHistory.length
  const stdDev = Math.sqrt(variance)

  const cv = stdDev / mean
  return parseFloat(Math.max(0, Math.min(1, 1 - cv)).toFixed(4))
}

/**
 * Baseline ARP'a kıyasla büyüme yüzdesi
 */
export function calculateGrowthScore(
  baselineArp: number,
  currentArp: number
): number {
  if (baselineArp === 0) return 0
  return parseFloat(
    (((currentArp - baselineArp) / baselineArp) * 100).toFixed(2)
  )
}

/**
 * Plato tespiti
 * Son N session'da ARP değişimi threshold'un altındaysa true
 */
export function detectPlateau(
  arpHistory: number[],
  threshold = 0.02
): boolean {
  if (arpHistory.length < 5) return false

  const recent = arpHistory.slice(-5)
  const max = Math.max(...recent)
  const min = Math.min(...recent)

  if (max === 0) return false
  return (max - min) / max < threshold
}

/**
 * Sürdürülebilir WPM (son session'ların medyanı)
 */
export function calculateSustainableWpm(wpmHistory: number[]): number {
  if (wpmHistory.length === 0) return 0

  const sorted = [...wpmHistory].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)

  if (sorted.length % 2 === 0) {
    return Math.round((sorted[mid - 1] + sorted[mid]) / 2)
  }
  return sorted[mid]
}
