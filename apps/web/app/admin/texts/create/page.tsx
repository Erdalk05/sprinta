'use client'
// =====================================================
// app/admin/texts/create/page.tsx — Sprint 6
// Yeni içerik oluştur formu
// =====================================================

import { useState, useRef, type ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../../../lib/supabase/client'
import { createAdminContentService } from '@sprinta/api'
import type { CreateTextInput, ContentStatus, ExamType } from '@sprinta/api'
import { DifficultySelector } from '../../../../components/admin/DifficultySelector'
import { ErrorBanner }        from '../../../../components/admin/ErrorBanner'
import { useAdminGuard }      from '../../../../hooks/useAdminGuard'

const EXAM_OPTIONS: ExamType[] = ['LGS', 'TYT', 'ALES', 'KPSS', 'General']

const CATEGORY_OPTIONS = [
  'Fen Bilimleri', 'Sosyal Bilgiler', 'Türkçe-Edebiyat',
  'Tarih', 'Coğrafya', 'Felsefe', 'Matematik-Mantık',
  'Teknoloji', 'Güncel Olaylar', 'Sağlık', 'Çevre', 'Kültür-Sanat',
]

interface FormState {
  title:               string
  description:         string
  category:            string
  exam_type:           ExamType
  difficulty:          number
  estimated_read_time: string
  tags:                string
  status:              ContentStatus
}

const INIT: FormState = {
  title:               '',
  description:         '',
  category:            '',
  exam_type:           'TYT',
  difficulty:          3,
  estimated_read_time: '',
  tags:                '',
  status:              'draft',
}

export default function CreateTextPage(){
  const { isAdmin, loading: authLoading } = useAdminGuard()
  const router = useRouter()
  const supabase = createClient()
  const svc      = createAdminContentService(supabase)

  const [form,        setForm]        = useState<FormState>(INIT)
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState<string | null>(null)
  const [coverFile,   setCoverFile]   = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function update(field: keyof FormState, value: string | number): void {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleCoverChange(e: ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  function validate(): string | null {
    if (form.title.trim().length < 3) return 'Başlık en az 3 karakter olmalıdır.'
    if (!form.category)               return 'Kategori seçiniz.'
    if (!form.exam_type)              return 'Sınav türü seçiniz.'
    if (!form.difficulty)             return 'Zorluk seviyesi seçiniz.'
    const time = parseInt(form.estimated_read_time, 10)
    if (isNaN(time) || time < 1)      return 'Tahmini süre pozitif bir tam sayı olmalıdır.'
    return null
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    const validErr = validate()
    if (validErr) { setError(validErr); return }

    setSaving(true)
    setError(null)

    try {
      const input: CreateTextInput = {
        title:               form.title.trim(),
        description:         form.description.trim(),
        category:            form.category,
        exam_type:           form.exam_type,
        difficulty:          form.difficulty as 1 | 2 | 3 | 4 | 5,
        estimated_read_time: parseInt(form.estimated_read_time, 10),
        tags:                form.tags.split(',').map(t => t.trim()).filter(Boolean),
        status:              form.status,
      }

      const { data, error: createErr } = await svc.createText(input)
      if (createErr || !data) {
        setError(createErr ?? 'İçerik oluşturulamadı.')
        return
      }

      // Cover yükleme (opsiyonel)
      if (coverFile) {
        const { error: uploadErr } = await svc.uploadCover(coverFile, data.id)
        if (uploadErr) console.warn('Cover yüklenemedi:', uploadErr)
      }

      router.push(`/admin/texts/${data.id}/chapters`)
    } catch (e) {
      setError('Beklenmedik hata oluştu.')
      console.warn(e)
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
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-6">Yeni İçerik</h1>

      <form onSubmit={e => void handleSubmit(e)} className="space-y-5">
        <ErrorBanner message={error} />

        {/* Başlık */}
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-1">
            Başlık <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={form.title}
            onChange={e => update('title', e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
            placeholder="İçerik başlığı"
          />
        </div>

        {/* Açıklama */}
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-1">Açıklama</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={e => update('description', e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 resize-none"
            placeholder="Kısa açıklama (opsiyonel)"
          />
        </div>

        {/* Kategori + Sınav Türü */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1">
              Kategori <span className="text-red-400">*</span>
            </label>
            <select
              value={form.category}
              onChange={e => update('category', e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="">Seçiniz</option>
              {CATEGORY_OPTIONS.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1">
              Sınav Türü <span className="text-red-400">*</span>
            </label>
            <select
              value={form.exam_type}
              onChange={e => update('exam_type', e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
            >
              {EXAM_OPTIONS.map(o => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Zorluk + Tahmini Süre */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Zorluk <span className="text-red-400">*</span>
            </label>
            <DifficultySelector
              value={form.difficulty}
              onChange={v => update('difficulty', v)}
            />
          </div>
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1">
              Tahmini Süre (dk) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              min={1}
              value={form.estimated_read_time}
              onChange={e => update('estimated_read_time', e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
              placeholder="10"
            />
          </div>
        </div>

        {/* Etiketler */}
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-1">Etiketler</label>
          <input
            type="text"
            value={form.tags}
            onChange={e => update('tags', e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
            placeholder="etiket1, etiket2, etiket3"
          />
          <p className="text-slate-500 text-xs mt-1">Virgülle ayırın</p>
        </div>

        {/* Kapak Görseli */}
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
            Görsel Seç
          </button>
          {coverPreview && (
            <img
              src={coverPreview}
              alt="Kapak önizleme"
              className="mt-3 h-24 w-auto rounded-lg object-cover border border-slate-600"
            />
          )}
        </div>

        {/* Durum */}
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2">Durum</label>
          <div className="flex gap-4">
            {[
              { val: 'draft',     label: 'Taslak olarak kaydet' },
              { val: 'published', label: 'Yayınla'              },
            ].map(opt => (
              <label key={opt.val} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value={opt.val}
                  checked={form.status === opt.val}
                  onChange={e => update('status', e.target.value)}
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
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </form>
    </div>
  )
}
