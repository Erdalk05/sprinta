// packages/shared/src/types/engine.ts

export interface SessionMetrics {
  // Temel ölçümler (zorunlu)
  wpm: number
  comprehension: number          // 0-100
  accuracy: number               // 0-100
  score: number                  // 0-100
  durationSeconds: number
  exerciseType: string
  moduleCode: string
  difficultyLevel: number        // 1-10

  // Detay ölçümler (opsiyonel)
  regressionCount?: number
  fixationDurationMs?: number
  responseTimesMs?: number[]
  errorsPerMinute?: number

  // Session içi bölümler (yorgunluk tespiti için)
  firstHalfMetrics?: {
    wpm: number
    accuracy: number
  }
  secondHalfMetrics?: {
    wpm: number
    accuracy: number
  }
}

export interface PerformanceResult {
  rei: number
  csf: number
  arp: number

  fatigueScore: number
  fatigueLevel: FatigueLevel
  shouldTakeBreak: boolean

  suggestedDifficulty: number
  recommendedMode: string | null

  arpChange: number
  stabilityIndex: number

  xpEarned: number
}

export type FatigueLevel = 'fresh' | 'mild' | 'moderate' | 'fatigued' | 'exhausted'

export interface FatigueResult {
  score: number
  level: FatigueLevel
  shouldBreak: boolean
  estimatedRecoveryMinutes: number
}

export interface CognitiveProfile {
  sustainableWpm: number
  peakWpm: number
  comprehensionBaseline: number
  stabilityIndex: number
  fatigueThreshold: number
  speedSkill: number          // 0-100
  comprehensionSkill: number  // 0-100
  attentionSkill: number      // 0-100
  primaryWeakness: string | null
  secondaryWeakness: string | null
}

export interface ExamTarget {
  min: number
  target: number
  elite: number
}

export const EXAM_ARP_TARGETS: Record<string, ExamTarget> = {
  lgs:   { min: 150, target: 200, elite: 250 },
  tyt:   { min: 200, target: 250, elite: 310 },
  ayt:   { min: 220, target: 280, elite: 350 },
  kpss:  { min: 230, target: 290, elite: 360 },
  ales:  { min: 250, target: 310, elite: 390 },
  yds:   { min: 260, target: 320, elite: 400 },
  other: { min: 150, target: 220, elite: 300 },
}
