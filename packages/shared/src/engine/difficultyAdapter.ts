/**
 * Egzersiz sonrası bir sonraki zorluk seviyesini hesapla (1-10)
 * Kural tabanlı adaptif zorluk sistemi
 */
export function adaptDifficulty(
  current: number,        // 1-10
  score: number,          // 0-100
  comprehension: number,  // 0-100
  fatigueScore: number    // 0-100
): number {
  let delta = 0

  // Anlama bazlı kural (en önemli)
  if (comprehension < 60) {
    delta -= 2 // Anlamıyorsa hemen düşür
  } else if (comprehension < 70) {
    delta -= 1
  } else if (comprehension > 95 && score > 92) {
    delta += 2
  } else if (comprehension > 90 && score > 85) {
    delta += 1
  }

  // Yorgunluk bazlı kural
  if (fatigueScore >= 70) {
    delta -= 2
  } else if (fatigueScore >= 50) {
    delta -= 1
  }

  // Puan bazlı ince ayar
  if (score < 50) delta -= 1
  if (score > 90 && delta === 0) delta += 1

  return Math.max(1, Math.min(10, current + delta))
}

export function shouldReduceDifficulty(
  comprehension: number,
  threshold = 70
): boolean {
  return comprehension < threshold
}

export function shouldIncreaseDifficulty(
  comprehension: number,
  score: number,
  fatigueScore: number
): boolean {
  return comprehension > 90 && score > 85 && fatigueScore < 30
}
