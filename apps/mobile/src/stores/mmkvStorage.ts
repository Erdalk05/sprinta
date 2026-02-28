// MMKV Zustand persist adapter — AsyncStorage'dan ~10x hızlı
// Paket kurulu değilse AsyncStorage'a fallback yapar.
// themeStore ve authStore AsyncStorage'da kalır.

import AsyncStorage from '@react-native-async-storage/async-storage'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let MMKVClass: any = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mmkvInstance: any = null

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  MMKVClass = require('react-native-mmkv').MMKV
} catch {
  // MMKV kurulu değil — AsyncStorage fallback
}

function getMMKV() {
  if (!MMKVClass) return null
  if (!mmkvInstance) {
    mmkvInstance = new MMKVClass({ id: 'sprinta-store' })
  }
  return mmkvInstance
}

export const mmkvStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const mmkv = getMMKV()
    if (mmkv) {
      try { return mmkv.getString(name) ?? null } catch { /* fallthrough */ }
    }
    return AsyncStorage.getItem(name)
  },
  setItem: async (name: string, value: string): Promise<void> => {
    const mmkv = getMMKV()
    if (mmkv) {
      try { mmkv.set(name, value); return } catch { /* fallthrough */ }
    }
    return AsyncStorage.setItem(name, value)
  },
  removeItem: async (name: string): Promise<void> => {
    const mmkv = getMMKV()
    if (mmkv) {
      try { mmkv.delete(name); return } catch { /* fallthrough */ }
    }
    return AsyncStorage.removeItem(name)
  },
}
