// =====================================================
// examService.ts — Sprint 8
// Comprehension & Exam Intelligence Engine
//
// Kurallar:
//   - createExamService(supabase) factory pattern
//   - auth.uid() her zaman supabase.auth.getUser() ile alınır
//   - updateExamProfile() fire-and-forget (recordQuestionSession sonrası)
//   - Risk formula: ağırlıklı (1 - accuracy) toplamı
//   - predictExamScore: rule-based (MVP), confidence = min(questions/20, 1)
// =====================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  LibraryServiceResult,
  RecordQuestionSessionInput,
  QuestionSession,
  UserExamProfile,
  ReadingExamCorrelation,
  ExamPrediction,
  ExamAccuracyByType,
  RiskDistribution,
} from '../library/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createExamService(supabase: SupabaseClient<any>) {

  // ─── Yardımcı: auth user id al ──────────────────────
  async function getAuthUserId(): Promise<string | null> {
    const { data, error } = await supabase.auth.getUser()
    if (error || !data.user) return null
    return data.user.id
  }

  return {

    // ─── 1. recordQuestionSession ────────────────────
    async recordQuestionSession(
      input: RecordQuestionSessionInput,
    ): Promise<LibraryServiceResult<QuestionSession>> {
      try {
        const userId = await getAuthUserId()
        if (!userId) return { data: null, error: 'Kullanıcı oturumu bulunamadı' }

        const { data, error } = await supabase
          .from('user_question_sessions')
          .insert({
            user_id:               userId,
            text_id:               input.text_id,
            chapter_id:            input.chapter_id ?? null,
            question_id:           input.question_id,
            question_type:         input.question_type,
            is_correct:            input.is_correct,
            response_time_seconds: input.response_time_seconds ?? null,
          })
          .select()
          .single()

        if (error || !data) return { data: null, error: error?.message ?? 'Insert hatası' }

        // Fire-and-forget: exam profilini güncelle
        this.updateExamProfile().catch(() => {})

        return { data: data as QuestionSession, error: null }
      } catch (err) {
        console.warn('[examService] recordQuestionSession:', err)
        return { data: null, error: err instanceof Error ? err.message : 'Bilinmeyen hata' }
      }
    },

    // ─── 2. updateExamProfile ────────────────────────
    // Son 50 sorudan accuracy + risk_level hesaplar, upsert eder
    async updateExamProfile(): Promise<LibraryServiceResult<UserExamProfile>> {
      try {
        const userId = await getAuthUserId()
        if (!userId) return { data: null, error: 'Kullanıcı oturumu bulunamadı' }

        const { data: rows, error: fetchError } = await supabase
          .from('user_question_sessions')
          .select('question_type, is_correct, response_time_seconds')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50)

        if (fetchError) return { data: null, error: fetchError.message }
        if (!rows || rows.length === 0) return { data: null, error: null }

        type QRow = {
          question_type:         string
          is_correct:            boolean
          response_time_seconds: number | null
        }
        const questions = rows as QRow[]

        // Tip başına doğru / toplam say
        const counts: Record<string, { correct: number; total: number }> = {
          main_idea:  { correct: 0, total: 0 },
          inference:  { correct: 0, total: 0 },
          detail:     { correct: 0, total: 0 },
          vocabulary: { correct: 0, total: 0 },
          tone:       { correct: 0, total: 0 },
        }
        let totalTime = 0
        let timeCount = 0

        for (const q of questions) {
          const bucket = counts[q.question_type]
          if (bucket) {
            bucket.total++
            if (q.is_correct) bucket.correct++
          }
          if (q.response_time_seconds != null) {
            totalTime += q.response_time_seconds
            timeCount++
          }
        }

        const acc = (type: string): number =>
          counts[type].total > 0 ? counts[type].correct / counts[type].total : 0

        const main_idea_accuracy  = acc('main_idea')
        const inference_accuracy  = acc('inference')
        const detail_accuracy     = acc('detail')
        const vocabulary_accuracy = acc('vocabulary')
        const tone_accuracy       = acc('tone')
        const avg_response_time   = timeCount > 0 ? totalTime / timeCount : 0

        // Risk skoru (ağırlıklı hata oranı)
        const risk_score =
          (1 - main_idea_accuracy)  * 0.25 +
          (1 - inference_accuracy)  * 0.25 +
          (1 - detail_accuracy)     * 0.20 +
          (1 - vocabulary_accuracy) * 0.15 +
          (1 - tone_accuracy)       * 0.15

        let risk_level: 1 | 2 | 3 | 4 | 5 = 1
        if      (risk_score >= 0.65) risk_level = 5
        else if (risk_score >= 0.50) risk_level = 4
        else if (risk_score >= 0.35) risk_level = 3
        else if (risk_score >= 0.20) risk_level = 2
        else                         risk_level = 1

        const profile = {
          user_id: userId,
          main_idea_accuracy,
          inference_accuracy,
          detail_accuracy,
          vocabulary_accuracy,
          tone_accuracy,
          avg_response_time,
          risk_level,
          updated_at: new Date().toISOString(),
        }

        const { data: upserted, error: upsertError } = await supabase
          .from('user_exam_profile')
          .upsert(profile, { onConflict: 'user_id' })
          .select()
          .single()

        if (upsertError || !upserted) return { data: null, error: upsertError?.message ?? 'Upsert hatası' }
        return { data: upserted as UserExamProfile, error: null }
      } catch (err) {
        console.warn('[examService] updateExamProfile:', err)
        return { data: null, error: err instanceof Error ? err.message : 'Bilinmeyen hata' }
      }
    },

    // ─── 3. getExamProfile ──────────────────────────
    async getExamProfile(): Promise<LibraryServiceResult<UserExamProfile | null>> {
      try {
        const userId = await getAuthUserId()
        if (!userId) return { data: null, error: null }

        const { data, error } = await supabase
          .from('user_exam_profile')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle()

        if (error) return { data: null, error: error.message }
        return { data: (data as UserExamProfile | null) ?? null, error: null }
      } catch (err) {
        console.warn('[examService] getExamProfile:', err)
        return { data: null, error: err instanceof Error ? err.message : 'Bilinmeyen hata' }
      }
    },

    // ─── 4. getReadingExamCorrelation ───────────────
    // Okuma davranışı (user_chapter_sessions) +
    // Sınav profili (user_exam_profile) → heuristic correlation
    async getReadingExamCorrelation(): Promise<LibraryServiceResult<ReadingExamCorrelation>> {
      try {
        const userId = await getAuthUserId()
        if (!userId) return { data: null, error: 'Kullanıcı oturumu bulunamadı' }

        const [readingResult, examResult] = await Promise.all([
          supabase
            .from('user_chapter_sessions')
            .select('completion_ratio, duration_seconds, text_chapters!chapter_id(word_count)')
            .eq('user_id', userId)
            .gt('duration_seconds', 0)
            .order('started_at', { ascending: false })
            .limit(20),
          supabase
            .from('user_exam_profile')
            .select('inference_accuracy, detail_accuracy, avg_response_time, risk_level')
            .eq('user_id', userId)
            .maybeSingle(),
        ])

        // Reading istatistikleri hesapla
        type RRow = {
          completion_ratio: number
          duration_seconds: number
          text_chapters:    Array<{ word_count: number | null }> | null
        }
        const rRows = (readingResult.data ?? []) as RRow[]
        let totalCompletion = 0
        let totalWpm        = 0
        let validWpm        = 0

        for (const r of rRows) {
          totalCompletion += r.completion_ratio
          const wc = r.text_chapters?.[0]?.word_count ?? 0
          const dm = r.duration_seconds / 60
          if (wc > 0 && dm > 0) { totalWpm += wc / dm; validWpm++ }
        }

        const avg_completion = rRows.length > 0 ? totalCompletion / rRows.length : 0
        const avg_wpm        = validWpm > 0 ? totalWpm / validWpm : 0

        const exam = examResult.data as {
          inference_accuracy: number
          detail_accuracy:    number
          avg_response_time:  number
          risk_level:         number
        } | null

        const inference_accuracy = exam?.inference_accuracy ?? 0
        const detail_accuracy    = exam?.detail_accuracy    ?? 0
        const response_time      = exam?.avg_response_time  ?? 0

        // Heuristic correlation rules
        const risk_flags: string[] = []
        let reading_style: ReadingExamCorrelation['reading_style']    = 'balanced'
        let improvement_focus: ReadingExamCorrelation['improvement_focus'] = 'inference'

        const HIGH_WPM  = 280
        const LOW_WPM   = 120
        const HIGH_TIME = 20  // saniye/soru

        if (avg_wpm > HIGH_WPM && inference_accuracy < 0.55) {
          reading_style     = 'surface_reader'
          improvement_focus = 'inference'
          risk_flags.push('Hızlı ama yüzeysel okuma riski')
        } else if (avg_wpm < LOW_WPM && response_time > HIGH_TIME) {
          reading_style     = 'deep_slow'
          improvement_focus = 'speed_control'
          risk_flags.push('Yavaş analizci profil — hız egzersizi önerilir')
        } else if (avg_completion < 0.5 && detail_accuracy < 0.55) {
          reading_style     = 'surface_reader'
          improvement_focus = 'detail'
          risk_flags.push('Metin takibi zayıf — tamamlama oranı düşük')
        }

        if (inference_accuracy < 0.5 && reading_style === 'balanced') {
          improvement_focus = 'inference'
          risk_flags.push('Çıkarım soruları zayıf')
        }

        return {
          data: {
            avg_completion,
            avg_wpm,
            inference_accuracy,
            response_time,
            reading_style,
            risk_flags,
            improvement_focus,
          },
          error: null,
        }
      } catch (err) {
        console.warn('[examService] getReadingExamCorrelation:', err)
        return { data: null, error: err instanceof Error ? err.message : 'Bilinmeyen hata' }
      }
    },

    // ─── 5. predictExamScore (rule-based, MVP) ───────
    // confidence = min(total_questions / 20, 1)
    async predictExamScore(): Promise<LibraryServiceResult<ExamPrediction>> {
      try {
        const userId = await getAuthUserId()
        if (!userId) return { data: null, error: 'Kullanıcı oturumu bulunamadı' }

        const [corrResult, examResult, countResult] = await Promise.all([
          this.getReadingExamCorrelation(),
          this.getExamProfile(),
          supabase
            .from('user_question_sessions')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId),
        ])

        const corr = corrResult.data
        const exam = examResult.data

        if (!corr || !exam) {
          return { data: { predicted_exam_band: 'medium', confidence: 0.1 }, error: null }
        }

        // Normalize inputs to 0..1
        const completionScore = corr.avg_completion
        const wpmScore        = Math.min(corr.avg_wpm / 300, 1)
        const inferenceScore  = exam.inference_accuracy
        const responseScore   = corr.response_time > 0
          ? Math.max(0, 1 - corr.response_time / 30)
          : 0.5

        // Ağırlıklı composite skor
        const composite =
          completionScore  * 0.25 +
          wpmScore         * 0.20 +
          inferenceScore   * 0.35 +
          responseScore    * 0.20

        const totalQ       = countResult.count ?? 0
        const confidence   = Math.round(Math.min(1, totalQ / 20) * 100) / 100

        let predicted_exam_band: 'low' | 'medium' | 'high' = 'medium'
        if      (composite >= 0.65) predicted_exam_band = 'high'
        else if (composite <= 0.35) predicted_exam_band = 'low'

        return { data: { predicted_exam_band, confidence }, error: null }
      } catch (err) {
        console.warn('[examService] predictExamScore:', err)
        return { data: null, error: err instanceof Error ? err.message : 'Bilinmeyen hata' }
      }
    },

    // ─── 6. Admin: getExamAccuracyByType ────────────
    async getExamAccuracyByType(): Promise<LibraryServiceResult<ExamAccuracyByType[]>> {
      try {
        const { data, error } = await supabase
          .from('exam_accuracy_by_type')
          .select('*')

        if (error) return { data: null, error: error.message }
        return { data: (data ?? []) as ExamAccuracyByType[], error: null }
      } catch (err) {
        console.warn('[examService] getExamAccuracyByType:', err)
        return { data: null, error: err instanceof Error ? err.message : 'Bilinmeyen hata' }
      }
    },

    // ─── 7. Admin: getRiskDistribution ──────────────
    async getRiskDistribution(): Promise<LibraryServiceResult<RiskDistribution[]>> {
      try {
        const { data, error } = await supabase
          .from('risk_distribution')
          .select('*')

        if (error) return { data: null, error: error.message }
        return { data: (data ?? []) as RiskDistribution[], error: null }
      } catch (err) {
        console.warn('[examService] getRiskDistribution:', err)
        return { data: null, error: err instanceof Error ? err.message : 'Bilinmeyen hata' }
      }
    },

  }
}

export type ExamService = ReturnType<typeof createExamService>
