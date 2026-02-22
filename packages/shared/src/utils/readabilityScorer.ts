/**
 * Türkçe metinler için uyarlanmış Flesch okunabilirlik skoru
 * Orijinal formülden Türkçe hece yapısına göre düzenlenmiştir
 */
export function calculateFleschScore(text: string): number {
  const sentences = text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 5);

  const words = text
    .split(/\s+/)
    .map(w => w.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ]/g, ''))
    .filter(w => w.length > 0);

  if (sentences.length === 0 || words.length === 0) return 50;

  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllablesPerWord = words.reduce((sum, word) => {
    return sum + countTurkishSyllables(word);
  }, 0) / words.length;

  // Türkçe uyarlamalı Flesch formülü
  const score = 206.835
    - (1.015 * avgWordsPerSentence)
    - (84.6 * avgSyllablesPerWord);

  return Math.max(0, Math.min(100, Math.round(score)));
}

function countTurkishSyllables(word: string): number {
  const vowels = /[aeıioöuüAEIİOÖUÜ]/g;
  const matches = word.match(vowels);
  return matches ? matches.length : 1;
}

/**
 * Hedef WPM'i güçlük seviyesine göre belirle
 */
export function getTargetWpm(difficulty: number): number {
  return 150 + (difficulty - 1) * 20;
}

/**
 * Metnin güçlük seviyesini tahmin et
 */
export function estimateDifficulty(text: string): number {
  const flesch = calculateFleschScore(text);
  const words = text.split(/\s+/).length;

  let difficulty = 5;

  // Flesch skoru düşükse → daha zor
  if (flesch >= 70) difficulty -= 2;
  else if (flesch >= 60) difficulty -= 1;
  else if (flesch <= 40) difficulty += 2;
  else if (flesch <= 50) difficulty += 1;

  // Uzun metin → daha zor
  if (words > 500) difficulty += 2;
  else if (words > 300) difficulty += 1;
  else if (words < 100) difficulty -= 2;
  else if (words < 150) difficulty -= 1;

  return Math.max(1, Math.min(10, difficulty));
}
