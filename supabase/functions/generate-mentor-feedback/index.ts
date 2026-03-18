// ================================================================
// generate-mentor-feedback/index.ts
// Sprint 9 — AI Academic Mentor Edge Function
// Kimlik doğrulama → veri çek → Claude Haiku → DB'ye yaz
// ================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve }        from 'https://deno.land/std@0.168.0/http/server.ts'

import { CORS_HEADERS as CORS } from '../_shared/cors.ts'

const SKILL_TR: Record<string, string> = {
  main_idea:  'Ana Fikir',
  inference:  'Çıkarım',
  detail:     'Ayrıntı',
  vocabulary: 'Kelime',
  tone:       'Ton',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    // ── 1. Kimlik doğrula ─────────────────────────────────────────
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('No auth header')

    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    )

    const { data: { user }, error: authErr } = await userClient.auth.getUser()
    if (authErr || !user) throw new Error('Unauthorized')

    // ── 2. Kullanıcı verilerini paralel çek ───────────────────────
    const [examRes, diffRes, sessRes] = await Promise.all([
      userClient.from('user_exam_profile')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(),
      userClient.from('user_difficulty_profile')
        .select('avg_wpm, avg_comprehension, current_level')
        .eq('user_id', user.id)
        .maybeSingle(),
      userClient.from('sessions')
        .select('xp_earned, arp, duration_seconds')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10),
    ])

    const exam     = examRes.data
    const diff     = diffRes.data
    const sessions = sessRes.data ?? []

    // ── 3. Minimum veri kontrolü ──────────────────────────────────
    if (!exam && sessions.length === 0) {
      return new Response(
        JSON.stringify({ error: 'insufficient_data' }),
        { status: 422, headers: { ...CORS, 'Content-Type': 'application/json' } },
      )
    }

    // ── 4. En zayıf beceriyi bul ──────────────────────────────────
    let weakSkill = 'inference'
    let weakAcc   = 1

    if (exam) {
      const skills = [
        { key: 'main_idea',  acc: exam.main_idea_accuracy  ?? 0 },
        { key: 'inference',  acc: exam.inference_accuracy  ?? 0 },
        { key: 'detail',     acc: exam.detail_accuracy     ?? 0 },
        { key: 'vocabulary', acc: exam.vocabulary_accuracy ?? 0 },
        { key: 'tone',       acc: exam.tone_accuracy       ?? 0 },
      ]
      const worst = skills.reduce((min, s) => s.acc < min.acc ? s : min, skills[0])
      weakSkill = worst.key
      weakAcc   = worst.acc
    }

    const riskLevel    = exam?.risk_level ?? 1
    const avgWPM       = diff?.avg_wpm ?? 0
    const sessionCount = sessions.length
    const avgXP        = sessionCount > 0
      ? Math.round(sessions.reduce((s: number, r: any) => s + (r.xp_earned ?? 0), 0) / sessionCount)
      : 0

    // ── 5. Prompt ─────────────────────────────────────────────────
    const prompt = `Sen bir Türk akademik okuma koçusun. Öğrencinin verilerini analiz ederek Türkçe kişisel geri bildirim ver.

Öğrenci verisi:
- Risk seviyesi: ${riskLevel}/5
- En zayıf beceri: ${SKILL_TR[weakSkill] ?? weakSkill} (%${Math.round(weakAcc * 100)} doğruluk)
- Ortalama okuma hızı: ${avgWPM} WPM
- Tamamlanan seans: ${sessionCount}, ortalama ${avgXP} XP

Sadece şu JSON'u döndür, başka metin ekleme:
{
  "feedback_text": "2-3 cümle kişisel motivasyonel geri bildirim (isim kullanma, samimi ol)",
  "key_insight": "Okuma paternleri hakkında 1 cümle temel içgörü",
  "action_items": ["pratik öneri 1", "pratik öneri 2", "pratik öneri 3"],
  "improvement_focus": "inference|detail|speed_control|vocabulary|consistency"
}`

    // ── 6. Claude Haiku ───────────────────────────────────────────
    const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method:  'POST',
      headers: {
        'x-api-key':         Deno.env.get('ANTHROPIC_API_KEY')!,
        'anthropic-version': '2023-06-01',
        'content-type':      'application/json',
      },
      body: JSON.stringify({
        model:      'claude-haiku-4-5-20251001',
        max_tokens: 512,
        messages:   [{ role: 'user', content: prompt }],
      }),
    })

    if (!aiRes.ok) throw new Error(`Anthropic ${aiRes.status}`)

    const aiData  = await aiRes.json()
    const rawText = aiData.content?.[0]?.text ?? '{}'

    // ── 7. JSON parse — fallback regex ────────────────────────────
    let parsed: any = {}
    try {
      parsed = JSON.parse(rawText)
    } catch {
      const m = rawText.match(/\{[\s\S]*\}/)
      if (m) { try { parsed = JSON.parse(m[0]) } catch { /* ignore */ } }
    }

    const feedbackText     = parsed.feedback_text    ?? 'Okuma seanslarına devam et, gelişimin takip ediliyor.'
    const keyInsight       = parsed.key_insight      ?? 'Düzenli pratik en önemli başarı faktörü.'
    const actionItems      = Array.isArray(parsed.action_items) ? parsed.action_items.slice(0, 3) : []
    const improvementFocus = parsed.improvement_focus ?? 'consistency'

    // ── 8. Servis rolüyle DB'ye yaz ───────────────────────────────
    const svcClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: inserted, error: insertErr } = await svcClient
      .from('ai_mentor_feedback')
      .insert({
        user_id:           user.id,
        feedback_text:     feedbackText,
        key_insight:       keyInsight,
        action_items:      actionItems,
        improvement_focus: improvementFocus,
        weak_skill:        weakSkill,
        risk_level:        riskLevel,
        session_count:     sessionCount,
      })
      .select()
      .single()

    if (insertErr) throw insertErr

    return new Response(
      JSON.stringify({ data: inserted }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } },
    )
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message ?? 'Unknown error' }),
      { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } },
    )
  }
})
