import type { FatigueResult } from '../types/engine'

/**
 * Session içi yorgunluk tespiti
 * İlk yarı vs ikinci yarı performans karşılaştırması
 */
export function detectFatigue(input: {
  firstHalf: { wpm: number; accuracy: number }
  secondHalf: { wpm: number; accuracy: number }
  responseTimes?: number[]
}): FatigueResult {
  const { firstHalf, secondHalf } = input

  // WPM düşüşü (%)
  const wpmDrop =
    firstHalf.wpm > 0
      ? Math.max(0, ((firstHalf.wpm - secondHalf.wpm) / firstHalf.wpm) * 100)
      : 0

  // Doğruluk düşüşü (%)
  const accuracyDrop =
    firstHalf.accuracy > 0
      ? Math.max(
          0,
          ((firstHalf.accuracy - secondHalf.accuracy) / firstHalf.accuracy) * 100
        )
      : 0

  // Yanıt süresi artışı (%) — varsa
  let responseTimeIncrease = 0
  if (input.responseTimes && input.responseTimes.length >= 4) {
    const times = input.responseTimes
    const mid = Math.floor(times.length / 2)
    const firstAvg = average(times.slice(0, mid))
    const secondAvg = average(times.slice(mid))
    if (firstAvg > 0) {
      responseTimeIncrease = Math.max(
        0,
        ((secondAvg - firstAvg) / firstAvg) * 100
      )
    }
  }

  // Ağırlıklı yorgunluk skoru (0-100)
  const fatigueScore = Math.min(
    100,
    Math.round(wpmDrop * 0.4 + accuracyDrop * 0.35 + responseTimeIncrease * 0.25)
  )

  return buildFatigueResult(fatigueScore)
}

/**
 * Basit yorgunluk tahmini (session yarıları yoksa)
 */
export function estimateFatigueIndex(
  durationMinutes: number,
  finalScore: number
): number {
  const durationFactor = Math.min(1, durationMinutes / 45)
  const scoreFactor = Math.max(0, (70 - finalScore) / 70)
  return durationFactor * 0.4 + scoreFactor * 0.6
}

function buildFatigueResult(fatigueScore: number): FatigueResult {
  if (fatigueScore < 15) {
    return { score: fatigueScore, level: 'fresh', shouldBreak: false, estimatedRecoveryMinutes: 0 }
  } else if (fatigueScore < 30) {
    return { score: fatigueScore, level: 'mild', shouldBreak: false, estimatedRecoveryMinutes: 5 }
  } else if (fatigueScore < 50) {
    return { score: fatigueScore, level: 'moderate', shouldBreak: false, estimatedRecoveryMinutes: 10 }
  } else if (fatigueScore < 70) {
    return { score: fatigueScore, level: 'fatigued', shouldBreak: true, estimatedRecoveryMinutes: 15 }
  } else {
    return { score: fatigueScore, level: 'exhausted', shouldBreak: true, estimatedRecoveryMinutes: 30 }
  }
}

function average(arr: number[]): number {
  if (arr.length === 0) return 0
  return arr.reduce((a, b) => a + b, 0) / arr.length
}
