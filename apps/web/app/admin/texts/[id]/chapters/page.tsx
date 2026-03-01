// =====================================================
// app/admin/texts/[id]/chapters/page.tsx — Sprint 6
// Bölüm listesi — server component
// =====================================================

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireAdmin }       from '../../../../../lib/adminGuard'
import { createServerClient } from '../../../../../lib/supabase/server'
import { createAdminContentService, createLibraryService, createAdaptiveService } from '@sprinta/api'
import type { TextChapter, ChapterDropoff } from '@sprinta/api'
import { ChapterActions } from './ChapterActions'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ChaptersPage({ params }: Props){
  await requireAdmin()

  const { id }   = await params
  const supabase      = await createServerClient()
  const libSvc        = createLibraryService(supabase)
  const adminSvc      = createAdminContentService(supabase)
  const adaptiveSvc   = createAdaptiveService(supabase)

  // Metin bilgisi
  const { data: textList } = await adminSvc.getAllTextsAdmin()
  const text = textList?.find(t => t.id === id) ?? null
  if (!text) redirect('/admin/texts')

  // Bölümler + Sprint 7 drop-off istatistikleri
  const [chaptersResult, dropoffResult] = await Promise.all([
    libSvc.getChaptersByText(id),
    adaptiveSvc.getAdminDropoffAnalytics(id),
  ])
  const chapterList: TextChapter[]  = chaptersResult.data ?? []
  const dropoffRows: ChapterDropoff[] = dropoffResult.data ?? []

  // chapter_id → dropoff verisi haritası
  const dropoffByChapter = new Map<string, ChapterDropoff>(
    dropoffRows.map(r => [r.chapter_id, r]),
  )

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Link href="/admin/texts" className="text-slate-400 hover:text-white text-sm transition-colors">
          ← İçerikler
        </Link>
        <span className="text-slate-600">/</span>
        <span className="text-slate-300 text-sm truncate max-w-xs">{text.title}</span>
      </div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Bölümler</h1>
        <Link
          href={`/admin/texts/${id}/chapters/create`}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          + Yeni Bölüm
        </Link>
      </div>

      {/* Chapter List */}
      <div className="bg-slate-800 rounded-xl border border-slate-700">
        {chapterList.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-slate-500 text-sm">Henüz bölüm yok.</p>
            <Link
              href={`/admin/texts/${id}/chapters/create`}
              className="inline-block mt-3 text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
            >
              İlk bölümü ekle →
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-slate-700">
            {chapterList.map(ch => (
              <li key={ch.id} className="flex items-center justify-between px-5 py-4 hover:bg-slate-700/30 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-slate-500 text-sm w-6 text-center">{ch.chapter_number}</span>
                  <div>
                    <p className="text-white text-sm font-medium">{ch.title}</p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {ch.word_count != null ? `${ch.word_count.toLocaleString('tr-TR')} kelime` : '—'}
                    </p>
                    {/* SPRINT 7 ADD — per-chapter okuma istatistikleri */}
                    {(() => {
                      const stat = dropoffByChapter.get(ch.id)
                      if (!stat) return (
                        <p className="text-slate-600 text-xs mt-1">Henüz okuma yok</p>
                      )
                      return (
                        <p className="text-slate-500 text-xs mt-1">
                          {stat.total_sessions} okuma
                          {' · '}%{stat.avg_completion_pct ?? 0} tamamlama
                          {' · '}%{stat.drop_off_pct ?? 0} bırakma
                        </p>
                      )
                    })()}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    (ch as TextChapter & { status?: string }).status === 'published'
                      ? 'bg-green-900/50 text-green-400'
                      : 'bg-slate-700 text-slate-400'
                  }`}>
                    {(ch as TextChapter & { status?: string }).status === 'published' ? 'Yayında' : 'Taslak'}
                  </span>
                  <Link
                    href={`/admin/texts/${id}/chapters/${ch.id}/edit`}
                    className="text-indigo-400 hover:text-indigo-300 text-xs transition-colors"
                  >
                    Düzenle
                  </Link>
                  <ChapterActions chapterId={ch.id} textId={id} chapterStatus={(ch as TextChapter & { status?: string }).status ?? 'draft'} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-slate-600 text-xs mt-4">
        * Sıra değiştirme: Sürükle-bırak sonraki sprintte eklenecek.
      </p>
    </div>
  )
}
