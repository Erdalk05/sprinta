import { EXAM_ARP_TARGETS } from '../types/engine'

/**
 * REI — Okuma Verimliliği İndeksi
 * REI = sustainable_wpm × (comprehension / 100)
 */
export function calculateREI(wpm: number, comprehension: number): number {
  const clampedComp = Math.max(0, Math.min(100, comprehension))
  return Math.round(wpm * (clampedComp / 100))
}

/**
 * CSF — Bilişsel Stabilite Faktörü (0.0 - 1.0)
 * CSF = 1 − (error_rate + regression_rate + fatigue_index) / 3
 */
export function calculateCSF(
  errorRate: number,      // 0-1
  regressionRate: number, // 0-1
  fatigueIndex: number    // 0-1
): number {
  const clamp = (v: number) => Math.max(0, Math.min(1, v))
  const avg = (clamp(errorRate) + clamp(regressionRate) + clamp(fatigueIndex)) / 3
  return parseFloat(Math.max(0, Math.min(1, 1 - avg)).toFixed(4))
}

/**
 * ARP — Gelişmiş Okuma Performansı
 * ARP = REI × CSF
 */
export function calculateARP(rei: number, csf: number): number {
  return Math.round(rei * csf)
}

/**
 * Session metriklerinden tam ARP hesapla
 */
export function calculateSessionARP(metrics: {
  wpm: number
  comprehension: number
  errorsPerMinute?: number
  regressionCount?: number
  durationSeconds?: number
  fatigueIndex?: number
}): { rei: number; csf: number; arp: number } {
  const { wpm, comprehension } = metrics

  // Error rate: dakika başı hatayı 0-1 normalize (10 hata/dk = max)
  const errorRate = metrics.errorsPerMinute
    ? Math.min(1, metrics.errorsPerMinute / 10)
    : 0

  // Regression rate: dakika başı geriye dönüş (5 = max)
  const regressionRate =
    metrics.regressionCount && metrics.durationSeconds
      ? Math.min(1, metrics.regressionCount / (metrics.durationSeconds / 60) / 5)
      : 0

  const fatigueIndex = metrics.fatigueIndex ?? 0

  const rei = calculateREI(wpm, comprehension)
  const csf = calculateCSF(errorRate, regressionRate, fatigueIndex)
  const arp = calculateARP(rei, csf)

  return { rei, csf, arp }
}

/**
 * ARP'ın sınav hedefine yakınlığını hesapla
 */
export function calculateExamProgress(
  currentArp: number,
  examTarget: string
): {
  progressPercent: number
  remainingArp: number
  level: 'below' | 'min' | 'target' | 'elite'
} {
  const targets = EXAM_ARP_TARGETS[examTarget] ?? EXAM_ARP_TARGETS.other

  const remainingArp = Math.max(0, targets.target - currentArp)
  const progressPercent = Math.min(
    100,
    Math.round((currentArp / targets.target) * 100)
  )

  let level: 'below' | 'min' | 'target' | 'elite'
  if (currentArp >= targets.elite) level = 'elite'
  else if (currentArp >= targets.target) level = 'target'
  else if (currentArp >= targets.min) level = 'min'
  else level = 'below'

  return { progressPercent, remainingArp, level }
}
