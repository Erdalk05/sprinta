// =====================================================
// app/admin/analytics/page.tsx — Sprint 7 (extended)
// Content analytics + drop-off tablosu + SVG grafik
// =====================================================

import { requireAdmin }       from '../../../lib/adminGuard'
import { createServerClient } from '../../../lib/supabase/server'
import { createAdminContentService, createAdaptiveService, createExamService } from '@sprinta/api'
import type {
  ContentAnalytics, ChapterDropoff, ReadersOverTime,
  ExamAccuracyByType, RiskDistribution,
} from '@sprinta/api'

// ─── SVG Bar Chart ────────────────────────────────────
// Tüm son 30 günü doldurur, eksik günler 0
function buildChartData(rows: ReadersOverTime[]): Array<{ date: string; count: number }> {
  const map = new Map<string, number>()
  rows.forEach(r => map.set(r.reading_date.slice(0, 10), r.unique_readers))

  const result: Array<{ date: string; count: number }> = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    result.push({ date: key, count: map.get(key) ?? 0 })
  }
  return result
}

// ─── Satır renk sınıfı ───────────────────────────────
function dropoffRowClass(pct: number): string {
  if (pct >= 60) return 'bg-red-950/40 text-red-300'
  if (pct >= 30) return 'bg-yellow-950/30 text-yellow-200'
  return ''
}

// ─── SVG Pie Chart (risk dağılımı) ───────────────────
// Her dilim için path oluşturur (cx=50, cy=50, r=40)
function buildPieSlices(
  data: Array<{ value: number; color: string; label: string }>,
): Array<{ path: string; color: string; label: string; pct: number }> {
  const total = data.reduce((s, d) => s + d.value, 0)
  if (total === 0) return []

  const CX = 50, CY = 50, R = 40
  let startAngle = -Math.PI / 2

  return data.map(d => {
    const angle    = (d.value / total) * 2 * Math.PI
    const endAngle = startAngle + angle
    const x1 = CX + R * Math.cos(startAngle)
    const y1 = CY + R * Math.sin(startAngle)
    const x2 = CX + R * Math.cos(endAngle)
    const y2 = CY + R * Math.sin(endAngle)
    const large = angle > Math.PI ? 1 : 0
    const path = `M ${CX} ${CY} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${R} ${R} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`
    const pct  = Math.round((d.value / total) * 100)
    startAngle = endAngle
    return { path, color: d.color, label: d.label, pct }
  })
}

// Risk seviyesi renkleri (admin)
const RISK_COLORS = ['#22c55e', '#84cc16', '#f59e0b', '#ef4444', '#991b1b']
const RISK_LABELS = ['Çok Düşük', 'Düşük', 'Orta', 'Yüksek', 'Çok Yüksek']

// Soru tipi Türkçe etiketleri
const Q_TYPE_LABELS: Record<string, string> = {
  main_idea:  'Ana Fikir',
  inference:  'Çıkarım',
  detail:     'Ayrıntı',
  vocabulary: 'Kelime',
  tone:       'Ton',
}

