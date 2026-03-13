import { usePendingSheetStore } from '../../src/stores/pendingSheetStore'
import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import HataliCumleScreen from '../../src/screens/reading/HataliCumleScreen'
import ReadingModuleIntro from '../../src/components/exercise/ReadingModuleIntro'

export default function uhataliucumleRoute() {
  const router = useRouter()
  const [started, setStarted] = useState(false)
  if (!started) return <ReadingModuleIntro moduleKey="hatali-cumle" onStart={() => setStarted(true)} onBack={() => ( usePendingSheetStore.getState().setPendingSheet('okuma'), router.back() )} />
  return <HataliCumleScreen onExit={() => ( usePendingSheetStore.getState().setPendingSheet('okuma'), router.back() )} />
}
