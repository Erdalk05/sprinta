// packages/shared/src/constants/content.ts

export const CONTENT_CATEGORIES = {
  // Türkçe / Edebiyat
  NARRATIVE: 'Anlatma Esaslı',      // Hikaye, roman parçaları
  DESCRIPTIVE: 'Betimleme',          // Yer, kişi, olay betimleme
  ARGUMENTATIVE: 'Tartışmacı',       // Fikir yazıları, eleştiri
  INFORMATIVE: 'Bilgilendirici',     // Ansiklopedik, öğretici

  // Bilim / Fen
  SCIENCE_BIO: 'Biyoloji',
  SCIENCE_PHY: 'Fizik / Astronomi',
  SCIENCE_CHEM: 'Kimya / Çevre',

  // Sosyal
  HISTORY: 'Tarih',
  GEOGRAPHY: 'Coğrafya',
  PHILOSOPHY: 'Felsefe / Psikoloji',
  CURRENT_AFFAIRS: 'Güncel Olaylar',
} as const;

export type ContentCategory = keyof typeof CONTENT_CATEGORIES;

// Sınav tarzı → içerik ağırlığı
export const EXAM_CONTENT_WEIGHTS = {
  lgs:  { narrative: 0.4, informative: 0.35, argumentative: 0.25 },
  tyt:  { narrative: 0.3, informative: 0.4,  argumentative: 0.3  },
  ayt:  { narrative: 0.25, argumentative: 0.4, informative: 0.35 },
  kpss: { informative: 0.5, argumentative: 0.3, narrative: 0.2   },
} as const;

// Güçlük → kelime sayısı ve okunabilirlik
export const DIFFICULTY_TEXT_PARAMS: Record<number, { minWords: number; maxWords: number; targetFlesch: number }> = {
  1:  { minWords: 80,  maxWords: 120, targetFlesch: 75 },
  2:  { minWords: 100, maxWords: 150, targetFlesch: 70 },
  3:  { minWords: 120, maxWords: 200, targetFlesch: 65 },
  4:  { minWords: 150, maxWords: 250, targetFlesch: 60 },
  5:  { minWords: 200, maxWords: 300, targetFlesch: 55 },
  6:  { minWords: 250, maxWords: 350, targetFlesch: 50 },
  7:  { minWords: 300, maxWords: 450, targetFlesch: 45 },
  8:  { minWords: 400, maxWords: 550, targetFlesch: 40 },
  9:  { minWords: 500, maxWords: 650, targetFlesch: 35 },
  10: { minWords: 600, maxWords: 800, targetFlesch: 30 },
};
