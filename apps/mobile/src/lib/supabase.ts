// =====================================================
// Paylaşımlı Supabase istemcisi — TEK ÖRNEK
//
// MMKV ile session kalıcılığı — AsyncStorage'dan ~10x hızlı.
// Login → session MMKV'ye yazılır → diğer istemciler okur.
// =====================================================

import { createClient } from '@supabase/supabase-js'
import { mmkvStorage } from '../stores/mmkvStorage'

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage:          mmkvStorage,
      autoRefreshToken: true,
      persistSession:   true,
      detectSessionInUrl: false,
    },
  },
)
