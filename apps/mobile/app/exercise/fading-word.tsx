import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import ModuleSetupScreen from '../../src/screens/reading/ModuleSetupScreen'
import FadingWordScreen from '../../src/screens/reading/FadingWordScreen'

type Phase = 'setup' | 'exercise'

export default function FadingWordRoute() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('setup')

  if (phase === 'setup') {
    return (
      <ModuleSetupScreen
        moduleKey="fading-word"
        onSelectText={() => setPhase('exercise')}
        onQuickStart={() => setPhase('exercise')}
        onBack={() => router.back()}
      />
    )
  }

  return <FadingWordScreen onExit={() => router.back()} />
}
