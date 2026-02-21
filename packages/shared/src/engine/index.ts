// Performance Engine — barrel export
export { processSession, calculateXP } from './performanceEngine'
export { calculateREI, calculateCSF, calculateARP, calculateSessionARP, calculateExamProgress } from './arpCalculator'
export { detectFatigue, estimateFatigueIndex } from './fatigueDetector'
export { adaptDifficulty, shouldReduceDifficulty, shouldIncreaseDifficulty } from './difficultyAdapter'
export { calculateStabilityIndex, calculateGrowthScore, detectPlateau, calculateSustainableWpm } from './stabilityAnalyzer'
export { recommendModule, rankWeaknesses } from './modeRecommender'

// Geriye dönük uyumluluk (Step 01'den)
export { calculateARPScores, getARPLevel } from './legacyArp'
