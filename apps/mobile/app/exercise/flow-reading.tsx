import React from 'react'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../src/stores/authStore'
import { supabase } from '../../src/lib/supabase'
import { usePendingContent } from '../../src/hooks/usePendingContent'
import FlowReadingExercise, { FlowReadingMetrics } from '../../src/components/exercises/SpeedControl/FlowReadingExercise'
import { createFlowReadingService } from '@sprinta/api'

const flowSvc = createFlowReadingService(supabase)

export default function FlowReadingScreen() {
  const router = useRouter()
  const { student } = useAuthStore()
  const { ready, initialContent } = usePendingContent()

  if (!ready) return null

  return (
    <FlowReadingExercise
      onComplete={(metrics: FlowReadingMetrics) => {
        if (student?.id) flowSvc.saveSession(metrics, student.id).catch(() => {})
      }}
      onExit={() => router.back()}
      initialContent={initialContent}
    />
  )
}
