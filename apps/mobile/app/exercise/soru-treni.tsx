import { usePendingSheetStore } from '../../src/stores/pendingSheetStore'
import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import SoruTreniScreen from '../../src/screens/reading/SoruTreniScreen'
import ReadingModuleIntro from '../../src/components/exercise/ReadingModuleIntro'

export default function usoruutreniRoute() {
  const router = useRouter()
  const [started, setStarted] = useState(false)
  if (!started) return <ReadingModuleIntro moduleKey="soru-treni" onStart={() => setStarted(true)} onBack={() => ( usePendingSheetStore.getState().setPendingSheet('okuma'), router.back() )} />
  return <SoruTreniScreen onExit={() => ( usePendingSheetStore.getState().setPendingSheet('okuma'), router.back() )} />
}
