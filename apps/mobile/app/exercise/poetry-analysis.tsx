import { usePendingSheetStore } from '../../src/stores/pendingSheetStore'
import React from 'react'
import { useRouter } from 'expo-router'
import PoetryAnalysisScreen from '../../src/screens/reading/PoetryAnalysisScreen'

export default function PoetryAnalysisRoute() {
  const router = useRouter()
  const onExit = () => { usePendingSheetStore.getState().setPendingSheet('okuma'); router.back() }
  return <PoetryAnalysisScreen onExit={onExit} />
}
