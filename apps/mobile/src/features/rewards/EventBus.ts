type AppEvent =
  | 'QUIZ_COMPLETED'
  | 'SESSION_FINISHED'
  | 'STREAK_UPDATED'
  | 'XP_UPDATED'
  | 'LEVEL_UP'
  | 'BADGE_UNLOCKED'
  | 'DAILY_GOAL_COMPLETED'
  | 'STREAK_MILESTONE'

interface EventPayload {
  QUIZ_COMPLETED: { arp: number; level: number }
  SESSION_FINISHED: { xpEarned: number; moduleType: string }
  STREAK_UPDATED: { days: number }
  XP_UPDATED: { total: number; delta: number }
  LEVEL_UP: { newLevel: number }
  BADGE_UNLOCKED: { badgeId: string }
  DAILY_GOAL_COMPLETED: { date: string }
  STREAK_MILESTONE: { days: number }
}

type Listener<T extends AppEvent> = (payload: EventPayload[T]) => void

class EventBusClass {
  private listeners: Map<string, Listener<any>[]> = new Map()

  on<T extends AppEvent>(event: T, fn: Listener<T>): void {
    const existing = this.listeners.get(event) ?? []
    this.listeners.set(event, [...existing, fn])
  }

  off<T extends AppEvent>(event: T, fn: Listener<T>): void {
    const existing = this.listeners.get(event) ?? []
    this.listeners.set(event, existing.filter((l) => l !== fn))
  }

  emit<T extends AppEvent>(event: T, payload: EventPayload[T]): void {
    const fns = this.listeners.get(event) ?? []
    fns.forEach((fn) => {
      try {
        fn(payload)
      } catch (e) {
        console.error(`EventBus [${event}] handler error:`, e)
      }
    })
  }
}

export const EventBus = new EventBusClass()
