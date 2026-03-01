// =====================================================
// app/admin/sessions/page.tsx
// Tüm oturumlar — admin görünümü
// =====================================================

import { requireAdmin }      from '../../../lib/adminGuard'
import { createServerClient } from '../../../lib/supabase/server'

function fmt(n: number | null | undefined) {
  return (n ?? 0).toLocaleString('tr-TR')
}
function fmtSec(s: number | null | undefined) {
  const t = s ?? 0
  if (t < 60) return `${t}s`
  return `${Math.floor(t / 60)}d ${t % 60}s`
}

export default async function AdminSessionsPage() {
  await requireAdmin()
  const supabase = await createServerClient()

  const { data: sessions } = await supabase
    .from('sessions')
    .select(`
      id, session_type, module_code, difficulty_level,
      duration_seconds, is_completed, xp_earned, rei, arp,
      created_at,
      student:students(full_name, email)
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  const total      = sessions?.length ?? 0
  const completed  = sessions?.filter(s => s.is_completed).length ?? 0
  const totalXp    = sessions?.reduce((acc, s) => acc + (s.xp_earned ?? 0), 0) ?? 0
  const avgDur     = total > 0
    ? Math.round((sessions ?? []).reduce((a, s) => a + (s.duration_seconds ?? 0), 0) / total)
    : 0

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Oturumlar</h1>

      {/* KPI */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Toplam',       value: fmt(total),     color: 'text-indigo-400' },
          { label: 'Tamamlanan',   value: fmt(completed), color: 'text-green-400'  },
          { label: 'Toplam XP',    value: fmt(totalXp),   color: 'text-yellow-400' },
          { label: 'Ort. Süre',    value: fmtSec(avgDur), color: 'text-blue-400'   },
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
              {['Öğrenci', 'Modül', 'Tür', 'Zorluk', 'Süre', 'XP', 'REI', 'ARP', 'Durum', 'Tarih'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs text-slate-400 font-medium whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(sessions ?? []).map(s => {
              const st = s.student as unknown as { full_name: string; email: string } | null
              return (
                <tr key={s.id} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                  <td className="px-4 py-3 text-white text-sm font-medium max-w-[140px] truncate">
                    {st?.full_name ?? st?.email ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-300 text-sm">{s.module_code ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{s.session_type ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-300 text-sm">{s.difficulty_level ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-300 text-sm">{fmtSec(s.duration_seconds)}</td>
                  <td className="px-4 py-3 text-yellow-400 text-sm font-semibold">{fmt(s.xp_earned)}</td>
                  <td className="px-4 py-3 text-blue-400 text-sm">{s.rei != null ? s.rei.toFixed(2) : '—'}</td>
                  <td className="px-4 py-3 text-purple-400 text-sm">{s.arp != null ? s.arp.toFixed(0) : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      s.is_completed ? 'bg-green-900/50 text-green-400' : 'bg-slate-700 text-slate-400'
                    }`}>
                      {s.is_completed ? 'Tamamlandı' : 'Yarım'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                    {new Date(s.created_at).toLocaleDateString('tr-TR')}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {total === 0 && (
          <p className="text-slate-500 text-sm text-center py-12">Henüz oturum yok.</p>
        )}
      </div>
    </div>
  )
}
