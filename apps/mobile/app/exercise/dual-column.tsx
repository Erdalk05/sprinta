import { usePendingSheetStore } from '../../src/stores/pendingSheetStore'
import React from 'react'
import { useRouter } from 'expo-router'
import DualColumnScreen from '../../src/screens/reading/DualColumnScreen'

export default function DualColumnRoute() {
  const router = useRouter()
  const onExit = () => { usePendingSheetStore.getState().setPendingSheet('okuma'); router.back() }
  return <DualColumnScreen onExit={onExit} />
}
