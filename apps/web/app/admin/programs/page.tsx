// =====================================================
// app/admin/programs/page.tsx
// Program Yönetimi — exam_programs CRUD + öğrenci atama
// =====================================================

import Link                  from 'next/link'
import { requireAdmin }      from '../../../lib/adminGuard'
import { createServerClient } from '../../../lib/supabase/server'

function fmtDate(d: string | null | undefined) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('tr-TR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

interface Program {
  id: string
  title: string
  exam_type: string
  description: string | null
  duration_days: number | null
  is_active: boolean
  created_at: string
  _student_count?: number
}

export default async function AdminProgramsPage() {
  await requireAdmin()
  const supabase = await createServerClient()

  // ── Programs ───────────────────────────────────────────────────
  const { data: programsRaw } = await supabase
    .from('exam_programs')
    .select('id, title, exam_type, description, duration_days, is_active, created_at')
    .order('created_at', { ascending: false })

  const programs = (programsRaw ?? []) as Program[]

  // ── Student counts per program ────────────────────────────────
  const { data: assignmentsRaw } = await supabase
    .from('student_programs')
    .select('program_id')

  const countMap: Record<string, number> = {}
  for (const a of (assignmentsRaw ?? []) as { program_id: string }[]) {
    countMap[a.program_id] = (countMap[a.program_id] ?? 0) + 1
  }

  const enriched = programs.map(p => ({ ...p, _student_count: countMap[p.id] ?? 0 }))

  // ── Stats ──────────────────────────────────────────────────────
  const activeCount  = enriched.filter(p => p.is_active).length
  const totalStudents = Object.values(countMap).reduce((s, v) => s + v, 0)

  const EXAM_COLORS: Record<string, string> = {
    LGS:  'bg-blue-900/40 text-blue-400 border-blue-700',
    TYT:  'bg-indigo-900/40 text-indigo-400 border-indigo-700',
    AYT:  'bg-purple-900/40 text-purple-400 border-purple-700',
    YDS:  'bg-teal-900/40 text-teal-400 border-teal-700',
    ALES: 'bg-amber-900/40 text-amber-400 border-amber-700',
    KPSS: 'bg-green-900/40 text-green-400 border-green-700',
  }

  return (
    <div className="p-8 space-y-8">
      {/* ── Page Header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Program Yönetimi</h1>
          <p className="text-slate-400 text-sm mt-1">
            Sınav programlarını düzenle · Öğrenci ata · Görev planla
          </p>
        </div>
        <Link
          href="/admin/programs/new"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          + Yeni Program
        </Link>
      </div>

      {/* ── KPI Tiles ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Toplam Program', value: programs.length, color: 'text-white' },
          { label: 'Aktif Program',  value: activeCount,      color: 'text-green-400' },
          { label: 'Atanmış Öğrenci', value: totalStudents,  color: 'text-blue-400' },
          { label: 'Pasif Program',  value: programs.length - activeCount, color: 'text-slate-400' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <p className="text-slate-500 text-xs mb-1">{kpi.label}</p>
            <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* ── Program Grid ─────────────────────────────────────────── */}
      {enriched.length === 0 ? (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
          <p className="text-slate-500 text-sm mb-4">Henüz program oluşturulmamış.</p>
          <Link
            href="/admin/programs/new"
            className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
          >
            + İlk programı oluştur
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {enriched.map(program => {
            const examColor = EXAM_COLORS[program.exam_type] ?? 'bg-slate-900/40 text-slate-400 border-slate-700'
            return (
              <div
                key={program.id}
                className={`bg-slate-800 rounded-xl border ${program.is_active ? 'border-slate-700' : 'border-slate-800 opacity-60'} p-5 flex flex-col gap-4`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-base leading-tight truncate">
                      {program.title}
                    </h3>
                    {program.description && (
                      <p className="text-slate-400 text-xs mt-1 line-clamp-2">
                        {program.description}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded border font-medium ${examColor}`}>
                      {program.exam_type}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      program.is_active
                        ? 'bg-green-900/50 text-green-400'
                        : 'bg-slate-700 text-slate-400'
                    }`}>
                      {program.is_active ? 'Aktif' : 'Pasif'}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-900/60 rounded-lg p-3">
                    <p className="text-slate-500 text-xs mb-1">Öğrenci</p>
                    <p className="text-white text-lg font-bold">{program._student_count}</p>
                  </div>
                  <div className="bg-slate-900/60 rounded-lg p-3">
                    <p className="text-slate-500 text-xs mb-1">Süre</p>
                    <p className="text-white text-lg font-bold">
                      {program.duration_days ? `${program.duration_days} gün` : '—'}
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-700/50">
                  <p className="text-slate-500 text-xs">
                    {fmtDate(program.created_at)}
                  </p>
                  <div className="flex gap-3">
                    <Link
                      href={`/admin/programs/${program.id}/students`}
                      className="text-blue-400 hover:text-blue-300 text-xs font-medium transition-colors"
                    >
                      Öğrenciler
                    </Link>
                    <Link
                      href={`/admin/programs/${program.id}`}
                      className="text-slate-400 hover:text-white text-xs font-medium transition-colors"
                    >
                      Düzenle →
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Info Box ─────────────────────────────────────────────── */}
      <div className="bg-blue-900/20 border border-blue-700/40 rounded-xl p-5">
        <h3 className="text-blue-300 font-semibold text-sm mb-2">Program Sistemi Hakkında</h3>
        <ul className="text-slate-400 text-xs space-y-1 list-disc list-inside">
          <li>Her program belirli bir sınava yönelik günlük görev planı içerir</li>
          <li>Öğrenciler birden fazla programa atanabilir</li>
          <li>Aktif programdaki görevler öğrencinin ana sayfasında görünür</li>
          <li>Program tamamlandığında öğrenciye rozet ve XP bonusu verilir</li>
        </ul>
      </div>
    </div>
  )
}
