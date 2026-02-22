import type { SupabaseClient } from '@supabase/supabase-js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createStreakService(supabase: SupabaseClient<any>) {
  /**
   * Günlük seri güncelle (her gün ilk session sonrası çağır)
   */
  async function updateStreak(studentId: string): Promise<{
    streakDays: number;
    longestStreak: number;
    streakBroken: boolean;
  }> {
    const { data: student } = await supabase
      .from('students')
      .select('streak_days, longest_streak, last_activity_at')
      .eq('id', studentId)
      .single();

    if (!student) return { streakDays: 0, longestStreak: 0, streakBroken: false };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastActivity = student.last_activity_at
      ? new Date(student.last_activity_at)
      : null;

    let newStreak = student.streak_days ?? 0;
    let streakBroken = false;

    if (!lastActivity) {
      newStreak = 1;
    } else {
      const lastDay = new Date(lastActivity);
      lastDay.setHours(0, 0, 0, 0);
      const dayDiff = Math.floor(
        (today.getTime() - lastDay.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (dayDiff === 0) {
        // Bugün zaten aktif — değişiklik yok
      } else if (dayDiff === 1) {
        newStreak += 1;
      } else {
        streakBroken = newStreak > 3;
        newStreak = 1;
      }
    }

    const newLongest = Math.max(newStreak, student.longest_streak ?? 0);

    await supabase
      .from('students')
      .update({
        streak_days: newStreak,
        longest_streak: newLongest,
        last_activity_at: new Date().toISOString(),
      })
      .eq('id', studentId);

    return { streakDays: newStreak, longestStreak: newLongest, streakBroken };
  }

  return { updateStreak };
}
