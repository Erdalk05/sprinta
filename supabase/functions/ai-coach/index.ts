// Supabase Edge Function — AI Daily Recommendation
// Claude Haiku ile günlük kişisel koçluk önerisi

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
      .select('full_name, exam_target, grade_level, current_arp, baseline_arp, streak_days, level')
      .eq('id', studentId)
      .single();

    const { data: profile } = await supabase
      .from('cognitive_profiles')
      .select('sustainable_wpm, comprehension_baseline, primary_weakness, stability_index')
      .eq('student_id', studentId)
      .single();

    const { data: recentSessions } = await supabase
      .from('sessions')
      .select('arp, metrics, created_at')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(7);

    const prompt = `Sen SPRINTA uygulamasının AI koçusun. Türk öğrencilere sınav hazırlığında yardım ediyorsun.

ÖĞRENCİ PROFİLİ:
- Ad: ${student.full_name}
- Hedef Sınav: ${student.exam_target.toUpperCase()}
- Güncel ARP: ${student.current_arp} (Baseline: ${student.baseline_arp})
- Sürdürülebilir WPM: ${profile.sustainable_wpm}
- Anlama Oranı: %${profile.comprehension_baseline}
- Seri: ${student.streak_days} gün
- Öncelikli Gelişim Alanı: ${profile.primary_weakness}
- Son 7 Session ARP: ${recentSessions?.map((s: { arp: number }) => s.arp?.toFixed(0) ?? 'N/A').join(', ')}

GÜNLÜK ÖNERİ (max 3 cümle, Türkçe, motive edici, somut):
1. Bugün hangi modüle odaklanmalı ve neden?
2. Kısa bir egzersiz önerisi
3. Sınav hedefine ne kadar yaklaştığına dair pozitif bir not

ÖNEMLİ: Bilimsel olmayan, abartılı veya gerçekdışı öneriler yapma.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const aiData = await response.json();
    const recommendation = aiData.content[0]?.text ?? 'Bugün bir egzersiz tamamla!';

    return new Response(
      JSON.stringify({ success: true, recommendation }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
