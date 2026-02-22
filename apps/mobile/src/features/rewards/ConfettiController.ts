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

const SPRINTA_COLORS = ['#25D366', '#128C7E', '#075E54', '#DCF8C6', '#FFFFFF']

type ConfettiFireFn = (options: {
  count: number
  origin: { x: number; y: number }
  colors: string[]
  explosionSpeed?: number
  fallSpeed?: number
}) => void

let _fireFn: ConfettiFireFn | null = null

export function registerConfettiFn(fn: ConfettiFireFn): void {
  _fireFn = fn
}

export function fireConfetti(
  _trigger: ConfettiTrigger,
  options?: ConfettiOptions,
): void {
  const now = Date.now()
  if (now - lastConfettiAt < COOLDOWN_MS) return
  if (!_fireFn) return

  lastConfettiAt = now

  _fireFn({
    count: options?.particleCount ?? 80,
    origin: { x: 0.5, y: 0.3 },
    colors: options?.colors ?? SPRINTA_COLORS,
    explosionSpeed: 350,
    fallSpeed: 3000,
  })
}
