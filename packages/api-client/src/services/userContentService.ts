// eslint-disable-next-line @typescript-eslint/no-explicit-any
import type { SupabaseClient } from '@supabase/supabase-js'

// ─── Tipler ──────────────────────────────────────────────────────
export interface UserContent {
  id: string
  user_id: string
  source_type: 'pdf' | 'docx' | 'url' | 'text' | 'epub'
  source_name: string
  source_url?: string
  source_file_path?: string
  full_text: string
  total_words: number
  total_paragraphs: number
  detected_language: string
  detected_topics: string[]
  readability_score: number | null
  suggested_category: string | null
  status: 'processing' | 'ready' | 'error'
  error_message?: string
  is_favorite: boolean
  last_read_at: string | null
  created_at: string
  updated_at: string
}

export interface UserContentChunk {
  id: string
  content_id: string
  user_id: string
  chunk_index: number
  chunk_text: string
  word_count: number
  paragraph_start: number
  paragraph_end: number
  is_completed: boolean
  completed_at: string | null
  session_id: string | null
  wpm: number | null
  comprehension: number | null
  score: number | null
  created_at: string
}

export interface ContentAnalysis {
  totalWords: number
  totalParagraphs: number
  detectedLanguage: string
  detectedTopics: string[]
  readabilityScore: number
  suggestedCategory: string
  estimatedReadingMinutes: number
}

export interface SuggestedChunk {
  index: number
  text: string
  wordCount: number
  paragraphStart: number
  paragraphEnd: number
  estimatedMinutes: number
}

// ─── Yardımcı fonksiyonlar ────────────────────────────────────────

/**
 * Metni paragraflara böl (boş satır ayıracı)
 */
function splitIntoParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 20)
}

/**
 * Kelime sayısını hesapla
 */
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

/**
 * Basit okunabilirlik skoru (0-100)
 * Ortalama cümle uzunluğu + ortalama kelime uzunluğuna göre
 */
function calcReadabilityScore(text: string): number {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)
  if (sentences.length === 0) return 50
  const avgWords = countWords(text) / sentences.length
  const avgChars =
    text.replace(/\s/g, '').length / Math.max(countWords(text), 1)
  // Flesch-Kincaid benzeri basit formül (100 = çok kolay, 0 = çok zor)
  const score = Math.max(0, Math.min(100, 100 - avgWords * 1.5 - avgChars * 2))
  return Math.round(score)
}

/**
 * İçerikten konu tahmini yap (basit keyword matching)
 */
function detectTopics(text: string): string[] {
  const lower = text.toLowerCase()
  const topicKeywords: Record<string, string[]> = {
    bilim: ['deney', 'atom', 'molekül', 'fizik', 'kimya', 'biyoloji', 'hücre'],
    tarih: ['savaş', 'imparatorluk', 'osmanlı', 'cumhuriyet', 'devrim', 'sultan'],
    teknoloji: ['yapay zeka', 'yazılım', 'algoritma', 'robot', 'internet', 'veri'],
    felsefe: ['mantık', 'etik', 'var olmak', 'bilinç', 'kant', 'platon', 'aristo'],
    psikoloji: ['duygu', 'davranış', 'bellek', 'bilinçaltı', 'terapi', 'anksiyete'],
    edebiyat: ['roman', 'şiir', 'yazar', 'karakter', 'anlatı', 'mecaz', 'edebi'],
    cografya: ['iklim', 'coğrafi', 'kıta', 'okyanus', 'dağ', 'nehir', 'nüfus'],
    saglik: ['hastalık', 'tedavi', 'vitamin', 'bağışıklık', 'beslenme', 'tıp'],
  }
  return Object.entries(topicKeywords)
    .filter(([, kws]) => kws.some((kw) => lower.includes(kw)))
    .map(([topic]) => topic)
    .slice(0, 3)
}

/**
 * Metni chunk'lara böl — paragraf sınırlarına dikkat eder
 */
export function suggestChunks(
  fullText: string,
  targetMinutesPerChunk: number,
  wpm: number = 250,
): SuggestedChunk[] {
  const paragraphs = splitIntoParagraphs(fullText)
  const targetWords = wpm * targetMinutesPerChunk

  const chunks: SuggestedChunk[] = []
  let currentParas: string[] = []
  let currentWords = 0
  let paraStart = 0

  for (let i = 0; i < paragraphs.length; i++) {
    const para = paragraphs[i]
    const wc = countWords(para)

    if (currentWords + wc > targetWords * 1.2 && currentParas.length > 0) {
      // Chunk tamamlandı
      const chunkText = currentParas.join('\n\n')
      chunks.push({
        index: chunks.length,
        text: chunkText,
        wordCount: currentWords,
        paragraphStart: paraStart,
        paragraphEnd: i - 1,
        estimatedMinutes: Math.ceil(currentWords / wpm),
      })
      currentParas = [para]
      currentWords = wc
      paraStart = i
    } else {
      currentParas.push(para)
      currentWords += wc
    }
  }

  // Son chunk
  if (currentParas.length > 0) {
    const chunkText = currentParas.join('\n\n')
    chunks.push({
      index: chunks.length,
      text: chunkText,
      wordCount: currentWords,
      paragraphStart: paraStart,
      paragraphEnd: paragraphs.length - 1,
      estimatedMinutes: Math.ceil(currentWords / wpm),
    })
  }

  return chunks
}

