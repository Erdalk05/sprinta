// =====================================================
// Library Core — Servis Katmanı
// contentService.ts'deki import ve client pattern'i birebir takip edildi.
// =====================================================

import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  TextItem, TextFilters, LibraryServiceResult,
  TextChapter, ReadingProgress, TextWithProgress, SaveProgressInput,
} from './types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createLibraryService(supabase: SupabaseClient<any>) {
  return {
    /**
     * Tüm metinleri getir — created_at DESC sıralı
     */
    async getAllTexts(): Promise<LibraryServiceResult<TextItem[]>> {
      try {
        const { data, error } = await supabase
          .from('text_library')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) return { data: null, error: error.message }
        return { data: (data ?? []) as TextItem[], error: null }
      } catch (err) {
        return { data: null, error: err instanceof Error ? err.message : 'Bilinmeyen hata' }
      }
    },

    /**
     * Sınav türüne göre metinleri getir — difficulty ASC sıralı
     */
    async getTextsByExamType(
      examType: TextItem['exam_type']
    ): Promise<LibraryServiceResult<TextItem[]>> {
      try {
        const { data, error } = await supabase
          .from('text_library')
          .select('*')
          .eq('exam_type', examType)
          .order('difficulty', { ascending: true })

        if (error) return { data: null, error: error.message }
        return { data: (data ?? []) as TextItem[], error: null }
      } catch (err) {
        return { data: null, error: err instanceof Error ? err.message : 'Bilinmeyen hata' }
      }
    },

    /**
     * Kategoriye göre metinleri getir
     */
    async getTextsByCategory(
      category: string
    ): Promise<LibraryServiceResult<TextItem[]>> {
      try {
        const { data, error } = await supabase
          .from('text_library')
          .select('*')
          .eq('category', category)
          .order('created_at', { ascending: false })

        if (error) return { data: null, error: error.message }
        return { data: (data ?? []) as TextItem[], error: null }
      } catch (err) {
        return { data: null, error: err instanceof Error ? err.message : 'Bilinmeyen hata' }
      }
    },

    /**
     * Dinamik filtrelerle metinleri getir
     * Boş filtreler otomatik görmezden gelinir.
     */
    async getTextsByFilters(
      filters: TextFilters
    ): Promise<LibraryServiceResult<TextItem[]>> {
      try {
        let query = supabase.from('text_library').select('*')

        if (filters.exam_type) {
          query = query.eq('exam_type', filters.exam_type)
        }
        if (filters.category) {
          query = query.eq('category', filters.category)
        }
        if (filters.difficulty !== undefined) {
          query = query.eq('difficulty', filters.difficulty)
        }
        if (filters.tags && filters.tags.length > 0) {
          query = query.overlaps('tags', filters.tags)
        }

        const { data, error } = await query.order('created_at', { ascending: false })

        if (error) return { data: null, error: error.message }
        return { data: (data ?? []) as TextItem[], error: null }
      } catch (err) {
        return { data: null, error: err instanceof Error ? err.message : 'Bilinmeyen hata' }
      }
    },

    /**
     * Tek metin getir — bulunamazsa error: 'Not found'
     */
    async getTextById(id: string): Promise<LibraryServiceResult<TextItem>> {
      try {
        const { data, error } = await supabase
          .from('text_library')
          .select('*')
          .eq('id', id)
          .single()

        if (error || !data) return { data: null, error: 'Not found' }
        return { data: data as TextItem, error: null }
      } catch (err) {
        return { data: null, error: err instanceof Error ? err.message : 'Bilinmeyen hata' }
      }
    },

    /**
     * Başlık ve gövdede tam metin arama (ilike)
     * query boşsa Supabase'e istek atmadan boş array döner.
     */
    async searchTexts(query: string): Promise<LibraryServiceResult<TextItem[]>> {
      if (!query.trim()) {
        return { data: [], error: null }
      }

      try {
        const term = `%${query.trim()}%`
        const { data, error } = await supabase
          .from('text_library')
          .select('*')
          .or(`title.ilike.${term},body.ilike.${term}`)
          .order('created_at', { ascending: false })

        if (error) return { data: null, error: error.message }
        return { data: (data ?? []) as TextItem[], error: null }
      } catch (err) {
        return { data: null, error: err instanceof Error ? err.message : 'Bilinmeyen hata' }
      }
    },

    // ── Sprint 5: Chapter + Progress metodları ───────────

    /**
     * Bir metnin tüm bölümlerini getir — chapter_number ASC
     */
    async getChaptersByText(textId: string): Promise<LibraryServiceResult<TextChapter[]>> {
      try {
        const { data, error } = await supabase
          .from('text_chapters')
          .select('*')
          .eq('text_id', textId)
          .order('chapter_number', { ascending: true })

        if (error) return { data: null, error: error.message }
        return { data: (data ?? []) as TextChapter[], error: null }
      } catch (err) {
        return { data: null, error: err instanceof Error ? err.message : 'Bilinmeyen hata' }
      }
    },

    /**
     * Tek bölüm — id'ye göre
     */
    async getChapterById(chapterId: string): Promise<LibraryServiceResult<TextChapter>> {
      try {
        const { data, error } = await supabase
          .from('text_chapters')
          .select('*')
          .eq('id', chapterId)
          .single()

        if (error || !data) return { data: null, error: 'Not found' }
        return { data: data as TextChapter, error: null }
      } catch (err) {
        return { data: null, error: err instanceof Error ? err.message : 'Bilinmeyen hata' }
      }
    },

    /**
     * Mevcut kullanıcının okuma ilerlemesi (RLS zorunlu)
     */
    async getReadingProgress(textId: string): Promise<LibraryServiceResult<ReadingProgress | null>> {
      try {
        const { data, error } = await supabase
          .from('user_reading_progress')
          .select('*')
          .eq('text_id', textId)
          .maybeSingle()

        if (error) return { data: null, error: error.message }
        return { data: (data as ReadingProgress | null) ?? null, error: null }
      } catch (err) {
        return { data: null, error: err instanceof Error ? err.message : 'Bilinmeyen hata' }
      }
    },

    /**
     * Okuma ilerlemesini kaydet — UPSERT (user_id, text_id conflict)
     */
    async saveReadingProgress(input: SaveProgressInput): Promise<LibraryServiceResult<null>> {
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser()
        if (authError || !authData.user) return { data: null, error: 'Kullanıcı bulunamadı' }

        const { error } = await supabase
          .from('user_reading_progress')
          .upsert(
            {
              user_id:    authData.user.id,
              text_id:    input.text_id,
              chapter_id: input.chapter_id,
              last_ratio: input.last_ratio,
            },
            { onConflict: 'user_id,text_id' },
          )

        if (error) return { data: null, error: error.message }
        return { data: null, error: null }
      } catch (err) {
        return { data: null, error: err instanceof Error ? err.message : 'Bilinmeyen hata' }
      }
    },

    /**
     * Metin + bölümler + ilerleme — tek çağrıda (parallel)
     */
    async getTextWithProgress(textId: string): Promise<LibraryServiceResult<TextWithProgress>> {
      try {
        const [textRes, chaptersRes, progressRes] = await Promise.all([
          supabase.from('text_library').select('*').eq('id', textId).single(),
          supabase.from('text_chapters').select('*').eq('text_id', textId).order('chapter_number', { ascending: true }),
          supabase.from('user_reading_progress').select('*').eq('text_id', textId).maybeSingle(),
        ])

        if (textRes.error || !textRes.data) return { data: null, error: 'Not found' }

        return {
          data: {
            ...(textRes.data as TextItem),
            chapters: (chaptersRes.data ?? []) as TextChapter[],
            progress: (progressRes.data as ReadingProgress | null) ?? null,
          },
          error: null,
        }
      } catch (err) {
        return { data: null, error: err instanceof Error ? err.message : 'Bilinmeyen hata' }
      }
    },

    /**
     * Metin ve bölüm numarasına göre bölüm bul (chapter navigation)
     */
    async getChapterByTextAndNumber(
      textId: string,
      chapterNumber: number,
    ): Promise<LibraryServiceResult<TextChapter>> {
      try {
        const { data, error } = await supabase
          .from('text_chapters')
          .select('*')
          .eq('text_id', textId)
          .eq('chapter_number', chapterNumber)
          .single()

        if (error || !data) return { data: null, error: 'Not found' }
        return { data: data as TextChapter, error: null }
      } catch (err) {
        return { data: null, error: err instanceof Error ? err.message : 'Bilinmeyen hata' }
      }
    },
  }
}
