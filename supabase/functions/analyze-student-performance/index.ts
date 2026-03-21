// Supabase Edge Function — analyze-student-performance
// Deterministik öğrenci performans analizi (AI model kullanılmaz)
// Input:  { studentId: string }
// Output: { weaknesses, strengths, risk_level, trend, focus_area, next_action }

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { CORS_HEADERS as CORS } from '../_shared/cors.ts'

// ─── Types ────────────────────────────────────────────────────────────

interface Session {
  arp_score:           number
  comprehension_score: number
  avg_wpm:             number
  completion_ratio:    number
  module_key:          string | null
  created_at:          string
}

interface AnalysisResult {
  weaknesses:  string[]
  strengths:   string[]
  risk_level:  'low' | 'medium' | 'high'
  trend:       'improving' | 'declining' | 'stable'
  focus_area:  string
  next_action: string[]
}

// ─── Helpers ─────────────────────────────────────────────────────────

function mean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((s, v) => s + v, 0) / values.length
}

// ─── Analysis Engine ─────────────────────────────────────────────────

function analyzePerformance(sessions: Session[]): AnalysisResult {
  if (sessions.length === 0) {
    return {
      weaknesses:  [],
      strengths:   [],
      risk_level:  'low',
      trend:       'stable',
      focus_area:  'İlk seansını tamamla',
      next_action: ['chunk-rsvp'],
    }
  }

  // sessions: DESC order (newest first)
  const arpValues   = sessions.map((s) => Number(s.arp_score))
  const wpmValues   = sessions.map((s) => s.avg_wpm)
  const compValues  = sessions.map((s) => s.comprehension_score)
  const complValues = sessions.map((s) => Number(s.completion_ratio))

  // Anlama skoru: sadece soru olan seanslar (0 = soru yoktu)
  const compWithQ = compValues.filter((v) => v > 0)
  const avgArp    = mean(arpValues)
  const avgWpm    = mean(wpmValues)
  const avgComp   = compWithQ.length > 0 ? mean(compWithQ) : -1   // -1 = veri yok
  const avgCompl  = mean(complValues)

  // ── Trend ─────────────────────────────────────────────────────────
  let trend: 'improving' | 'declining' | 'stable' = 'stable'
  if (sessions.length >= 4) {
    const half      = Math.floor(sessions.length / 2)
    const recentArp = mean(arpValues.slice(0, half))   // yeni seanslar
    const olderArp  = mean(arpValues.slice(half))       // eski seanslar
    if      (recentArp > olderArp * 1.06) trend = 'improving'
    else if (recentArp < olderArp * 0.94) trend = 'declining'
  }

  // ── Weaknesses ────────────────────────────────────────────────────
  const weaknesses: string[] = []
  if (avgComp !== -1 && avgComp < 60) weaknesses.push('Anlama kapasitesi düşük')
  if (avgWpm  < 150)                  weaknesses.push('Okuma hızı yetersiz')
  if (avgCompl < 0.70)                weaknesses.push('Seanslar yarıda kalıyor')
  if (trend === 'declining')          weaknesses.push('Performans düşüyor')
  if (avgArp   < 100)                 weaknesses.push('Genel skor kritik seviyede')

  // ── Strengths ─────────────────────────────────────────────────────
  const strengths: string[] = []
  if (avgComp !== -1 && avgComp >= 75) strengths.push('Güçlü anlama becerisi')
  if (avgWpm  >= 250)                  strengths.push('Yüksek okuma hızı')
  if (avgCompl >= 0.90)                strengths.push('Yüksek tamamlama oranı')
  if (trend   === 'improving')         strengths.push('Sürekli gelişim trendi')
  if (avgArp  >= 250)                  strengths.push('Üst düzey ARP skoru')

  // ── Risk Level ────────────────────────────────────────────────────
  let risk_level: 'low' | 'medium' | 'high' = 'low'
  if (avgArp < 100 || (trend === 'declining' && avgComp !== -1 && avgComp < 50)) {
    risk_level = 'high'
  } else if (avgArp < 180 || (avgComp !== -1 && avgComp < 60)) {
    risk_level = 'medium'
  }

  // ── Focus Area ────────────────────────────────────────────────────
  let focus_area = 'Dengeli gelişimi sürdür'
  if (avgComp !== -1 && avgComp < 60 && avgWpm < 150) {
    focus_area = 'Anlama ve hızı birlikte geliştir'
  } else if (avgComp !== -1 && avgComp < 60) {
    focus_area = 'Anlama egzersizlerine ağırlık ver'
  } else if (avgWpm < 150) {
    focus_area = 'Okuma hızını önceliklendir'
  } else if (avgWpm < 250) {
    focus_area = 'Orta seviyeden ileri seviyeye geç'
  } else if (avgCompl < 0.70) {
    focus_area = 'Daha uzun seanslara geç'
  } else if (avgArp >= 280) {
    focus_area = 'Üst düzey zorluk modlarını dene'
  }

  // ── Next Actions — Recommender Engine ────────────────────────────
  const next_action: string[] = []

  // Anlama zayıfsa
  if (avgComp !== -1 && avgComp < 40)                        next_action.push('academic-mode')
  if (avgComp !== -1 && avgComp >= 40 && avgComp < 60)       next_action.push('focus-filter')

  // Hız zayıfsa
  if (avgWpm < 150)                                          next_action.push('chunk-rsvp')
  if (avgWpm >= 150 && avgWpm < 250)                         next_action.push('speed-ladder')

  // İleri seviye
  if (avgWpm >= 250 && avgComp !== -1 && avgComp >= 70)      next_action.push('svr')

  // Tamamlama düşükse
  if (avgCompl < 0.70)                                       next_action.push('flow-reading')

  // Düşüş trendiyse
  if (trend === 'declining' && weaknesses.length >= 2)       next_action.push('subvocal-free')

  // Denge iyiyse
  if (avgComp !== -1 && avgComp >= 60 && avgWpm >= 150)      next_action.push('memory-anchor')

  // En az bir aksiyon her zaman olsun
  if (next_action.length === 0) next_action.push('speed-ladder')

  return {
    weaknesses,
    strengths,
    risk_level,
    trend,
    focus_area,
    next_action: next_action.slice(0, 3),
  }
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

    // 1. Cache kontrol — 5 dakika içinde hesaplanmış sonuç varsa kullan
    const { data: cache } = await serviceClient
      .from('analysis_cache')
      .select('result, created_at')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (cache && Date.now() - new Date(cache.created_at).getTime() < 5 * 60 * 1000) {
      return new Response(JSON.stringify(cache.result), {
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    // 2. Son 10 seans
    const { data: sessions, error: sessErr } = await serviceClient
      .from('reading_mode_sessions')
      .select('arp_score, comprehension_score, avg_wpm, completion_ratio, module_key, created_at')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(10)
    if (sessErr) throw sessErr

    const result = analyzePerformance((sessions ?? []) as Session[])

    // 3. Cache'e kaydet (best-effort)
    await serviceClient
      .from('analysis_cache')
      .insert({ student_id: studentId, result })
      .catch(() => { /* silent */ })

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
