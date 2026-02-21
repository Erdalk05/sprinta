// Supabase Edge Function — Nightly Risk Detection (Cron)
// Her gece 02:00'da B2B öğrenci risk skorlarını güncelle

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (_req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

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
