import type { SupabaseClient } from '@supabase/supabase-js'

export interface LeaderboardEntry {
  student_id:  string
  full_name:   string
  avatar_url:  string | null
  exam_target: string
  current_arp: number
  streak_days: number
  weekly_xp:   number
  arp_gain:    number
  xp_rank:     number
  arp_rank:    number
  streak_rank: number
}

export type ChallengeType = 'weekly_xp' | 'arp_gain' | 'streak'
export type ChallengeStatus = 'pending' | 'active' | 'completed' | 'declined'

export interface Challenge {
  id:               string
  challenger_id:    string
  opponent_id:      string
  status:           ChallengeStatus
  challenge_type:   ChallengeType
  duration_days:    number
  started_at:       string | null
  ends_at:          string | null
  challenger_score: number
  opponent_score:   number
  winner_id:        string | null
  created_at:       string
}

export type LeaderboardSort = 'xp' | 'arp' | 'streak'

export function createLeaderboardService(supabase: SupabaseClient) {
  return {
    /** Haftalık liderlik tablosu — ilk 50 */
    async getLeaderboard(sort: LeaderboardSort = 'xp'): Promise<LeaderboardEntry[]> {
      const rankCol = sort === 'xp'
        ? 'xp_rank' : sort === 'arp' ? 'arp_rank' : 'streak_rank'
      const { data, error } = await supabase
        .from('leaderboard_weekly')
        .select('*')
        .order(rankCol, { ascending: true })
        .limit(50)
      if (error) throw error
      return (data ?? []) as LeaderboardEntry[]
    },

    /** Öğrencinin kendi sırasını getir */
    async getMyRank(studentId: string): Promise<LeaderboardEntry | null> {
      const { data, error } = await supabase
        .from('leaderboard_weekly')
        .select('*')
        .eq('student_id', studentId)
        .single()
      if (error) return null
      return data as LeaderboardEntry
    },

    /** Meydan okuma gönder */
    async sendChallenge(params: {
      challengerId: string
      opponentId:   string
      type:         ChallengeType
      days?:        number
    }): Promise<Challenge> {
      const { data, error } = await supabase
        .from('challenges')
        .insert({
          challenger_id:  params.challengerId,
          opponent_id:    params.opponentId,
          challenge_type: params.type,
          duration_days:  params.days ?? 7,
        })
        .select()
        .single()
      if (error) throw error
      return data as Challenge
    },

    /** Gelen meydan okumayı kabul et */
    async acceptChallenge(challengeId: string): Promise<void> {
      const now = new Date()
      const ends = new Date(now.getTime() + 7 * 86400000)
      const { error } = await supabase
        .from('challenges')
        .update({
          status:     'active',
          started_at: now.toISOString(),
          ends_at:    ends.toISOString(),
        })
        .eq('id', challengeId)
      if (error) throw error
    },

    /** Meydan okumayı reddet */
    async declineChallenge(challengeId: string): Promise<void> {
      const { error } = await supabase
        .from('challenges')
        .update({ status: 'declined' })
        .eq('id', challengeId)
      if (error) throw error
    },

    /** Öğrencinin aktif meydan okumaları */
    async getMyChallenges(studentId: string): Promise<Challenge[]> {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .or(`challenger_id.eq.${studentId},opponent_id.eq.${studentId}`)
        .in('status', ['pending', 'active'])
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as Challenge[]
    },
  }
}
