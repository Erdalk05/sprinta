// Supabase Edge Function — AI Weekly Report
// Claude Haiku ile haftalık performans raporu

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const { studentId } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: student } = await supabase
      .from('students')
      .select('full_name, exam_target, current_arp, baseline_arp, growth_score, streak_days')
      .eq('id', studentId)
      .single();

    const { data: weekStats } = await supabase
      .from('daily_stats')
      .select('date, avg_arp, total_minutes, xp_earned, avg_comprehension')
      .eq('student_id', studentId)
      .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: true });

    const totalMinutes = weekStats?.reduce((s: number, d: { total_minutes: number }) => s + (d.total_minutes ?? 0), 0) ?? 0;
    const totalXp = weekStats?.reduce((s: number, d: { xp_earned: number }) => s + (d.xp_earned ?? 0), 0) ?? 0;
    const avgArp = weekStats?.length
      ? Math.round(weekStats.reduce((s: number, d: { avg_arp: number }) => s + (d.avg_arp ?? 0), 0) / weekStats.length)
      : 0;

    const prompt = `Sen SPRINTA uygulamasının AI koçusun. Öğrenciye haftalık özet raporu hazırla.

ÖĞRENCİ: ${student.full_name} | Hedef: ${student.exam_target.toUpperCase()}
HAFTALIK VERİ:
- Çalışma süresi: ${totalMinutes} dakika
- Kazanılan XP: ${totalXp}
- Ortalama ARP: ${avgArp} (Baseline: ${student.baseline_arp})
- Büyüme Skoru: %${student.growth_score ?? 0}
- Aktif gün: ${weekStats?.length ?? 0}/7

Kısa, motive edici Türkçe rapor (4-5 cümle):
1. Haftalık özet değerlendirme
2. En güçlü yön ve en zayıf yön
3. Gelecek hafta önerisi
4. Sınava yaklaşım mesajı`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const aiData = await response.json();
    const report = aiData.content[0]?.text ?? 'Haftalık rapor hazırlanamadı.';

    return new Response(
      JSON.stringify({ success: true, report }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
