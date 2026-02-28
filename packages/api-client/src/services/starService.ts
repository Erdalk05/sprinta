/**
 * starService — Isolated gamification layer: Stars + Streak
 *
 * Rules:
 *   accuracy >= 90  → 3 stars
 *   accuracy >= 75  → 2 stars
 *   accuracy >= 60  → 1 star
 *   accuracy < 60   → 0 stars
 *
 * Daily target: 3 stars → daily_completed = true → streak ticked
 * Streak decay: missed day → floor(current / 2), NOT 0 reset
 */

import type { SupabaseClient } from '@supabase/supabase-js'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DailyProgress {
  date: string
  starsToday: number
  dailyCompleted: boolean
}

export interface StarStreak {
  currentStreak: number
  longestStreak: number
  lastActiveDate: string | null
}

export interface StarTotalStats {
  totalStars: number
  totalSessions: number
}

export interface StarMilestone {
  stars: number
  badgeId: string
  label: string
  unlocked: boolean
}

export interface GamificationState {
  daily:      DailyProgress
  streak:     StarStreak
  stats:      StarTotalStats
  milestones: StarMilestone[]
  /** Stars earned in the just-completed exercise (0-3) */
  newStars:   0 | 1 | 2 | 3
}

// ─── Milestones (hardcoded MVP) ───────────────────────────────────────────────

const MILESTONE_DEFS: Omit<StarMilestone, 'unlocked'>[] = [
  { stars: 20,  badgeId: 'star_badge_1', label: 'Kartal Gözü Başlangıç' },
  { stars: 50,  badgeId: 'star_badge_2', label: 'Kartal Gözü Usta'      },
  { stars: 100, badgeId: 'star_badge_3', label: 'Kartal Gözü Efsane'    },
]

function buildMilestones(totalStars: number): StarMilestone[] {
  return MILESTONE_DEFS.map((m) => ({ ...m, unlocked: totalStars >= m.stars }))
}

// ─── Pure helper ──────────────────────────────────────────────────────────────

export function calculateStars(accuracy: number): 0 | 1 | 2 | 3 {
  if (accuracy >= 90) return 3
  if (accuracy >= 75) return 2
  if (accuracy >= 60) return 1
  return 0
}

// ─── Service factory ──────────────────────────────────────────────────────────

export function createStarService(supabase: SupabaseClient<any>) {

  /**
   * Call after every exercise completion.
   * accuracy = focusStabilityScore (0-100)
   */
  async function recordExercise(
    userId:     string,
    exerciseId: string,
    accuracy:   number,
  ): Promise<GamificationState> {
    const starsEarned = calculateStars(accuracy)
    const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD

    // 1. Insert star record
    await supabase.from('user_star_records').insert({
      user_id:      userId,
      exercise_id:  exerciseId,
      stars_earned: starsEarned,
      accuracy,
    })

    // 2. Upsert daily progress
    const { data: existingDay } = await supabase
      .from('user_daily_progress')
      .select('stars_today')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle()

    const prevStars      = (existingDay?.stars_today ?? 0) as number
    const starsToday     = prevStars + starsEarned
    const dailyCompleted = starsToday >= 3

    await supabase.from('user_daily_progress').upsert(
      { user_id: userId, date: today, stars_today: starsToday, daily_completed: dailyCompleted },
      { onConflict: 'user_id,date' },
    )

    // 3. Upsert total stats
    const { data: prevStats } = await supabase
      .from('user_total_stats')
      .select('total_stars, total_sessions')
      .eq('user_id', userId)
      .maybeSingle()

    const totalStars    = (prevStats?.total_stars    ?? 0) + starsEarned
    const totalSessions = (prevStats?.total_sessions ?? 0) + 1

    await supabase.from('user_total_stats').upsert(
      { user_id: userId, total_stars: totalStars, total_sessions: totalSessions, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' },
    )

    // 4. Tick streak when daily goal reached
    if (dailyCompleted) {
      await supabase.rpc('update_star_streak', { p_user_id: userId })
    }

    // 5. Read back streak
    const { data: streakRow } = await supabase
      .from('user_streaks')
      .select('current_streak, longest_streak, last_active_date')
      .eq('user_id', userId)
      .maybeSingle()

    return {
      daily: { date: today, starsToday, dailyCompleted },
      streak: {
        currentStreak:  streakRow?.current_streak   ?? 0,
        longestStreak:  streakRow?.longest_streak   ?? 0,
        lastActiveDate: streakRow?.last_active_date ?? null,
      },
      stats:      { totalStars, totalSessions },
      milestones: buildMilestones(totalStars),
      newStars:   starsEarned,
    }
  }

  /** Fetch current gamification state without recording a new exercise */
  async function getState(userId: string): Promise<GamificationState> {
    const today = new Date().toISOString().slice(0, 10)

    const [{ data: daily }, { data: streak }, { data: stats }] = await Promise.all([
      supabase.from('user_daily_progress')
        .select('stars_today, daily_completed')
        .eq('user_id', userId).eq('date', today).maybeSingle(),
      supabase.from('user_streaks')
        .select('current_streak, longest_streak, last_active_date')
        .eq('user_id', userId).maybeSingle(),
      supabase.from('user_total_stats')
        .select('total_stars, total_sessions')
        .eq('user_id', userId).maybeSingle(),
    ])

    const totalStars = stats?.total_stars ?? 0

    return {
      daily: {
        date:           today,
        starsToday:     daily?.stars_today     ?? 0,
        dailyCompleted: daily?.daily_completed ?? false,
      },
      streak: {
        currentStreak:  streak?.current_streak   ?? 0,
        longestStreak:  streak?.longest_streak   ?? 0,
        lastActiveDate: streak?.last_active_date ?? null,
      },
      stats:      { totalStars, totalSessions: stats?.total_sessions ?? 0 },
      milestones: buildMilestones(totalStars),
      newStars:   0,
    }
  }

  return { recordExercise, getState }
}
