// =====================================================
// app/admin/students/[id]/page.tsx
// Öğrenci detay sayfası — admin görünümü
// =====================================================

import Link                  from 'next/link'
import { notFound }          from 'next/navigation'
import { requireAdmin }      from '../../../../lib/adminGuard'
import { createServerClient } from '../../../../lib/supabase/server'

// ── Helpers ───────────────────────────────────────

function fmt(n: number | null | undefined) {
  return (n ?? 0).toLocaleString('tr-TR')
}

function fmtDate(d: string | null | undefined) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('tr-TR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

function fmtDateTime(d: string | null | undefined) {
  if (!d) return '—'
  return new Date(d).toLocaleString('tr-TR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function fmtSec(s: number | null | undefined) {
  const t = s ?? 0
  if (t <= 0) return '—'
  if (t < 60) return `${t}s`
  return `${Math.floor(t / 60)}d ${t % 60}s`
}

function accuracyColor(pct: number): string {
  if (pct >= 70) return 'text-green-400 border-green-700 bg-green-900/20'
  if (pct >= 40) return 'text-yellow-400 border-yellow-700 bg-yellow-900/20'
  return 'text-red-400 border-red-700 bg-red-900/20'
}

// ── Types ─────────────────────────────────────────

interface QuestionSession {
  id: string
  question_id: string
  is_correct: boolean
  response_time_seconds: number | null
  created_at: string
  text_library: { category: string } | null
}

interface QuestionSessionWithText {
  id: string
  question_id: string
  is_correct: boolean
  response_time_seconds: number | null
  created_at: string
  text_library: { category: string } | null
  text_questions: { question_text: string } | null
}

interface MockExam {
  id: string
  exam_type: string
  subject: string | null
  correct_count: number
  wrong_count: number
  empty_count: number
  net_score: number | null
  time_spent_seconds: number | null
  created_at: string
}

interface SubjectStats {
  category: string
  correct: number
  total: number
  accuracy: number
}

// ── Page ──────────────────────────────────────────

interface Props {
  params: Promise<{ id: string }>
}

export default async function StudentDetailPage({ params }: Props) {
  await requireAdmin()
  const { id } = await params
  const supabase = await createServerClient()

  // ── 1. Student row ────────────────────────────
  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('id, auth_user_id, full_name, email, exam_target, total_xp, streak_days, is_active, created_at')
    .eq('id', id)
    .single()

  if (studentError || !student) {
    notFound()
  }

  // auth_user_id = auth.users.id — used in user_question_sessions.user_id
  const authUserId = student.auth_user_id as string

  // ── 2. All question sessions for subject grid ─
  const { data: allSessionsRaw } = await supabase
    .from('user_question_sessions')
    .select('id, question_id, is_correct, response_time_seconds, created_at, text_library(category)')
    .eq('user_id', authUserId)
    .order('created_at', { ascending: false })

  const allSessions = (allSessionsRaw ?? []) as unknown as QuestionSession[]

  // Group by category
  const subjectMap: Record<string, { correct: number; total: number }> = {}
  for (const s of allSessions) {
    const cat = s.text_library?.category ?? 'Diğer'
    if (!subjectMap[cat]) subjectMap[cat] = { correct: 0, total: 0 }
    subjectMap[cat].total += 1
    if (s.is_correct) subjectMap[cat].correct += 1
  }

  const subjectStats: SubjectStats[] = Object.entries(subjectMap)
    .map(([category, { correct, total }]) => ({
      category,
      correct,
      total,
      accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total)

  // ── 3. Mock exams (last 10) ────────────────────
  const { data: mockExamsRaw } = await supabase
    .from('mock_exams')
    .select('id, exam_type, subject, correct_count, wrong_count, empty_count, net_score, time_spent_seconds, created_at')
    .eq('student_id', student.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const mockExams = (mockExamsRaw ?? []) as MockExam[]

  // ── 4. Wrong answers pending today ────────────
  const today = new Date().toISOString().split('T')[0]
  const { count: pendingWrongCount } = await supabase
    .from('wrong_answers')
    .select('id', { count: 'exact', head: true })
    .eq('student_id', student.id)
    .lte('next_review_at', today)

  const pendingWrong = pendingWrongCount ?? 0

  // ── 5. Recent sessions (last 20) with question text ──
  const { data: recentRaw } = await supabase
    .from('user_question_sessions')
    .select('id, question_id, is_correct, response_time_seconds, created_at, text_library(category), text_questions(question_text)')
    .eq('user_id', authUserId)
    .order('created_at', { ascending: false })
    .limit(20)

  const recentSessions = (recentRaw ?? []) as unknown as QuestionSessionWithText[]

  // ── Summary stats ──────────────────────────────
  const totalAnswered   = allSessions.length
  const totalCorrect    = allSessions.filter(s => s.is_correct).length
  const overallAccuracy = totalAnswered > 0
    ? Math.round((totalCorrect / totalAnswered) * 100)
    : 0

  return (
    <div className="p-8 space-y-8">
      {/* ── Back link ──────────────────────────────── */}
      <div>
        <Link
          href="/admin/students"
          className="text-slate-400 hover:text-white text-sm transition-colors"
        >
          ← Öğrenciler
        </Link>
      </div>

      {/* ── Student Header ─────────────────────────── */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-white">
                {student.full_name as string}
              </h1>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                student.is_active
                  ? 'bg-green-900/50 text-green-400'
                  : 'bg-slate-700 text-slate-400'
              }`}>
                {student.is_active ? 'Aktif' : 'Pasif'}
              </span>
            </div>
            <p className="text-slate-400 text-sm">{student.email as string}</p>
            <p className="text-slate-500 text-xs mt-1">
              Kayıt: {fmtDate(student.created_at as string)}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: 'Hedef Sınav',
                value: String(student.exam_target ?? '—').toUpperCase(),
                color: 'text-indigo-400',
              },
              {
                label: 'Toplam XP',
                value: fmt(student.total_xp as number | null),
                color: 'text-yellow-400',
              },
              {
                label: 'Seri (gün)',
                value: fmt(student.streak_days as number | null),
                color: 'text-orange-400',
              },
              {
                label: 'Genel Başarı',
                value: `%${overallAccuracy}`,
                color: overallAccuracy >= 70
                  ? 'text-green-400'
                  : overallAccuracy >= 40
                    ? 'text-yellow-400'
                    : 'text-red-400',
              },
            ].map(kpi => (
              <div key={kpi.label} className="bg-slate-900/60 rounded-lg p-3 min-w-[90px]">
                <p className="text-slate-500 text-xs mb-1">{kpi.label}</p>
                <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Wrong Answers Warning ──────────────────── */}
      {pendingWrong > 0 && (
        <div className="flex items-center gap-3 bg-orange-900/20 border border-orange-700/50 rounded-xl px-5 py-4">
          <span className="text-orange-400 text-lg font-bold">!</span>
          <p className="text-orange-300 text-sm font-medium">
            {fmt(pendingWrong)} soru tekrar bekliyor
          </p>
          <p className="text-orange-500 text-xs ml-1">
            (bugün veya öncesinde tekrar tarihi dolmuş)
          </p>
        </div>
      )}

      {/* ── Subject Progress Grid ──────────────────── */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">
          Konu Bazlı Başarı
          <span className="text-slate-500 text-sm font-normal ml-2">
            ({fmt(totalAnswered)} soru)
          </span>
        </h2>

        {subjectStats.length === 0 ? (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 text-center">
            <p className="text-slate-500 text-sm">Henüz soru cevaplanmamış.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {subjectStats.map(stat => (
              <div
                key={stat.category}
                className={`rounded-xl border p-4 ${accuracyColor(stat.accuracy)}`}
              >
                <p className="text-white text-sm font-medium mb-2 truncate">
                  {stat.category}
                </p>
                <p className="text-3xl font-bold mb-1">%{stat.accuracy}</p>
                <p className="text-xs opacity-70">
                  {fmt(stat.correct)} / {fmt(stat.total)} doğru
                </p>
                <div className="mt-2 h-1.5 rounded-full bg-slate-700/50 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-current opacity-60"
                    style={{ width: `${stat.accuracy}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Mock Exams History ─────────────────────── */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">
          Deneme Sınavları
          <span className="text-slate-500 text-sm font-normal ml-2">(son 10)</span>
        </h2>

        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                {['Sınav', 'Ders', 'Doğru', 'Yanlış', 'Boş', 'Net', 'Süre', 'Tarih'].map(h => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs text-slate-400 font-medium whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockExams.map(exam => (
                <tr
                  key={exam.id}
                  className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors"
                >
                  <td className="px-4 py-3 text-indigo-400 text-sm font-semibold whitespace-nowrap">
                    {exam.exam_type}
                  </td>
                  <td className="px-4 py-3 text-slate-300 text-sm">
                    {exam.subject ?? 'Karma'}
                  </td>
                  <td className="px-4 py-3 text-green-400 text-sm font-medium">
                    {fmt(exam.correct_count)}
                  </td>
                  <td className="px-4 py-3 text-red-400 text-sm font-medium">
                    {fmt(exam.wrong_count)}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-sm">
                    {fmt(exam.empty_count)}
                  </td>
                  <td className="px-4 py-3 text-yellow-400 text-sm font-semibold">
                    {exam.net_score != null ? exam.net_score.toFixed(2) : '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-300 text-sm">
                    {fmtSec(exam.time_spent_seconds)}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                    {fmtDate(exam.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {mockExams.length === 0 && (
            <p className="text-slate-500 text-sm text-center py-10">
              Henüz deneme sınavı yok.
            </p>
          )}
        </div>
      </section>

      {/* ── Recent Sessions ────────────────────────── */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">
          Son Soru Oturumları
          <span className="text-slate-500 text-sm font-normal ml-2">(son 20)</span>
        </h2>

        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                {['Sonuç', 'Soru', 'Kategori', 'Süre', 'Tarih'].map(h => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs text-slate-400 font-medium whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentSessions.map(sess => {
                const qText    = sess.text_questions?.question_text ?? null
                const category = sess.text_library?.category ?? '—'
                return (
                  <tr
                    key={sess.id}
                    className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className={`text-base font-bold ${sess.is_correct ? 'text-green-400' : 'text-red-400'}`}>
                        {sess.is_correct ? '✓' : '✗'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300 text-sm max-w-xs">
                      {qText ? (
                        <span
                          className="overflow-hidden"
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          } as React.CSSProperties}
                        >
                          {qText}
                        </span>
                      ) : (
                        <span className="text-slate-600 italic text-xs">
                          Soru metni bulunamadı
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                      {category}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                      {sess.response_time_seconds != null
                        ? `${sess.response_time_seconds}s`
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                      {fmtDateTime(sess.created_at)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {recentSessions.length === 0 && (
            <p className="text-slate-500 text-sm text-center py-10">
              Henüz soru cevaplanmamış.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
