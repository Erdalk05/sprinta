/**
 * Sessiz Okuma — subvocal mod
 * ReadingModesExercise wrapper + Supabase session kayıt
 */
import React, { useCallback } from 'react'
import { useRouter } from 'expo-router'
import { supabase } from '../../src/lib/supabase'
import { useAuthStore } from '../../src/stores/authStore'
import ReadingModesExercise, {
  ReadingModesMetrics,
} from '../../src/components/exercises/ReadingModes/ReadingModesExercise'


export default function SubvocalFreeScreen() {
  const router      = useRouter()
  const { student } = useAuthStore()

  const handleComplete = useCallback(async (m: ReadingModesMetrics) => {
    if (student?.id) {
      try {
        await (supabase as any).from('reading_mode_sessions').insert({
          student_id: student.id, mode: m.mode, avg_wpm: m.avgWPM,
          total_words: m.totalWords, duration_seconds: m.durationSeconds,
          arp_score: m.arpScore, xp_earned: m.xpEarned,
          completion_ratio: m.completionRatio,
        })
      } catch { /* sessiz */ }
    }
    router.back()
  }, [student, router])

  return (
    <ReadingModesExercise
      mode="subvocal"
      onComplete={handleComplete}
      onExit={() => router.back()}
    />
  )
}
