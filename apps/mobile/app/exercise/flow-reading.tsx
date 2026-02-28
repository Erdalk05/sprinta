/**
 * Akış Okuma Egzersizi Ekranı
 * FlowReadingExercise bileşenini tam ekran olarak sarar.
 * onComplete → Supabase'e kaydet
 * onExit     → geri git
 */
import React from 'react'
import { useRouter } from 'expo-router'
import { createClient } from '@supabase/supabase-js'
import { useAuthStore } from '../../src/stores/authStore'
import FlowReadingExercise, { FlowReadingMetrics } from '../../src/components/exercises/SpeedControl/FlowReadingExercise'
import { createFlowReadingService } from '@sprinta/api'

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
)

const flowSvc = createFlowReadingService(supabase)

export default function FlowReadingScreen() {
  const router = useRouter()
  const { student } = useAuthStore()

  const handleComplete = async (metrics: FlowReadingMetrics) => {
    if (student?.id) {
      // Sessiz kaydet — hata olsa egzersiz devam eder
      flowSvc.saveSession(metrics, student.id).catch(() => {})
    }
  }

  const handleExit = () => {
    router.back()
  }

  return (
    <FlowReadingExercise
      onComplete={handleComplete}
      onExit={handleExit}
    />
  )
}
