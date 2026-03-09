// =====================================================
// app/admin/layout.tsx — Sprint 6+
// Admin panel layout — tüm modüller
// =====================================================

import Link from 'next/link'
import { requireAdmin } from '../../lib/adminGuard'
import { createServerClient } from '../../lib/supabase/server'

const NAV_SECTIONS = [
  {
    label: 'GENEL',
    items: [
      { href: '/admin',            icon: '📊', label: 'Dashboard'   },
    ],
  },
  {
    label: 'İÇERİK',
    items: [
      { href: '/admin/texts',          icon: '📚', label: 'Kitaplar'     },
      { href: '/admin/texts/create',   icon: '➕', label: 'Yeni Kitap'   },
      { href: '/admin/questions',      icon: '❓', label: 'Sorular'      },
      { href: '/admin/analytics',      icon: '📈', label: 'Analitik'     },
    ],
  },
  {
    label: 'KULLANICILAR',
    items: [
      { href: '/admin/students',   icon: '👥', label: 'Öğrenciler'   },
      { href: '/admin/sessions',   icon: '🎯', label: 'Oturumlar'    },
    ],
  },
  {
    label: 'PROGRAM',
    items: [
      { href: '/admin/exercises',  icon: '💪', label: 'Egzersizler'  },
      { href: '/admin/badges',     icon: '🏆', label: 'Rozetler'     },
    ],
  },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}){
  await requireAdmin()

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: student } = user
    ? await supabase
        .from('students')
        .select('full_name')
        .eq('auth_user_id', user.id)
        .single()
    : { data: null }

  const displayName = student?.full_name ?? user?.email ?? 'Admin'

  return (
    <div className="flex min-h-screen bg-slate-900">
      {/* ── Sidebar ─────────────────────────────────── */}
      <aside className="w-56 shrink-0 bg-slate-800 border-r border-slate-700 flex flex-col">
        {/* Logo */}
        <div className="p-5 border-b border-slate-700">
          <h1 className="text-white font-bold text-lg tracking-tight">SPRINTA</h1>
          <p className="text-slate-400 text-xs mt-0.5">Admin Paneli</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 overflow-y-auto space-y-4">
          {NAV_SECTIONS.map(section => (
            <div key={section.label}>
              <p className="text-slate-600 text-xs font-semibold px-3 mb-1 uppercase tracking-widest">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors text-sm"
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          <p className="text-slate-500 text-xs mb-2 truncate">{displayName}</p>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="text-slate-400 hover:text-white text-xs transition-colors"
            >
              Çıkış Yap →
            </button>
          </form>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────── */}
      <main className="flex-1 overflow-auto bg-slate-900">
        {children}
      </main>
    </div>
  )
}
