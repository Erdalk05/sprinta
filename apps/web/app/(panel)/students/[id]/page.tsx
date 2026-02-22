import { createServerClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { ARPTrendChart } from '@/components/charts/ARPTrendChart';
import { ModuleProgressBars } from '@/components/panel/ModuleProgressBars';

type CognitiveProfile = {
  sustainable_wpm: number;
  comprehension_baseline: number;
  stability_index: number;
  speed_skill: number;
  comprehension_skill: number;
  attention_skill: number;
  primary_weakness: string;
};

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: student }, { data: arpHistory }, { data: risk }] = await Promise.all([
    supabase
      .from('students')
      .select(`
        id, full_name, email, grade_level, exam_target,
        baseline_arp, current_arp, growth_score,
        streak_days, longest_streak, total_xp, level,
        last_activity_at, has_completed_diagnostic,
        cognitive_profile:cognitive_profiles(
          sustainable_wpm, comprehension_baseline, stability_index,
          speed_skill, comprehension_skill, attention_skill, primary_weakness
        )
      `)
      .eq('id', id)
      .single(),

    supabase
      .from('daily_stats')
      .select('date, avg_arp, total_minutes')
      .eq('student_id', id)
      .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: true }),

    supabase
      .from('student_risk_scores')
      .select('risk_level, risk_factors, recommendation')
      .eq('student_id', id)
      .single(),
  ]);

  if (!student) notFound();

  const cp = (student.cognitive_profile as CognitiveProfile[] | null)?.[0];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">{student.full_name}</h1>
        <p className="text-slate-400">{student.email} · {student.exam_target.toUpperCase()}</p>
      </div>

      {/* Risk Uyarısı */}
      {risk && (risk.risk_level === 'high' || risk.risk_level === 'critical') && (
        <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 mb-6">
          <p className="text-red-400 font-semibold">
            ⚠️ Risk Seviyesi: {risk.risk_level.toUpperCase()}
          </p>
          <p className="text-slate-300 text-sm mt-2">{risk.recommendation}</p>
        </div>
      )}

      {/* Özet */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Başlangıç ARP', value: Math.round(student.baseline_arp), color: 'text-white' },
          { label: 'Güncel ARP',    value: Math.round(student.current_arp),   color: 'text-indigo-400' },
          { label: 'Büyüme',        value: `${(student.growth_score ?? 0) > 0 ? '+' : ''}${student.growth_score?.toFixed(1) ?? 0}%`, color: (student.growth_score ?? 0) > 0 ? 'text-green-400' : 'text-red-400' },
        ].map(card => (
          <div key={card.label} className="bg-slate-800 rounded-xl p-5 border border-slate-700">
            <p className="text-slate-400 text-sm">{card.label}</p>
            <p className={`text-2xl font-bold mt-2 ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* ARP Trend */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">ARP Trendi (30 gün)</h2>
        <ARPTrendChart data={arpHistory ?? []} />
      </div>

      {/* Bilişsel Profil */}
      {cp && (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">Bilişsel Profil</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-slate-400 text-sm">Sürdürülebilir WPM</p>
              <p className="text-xl font-bold text-white">{cp.sustainable_wpm}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Anlama Oranı</p>
              <p className="text-xl font-bold text-white">%{cp.comprehension_baseline}</p>
            </div>
          </div>
          <ModuleProgressBars
            speed={cp.speed_skill}
            comprehension={cp.comprehension_skill}
            attention={cp.attention_skill}
            primaryWeakness={cp.primary_weakness}
          />
        </div>
      )}
    </div>
  );
}
