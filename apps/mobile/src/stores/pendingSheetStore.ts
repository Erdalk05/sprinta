import { create } from 'zustand'

type SheetType = 'okuma' | 'egzersiz' | 'akademi'

interface PendingSheetStore {
  pendingSheet: SheetType | null
  setPendingSheet: (sheet: SheetType | null) => void
}

export const usePendingSheetStore = create<PendingSheetStore>((set) => ({
  pendingSheet: null,
  setPendingSheet: (sheet) => set({ pendingSheet: sheet }),
}))
