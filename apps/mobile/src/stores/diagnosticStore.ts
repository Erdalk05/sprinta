import { create } from 'zustand'
import { calculateSessionARP } from '@sprinta/shared'
import { rankWeaknesses } from '@sprinta/shared'
import type { CognitiveProfile } from '@sprinta/shared'

export interface DiagnosticResult {
  baselineWpm: number
  baselineComprehension: number
  baselineArp: number
  durationSeconds: number
  primaryWeakness: string | null
  secondaryWeakness: string | null
  recommendedPath: string
}

interface DiagnosticState {
  // Reading phase
  readingStartTime: number | null
  readingWpm: number

  // Comprehension phase
  correctAnswers: number
  totalQuestions: number
  responseTimes: number[]

  // Result
  result: DiagnosticResult | null
  isSaved: boolean

  // Actions
  startReading: () => void
  finishReading: (wpm: number) => void
  recordAnswer: (correct: boolean, responseTimeMs: number) => void
  buildResult: () => DiagnosticResult
  markSaved: () => void
  reset: () => void
}

const initialState = {
  readingStartTime: null,
  readingWpm: 0,
  correctAnswers: 0,
  totalQuestions: 0,
  responseTimes: [],
  result: null,
  isSaved: false,
}

export const useDiagnosticStore = create<DiagnosticState>((set, get) => ({
  ...initialState,

  startReading: () => set({ readingStartTime: Date.now() }),

  finishReading: (wpm) => set({ readingWpm: wpm }),

  recordAnswer: (correct, responseTimeMs) => {
    set((s) => ({
      totalQuestions: s.totalQuestions + 1,
      correctAnswers: s.correctAnswers + (correct ? 1 : 0),
      responseTimes: [...s.responseTimes, responseTimeMs],
    }))
  },

  buildResult: (): DiagnosticResult => {
    const s = get()
    const comprehension =
      s.totalQuestions > 0
        ? Math.round((s.correctAnswers / s.totalQuestions) * 100)
        : 70

    const { arp } = calculateSessionARP({
      wpm: s.readingWpm,
      comprehension,
      fatigueIndex: 0,
    })

    // Baseline profil tahmini
    const profile: CognitiveProfile = {
      sustainableWpm: s.readingWpm,
      peakWpm: s.readingWpm,
      comprehensionBaseline: comprehension,
      stabilityIndex: 0.5,
      fatigueThreshold: 50,
      speedSkill: Math.min(100, Math.round((s.readingWpm / 400) * 100)),
      comprehensionSkill: comprehension,
      attentionSkill: 70,
      primaryWeakness: null,
      secondaryWeakness: null,
    }

    const weaknesses = rankWeaknesses(profile)
    const primaryWeakness = weaknesses[0]?.module ?? null
    const secondaryWeakness = weaknesses[1]?.module ?? null

    // Öneri yolu (en zayıf modülden başla)
    const recommendedPath = [primaryWeakness, secondaryWeakness]
      .filter(Boolean)
      .join(' → ') || 'speed_control'

    const durationSeconds = s.readingStartTime
      ? Math.round((Date.now() - s.readingStartTime) / 1000)
      : 0

    const result: DiagnosticResult = {
      baselineWpm: s.readingWpm,
      baselineComprehension: comprehension,
      baselineArp: arp,
      durationSeconds,
      primaryWeakness,
      secondaryWeakness,
      recommendedPath,
    }

    set({ result })
    return result
  },

  markSaved: () => set({ isSaved: true }),

  reset: () => set(initialState),
}))
