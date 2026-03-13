import { create } from 'zustand'
import type { ImportedContent } from '../components/exercises/shared/ContentImportModal'

interface QuickContentStore {
  content: ImportedContent | null
  setContent: (c: ImportedContent) => void
  clear:      () => void
}

export const useQuickContentStore = create<QuickContentStore>((set) => ({
  content:    null,
  setContent: (c) => set({ content: c }),
  clear:      () => set({ content: null }),
}))
