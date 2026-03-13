import { usePendingSheetStore } from '../../src/stores/pendingSheetStore'
import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../src/stores/authStore'
import { VocabularyExercise } from '../../src/components/exercises/VocabularyExercise'
import ModuleSetupScreen from '../../src/screens/reading/ModuleSetupScreen'

const MODULE_KEY = 'vocabulary'
type Phase = 'setup' | 'exercise'

export default function VocabularyScreen() {
  const router      = useRouter()
  const { student } = useAuthStore()
  const [phase, setPhase] = useState<Phase>('setup')

  const onBack = () => { usePendingSheetStore.getState().setPendingSheet('okuma'); router.back() }

  if (phase === 'setup') {
    return (
      <ModuleSetupScreen
        moduleKey={MODULE_KEY}
        onSelectText={() => setPhase('exercise')}
        onQuickStart={() => setPhase('exercise')}
        onBack={onBack}
      />
    )
  }

  return (
    <VocabularyExercise
      examFilter={(student?.examTarget?.toLowerCase() as 'lgs' | 'tyt' | 'ayt' | 'all') ?? 'all'}
      wordCount={10}
      onComplete={onBack}
      onExit={onBack}
    />
  )
}
