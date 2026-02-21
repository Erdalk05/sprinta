# 08 — AI COACH
## Claude Haiku Entegrasyonu — Kişisel Koçluk

---

## 1. GÜNLÜK ÖNERİ (Edge Function)

```typescript
// supabase/functions/ai-daily-recommendation/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const { studentId } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Öğrenci verisini çek
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

    // AI prompt
    const prompt = `Sen SPRINTA uygulamasının AI koçusun. Türk öğrencilere sınav hazırlığında yardım ediyorsun.

ÖĞRENCİ PROFİLİ:
- Ad: ${student.full_name}
- Hedef Sınav: ${student.exam_target.toUpperCase()}
- Güncel ARP: ${student.current_arp} (Baseline: ${student.baseline_arp})
- Sürdürülebilir WPM: ${profile.sustainable_wpm}
- Anlama Oranı: %${profile.comprehension_baseline}
- Seri: ${student.streak_days} gün
- Öncelikli Gelişim Alanı: ${profile.primary_weakness}
- Son 7 Session ARP: ${recentSessions?.map(s => s.arp?.toFixed(0) ?? 'N/A').join(', ')}

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
```

---

## 2. HAFTALIK RAPOR (Edge Function)

```typescript
// supabase/functions/ai-weekly-report/index.ts

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

    const totalMinutes = weekStats?.reduce((s, d) => s + (d.total_minutes ?? 0), 0) ?? 0;
    const totalXp = weekStats?.reduce((s, d) => s + (d.xp_earned ?? 0), 0) ?? 0;
    const avgArp = weekStats?.length
      ? Math.round(weekStats.reduce((s, d) => s + (d.avg_arp ?? 0), 0) / weekStats.length)
      : 0;

    const prompt = `Sen SPRINTA uygulamasının AI koçusun. Öğrenciye haftalık özet raporu hazırla.

ÖĞRENCİ: ${student.full_name} | Hedef: ${student.exam_target.toUpperCase()}
HAFTALIK VERİ:
- Çalışma süresi: ${totalMinutes} dakika
- Kazanılan XP: ${totalXp}
- Ortalama ARP: ${avgArp} (Baseline: ${student.baseline_arp})
- Büyüme Skoru: %${student.growth_score}
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
```

---

## 3. CRON: RİSK TESPİTİ (B2B)

```typescript
// supabase/functions/cron-risk-detection/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (_req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // B2B öğrencilerini getir (tenant_id var olanlar)
  const { data: students } = await supabase
    .from('students')
    .select(`
      id, tenant_id, streak_days, last_activity_at,
      current_arp, baseline_arp, has_completed_diagnostic
    `)
    .not('tenant_id', 'is', null)
    .eq('is_active', true);

  const now = new Date();
  const updates: unknown[] = [];

  for (const student of students ?? []) {
    const lastActivity = student.last_activity_at
      ? new Date(student.last_activity_at)
      : null;
    
    const daysSinceActivity = lastActivity
      ? Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    const riskFactors = {
      arp_drop: student.baseline_arp > 0 && student.current_arp < student.baseline_arp * 0.8,
      streak_broken: student.streak_days === 0,
      inactivity_7days: daysSinceActivity >= 7,
      not_diagnosed: !student.has_completed_diagnostic,
    };

    const riskCount = Object.values(riskFactors).filter(Boolean).length;
    const riskLevel =
      riskCount >= 4 ? 'critical' :
      riskCount >= 3 ? 'high' :
      riskCount >= 2 ? 'medium' : 'low';

    const recommendation =
      riskLevel === 'critical' ? 'Öğrenciyle iletişime geç, uzun süredir aktif değil' :
      riskLevel === 'high' ? 'Hatırlatma mesajı gönder' :
      riskLevel === 'medium' ? 'Takipte tut' : 'Normal seyir';

    updates.push({
      student_id: student.id,
      tenant_id: student.tenant_id,
      risk_level: riskLevel,
      risk_score: riskCount * 25,
      risk_factors: riskFactors,
      recommendation,
      last_activity_date: lastActivity?.toISOString().split('T')[0] ?? null,
      last_calculated_at: now.toISOString(),
    });
  }

  if (updates.length > 0) {
    await supabase
      .from('student_risk_scores')
      .upsert(updates, { onConflict: 'student_id' });
  }

  return new Response(
    JSON.stringify({ success: true, processed: updates.length }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
```

### Supabase Cron Konfigürasyonu

```sql
-- supabase/migrations/004_functions_triggers.sql (devam)

-- Her gece saat 02:00'da risk tespiti çalıştır
SELECT cron.schedule(
  'nightly-risk-detection',
  '0 2 * * *',
  $$SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/cron-risk-detection',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    )
  )$$
);
```

---

## 4. AI HOOK (Mobile)

```typescript
// apps/mobile/src/hooks/useAiCoach.ts

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useAuthStore } from '../stores/authStore';

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);

export function useAiCoach() {
  const { student } = useAuthStore();
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [weeklyReport, setWeeklyReport] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function getDailyRecommendation() {
    if (!student) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-daily-recommendation', {
        body: { studentId: student.id },
      });
      if (!error && data.success) {
        setRecommendation(data.recommendation);
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function getWeeklyReport() {
    if (!student) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-weekly-report', {
        body: { studentId: student.id },
      });
      if (!error && data.success) {
        setWeeklyReport(data.report);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return { recommendation, weeklyReport, isLoading, getDailyRecommendation, getWeeklyReport };
}
```

---

## ✅ FAZ 08 TAMAMLANMA KRİTERLERİ

```
✅ ai-daily-recommendation edge function deploy edildi
✅ ai-weekly-report edge function deploy edildi
✅ cron-risk-detection gece çalışıyor
✅ ANTHROPIC_API_KEY Supabase secrets'a eklendi
✅ AI önerileri Türkçe, bilimsel temelli
✅ Maliyet kontrolü: max_tokens 300-500 (Claude Haiku ucuz)
✅ useAiCoach hook mobile'da kullanılabilir
✅ B2B risk skoru her gece güncelleniyor
```
