import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../src/stores/authStore'
import { supabase } from '../../src/lib/supabase'
import { usePendingContent } from '../../src/hooks/usePendingContent'
import ChunkRSVPExercise, { ChunkRSVPMetrics } from '../../src/components/exercises/SpeedControl/ChunkRSVPExercise'
import { createChunkRsvpService } from '@sprinta/api'
import ReadingModuleIntro from '../../src/components/exercise/ReadingModuleIntro'

const chunkSvc = createChunkRsvpService(supabase)

export default function ChunkRSVPScreen() {
  const router = useRouter()
  const { student } = useAuthStore()
  const { ready, initialContent } = usePendingContent()
  const [started, setStarted] = useState(false)

  if (!started) return <ReadingModuleIntro moduleKey="chunk-rsvp" onStart={() => setStarted(true)} onBack={() => router.back()} />
  if (!ready) return null

  return (
    <ChunkRSVPExercise
      onComplete={(metrics: ChunkRSVPMetrics) => {
        if (student?.id) chunkSvc.saveSession(metrics, student.id).catch(() => {})
      }}
      onExit={() => router.back()}
      initialContent={initialContent}
    />
  )
}
