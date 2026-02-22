import type { CognitiveProfile } from '../types/engine'

/**
 * Bilişsel profile göre modül önerisi
 */
export function recommendModule(profile: CognitiveProfile): string {
  if (profile.sustainableWpm < 150) return 'speed_control'
  if (profile.comprehensionBaseline < 65) return 'deep_comprehension'
  if (profile.attentionSkill < 50) return 'attention_power'
  if (profile.stabilityIndex < 0.5) return 'mental_reset'
  if (profile.sustainableWpm > 250 && profile.comprehensionBaseline < 80) {
    return 'deep_comprehension'
  }
  if (profile.speedSkill < profile.comprehensionSkill) return 'speed_control'
  return 'speed_control'
}

/**
 * Zayıf noktaları öncelik sıralamasıyla listele (düşük → yüksek)
 */
export function rankWeaknesses(
  profile: CognitiveProfile
): Array<{ module: string; score: number; label: string }> {
  const items = [
    { module: 'speed_control',      score: profile.speedSkill,                      label: 'Hız Kontrolü' },
    { module: 'deep_comprehension', score: profile.comprehensionSkill,              label: 'Derin Kavrama' },
    { module: 'attention_power',    score: profile.attentionSkill,                  label: 'Dikkat Gücü' },
    { module: 'mental_reset',       score: Math.round(profile.stabilityIndex * 100), label: 'Zihinsel Dayanıklılık' },
  ]

  return items.sort((a, b) => a.score - b.score)
}
