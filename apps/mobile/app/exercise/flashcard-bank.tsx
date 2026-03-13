import { usePendingSheetStore } from '../../src/stores/pendingSheetStore'
import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import FlashcardBankScreen from '../../src/screens/reading/FlashcardBankScreen'
import ModuleSetupScreen from '../../src/screens/reading/ModuleSetupScreen'

const MODULE_KEY = 'flashcard-bank'
type Phase = 'setup' | 'exercise'

export default function FlashcardBankRoute() {
  const router = useRouter()
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

  return <FlashcardBankScreen onExit={onBack} />
}
