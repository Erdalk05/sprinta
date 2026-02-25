# 11 — SUPER ADMIN PANELİ
## admin.sprinta.app — Sprinta Operasyon Paneli

---

## 1. SUPER ADMIN DASHBOARD

```tsx
// apps/web/app/(admin)/page.tsx

import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Building2, Users, DollarSign, AlertTriangle } from 'lucide-react';
import { TenantsTable } from '@/components/admin/TenantsTable';
import { NewTenantButton } from '@/components/admin/NewTenantButton';

export default async function SuperAdminDashboard() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Super admin kontrolü
  const { data: superAdmin } = await supabase
    .from('super_admins')
    .select('id, full_name')
    .eq('auth_user_id', user.id)
    .single();
  if (!superAdmin) redirect('/login');

  // Global metrikler
  const { count: totalTenants } = await supabase
    .from('tenants')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  const { count: totalStudents } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  const { data: tenants } = await supabase
    .from('tenants')
    .select(`
      id, name, tier, used_students, max_students,
      contract_end, is_active, monthly_revenue,
      is_trial, trial_ends_at, created_at
    `)
    .order('created_at', { ascending: false });

  // Toplam MRR hesapla
  const totalMrr = tenants?.reduce((s, t) => s + (t.monthly_revenue ?? 0), 0) ?? 0;

  // Trial bitiş yaklaşan kurumlar
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
          { label: 'Aktif Kurum', value: totalTenants ?? 0, icon: Building2, color: 'text-blue-400' },
          { label: 'Toplam Öğrenci', value: totalStudents ?? 0, icon: Users, color: 'text-green-400' },
          { label: 'Toplam MRR (₺)', value: totalMrr.toFixed(0), icon: DollarSign, color: 'text-yellow-400' },
          { label: 'Trial Bitiyor', value: soonExpiring?.length ?? 0, icon: AlertTriangle, color: 'text-red-400' },
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

      {/* Kurum Tablosu */}
      <TenantsTable tenants={tenants ?? []} />
    </div>
  );
}
```

---

## 2. YENİ KURUM OLUŞTURMA

