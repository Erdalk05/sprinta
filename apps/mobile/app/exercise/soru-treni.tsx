import { usePendingSheetStore } from '../../src/stores/pendingSheetStore'
import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import SoruTreniScreen from '../../src/screens/reading/SoruTreniScreen'
import ModuleSetupScreen from '../../src/screens/reading/ModuleSetupScreen'

const MODULE_KEY = 'soru-treni'
type Phase = 'setup' | 'exercise'

export default function SoruTreniRoute() {
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

  return <SoruTreniScreen onExit={onBack} />
}
