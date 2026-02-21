import type { CognitiveMetrics, ARPScores } from '../types'

/** @deprecated calculateSessionARP kullanın */
export function calculateARPScores(metrics: CognitiveMetrics): ARPScores {
  const rei = metrics.sustainableWpm * (metrics.comprehension / 100)
  const csf = 1 - (metrics.errorRate + metrics.regressionRate + metrics.fatigueIndex) / 3
  const arp = rei * Math.max(0, csf)
  return {
    rei: Math.round(rei * 100) / 100,
    csf: Math.round(csf * 1000) / 1000,
    arp: Math.round(arp * 100) / 100,
  }
}

/** @deprecated calculateExamProgress kullanın */
export function getARPLevel(arp: number): string {
  if (arp >= 290) return 'Uzman'
  if (arp >= 240) return 'İleri'
  if (arp >= 180) return 'Orta'
  if (arp >= 100) return 'Başlangıç'
  return 'Temel'
}
