import { usePendingSheetStore } from '../../src/stores/pendingSheetStore'
import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import GraphReadingScreen from '../../src/screens/reading/GraphReadingScreen'
import ReadingModuleIntro from '../../src/components/exercise/ReadingModuleIntro'

export default function ugraphureadingRoute() {
  const router = useRouter()
  const [started, setStarted] = useState(false)
  if (!started) return <ReadingModuleIntro moduleKey="graph-reading" onStart={() => setStarted(true)} onBack={() => ( usePendingSheetStore.getState().setPendingSheet('okuma'), router.back() )} />
  return <GraphReadingScreen onExit={() => ( usePendingSheetStore.getState().setPendingSheet('okuma'), router.back() )} />
}
