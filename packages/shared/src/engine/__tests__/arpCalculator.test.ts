import { calculateREI, calculateCSF, calculateARP, calculateSessionARP, calculateExamProgress } from '../arpCalculator'

describe('calculateREI', () => {
  it('doğru REI hesaplar', () => {
    expect(calculateREI(200, 80)).toBe(160)
    expect(calculateREI(300, 100)).toBe(300)
    expect(calculateREI(150, 0)).toBe(0)
  })

  it('comprehension 0-100 arasında sıkıştırır', () => {
    expect(calculateREI(200, 120)).toBe(200) // 120 → 100
    expect(calculateREI(200, -10)).toBe(0)   // -10 → 0
  })
})

describe('calculateCSF', () => {
  it('tüm sıfır → 1.0 döner', () => {
    expect(calculateCSF(0, 0, 0)).toBe(1)
  })

  it('tüm bir → 0.0 döner', () => {
    expect(calculateCSF(1, 1, 1)).toBe(0)
  })

  it('orta değerler', () => {
    const csf = calculateCSF(0.1, 0.1, 0.1)
    expect(csf).toBeCloseTo(0.9, 2)
  })

  it('negatif girişleri 0 olarak işler', () => {
    expect(calculateCSF(-0.5, 0, 0)).toBe(1)
  })
})

describe('calculateARP', () => {
  it('REI × CSF yuvarlar', () => {
    expect(calculateARP(200, 0.9)).toBe(180)
    expect(calculateARP(150, 1.0)).toBe(150)
    expect(calculateARP(0, 0.5)).toBe(0)
  })
})

describe('calculateSessionARP', () => {
  it('temel metriklerle hesaplar', () => {
    const result = calculateSessionARP({ wpm: 200, comprehension: 80 })
    expect(result.rei).toBe(160)
    expect(result.csf).toBe(1)
    expect(result.arp).toBe(160)
  })

  it('hata ve regresyon ile CSF düşer', () => {
    const result = calculateSessionARP({
      wpm: 200,
      comprehension: 80,
      errorsPerMinute: 5,      // 0.5 error rate
      regressionCount: 10,
      durationSeconds: 120,   // 2 dk → 5 regr/dk → min(1, 5/5) = 1.0
      fatigueIndex: 0,
    })
    expect(result.csf).toBeLessThan(1)
    expect(result.arp).toBeLessThan(160)
  })

  it('fatigue ile arp düşer', () => {
    const withFatigue = calculateSessionARP({ wpm: 200, comprehension: 80, fatigueIndex: 0.5 })
    const withoutFatigue = calculateSessionARP({ wpm: 200, comprehension: 80, fatigueIndex: 0 })
    expect(withFatigue.arp).toBeLessThan(withoutFatigue.arp)
  })
})

describe('calculateExamProgress', () => {
  it('TYT hedefleri için ilerleme hesaplar', () => {
    const result = calculateExamProgress(200, 'tyt') // target=250
    expect(result.progressPercent).toBe(80)
    expect(result.remainingArp).toBe(50)
    expect(result.level).toBe('min')
  })

  it('hedef ARP üzerinde → target level', () => {
    const result = calculateExamProgress(260, 'tyt') // target=250, elite=310
    expect(result.level).toBe('target')
    expect(result.progressPercent).toBe(100)
  })

  it('elite seviyesi', () => {
    const result = calculateExamProgress(320, 'tyt') // elite=310
    expect(result.level).toBe('elite')
  })

  it('bilinmeyen sınav → other kullanır', () => {
    const result = calculateExamProgress(100, 'bilinmeyen')
    expect(result.level).toBe('below')
  })
})
