// =====================================================
// mentorService.ts — Sprint 9: AI Academic Mentor
// Factory pattern — createMentorService(supabase)
// =====================================================

import type { SupabaseClient } from '@supabase/supabase-js'
import type { AiMentorFeedback } from '../library/types'

type Result<T> = Promise<{ data: T | null; error: string | null }>

export function createMentorService(supabase: SupabaseClient<any>) {

  async function getAuthUserId(): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser()
    return user?.id ?? null
  }

  return {
    /** Kullanıcının en güncel mentor geri bildirimini getir */
    async getLatestFeedback(): Result<AiMentorFeedback> {
      const userId = await getAuthUserId()
      if (!userId) return { data: null, error: 'Not authenticated' }

      const { data, error } = await supabase
        .from('ai_mentor_feedback')
        .select('*')
        .eq('user_id', userId)
        .order('generated_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) return { data: null, error: error.message }
      return { data: data ?? null, error: null }
    },

    /** Edge Function'ı çağırarak yeni mentor geri bildirimi üret */
    async generateFeedback(): Result<AiMentorFeedback> {
      try {
        const { data, error } = await supabase.functions.invoke(
          'generate-mentor-feedback',
        )
        if (error) return { data: null, error: error.message }
        if (data?.error === 'insufficient_data') {
          return { data: null, error: 'insufficient_data' }
        }
        return { data: data?.data ?? null, error: null }
      } catch (e: any) {
        return { data: null, error: e.message ?? 'Unknown error' }
      }
    },

    /** Geri bildirimi görüldü olarak işaretle */
    async markSeen(id: string): Promise<void> {
      await supabase
        .from('ai_mentor_feedback')
        .update({ seen_at: new Date().toISOString() })
        .eq('id', id)
    },
  }
}

export type MentorService = ReturnType<typeof createMentorService>
