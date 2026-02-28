// Supabase Edge Function — generate-questions
// Verilen metin için anlama soruları üretir (Claude Haiku)
// Input:  { text: string, categoryCode?: string, count?: number, language?: string }
// Output: { questions: Array<{ question, options, correctIndex, explanation? }> }

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!

interface Question {
  question: string
  options: string[]
  correctIndex: number
  explanation?: string
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS })
  }

  try {
    const body = await req.json() as {
      text: string
      categoryCode?: string
      count?: number
      language?: string
    }

    if (!body.text || body.text.length < 100) {
      return new Response(JSON.stringify({ error: 'Metin çok kısa (min 100 karakter)' }), {
        status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    const questionCount = Math.min(body.count ?? 5, 10)
    const lang = body.language ?? 'tr'
    const category = body.categoryCode ?? 'genel'

    // Metni kısalt (token limiti için)
    const textSnippet = body.text.slice(0, 3000)

    const langInstruction = lang === 'tr'
      ? 'Tüm soruları Türkçe olarak oluştur.'
      : 'Generate all questions in English.'

    const prompt = `Aşağıdaki metni okuyun ve ${questionCount} adet çoktan seçmeli anlama sorusu oluşturun.
Konu alanı: ${category}
${langInstruction}

KURALLAR:
- Her soru metnin içeriğine dayanmalı
- Her soru için 4 seçenek (A, B, C, D) olmalı
- Doğru cevabın indeksini belirt (0=A, 1=B, 2=C, 3=D)
- Kısa açıklama ekle
- Sadece JSON dizi formatında çıktı ver

FORMAT (başka metin ekleme):
[
  {
    "question": "...",
    "options": ["A seçenek", "B seçenek", "C seçenek", "D seçenek"],
    "correctIndex": 0,
    "explanation": "..."
  }
]

METİN:
${textSnippet}`

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!resp.ok) {
      const errBody = await resp.text()
      return new Response(JSON.stringify({ error: `Claude API hatası: ${errBody}` }), {
        status: 502, headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    const data = await resp.json() as {
      content: Array<{ type: string; text: string }>
    }

    const rawText = data.content.find((c) => c.type === 'text')?.text ?? ''

    // JSON'u çıkar
    const jsonMatch = rawText.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      return new Response(JSON.stringify({ error: 'Sorular ayrıştırılamadı', raw: rawText }), {
        status: 422, headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    const questions: Question[] = JSON.parse(jsonMatch[0])

    return new Response(JSON.stringify({ questions }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
