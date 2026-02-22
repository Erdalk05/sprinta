let lastConfettiAt = 0
const COOLDOWN_MS = 5000

export type ConfettiTrigger =
  | 'quiz_completed'
  | 'badge_unlocked'
  | 'level_up'
  | 'daily_goal_completed'
  | 'streak_milestone'

export interface ConfettiOptions {
  duration?: number
  particleCount?: number
  colors?: string[]
}

type FireFn = () => void
let _fireFn: FireFn | null = null

export function registerConfettiFn(fn: FireFn): void {
  _fireFn = fn
}

export function fireConfetti(
  _trigger: ConfettiTrigger,
  _options?: ConfettiOptions,
): void {
  const now = Date.now()
  if (now - lastConfettiAt < COOLDOWN_MS) return
  lastConfettiAt = now
  _fireFn?.()
}
