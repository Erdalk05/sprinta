/**
 * Kelime Dağarcığı — vocabulary mod
 * MCQ flashcard tabanlı kelime öğrenme egzersizi.
 * VocabularyExercise bileşenini kullanır.
 */
import React, { useCallback } from 'react'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../src/stores/authStore'
import { VocabularyExercise } from '../../src/components/exercises/VocabularyExercise'
import { supabase } from '../../src/lib/supabase'

export default function VocabularyScreen() {
  const router      = useRouter()
  const { student } = useAuthStore()

  // XP'yi students.total_xp'ye yansıt (opsiyonel — zaten reading_mode_sessions trigger halleder)
  const handleComplete = useCallback(async (score: number, xp: number) => {
    router.back()
  }, [router])

  return (
    <VocabularyExercise
      examFilter={
        (student?.examTarget?.toLowerCase() as 'lgs' | 'tyt' | 'ayt' | 'all') ?? 'all'
      }
      wordCount={10}
      onComplete={handleComplete}
      onExit={() => router.back()}
    />
  )
}
