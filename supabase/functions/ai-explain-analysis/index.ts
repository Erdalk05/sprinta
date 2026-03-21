// Supabase Edge Function — ai-explain-analysis
// Cost Control: Sadece risk_level=high veya trend=declining durumunda çağrılır
// Model: claude-haiku-4-5-20251001 (hızlı + ucuz)
// Input:  { studentId, weaknesses, trend, focus_area, risk_level }
// Output: { explanation, tips }

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { CORS_HEADERS as CORS } from '../_shared/cors.ts'

// ─── Types ────────────────────────────────────────────────────────────

interface RequestBody {
  studentId:  string
  weaknesses: string[]
  trend:      'improving' | 'declining' | 'stable'
  focus_area: string
  risk_level: 'low' | 'medium' | 'high'
}

interface ExplainResult {
  explanation: string
  tips:        string[]
}

// ─── Handler ─────────────────────────────────────────────────────────

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS })
  }

  // Auth kontrolü
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Yetkisiz erişim' }), {
      status: 401, headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }

  const userClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  )
  const { data: { user }, error: authErr } = await userClient.auth.getUser()
  if (authErr || !user) {
    return new Response(JSON.stringify({ error: 'Geçersiz oturum' }), {
      status: 401, headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }

  try {
    const body: RequestBody = await req.json()
    const { studentId, weaknesses, trend, focus_area, risk_level } = body

    if (!studentId) {
      return new Response(JSON.stringify({ error: 'studentId gerekli' }), {
        status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Ownership check
    const { data: ownership } = await serviceClient
      .from('students')
      .select('id')
      .eq('id', studentId)
      .eq('auth_user_id', user.id)
      .single()
    if (!ownership) {
      return new Response(JSON.stringify({ error: 'Bu öğrenciye erişim yetkiniz yok' }), {
        status: 403, headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    // Rate limit: 5 AI açıklama / kullanıcı / gün
    const { data: isAllowed, error: rlErr } = await serviceClient
      .rpc('check_and_increment_ai_rate_limit', {
        p_user_id:       user.id,
        p_function_name: 'ai-explain-analysis',
        p_daily_limit:   5,
      })
    if (rlErr || isAllowed === false) {
      return new Response(
        JSON.stringify({
          error:      'Günlük AI açıklama limiti doldu (5/gün).',
          error_code: 'rate_limited',
        }),
        { status: 429, headers: { ...CORS, 'Content-Type': 'application/json' } }
      )
    }

    // Haiku prompt
    const weaknessText = weaknesses.length > 0
      ? weaknesses.join(', ')
      : 'belirgin bir zayıf alan yok'

    const prompt = `Bir öğrencinin okuma performans analizi:
- Zayıf alanlar: ${weaknessText}
- Trend: ${trend === 'declining' ? 'düşüş' : trend === 'improving' ? 'yükseliş' : 'stabil'}
- Risk seviyesi: ${risk_level === 'high' ? 'yüksek' : risk_level === 'medium' ? 'orta' : 'düşük'}
- Odak alanı: ${focus_area}

Lütfen:
1. 2-3 cümlelik sade, motive edici bir açıklama yaz (teknik terim kullanma)
2. Tam olarak 2 pratik öneri ver

JSON formatında yanıt ver:
{
  "explanation": "...",
  "tips": ["öneri 1", "öneri 2"]
}`

    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         Deno.env.get('ANTHROPIC_API_KEY')!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-haiku-4-5-20251001',
        max_tokens:  300,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: AbortSignal.timeout(20000),
    })

    const claudeData = await claudeRes.json()
    if (!claudeRes.ok) {
      throw new Error(claudeData.error?.message ?? 'Claude API hatası')
    }

    const rawText = claudeData.content?.[0]?.text ?? ''

    // JSON parse — bazen model markdown içinde sarıyor
    let result: ExplainResult
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/)
      result = JSON.parse(jsonMatch ? jsonMatch[0] : rawText)
    } catch {
      // Fallback: parse başarısız olursa ham metni kullan
      result = {
        explanation: rawText.trim(),
        tips:        [],
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
