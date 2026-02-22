import { useState, useEffect, useRef, useCallback } from 'react'

interface TimerOptions {
  durationSeconds: number
  onHalfway?: () => void
  onComplete?: () => void
  tickInterval?: number // ms
}

interface TimerState {
  elapsed: number     // saniye
  remaining: number   // saniye
  progress: number    // 0-1
  isRunning: boolean
  isPastHalf: boolean
}

export function useSessionTimer({
  durationSeconds,
  onHalfway,
  onComplete,
  tickInterval = 1000,
}: TimerOptions) {
  const [elapsed, setElapsed] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const halfwayFired = useRef(false)
  const completeFired = useRef(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsRunning(false)
  }, [])

  const start = useCallback(() => {
    setIsRunning(true)
    setElapsed(0)
    halfwayFired.current = false
    completeFired.current = false

    intervalRef.current = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + tickInterval / 1000

        // Yarıya ulaşıldı mı?
        if (!halfwayFired.current && next >= durationSeconds / 2) {
          halfwayFired.current = true
          onHalfway?.()
        }

        // Süre doldu mu?
        if (!completeFired.current && next >= durationSeconds) {
          completeFired.current = true
          onComplete?.()
          return durationSeconds
        }

        return next
      })
    }, tickInterval)
  }, [durationSeconds, tickInterval, onHalfway, onComplete])

  const pause = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsRunning(false)
  }, [])

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const state: TimerState = {
    elapsed: Math.round(elapsed),
    remaining: Math.max(0, Math.round(durationSeconds - elapsed)),
    progress: Math.min(1, elapsed / durationSeconds),
    isRunning,
    isPastHalf: elapsed >= durationSeconds / 2,
  }

  return { ...state, start, pause, stop }
}

/** Süreyi MM:SS formatına çevirir */
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
