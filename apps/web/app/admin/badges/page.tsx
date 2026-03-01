// =====================================================
// app/admin/badges/page.tsx
// Rozet & XP genel bakış — admin
// =====================================================

import { requireAdmin }      from '../../../lib/adminGuard'
import { createServerClient } from '../../../lib/supabase/server'

export default async function AdminBadgesPage() {
  await requireAdmin()
  const supabase = await createServerClient()

  const [{ data: badges }, { data: topXp }] = await Promise.all([
    supabase
      .from('badges')
      .select('id, name, description, xp_reward, badge_type, icon_url')
      .order('xp_reward', { ascending: false }),
    supabase
      .from('students')
      .select('full_name, total_xp, streak_days, exam_target')
      .order('total_xp', { ascending: false })
      .limit(10),
  ])

  // Kazanılan rozet sayıları
  const badgeIds = (badges ?? []).map(b => b.id)
  const { data: earned } = badgeIds.length > 0
    ? await supabase
        .from('student_badges')
        .select('badge_id')
        .in('badge_id', badgeIds)
    : { data: [] }

  const earnedCount: Record<string, number> = {}
  for (const e of earned ?? []) {
    earnedCount[e.badge_id] = (earnedCount[e.badge_id] ?? 0) + 1
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Rozetler & XP</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Rozetler */}
        <div>
          <h2 className="text-white font-semibold mb-4">Rozet Kataloğu</h2>
          <div className="bg-slate-800 rounded-xl border border-slate-700">
            {(badges ?? []).length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-10">Henüz rozet tanımı yok.</p>
            ) : (
              <div className="divide-y divide-slate-700">
                {(badges ?? []).map(b => (
                  <div key={b.id} className="flex items-center gap-4 px-5 py-3">
                    <span className="text-2xl">{b.icon_url ?? '🏅'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{b.name}</p>
                      <p className="text-slate-500 text-xs truncate">{b.description ?? b.badge_type ?? ''}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-yellow-400 text-sm font-semibold">+{b.xp_reward ?? 0} XP</p>
                      <p className="text-slate-500 text-xs">{earnedCount[b.id] ?? 0} kazandı</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* XP Sıralaması */}
        <div>
          <h2 className="text-white font-semibold mb-4">XP Liderler Tablosu</h2>
          <div className="bg-slate-800 rounded-xl border border-slate-700">
            {(topXp ?? []).length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-10">XP verisi yok.</p>
            ) : (
              <div className="divide-y divide-slate-700">
                {(topXp ?? []).map((s, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-3">
                    <span className="text-slate-500 text-sm font-bold w-6">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{s.full_name}</p>
                      <p className="text-slate-500 text-xs">{s.exam_target ?? '—'} · {s.streak_days ?? 0} gün seri</p>
                    </div>
                    <p className="text-yellow-400 text-sm font-bold shrink-0">
                      {(s.total_xp ?? 0).toLocaleString('tr-TR')} XP
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
