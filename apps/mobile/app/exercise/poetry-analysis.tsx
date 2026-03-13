import { usePendingSheetStore } from '../../src/stores/pendingSheetStore'
import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import PoetryAnalysisScreen from '../../src/screens/reading/PoetryAnalysisScreen'
import ReadingModuleIntro from '../../src/components/exercise/ReadingModuleIntro'

export default function upoetryuanalysisRoute() {
  const router = useRouter()
  const [started, setStarted] = useState(false)
  if (!started) return <ReadingModuleIntro moduleKey="poetry-analysis" onStart={() => setStarted(true)} onBack={() => ( usePendingSheetStore.getState().setPendingSheet('okuma'), router.back() )} />
  return <PoetryAnalysisScreen onExit={() => ( usePendingSheetStore.getState().setPendingSheet('okuma'), router.back() )} />
}
