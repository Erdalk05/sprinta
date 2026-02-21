import { processSession, calculateXP } from '../performanceEngine'
import type { SessionMetrics, CognitiveProfile } from '../../types/engine'

const baseProfile: CognitiveProfile = {
  sustainableWpm: 180,
  peakWpm: 220,
  comprehensionBaseline: 75,
  stabilityIndex: 0.7,
  fatigueThreshold: 50,
  speedSkill: 60,
  comprehensionSkill: 75,
  attentionSkill: 70,
  primaryWeakness: null,
  secondaryWeakness: null,
}

const baseMetrics: SessionMetrics = {
  wpm: 200,
  comprehension: 80,
  accuracy: 88,
  score: 82,
  durationSeconds: 300,
  exerciseType: 'chunk_reading',
  moduleCode: 'speed_control',
  difficultyLevel: 5,
}

describe('processSession', () => {
  it('geçerli PerformanceResult döner', () => {
    const result = processSession(baseMetrics, baseProfile, [160, 165, 170])
    expect(result.rei).toBeGreaterThan(0)
    expect(result.csf).toBeGreaterThan(0)
    expect(result.arp).toBeGreaterThan(0)
    expect(result.xpEarned).toBeGreaterThan(0)
    expect(result.suggestedDifficulty).toBeGreaterThanOrEqual(1)
    expect(result.suggestedDifficulty).toBeLessThanOrEqual(10)
  })

  it('yüksek performans → zorluk artar', () => {
    const highPerf: SessionMetrics = {
      ...baseMetrics,
      comprehension: 96,
      score: 94,
    }
    const result = processSession(highPerf, baseProfile, [160, 165, 170])
    expect(result.suggestedDifficulty).toBeGreaterThan(baseMetrics.difficultyLevel)
  })

  it('düşük comprehension → mod önerisi yapar', () => {
    const lowComp: SessionMetrics = { ...baseMetrics, comprehension: 55, score: 60 }
    const result = processSession(lowComp, baseProfile, [])
    expect(result.recommendedMode).not.toBeNull()
  })

  it('yüksek performans → mod önerisi null', () => {
    const highPerf: SessionMetrics = { ...baseMetrics, comprehension: 90, score: 88 }
    const result = processSession(highPerf, baseProfile, [])
    expect(result.recommendedMode).toBeNull()
  })

  it('ARP değişimi hesaplar', () => {
    const result = processSession(baseMetrics, baseProfile, [100, 110, 120])
    expect(typeof result.arpChange).toBe('number')
  })
})

describe('calculateXP', () => {
  it('sınırlar içinde XP döner (5-500)', () => {
    const xp = calculateXP({
      arp: 200, score: 85, comprehension: 80,
      fatigueScore: 10, durationSeconds: 300, difficultyLevel: 5,
    })
    expect(xp).toBeGreaterThanOrEqual(5)
    expect(xp).toBeLessThanOrEqual(500)
  })

  it('yüksek zorluk → daha fazla XP', () => {
    const low = calculateXP({ arp: 200, score: 80, comprehension: 80, fatigueScore: 10, durationSeconds: 300, difficultyLevel: 1 })
    const high = calculateXP({ arp: 200, score: 80, comprehension: 80, fatigueScore: 10, durationSeconds: 300, difficultyLevel: 10 })
    expect(high).toBeGreaterThan(low)
  })

  it('yüksek yorgunluk → daha az XP', () => {
    const fresh = calculateXP({ arp: 200, score: 80, comprehension: 80, fatigueScore: 5, durationSeconds: 300, difficultyLevel: 5 })
    const exhausted = calculateXP({ arp: 200, score: 80, comprehension: 80, fatigueScore: 80, durationSeconds: 300, difficultyLevel: 5 })
    expect(exhausted).toBeLessThan(fresh)
  })
})
