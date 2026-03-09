'use client'
// =====================================================
// app/admin/questions/page.tsx
// Soru Yönetim Paneli — Sprint 1
// =====================================================

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '../../../lib/supabase/client'
import { useAdminGuard } from '../../../hooks/useAdminGuard'

type QuestionType = 'main_idea' | 'detail' | 'inference' | 'vocabulary' | 'tone'
type ExamType = 'LGS' | 'TYT' | 'AYT' | 'YDS' | 'YOKDIL' | 'ALES' | 'KPSS' | 'General'

interface Question {
  id: string
  text_id: string
  question_type: QuestionType
  question_text: string
  options: string[]
  correct_index: number
  explanation: string | null
  difficulty: number
  order_index: number
  text_title?: string
  text_exam_type?: string
  text_category?: string
}

const EXAM_TYPES: ExamType[] = ['LGS','TYT','AYT','YDS','YOKDIL','ALES','KPSS','General']
const Q_TYPES: QuestionType[] = ['main_idea','detail','inference','vocabulary','tone']
const Q_TYPE_LABELS: Record<QuestionType, string> = {
  main_idea: 'Ana Fikir',
  detail: 'Detay',
  inference: 'Çıkarım',
  vocabulary: 'Kelime',
  tone: 'Üslup',
}
const EXAM_COLORS: Record<string, string> = {
  LGS: 'bg-purple-900 text-purple-200',
  TYT: 'bg-blue-900 text-blue-200',
  AYT: 'bg-indigo-900 text-indigo-200',
  YDS: 'bg-green-900 text-green-200',
  YOKDIL: 'bg-teal-900 text-teal-200',
  ALES: 'bg-orange-900 text-orange-200',
  KPSS: 'bg-red-900 text-red-200',
  General: 'bg-slate-700 text-slate-200',
}

