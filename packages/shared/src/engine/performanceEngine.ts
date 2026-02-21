import { calculateSessionARP } from './arpCalculator'
import { detectFatigue, estimateFatigueIndex } from './fatigueDetector'
import { adaptDifficulty } from './difficultyAdapter'
import { calculateStabilityIndex } from './stabilityAnalyzer'
import { recommendModule } from './modeRecommender'
import type { SessionMetrics, PerformanceResult, CognitiveProfile } from '../types/engine'

/**
 * Bir session'ın tüm performans metriklerini hesaplar.
 * Yan etkisiz, saf fonksiyon.
 */
export function processSession(
  metrics: SessionMetrics,
  profile: CognitiveProfile,
  arpHistory: number[] = []
): PerformanceResult {
  // 1. ARP hesapla
  const fatigueIndex = metrics.firstHalfMetrics && metrics.secondHalfMetrics
    ? 0  // detectFatigue'dan gelecek, aşağıda hesaplanıyor
    : estimateFatigueIndex(metrics.durationSeconds / 60, metrics.score)

  const { rei, csf, arp } = calculateSessionARP({
    wpm: metrics.wpm,
    comprehension: metrics.comprehension,
    errorsPerMinute: metrics.errorsPerMinute,
    regressionCount: metrics.regressionCount,
    durationSeconds: metrics.durationSeconds,
    fatigueIndex,
  })

  // 2. Yorgunluk tespiti
  let fatigueScore = 0
  let fatigueLevel: PerformanceResult['fatigueLevel'] = 'fresh'
  let shouldTakeBreak = false

  if (metrics.firstHalfMetrics && metrics.secondHalfMetrics) {
    const fatigue = detectFatigue({
      firstHalf: metrics.firstHalfMetrics,
      secondHalf: metrics.secondHalfMetrics,
      responseTimes: metrics.responseTimesMs,
    })
    fatigueScore = fatigue.score
    fatigueLevel = fatigue.level
    shouldTakeBreak = fatigue.shouldBreak
  } else {
    const fi = estimateFatigueIndex(metrics.durationSeconds / 60, metrics.score)
    fatigueScore = Math.round(fi * 100)
    fatigueLevel = fatigueScore < 15 ? 'fresh' : fatigueScore < 30 ? 'mild' : fatigueScore < 50 ? 'moderate' : fatigueScore < 70 ? 'fatigued' : 'exhausted'
    shouldTakeBreak = fatigueScore >= 50
  }

  // 3. Zorluk adaptasyonu
  const suggestedDifficulty = adaptDifficulty(
    metrics.difficultyLevel,
    metrics.score,
    metrics.comprehension,
    fatigueScore
  )

  // 4. Stabilite indeksi
  const stabilityIndex = arpHistory.length >= 3
    ? calculateStabilityIndex([...arpHistory, arp])
    : profile.stabilityIndex

  // 5. ARP değişimi
  const previousArp = arpHistory.length > 0 ? arpHistory[arpHistory.length - 1] : profile.sustainableWpm
  const arpChange = previousArp > 0 ? arp - previousArp : 0

  // 6. Mod önerisi (sadece düşük performansta)
  const recommendedMode = (metrics.score < 70 || metrics.comprehension < 75)
    ? recommendModule(profile)
    : null

  // 7. XP hesapla
  const xpEarned = calculateXP({
    arp,
    score: metrics.score,
    comprehension: metrics.comprehension,
    fatigueScore,
    durationSeconds: metrics.durationSeconds,
    difficultyLevel: metrics.difficultyLevel,
  })

  return {
    rei,
    csf,
    arp,
    fatigueScore,
    fatigueLevel,
    shouldTakeBreak,
    suggestedDifficulty,
    recommendedMode,
    arpChange,
    stabilityIndex,
    xpEarned,
  }
}

/**
 * XP hesaplama — zorluk, süre ve performansa göre ödül
 */
export function calculateXP(params: {
  arp: number
  score: number
  comprehension: number
  fatigueScore: number
  durationSeconds: number
  difficultyLevel: number
}): number {
  const { score, comprehension, fatigueScore, durationSeconds, difficultyLevel } = params

  // Temel XP (puan + anlama ortalaması)
  const baseXP = Math.round((score + comprehension) / 2)

  // Zorluk çarpanı (1.0x - 1.5x)
  const difficultyMultiplier = 1 + (difficultyLevel - 1) * 0.05

  // Süre bonusu (dakika başı küçük ek)
  const durationBonus = Math.min(20, Math.floor(durationSeconds / 60) * 2)

  // Yorgunluk cezası (çok yorgunsa XP düşer)
  const fatiguePenalty = fatigueScore >= 70 ? 0.8 : fatigueScore >= 50 ? 0.9 : 1.0

  const xp = Math.round(baseXP * difficultyMultiplier * fatiguePenalty + durationBonus)
  return Math.max(5, Math.min(500, xp))
}
