import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import VanishingReadingScreen from '../../src/screens/reading/VanishingReadingScreen'
import ReadingModuleIntro from '../../src/components/exercise/ReadingModuleIntro'

export default function uvanishingureadingRoute() {
  const router = useRouter()
  const [started, setStarted] = useState(false)
  if (!started) return <ReadingModuleIntro moduleKey="vanishing-reading" onStart={() => setStarted(true)} onBack={() => router.back()} />
  return <VanishingReadingScreen onExit={() => router.back()} />
}
