export const LEVEL_XP_THRESHOLDS = [
  0,      // Lv 1
  200,    // Lv 2
  500,    // Lv 3
  1000,   // Lv 4
  2000,   // Lv 5
  3500,   // Lv 6
  5500,   // Lv 7
  8000,   // Lv 8
  11000,  // Lv 9
  15000,  // Lv 10
  20000,  // Lv 11
  27000,  // Lv 12
  36000,  // Lv 13
  47000,  // Lv 14
  60000,  // Lv 15 (MAX)
];

export const LEVEL_NAMES = [
  '', 'Başlangıç', 'Aday', 'Takipçi', 'Çalışkan', 'Azimli',
  'Yetenekli', 'İleri', 'Uzman', 'Usta', 'Şampiyon',
  'Elit', 'Efsane', 'Üstat', 'Mitos', 'Titan',
];

export function getLevelFromXp(totalXp: number): number {
  for (let i = LEVEL_XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVEL_XP_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export function getXpToNextLevel(totalXp: number): {
  current: number;
  required: number;
  percent: number;
} {
  const level = getLevelFromXp(totalXp);
  if (level >= LEVEL_XP_THRESHOLDS.length) {
    return { current: 0, required: 0, percent: 100 };
  }
  const currentThreshold = LEVEL_XP_THRESHOLDS[level - 1];
  const nextThreshold = LEVEL_XP_THRESHOLDS[level];
  const current = totalXp - currentThreshold;
  const required = nextThreshold - currentThreshold;
  return {
    current,
    required,
    percent: Math.round((current / required) * 100),
  };
}
