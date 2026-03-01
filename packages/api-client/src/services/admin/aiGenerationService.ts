// =====================================================
// aiGenerationService — Sprint 6
// Edge Function üzerinden Claude Haiku metadata üretimi
// =====================================================

import type { SupabaseClient } from '@supabase/supabase-js'
import type { LibraryServiceResult, ExamType, AiMetadata } from '../library/types'
import { createAdminContentService } from './adminContentService'

export interface AiGenerationRequest {
  textId:   string
  body:     string
  examType: ExamType
}

export interface AiGenerationResponse {
  summary:    string
  difficulty: number
  keywords:   string[]
  examTags:   string[]
}

export function createAiGenerationService(supabase: SupabaseClient) {
  const adminService = createAdminContentService(supabase)

  async function generateAiMetadata(
    request: AiGenerationRequest,
  ): Promise<LibraryServiceResult<AiGenerationResponse>> {
    try {
      // ── Edge Function çağrısı ─────────────────────
      const { data, error } = await supabase.functions.invoke<AiGenerationResponse>(
        'generate-metadata',
        {
          body: {
            text_id:   request.textId,
            body:      request.body,
            exam_type: request.examType,
          },
        },
      )

      if (error) {
        console.warn('Edge Function hatası:', error)
        return { data: null, error: 'AI servisi şu an kullanılamıyor.' }
      }
      if (!data) {
        return { data: null, error: 'AI yanıtı boş döndü.' }
      }

      // ── Başarılıysa metadata kaydet ───────────────
      const saveInput: Omit<AiMetadata, 'text_id' | 'generated_at'> = {
        ai_summary:    data.summary,
        ai_difficulty: data.difficulty,
        ai_keywords:   data.keywords,
        ai_exam_tags:  data.examTags,
        model_used:    'claude-haiku-4-5-20251001',
      }
      await adminService.saveAiMetadata(request.textId, saveInput)

      return { data, error: null }
    } catch (e) {
      console.warn('generateAiMetadata hatası:', e)
      return { data: null, error: 'AI metadata üretilemedi.' }
    }
  }

  return { generateAiMetadata }
}

export type AiGenerationService = ReturnType<typeof createAiGenerationService>
