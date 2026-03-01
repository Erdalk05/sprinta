/**
 * Çok Kelime RSVP Egzersizi
 * 2-4 kelime aynı anda göster — göz alanını genişlet
 */
import React from 'react'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../src/stores/authStore'
import { supabase } from '../../src/lib/supabase'
import { usePendingContent } from '../../src/hooks/usePendingContent'
import ReadingModesExercise, { ReadingModesMetrics } from '../../src/components/exercises/ReadingModes/ReadingModesExercise'

export default function WordBurstScreen() {
  const router   = useRouter()
  const { student } = useAuthStore()
  const { ready, initialContent } = usePendingContent()

  const handleComplete = async (metrics: ReadingModesMetrics) => {
    if (!student?.id) return
    try {
      await (supabase as any).from('reading_mode_sessions').insert({
        student_id:   student.id,
        mode:         'word_burst',
        avg_wpm:      metrics.avgWPM,
        total_words:  metrics.totalWords,
        duration_sec: metrics.durationSeconds,
        arp_score:    metrics.arpScore,
        xp_earned:    metrics.xpEarned,
        completion:   metrics.completionRatio,
      })
    } catch { /* sessiz */ }
  }

  if (!ready) return null

  return (
    <ReadingModesExercise
      mode="word_burst"
      onComplete={handleComplete}
      onExit={() => router.back()}
      initialContent={initialContent}
    />
  )
}
