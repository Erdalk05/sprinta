/**
 * Chunk RSVP Egzersizi Ekranı
 * pendingReadingStore'dan metin varsa initialContent olarak geçirir.
 */
import React from 'react'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../src/stores/authStore'
import { supabase } from '../../src/lib/supabase'
import { usePendingContent } from '../../src/hooks/usePendingContent'
import ChunkRSVPExercise, { ChunkRSVPMetrics } from '../../src/components/exercises/SpeedControl/ChunkRSVPExercise'
import { createChunkRsvpService } from '@sprinta/api'

const chunkSvc = createChunkRsvpService(supabase)

export default function ChunkRSVPScreen() {
  const router              = useRouter()
  const { student }         = useAuthStore()
  const { ready, initialContent } = usePendingContent()

  const handleComplete = async (metrics: ChunkRSVPMetrics) => {
    if (student?.id) {
      chunkSvc.saveSession(metrics, student.id).catch(() => {})
    }
  }

  if (!ready) return null

  return (
    <ChunkRSVPExercise
      onComplete={handleComplete}
      onExit={() => router.back()}
      initialContent={initialContent}
    />
  )
}
