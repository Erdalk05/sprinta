'use client'
// =====================================================
// StatusBadge — Sprint 6
// İçerik durumu pill bileşeni
// =====================================================

import type { ContentStatus } from '@sprinta/api'

interface Props {
  status: ContentStatus
}

const STYLES: Record<ContentStatus, string> = {
  published: 'bg-green-100 text-green-800',
  draft:     'bg-gray-100 text-gray-600',
  archived:  'bg-red-100 text-red-600',
}

const LABELS: Record<ContentStatus, string> = {
  published: 'Yayında',
  draft:     'Taslak',
  archived:  'Arşiv',
}

export function StatusBadge({ status }: Props){
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  )
}
