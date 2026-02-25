# 10 — B2B ADMIN PANELİ
## panel.sprinta.app — Kurum Yönetici Paneli (Next.js)

---

## 1. ROUTING YAPISI

```
apps/web/app/
├── (auth)/
│   ├── login/page.tsx           ← Kurum admin girişi
│   └── layout.tsx
├── (panel)/                     ← Kurum admin paneli
│   ├── layout.tsx               ← Sidebar + auth guard
│   ├── page.tsx                 ← Dashboard ana sayfa
│   ├── students/
│   │   ├── page.tsx             ← Öğrenci listesi
│   │   └── [id]/page.tsx        ← Öğrenci detay
│   ├── reports/page.tsx         ← Raporlar
│   └── settings/page.tsx        ← Kurum ayarları
└── (admin)/                     ← Super admin (11. doküman)
```

---

## 2. DASHBOARD ANA SAYFA

```tsx
// apps/web/app/(panel)/page.tsx

import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import {
  Users, TrendingUp, Clock, AlertTriangle
} from 'lucide-react';
import { WeeklyActivityChart } from '@/components/charts/WeeklyActivityChart';
import { TopImproversTable } from '@/components/panel/TopImproversTable';
import { RiskStudentsAlert } from '@/components/panel/RiskStudentsAlert';

export default async function PanelDashboardPage() {
  const supabase = await createServerClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Admin bilgisi
  const { data: admin } = await supabase
    .from('tenant_admins')
    .select('tenant_id, full_name, tenant:tenants(name, tier)')
    .eq('auth_user_id', user.id)
    .single();

  if (!admin) redirect('/login');

  const tenantId = admin.tenant_id;

  // Bugünün özet istatistikleri
  const today = new Date().toISOString().split('T')[0];
  const { data: todayStats } = await supabase
    .from('tenant_daily_stats')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('date', today)
    .single();

  // Toplam öğrenci sayısı
  const { count: totalStudents } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .eq('is_active', true);

  // Risk skoru yüksek öğrenciler
  const { data: riskStudents } = await supabase
    .from('student_risk_scores')
    .select(`
      risk_level, risk_factors, recommendation,
      student:students(id, full_name, last_activity_at, streak_days)
    `)
    .eq('tenant_id', tenantId)
    .in('risk_level', ['high', 'critical'])
    .order('risk_score', { ascending: false })
    .limit(5);

  // Son 7 günlük aktivite (grafik için)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString().split('T')[0];
  const { data: weekActivity } = await supabase
    .from('tenant_daily_stats')
    .select('date, active_students, avg_arp, total_minutes')
    .eq('tenant_id', tenantId)
    .gte('date', sevenDaysAgo)
    .order('date', { ascending: true });

  const stats = [
    {
      label: 'Toplam Öğrenci',
      value: totalStudents ?? 0,
      icon: Users,
      color: 'text-blue-400',
    },
    {
      label: 'Bugün Aktif',
      value: todayStats?.active_students ?? 0,
      icon: Clock,
      color: 'text-green-400',
    },
    {
      label: 'Ort. ARP',
      value: Math.round(todayStats?.avg_arp ?? 0),
      icon: TrendingUp,
      color: 'text-purple-400',
    },
    {
      label: 'Risk Altında',
      value: todayStats?.at_risk_count ?? 0,
      icon: AlertTriangle,
      color: 'text-yellow-400',
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Başlık */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          {(admin.tenant as { name: string }).name}
        </h1>
        <p className="text-slate-400 mt-1">
          Hoş geldiniz, {admin.full_name}
        </p>
      </div>

      {/* Özet Kartlar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div
            key={s.label}
            className="bg-slate-800 rounded-xl p-5 border border-slate-700"
          >
            <div className="flex items-center gap-3 mb-3">
              <s.icon className={`w-5 h-5 ${s.color}`} />
              <span className="text-slate-400 text-sm">{s.label}</span>
            </div>
            <span className="text-3xl font-bold text-white">{s.value}</span>
          </div>
        ))}
      </div>

      {/* Haftalık Aktivite Grafiği */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Son 7 Gün Aktivitesi
        </h2>
        <WeeklyActivityChart data={weekActivity ?? []} />
      </div>

      {/* Risk Uyarısı */}
      {(riskStudents?.length ?? 0) > 0 && (
        <RiskStudentsAlert students={riskStudents ?? []} />
      )}
    </div>
  );
}
```

