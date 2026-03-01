'use client'
// =====================================================
// ConfirmModal — Sprint 6
// Silme onay dialog'u
// =====================================================

interface Props {
  open:      boolean
  title:     string
  message:   string
  onConfirm: () => void
  onCancel:  () => void
}

export function ConfirmModal({ open, title, message, onConfirm, onCancel }: Props){
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4">
        <h2 id="confirm-title" className="text-white font-semibold text-lg mb-2">
          {title}
        </h2>
        <p className="text-slate-400 text-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors text-sm"
          >
            İptal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors text-sm font-medium"
          >
            Sil
          </button>
        </div>
      </div>
    </div>
  )
}
