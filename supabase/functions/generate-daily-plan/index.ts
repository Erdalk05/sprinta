// Supabase Edge Function — generate-daily-plan
// Deterministik günlük plan üreteci (AI model kullanılmaz)
// Önce analysis_cache'e bakar (30 dk TTL), yoksa analyze-student-performance çağırır
// Input:  { studentId: string }
// Output: { today_plan: PlanItem[], reason: string, focus_area: string }

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { CORS_HEADERS as CORS } from '../_shared/cors.ts'

// ─── Types ────────────────────────────────────────────────────────────

interface PlanItem {
  module_key:   string
  label:        string
  time_minutes: number
  priority:     number  // 1 = en yüksek
}

interface AnalysisResult {
  next_action: string[]
  focus_area:  string
  risk_level:  'low' | 'medium' | 'high'
  trend:       'improving' | 'declining' | 'stable'
}

// ─── Modül Metadata ───────────────────────────────────────────────────

const MODULE_INFO: Record<string, { label: string; time: number }> = {
  'chunk-rsvp':    { label: 'Hızlı Okuma (RSVP)',  time: 5  },
  'speed-ladder':  { label: 'Hız Merdiveni',        time: 8  },
  'focus-filter':  { label: 'Odak Filtresi',         time: 6  },
  'academic-mode': { label: 'Akademik Mod',          time: 10 },
  'memory-anchor': { label: 'Bellek Çıpası',         time: 7  },
  'svr':           { label: 'SVR Tekniği',           time: 6  },
  'flow-reading':  { label: 'Akış Okuma',            time: 8  },
  'subvocal-free': { label: 'İç Ses Engeli',         time: 5  },
  'timed-reading': { label: 'Zamanlı Okuma',         time: 7  },
  'bionic-reading':{ label: 'Biyonik Okuma',         time: 6  },
  'auto-scroll':   { label: 'Otomatik Kaydırma',     time: 5  },
  'keyword-scan':  { label: 'Anahtar Kelime Tarama', time: 4  },
}

const FALLBACK_PLAN: PlanItem[] = [
  { module_key: 'speed-ladder',  label: 'Hız Merdiveni',      time_minutes: 8, priority: 1 },
  { module_key: 'focus-filter',  label: 'Odak Filtresi',       time_minutes: 6, priority: 2 },
  { module_key: 'memory-anchor', label: 'Bellek Çıpası',       time_minutes: 7, priority: 3 },
]

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
    const { studentId } = await req.json() as { studentId: string }
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

    // 1. analysis_cache'den oku (30 dk TTL — generate-daily-plan için daha geniş)
    let analysis: AnalysisResult | null = null
    const { data: cache } = await serviceClient
      .from('analysis_cache')
      .select('result, created_at')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (cache && Date.now() - new Date(cache.created_at).getTime() < 30 * 60 * 1000) {
      analysis = cache.result as AnalysisResult
    } else {
      // 2. Cache yok/bayat → analyze-student-performance çağır
      const { data: fnData } = await serviceClient.functions.invoke(
        'analyze-student-performance',
        {
          body: { studentId },
          headers: { Authorization: authHeader },
        }
      )
      if (fnData && !fnData.error) {
        analysis = fnData as AnalysisResult
      }
    }

    // 3. next_action → PlanItem[]
    if (!analysis || !analysis.next_action?.length) {
      return new Response(
        JSON.stringify({
          today_plan: FALLBACK_PLAN,
          reason:     'Henüz yeterli seans verisi yok. Başlangıç planı uygulanıyor.',
          focus_area: 'Düzenli çalışmaya başla',
        }),
        { headers: { ...CORS, 'Content-Type': 'application/json' } }
      )
    }

    const today_plan: PlanItem[] = analysis.next_action
      .slice(0, 3)
      .map((key, i) => {
        const info = MODULE_INFO[key]
        return {
          module_key:   key,
          label:        info?.label ?? key,
          time_minutes: info?.time  ?? 7,
          priority:     i + 1,
        }
      })

    // 3'ten az modül varsa fallback ile tamamla
    if (today_plan.length < 3) {
      for (const fb of FALLBACK_PLAN) {
        if (today_plan.length >= 3) break
        if (!today_plan.find(p => p.module_key === fb.module_key)) {
          today_plan.push({ ...fb, priority: today_plan.length + 1 })
        }
      }
    }

    return new Response(
      JSON.stringify({
        today_plan,
        reason:     analysis.focus_area,
        focus_area: analysis.focus_area,
      }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
