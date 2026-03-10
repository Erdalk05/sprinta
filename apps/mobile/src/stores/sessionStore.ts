import { create } from 'zustand'
import type { PerformanceResult, SessionMetrics } from '@sprinta/shared'
import { useModuleUsageStore } from './moduleUsageStore'

// ── MMKV sync helper for persisted reading preferences ─────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _prefMmkv: any = null
function getPrefMMKV() {
  if (_prefMmkv) return _prefMmkv
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { MMKV } = require('react-native-mmkv')
    _prefMmkv = new MMKV({ id: 'sprinta-session-prefs' })
  } catch { _prefMmkv = null }
  return _prefMmkv
}
function prefGetNum(key: string, def: number): number {
  const m = getPrefMMKV()
  if (m) { try { const v = m.getNumber(key); return v !== undefined ? v : def } catch { /**/ } }
  return def
}
function prefGetStr(key: string, def: string): string {
  const m = getPrefMMKV()
  if (m) { try { return m.getString(key) ?? def } catch { /**/ } }
  return def
}
function prefSet(key: string, val: string | number): void {
  const m = getPrefMMKV()
  if (m) { try { m.set(key, val) } catch { /**/ } }
}
// ───────────────────────────────────────────────────────────────────────

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

  // Kalıcı okuma tercihleri (MMKV persisted — reset()'ten etkilenmez)
  wpmPreference: number
  fontSizePreference: 'small' | 'medium' | 'large'

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
  setWpmPreference: (wpm: number) => void
  setFontSizePreference: (size: 'small' | 'medium' | 'large') => void
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

  // Load persisted preferences at initialization (not part of initialState → survive reset)
  wpmPreference: prefGetNum('pref_wpm', 200),
  fontSizePreference: prefGetStr('pref_font_size', 'medium') as 'small' | 'medium' | 'large',

  setWpmPreference: (wpm) => {
    const clamped = Math.max(100, Math.min(500, wpm))
    prefSet('pref_wpm', clamped)
    set({ wpmPreference: clamped })
  },

  setFontSizePreference: (size) => {
    prefSet('pref_font_size', size)
    set({ fontSizePreference: size })
  },

  startSession: ({ moduleCode, exerciseId, difficultyLevel }) => {
    // Kullanım sayacını artır → RadialFab dinamik top-6 için
    useModuleUsageStore.getState().increment(moduleCode)
    // Shallow merge: wpmPreference + fontSizePreference not in initialState → preserved
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
    // wpmPreference + fontSizePreference are NOT in initialState → survive reset
    set(initialState)
  },
}))
