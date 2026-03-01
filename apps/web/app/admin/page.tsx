// =====================================================
// app/admin/page.tsx — Sprint 6+
// Admin dashboard — tüm proje özeti
// =====================================================

import Link from 'next/link'
import { requireAdmin }        from '../../lib/adminGuard'
import { createServerClient }  from '../../lib/supabase/server'
import { createAdminContentService } from '@sprinta/api'
import type { ContentAnalytics, TextItemExtended } from '@sprinta/api'

function fmtNum(n: number | null | undefined): string {
  return (n ?? 0).toLocaleString('tr-TR')
}

export default async function AdminDashboardPage(){
  await requireAdmin()

  const supabase    = await createServerClient()
  const adminSvc    = createAdminContentService(supabase)

  const { data: { user } } = await supabase.auth.getUser()
  const { data: student }  = user
    ? await supabase.from('students').select('full_name').eq('auth_user_id', user.id).single()
    : { data: null }

  const [
    textsResult,
    analyticsResult,
    { count: totalStudents },
    { count: totalSessions },
    { data: recentSessions },
    { data: topStudents },
  ] = await Promise.all([
    adminSvc.getAllTextsAdmin(),
    adminSvc.getContentAnalytics(),
    supabase.from('students').select('*', { count: 'exact', head: true }),
    supabase.from('sessions').select('*', { count: 'exact', head: true }),
    supabase
      .from('sessions')
      .select('id, module_code, xp_earned, is_completed, created_at, student:students(full_name)')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('students')
      .select('full_name, total_xp, streak_days')
      .order('total_xp', { ascending: false })
      .limit(5),
  ])

  const texts:     TextItemExtended[]  = textsResult.data    ?? []
  const analytics: ContentAnalytics[]  = analyticsResult.data ?? []

  const totalContent   = texts.length
  const publishedCount = texts.filter(t => t.status === 'published').length
  const totalReaders   = analytics.reduce((s, a) => s + (a.total_readers ?? 0), 0)

  const today = new Date().toLocaleDateString('tr-TR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className="p-8">
      {/* ── Header ──────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Hoş geldin, {student?.full_name ?? 'Admin'} 👋
        </h1>
        <p className="text-slate-400 text-sm mt-1">{today}</p>
      </div>

      {/* ── Platform KPI ────────────────────────────── */}
      <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-3">Platform Geneli</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Toplam Öğrenci', value: totalStudents ?? 0,   color: 'text-blue-400',   href: '/admin/students' },
          { label: 'Toplam Oturum',  value: totalSessions ?? 0,   color: 'text-purple-400', href: '/admin/sessions' },
          { label: 'İçerik Sayısı',  value: totalContent,         color: 'text-indigo-400', href: '/admin/texts'    },
          { label: 'Toplam Okuyucu', value: totalReaders,         color: 'text-green-400',  href: '/admin/analytics'},
        ].map(card => (
          <Link key={card.label} href={card.href}
            className="bg-slate-800 rounded-xl border border-slate-700 p-5 hover:border-slate-500 transition-colors"
          >
            <p className="text-slate-400 text-xs mb-2">{card.label}</p>
            <p className={`text-3xl font-bold ${card.color}`}>{fmtNum(card.value)}</p>
          </Link>
        ))}
      </div>

      {/* ── İçerik KPI ──────────────────────────────── */}
      <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-3">İçerik Durumu</p>
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Yayında',       value: publishedCount,                          color: 'text-green-400'  },
          { label: 'Taslak',        value: texts.filter(t=>t.status==='draft').length, color: 'text-yellow-400' },
          { label: 'Arşiv',         value: texts.filter(t=>t.status==='archived').length, color: 'text-red-400' },
        ].map(card => (
          <div key={card.label} className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            <p className="text-slate-400 text-xs mb-2">{card.label}</p>
            <p className={`text-3xl font-bold ${card.color}`}>{fmtNum(card.value)}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Son Oturumlar ──────────────────────────── */}
        <div className="bg-slate-800 rounded-xl border border-slate-700">
          <div className="p-5 border-b border-slate-700 flex justify-between items-center">
            <h2 className="text-white font-semibold">Son Oturumlar</h2>
            <Link href="/admin/sessions" className="text-indigo-400 hover:text-indigo-300 text-xs">
              Tümünü gör →
            </Link>
          </div>
          {(recentSessions?.length ?? 0) === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">Henüz oturum yok.</p>
          ) : (
            <div className="divide-y divide-slate-700/50">
              {recentSessions!.map(s => {
                const st = s.student as unknown as { full_name: string } | null
                return (
                  <div key={s.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-white text-sm">{st?.full_name ?? '—'}</p>
                      <p className="text-slate-500 text-xs">{s.module_code ?? '—'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-yellow-400 text-sm font-semibold">+{s.xp_earned ?? 0} XP</p>
                      <p className="text-slate-500 text-xs">
                        {new Date(s.created_at).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── XP Liderler ────────────────────────────── */}
        <div className="bg-slate-800 rounded-xl border border-slate-700">
          <div className="p-5 border-b border-slate-700 flex justify-between items-center">
            <h2 className="text-white font-semibold">XP Liderler</h2>
            <Link href="/admin/students" className="text-indigo-400 hover:text-indigo-300 text-xs">
              Tümünü gör →
            </Link>
          </div>
          {(topStudents?.length ?? 0) === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">XP verisi yok.</p>
          ) : (
            <div className="divide-y divide-slate-700/50">
              {topStudents!.map((s, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-3">
                  <span className="text-slate-600 text-sm font-bold w-5">#{i+1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{s.full_name}</p>
                    <p className="text-slate-500 text-xs">{s.streak_days ?? 0} gün seri</p>
                  </div>
                  <p className="text-yellow-400 text-sm font-bold">
                    {(s.total_xp ?? 0).toLocaleString('tr-TR')} XP
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