---

## 3. ÖĞRENCİ LİSTESİ

```tsx
// apps/web/app/(panel)/students/page.tsx

import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { StudentFilters } from '@/components/panel/StudentFilters';

interface SearchParams {
  search?: string;
  risk?: string;
  exam?: string;
}

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await createServerClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: admin } = await supabase
    .from('tenant_admins')
    .select('tenant_id')
    .eq('auth_user_id', user.id)
    .single();

  if (!admin) redirect('/login');

  // Öğrenci sorgusu
  let query = supabase
    .from('students')
    .select(`
      id, full_name, email, grade_level, exam_target,
      baseline_arp, current_arp, growth_score,
      streak_days, last_activity_at, is_active,
      risk_score:student_risk_scores(risk_level)
    `)
    .eq('tenant_id', admin.tenant_id)
    .eq('is_active', true)
    .order('current_arp', { ascending: false });

  // Filtreleme
  if (searchParams.search) {
    query = query.ilike('full_name', `%${searchParams.search}%`);
  }
  if (searchParams.exam) {
    query = query.eq('exam_target', searchParams.exam);
  }

  const { data: students } = await query;

  const riskColors: Record<string, string> = {
    critical: 'text-red-400 bg-red-900/30',
    high: 'text-orange-400 bg-orange-900/30',
    medium: 'text-yellow-400 bg-yellow-900/30',
    low: 'text-green-400 bg-green-900/30',
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Öğrenciler</h1>
        <span className="text-slate-400">{students?.length ?? 0} öğrenci</span>
      </div>

      <StudentFilters />

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left p-4 text-slate-400 text-sm font-medium">Öğrenci</th>
              <th className="text-left p-4 text-slate-400 text-sm font-medium">Sınav</th>
              <th className="text-right p-4 text-slate-400 text-sm font-medium">Başlangıç ARP</th>
              <th className="text-right p-4 text-slate-400 text-sm font-medium">Güncel ARP</th>
              <th className="text-right p-4 text-slate-400 text-sm font-medium">Büyüme</th>
              <th className="text-right p-4 text-slate-400 text-sm font-medium">Seri</th>
              <th className="text-left p-4 text-slate-400 text-sm font-medium">Risk</th>
            </tr>
          </thead>
          <tbody>
            {students?.map(student => {
              const riskLevel = (student.risk_score as { risk_level: string }[])?.[0]?.risk_level ?? 'low';
              const growthPositive = student.growth_score > 0;
              const lastActive = student.last_activity_at
                ? new Date(student.last_activity_at).toLocaleDateString('tr-TR')
                : 'Hiç aktif değil';

              return (
                <tr
                  key={student.id}
                  className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                >
                  <td className="p-4">
                    <Link href={`/students/${student.id}`}>
                      <div>
                        <p className="text-white font-medium hover:text-indigo-400 transition-colors">
                          {student.full_name}
                        </p>
                        <p className="text-slate-500 text-xs mt-1">{student.email}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="p-4">
                    <span className="text-slate-300 uppercase text-sm font-mono">
                      {student.exam_target}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="text-slate-400">{Math.round(student.baseline_arp)}</span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="text-white font-semibold">{Math.round(student.current_arp)}</span>
                  </td>
                  <td className="p-4 text-right">
                    <span className={growthPositive ? 'text-green-400' : 'text-red-400'}>
                      {growthPositive ? '+' : ''}{student.growth_score?.toFixed(1) ?? '0'}%
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="text-orange-400">🔥 {student.streak_days}</span>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${riskColors[riskLevel] ?? 'text-slate-400'}`}>
                      {riskLevel}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

---

## 4. ÖĞRENCİ DETAY SAYFASI

