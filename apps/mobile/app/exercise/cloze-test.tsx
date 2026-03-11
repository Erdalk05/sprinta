import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import ClozeTestScreen from '../../src/screens/reading/ClozeTestScreen'
import ReadingModuleIntro from '../../src/components/exercise/ReadingModuleIntro'

export default function uclozeutestRoute() {
  const router = useRouter()
  const [started, setStarted] = useState(false)
  if (!started) return <ReadingModuleIntro moduleKey="cloze-test" onStart={() => setStarted(true)} onBack={() => router.back()} />
  return <ClozeTestScreen onExit={() => router.back()} />
}
