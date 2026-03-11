import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import PoetryAnalysisScreen from '../../src/screens/reading/PoetryAnalysisScreen'
import ReadingModuleIntro from '../../src/components/exercise/ReadingModuleIntro'

export default function upoetryuanalysisRoute() {
  const router = useRouter()
  const [started, setStarted] = useState(false)
  if (!started) return <ReadingModuleIntro moduleKey="poetry-analysis" onStart={() => setStarted(true)} onBack={() => router.back()} />
  return <PoetryAnalysisScreen onExit={() => router.back()} />
}