```tsx
// apps/web/app/(panel)/students/[id]/page.tsx

import { createServerClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { ARPTrendChart } from '@/components/charts/ARPTrendChart';
import { ModuleProgressBars } from '@/components/panel/ModuleProgressBars';

export default async function StudentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createServerClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Öğrenci bilgisi
  const { data: student } = await supabase
    .from('students')
    .select(`
      id, full_name, email, grade_level, exam_target,
      baseline_arp, current_arp, growth_score,
      streak_days, longest_streak, total_xp, level,
      last_activity_at, has_completed_diagnostic,
      cognitive_profile:cognitive_profiles(
        sustainable_wpm, comprehension_baseline, stability_index,
        speed_skill, comprehension_skill, attention_skill,
        primary_weakness
      )
    `)
    .eq('id', params.id)
    .single();

  if (!student) notFound();

  // Son 30 günlük ARP grafiği
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString().split('T')[0];
  const { data: arpHistory } = await supabase
    .from('daily_stats')
    .select('date, avg_arp, total_minutes')
    .eq('student_id', params.id)
    .gte('date', thirtyDaysAgo)
    .order('date', { ascending: true });

  // Risk bilgisi
  const { data: risk } = await supabase
    .from('student_risk_scores')
    .select('risk_level, risk_factors, recommendation')
    .eq('student_id', params.id)
    .single();

  const cp = (student.cognitive_profile as {
    sustainable_wpm: number;
    comprehension_baseline: number;
    stability_index: number;
    speed_skill: number;
    comprehension_skill: number;
    attention_skill: number;
    primary_weakness: string;
  }[])?.[0];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Başlık */}
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

      {/* Özet Kartlar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <p className="text-slate-400 text-sm">Başlangıç ARP</p>
          <p className="text-2xl font-bold text-white mt-2">
            {Math.round(student.baseline_arp)}
          </p>
        </div>
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <p className="text-slate-400 text-sm">Güncel ARP</p>
          <p className="text-2xl font-bold text-indigo-400 mt-2">
            {Math.round(student.current_arp)}
          </p>
        </div>
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <p className="text-slate-400 text-sm">Büyüme</p>
          <p className={`text-2xl font-bold mt-2 ${student.growth_score > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {student.growth_score > 0 ? '+' : ''}{student.growth_score?.toFixed(1) ?? 0}%
          </p>
        </div>
      </div>

      {/* ARP Trend Grafiği */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">ARP Trendi (30 gün)</h2>
        <ARPTrendChart data={arpHistory ?? []} />
      </div>

      {/* Bilişsel Profil */}
      {cp && (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
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
```

---

## 5. LAYOUT (Sidebar)

```tsx
// apps/web/app/(panel)/layout.tsx

import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Users, BarChart2,
  Settings, LogOut
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/',           icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/students',   icon: Users,            label: 'Öğrenciler' },
  { href: '/reports',    icon: BarChart2,         label: 'Raporlar' },
  { href: '/settings',   icon: Settings,          label: 'Ayarlar' },
];

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) redirect('/login');

  const { data: admin } = await supabase
    .from('tenant_admins')
    .select('tenant_id, full_name, tenant:tenants(name)')
    .eq('auth_user_id', user.id)
    .single();

  if (!admin) redirect('/login');

  return (
    <div className="flex min-h-screen bg-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold text-white">SPRINTA</h1>
          <p className="text-slate-400 text-sm mt-1">
            {(admin.tenant as { name: string }).name}
          </p>
        </div>

        {/* Nav */}
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

        {/* Alt */}
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

      {/* İçerik */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
```

---

## 6. SUPABASE SSR HELPERS

```typescript
// apps/web/lib/supabase/server.ts

import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createServerClient() {
  const cookieStore = await cookies();
  
  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch { /* Server Component'ta set edilemez */ }
        },
      },
    }
  );
}
```

```typescript
// apps/web/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req });
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          res = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  
  const publicPaths = ['/login', '/register', '/'];
  const isPublic = publicPaths.includes(req.nextUrl.pathname);
  
  if (!user && !isPublic) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

---

## ✅ FAZ 10 TAMAMLANMA KRİTERLERİ

```
✅ panel.sprinta.app erişilebilir
✅ Login: Tenant admin girişi çalışıyor
✅ Auth guard: Giriş yoksa /login'e yönlendir
✅ Dashboard: Özet kartlar doluyor
✅ Öğrenci listesi: Filtrelenebilir tablo
✅ Öğrenci detay: ARP trend grafiği gösteriliyor
✅ Risk uyarıları: Kritik/yüksek risk gösteriliyor
✅ RLS: Admin sadece kendi kurumunun öğrencilerini görüyor
```
