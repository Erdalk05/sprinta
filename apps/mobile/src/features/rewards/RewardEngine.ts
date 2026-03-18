import * as Haptics from 'expo-haptics'
import { EventBus } from './EventBus'
import { fireConfetti } from './ConfettiController'

export interface Badge {
  id: string
  title: string
  description: string
  emoji: string
  unlocked: boolean
  unlockedAt?: string
}

type BadgeCondition =
  | { type: 'first_test' }
  | { type: 'streak_days'; count: number }
  | { type: 'xp_total'; amount: number }
  | { type: 'level_reached'; level: number }

interface BadgeDef {
  id: string
  title: string
  description: string
  emoji: string
  condition: BadgeCondition
}

const BADGE_DEFS: BadgeDef[] = [
  { id: 'first_test',  title: 'İlk Adım',      description: 'İlk testi tamamladın',              emoji: '🌱', condition: { type: 'first_test' } },
  { id: 'streak_3',   title: 'İstikrarlı',     description: '3 gün arka arkaya çalıştın',        emoji: '🔥', condition: { type: 'streak_days', count: 3 } },
  { id: 'streak_7',   title: 'Kararlı',        description: '7 gün arka arkaya çalıştın',        emoji: '💪', condition: { type: 'streak_days', count: 7 } },
  { id: 'streak_30',  title: 'Efsane',         description: '30 gün arka arkaya çalıştın',       emoji: '⚡', condition: { type: 'streak_days', count: 30 } },
  { id: 'xp_100',     title: 'Çalışkan',       description: '100 XP kazandın',                   emoji: '📚', condition: { type: 'xp_total', amount: 100 } },
  { id: 'xp_500',     title: 'Performansçı',   description: '500 XP kazandın',                   emoji: '🏅', condition: { type: 'xp_total', amount: 500 } },
  { id: 'level_2',    title: 'Yükselen',       description: 'Seviye 2\'ye ulaştın',              emoji: '📈', condition: { type: 'level_reached', level: 2 } },
  { id: 'level_3',    title: 'Uzman',          description: 'Seviye 3\'e ulaştın',               emoji: '🏆', condition: { type: 'level_reached', level: 3 } },
]

// In-memory badge state (persisted via rewardStore)
let _unlockedIds: Set<string> = new Set()
let _initialized = false

export function getBadges(): Badge[] {
  return BADGE_DEFS.map((def) => ({
    ...def,
    unlocked: _unlockedIds.has(def.id),
  }))
}

export function getBadgeById(id: string): Badge | undefined {
  const def = BADGE_DEFS.find((d) => d.id === id)
  if (!def) return undefined
  return { ...def, unlocked: _unlockedIds.has(def.id) }
}

export function unlockBadge(id: string): boolean {
  if (_unlockedIds.has(id)) return false
  _unlockedIds.add(id)
  EventBus.emit('BADGE_UNLOCKED', { badgeId: id })
  fireConfetti('badge_unlocked')
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  return true
}

export function setUnlockedIds(ids: string[]): void {
  _unlockedIds = new Set(ids)
}

export function getUnlockedIds(): string[] {
  return [..._unlockedIds]
}

// ── Event handlers ──────────────────────────────────────────────

function handleQuizCompleted({ level }: { arp: number; level: number }) {
  unlockBadge('first_test')
  if (level >= 2) unlockBadge('level_2')
  if (level >= 3) unlockBadge('level_3')
}

function handleStreakUpdated({ days }: { days: number }) {
  if (days >= 3)  unlockBadge('streak_3')
  if (days >= 7)  unlockBadge('streak_7')
  if (days >= 30) unlockBadge('streak_30')
}

function handleXPUpdated({ total }: { total: number; delta: number }) {
  if (total >= 100) unlockBadge('xp_100')
  if (total >= 500) unlockBadge('xp_500')
}

function handleLevelUp({ newLevel }: { newLevel: number }) {
  if (newLevel >= 2) unlockBadge('level_2')
  if (newLevel >= 3) unlockBadge('level_3')
}

export function initRewardEngine(): void {
  if (_initialized) return
  _initialized = true

  EventBus.on('QUIZ_COMPLETED',  handleQuizCompleted)
  EventBus.on('STREAK_UPDATED',  handleStreakUpdated)
  EventBus.on('XP_UPDATED',      handleXPUpdated)
  EventBus.on('LEVEL_UP',        handleLevelUp)
}

export function cleanupRewardEngine(): void {
  if (!_initialized) return
  EventBus.off('QUIZ_COMPLETED',  handleQuizCompleted)
  EventBus.off('STREAK_UPDATED',  handleStreakUpdated)
  EventBus.off('XP_UPDATED',      handleXPUpdated)
  EventBus.off('LEVEL_UP',        handleLevelUp)
  _initialized = false
}

export function checkBadges(stats: { streakDays: number; totalXp: number; level: number }): Badge[] {
  const newly: Badge[] = []

  if (!_unlockedIds.has('first_test')) {
    _unlockedIds.add('first_test')
    newly.push({ ...BADGE_DEFS[0], unlocked: true })
  }

  if (stats.streakDays >= 3  && !_unlockedIds.has('streak_3'))  { _unlockedIds.add('streak_3');  newly.push({ ...BADGE_DEFS[1], unlocked: true }) }
  if (stats.streakDays >= 7  && !_unlockedIds.has('streak_7'))  { _unlockedIds.add('streak_7');  newly.push({ ...BADGE_DEFS[2], unlocked: true }) }
  if (stats.streakDays >= 30 && !_unlockedIds.has('streak_30')) { _unlockedIds.add('streak_30'); newly.push({ ...BADGE_DEFS[3], unlocked: true }) }
  if (stats.totalXp   >= 100 && !_unlockedIds.has('xp_100'))   { _unlockedIds.add('xp_100');   newly.push({ ...BADGE_DEFS[4], unlocked: true }) }
  if (stats.totalXp   >= 500 && !_unlockedIds.has('xp_500'))   { _unlockedIds.add('xp_500');   newly.push({ ...BADGE_DEFS[5], unlocked: true }) }
  if (stats.level     >= 2   && !_unlockedIds.has('level_2'))   { _unlockedIds.add('level_2');   newly.push({ ...BADGE_DEFS[6], unlocked: true }) }
  if (stats.level     >= 3   && !_unlockedIds.has('level_3'))   { _unlockedIds.add('level_3');   newly.push({ ...BADGE_DEFS[7], unlocked: true }) }

  return newly
}
