import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import DualColumnScreen from '../../src/screens/reading/DualColumnScreen'
import ReadingModuleIntro from '../../src/components/exercise/ReadingModuleIntro'

export default function udualucolumnRoute() {
  const router = useRouter()
  const [started, setStarted] = useState(false)
  if (!started) return <ReadingModuleIntro moduleKey="dual-column" onStart={() => setStarted(true)} onBack={() => router.back()} />
  return <DualColumnScreen onExit={() => router.back()} />
}
