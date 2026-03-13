import { usePendingSheetStore } from '../../src/stores/pendingSheetStore'
import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import GraphReadingScreen from '../../src/screens/reading/GraphReadingScreen'
import ModuleSetupScreen from '../../src/screens/reading/ModuleSetupScreen'

const MODULE_KEY = 'graph-reading'
type Phase = 'setup' | 'exercise'

export default function GraphReadingRoute() {
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

  return <GraphReadingScreen onExit={onBack} />
}
