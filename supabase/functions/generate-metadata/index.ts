// =====================================================
// generate-metadata — Supabase Edge Function
// Sprint 6: Claude Haiku ile içerik metadata üretimi
// =====================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
}

interface RequestBody {
  text_id: string
  body: string
  exam_type: string
}

interface AiOutput {
  summary: string
  difficulty: number
  keywords: string[]
  examTags: string[]
}

serve(async (req: Request) => {
  // OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  try {
    // ── 1. JWT doğrulama ─────────────────────────────
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Yetkilendirme gerekli.' }),
        { status: 401, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    })

    // ── 2. Kullanıcı rolü kontrolü ───────────────────
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Geçersiz token.' }),
        { status: 401, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
      )
    }

    const { data: studentRow, error: roleError } = await supabase
      .from('students')
      .select('role')
      .eq('auth_user_id', user.id)
      .single()

    if (roleError || !studentRow || !['admin', 'editor'].includes(studentRow.role)) {
      return new Response(
        JSON.stringify({ error: 'Bu işlem için admin veya editor rolü gerekli.' }),
        { status: 403, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
      )
    }

    // ── 3. Request body parse ────────────────────────
    const body = await req.json() as RequestBody
    if (!body.text_id || !body.body || !body.exam_type) {
      return new Response(
        JSON.stringify({ error: 'text_id, body ve exam_type zorunludur.' }),
        { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
      )
    }

    // ── 4. Claude Haiku çağrısı ──────────────────────
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!anthropicKey) {
      return new Response(
        JSON.stringify({ error: 'ANTHROPIC_API_KEY yapılandırılmamış.' }),
        { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
      )
    }

    const systemPrompt =
      'Sen Türk eğitim sistemi için içerik analiz uzmanısın. ' +
      'Verilen metni analiz et ve JSON formatında döndür. ' +
      'Sadece JSON döndür, başka hiçbir şey yazma.'

    const userPrompt =
      `Sınav türü: ${body.exam_type}\n` +
      `Metin: ${body.body.slice(0, 4000)}\n\n` +
      `Şu bilgileri JSON formatında döndür:\n` +
      `{\n` +
      `  "summary": "Metnin 2-3 cümlelik Türkçe özeti",\n` +
      `  "difficulty": 1-5 arasında integer (1=kolay, 5=çok zor),\n` +
      `  "keywords": ["kelime1", "kelime2", ...],\n` +
      `  "examTags": ["LGS", "TYT"]\n` +
      `}`

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    })

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text()
      console.warn('Anthropic API hatası:', errText)
      return new Response(
        JSON.stringify({ error: 'AI servisi şu an kullanılamıyor.' }),
        { status: 502, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
      )
    }

    // ── 5. Response parse ────────────────────────────
    const anthropicData = await anthropicRes.json()
    const rawText: string = anthropicData?.content?.[0]?.text ?? ''

    let parsed: AiOutput
    try {
      parsed = JSON.parse(rawText) as AiOutput
    } catch {
      // JSON bloğunu çıkarmayı dene
      const jsonMatch = rawText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        return new Response(
          JSON.stringify({ error: 'AI yanıtı JSON formatında değil.' }),
          { status: 502, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
        )
      }
      parsed = JSON.parse(jsonMatch[0]) as AiOutput
    }

    // Zorluk 1-5 aralığını garantile
    const difficulty = Math.min(5, Math.max(1, Math.round(parsed.difficulty ?? 3)))

    const result: AiOutput = {
      summary:    parsed.summary    ?? '',
      difficulty,
      keywords:   Array.isArray(parsed.keywords)  ? parsed.keywords.slice(0, 8)  : [],
      examTags:   Array.isArray(parsed.examTags)   ? parsed.examTags.slice(0, 5)  : [],
    }

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    )

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Bilinmeyen hata'
    console.warn('generate-metadata hatası:', message)
    return new Response(
      JSON.stringify({ error: 'Sunucu hatası.' }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    )
  }
})
