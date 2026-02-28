/**
 * Akış Okuma (Flow Reading) Rozetleri
 * ChunkRSVP achievements ile aynı yapı.
 */

export interface Achievement {
  id: string
  title: string
  description: string
  xpReward: number
  icon: string
}

export const FLOW_READING_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_flow_session',
    title: 'İlk Akış Seansı',
    description: 'Akış Okuma ile ilk seansını tamamladın',
    xpReward: 50,
    icon: '🌊',
  },
  {
    id: 'no_regression',
    title: 'Saf Akış',
    description: 'Hiç geri dönmeden bir seansı bitirdin',
    xpReward: 200,
    icon: '➡️',
  },
  {
    id: 'flow_speed_300',
    title: 'Akış Ustası',
    description: 'Akış Okuma ile 300 WPM\'e ulaştın',
    xpReward: 150,
    icon: '⚡',
  },
  {
    id: 'flow_speed_400',
    title: 'Hız Dalgası',
    description: 'Akış Okuma ile 400 WPM\'e ulaştın',
    xpReward: 300,
    icon: '🚀',
  },
  {
    id: 'flow_words_5k',
    title: '5.000 Kelime Akışı',
    description: 'Akış Okuma ile toplam 5.000 kelime okudun',
    xpReward: 200,
    icon: '📖',
  },
  {
    id: 'flow_highlight_mode',
    title: 'Vurgu Okuyucu',
    description: 'Highlight cursor stiliyle 3 seans tamamladın',
    xpReward: 75,
    icon: '✨',
  },
  {
    id: 'flow_cruise_master',
    title: 'Cruise Şampiyonu',
    description: 'Cruise modda 10 seans tamamladın',
    xpReward: 100,
    icon: '🎯',
  },
  {
    id: 'flow_pdf_read',
    title: 'PDF Akışı',
    description: 'PDF belgeden Akış Okuma seansı tamamladın',
    xpReward: 75,
    icon: '📄',
  },
]

/**
 * Seans sonunda hangi rozetlerin verilmesi gerektiğini kontrol et.
 * badgeService.checkAndAwardBadges() ile entegre edilir.
 */
export function getEarnedAchievements(params: {
  regressionCount: number
  avgWPM: number
  totalWords: number
  readingMode: 'sprint' | 'cruise'
  cursorStyle: string
  importSource: string
  isFirstSession: boolean
}): string[] {
  const earned: string[] = []

  if (params.isFirstSession) earned.push('first_flow_session')
  if (params.regressionCount === 0) earned.push('no_regression')
  if (params.avgWPM >= 300) earned.push('flow_speed_300')
  if (params.avgWPM >= 400) earned.push('flow_speed_400')
  if (params.totalWords >= 5000) earned.push('flow_words_5k')
  if (params.cursorStyle === 'highlight') earned.push('flow_highlight_mode')
  if (params.readingMode === 'cruise') earned.push('flow_cruise_master')
  if (params.importSource === 'pdf') earned.push('flow_pdf_read')

  return earned
}
