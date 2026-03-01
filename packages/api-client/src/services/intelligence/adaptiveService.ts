// =====================================================
// adaptiveService.ts — Sprint 7
// Adaptive Intelligence & Performance Layer
//
// Kurallar:
//   - createAdaptiveService(supabase) factory pattern
//   - auth.uid() her zaman supabase.auth.getUser() ile alınır
//   - Hiçbir zaman client'tan difficulty gelmiyor — DB JOIN ile
//   - XP güncellemesi atomik increment_xp RPC ile
//   - Difficulty profile tek JOIN sorgusu ile güncellenir
// =====================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
import type { SupabaseClient }  from '@supabase/supabase-js'
import type {
  LibraryServiceResult,
  ChapterSession,
  RecordChapterSessionInput,
  XpUpdateResult,
  UserDifficultyProfile,
  RecommendedText,
  ChapterDropoff,
  ReadersOverTime,
  TextItem,
  ReadingStats,
  DailyReadingProgress,
} from '../library/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createAdaptiveService(supabase: SupabaseClient<any>) {

  // ─── Yardımcı: auth user id al ──────────────────────
  async function getAuthUserId(): Promise<string | null> {
    const { data, error } = await supabase.auth.getUser()
    if (error || !data.user) return null
    return data.user.id
  }

  return {

    // ─── 1. recordChapterSession ────────────────────────
    // difficulty: asla client'tan gelmez — text_library'den JOIN ile çekilir
    async recordChapterSession(
      input: RecordChapterSessionInput,
    ): Promise<LibraryServiceResult<ChapterSession>> {
      try {
        const userId = await getAuthUserId()
        if (!userId) return { data: null, error: 'Kullanıcı oturumu bulunamadı' }

        // a. Difficulty DB'den çek — asla client'tan
        const { data: textData } = await supabase
          .from('text_library')
          .select('difficulty')
          .eq('id', input.text_id)
          .single()
        const difficulty: number = (textData?.difficulty as number | null) ?? 2

        // b. XP hesapla (client tarafında, max 200)
        const durationMinutes = input.duration_seconds / 60
        const xpEarned = Math.max(0, Math.min(200, Math.round(
          (input.completion_ratio * 50) +
          (difficulty * 10) +
          (durationMinutes * 2),
        )))

        // c. Session'ı kaydet
        const { data, error } = await supabase
          .from('user_chapter_sessions')
          .insert({
            user_id:          userId,
            text_id:          input.text_id,
            chapter_id:       input.chapter_id,
            started_at:       input.started_at,
            completed_at:     new Date().toISOString(),
            duration_seconds: input.duration_seconds,
            completion_ratio: input.completion_ratio,
            avg_scroll_speed: input.avg_scroll_speed ?? null,
            xp_earned:        xpEarned,
          })
          .select()
          .single()

        if (error || !data) return { data: null, error: error?.message ?? 'Insert hatası' }

        // d. Fire-and-forget: XP + difficulty profile güncelle
        this.updateUserXp(xpEarned).catch(() => {})
        this.updateDifficultyProfile().catch(() => {})

        return { data: data as ChapterSession, error: null }
      } catch (err) {
        console.warn('[adaptiveService] recordChapterSession:', err)
        return { data: null, error: err instanceof Error ? err.message : 'Bilinmeyen hata' }
      }
    },

    // ─── 2. updateUserXp (atomik RPC) ──────────────────
    // İki adım: önce mevcut level'ı al, sonra atomik RPC
    async updateUserXp(
      xpToAdd: number,
    ): Promise<LibraryServiceResult<XpUpdateResult>> {
      try {
        const userId = await getAuthUserId()
        if (!userId) return { data: null, error: 'Kullanıcı oturumu bulunamadı' }

        // a. Mevcut level'ı kaydet (level_up tespiti için)
        const { data: before } = await supabase
          .from('students')
          .select('level')
          .eq('auth_user_id', userId)
          .single()
        const previousLevel: number = (before?.level as number | null) ?? 1

        // b. Atomik UPDATE — increment_xp RPC (race condition yok)
        const { data: rpcData, error: rpcError } = await supabase
          .rpc('increment_xp', {
            p_user_id:   userId,
            p_xp_amount: xpToAdd,
          })

        if (rpcError || !rpcData || !Array.isArray(rpcData) || rpcData.length === 0) {
          return { data: null, error: rpcError?.message ?? 'XP güncellenemedi' }
        }

        const row = rpcData[0] as { new_xp: number; new_level: number }

        return {
          data: {
            xp_earned: xpToAdd,
            new_xp:    row.new_xp,
            new_level: row.new_level,
            level_up:  row.new_level > previousLevel,
          },
          error: null,
        }
      } catch (err) {
        console.warn('[adaptiveService] updateUserXp:', err)
        return { data: null, error: err instanceof Error ? err.message : 'Bilinmeyen hata' }
      }
    },

    // ─── 3. updateDifficultyProfile (tek JOIN sorgusu) ──
    async updateDifficultyProfile(): Promise<LibraryServiceResult<UserDifficultyProfile | null>> {
      try {
        const userId = await getAuthUserId()
        if (!userId) return { data: null, error: 'Kullanıcı oturumu bulunamadı' }

        // Tek JOIN sorgusu — N+1 yok
        const { data: rows, error: fetchError } = await supabase
          .from('user_chapter_sessions')
          .select(`
            completion_ratio,
            duration_seconds,
            text_chapters!chapter_id ( word_count ),
            text_library!text_id ( difficulty )
          `)
          .eq('user_id', userId)
          .gt('duration_seconds', 0)
          .order('started_at', { ascending: false })
          .limit(10)

        if (fetchError) return { data: null, error: fetchError.message }
        if (!rows || rows.length < 2) {
          // Yeterli veri yok — mevcut profili döndür (null kabul edilebilir)
          const existing = await this.getUserDifficultyProfile()
          return { data: existing.data ?? null, error: existing.error }
        }

        // Tek JS geçişinde tüm hesaplamalar
        let totalCompletion = 0
        let totalWpm        = 0
        let validWpmCount   = 0
        const completions: number[] = []

        for (const row of rows) {
          // Supabase JS joins return arrays — unwrap first element
          const r = row as {
            completion_ratio: number
            duration_seconds: number
            text_chapters:    Array<{ word_count: number | null }> | null
            text_library:     Array<{ difficulty: number }>        | null
          }
          const wordCount   = r.text_chapters?.[0]?.word_count ?? 0
          const durationMin = r.duration_seconds / 60
          const completion  = r.completion_ratio

          totalCompletion += completion
          completions.push(completion)

          if (wordCount > 0 && durationMin > 0) {
            totalWpm += wordCount / durationMin
            validWpmCount++
          }
        }

        const avg_completion = totalCompletion / rows.length
        const avg_wpm        = validWpmCount > 0 ? totalWpm / validWpmCount : 0

        // Standart sapma (tamamlama tutarlılığı)
        const mean        = avg_completion
        const variance    = completions.reduce((sum, c) => sum + Math.pow(c - mean, 2), 0) / completions.length
        const stdDev      = Math.sqrt(variance)
        const stabilityScore = Math.max(0, 1 - Math.min(stdDev, 1))

        // Zorluk skoru
        const wpmNormalized   = Math.min(avg_wpm / 400, 1)
        const difficulty_score =
          (avg_completion  * 0.4) +
          (wpmNormalized   * 0.4) +
          (stabilityScore  * 0.2)

        // Önerilen seviye
        let recommended_level: 1 | 2 | 3 | 4 | 5 = 1
        if      (difficulty_score >= 0.75) recommended_level = 5
        else if (difficulty_score >= 0.60) recommended_level = 4
        else if (difficulty_score >= 0.45) recommended_level = 3
        else if (difficulty_score >= 0.30) recommended_level = 2
        else                               recommended_level = 1

        const profile: Omit<UserDifficultyProfile, 'recommended_level'> & { recommended_level: number } = {
          user_id:           userId,
          avg_wpm,
          avg_completion,
          difficulty_score,
          recommended_level,
          sessions_analyzed: rows.length,
          updated_at:        new Date().toISOString(),
        }

        const { data: upserted, error: upsertError } = await supabase
          .from('user_difficulty_profile')
          .upsert(profile, { onConflict: 'user_id' })
          .select()
          .single()

        if (upsertError || !upserted) return { data: null, error: upsertError?.message ?? 'Upsert hatası' }
        return { data: upserted as UserDifficultyProfile, error: null }
      } catch (err) {
        console.warn('[adaptiveService] updateDifficultyProfile:', err)
        return { data: null, error: err instanceof Error ? err.message : 'Bilinmeyen hata' }
      }
    },

    // ─── 4. getUserDifficultyProfile ────────────────────
    async getUserDifficultyProfile(): Promise<LibraryServiceResult<UserDifficultyProfile | null>> {
      try {
        const userId = await getAuthUserId()
        if (!userId) return { data: null, error: null }

        const { data, error } = await supabase
          .from('user_difficulty_profile')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle()

        if (error) return { data: null, error: error.message }
        return { data: (data as UserDifficultyProfile | null) ?? null, error: null }
      } catch (err) {
        console.warn('[adaptiveService] getUserDifficultyProfile:', err)
        return { data: null, error: err instanceof Error ? err.message : 'Bilinmeyen hata' }
      }
    },

    // ─── 5. getRecommendedTexts ─────────────────────────
    // Sprint 8: skill_focus matching — exam weak area ile önceliklendir
    async getRecommendedTexts(): Promise<LibraryServiceResult<RecommendedText[]>> {
      try {
        const userId = await getAuthUserId()
        if (!userId) return { data: [], error: null }

        const profileResult = await this.getUserDifficultyProfile()
        const level = profileResult.data?.recommended_level ?? 2

        // SPRINT 8: exam profilini de çek → zayıf alan tespiti
        const { data: examProfile } = await supabase
          .from('user_exam_profile')
          .select('main_idea_accuracy, inference_accuracy, detail_accuracy, vocabulary_accuracy')
          .eq('user_id', userId)
          .maybeSingle()

        // Zayıf skill_focus alanını bul (en düşük accuracy)
        type AccMap = {
          inference_accuracy:  number
          detail_accuracy:     number
          vocabulary_accuracy: number
          main_idea_accuracy:  number
        }
        let weakSkill: string | null = null
        if (examProfile) {
          const ep = examProfile as unknown as AccMap
          const accMap: Record<string, number> = {
            inference:  ep.inference_accuracy  ?? 1,
            detail:     ep.detail_accuracy     ?? 1,
            vocabulary: ep.vocabulary_accuracy ?? 1,
          }
          const sorted = Object.entries(accMap).sort((a, b) => a[1] - b[1])
          if (sorted[0][1] < 0.65) weakSkill = sorted[0][0]  // %65 altı = zayıf
        }

        const [textsResult, progressResult] = await Promise.all([
          supabase
            .from('text_library')
            .select('*')
            .eq('status', 'published')
            .gte('difficulty', Math.max(1, level - 1))
            .lte('difficulty', Math.min(5, level + 1))
            .order('created_at', { ascending: false })
            .limit(12),
          supabase
            .from('user_reading_progress')
            .select('text_id, last_ratio')
            .eq('user_id', userId),
        ])

        const texts    = (textsResult.data ?? []) as TextItem[]
        const progress = (progressResult.data ?? []) as Array<{ text_id: string; last_ratio: number }>
        const inProgressIds = new Set(progress.filter(p => p.last_ratio > 0).map(p => p.text_id))

        const recommended: RecommendedText[] = texts.map(text => {
          if (inProgressIds.has(text.id)) {
            return { ...text, recommendation_reason: 'resume' as const, match_score: 0.95 }
          }
          // SPRINT 8: skill_focus match (en yüksek öncelik, resume hariç)
          if (weakSkill && text.skill_focus === weakSkill) {
            return { ...text, recommendation_reason: 'skill_match' as const, match_score: 0.9 }
          }
          if (text.difficulty === level) {
            return { ...text, recommendation_reason: 'difficulty_match' as const, match_score: 0.8 }
          }
          return { ...text, recommendation_reason: 'exam_match' as const, match_score: 0.6 }
        })

        // Sırala: resume → skill_match → difficulty_match → exam_match
        const ORDER: Record<string, number> = {
          resume:           0,
          skill_match:      1,
          difficulty_match: 2,
          exam_match:       3,
        }
        recommended.sort((a, b) => ORDER[a.recommendation_reason] - ORDER[b.recommendation_reason])

        return { data: recommended.slice(0, 8), error: null }
      } catch (err) {
        console.warn('[adaptiveService] getRecommendedTexts:', err)
        return { data: null, error: err instanceof Error ? err.message : 'Bilinmeyen hata' }
      }
    },

    // ─── 6. getAdminDropoffAnalytics ────────────────────
    async getAdminDropoffAnalytics(
      textId?: string,
    ): Promise<LibraryServiceResult<ChapterDropoff[]>> {
      try {
        let query = supabase
          .from('chapter_dropoff_analytics')
          .select('*')
          .order('drop_off_pct', { ascending: false })

        if (textId) {
          query = query.eq('text_id', textId)
        }

        const { data, error } = await query
        if (error) return { data: null, error: error.message }
        return { data: (data ?? []) as ChapterDropoff[], error: null }
      } catch (err) {
        console.warn('[adaptiveService] getAdminDropoffAnalytics:', err)
        return { data: null, error: err instanceof Error ? err.message : 'Bilinmeyen hata' }
      }
    },

    // ─── 7. getReadersOverTime ───────────────────────────
    async getReadersOverTime(): Promise<LibraryServiceResult<ReadersOverTime[]>> {
      try {
        const { data, error } = await supabase
          .from('readers_over_time')
          .select('*')

        if (error) return { data: null, error: error.message }
        return { data: (data ?? []) as ReadersOverTime[], error: null }
      } catch (err) {
        console.warn('[adaptiveService] getReadersOverTime:', err)
        return { data: null, error: err instanceof Error ? err.message : 'Bilinmeyen hata' }
      }
    },

    // ─── 8. getUserStats (PerformancePanel için) ────────
    async getUserStats(): Promise<LibraryServiceResult<ReadingStats>> {
      try {
        const userId = await getAuthUserId()
        if (!userId) return { data: null, error: 'Kullanıcı oturumu bulunamadı' }

        const { data, error } = await supabase
          .from('user_chapter_sessions')
          .select('duration_seconds, completion_ratio, xp_earned, text_chapters!chapter_id(word_count)')
          .eq('user_id', userId)
          .gt('duration_seconds', 0)

        if (error) return { data: null, error: error.message }

        // Supabase JS joins return arrays — unwrap first element
        const rows = (data ?? []) as Array<{
          duration_seconds: number
          completion_ratio: number
          xp_earned: number
          text_chapters: Array<{ word_count: number | null }> | null
        }>

        let totalDuration = 0
        let totalCompletion = 0
        let totalWpm = 0
        let validWpm = 0

        for (const row of rows) {
          totalDuration   += row.duration_seconds
          totalCompletion += row.completion_ratio
          const wc = row.text_chapters?.[0]?.word_count ?? 0
          const dm = row.duration_seconds / 60
          if (wc > 0 && dm > 0) { totalWpm += wc / dm; validWpm++ }
        }

        return {
          data: {
            total_sessions:         rows.length,
            total_duration_seconds: totalDuration,
            avg_completion:         rows.length > 0 ? totalCompletion / rows.length : 0,
            avg_wpm:                validWpm > 0 ? totalWpm / validWpm : 0,
          },
          error: null,
        }
      } catch (err) {
        console.warn('[adaptiveService] getUserStats:', err)
        return { data: null, error: err instanceof Error ? err.message : 'Bilinmeyen hata' }
      }
    },

    // ─── 9. getLast7DaysProgress ────────────────────────
    async getLast7DaysProgress(): Promise<LibraryServiceResult<DailyReadingProgress[]>> {
      try {
        const userId = await getAuthUserId()
        if (!userId) return { data: null, error: 'Kullanıcı oturumu bulunamadı' }

        const since = new Date()
        since.setDate(since.getDate() - 6)
        since.setHours(0, 0, 0, 0)

        const { data, error } = await supabase
          .from('user_chapter_sessions')
          .select('started_at, xp_earned, duration_seconds')
          .eq('user_id', userId)
          .gte('started_at', since.toISOString())
          .order('started_at', { ascending: true })

        if (error) return { data: null, error: error.message }

        // Son 7 günü doldur — veri olmayan günler 0
        const map = new Map<string, DailyReadingProgress>()
        for (let i = 6; i >= 0; i--) {
          const d = new Date()
          d.setDate(d.getDate() - i)
          const key = d.toISOString().slice(0, 10)
          map.set(key, { date: key, sessions: 0, xp_earned: 0, duration_seconds: 0 })
        }

        for (const row of (data ?? []) as Array<{ started_at: string; xp_earned: number; duration_seconds: number }>) {
          const key = row.started_at.slice(0, 10)
          const entry = map.get(key)
          if (entry) {
            entry.sessions++
            entry.xp_earned        += row.xp_earned
            entry.duration_seconds += row.duration_seconds
          }
        }

        return { data: Array.from(map.values()), error: null }
      } catch (err) {
        console.warn('[adaptiveService] getLast7DaysProgress:', err)
        return { data: null, error: err instanceof Error ? err.message : 'Bilinmeyen hata' }
      }
    },

  }
}

export type AdaptiveService = ReturnType<typeof createAdaptiveService>
