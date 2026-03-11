import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import SpeedCampScreen from '../../src/screens/SpeedCampScreen'
import ReadingModuleIntro from '../../src/components/exercise/ReadingModuleIntro'

export default function SpeedCampRoute() {
  const router = useRouter()
  const [started, setStarted] = useState(false)
  if (!started) return <ReadingModuleIntro moduleKey="speed-camp" onStart={() => setStarted(true)} onBack={() => router.back()} />
  return <SpeedCampScreen />
}
