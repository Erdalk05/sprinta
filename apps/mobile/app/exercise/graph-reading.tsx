import { usePendingSheetStore } from '../../src/stores/pendingSheetStore'
import React from 'react'
import { useRouter } from 'expo-router'
import GraphReadingScreen from '../../src/screens/reading/GraphReadingScreen'

export default function GraphReadingRoute() {
  const router = useRouter()
  const onExit = () => { usePendingSheetStore.getState().setPendingSheet('okuma'); router.back() }
  return <GraphReadingScreen onExit={onExit} />
}
