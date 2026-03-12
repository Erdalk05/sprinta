/**
 * usePendingContent
 * pendingReadingStore'dan metin alır, Supabase'den body'yi fetch eder,
 * ImportedContent'e dönüştürür ve clear() çağırır.
 *
 * Tüm egzersiz route'ları bu hook'u kullanır.
 */
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { usePendingReadingStore } from '../stores/pendingReadingStore'
import type { ImportedContent } from '../components/exercises/shared/ContentImportModal'

interface UsePendingContentResult {
  /** Henüz hazır değil — null ile render etme */
  ready:          boolean
  initialContent: ImportedContent | undefined
}

export function usePendingContent(): UsePendingContentResult {
  const { pending, clear } = usePendingReadingStore()
  const [initialContent, setInitialContent] = useState<ImportedContent | undefined>(undefined)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (!pending) { setReady(true); return }
      try {
        // Yapıştırılan özel metin — Supabase fetch gerekmez
        if (pending.customText) {
          const wc  = pending.wordCount || pending.customText.split(/\s+/).length
          const min = Math.max(1, Math.round(wc / 250))
          if (!cancelled) {
            setInitialContent({
              text:             pending.customText,
              title:            pending.title,
              wordCount:        wc,
              source:           'text',
              estimatedMinutes: min,
            })
          }
        } else {
          const { data } = await supabase
            .from('text_library')
            .select('body')
            .eq('id', pending.textId)
            .single()
          if (!cancelled && data?.body) {
            const wc  = pending.wordCount || data.body.split(/\s+/).length
            const min = Math.max(1, Math.round(wc / 250))
            setInitialContent({
              text:             data.body,
              title:            pending.title,
              wordCount:        wc,
              source:           'library',
              estimatedMinutes: min,
              libraryTextId:    pending.textId,
            })
          }
        }
      } catch { /* sessiz */ } finally {
        if (!cancelled) {
          clear()
          setReady(true)
        }
      }
    }
    load()
    return () => { cancelled = true }
  }, []) // Yalnızca mount'ta çalışır

  return { ready, initialContent }
}
