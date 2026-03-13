import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import ModuleSetupScreen from '../../src/screens/reading/ModuleSetupScreen'
import DualColumnScreen from '../../src/screens/reading/DualColumnScreen'

type Phase = 'setup' | 'exercise'

export default function DualColumnRoute() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('setup')

  if (phase === 'setup') {
    return (
      <ModuleSetupScreen
        moduleKey="dual-column"
        onSelectText={() => setPhase('exercise')}
        onQuickStart={() => setPhase('exercise')}
        onBack={() => router.back()}
      />
    )
  }

  return <DualColumnScreen onExit={() => router.back()} />
}
