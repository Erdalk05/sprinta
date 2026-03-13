import { usePendingSheetStore } from '../../src/stores/pendingSheetStore'
/**
 * Kelime Dağarcığı — vocabulary mod
 * MCQ flashcard tabanlı kelime öğrenme egzersizi.
 * VocabularyExercise bileşenini kullanır.
 */
import React, { useState, useCallback } from 'react'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../src/stores/authStore'
import { VocabularyExercise } from '../../src/components/exercises/VocabularyExercise'
import ReadingModuleIntro from '../../src/components/exercise/ReadingModuleIntro'

export default function VocabularyScreen() {
  const router      = useRouter()
  const { student } = useAuthStore()
  const [started, setStarted] = useState(false)

  const handleComplete = useCallback(async () => { ( usePendingSheetStore.getState().setPendingSheet('okuma'), router.back() ) }, [router])

  if (!started) return <ReadingModuleIntro moduleKey="vocabulary" onStart={() => setStarted(true)} onBack={() => ( usePendingSheetStore.getState().setPendingSheet('okuma'), router.back() )} />

  return (
    <VocabularyExercise
      examFilter={
        (student?.examTarget?.toLowerCase() as 'lgs' | 'tyt' | 'ayt' | 'all') ?? 'all'
      }
      wordCount={10}
      onComplete={handleComplete}
      onExit={() => ( usePendingSheetStore.getState().setPendingSheet('okuma'), router.back() )}
    />
  )
}
