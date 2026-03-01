/**
 * Dikkat Filtresi Egzersizi Ekranı
 * pendingReadingStore'dan metin varsa initialContent olarak geçirir.
 */
import React, { useCallback } from 'react'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../src/stores/authStore'
import { supabase } from '../../src/lib/supabase'
import { usePendingContent } from '../../src/hooks/usePendingContent'
import ReadingModesExercise, {
  ReadingModesMetrics,
} from '../../src/components/exercises/ReadingModes/ReadingModesExercise'

export default function FocusFilterScreen() {
  const router                        = useRouter()
  const { student }                   = useAuthStore()
  const { ready, initialContent }     = usePendingContent()

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

  if (!ready) return null

  return (
    <ReadingModesExercise
      mode="focus_filter"
      onComplete={handleComplete}
      onExit={() => router.back()}
      initialContent={initialContent}
    />
  )
}
