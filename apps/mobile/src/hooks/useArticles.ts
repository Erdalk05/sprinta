import { useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
)

export interface Article {
  id: string
  subject_code: string
  title: string
  content_text: string
  word_count: number
  difficulty_level: number
  questions: Array<{
    question: string
    options: string[]
    correctIndex: number
  }>
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 saat

function cacheKey(subjectCode: string, examType?: string) {
  return `articles_v1_${subjectCode}_${examType ?? 'all'}`
}

/** Tek bir makaleyi ID'ye göre önbellekten oku (session.tsx için) */
export async function getArticleById(articleId: string): Promise<Article | null> {
  try {
    const raw = await AsyncStorage.getItem(`article_v1_${articleId}`)
    if (raw) return JSON.parse(raw) as Article
  } catch { /* cache miss */ }
  return null
}

export function useArticles(subjectCode: string, examType?: string) {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    const key = cacheKey(subjectCode, examType)

    try {
      // 1 — Önbellek kontrolü
      const cached = await AsyncStorage.getItem(key)
      if (cached) {
        const parsed: { data: Article[]; ts: number } = JSON.parse(cached)
        if (Date.now() - parsed.ts < CACHE_TTL_MS) {
          setArticles(parsed.data)
          setLoading(false)
          return
        }
      }

      // 2 — Supabase'den çek
      let query = supabase
        .from('articles')
        .select('id, subject_code, title, content_text, word_count, difficulty_level, questions')
        .eq('subject_code', subjectCode)
        .eq('is_published', true)
        .order('difficulty_level', { ascending: true })
        .limit(50)

      if (examType) {
        query = query.contains('target_exam', [examType])
      }

      const { data, error: dbErr } = await query
      if (dbErr) throw dbErr

      const result = (data ?? []) as Article[]
      setArticles(result)

      // 3 — Önbelleğe yaz (makale listesi + her makale ID bazlı)
      await AsyncStorage.setItem(key, JSON.stringify({ data: result, ts: Date.now() }))
      for (const art of result) {
        await AsyncStorage.setItem(`article_v1_${art.id}`, JSON.stringify(art))
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata'
      setError(msg)

      // Hata durumunda süresi dolmuş önbellekten oku (offline fallback)
      try {
        const cached = await AsyncStorage.getItem(key)
        if (cached) {
          const parsed: { data: Article[] } = JSON.parse(cached)
          setArticles(parsed.data)
        }
      } catch { /* tamamen çevrimdışı ve önbellek yok */ }
    } finally {
      setLoading(false)
    }
  }, [subjectCode, examType])

  useEffect(() => { load() }, [load])

  return { articles, loading, error, refetch: load }
}
