// eslint-disable-next-line @typescript-eslint/no-explicit-any
import type { SupabaseClient } from '@supabase/supabase-js'
import type { EyeMetrics, CategoryType } from '@sprinta/shared'

export interface EyeSessionPayload {
  studentId: string
  exerciseId: string
  category: CategoryType
  difficulty: 1 | 2 | 3 | 4
  durationSeconds: number
  metrics: EyeMetrics
  xpEarned: number
  isBoss?: boolean
}

export interface EyeProgressEntry {
  exerciseId: string
  category: CategoryType
  bestAccuracy: number
  bestVisualAttention: number
  sessionCount: number
  lastPlayedAt: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createEyeTrainingService(supabase: SupabaseClient<any>) {
  /**
   * Göz antrenman seansını Supabase'e kaydet
   */
  async function saveSession(payload: EyeSessionPayload): Promise<string | null> {
    const { data, error } = await supabase
      .from('eye_training_sessions')
      .insert({
        student_id:              payload.studentId,
        exercise_id:             payload.exerciseId,
        category:                payload.category,
        difficulty:              payload.difficulty,
        duration_seconds:        payload.durationSeconds,
        reaction_time_ms:        payload.metrics.reactionTimeMs,
        accuracy_percent:        payload.metrics.accuracyPercent,
        tracking_error_px:       payload.metrics.trackingErrorPx,
        visual_attention_score:  payload.metrics.visualAttentionScore,
        saccadic_speed_estimate: payload.metrics.saccadicSpeedEstimate,
        task_completion_ms:      payload.metrics.taskCompletionMs,
        arp_contribution:        payload.metrics.arpContribution,
        xp_earned:               payload.xpEarned,
        is_boss:                 payload.isBoss ?? false,
      })
      .select('id')
      .single()

    if (error) {
      console.error('[eyeTrainingService] saveSession error:', error.message)
      return null
    }
    return data?.id ?? null
  }

  /**
   * Öğrencinin tamamladığı egzersizleri döner
   */
  async function getUserProgress(studentId: string): Promise<EyeProgressEntry[]> {
    const { data, error } = await supabase
      .from('eye_training_sessions')
      .select('exercise_id, category, accuracy_percent, visual_attention_score, created_at')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })

    if (error || !data) return []

    // Her egzersiz için en iyi skor
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const map = new Map<string, EyeProgressEntry>()
    for (const row of data) {
      const existing = map.get(row.exercise_id)
      if (!existing) {
        map.set(row.exercise_id, {
          exerciseId:          row.exercise_id,
          category:            row.category as CategoryType,
          bestAccuracy:        row.accuracy_percent,
          bestVisualAttention: row.visual_attention_score,
          sessionCount:        1,
          lastPlayedAt:        row.created_at,
        })
      } else {
        existing.sessionCount++
        if (row.accuracy_percent > existing.bestAccuracy) {
          existing.bestAccuracy = row.accuracy_percent
        }
        if (row.visual_attention_score > existing.bestVisualAttention) {
          existing.bestVisualAttention = row.visual_attention_score
        }
      }
    }
    return Array.from(map.values())
  }

  /**
   * Öğrencinin en zayıf kategorisini döner
   */
  async function getWeakestCategory(studentId: string): Promise<CategoryType | null> {
    const { data, error } = await supabase
      .from('eye_training_sessions')
      .select('category, visual_attention_score')
      .eq('student_id', studentId)

    if (error || !data || data.length === 0) return null

    const sums: Record<string, { total: number; count: number }> = {
      saccadic:   { total: 0, count: 0 },
      peripheral: { total: 0, count: 0 },
      tracking:   { total: 0, count: 0 },
    }

    for (const row of data) {
      if (sums[row.category]) {
        sums[row.category].total += row.visual_attention_score
        sums[row.category].count++
      }
    }

    let weakest: CategoryType | null = null
    let lowestAvg = Infinity

    for (const [cat, s] of Object.entries(sums)) {
      if (s.count === 0) continue
      const avg = s.total / s.count
      if (avg < lowestAvg) {
        lowestAvg = avg
        weakest = cat as CategoryType
      }
    }

    return weakest
  }

  return { saveSession, getUserProgress, getWeakestCategory }
}
