import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Building2, Users, DollarSign, AlertTriangle } from 'lucide-react';
import { TenantsTable } from '@/components/admin/TenantsTable';
import { NewTenantButton } from '@/components/admin/NewTenantButton';

export default async function SuperAdminDashboard() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: superAdmin } = await supabase
    .from('super_admins')
    .select('id, full_name')
    .eq('auth_user_id', user.id)
    .single();
  if (!superAdmin) redirect('/login');

  const [
    { count: totalTenants },
    { count: totalStudents },
    { data: tenants },
  ] = await Promise.all([
    supabase.from('tenants').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('students').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase
      .from('tenants')
      .select('id, name, tier, used_students, max_students, contract_end, is_active, monthly_revenue, is_trial, trial_ends_at, created_at')
      .order('created_at', { ascending: false }),
  ]);

  const totalMrr = tenants?.reduce((s, t) => s + (t.monthly_revenue ?? 0), 0) ?? 0;

  const soonExpiring = tenants?.filter(t => {
    if (!t.is_trial || !t.trial_ends_at) return false;
    const daysLeft = Math.ceil(
      (new Date(t.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return daysLeft <= 7 && daysLeft > 0;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Sprinta Yönetim</h1>
          <p className="text-slate-400 mt-1">Hoş geldiniz, {superAdmin.full_name}</p>
        </div>
        <NewTenantButton />
      </div>

      {/* Global Metrikler */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Aktif Kurum',     value: totalTenants ?? 0,        icon: Building2,     color: 'text-blue-400' },
          { label: 'Toplam Öğrenci',  value: totalStudents ?? 0,       icon: Users,         color: 'text-green-400' },
          { label: 'Toplam MRR (₺)',  value: totalMrr.toFixed(0),      icon: DollarSign,    color: 'text-yellow-400' },
          { label: 'Trial Bitiyor',   value: soonExpiring?.length ?? 0, icon: AlertTriangle, color: 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="bg-slate-800 rounded-xl p-5 border border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <s.icon className={`w-5 h-5 ${s.color}`} />
              <span className="text-slate-400 text-sm">{s.label}</span>
            </div>
            <span className="text-3xl font-bold text-white">{s.value}</span>
          </div>
        ))}
      </div>

      {/* Trial Uyarıları */}
      {(soonExpiring?.length ?? 0) > 0 && (
        <div className="bg-yellow-900/30 border border-yellow-700 rounded-xl p-4 mb-6">
          <p className="text-yellow-400 font-semibold mb-2">⚠️ Trial Süresi Bitiyor</p>
          {soonExpiring?.map(t => (
            <p key={t.id} className="text-slate-300 text-sm">
              • {t.name} — {Math.ceil(
                (new Date(t.trial_ends_at!).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
              )} gün kaldı
            </p>
          ))}
        </div>
      )}

      <TenantsTable tenants={tenants ?? []} />
    </div>
  );
}
