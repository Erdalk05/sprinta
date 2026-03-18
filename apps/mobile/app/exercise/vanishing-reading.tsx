import { usePendingSheetStore } from '../../src/stores/pendingSheetStore'
import React from 'react'
import { useRouter } from 'expo-router'
import VanishingReadingScreen from '../../src/screens/reading/VanishingReadingScreen'

export default function VanishingReadingRoute() {
  const router = useRouter()
  const onExit = () => { usePendingSheetStore.getState().setPendingSheet('okuma'); router.back() }
  return <VanishingReadingScreen onExit={onExit} />
}
