import Link from 'next/link';

interface Tenant {
  id: string;
  name: string;
  tier: string;
  used_students: number;
  max_students: number;
  contract_end: string | null;
  is_active: boolean;
  monthly_revenue: number | null;
  is_trial: boolean;
  trial_ends_at: string | null;
  created_at: string;
}

interface Props {
  tenants: Tenant[];
}

const tierColors: Record<string, string> = {
  starter:      'text-slate-300 bg-slate-700',
  professional: 'text-blue-300 bg-blue-900/30',
  enterprise:   'text-amber-300 bg-amber-900/30',
};

const tierLabels: Record<string, string> = {
  starter:      'Başlangıç',
  professional: 'Profesyonel',
  enterprise:   'Kurumsal',
};

export function TenantsTable({ tenants }: Props) {
  if (tenants.length === 0) {
    return (
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
        <p className="text-slate-500">Henüz kurum yok.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-700">
            {['Kurum', 'Plan', 'Öğrenci', 'MRR', 'Durum', 'Sözleşme'].map(h => (
              <th key={h} className="text-left p-4 text-slate-400 text-sm font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tenants.map(t => {
            const usage = t.max_students > 0 ? Math.round((t.used_students / t.max_students) * 100) : 0;
            const contractEnd = t.contract_end
              ? new Date(t.contract_end).toLocaleDateString('tr-TR')
              : '—';
            const trialDaysLeft = t.is_trial && t.trial_ends_at
              ? Math.ceil((new Date(t.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              : null;

            return (
              <tr key={t.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                <td className="p-4">
                  <Link href={`/admin/tenants/${t.id}`}>
                    <p className="text-white font-medium hover:text-indigo-400 transition-colors">
                      {t.name}
                    </p>
                    {t.is_trial && (
                      <span className="text-yellow-400 text-xs">
                        Trial {trialDaysLeft !== null && trialDaysLeft > 0 ? `(${trialDaysLeft}g)` : '(süresi doldu)'}
                      </span>
                    )}
                  </Link>
                </td>
                <td className="p-4">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${tierColors[t.tier] ?? 'text-slate-400 bg-slate-700'}`}>
                    {tierLabels[t.tier] ?? t.tier}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm">{t.used_students}/{t.max_students}</span>
                    <div className="w-16 bg-slate-700 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${usage >= 90 ? 'bg-red-500' : usage >= 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${Math.min(100, usage)}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-green-400 font-medium">
                    {t.monthly_revenue ? `${Math.round(t.monthly_revenue).toLocaleString('tr-TR')} ₺` : '—'}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`text-xs px-2 py-1 rounded-full ${t.is_active ? 'text-green-400 bg-green-900/30' : 'text-slate-500 bg-slate-700'}`}>
                    {t.is_active ? 'Aktif' : 'Pasif'}
                  </span>
                </td>
                <td className="p-4">
                  <span className="text-slate-400 text-sm">{contractEnd}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
