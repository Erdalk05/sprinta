// =====================================================
// app/admin/exercises/page.tsx
// Egzersiz kütüphanesi — admin görünümü
// =====================================================

import { requireAdmin }      from '../../../lib/adminGuard'
import { createServerClient } from '../../../lib/supabase/server'

export default async function AdminExercisesPage() {
  await requireAdmin()
  const supabase = await createServerClient()

  const { data: exercises } = await supabase
    .from('exercises')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  const total = exercises?.length ?? 0

  // Tür sayıları
  const byType: Record<string, number> = {}
  for (const ex of exercises ?? []) {
    const t = (ex.exercise_type ?? ex.type ?? 'unknown') as string
    byType[t] = (byType[t] ?? 0) + 1
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Egzersizler</h1>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <p className="text-slate-400 text-xs mb-2">Toplam</p>
          <p className="text-3xl font-bold text-indigo-400">{total}</p>
        </div>
        {Object.entries(byType).map(([type, count]) => (
          <div key={type} className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            <p className="text-slate-400 text-xs mb-2 capitalize">{type}</p>
            <p className="text-3xl font-bold text-blue-400">{count}</p>
          </div>
        ))}
      </div>

      {/* Tablo */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              {['Başlık', 'Tür', 'Zorluk', 'Süre (s)', 'XP Değeri', 'Oluşturma'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs text-slate-400 font-medium whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(exercises ?? []).map(ex => (
              <tr key={ex.id} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                <td className="px-5 py-3 text-white text-sm font-medium max-w-xs truncate">
                  {ex.title ?? ex.name ?? ex.id}
                </td>
                <td className="px-5 py-3 text-slate-300 text-sm capitalize">
                  {ex.exercise_type ?? ex.type ?? '—'}
                </td>
                <td className="px-5 py-3 text-slate-300 text-sm">
                  {ex.difficulty_level ?? ex.difficulty ?? '—'}
                </td>
                <td className="px-5 py-3 text-slate-300 text-sm">
                  {ex.duration_seconds ?? ex.duration ?? '—'}
                </td>
                <td className="px-5 py-3 text-yellow-400 text-sm">
                  {ex.xp_reward ?? ex.xp_value ?? '—'}
                </td>
                <td className="px-5 py-3 text-slate-500 text-xs whitespace-nowrap">
                  {new Date(ex.created_at).toLocaleDateString('tr-TR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {total === 0 && (
          <p className="text-slate-500 text-sm text-center py-12">Henüz egzersiz yok.</p>
        )}
      </div>
    </div>
  )
}
