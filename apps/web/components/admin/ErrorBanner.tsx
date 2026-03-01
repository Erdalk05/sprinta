'use client'
// =====================================================
// ErrorBanner — Sprint 6
// Form üstü kapatılabilir hata bandı
// =====================================================

import { useState, useEffect } from 'react'

interface Props {
  message: string | null
}

export function ErrorBanner({ message }: Props){
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(message !== null)
  }, [message])

  if (!visible || message === null) return null

  return (
    <div
      role="alert"
      className="flex items-start justify-between gap-3 bg-red-900/40 border border-red-700 rounded-lg px-4 py-3 mb-4"
    >
      <p className="text-red-300 text-sm flex-1">{message}</p>
      <button
        type="button"
        onClick={() => setVisible(false)}
        aria-label="Kapat"
        className="text-red-400 hover:text-red-200 transition-colors shrink-0 text-lg leading-none"
      >
        ×
      </button>
    </div>
  )
}
