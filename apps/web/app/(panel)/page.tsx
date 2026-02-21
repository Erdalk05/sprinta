import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Users, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import { WeeklyActivityChart } from '@/components/charts/WeeklyActivityChart';
import { RiskStudentsAlert } from '@/components/panel/RiskStudentsAlert';

export default async function PanelDashboardPage() {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: admin } = await supabase
    .from('tenant_admins')
    .select('tenant_id, full_name, tenant:tenants(name, tier)')
    .eq('auth_user_id', user.id)
    .single();

  if (!admin) redirect('/login');

  const tenantId = admin.tenant_id;
  const today = new Date().toISOString().split('T')[0];

  const [
    { data: todayStats },
    { count: totalStudents },
    { data: riskStudents },
    { data: weekActivity },
  ] = await Promise.all([
    supabase
      .from('tenant_daily_stats')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('date', today)
      .single(),

    supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('is_active', true),

    supabase
      .from('student_risk_scores')
      .select('risk_level, risk_factors, recommendation, student:students(id, full_name, last_activity_at, streak_days)')
      .eq('tenant_id', tenantId)
      .in('risk_level', ['high', 'critical'])
      .order('risk_score', { ascending: false })
      .limit(5),

    supabase
      .from('tenant_daily_stats')
      .select('date, active_students, avg_arp, total_minutes')
      .eq('tenant_id', tenantId)
      .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: true }),
  ]);

  const stats = [
    { label: 'Toplam Öğrenci', value: totalStudents ?? 0,              icon: Users,          color: 'text-blue-400' },
    { label: 'Bugün Aktif',    value: todayStats?.active_students ?? 0, icon: Clock,          color: 'text-green-400' },
    { label: 'Ort. ARP',       value: Math.round(todayStats?.avg_arp ?? 0), icon: TrendingUp, color: 'text-purple-400' },
    { label: 'Risk Altında',   value: todayStats?.at_risk_count ?? 0,  icon: AlertTriangle,  color: 'text-yellow-400' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          {(() => { const t = admin.tenant as unknown as { name: string }[] | { name: string } | null; return Array.isArray(t) ? t[0]?.name : t?.name; })() ?? 'Dashboard'}
        </h1>
        <p className="text-slate-400 mt-1">Hoş geldiniz, {admin.full_name}</p>
      </div>

      {/* Özet Kartlar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-slate-800 rounded-xl p-5 border border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <s.icon className={`w-5 h-5 ${s.color}`} />
              <span className="text-slate-400 text-sm">{s.label}</span>
            </div>
            <span className="text-3xl font-bold text-white">{s.value}</span>
          </div>
        ))}
      </div>

      {/* Haftalık Aktivite */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Son 7 Gün Aktivitesi</h2>
        <WeeklyActivityChart data={weekActivity ?? []} />
      </div>

      {/* Risk Uyarısı */}
      {(riskStudents?.length ?? 0) > 0 && (
        <RiskStudentsAlert students={riskStudents ?? []} />
      )}
    </div>
  );
}