export default async function AnalyticsPage() {
  await requireAdmin()

  const supabase = await createServerClient()
  const contentSvc  = createAdminContentService(supabase)
  const adaptiveSvc = createAdaptiveService(supabase)
  const examSvc     = createExamService(supabase)  // SPRINT 8

  const [
    contentResult,
    dropoffResult,
    readersResult,
    sessionStatsResult,
    examAccuracyResult,  // SPRINT 8
    riskDistResult,      // SPRINT 8
  ] = await Promise.all([
    contentSvc.getContentAnalytics(),
    adaptiveSvc.getAdminDropoffAnalytics(),
    adaptiveSvc.getReadersOverTime(),
    supabase
      .from('user_chapter_sessions')
      .select('xp_earned, completion_ratio')
      .throwOnError(),
    examSvc.getExamAccuracyByType(),   // SPRINT 8
    examSvc.getRiskDistribution(),     // SPRINT 8
  ])

  const rows:          ContentAnalytics[]  = contentResult.data ?? []
  const dropoffRows:   ChapterDropoff[]    = dropoffResult.data ?? []
  const readersRows:   ReadersOverTime[]   = readersResult.data ?? []
  const examAccRows:   ExamAccuracyByType[] = examAccuracyResult.data ?? []   // SPRINT 8
  const riskDistRows:  RiskDistribution[]  = riskDistResult.data ?? []       // SPRINT 8

  // Oturum özet istatistikleri
  const sessionRows = (sessionStatsResult.data ?? []) as Array<{ xp_earned: number; completion_ratio: number }>
  const totalSessions = sessionRows.length
  const avgCompletion = totalSessions > 0
    ? Math.round(sessionRows.reduce((s, r) => s + r.completion_ratio, 0) / totalSessions * 100)
    : 0
  const totalXp = sessionRows.reduce((s, r) => s + (r.xp_earned ?? 0), 0)

  // SVG grafik verisi
  const chartData  = buildChartData(readersRows)
  const maxReaders = Math.max(1, ...chartData.map(d => d.count))

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold text-white">Analytics</h1>

      {/* ── SPRINT 7: Özet Stat Kartları ─────────────────── */}
      <div>
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-3">
          Okuma Oturumları
        </p>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Toplam Seans',    value: totalSessions.toLocaleString('tr-TR'),        color: 'text-blue-400'   },
            { label: 'Ort. Tamamlama',  value: `%${avgCompletion}`,                           color: 'text-green-400'  },
            { label: 'Dağıtılan XP',    value: totalXp.toLocaleString('tr-TR'),               color: 'text-yellow-400' },
          ].map(card => (
            <div key={card.label} className="bg-slate-800 rounded-xl border border-slate-700 p-5">
              <p className="text-slate-400 text-xs mb-2">{card.label}</p>
              <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── SPRINT 7: Readers Over Time (SVG) ────────────── */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
        <h2 className="text-white font-semibold mb-4">Günlük Okuyucular (Son 30 Gün)</h2>
        {chartData.every(d => d.count === 0) ? (
          <p className="text-slate-500 text-sm text-center py-8">Henüz okuyucu yok</p>
        ) : (
          <div className="overflow-x-auto">
            <svg
              viewBox="0 0 600 200"
              preserveAspectRatio="none"
              className="w-full"
              style={{ height: 200 }}
            >
              {/* Y ekseni etiketleri */}
              <text x="0" y="12"  fontSize="9" fill="#64748b">{maxReaders}</text>
              <text x="0" y="96"  fontSize="9" fill="#64748b">{Math.round(maxReaders / 2)}</text>
              <text x="0" y="170" fontSize="9" fill="#64748b">0</text>

              {/* Barlar */}
              {chartData.map((d, i) => {
                const barW  = 14
                const gap   = 6
                const x     = 24 + i * (barW + gap)
                const barH  = maxReaders > 0 ? Math.round((d.count / maxReaders) * 160) : 0
                const y     = 170 - barH
                const showLabel = i % 7 === 0
                const labelDate = d.date.slice(5) // MM-DD
                return (
                  <g key={d.date}>
                    <rect
                      x={x} y={y}
                      width={barW} height={barH}
                      fill="#6366f1"
                      rx={2}
                    >
                      <title>{d.date}: {d.count} okuyucu</title>
                    </rect>
                    {showLabel && (
                      <text x={x + barW / 2} y="185" fontSize="8" fill="#64748b" textAnchor="middle">
                        {labelDate}
                      </text>
                    )}
                  </g>
                )
              })}
            </svg>
          </div>
        )}
      </div>

      {/* ── SPRINT 7: Drop-off Tablosu ───────────────────── */}
      <div className="bg-slate-800 rounded-xl border border-slate-700">
        <div className="p-5 border-b border-slate-700">
          <h2 className="text-white font-semibold">Bölüm Bırakma Analizi</h2>
          <p className="text-slate-500 text-xs mt-1">
            Kırmızı: %60+ bırakma · Sarı: %30–59 bırakma
          </p>
        </div>
        {dropoffRows.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">Henüz okuma verisi yok.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  {['Metin', 'Bölüm', 'Okuma', 'Bırakma %', 'Tamamlama %', 'Süre'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs text-slate-400 font-medium whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dropoffRows.map(row => (
                  <tr
                    key={row.chapter_id}
                    className={`border-b border-slate-700/50 ${dropoffRowClass(row.drop_off_pct)}`}
                  >
                    <td className="px-4 py-3 text-sm font-medium max-w-[180px] truncate">
                      {row.text_title}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300">
                      {row.chapter_number}. {row.chapter_title}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300">
                      {row.total_sessions}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold">
                      %{row.drop_off_pct ?? 0}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300">
                      %{row.avg_completion_pct ?? 0}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {row.avg_duration_min ?? 0} dk
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── SPRINT 8: Sınav Zeka Analizi ────────────────── */}
      <div>
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-3">
          Sınav Zekası
        </p>
        <div className="grid grid-cols-2 gap-4">

          {/* Soru Tipi Başarı Oranları */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            <h2 className="text-white font-semibold mb-4">Soru Tipi Başarı Oranları</h2>
            {examAccRows.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">Henüz soru yanıtı yok.</p>
            ) : (
              <div className="space-y-3">
                {examAccRows.map(row => (
                  <div key={row.question_type}>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300 text-xs">
                        {Q_TYPE_LABELS[row.question_type] ?? row.question_type}
                      </span>
                      <span className={`text-xs font-semibold ${
                        row.accuracy_pct < 50 ? 'text-red-400'
                        : row.accuracy_pct < 70 ? 'text-yellow-400'
                        : 'text-green-400'
                      }`}>
                        %{row.accuracy_pct} ({row.correct_count}/{row.total_questions})
                      </span>
                    </div>
                    <div className="bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          row.accuracy_pct < 50 ? 'bg-red-500'
                          : row.accuracy_pct < 70 ? 'bg-yellow-500'
                          : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(100, row.accuracy_pct)}%` }}
                      />
                    </div>
                    {row.avg_response_sec != null && (
                      <p className="text-slate-600 text-xs mt-0.5">
                        Ort. yanıt: {row.avg_response_sec}s
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Risk Dağılımı (SVG Pie) */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            <h2 className="text-white font-semibold mb-4">Risk Seviyesi Dağılımı</h2>
            {riskDistRows.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">Henüz profil yok.</p>
            ) : (() => {
              const pieData = riskDistRows.map(r => ({
                value: r.student_count,
                color: RISK_COLORS[(r.risk_level - 1)] ?? '#64748b',
                label: RISK_LABELS[(r.risk_level - 1)] ?? `Seviye ${r.risk_level}`,
              }))
              const slices = buildPieSlices(pieData)
              const total  = riskDistRows.reduce((s, r) => s + r.student_count, 0)
              return (
                <div className="flex items-center gap-6">
                  <svg viewBox="0 0 100 100" className="w-32 h-32 flex-shrink-0">
                    {slices.map((sl, i) => (
                      <path key={i} d={sl.path} fill={sl.color}>
                        <title>{sl.label}: {sl.pct}%</title>
                      </path>
                    ))}
                  </svg>
                  <div className="space-y-1.5">
                    {slices.map((sl, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: sl.color }} />
                        <span className="text-slate-300 text-xs">{sl.label}</span>
                        <span className="text-slate-500 text-xs ml-auto">
                          {riskDistRows[i]?.student_count ?? 0} ({sl.pct}%)
                        </span>
                      </div>
                    ))}
                    <p className="text-slate-600 text-xs pt-1">Toplam: {total} öğrenci</p>
                  </div>
                </div>
              )
            })()}
          </div>

        </div>
      </div>

      {/* ── Sprint 6: İçerik Analitik Tablosu (unchanged) ─ */}
      <div className="bg-slate-800 rounded-xl border border-slate-700">
        <div className="p-5 border-b border-slate-700">
          <h2 className="text-white font-semibold">İçerik Analitik</h2>
        </div>
        {rows.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-12">
            Henüz okuma verisi yok.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  {['Başlık', 'Sınav', 'Durum', 'Okuyucu', 'Tamamlanma %', 'Son Okuma'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs text-slate-400 font-medium whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr
                    key={row.text_id}
                    className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors"
                  >
                    <td className="px-5 py-3 text-white text-sm font-medium max-w-xs truncate">
                      {row.title}
                    </td>
                    <td className="px-5 py-3 text-slate-300 text-sm">{row.exam_type}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        row.status === 'published'
                          ? 'bg-green-900/50 text-green-400'
                          : row.status === 'archived'
                          ? 'bg-red-900/50 text-red-400'
                          : 'bg-slate-700 text-slate-400'
                      }`}>
                        {row.status === 'published' ? 'Yayında' : row.status === 'archived' ? 'Arşiv' : 'Taslak'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-300 text-sm">
                      {row.total_readers.toLocaleString('tr-TR')}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-700 rounded-full h-1.5 max-w-16">
                          <div
                            className="bg-indigo-500 h-1.5 rounded-full"
                            style={{ width: `${Math.min(100, row.avg_completion_pct ?? 0)}%` }}
                          />
                        </div>
                        <span className="text-slate-300 text-sm">
                          {row.avg_completion_pct != null ? `${row.avg_completion_pct}%` : '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-500 text-xs">
                      {row.last_read_at
                        ? new Date(row.last_read_at).toLocaleDateString('tr-TR')
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
