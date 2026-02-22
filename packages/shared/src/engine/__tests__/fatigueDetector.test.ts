import { detectFatigue, estimateFatigueIndex } from '../fatigueDetector'

describe('detectFatigue', () => {
  it('iki yarı aynıysa fresh döner', () => {
    const result = detectFatigue({
      firstHalf: { wpm: 200, accuracy: 90 },
      secondHalf: { wpm: 200, accuracy: 90 },
    })
    expect(result.level).toBe('fresh')
    expect(result.score).toBe(0)
    expect(result.shouldBreak).toBe(false)
  })

  it('büyük WPM düşüşü → fatigued', () => {
    const result = detectFatigue({
      firstHalf: { wpm: 200, accuracy: 90 },
      secondHalf: { wpm: 100, accuracy: 70 }, // %50 wpm düşüşü, %22 accuracy
    })
    expect(result.score).toBeGreaterThan(20)
    expect(['fatigued', 'exhausted', 'moderate', 'mild']).toContain(result.level)
  })

  it('response time artışı skoru yükseltir', () => {
    const withTimes = detectFatigue({
      firstHalf: { wpm: 200, accuracy: 85 },
      secondHalf: { wpm: 180, accuracy: 82 },
      responseTimes: [100, 110, 105, 200, 250, 300, 280, 350],
    })
    const withoutTimes = detectFatigue({
      firstHalf: { wpm: 200, accuracy: 85 },
      secondHalf: { wpm: 180, accuracy: 82 },
    })
    expect(withTimes.score).toBeGreaterThanOrEqual(withoutTimes.score)
  })

  it('estimateFatigueIndex — uzun süre + düşük puan → yüksek', () => {
    const high = estimateFatigueIndex(45, 30)
    const low = estimateFatigueIndex(5, 90)
    expect(high).toBeGreaterThan(low)
    expect(high).toBeLessThanOrEqual(1)
    expect(low).toBeGreaterThanOrEqual(0)
  })
})
