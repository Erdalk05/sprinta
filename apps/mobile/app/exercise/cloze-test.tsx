import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import ModuleSetupScreen from '../../src/screens/reading/ModuleSetupScreen'
import ClozeTestScreen from '../../src/screens/reading/ClozeTestScreen'

type Phase = 'setup' | 'exercise'

export default function ClozeTestRoute() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('setup')

  if (phase === 'setup') {
    return (
      <ModuleSetupScreen
        moduleKey="cloze-test"
        onSelectText={() => setPhase('exercise')}
        onQuickStart={() => setPhase('exercise')}
        onBack={() => router.back()}
      />
    )
  }

  return <ClozeTestScreen onExit={() => router.back()} />
}
