'use client'
// =====================================================
// ChapterActions — Sprint 6
// Bölüm silme aksiyonu (client island)
// =====================================================

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../../../../lib/supabase/client'
import { createAdminContentService } from '@sprinta/api'
import { ConfirmModal } from '../../../../../components/admin/ConfirmModal'

interface Props {
  chapterId:     string
  textId:        string
  chapterStatus: string
}

export function ChapterActions({ chapterId, textId, chapterStatus }: Props){
  const [open,    setOpen]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [errMsg,  setErrMsg]  = useState<string | null>(null)
  const router  = useRouter()
  const supabase = createClient()
  const svc      = createAdminContentService(supabase)

  async function handleDelete(): Promise<void> {
    setOpen(false)
    setLoading(true)
    const { error } = await svc.deleteChapter(chapterId)
    setLoading(false)
    if (error) { setErrMsg(error); return }
    router.refresh()
  }

  if (chapterStatus === 'published') {
    return <span className="text-slate-600 text-xs">Yayındaki bölüm silinemez</span>
  }

  return (
    <>
      {errMsg && <span className="text-red-400 text-xs">{errMsg}</span>}
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={loading}
        className="text-red-400 hover:text-red-300 text-xs transition-colors disabled:opacity-50"
      >
        {loading ? '...' : 'Sil'}
      </button>
      <ConfirmModal
        open={open}
        title="Bölüm Silinecek"
        message="Bu bölüm kalıcı olarak silinecek. Emin misiniz?"
        onConfirm={() => void handleDelete()}
        onCancel={() => setOpen(false)}
      />
    </>
  )
}
