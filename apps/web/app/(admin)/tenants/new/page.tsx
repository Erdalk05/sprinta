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

const TIER_PRICES: Record<string, number> = { starter: 49, professional: 39, enterprise: 29 };
const TIER_LABELS: Record<string, string> = { starter: 'Başlangıç', professional: 'Profesyonel', enterprise: 'Kurumsal' };

const inputCls = 'w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500';

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

  const set = (key: keyof NewTenantInput, value: unknown) =>
    setForm(f => ({ ...f, [key]: value }));

  const monthlyRevenue = Math.max(
    form.tier === 'starter' ? 3000 : form.tier === 'professional' ? 5000 : 10000,
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
    setErrors({});
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.data),
      });
      if (res.ok) {
        router.push('/admin');
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
              <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                className={inputCls} placeholder="Örn: Başarı Dershanesi" />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Kurum Tipi</label>
                <select value={form.type} onChange={e => set('type', e.target.value)} className={inputCls}>
                  <option value="school">Okul</option>
                  <option value="tutoring_center">Dershane</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Şehir</label>
                <input type="text" value={form.city} onChange={e => set('city', e.target.value)}
                  className={inputCls} placeholder="İstanbul" />
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
                <button key={tier} type="button" onClick={() => set('tier', tier)}
                  className={`p-3 rounded-xl border text-sm font-medium transition-colors ${
                    form.tier === tier
                      ? 'border-indigo-500 bg-indigo-900/40 text-indigo-300'
                      : 'border-slate-600 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  <p>{TIER_LABELS[tier]}</p>
                  <p className="text-xs mt-1">{TIER_PRICES[tier]}₺/öğrenci/yıl</p>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Maks. Öğrenci</label>
                <input type="number" value={form.maxStudents}
                  onChange={e => set('maxStudents', parseInt(e.target.value) || 0)} className={inputCls} />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Sözleşme (ay)</label>
                <input type="number" value={form.contractMonths} min={1} max={36}
                  onChange={e => set('contractMonths', parseInt(e.target.value) || 1)} className={inputCls} />
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
            <div>
              <input type="text" value={form.adminFullName}
                onChange={e => set('adminFullName', e.target.value)}
                placeholder="Ad Soyad *" className={inputCls} />
              {errors.adminFullName && <p className="text-red-400 text-xs mt-1">{errors.adminFullName}</p>}
            </div>
            <div>
              <input type="email" value={form.adminEmail}
                onChange={e => set('adminEmail', e.target.value)}
                placeholder="Email *" className={inputCls} />
              {errors.adminEmail && <p className="text-red-400 text-xs mt-1">{errors.adminEmail}</p>}
            </div>
            <div>
              <input type="text" value={form.adminInitialPassword}
                onChange={e => set('adminInitialPassword', e.target.value)}
                placeholder="İlk Şifre (min 8 karakter) *" className={inputCls} />
              {errors.adminInitialPassword && <p className="text-red-400 text-xs mt-1">{errors.adminInitialPassword}</p>}
            </div>
          </div>
        </section>

        <button type="submit" disabled={isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl py-4 text-white font-bold text-lg transition-colors"
        >
          {isLoading ? 'Oluşturuluyor...' : 'Kurumu Oluştur →'}
        </button>
      </form>
    </div>
  );
}
