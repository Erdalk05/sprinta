// eslint-disable-next-line @typescript-eslint/no-explicit-any
import type { SupabaseClient } from '@supabase/supabase-js'

export interface Badge {
  id: string
  code: string
  name: string
  description: string
  iconName: string
  color: string
  category: string
  rarity: string
  conditionType: string
  conditionValue: number
  xpReward: number
}

export interface StudentStats {
  totalSessions: number
  streakDays: number
  currentArp: number
  maxComprehension: number
  hasCompletedDiagnostic: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createBadgeService(supabase: SupabaseClient<any>) {
  /**
   * Öğrencinin kazanmadığı rozetleri kontrol et ve ver
   * Yeni kazanılan rozetlerin listesini döner
   */
  async function checkAndAwardBadges(
    studentId: string,
    stats: StudentStats
  ): Promise<Badge[]> {
    // Tüm aktif rozetleri çek
    const { data: allBadges } = await supabase
      .from('badges')
      .select('*')
      .eq('is_active', true)

    if (!allBadges) return []

    // Öğrencinin zaten kazandığı rozetleri çek
    const { data: earned } = await supabase
      .from('student_badges')
      .select('badge_id')
      .eq('student_id', studentId)

    const earnedIds = new Set((earned ?? []).map((e: { badge_id: string }) => e.badge_id))

    // Koşulları kontrol et
    const toAward: Badge[] = []
    for (const badge of allBadges) {
      if (earnedIds.has(badge.id)) continue
      if (conditionMet(badge.condition_type, badge.condition_value, stats)) {
        toAward.push(mapBadge(badge))
      }
    }

    // Hepsini ver (DB trigger XP ekleyecek)
    if (toAward.length > 0) {
      await supabase.from('student_badges').insert(
        toAward.map((b) => ({ student_id: studentId, badge_id: b.id }))
      )
    }

    return toAward
  }

  /**
   * Öğrencinin tüm rozetlerini çek (kazanılanlar + kilitliler)
   */
  async function getStudentBadges(studentId: string): Promise<{
    earned: Badge[]
    locked: Badge[]
  }> {
    const [{ data: allBadges }, { data: earned }] = await Promise.all([
      supabase.from('badges').select('*').eq('is_active', true).order('condition_value'),
      supabase
        .from('student_badges')
        .select('badge_id')
        .eq('student_id', studentId),
    ])

    if (!allBadges) return { earned: [], locked: [] }
    const earnedIds = new Set((earned ?? []).map((e: { badge_id: string }) => e.badge_id))

    const earnedBadges: Badge[] = []
    const lockedBadges: Badge[] = []

    for (const b of allBadges) {
      if (earnedIds.has(b.id)) {
        earnedBadges.push(mapBadge(b))
      } else {
        lockedBadges.push(mapBadge(b))
      }
    }

    return { earned: earnedBadges, locked: lockedBadges }
  }

  /**
   * Streak güncelle (RPC çağrısı)
   */
  async function updateStreak(studentId: string): Promise<number> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any).rpc('update_student_streak', {
      p_student_id: studentId,
    })
    return data ?? 0
  }

  /**
   * Öğrencinin güncel istatistiklerini çek
   */
  async function getStudentStats(studentId: string): Promise<StudentStats | null> {
    const { data: student } = await supabase
      .from('students')
      .select('streak_days, current_arp, current_comprehension, has_completed_diagnostic')
      .eq('id', studentId)
      .single()

    if (!student) return null

    const { count: sessionCount } = await supabase
      .from('sessions')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', studentId)
      .eq('is_completed', true)

    return {
      totalSessions: sessionCount ?? 0,
      streakDays: student.streak_days ?? 0,
      currentArp: student.current_arp ?? 0,
      maxComprehension: student.current_comprehension ?? 0,
      hasCompletedDiagnostic: student.has_completed_diagnostic ?? false,
    }
  }

  return { checkAndAwardBadges, getStudentBadges, updateStreak, getStudentStats }
}

function conditionMet(
  conditionType: string,
  conditionValue: number,
  stats: StudentStats
): boolean {
  switch (conditionType) {
    case 'sessions_count':     return stats.totalSessions >= conditionValue
    case 'streak_days':        return stats.streakDays >= conditionValue
    case 'arp_reach':          return stats.currentArp >= conditionValue
    case 'comprehension_reach':return stats.maxComprehension >= conditionValue
    case 'diagnostic':         return stats.hasCompletedDiagnostic
    default:                   return false
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapBadge(b: any): Badge {
  return {
    id: b.id,
    code: b.code,
    name: b.name,
    description: b.description,
    iconName: b.icon_name,
    color: b.color,
    category: b.category,
    rarity: b.rarity,
    conditionType: b.condition_type,
    conditionValue: b.condition_value,
    xpReward: b.xp_reward,
  }
}
