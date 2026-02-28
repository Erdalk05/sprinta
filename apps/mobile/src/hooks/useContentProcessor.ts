import { useState, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import {
  analyzeContent,
  suggestChunks,
  createUserContentService,
} from '@sprinta/api'
import type { ContentAnalysis, SuggestedChunk, UserContent } from '@sprinta/api'
import { useAuthStore } from '../stores/authStore'

// ─── Supabase client ──────────────────────────────────────────────
const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
)
const contentSvc = createUserContentService(supabase)

// ─── State machine durumları ──────────────────────────────────────
export type ProcessorState =
  | 'idle'
  | 'extracting'
  | 'analyzing'
  | 'chunking'
  | 'saving'
  | 'ready'
  | 'error'

export interface ProcessorResult {
  contentId: string
  sourceName: string
  analysis: ContentAnalysis
  chunks: SuggestedChunk[]
}

// ─── Hook ─────────────────────────────────────────────────────────
export function useContentProcessor() {
  const { student } = useAuthStore()

  const [state, setState] = useState<ProcessorState>('idle')
  const [progress, setProgress] = useState(0)          // 0-100
  const [error, setError] = useState<string | null>(null)

  const [rawText, setRawText] = useState<string>('')
  const [sourceName, setSourceName] = useState<string>('')
  const [sourceType, setSourceType] = useState<UserContent['source_type']>('text')
  const [sourceUrl, setSourceUrl] = useState<string | undefined>(undefined)

  const [analysis, setAnalysis] = useState<ContentAnalysis | null>(null)
  const [suggestedChunks, setSuggestedChunks] = useState<SuggestedChunk[]>([])
  const [targetMinutes, setTargetMinutes] = useState(10) // dakika/chunk
  const [result, setResult] = useState<ProcessorResult | null>(null)

  // ── İşlemek için hazırlık ──────────────────────────────────────
  const _process = useCallback(
    async (text: string, name: string, type: UserContent['source_type'], url?: string) => {
      setRawText(text)
      setSourceName(name)
      setSourceType(type)
      setSourceUrl(url)
      setError(null)
      setResult(null)

      // Analiz
      setState('analyzing')
      setProgress(30)
      const analysisResult = analyzeContent(text)
      setAnalysis(analysisResult)
      setProgress(60)

      // Chunk önerisi
      setState('chunking')
      const wpm = student?.currentArp ?? 250
      const chunks = suggestChunks(text, targetMinutes, Math.max(wpm, 150))
      setSuggestedChunks(chunks)
      setProgress(80)

      setState('ready')
      setProgress(100)
    },
    [student, targetMinutes],
  )

  // ── Metin işle ────────────────────────────────────────────────
  const processText = useCallback(
    async (text: string, name: string) => {
      setState('extracting')
      setProgress(10)
      await _process(text, name, 'text')
    },
    [_process],
  )

  // ── URL'den metin çek (Edge Function üzerinden) ───────────────
  const processURL = useCallback(
    async (url: string) => {
      setState('extracting')
      setProgress(10)
      try {
        const { data, error: fnError } = await supabase.functions.invoke('extract-text', {
          body: { url },
        })
        if (fnError || !data?.text) throw new Error(fnError?.message ?? 'Metin çıkarılamadı')
        const name = url.split('/').pop()?.split('?')[0] ?? 'URL İçeriği'
        await _process(data.text as string, name, 'url', url)
      } catch (e) {
        setState('error')
        setError(e instanceof Error ? e.message : 'URL işlenemedi')
      }
    },
    [_process],
  )

  // ── PDF / Dosya işle (base64 string) ─────────────────────────
  const processFile = useCallback(
    async (base64: string, mimeType: string, name: string) => {
      setState('extracting')
      setProgress(15)
      try {
        const { data, error: fnError } = await supabase.functions.invoke('extract-text', {
          body: { fileBase64: base64, mimeType },
        })
        if (fnError || !data?.text) throw new Error(fnError?.message ?? 'Metin çıkarılamadı')
        const type: UserContent['source_type'] = mimeType.includes('pdf') ? 'pdf' : 'docx'
        await _process(data.text as string, name, type)
      } catch (e) {
        setState('error')
        setError(e instanceof Error ? e.message : 'Dosya işlenemedi')
      }
    },
    [_process],
  )

  // ── Chunk süresini güncelle (canlı önizleme) ──────────────────
  const updateChunkSize = useCallback(
    (minutes: number) => {
      setTargetMinutes(minutes)
      if (!rawText) return
      const wpm = student?.currentArp ?? 250
      const chunks = suggestChunks(rawText, minutes, Math.max(wpm, 150))
      setSuggestedChunks(chunks)
    },
    [rawText, student],
  )

  // ── Onaylandıktan sonra kaydet ────────────────────────────────
  const confirmAndSave = useCallback(async (): Promise<string | null> => {
    if (!student || !analysis || suggestedChunks.length === 0) return null
    setState('saving')
    setProgress(50)

    const { contentId, error: saveErr } = await contentSvc.saveUserContent({
      userId: student.id,
      sourceType,
      sourceName,
      sourceUrl,
      fullText: rawText,
      analysis,
      chunks: suggestedChunks,
    })

    if (saveErr) {
      setState('error')
      setError(saveErr.message)
      return null
    }

    const processorResult: ProcessorResult = {
      contentId,
      sourceName,
      analysis,
      chunks: suggestedChunks,
    }
    setResult(processorResult)
    setState('ready')
    setProgress(100)
    return contentId
  }, [student, analysis, suggestedChunks, sourceType, sourceName, sourceUrl, rawText])

  // ── Sıfırla ──────────────────────────────────────────────────
  const reset = useCallback(() => {
    setState('idle')
    setProgress(0)
    setError(null)
    setRawText('')
    setSourceName('')
    setAnalysis(null)
    setSuggestedChunks([])
    setResult(null)
    setTargetMinutes(10)
  }, [])

  return {
    state,
    progress,
    error,
    analysis,
    suggestedChunks,
    targetMinutes,
    result,
    processText,
    processURL,
    processFile,
    updateChunkSize,
    confirmAndSave,
    reset,
  }
}
