/**
 * downloadService.ts — Offline İçerik İndirme Servisi
 * Sprint 13: Metinleri ve soruları MMKV'ye indirir.
 * İnternet yoksa indirilen içerik kullanılır; bağlantı gelince sync edilir.
 */

import { supabase } from '../lib/supabase'

// MMKV direct instance (sync API) — mmkvStorage is async Zustand adapter
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _mmkv: any = null
function getMMKV() {
  if (_mmkv) return _mmkv
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { MMKV } = require('react-native-mmkv')
    _mmkv = new MMKV({ id: 'sprinta-download' })
  } catch { _mmkv = null }
  return _mmkv
}

// Sync helpers with AsyncStorage fallback via simple in-memory map when MMKV unavailable
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _mem: Record<string, string> = {}
const store = {
  get: (k: string): string | null => {
    const m = getMMKV()
    if (m) { try { return m.getString(k) ?? null } catch { /* */ } }
    return _mem[k] ?? null
  },
  set: (k: string, v: string): void => {
    const m = getMMKV()
    if (m) { try { m.set(k, v); return } catch { /* */ } }
    _mem[k] = v
  },
  del: (k: string): void => {
    const m = getMMKV()
    if (m) { try { m.delete(k) } catch { /* */ } }
    delete _mem[k]
  },
}

// ── Tip tanımları ─────────────────────────────────────────────
export interface OfflineText {
  id: string
  title: string
  body: string
  category: string
  exam_type: string
  word_count: number | null
}

export interface OfflineQuestion {
  id: string
  text_id: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: string
  explanation: string | null
}

export interface DownloadPackage {
  exam_type: string
  category: string | null   // null = tüm kategoriler
  texts: OfflineText[]
  questions: OfflineQuestion[]
  downloaded_at: string
}

// MMKV anahtar şeması
const PACKAGE_KEY    = (examType: string, cat: string) => `offline_pkg_${examType}_${cat}`
const PACKAGE_LIST_KEY = 'offline_pkg_list'

// ── Download Service ─────────────────────────────────────────
export const downloadService = {
  /**
   * Belirli bir sınav tipi + kategori paketini indirir.
   * onProgress: 0..1 arası ilerleme callback'i
   */
  async downloadPackage(
    examType: string,
    category: string | null,
    onProgress?: (p: number) => void,
  ): Promise<{ success: boolean; textCount: number; questionCount: number }> {
    onProgress?.(0.1)

    // 1. Metinleri çek
    let textQuery = (supabase as any)
      .from('text_library')
      .select('id, title, body, category, exam_type, word_count')
      .eq('exam_type', examType)
      .eq('status', 'published')
    if (category) textQuery = textQuery.eq('category', category)

    const { data: texts, error: textsError } = await textQuery.limit(50)
    if (textsError) return { success: false, textCount: 0, questionCount: 0 }

    onProgress?.(0.4)

    const textIds = (texts ?? []).map((t: any) => t.id)
    if (textIds.length === 0) {
      return { success: true, textCount: 0, questionCount: 0 }
    }

    // 2. Soruları çek
    const { data: questions } = await (supabase as any)
      .from('text_questions')
      .select('id, text_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation')
      .in('text_id', textIds)

    onProgress?.(0.7)

    // 3. MMKV'ye kaydet
    const pkg: DownloadPackage = {
      exam_type:     examType,
      category:      category,
      texts:         texts ?? [],
      questions:     questions ?? [],
      downloaded_at: new Date().toISOString(),
    }

    const key = PACKAGE_KEY(examType, category ?? 'all')
    store.set(key, JSON.stringify(pkg))

    // Liste güncelle
    const existing = downloadService.getPackageList()
    const updated  = existing.filter(k => k !== key)
    updated.push(key)
    store.set(PACKAGE_LIST_KEY, JSON.stringify(updated))

    onProgress?.(1.0)

    return {
      success:       true,
      textCount:     (texts ?? []).length,
      questionCount: (questions ?? []).length,
    }
  },

  /**
   * İndirilen paketi okur. Yoksa null döner.
   */
  getPackage(examType: string, category: string | null): DownloadPackage | null {
    const key = PACKAGE_KEY(examType, category ?? 'all')
    const raw = store.get(key)
    if (!raw) return null
    try {
      return JSON.parse(raw) as DownloadPackage
    } catch {
      return null
    }
  },

  /**
   * Tüm indirilen paket anahtarlarını döner.
   */
  getPackageList(): string[] {
    const raw = store.get(PACKAGE_LIST_KEY)
    if (!raw) return []
    try { return JSON.parse(raw) } catch { return [] }
  },

  /**
   * İndirilen paketlerin özet listesini döner.
   */
  getDownloadedPackages(): Array<{ key: string; examType: string; category: string | null; textCount: number; downloadedAt: string }> {
    return downloadService.getPackageList().map(key => {
      const raw = store.get(key)
      if (!raw) return null
      try {
        const pkg = JSON.parse(raw) as DownloadPackage
        return {
          key,
          examType:    pkg.exam_type,
          category:    pkg.category,
          textCount:   pkg.texts.length,
          downloadedAt: pkg.downloaded_at,
        }
      } catch { return null }
    }).filter(Boolean) as Array<{ key: string; examType: string; category: string | null; textCount: number; downloadedAt: string }>
  },

  /**
   * Paketi siler.
   */
  deletePackage(examType: string, category: string | null): void {
    const key = PACKAGE_KEY(examType, category ?? 'all')
    store.del(key)
    const existing = downloadService.getPackageList().filter(k => k !== key)
    store.set(PACKAGE_LIST_KEY, JSON.stringify(existing))
  },

  /**
   * Tüm indirilen paketleri siler.
   */
  deleteAll(): void {
    const keys = downloadService.getPackageList()
    keys.forEach(k => store.del(k))
    store.del(PACKAGE_LIST_KEY)
  },

  /**
   * Belirli bir sınav tipinde offline metin var mı?
   */
  hasOfflineContent(examType: string): boolean {
    return downloadService.getPackageList().some(k => k.includes(`offline_pkg_${examType}_`))
  },
}
