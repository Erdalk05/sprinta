/**
 * Chunk RSVP Egzersizi Ekranı
 * ChunkRSVPExercise bileşenini tam ekran olarak sarar.
 * onComplete → Supabase'e kaydet → sonuç göster
 * onExit     → geri git
 */
import React from 'react'
import { useRouter } from 'expo-router'
import { createClient } from '@supabase/supabase-js'
import { useAuthStore } from '../../src/stores/authStore'
import ChunkRSVPExercise, { ChunkRSVPMetrics } from '../../src/components/exercises/SpeedControl/ChunkRSVPExercise'
import { createChunkRsvpService } from '@sprinta/api'

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
)

const chunkSvc = createChunkRsvpService(supabase)

export default function ChunkRSVPScreen() {
  const router = useRouter()
  const { student } = useAuthStore()

  const handleComplete = async (metrics: ChunkRSVPMetrics) => {
    if (student?.id) {
      // Sessiz kaydet — hata olsa ekran yine devam eder
      chunkSvc.saveSession(metrics, student.id).catch(() => {})
    }
    // Egzersiz kendi sonuç ekranını gösteriyor — burada ek yönlendirme yok
  }

  const handleExit = () => {
    router.back()
  }

  return (
    <ChunkRSVPExercise
      onComplete={handleComplete}
      onExit={handleExit}
    />
  )
}
