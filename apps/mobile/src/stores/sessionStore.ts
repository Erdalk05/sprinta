import { create } from 'zustand'
import type { PerformanceResult, SessionMetrics } from '@sprinta/shared'

interface HalfMetrics {
  wpm: number
  accuracy: number
}

interface SessionState {
  // Aktif session
  isActive: boolean
  moduleCode: string | null
  exerciseId: string | null
  difficultyLevel: number
  startTime: number | null

  // Toplanmakta olan metrikler
  wordsRead: number
  errorsCount: number
  correctAnswers: number
  totalQuestions: number
  responseTimes: number[]       // ms cinsinden yanıt süreleri

  // Yarı ölçümler
  firstHalfMetrics: HalfMetrics | null
  halfwayReached: boolean

  // Tamamlanan session çıktısı
  result: PerformanceResult | null
  lastMetrics: SessionMetrics | null

  // Eylemler
  startSession: (params: {
    moduleCode: string
    exerciseId: string
    difficultyLevel: number
  }) => void
  recordHalfway: (wpm: number, accuracy: number) => void
  addWords: (count: number) => void
  addError: () => void
  recordAnswer: (correct: boolean, responseTimeMs: number) => void
  buildMetrics: (secondHalfWpm: number, secondHalfAccuracy: number) => SessionMetrics
  saveResult: (result: PerformanceResult) => void
  reset: () => void
}

const initialState = {
  isActive: false,
  moduleCode: null,
  exerciseId: null,
  difficultyLevel: 5,
  startTime: null,
  wordsRead: 0,
  errorsCount: 0,
  correctAnswers: 0,
  totalQuestions: 0,
  responseTimes: [],
  firstHalfMetrics: null,
  halfwayReached: false,
  result: null,
  lastMetrics: null,
}

export const useSessionStore = create<SessionState>((set, get) => ({
  ...initialState,

  startSession: ({ moduleCode, exerciseId, difficultyLevel }) => {
    set({
      ...initialState,
      isActive: true,
      moduleCode,
      exerciseId,
      difficultyLevel,
      startTime: Date.now(),
    })
  },

  recordHalfway: (wpm, accuracy) => {
    set({ firstHalfMetrics: { wpm, accuracy }, halfwayReached: true })
  },

  addWords: (count) => {
    set((s) => ({ wordsRead: s.wordsRead + count }))
  },

  addError: () => {
    set((s) => ({ errorsCount: s.errorsCount + 1 }))
  },

  recordAnswer: (correct, responseTimeMs) => {
    set((s) => ({
      totalQuestions: s.totalQuestions + 1,
      correctAnswers: s.correctAnswers + (correct ? 1 : 0),
      responseTimes: [...s.responseTimes, responseTimeMs],
    }))
  },

  buildMetrics: (secondHalfWpm, secondHalfAccuracy): SessionMetrics => {
    const s = get()
    const durationSeconds = s.startTime
      ? Math.round((Date.now() - s.startTime) / 1000)
      : 0
    const durationMinutes = Math.max(1, durationSeconds / 60)

    const wpm = Math.round(s.wordsRead / durationMinutes)
    const comprehension =
      s.totalQuestions > 0
        ? Math.round((s.correctAnswers / s.totalQuestions) * 100)
        : 75 // default
    const accuracy = Math.max(0, 100 - (s.errorsCount / Math.max(1, s.wordsRead)) * 100)

    const metrics: SessionMetrics = {
      wpm: Math.max(0, wpm),
      comprehension,
      accuracy: Math.round(accuracy),
      score: Math.round((comprehension * 0.6 + accuracy * 0.4)),
      durationSeconds,
      exerciseType: 'reading',
      moduleCode: s.moduleCode!,
      difficultyLevel: s.difficultyLevel,
      errorsPerMinute: s.errorsCount / durationMinutes,
      responseTimesMs: s.responseTimes,
      firstHalfMetrics: s.firstHalfMetrics ?? undefined,
      secondHalfMetrics: { wpm: secondHalfWpm, accuracy: secondHalfAccuracy },
    }

    set({ lastMetrics: metrics, isActive: false })
    return metrics
  },

  saveResult: (result) => {
    set({ result })
  },

  reset: () => {
    set(initialState)
  },
}))
