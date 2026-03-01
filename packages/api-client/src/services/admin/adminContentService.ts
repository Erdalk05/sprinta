// =====================================================
// adminContentService — Sprint 6
// Admin CRUD: text, chapters, cover upload, analytics
// =====================================================

import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  LibraryServiceResult,
  TextItemExtended,
  TextChapter,
  ContentAnalytics,
  AiMetadata,
  CreateTextInput,
  UpdateTextInput,
  CreateChapterInput,
  UpdateChapterInput,
  ChapterReorderInput,
} from '../library/types'

export function createAdminContentService(supabase: SupabaseClient) {
  // ── helpers ──────────────────────────────────────────
  function ok<T>(data: T): LibraryServiceResult<T> {
    return { data, error: null }
  }
  function err<T>(msg: string): LibraryServiceResult<T> {
    return { data: null, error: msg }
  }

  // ─────────────────────────────────────────────────────
  // TEXT CRUD
  // ─────────────────────────────────────────────────────

  async function createText(
    input: CreateTextInput,
  ): Promise<LibraryServiceResult<TextItemExtended>> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('text_library')
        .insert({
          title:               input.title,
          description:         input.description,
          category:            input.category,
          exam_type:           input.exam_type,
          difficulty:          input.difficulty,
          estimated_read_time: input.estimated_read_time,
          cover_url:           input.cover_url ?? null,
          status:              input.status,
          tags:                input.tags,
          created_by:          user?.id ?? null,
          version:             1,
        })
        .select()
        .single()

      if (error) return err(error.message)
      return ok(data as TextItemExtended)
    } catch (e) {
      console.warn('createText hatası:', e)
      return err('İçerik oluşturulamadı.')
    }
  }

  async function updateText(
    input: UpdateTextInput,
  ): Promise<LibraryServiceResult<TextItemExtended>> {
    try {
      const { id, ...rest } = input
      // version artır
      const { data: current } = await supabase
        .from('text_library')
        .select('version')
        .eq('id', id)
        .single()
      const nextVersion = ((current?.version as number | null) ?? 1) + 1

      const { data, error } = await supabase
        .from('text_library')
        .update({ ...rest, version: nextVersion })
        .eq('id', id)
        .select()
        .single()

      if (error) return err(error.message)
      return ok(data as TextItemExtended)
    } catch (e) {
      console.warn('updateText hatası:', e)
      return err('İçerik güncellenemedi.')
    }
  }

  async function publishText(
    textId: string,
  ): Promise<LibraryServiceResult<TextItemExtended>> {
    try {
      const { data, error } = await supabase
        .from('text_library')
        .update({ status: 'published', published_at: new Date().toISOString() })
        .eq('id', textId)
        .select()
        .single()

      if (error) return err(error.message)
      return ok(data as TextItemExtended)
    } catch (e) {
      console.warn('publishText hatası:', e)
      return err('Yayına alınamadı.')
    }
  }

  async function archiveText(
    textId: string,
  ): Promise<LibraryServiceResult<TextItemExtended>> {
    try {
      const { data, error } = await supabase
        .from('text_library')
        .update({ status: 'archived' })
        .eq('id', textId)
        .select()
        .single()

      if (error) return err(error.message)
      return ok(data as TextItemExtended)
    } catch (e) {
      console.warn('archiveText hatası:', e)
      return err('Arşivlenemedi.')
    }
  }

  async function getAllTextsAdmin(): Promise<LibraryServiceResult<TextItemExtended[]>> {
    try {
      const { data, error } = await supabase
        .from('text_library')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) return err(error.message)
      return ok((data ?? []) as TextItemExtended[])
    } catch (e) {
      console.warn('getAllTextsAdmin hatası:', e)
      return err('İçerikler alınamadı.')
    }
  }

  // ─────────────────────────────────────────────────────
  // CHAPTER CRUD
  // ─────────────────────────────────────────────────────

  async function createChapter(
    input: CreateChapterInput,
  ): Promise<LibraryServiceResult<TextChapter>> {
    try {
      const { data, error } = await supabase
        .from('text_chapters')
        .insert({
          text_id:        input.text_id,
          chapter_number: input.chapter_number,
          title:          input.title,
          body:           input.body,
          status:         input.status,
          version:        1,
        })
        .select()
        .single()

      if (error) return err(error.message)
      return ok(data as TextChapter)
    } catch (e) {
      console.warn('createChapter hatası:', e)
      return err('Bölüm oluşturulamadı.')
    }
  }

  async function updateChapter(
    input: UpdateChapterInput,
  ): Promise<LibraryServiceResult<TextChapter>> {
    try {
      const { id, ...rest } = input
      const { data: current } = await supabase
        .from('text_chapters')
        .select('version')
        .eq('id', id)
        .single()
      const nextVersion = ((current?.version as number | null) ?? 1) + 1

      const { data, error } = await supabase
        .from('text_chapters')
        .update({ ...rest, version: nextVersion })
        .eq('id', id)
        .select()
        .single()

      if (error) return err(error.message)
      return ok(data as TextChapter)
    } catch (e) {
      console.warn('updateChapter hatası:', e)
      return err('Bölüm güncellenemedi.')
    }
  }

  async function deleteChapter(
    chapterId: string,
  ): Promise<LibraryServiceResult<void>> {
    try {
      // Yalnızca taslak bölümler silinebilir
      const { data: ch } = await supabase
        .from('text_chapters')
        .select('status')
        .eq('id', chapterId)
        .single()

      if (!ch) return err('Bölüm bulunamadı.')
      if ((ch.status as string) === 'published') {
        return err('Yayındaki bölümler silinemez. Önce taslağa alın.')
      }

      const { error } = await supabase
        .from('text_chapters')
        .delete()
        .eq('id', chapterId)

      if (error) return err(error.message)
      return ok(undefined)
    } catch (e) {
      console.warn('deleteChapter hatası:', e)
      return err('Bölüm silinemedi.')
    }
  }

  async function reorderChapters(
    textId: string,
    chapters: ChapterReorderInput[],
  ): Promise<LibraryServiceResult<void>> {
    try {
      await Promise.all(
        chapters.map(ch =>
          supabase
            .from('text_chapters')
            .update({ chapter_number: ch.chapter_number })
            .eq('id', ch.id)
            .eq('text_id', textId),
        ),
      )
      return ok(undefined)
    } catch (e) {
      console.warn('reorderChapters hatası:', e)
      return err('Sıralama kaydedilemedi.')
    }
  }

  // ─────────────────────────────────────────────────────
  // COVER UPLOAD
  // ─────────────────────────────────────────────────────

  async function uploadCover(
    file: File,
    textId: string,
  ): Promise<LibraryServiceResult<string>> {
    try {
      const ext       = file.name.split('.').pop() ?? 'jpg'
      const path      = `covers/${textId}/${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('covers').upload(path, file)

      if (error) return err(error.message)

      const { data: { publicUrl } } = supabase.storage
        .from('covers')
        .getPublicUrl(path)

      // cover_url'i metne kaydet
      await updateText({ id: textId, cover_url: publicUrl })

      return ok(publicUrl)
    } catch (e) {
      console.warn('uploadCover hatası:', e)
      return err('Kapak görseli yüklenemedi.')
    }
  }

  // ─────────────────────────────────────────────────────
  // ANALYTICS
  // ─────────────────────────────────────────────────────

  async function getContentAnalytics(): Promise<LibraryServiceResult<ContentAnalytics[]>> {
    try {
      const { data, error } = await supabase
        .from('content_analytics')
        .select('*')
        .order('total_readers', { ascending: false })

      if (error) return err(error.message)
      return ok((data ?? []) as ContentAnalytics[])
    } catch (e) {
      console.warn('getContentAnalytics hatası:', e)
      return err('Analitik veriler alınamadı.')
    }
  }

  async function getTextAnalytics(
    textId: string,
  ): Promise<LibraryServiceResult<ContentAnalytics>> {
    try {
      const { data, error } = await supabase
        .from('content_analytics')
        .select('*')
        .eq('text_id', textId)
        .single()

      if (error) return err(error.message)
      return ok(data as ContentAnalytics)
    } catch (e) {
      console.warn('getTextAnalytics hatası:', e)
      return err('Analitik veri alınamadı.')
    }
  }

  // ─────────────────────────────────────────────────────
  // AI METADATA
  // ─────────────────────────────────────────────────────

  async function getAiMetadata(
    textId: string,
  ): Promise<LibraryServiceResult<AiMetadata | null>> {
    try {
      const { data, error } = await supabase
        .from('text_ai_metadata')
        .select('*')
        .eq('text_id', textId)
        .maybeSingle()

      if (error) return err(error.message)
      return ok(data as AiMetadata | null)
    } catch (e) {
      console.warn('getAiMetadata hatası:', e)
      return err('AI metadata alınamadı.')
    }
  }

  async function saveAiMetadata(
    textId: string,
    metadata: Omit<AiMetadata, 'text_id' | 'generated_at'>,
  ): Promise<LibraryServiceResult<AiMetadata>> {
    try {
      const { data, error } = await supabase
        .from('text_ai_metadata')
        .upsert(
          {
            text_id:      textId,
            ai_summary:   metadata.ai_summary,
            ai_difficulty: metadata.ai_difficulty,
            ai_keywords:  metadata.ai_keywords,
            ai_exam_tags: metadata.ai_exam_tags,
            model_used:   metadata.model_used,
            generated_at: new Date().toISOString(),
          },
          { onConflict: 'text_id' },
        )
        .select()
        .single()

      if (error) return err(error.message)
      return ok(data as AiMetadata)
    } catch (e) {
      console.warn('saveAiMetadata hatası:', e)
      return err('AI metadata kaydedilemedi.')
    }
  }

  return {
    // Text
    createText,
    updateText,
    publishText,
    archiveText,
    getAllTextsAdmin,
    // Chapter
    createChapter,
    updateChapter,
    deleteChapter,
    reorderChapters,
    // Cover
    uploadCover,
    // Analytics
    getContentAnalytics,
    getTextAnalytics,
    // AI Metadata
    getAiMetadata,
    saveAiMetadata,
  }
}

export type AdminContentService = ReturnType<typeof createAdminContentService>
