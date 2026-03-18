import { usePendingSheetStore } from '../../src/stores/pendingSheetStore'
import React from 'react'
import { useRouter } from 'expo-router'
import SoruTreniScreen from '../../src/screens/reading/SoruTreniScreen'

export default function SoruTreniRoute() {
  const router = useRouter()
  const onExit = () => { usePendingSheetStore.getState().setPendingSheet('okuma'); router.back() }
  return <SoruTreniScreen onExit={onExit} />
}