```tsx
// apps/web/app/(admin)/tenants/new/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';

const NewTenantSchema = z.object({
  name: z.string().min(2, 'Kurum adı en az 2 karakter'),
  type: z.enum(['school', 'tutoring_center']),
  tier: z.enum(['starter', 'professional', 'enterprise']),
  maxStudents: z.number().min(10).max(5000),
  contractMonths: z.number().min(1).max(36),
  primaryEmail: z.string().email(),
  adminFullName: z.string().min(2),
  adminEmail: z.string().email(),
  adminInitialPassword: z.string().min(8),
  taxId: z.string().optional(),
  city: z.string().optional(),
});

type NewTenantInput = z.infer<typeof NewTenantSchema>;

export default function NewTenantPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof NewTenantInput, string>>>({});
  
  const [form, setForm] = useState<NewTenantInput>({
    name: '',
    type: 'school',
    tier: 'starter',
    maxStudents: 100,
    contractMonths: 12,
    primaryEmail: '',
    adminFullName: '',
    adminEmail: '',
    adminInitialPassword: '',
    taxId: '',
    city: '',
  });

  const TIER_PRICES: Record<string, number> = {
    starter: 49,
    professional: 39,
    enterprise: 29,
  };

  const monthlyRevenue = Math.max(
    form.tier === 'starter' ? 3000 :
    form.tier === 'professional' ? 5000 : 10000,
    form.maxStudents * TIER_PRICES[form.tier]
  ) / form.contractMonths;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const result = NewTenantSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: typeof errors = {};
      result.error.errors.forEach(err => {
        const field = err.path[0] as keyof NewTenantInput;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.data),
      });

      if (res.ok) {
        router.push('/');
      } else {
        const data = await res.json();
        alert('Hata: ' + (data.error ?? 'Bilinmeyen hata'));
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-8">Yeni Kurum Oluştur</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Kurum Bilgileri */}
        <section className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">Kurum Bilgileri</h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-slate-400 text-sm block mb-2">Kurum Adı *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white"
                placeholder="Örn: Başarı Dershanesi"
              />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Kurum Tipi</label>
                <select
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value as 'school' | 'tutoring_center' }))}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white"
                >
                  <option value="school">Okul</option>
                  <option value="tutoring_center">Dershane</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Şehir</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white"
                  placeholder="İstanbul"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Abonelik */}
        <section className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">Abonelik Detayları</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {(['starter', 'professional', 'enterprise'] as const).map(tier => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, tier }))}
                  className={`p-3 rounded-xl border text-sm font-medium transition-colors ${
                    form.tier === tier
                      ? 'border-indigo-500 bg-indigo-900/40 text-indigo-300'
                      : 'border-slate-600 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  <p className="capitalize">{tier === 'starter' ? 'Başlangıç' : tier === 'professional' ? 'Profesyonel' : 'Kurumsal'}</p>
                  <p className="text-xs mt-1">{TIER_PRICES[tier]}₺/öğrenci/yıl</p>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Maksimum Öğrenci</label>
                <input
                  type="number"
                  value={form.maxStudents}
                  onChange={e => setForm(f => ({ ...f, maxStudents: parseInt(e.target.value) }))}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Sözleşme Süresi (ay)</label>
                <input
                  type="number"
                  value={form.contractMonths}
                  onChange={e => setForm(f => ({ ...f, contractMonths: parseInt(e.target.value) }))}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white"
                  min={1} max={36}
                />
              </div>
            </div>

            <div className="bg-slate-900 rounded-lg p-3">
              <p className="text-slate-400 text-sm">Toplam Gelir</p>
              <p className="text-green-400 font-bold text-xl mt-1">
                {(monthlyRevenue * form.contractMonths).toFixed(0)} ₺
              </p>
              <p className="text-slate-500 text-xs">{monthlyRevenue.toFixed(0)} ₺/ay</p>
            </div>
          </div>
        </section>

        {/* Admin Bilgileri */}
        <section className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">Baş Yönetici Bilgileri</h2>
          
          <div className="space-y-4">
            <input
              type="text"
              value={form.adminFullName}
              onChange={e => setForm(f => ({ ...f, adminFullName: e.target.value }))}
              placeholder="Ad Soyad *"
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white"
            />
            <input
              type="email"
              value={form.adminEmail}
              onChange={e => setForm(f => ({ ...f, adminEmail: e.target.value }))}
              placeholder="Email *"
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white"
            />
            <input
              type="text"
              value={form.adminInitialPassword}
              onChange={e => setForm(f => ({ ...f, adminInitialPassword: e.target.value }))}
              placeholder="İlk Şifre (min 8 karakter) *"
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white"
            />
          </div>
        </section>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl py-4 text-white font-bold text-lg transition-colors"
        >
          {isLoading ? 'Oluşturuluyor...' : 'Kurumu Oluştur →'}
        </button>
      </form>
    </div>
  );
}
```

---

## 3. TENANT OLUŞTURMA API

```typescript
// apps/web/app/api/admin/tenants/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = await createServerClient();
  
  // Super admin kontrolü
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const { data: superAdmin } = await supabase
    .from('super_admins')
    .select('id')
    .eq('auth_user_id', user.id)
    .single();
  if (!superAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();

  try {
    // 1. Tenant oluştur
    const slug = body.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .slice(0, 50);

    const contractEnd = new Date();
    contractEnd.setMonth(contractEnd.getMonth() + body.contractMonths);

    const monthlyRevenue = Math.max(
      body.tier === 'starter' ? 3000 / body.contractMonths :
      body.tier === 'professional' ? 5000 / body.contractMonths : 10000 / body.contractMonths,
      body.maxStudents * (body.tier === 'starter' ? 49 : body.tier === 'professional' ? 39 : 29) / 12
    );

    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        name: body.name,
        slug,
        type: body.type,
        tier: body.tier,
        max_students: body.maxStudents,
        contract_start: new Date().toISOString().split('T')[0],
        contract_end: contractEnd.toISOString().split('T')[0],
        is_trial: false,
        primary_email: body.adminEmail,
        city: body.city,
        monthly_revenue: monthlyRevenue,
      })
      .select()
      .single();

    if (tenantError) throw tenantError;

    // 2. Tenant settings oluştur
    await supabase.from('tenant_settings').insert({
      tenant_id: tenant.id,
    });

    // 3. Supabase Auth'ta admin kullanıcısı oluştur
    // NOT: Bu işlem service_role key gerektirir
    // production'da bu API route server-side olduğu için güvenli
    const adminSupabase = supabase;  // Middleware'den gelen (service role kullanılabilir)
    
    const { data: authUser, error: authError } = await adminSupabase.auth.admin.createUser({
      email: body.adminEmail,
      password: body.adminInitialPassword,
      email_confirm: true,
      user_metadata: {
        full_name: body.adminFullName,
        role: 'tenant_admin',
        tenant_id: tenant.id,
      },
    });

    if (authError) throw authError;

    // 4. tenant_admins tablosuna ekle
    await supabase.from('tenant_admins').insert({
      tenant_id: tenant.id,
      auth_user_id: authUser.user.id,
      email: body.adminEmail,
      full_name: body.adminFullName,
      is_primary: true,
    });

    return NextResponse.json({ success: true, tenantId: tenant.id });
  } catch (err) {
    console.error('Tenant oluşturma hatası:', err);
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}
```

---

## ✅ FAZ 11 TAMAMLANMA KRİTERLERİ

```
✅ admin.sprinta.app erişilebilir
✅ Super admin girişi çalışıyor
✅ Dashboard: Global metrikler (kurumlar, öğrenciler, MRR)
✅ Trial bitiş uyarıları gösteriliyor
✅ Yeni kurum formu: Validasyon, fiyat hesaplama
✅ Tenant oluşturma API: Tenant + Admin user + Settings oluşturuyor
✅ RLS: Super admin tüm verileri görüyor
```
