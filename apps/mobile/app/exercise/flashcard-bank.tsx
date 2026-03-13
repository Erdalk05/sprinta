import { usePendingSheetStore } from '../../src/stores/pendingSheetStore'
import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import FlashcardBankScreen from '../../src/screens/reading/FlashcardBankScreen'
import ReadingModuleIntro from '../../src/components/exercise/ReadingModuleIntro'

export default function uflashcardubankRoute() {
  const router = useRouter()
  const [started, setStarted] = useState(false)
  if (!started) return <ReadingModuleIntro moduleKey="flashcard-bank" onStart={() => setStarted(true)} onBack={() => ( usePendingSheetStore.getState().setPendingSheet('okuma'), router.back() )} />
  return <FlashcardBankScreen onExit={() => ( usePendingSheetStore.getState().setPendingSheet('okuma'), router.back() )} />
}
