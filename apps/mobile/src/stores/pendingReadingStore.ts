/**
 * pendingReadingStore
 * Kütüphane'den metin → okuma modu seçimi köprüsü.
 *
 * Akış:
 *   1. Kullanıcı kütüphanede metne tıklar
 *   2. ReadingModePickerSheet açılır, set() ile metin bilgisi saklanır
 *   3. Mod seçilir → egzersiz route'una navigate edilir
 *   4. Egzersiz route'u mount'ta pending'i okur, body'yi fetch eder,
 *      ImportedContent olarak bileşene geçirir → clear() çağırır
 */
import { create } from 'zustand'

export interface PendingReadingItem {
  textId:    string
  title:     string
  examType:  string
  category:  string
  wordCount: number
}

interface PendingReadingStore {
  pending: PendingReadingItem | null
  set:     (item: PendingReadingItem) => void
  clear:   () => void
}

export const usePendingReadingStore = create<PendingReadingStore>(set => ({
  pending: null,
  set:     (item) => set({ pending: item }),
  clear:   ()     => set({ pending: null }),
}))
