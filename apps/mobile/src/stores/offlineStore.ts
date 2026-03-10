/**
 * offlineStore.ts — Offline Durum & Sync Yönetimi
 * Sprint 13: Çevrimdışı soru/oturum kuyruğu + bağlantı gelince otomatik sync
 */

import { create } from 'zustand'
import { supabase } from '../lib/supabase'

// Sync MMKV helper — mmkvStorage is async Zustand adapter, not suitable here
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _mmkv: any = null
function getMMKV() {
  if (_mmkv) return _mmkv
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { MMKV } = require('react-native-mmkv')
    _mmkv = new MMKV({ id: 'sprinta-offline' })
  } catch { _mmkv = null }
  return _mmkv
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _mem2: Record<string, string> = {}
const store = {
  get: (k: string): string | null => {
    const m = getMMKV(); if (m) { try { return m.getString(k) ?? null } catch { /**/ } }
    return _mem2[k] ?? null
  },
  set: (k: string, v: string): void => {
    const m = getMMKV(); if (m) { try { m.set(k, v); return } catch { /**/ } }
    _mem2[k] = v
  },
}

// ── Bekleyen sync kaydı ────────────────────────────────────────
export interface PendingSession {
  localId:    string
  type:       'reading_mode' | 'question_answer' | 'eye_exercise'
  payload:    Record<string, unknown>
  createdAt:  string
}

const PENDING_KEY = 'offline_pending_sessions'

function loadPending(): PendingSession[] {
  const raw = store.get(PENDING_KEY)
  if (!raw) return []
  try { return JSON.parse(raw) } catch { return [] }
}

function savePending(sessions: PendingSession[]): void {
  store.set(PENDING_KEY, JSON.stringify(sessions))
}

// ── Store ─────────────────────────────────────────────────────
interface OfflineState {
  isOnline:         boolean
  pendingSessions:  PendingSession[]
  isSyncing:        boolean
  lastSyncAt:       string | null
  downloadedPkgs:   number

  // Actions
  setOnline:          (v: boolean) => void
  queueSession:       (s: Omit<PendingSession, 'localId' | 'createdAt'>) => void
  syncPending:        (studentId: string) => Promise<{ synced: number; failed: number }>
  clearSynced:        (ids: string[]) => void
  refreshDownloadCount: () => void
}

export const useOfflineStore = create<OfflineState>((set, get) => ({
  isOnline:        true,
  pendingSessions: loadPending(),
  isSyncing:       false,
  lastSyncAt:      store.get('offline_last_sync') ?? null,
  downloadedPkgs:  0,

  setOnline: (v) => {
    set({ isOnline: v })
  },

  queueSession: (s) => {
    const session: PendingSession = {
      ...s,
      localId:   `local_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      createdAt: new Date().toISOString(),
    }
    const updated = [...get().pendingSessions, session]
    savePending(updated)
    set({ pendingSessions: updated })
  },

  syncPending: async (studentId) => {
    const { pendingSessions } = get()
    if (pendingSessions.length === 0) return { synced: 0, failed: 0 }

    set({ isSyncing: true })
    let synced = 0
    let failed = 0
    const successIds: string[] = []

    for (const session of pendingSessions) {
      try {
        if (session.type === 'reading_mode') {
          await (supabase as any).from('reading_mode_sessions').insert({
            student_id: studentId,
            ...session.payload,
          })
        } else if (session.type === 'question_answer') {
          await (supabase as any).from('user_question_sessions').insert({
            user_id: studentId,
            ...session.payload,
          })
        } else if (session.type === 'eye_exercise') {
          await (supabase as any).from('eye_exercise_sessions').insert({
            student_id: studentId,
            ...session.payload,
          })
        }
        successIds.push(session.localId)
        synced++
      } catch {
        failed++
      }
    }

    get().clearSynced(successIds)
    const now = new Date().toISOString()
    store.set('offline_last_sync', now)
    set({ isSyncing: false, lastSyncAt: now })

    return { synced, failed }
  },

  clearSynced: (ids) => {
    const remaining = get().pendingSessions.filter(s => !ids.includes(s.localId))
    savePending(remaining)
    set({ pendingSessions: remaining })
  },

  refreshDownloadCount: () => {
    const raw = store.get('offline_pkg_list')
    const list = raw ? (() => { try { return JSON.parse(raw) } catch { return [] } })() : []
    set({ downloadedPkgs: list.length })
  },
}))