export default function AdminQuestionsPage() {
  const { isAdmin, loading: authLoading } = useAdminGuard()
  const supabase = createClient()

  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)
  const [total, setTotal]         = useState(0)

  // Filtreler
  const [examFilter, setExamFilter]   = useState<ExamType | 'all'>('all')
  const [typeFilter, setTypeFilter]   = useState<QuestionType | 'all'>('all')
  const [diffFilter, setDiffFilter]   = useState<number | 'all'>('all')
  const [searchText, setSearchText]   = useState('')
  const [page, setPage]               = useState(0)

  // Düzenleme modalı
  const [editItem, setEditItem]       = useState<Question | null>(null)
  const [deleteId, setDeleteId]       = useState<string | null>(null)
  const [saving, setSaving]           = useState(false)

  const PAGE_SIZE = 25

  const fetchQuestions = useCallback(async () => {
    if (!isAdmin) return
    setLoading(true)
    setError(null)

    let q = supabase
      .from('text_questions')
      .select(`
        id, text_id, question_type, question_text, options,
        correct_index, explanation, difficulty, order_index,
        text_library!inner(title, exam_type, category)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

    if (examFilter !== 'all') {
      q = q.eq('text_library.exam_type', examFilter)
    }
    if (typeFilter !== 'all') {
      q = q.eq('question_type', typeFilter)
    }
    if (diffFilter !== 'all') {
      q = q.eq('difficulty', diffFilter)
    }
    if (searchText.trim()) {
      q = q.ilike('question_text', `%${searchText}%`)
    }

    const { data, error: e, count } = await q
    if (e) { setError(e.message); setLoading(false); return }

    setQuestions((data ?? []).map((row: any) => ({
      ...row,
      text_title:     row.text_library?.title,
      text_exam_type: row.text_library?.exam_type,
      text_category:  row.text_library?.category,
    })))
    setTotal(count ?? 0)
    setLoading(false)
  }, [isAdmin, examFilter, typeFilter, diffFilter, searchText, page])

  useEffect(() => { void fetchQuestions() }, [fetchQuestions])

  const handleSave = async () => {
    if (!editItem) return
    setSaving(true)
    const { error: e } = await supabase
      .from('text_questions')
      .update({
        question_type: editItem.question_type,
        question_text: editItem.question_text,
        options:       editItem.options,
        correct_index: editItem.correct_index,
        explanation:   editItem.explanation,
        difficulty:    editItem.difficulty,
      })
      .eq('id', editItem.id)
    setSaving(false)
    if (e) { setError(e.message); return }
    setEditItem(null)
    void fetchQuestions()
  }

  const handleDelete = async (id: string) => {
    const { error: e } = await supabase.from('text_questions').delete().eq('id', id)
    if (e) { setError(e.message); return }
    setDeleteId(null)
    void fetchQuestions()
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  if (authLoading) return (
    <div className="flex items-center justify-center h-64 text-slate-400">Yükleniyor…</div>
  )

  return (
    <div className="p-6 max-w-7xl">
      {/* Başlık */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Soru Yönetimi</h1>
          <p className="text-slate-400 text-sm mt-1">{total} soru</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Filtreler */}
      <div className="flex flex-wrap gap-3 mb-5">
        {/* Arama */}
        <input
          type="text"
          placeholder="Soruda ara…"
          value={searchText}
          onChange={e => { setSearchText(e.target.value); setPage(0) }}
          className="bg-slate-800 text-white text-sm px-3 py-2 rounded-lg border border-slate-700 w-56 placeholder-slate-500"
        />

        {/* Sınav tipi */}
        <select
          value={examFilter}
          onChange={e => { setExamFilter(e.target.value as any); setPage(0) }}
          className="bg-slate-800 text-white text-sm px-3 py-2 rounded-lg border border-slate-700"
        >
          <option value="all">Tüm Sınavlar</option>
          {EXAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        {/* Soru tipi */}
        <select
          value={typeFilter}
          onChange={e => { setTypeFilter(e.target.value as any); setPage(0) }}
          className="bg-slate-800 text-white text-sm px-3 py-2 rounded-lg border border-slate-700"
        >
          <option value="all">Tüm Tipler</option>
          {Q_TYPES.map(t => <option key={t} value={t}>{Q_TYPE_LABELS[t]}</option>)}
        </select>

        {/* Zorluk */}
        <select
          value={diffFilter}
          onChange={e => { setDiffFilter(e.target.value === 'all' ? 'all' : Number(e.target.value)); setPage(0) }}
          className="bg-slate-800 text-white text-sm px-3 py-2 rounded-lg border border-slate-700"
        >
          <option value="all">Tüm Zorluklar</option>
          {[1,2,3,4,5].map(d => <option key={d} value={d}>Zorluk {d}</option>)}
        </select>
      </div>

      {/* Tablo */}
      {loading ? (
        <div className="text-slate-400 text-sm py-12 text-center">Sorular yükleniyor…</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-700">
          <table className="w-full text-sm">
            <thead className="bg-slate-800 text-slate-400 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Soru</th>
                <th className="px-4 py-3 text-left w-32">Metin</th>
                <th className="px-4 py-3 text-left w-20">Sınav</th>
                <th className="px-4 py-3 text-left w-24">Tip</th>
                <th className="px-4 py-3 text-center w-16">Zorluk</th>
                <th className="px-4 py-3 text-center w-16">Doğru</th>
                <th className="px-4 py-3 text-center w-20">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {questions.map(q => (
                <tr key={q.id} className="bg-slate-900 hover:bg-slate-800/60 transition-colors">
                  {/* Soru metni */}
                  <td className="px-4 py-3 text-slate-200 max-w-xs">
                    <p className="line-clamp-2">{q.question_text}</p>
                  </td>

                  {/* Metin başlığı */}
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    <p className="line-clamp-2">{q.text_title ?? '—'}</p>
                  </td>

                  {/* Sınav tipi */}
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${EXAM_COLORS[q.text_exam_type ?? 'General'] ?? 'bg-slate-700 text-slate-300'}`}>
                      {q.text_exam_type}
                    </span>
                  </td>

                  {/* Soru tipi */}
                  <td className="px-4 py-3 text-slate-300 text-xs">
                    {Q_TYPE_LABELS[q.question_type as QuestionType] ?? q.question_type}
                  </td>

                  {/* Zorluk */}
                  <td className="px-4 py-3 text-center">
                    <span className="text-yellow-400">{'★'.repeat(q.difficulty)}{'☆'.repeat(5 - q.difficulty)}</span>
                  </td>

                  {/* Doğru şık */}
                  <td className="px-4 py-3 text-center">
                    <span className="text-emerald-400 font-bold">
                      {['A','B','C','D','E'][q.correct_index] ?? '?'}
                    </span>
                  </td>

                  {/* İşlem butonları */}
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setEditItem(q)}
                        className="text-blue-400 hover:text-blue-300 transition-colors text-xs"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => setDeleteId(q.id)}
                        className="text-red-400 hover:text-red-300 transition-colors text-xs"
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {questions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                    Soru bulunamadı
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Sayfalama */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-slate-400 text-sm">
            {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} / {total} soru
          </p>
          <div className="flex gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-sm disabled:opacity-40 hover:bg-slate-700 transition-colors"
            >
              ← Önceki
            </button>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-sm disabled:opacity-40 hover:bg-slate-700 transition-colors"
            >
              Sonraki →
            </button>
          </div>
        </div>
      )}

      {/* Düzenleme Modalı */}
      {editItem && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-white font-semibold">Soruyu Düzenle</h2>
              <button onClick={() => setEditItem(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="p-5 space-y-4">
              {/* Metin bilgisi (salt okunur) */}
              <div className="bg-slate-900 rounded-lg p-3 text-sm text-slate-400">
                <span className="text-slate-500">Metin: </span>
                <span className="text-slate-300">{editItem.text_title}</span>
                {editItem.text_exam_type && (
                  <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${EXAM_COLORS[editItem.text_exam_type]}`}>
                    {editItem.text_exam_type}
                  </span>
                )}
              </div>

              {/* Soru metni */}
              <div>
                <label className="text-slate-400 text-sm block mb-1">Soru</label>
                <textarea
                  value={editItem.question_text}
                  onChange={e => setEditItem({ ...editItem, question_text: e.target.value })}
                  className="w-full bg-slate-900 text-white text-sm px-3 py-2 rounded-lg border border-slate-700 resize-none"
                  rows={3}
                />
              </div>

              {/* Şıklar */}
              <div>
                <label className="text-slate-400 text-sm block mb-2">Şıklar</label>
                {(editItem.options as string[]).map((opt, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2">
                    <span className={`w-6 h-6 flex items-center justify-center rounded text-xs font-bold shrink-0 ${
                      editItem.correct_index === i ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-400'
                    }`}>
                      {['A','B','C','D'][i]}
                    </span>
                    <input
                      value={opt}
                      onChange={e => {
                        const newOpts = [...editItem.options as string[]]
                        newOpts[i] = e.target.value
                        setEditItem({ ...editItem, options: newOpts })
                      }}
                      className="flex-1 bg-slate-900 text-white text-sm px-3 py-1.5 rounded-lg border border-slate-700"
                    />
                    <button
                      onClick={() => setEditItem({ ...editItem, correct_index: i })}
                      className={`text-xs px-2 py-1 rounded ${editItem.correct_index === i ? 'text-emerald-400' : 'text-slate-600 hover:text-slate-400'}`}
                    >
                      Doğru
                    </button>
                  </div>
                ))}
              </div>

              {/* Soru tipi + Zorluk */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-slate-400 text-sm block mb-1">Soru Tipi</label>
                  <select
                    value={editItem.question_type}
                    onChange={e => setEditItem({ ...editItem, question_type: e.target.value as QuestionType })}
                    className="w-full bg-slate-900 text-white text-sm px-3 py-2 rounded-lg border border-slate-700"
                  >
                    {Q_TYPES.map(t => <option key={t} value={t}>{Q_TYPE_LABELS[t]}</option>)}
                  </select>
                </div>
                <div className="w-32">
                  <label className="text-slate-400 text-sm block mb-1">Zorluk (1-5)</label>
                  <select
                    value={editItem.difficulty}
                    onChange={e => setEditItem({ ...editItem, difficulty: Number(e.target.value) })}
                    className="w-full bg-slate-900 text-white text-sm px-3 py-2 rounded-lg border border-slate-700"
                  >
                    {[1,2,3,4,5].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              {/* Açıklama */}
              <div>
                <label className="text-slate-400 text-sm block mb-1">Açıklama</label>
                <textarea
                  value={editItem.explanation ?? ''}
                  onChange={e => setEditItem({ ...editItem, explanation: e.target.value })}
                  className="w-full bg-slate-900 text-white text-sm px-3 py-2 rounded-lg border border-slate-700 resize-none"
                  rows={2}
                  placeholder="Doğru cevabın açıklaması…"
                />
              </div>
            </div>

            <div className="p-5 border-t border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setEditItem(null)}
                className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm hover:bg-slate-600 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-500 transition-colors disabled:opacity-50"
              >
                {saving ? 'Kaydediliyor…' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Silme Onay Modalı */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-sm p-6">
            <h3 className="text-white font-semibold mb-2">Soruyu Sil</h3>
            <p className="text-slate-400 text-sm mb-5">Bu soru kalıcı olarak silinecek. Emin misiniz?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm hover:bg-slate-600 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-500 transition-colors"
              >
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
