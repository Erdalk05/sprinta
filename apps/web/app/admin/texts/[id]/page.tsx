// =====================================================
// app/admin/texts/[id]/page.tsx — Sprint 6
// İçerik düzenleme — server shell
// =====================================================

import { requireAdmin }       from '../../../../lib/adminGuard'
import { createServerClient } from '../../../../lib/supabase/server'
import { createAdminContentService } from '@sprinta/api'
import { redirect }           from 'next/navigation'
import { EditTextForm }       from './EditTextForm'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditTextPage({ params }: Props){
  await requireAdmin()

  const { id }  = await params
  const supabase = await createServerClient()
  const svc      = createAdminContentService(supabase)

  const { data: text, error } = await svc.getAllTextsAdmin()
  const textItem = text?.find(t => t.id === id) ?? null

  if (error || !textItem) redirect('/admin/texts')

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-6">İçerik Düzenle</h1>
      <EditTextForm text={textItem} />
    </div>
  )
}
