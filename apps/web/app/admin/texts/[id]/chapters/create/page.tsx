'use client'
// =====================================================
// app/admin/texts/[id]/chapters/create/page.tsx
// Sprint 6: Yeni bölüm oluştur
// =====================================================

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../../../../../lib/supabase/client'
import {
  createAdminContentService,
  createAiGenerationService,
  createLibraryService,
} from '@sprinta/api'
import type { CreateChapterInput, ExamType, AiGenerationResponse } from '@sprinta/api'
import { ErrorBanner }   from '../../../../../../components/admin/ErrorBanner'
import { useAdminGuard } from '../../../../../../hooks/useAdminGuard'

interface Props {
  params: Promise<{ id: string }>
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length
}

export default function CreateChapterPage({ params }: Props){
  const { id: textId } = use(params)
  const { isAdmin, loading: authLoading } = useAdminGuard()
  const router  = useRouter()
  const supabase = createClient()
  const adminSvc = createAdminContentService(supabase)
  const aiSvc    = createAiGenerationService(supabase)
  const libSvc   = createLibraryService(supabase)

  const [title,      setTitle]      = useState('')
  const [body,       setBody]       = useState('')
  const [status,     setStatus]     = useState<'draft' | 'published'>('draft')
  const [saving,     setSaving]     = useState(false)
  const [error,      setError]      = useState<string | null>(null)
  const [aiLoading,  setAiLoading]  = useState(false)
  const [aiResult,   setAiResult]   = useState<AiGenerationResponse | null>(null)
  const [aiError,    setAiError]    = useState<string | null>(null)

  const wordCount = countWords(body)

  async function handleAiGenerate(): Promise<void> {
    if (!body.trim()) { setAiError('Önce içerik giriniz.'); return }
    setAiLoading(true)
    setAiError(null)

    try {
      // textId'den examType al
      const { data: texts } = await adminSvc.getAllTextsAdmin()
      const text = texts?.find(t => t.id === textId)
      const examType: ExamType = (text?.exam_type as ExamType) ?? 'General'

      const { data, error: aiErr } = await aiSvc.generateAiMetadata({
        textId,
        body,
        examType,
      })
      if (aiErr) { setAiError(aiErr); return }
      setAiResult(data)
    } catch {
      setAiError('AI servisi kullanılamıyor.')
    } finally {
      setAiLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    if (!title.trim()) { setError('Başlık zorunludur.'); return }
    if (!body.trim())  { setError('İçerik zorunludur.'); return }

    setSaving(true)
    setError(null)

    try {
      // Bir sonraki chapter number bul
      const { data: existingChapters } = await libSvc.getChaptersByText(textId)
      const maxNum = (existingChapters ?? []).reduce((m, c) => Math.max(m, c.chapter_number), 0)
      const nextNum = maxNum + 1

      const input: CreateChapterInput = {
        text_id:        textId,
        chapter_number: nextNum,
        title:          title.trim(),
        body,
        status,
      }

      const { error: createErr } = await adminSvc.createChapter(input)
      if (createErr) { setError(createErr); return }

      router.push(`/admin/texts/${textId}/chapters`)
    } catch {
      setError('Bölüm oluşturulamadı.')
    } finally {
      setSaving(false)
    }
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
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-white mb-6">Yeni Bölüm</h1>

      <form onSubmit={e => void handleSubmit(e)} className="space-y-5">
        <ErrorBanner message={error} />

        {/* Başlık */}
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-1">
            Başlık <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
            placeholder="Bölüm başlığı"
          />
        </div>

        {/* İçerik */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-slate-300 text-sm font-medium">
              İçerik <span className="text-red-400">*</span>
            </label>
            <span className="text-slate-500 text-xs">{wordCount.toLocaleString('tr-TR')} kelime</span>
          </div>
          <textarea
            rows={16}
            value={body}
            onChange={e => setBody(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm leading-relaxed focus:outline-none focus:border-indigo-500 resize-y min-h-[300px]"
            placeholder="Bölüm içeriğini buraya yapıştırın..."
          />
        </div>

        {/* AI Metadata */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-300 text-sm font-medium">AI Metadata</p>
            <button
              type="button"
              onClick={() => void handleAiGenerate()}
              disabled={aiLoading}
              className="px-3 py-1.5 bg-purple-700 hover:bg-purple-600 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              {aiLoading
                ? <><span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />Üretiliyor...</>
                : '✨ AI Metadata Üret'}
            </button>
          </div>

          {aiError && <p className="text-red-400 text-xs mb-2">{aiError}</p>}

          {aiResult && (
            <div className="space-y-2 text-xs text-slate-400">
              <p><span className="text-slate-300 font-medium">Özet:</span> {aiResult.summary}</p>
              <p><span className="text-slate-300 font-medium">Zorluk:</span>{' '}
                {'●'.repeat(aiResult.difficulty)}{'○'.repeat(5 - aiResult.difficulty)}
              </p>
              <p><span className="text-slate-300 font-medium">Anahtar Kelimeler:</span>{' '}
                {aiResult.keywords.join(', ')}
              </p>
              <p><span className="text-slate-300 font-medium">Sınav Etiketleri:</span>{' '}
                {aiResult.examTags.join(', ')}
              </p>
            </div>
          )}

          {!aiResult && !aiLoading && (
            <p className="text-slate-600 text-xs">
              İçeriği girdikten sonra AI ile özet, zorluk ve anahtar kelime üretebilirsiniz.
            </p>
          )}
        </div>

        {/* Durum */}
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2">Durum</label>
          <div className="flex gap-4">
            {[
              { val: 'draft',     label: 'Taslak'  },
              { val: 'published', label: 'Yayınla' },
            ].map(opt => (
              <label key={opt.val} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value={opt.val}
                  checked={status === opt.val}
                  onChange={e => setStatus(e.target.value as 'draft' | 'published')}
                  className="accent-indigo-500"
                />
                <span className="text-slate-300 text-sm">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push(`/admin/texts/${textId}/chapters`)}
            className="px-5 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors text-sm"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium transition-colors"
          >
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </form>
    </div>
  )
}
