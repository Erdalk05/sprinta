// Supabase Edge Function — extract-text
// PDF veya URL'den düz metin çıkarır.
// Input:  { fileBase64?: string, mimeType?: string, url?: string }
// Output: { text: string, wordCount: number, pageCount?: number }

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS })
  }

  try {
    const body = await req.json() as {
      fileBase64?: string
      mimeType?: string
      url?: string
    }

    let text = ''
    let wordCount = 0
    let pageCount: number | undefined

    // ── URL modundan metin çek ─────────────────────────────────────
    if (body.url) {
      const resp = await fetch(body.url, {
        headers: { 'User-Agent': 'Sprinta/1.0 (content-extractor)' },
      })
      if (!resp.ok) {
        return new Response(JSON.stringify({ error: `URL alınamadı: ${resp.status}` }), {
          status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
        })
      }
      const contentType = resp.headers.get('content-type') ?? ''
      const raw = await resp.text()

      if (contentType.includes('text/html')) {
        // Basit HTML → metin dönüşümü (tag'leri sil)
        text = raw
          .replace(/<script[\s\S]*?<\/script>/gi, '')
          .replace(/<style[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/\s{2,}/g, ' ')
          .trim()
      } else {
        text = raw
      }
    }

    // ── PDF / dosya modundan metin çek ────────────────────────────
    else if (body.fileBase64 && body.mimeType) {
      if (body.mimeType === 'text/plain') {
        // Düz metin: base64 decode et
        const decoded = atob(body.fileBase64)
        text = decoded
      } else if (body.mimeType.includes('pdf')) {
        // PDF: Cloudflare Workers AI veya basit binary okuma
        // Not: Deno ortamında tam PDF parse için PDF.js WASM gerekir.
        // Şimdilik: base64 → binary → metni çıkarmaya çalış (stream okuma)
        const bytes = Uint8Array.from(atob(body.fileBase64), (c) => c.charCodeAt(0))
        const decoder = new TextDecoder('utf-8', { fatal: false })
        const raw = decoder.decode(bytes)

        // PDF'ten metin akışlarını çıkar (BT ... ET blokları)
        const btMatches = raw.matchAll(/BT\s+([\s\S]*?)\s+ET/g)
        const parts: string[] = []
        for (const m of btMatches) {
          const block = m[1]
          const strMatches = block.matchAll(/\(((?:[^()\\]|\\.)*)\)/g)
          for (const s of strMatches) {
            parts.push(s[1].replace(/\\n/g, '\n').replace(/\\\(/g, '(').replace(/\\\)/g, ')'))
          }
        }
        text = parts.join(' ').trim()

        // Sayfa sayısını tahmin et
        const pageMatches = raw.match(/\/Type\s*\/Page[^s]/g)
        pageCount = pageMatches?.length
      } else {
        return new Response(JSON.stringify({ error: 'Desteklenmeyen dosya türü' }), {
          status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
        })
      }
    } else {
      return new Response(JSON.stringify({ error: 'url veya fileBase64+mimeType gerekli' }), {
        status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    if (!text || text.length < 50) {
      return new Response(JSON.stringify({ error: 'Metin çıkarılamadı veya çok kısa' }), {
        status: 422, headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    wordCount = text.trim().split(/\s+/).filter(Boolean).length

    return new Response(JSON.stringify({ text, wordCount, pageCount }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
