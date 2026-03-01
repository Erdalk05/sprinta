'use client'
// =====================================================
// EditTextForm.tsx — Sprint 6
// İçerik düzenleme formu (client component)
// =====================================================

import { useState, useRef, type ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../../../lib/supabase/client'
import { createAdminContentService } from '@sprinta/api'
import type { TextItemExtended, UpdateTextInput, ContentStatus, ExamType } from '@sprinta/api'
import { DifficultySelector } from '../../../../components/admin/DifficultySelector'
import { ErrorBanner }        from '../../../../components/admin/ErrorBanner'

const EXAM_OPTIONS: ExamType[] = ['LGS', 'TYT', 'ALES', 'KPSS', 'General']
const CATEGORY_OPTIONS = [
  'Fen Bilimleri', 'Sosyal Bilgiler', 'Türkçe-Edebiyat',
  'Tarih', 'Coğrafya', 'Felsefe', 'Matematik-Mantık',
  'Teknoloji', 'Güncel Olaylar', 'Sağlık', 'Çevre', 'Kültür-Sanat',
]

interface Props {
  text: TextItemExtended
}

export function EditTextForm({ text }: Props){
  const router  = useRouter()
  const supabase = createClient()
  const svc      = createAdminContentService(supabase)
  const fileRef  = useRef<HTMLInputElement>(null)

  const [title,    setTitle]    = useState(text.title)
  const [desc,     setDesc]     = useState(text.description ?? '')
  const [category, setCategory] = useState(text.category)
  const [examType, setExamType] = useState<ExamType>(text.exam_type as ExamType)
  const [diff,     setDiff]     = useState(text.difficulty)
  const [readTime, setReadTime] = useState(String(text.estimated_read_time))
  const [tags,     setTags]     = useState((text.tags ?? []).join(', '))
  const [status,   setStatus]   = useState<ContentStatus>(text.status)
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(text.cover_url ?? null)
  const [coverFile, setCoverFile] = useState<File | null>(null)

  function handleCoverChange(e: ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  function validate(): string | null {
    if (title.trim().length < 3) return 'Başlık en az 3 karakter olmalıdır.'
    if (!category)               return 'Kategori seçiniz.'
    const time = parseInt(readTime, 10)
    if (isNaN(time) || time < 1) return 'Tahmini süre pozitif bir tam sayı olmalıdır.'
    return null
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    const validErr = validate()
    if (validErr) { setError(validErr); return }

    setSaving(true)
    setError(null)

    try {
      const input: UpdateTextInput = {
        id:                  text.id,
        title:               title.trim(),
        description:         desc.trim(),
        category,
        exam_type:           examType,
        difficulty:          diff as 1 | 2 | 3 | 4 | 5,
        estimated_read_time: parseInt(readTime, 10),
        tags:                tags.split(',').map(t => t.trim()).filter(Boolean),
        status,
      }

      const { error: updateErr } = await svc.updateText(input)
      if (updateErr) { setError(updateErr); return }

      if (coverFile) {
        const { error: uploadErr } = await svc.uploadCover(coverFile, text.id)
        if (uploadErr) console.warn('Cover yüklenemedi:', uploadErr)
      }

      router.push('/admin/texts')
    } catch (e) {
      setError('Beklenmedik hata oluştu.')
      console.warn(e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={e => void handleSubmit(e)} className="space-y-5">
      <ErrorBanner message={error} />

      <div>
        <label className="block text-slate-300 text-sm font-medium mb-1">
          Başlık <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div>
        <label className="block text-slate-300 text-sm font-medium mb-1">Açıklama</label>
        <textarea
          rows={3}
          value={desc}
          onChange={e => setDesc(e.target.value)}
          className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-1">
            Kategori <span className="text-red-400">*</span>
          </label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
          >
            {CATEGORY_OPTIONS.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-1">Sınav Türü</label>
          <select
            value={examType}
            onChange={e => setExamType(e.target.value as ExamType)}
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
          >
            {EXAM_OPTIONS.map(o => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2">Zorluk</label>
          <DifficultySelector value={diff} onChange={v => setDiff(v as 1 | 2 | 3 | 4 | 5)} />
        </div>
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-1">
            Tahmini Süre (dk)
          </label>
          <input
            type="number"
            min={1}
            value={readTime}
            onChange={e => setReadTime(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-slate-300 text-sm font-medium mb-1">Etiketler</label>
        <input
          type="text"
          value={tags}
          onChange={e => setTags(e.target.value)}
          className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
          placeholder="etiket1, etiket2"
        />
      </div>

      <div>
        <label className="block text-slate-300 text-sm font-medium mb-1">Kapak Görseli</label>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleCoverChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-slate-300 text-sm transition-colors"
        >
          Görsel Değiştir
        </button>
        {coverPreview && (
          <img
            src={coverPreview}
            alt="Kapak önizleme"
            className="mt-3 h-24 w-auto rounded-lg object-cover border border-slate-600"
          />
        )}
      </div>

      <div>
        <label className="block text-slate-300 text-sm font-medium mb-2">Durum</label>
        <div className="flex gap-4">
          {[
            { val: 'draft',     label: 'Taslak' },
            { val: 'published', label: 'Yayında' },
            { val: 'archived',  label: 'Arşiv' },
          ].map(opt => (
            <label key={opt.val} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                value={opt.val}
                checked={status === opt.val}
                onChange={e => setStatus(e.target.value as ContentStatus)}
                className="accent-indigo-500"
              />
              <span className="text-slate-300 text-sm">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push('/admin/texts')}
          className="px-5 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors text-sm"
        >
          İptal
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium transition-colors"
        >
          {saving ? 'Kaydediliyor...' : 'Güncelle'}
        </button>
      </div>
    </form>
  )
}
