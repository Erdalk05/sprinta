// =====================================================
// app/admin/students/page.tsx
// Tüm öğrenciler — admin görünümü
// =====================================================

import { requireAdmin }      from '../../../lib/adminGuard'
import { createServerClient } from '../../../lib/supabase/server'

function fmt(n: number | null | undefined) {
  return (n ?? 0).toLocaleString('tr-TR')
}

const RISK_LABEL: Record<string, string> = {
  low:      'Düşük',
  medium:   'Orta',
  high:     'Yüksek',
  critical: 'Kritik',
}
const RISK_COLOR: Record<string, string> = {
  low:      'text-green-400',
  medium:   'text-yellow-400',
  high:     'text-orange-400',
  critical: 'text-red-400',
}

export default async function AdminStudentsPage() {
  await requireAdmin()
  const supabase = await createServerClient()

  const { data: students } = await supabase
    .from('students')
    .select(`
      id, full_name, email, exam_target,
      total_xp, streak_days, is_active,
      created_at,
      risk:student_risk_scores(risk_level)
    `)
    .order('total_xp', { ascending: false })
    .limit(100)

  const total   = students?.length ?? 0
  const active  = students?.filter(s => s.is_active).length ?? 0
  const totalXp = students?.reduce((s, x) => s + (x.total_xp ?? 0), 0) ?? 0

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Öğrenciler</h1>

      {/* KPI */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Toplam Kayıt',  value: fmt(total),   color: 'text-indigo-400' },
          { label: 'Aktif',         value: fmt(active),  color: 'text-green-400'  },
          { label: 'Toplam XP',     value: fmt(totalXp), color: 'text-yellow-400' },
        ].map(c => (
          <div key={c.label} className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            <p className="text-slate-400 text-xs mb-2">{c.label}</p>
            <p className={`text-3xl font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Tablo */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              {['Ad Soyad', 'E-posta', 'Sınav', 'XP', 'Seri (gün)', 'Risk', 'Durum'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs text-slate-400 font-medium whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(students ?? []).map(s => {
              const riskRaw = s.risk as unknown
              const riskArr = Array.isArray(riskRaw) ? riskRaw : (riskRaw ? [riskRaw] : [])
              const risk = riskArr[0]?.risk_level ?? null
              return (
                <tr key={s.id} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                  <td className="px-5 py-3 text-white text-sm font-medium">{s.full_name}</td>
                  <td className="px-5 py-3 text-slate-400 text-sm">{s.email}</td>
                  <td className="px-5 py-3 text-slate-300 text-sm">{s.exam_target ?? '—'}</td>
                  <td className="px-5 py-3 text-yellow-400 text-sm font-semibold">{fmt(s.total_xp)}</td>
                  <td className="px-5 py-3 text-slate-300 text-sm">{s.streak_days ?? 0}</td>
                  <td className={`px-5 py-3 text-sm font-medium ${risk ? RISK_COLOR[risk] : 'text-slate-500'}`}>
                    {risk ? RISK_LABEL[risk] : '—'}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      s.is_active ? 'bg-green-900/50 text-green-400' : 'bg-slate-700 text-slate-400'
                    }`}>
                      {s.is_active ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {total === 0 && (
          <p className="text-slate-500 text-sm text-center py-12">Henüz öğrenci yok.</p>
        )}
      </div>
    </div>
  )
}
