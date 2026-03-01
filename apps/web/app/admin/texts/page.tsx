'use client'
// =====================================================
// app/admin/texts/page.tsx — Sprint 6
// İçerik listesi — client component (arama/filtre)
// Server data fetch via Client-side Supabase
// =====================================================

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '../../../lib/supabase/client'
import { createAdminContentService } from '@sprinta/api'
import type { TextItemExtended, ContentStatus } from '@sprinta/api'
import { StatusBadge }  from '../../../components/admin/StatusBadge'
import { ConfirmModal } from '../../../components/admin/ConfirmModal'
import { ErrorBanner }  from '../../../components/admin/ErrorBanner'
import { useAdminGuard } from '../../../hooks/useAdminGuard'

const FILTER_TABS: { label: string; value: ContentStatus | 'all' }[] = [
  { label: 'Tümü',    value: 'all'       },
  { label: 'Yayında', value: 'published' },
  { label: 'Taslak',  value: 'draft'     },
  { label: 'Arşiv',   value: 'archived'  },
]

export default function AdminTextsPage(){
  const { isAdmin, loading: authLoading } = useAdminGuard()
  const router = useRouter()

  const [texts,       setTexts]       = useState<TextItemExtended[]>([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState<string | null>(null)
  const [search,      setSearch]      = useState('')
  const [filter,      setFilter]      = useState<ContentStatus | 'all'>('all')
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const supabase = createClient()
  const svc      = createAdminContentService(supabase)

  const fetchTexts = useCallback(async () => {
    setLoading(true)
    const { data, error: e } = await svc.getAllTextsAdmin()
    setTexts(data ?? [])
    setError(e)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (isAdmin) void fetchTexts()
  }, [isAdmin, fetchTexts])

  const filtered = texts.filter(t => {
    const matchesFilter = filter === 'all' || t.status === filter
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  async function handlePublish(id: string): Promise<void> {
    const { error: e } = await svc.publishText(id)
    if (e) { setActionError(e); return }
    void fetchTexts()
  }

  async function handleArchive(id: string): Promise<void> {
    const { error: e } = await svc.archiveText(id)
    if (e) { setActionError(e); return }
    void fetchTexts()
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAdmin) return <></>

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">İçerikler</h1>
        <Link
          href="/admin/texts/create"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          + Yeni İçerik
        </Link>
      </div>

      <ErrorBanner message={actionError} />
      {error && <ErrorBanner message={error} />}

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          placeholder="Başlığa göre ara..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
        />
        <div className="flex gap-1 bg-slate-800 border border-slate-700 rounded-lg p-1">
          {FILTER_TABS.map(tab => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setFilter(tab.value)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                filter === tab.value
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-12">İçerik bulunamadı.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  {['Başlık', 'Sınav', 'Zorluk', 'Durum', 'İşlemler'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs text-slate-400 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(text => (
                  <tr key={text.id} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                    <td className="px-5 py-3 text-white text-sm font-medium max-w-xs truncate">
                      {text.title}
                    </td>
                    <td className="px-5 py-3 text-slate-300 text-sm">{text.exam_type}</td>
                    <td className="px-5 py-3">
                      <span className="text-slate-300 text-sm">
                        {'●'.repeat(text.difficulty)}{'○'.repeat(5 - text.difficulty)}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={text.status} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/texts/${text.id}`}
                          className="text-indigo-400 hover:text-indigo-300 text-xs transition-colors"
                        >
                          Düzenle
                        </Link>
                        <Link
                          href={`/admin/texts/${text.id}/chapters`}
                          className="text-slate-400 hover:text-white text-xs transition-colors"
                        >
                          Bölümler
                        </Link>
                        {text.status === 'draft' && (
                          <button
                            type="button"
                            onClick={() => void handlePublish(text.id)}
                            className="text-green-400 hover:text-green-300 text-xs transition-colors"
                          >
                            Yayınla
                          </button>
                        )}
                        {text.status === 'published' && (
                          <button
                            type="button"
                            onClick={() => void handleArchive(text.id)}
                            className="text-yellow-400 hover:text-yellow-300 text-xs transition-colors"
                          >
                            Arşivle
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        open={deleteTarget !== null}
        title="İçerik Silinecek"
        message="Bu işlem geri alınamaz. Devam etmek istiyor musunuz?"
        onConfirm={() => setDeleteTarget(null)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
