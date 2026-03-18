import { usePendingSheetStore } from '../../src/stores/pendingSheetStore'
import React from 'react'
import { useRouter } from 'expo-router'
import FlashcardBankScreen from '../../src/screens/reading/FlashcardBankScreen'

export default function FlashcardBankRoute() {
  const router = useRouter()
  const onExit = () => { usePendingSheetStore.getState().setPendingSheet('okuma'); router.back() }
  return <FlashcardBankScreen onExit={onExit} />
}
