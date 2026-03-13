import { usePendingSheetStore } from '../../src/stores/pendingSheetStore'
import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import PoetryAnalysisScreen from '../../src/screens/reading/PoetryAnalysisScreen'
import ModuleSetupScreen from '../../src/screens/reading/ModuleSetupScreen'

const MODULE_KEY = 'poetry-analysis'
type Phase = 'setup' | 'exercise'

export default function PoetryAnalysisRoute() {
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

  return <PoetryAnalysisScreen onExit={onBack} />
}
