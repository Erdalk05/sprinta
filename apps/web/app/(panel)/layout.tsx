import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Users, BarChart2, Settings, LogOut,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/',          icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/students',  icon: Users,            label: 'Öğrenciler' },
  { href: '/reports',   icon: BarChart2,         label: 'Raporlar' },
  { href: '/settings',  icon: Settings,          label: 'Ayarlar' },
];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: admin } = await supabase
    .from('tenant_admins')
    .select('tenant_id, full_name, tenant:tenants(name)')
    .eq('auth_user_id', user.id)
    .single();

  if (!admin) redirect('/login');

  const tenantRaw = admin.tenant as unknown as { name: string }[] | { name: string } | null;
  const tenantName = Array.isArray(tenantRaw) ? (tenantRaw[0]?.name ?? 'Kurum') : (tenantRaw?.name ?? 'Kurum');

  return (
    <div className="flex min-h-screen bg-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold text-white">SPRINTA</h1>
          <p className="text-slate-400 text-sm mt-1">{tenantName}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <p className="text-slate-500 text-xs mb-2">{admin.full_name}</p>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Çıkış Yap
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