/**
 * Metin analizi yap (senkron, client-side)
 */
export function analyzeContent(fullText: string): ContentAnalysis {
  const paragraphs = splitIntoParagraphs(fullText)
  const totalWords = countWords(fullText)
  const topics = detectTopics(fullText)
  const readabilityScore = calcReadabilityScore(fullText)

  // Dil tespiti (basit heuristik)
  const turkishChars = (fullText.match(/[çğıöşüÇĞİÖŞÜ]/g) || []).length
  const detectedLanguage = turkishChars > 5 ? 'tr' : 'en'

  return {
    totalWords,
    totalParagraphs: paragraphs.length,
    detectedLanguage,
    detectedTopics: topics,
    readabilityScore,
    suggestedCategory: topics[0] ?? 'genel',
    estimatedReadingMinutes: Math.ceil(totalWords / 250),
  }
}

// ─── Service factory ──────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createUserContentService(supabase: SupabaseClient<any>) {
  return {
    /**
     * İçeriği Supabase'e kaydet (chunks dahil)
     */
    async saveUserContent(params: {
      userId: string
      sourceType: UserContent['source_type']
      sourceName: string
      sourceUrl?: string
      fullText: string
      analysis: ContentAnalysis
      chunks: SuggestedChunk[]
    }): Promise<{ contentId: string; error: Error | null }> {
      // 1. Ana içerik kaydı
      const { data: content, error: contentErr } = await supabase
        .from('user_contents')
        .insert({
          user_id: params.userId,
          source_type: params.sourceType,
          source_name: params.sourceName,
          source_url: params.sourceUrl ?? null,
          full_text: params.fullText,
          total_words: params.analysis.totalWords,
          total_paragraphs: params.analysis.totalParagraphs,
          detected_language: params.analysis.detectedLanguage,
          detected_topics: params.analysis.detectedTopics,
          readability_score: params.analysis.readabilityScore,
          suggested_category: params.analysis.suggestedCategory,
          status: 'ready',
        })
        .select('id')
        .single()

      if (contentErr || !content) {
        return { contentId: '', error: new Error(contentErr?.message ?? 'İçerik kaydedilemedi') }
      }

      // 2. Chunk'ları kaydet
      const chunkRows = params.chunks.map((c) => ({
        content_id: content.id,
        user_id: params.userId,
        chunk_index: c.index,
        chunk_text: c.text,
        word_count: c.wordCount,
        paragraph_start: c.paragraphStart,
        paragraph_end: c.paragraphEnd,
      }))

      const { error: chunkErr } = await supabase
        .from('user_content_chunks')
        .insert(chunkRows)

      if (chunkErr) {
        // Rollback: içeriği sil
        await supabase.from('user_contents').delete().eq('id', content.id)
        return { contentId: '', error: new Error(chunkErr.message) }
      }

      return { contentId: content.id, error: null }
    },

    /**
     * Kullanıcının içerik listesini getir
     */
    async getUserContents(userId: string): Promise<UserContent[]> {
      const { data, error } = await supabase
        .from('user_contents')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'ready')
        .order('created_at', { ascending: false })

      if (error || !data) return []
      return data as UserContent[]
    },

    /**
     * Belirli bir içeriğin chunk'larını getir
     */
    async getContentChunks(contentId: string): Promise<UserContentChunk[]> {
      const { data, error } = await supabase
        .from('user_content_chunks')
        .select('*')
        .eq('content_id', contentId)
        .order('chunk_index', { ascending: true })

      if (error || !data) return []
      return data as UserContentChunk[]
    },

    /**
     * Chunk'ı tamamlandı olarak işaretle
     */
    async markChunkCompleted(params: {
      chunkId: string
      sessionId?: string
      wpm?: number
      comprehension?: number
      score?: number
    }): Promise<void> {
      await supabase
        .from('user_content_chunks')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
          session_id: params.sessionId ?? null,
          wpm: params.wpm ?? null,
          comprehension: params.comprehension ?? null,
          score: params.score ?? null,
        })
        .eq('id', params.chunkId)
    },

    /**
     * İçeriği favorilere ekle/çıkar
     */
    async toggleFavorite(contentId: string, isFavorite: boolean): Promise<void> {
      await supabase
        .from('user_contents')
        .update({ is_favorite: isFavorite })
        .eq('id', contentId)
    },

    /**
     * İçeriği sil (cascade ile chunk'lar da silinir)
     */
    async deleteContent(contentId: string): Promise<void> {
      await supabase.from('user_contents').delete().eq('id', contentId)
    },
  }
}
