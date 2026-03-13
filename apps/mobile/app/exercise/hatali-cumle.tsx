import { usePendingSheetStore } from '../../src/stores/pendingSheetStore'
import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import HataliCumleScreen from '../../src/screens/reading/HataliCumleScreen'
import ModuleSetupScreen from '../../src/screens/reading/ModuleSetupScreen'

const MODULE_KEY = 'hatali-cumle'
type Phase = 'setup' | 'exercise'

export default function HataliCumleRoute() {
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

  return <HataliCumleScreen onExit={onBack} />
}
