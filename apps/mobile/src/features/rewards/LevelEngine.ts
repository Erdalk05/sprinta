export interface LevelInfo {
  level: number
  title: string
  minARP: number
  maxARP: number
  color: string
  emoji: string
  nextLevelXP: number
}

const BASE_XP = 100
const XP_MULTIPLIER = 1.4

const LEVELS: LevelInfo[] = [
  { level: 1, title: 'Başlangıç',  minARP: 0,   maxARP: 150, color: '#8696A0', emoji: '🌱', nextLevelXP: Math.round(BASE_XP * Math.pow(XP_MULTIPLIER, 1)) },
  { level: 2, title: 'Gelişen',    minARP: 150, maxARP: 300, color: '#25D366', emoji: '⚡', nextLevelXP: Math.round(BASE_XP * Math.pow(XP_MULTIPLIER, 2)) },
  { level: 3, title: 'Uzman',      minARP: 300, maxARP: 400, color: '#128C7E', emoji: '🏆', nextLevelXP: Math.round(BASE_XP * Math.pow(XP_MULTIPLIER, 3)) },
]

export function getLevelInfo(arp: number): LevelInfo {
  return (
    LEVELS.slice().reverse().find((l) => arp >= l.minARP) ?? LEVELS[0]
  )
}

export function getNextLevel(arp: number): LevelInfo | null {
  const current = getLevelInfo(arp)
  return LEVELS.find((l) => l.level === current.level + 1) ?? null
}

export function getLevelProgress(arp: number): number {
  const current = getLevelInfo(arp)
  const range = current.maxARP - current.minARP
  if (range <= 0) return 100
  return Math.min(100, Math.round(((arp - current.minARP) / range) * 100))
}

export function getNextLevelXP(level: number): number {
  return Math.round(BASE_XP * Math.pow(XP_MULTIPLIER, level))
}
