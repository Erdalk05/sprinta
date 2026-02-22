// Supabase Edge Function — Sprinta AI Coach (Claude Sonnet 4.6)
// Desteklenen modlar: morning_briefing | chat | analyze_weakness | generate_content

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type Mode = 'morning_briefing' | 'chat' | 'analyze_weakness' | 'generate_content'

interface ChatMessage { role: 'user' | 'assistant'; content: string }

interface RequestBody {
  studentId: string
  mode:      Mode
  message?:  string
  history?:  ChatMessage[]
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS })
  }

  try {
    const body: RequestBody = await req.json()
    const { studentId, mode, message, history = [] } = body

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // ── Öğrenci bağlamını yükle ──────────────────────────────────
    const [{ data: student }, { data: profile }, { data: recentStats }, { data: activeProgram }] =
      await Promise.all([
        supabase
          .from('students')
          .select('full_name, exam_target, grade_level, current_arp, baseline_arp, streak_days, total_xp, level, has_completed_diagnostic')
          .eq('id', studentId)
          .single(),
        supabase
          .from('cognitive_profiles')
          .select('sustainable_wpm, peak_wpm, comprehension_baseline, stability_index, fatigue_threshold, primary_weakness, secondary_weakness')
          .eq('student_id', studentId)
          .single(),
        supabase
          .from('daily_stats')
          .select('date, avg_arp, xp_earned, sessions_count, total_minutes')
          .eq('student_id', studentId)
          .order('date', { ascending: false })
          .limit(7),
        supabase
          .from('student_programs')
          .select('current_day, progress_percent, exam_programs(title, duration_days, exam_type)')
          .eq('student_id', studentId)
          .eq('is_active', true)
          .single(),
      ])

    if (!student) {
      return new Response(JSON.stringify({ error: 'Öğrenci bulunamadı' }), {
        status: 404, headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    // ── ARP trend hesabı ─────────────────────────────────────────
    const arpValues = (recentStats ?? []).map((s: { avg_arp: number }) => s.avg_arp).filter(Boolean)
    const arpTrend  = arpValues.length >= 2
      ? (arpValues[0] - arpValues[arpValues.length - 1]).toFixed(0)
      : '0'
    const weeklyXp  = (recentStats ?? []).reduce((s: number, d: { xp_earned: number }) => s + (d.xp_earned ?? 0), 0)
    const weeklyMins = (recentStats ?? []).reduce((s: number, d: { total_minutes: number }) => s + (d.total_minutes ?? 0), 0)

    const prog = activeProgram as any
    const programInfo = prog
      ? `Aktif program: ${prog.exam_programs?.title ?? ''}, Gün ${prog.current_day}/${prog.exam_programs?.duration_days ?? '?'} (%${Math.round(prog.progress_percent ?? 0)} tamamlandı)`
      : 'Henüz aktif program yok'

    // ── Sistem Prompt ────────────────────────────────────────────
    const SYSTEM_PROMPT = `Sen SPRINTA'nın kişisel AI koçusun. Bilimsel okuma hızı ve kavrama antrenmanı konusunda uzmanlaşmış bir öğretmensin.

ÖĞRENCİ BAĞLAMI:
- İsim: ${student.full_name}
- Hedef Sınav: ${student.exam_target?.toUpperCase()}
- Güncel ARP (Anlama-Hız Puanı): ${student.current_arp} (Başlangıç: ${student.baseline_arp})
- Son 7 gün ARP trendi: ${arpTrend > '0' ? '+' : ''}${arpTrend} puan
- Streak: ${student.streak_days} gün arka arkaya
- Toplam XP: ${student.total_xp} | Seviye: ${student.level}
- Bu hafta: ${weeklyXp} XP, ${weeklyMins} dakika antrenman
- ${programInfo}
${profile ? `- Sürdürülebilir WPM: ${profile.sustainable_wpm} | Anlama: %${profile.comprehension_baseline}
- Birincil zayıflık: ${profile.primary_weakness ?? 'Belirlenmedi'}
- Stabilite: ${profile.stability_index ? (profile.stability_index * 100).toFixed(0) + '%' : 'N/A'}` : ''}

KURALLAR:
- Türkçe konuş, sıcak ve motive edici bir ton kullan
- Bilimsel ve somut önerilerde bulun, abartı yapma
- ARP değerini referans alarak kişiselleştirilmiş tavsiye ver
- Cevaplar kısa ve öz olsun (max 4-5 cümle), emoji kullanabilirsin
- Öğrencinin adını zaman zaman kullan`

    // ── Moda göre kullanıcı mesajını hazırla ─────────────────────
    let userContent: string

    switch (mode) {
      case 'morning_briefing':
        userContent = `Bugün için ${student.full_name}'e kişisel sabah brifingi oluştur.
Şu 3 şeyi söyle:
1. Bugünkü antrenman önerisi (hangi modül, neden)
2. ARP gelişimine dair kısa bir değerlendirme
3. Motivasyon cümlesi

Kısa, sıcak ve aksiyona yönelik olsun.`
        break

      case 'analyze_weakness':
        userContent = `${student.full_name}'in güçlü ve zayıf yönlerini analiz et.
Birincil zayıflığı: ${profile?.primary_weakness ?? 'belirsiz'}
ARP durumu: ${student.current_arp} (${student.exam_target?.toUpperCase()} için hedef: yüksek)
Bu hafta aktivitesi: ${weeklyMins} dk / ${weeklyXp} XP

Analiz sonucunda:
- Nerede zayıf olduğunu net söyle
- 3 somut iyileştirme adımı ver
- Ne zaman hedefe ulaşabileceğini tahmin et`
        break

      case 'generate_content':
        userContent = `${student.full_name} için kısa bir okuma hızı alıştırması metni oluştur.
- Sınav tipi: ${student.exam_target?.toUpperCase()}
- Mevcut ARP: ${student.current_arp}
- Zorluk seviyesi: ${student.current_arp < 150 ? 'Başlangıç' : student.current_arp < 250 ? 'Orta' : 'İleri'}

100-150 kelimelik Türkçe bir paragraf yaz. Sınav tarzında, akademik dil kullan.`
        break

      case 'chat':
      default:
        userContent = message ?? 'Merhaba!'
        break
    }

    // ── Claude API çağrısı ────────────────────────────────────────
    const messages: ChatMessage[] = mode === 'chat'
      ? [...history, { role: 'user', content: userContent }]
      : [{ role: 'user', content: userContent }]

    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':    'application/json',
        'x-api-key':       Deno.env.get('ANTHROPIC_API_KEY')!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-6',
        max_tokens:  600,
        system:     SYSTEM_PROMPT,
        messages,
      }),
    })

    const claudeData = await claudeRes.json()

    if (!claudeRes.ok) {
      throw new Error(claudeData.error?.message ?? 'Claude API hatası')
    }

    const reply = claudeData.content?.[0]?.text ?? 'Üzgünüm, şu an cevap veremiyorum.'

    return new Response(
      JSON.stringify({
        success: true,
        reply,
        mode,
        model: 'claude-sonnet-4-6',
        inputTokens:  claudeData.usage?.input_tokens  ?? 0,
        outputTokens: claudeData.usage?.output_tokens ?? 0,
      }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('ai-coach error:', err)
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  }
})
