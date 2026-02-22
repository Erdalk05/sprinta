export interface LevelInfo {
  level: number
  minXp: number
  maxXp: number
  title: string
  color: string
}

/**
 * XP eşikleri — her seviye için +150 XP eklenir
 * L1→2: 200, L2→3: 350, L3→4: 500, ...
 */
export function buildLevelThresholds(): number[] {
  const thresholds = [0] // Level 1 starts at 0
  let increment = 200
  for (let i = 1; i < 20; i++) {
    thresholds.push(thresholds[i - 1] + increment)
    increment += 150
  }
  return thresholds
}

export const LEVEL_THRESHOLDS = buildLevelThresholds()

export function getLevelFromXP(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1
  }
  return 1
}

export function getXPProgress(xp: number): { current: number; needed: number; progress: number } {
  const level = getLevelFromXP(xp)
  if (level >= 20) return { current: xp, needed: xp, progress: 1 }
  const minXp = LEVEL_THRESHOLDS[level - 1]
  const maxXp = LEVEL_THRESHOLDS[level]
  const current = xp - minXp
  const needed = maxXp - minXp
  return { current, needed, progress: Math.min(1, current / needed) }
}

const LEVEL_TITLES: Record<number, string> = {
  1: 'Yeni Başlayan',
  2: 'Meraklı',
  3: 'Öğrenci',
  4: 'Çalışkan',
  5: 'İstekli',
  6: 'Gelişen',
  7: 'Odaklı',
  8: 'Yetenekli',
  9: 'Kararlı',
  10: 'Uzman Aday',
  11: 'Deneyimli',
  12: 'İleri Seviye',
  13: 'Uzman',
  14: 'Usta',
  15: 'Ustalar Ustası',
  16: 'Elit',
  17: 'Şampiyon',
  18: 'Efsane Aday',
  19: 'Efsane',
  20: '🏆 Grandmaster',
}

const LEVEL_COLORS: string[] = [
  '#9CA3AF', '#6B7280', '#10B981', '#059669', '#0EA5E9',
  '#0284C7', '#6366F1', '#4F46E5', '#8B5CF6', '#7C3AED',
  '#EC4899', '#DB2777', '#F59E0B', '#D97706', '#EF4444',
  '#DC2626', '#B45309', '#92400E', '#7C2D12', '#6C3EE8',
]

export function getLevelInfo(level: number): LevelInfo {
  const clamped = Math.max(1, Math.min(20, level))
  return {
    level: clamped,
    minXp: LEVEL_THRESHOLDS[clamped - 1] ?? 0,
    maxXp: LEVEL_THRESHOLDS[clamped] ?? LEVEL_THRESHOLDS[19],
    title: LEVEL_TITLES[clamped] ?? `Seviye ${clamped}`,
    color: LEVEL_COLORS[clamped - 1] ?? '#6C3EE8',
  }
}

export const RARITY_COLORS: Record<string, string> = {
  common: '#6B7280',
  rare: '#0EA5E9',
  epic: '#8B5CF6',
  legendary: '#F59E0B',
}

export const RARITY_LABELS: Record<string, string> = {
  common: 'Yaygın',
  rare: 'Nadir',
  epic: 'Epik',
  legendary: 'Efsanevi',
}
