import React, { useState, useCallback } from 'react'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../src/stores/authStore'
import { supabase } from '../../src/lib/supabase'
import { usePendingContent } from '../../src/hooks/usePendingContent'
import ReadingModesExercise, { ReadingModesMetrics } from '../../src/components/exercises/ReadingModes/ReadingModesExercise'
import ReadingModuleIntro from '../../src/components/exercise/ReadingModuleIntro'

export default function ukeyworduscanScreen() {
  const router = useRouter()
  const { student } = useAuthStore()
  const { ready, initialContent } = usePendingContent()
  const [started, setStarted] = useState(false)

  const handleComplete = useCallback(async (m: ReadingModesMetrics) => {
    if (student?.id) {
      try {
        await (supabase as any).from('reading_mode_sessions').insert({
          student_id: student.id, mode: 'keyword', avg_wpm: m.avgWPM,
          total_words: m.totalWords, duration_seconds: m.durationSeconds,
          arp_score: m.arpScore, xp_earned: m.xpEarned, completion_ratio: m.completionRatio,
        })
      } catch { /* sessiz */ }
    }
  }, [student])

  if (!started) return <ReadingModuleIntro moduleKey="keyword-scan" onStart={() => setStarted(true)} onBack={() => router.back()} />
  if (!ready) return null

  return (
    <ReadingModesExercise
      mode="keyword"
      onComplete={handleComplete}
      onExit={() => router.back()}
      initialContent={initialContent}
    />
  )
}
