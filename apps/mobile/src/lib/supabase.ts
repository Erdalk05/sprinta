// =====================================================
// Paylaşımlı Supabase istemcisi — TEK ÖRNEK
//
// AsyncStorage ile session kalıcılığı sayesinde tüm
// bileşenler aynı oturumu paylaşır. Login → session
// AsyncStorage'a yazılır → diğer istemciler okur.
// =====================================================

import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage:          AsyncStorage,
      autoRefreshToken: true,
      persistSession:   true,
      detectSessionInUrl: false,
    },
  },
)
