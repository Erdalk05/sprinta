import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import KelimeBaglamiScreen from '../../src/screens/reading/KelimeBaglamiScreen'
import ReadingModuleIntro from '../../src/components/exercise/ReadingModuleIntro'

export default function ukelimeubaglamiRoute() {
  const router = useRouter()
  const [started, setStarted] = useState(false)
  if (!started) return <ReadingModuleIntro moduleKey="kelime-baglami" onStart={() => setStarted(true)} onBack={() => router.back()} />
  return <KelimeBaglamiScreen onExit={() => router.back()} />
}
