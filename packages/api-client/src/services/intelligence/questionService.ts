// =====================================================
// questionService.ts — Sprint 10
// Metne gömülü soru alma + cevap kaydetme
// =====================================================

import type { SupabaseClient } from '@supabase/supabase-js'

export interface TextQuestion {
  id:            string
  text_id:       string
  chapter_id:    string | null
  question_type: 'main_idea' | 'inference' | 'detail' | 'vocabulary' | 'tone'
  question_text: string
  options:       string[]          // 4 seçenek
  correct_index: number
  explanation:   string | null
  difficulty:    number
  order_index:   number
}

export interface QuestionAnswer {
  questionId:         string
  textId:             string
  chapterId:          string | null
  questionType:       TextQuestion['question_type']
  isCorrect:          boolean
  responseTimeSeconds: number
}

type Result<T> = Promise<{ data: T | null; error: string | null }>

export function createQuestionService(supabase: SupabaseClient<any>) {

  async function getAuthUserId(): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser()
    return user?.id ?? null
  }

  return {
    /** Belirli bir text veya chapter için sorular */
    async getQuestions(textId: string, chapterId?: string): Result<TextQuestion[]> {
      let query = supabase
        .from('text_questions')
        .select('*')
        .eq('text_id', textId)
        .order('order_index', { ascending: true })

      if (chapterId) {
        query = query.eq('chapter_id', chapterId)
      }

      const { data, error } = await query
      if (error) return { data: null, error: error.message }
      return { data: (data as TextQuestion[]) ?? [], error: null }
    },

    /** Cevapları toplu kaydet — Sprint 8 user_question_sessions tablosuna */
    async recordAnswers(answers: QuestionAnswer[]): Promise<{ error: string | null }> {
      const userId = await getAuthUserId()
      if (!userId) return { error: 'Not authenticated' }

      const rows = answers.map(a => ({
        user_id:               userId,
        text_id:               a.textId,
        chapter_id:            a.chapterId,
        question_id:           a.questionId,
        question_type:         a.questionType,
        is_correct:            a.isCorrect,
        response_time_seconds: Math.round(a.responseTimeSeconds),
      }))

      const { error } = await supabase
        .from('user_question_sessions')
        .insert(rows)

      if (error) return { error: error.message }
      return { error: null }
    },
  }
}

export type QuestionService = ReturnType<typeof createQuestionService>
