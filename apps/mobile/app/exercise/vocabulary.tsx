import { usePendingSheetStore } from '../../src/stores/pendingSheetStore'
import React from 'react'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../src/stores/authStore'
import { VocabularyExercise } from '../../src/components/exercises/VocabularyExercise'

export default function VocabularyScreen() {
  const router      = useRouter()
  const { student } = useAuthStore()
  const onExit = () => { usePendingSheetStore.getState().setPendingSheet('okuma'); router.back() }
  return (
    <VocabularyExercise
      examFilter={(student?.examTarget?.toLowerCase() as 'lgs' | 'tyt' | 'ayt' | 'all') ?? 'all'}
      wordCount={10}
      onComplete={onExit}
      onExit={onExit}
    />
  )
}
