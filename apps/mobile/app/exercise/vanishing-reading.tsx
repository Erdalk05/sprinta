import { usePendingSheetStore } from '../../src/stores/pendingSheetStore'
import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import ModuleSetupScreen from '../../src/screens/reading/ModuleSetupScreen'
import VanishingReadingScreen from '../../src/screens/reading/VanishingReadingScreen'

type Phase = 'setup' | 'exercise'

export default function VanishingReadingRoute() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('setup')

  if (phase === 'setup') {
    return (
      <ModuleSetupScreen
        moduleKey="vanishing-reading"
        onSelectText={() => setPhase('exercise')}
        onQuickStart={() => setPhase('exercise')}
        onBack={() => ( usePendingSheetStore.getState().setPendingSheet('okuma'), router.back() )}
      />
    )
  }

  return <VanishingReadingScreen onExit={() => ( usePendingSheetStore.getState().setPendingSheet('okuma'), router.back() )} />
}
