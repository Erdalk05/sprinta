import { usePendingSheetStore } from '../../src/stores/pendingSheetStore'
import React from 'react'
import { useRouter } from 'expo-router'
import HataliCumleScreen from '../../src/screens/reading/HataliCumleScreen'

export default function HataliCumleRoute() {
  const router = useRouter()
  const onExit = () => { usePendingSheetStore.getState().setPendingSheet('okuma'); router.back() }
  return <HataliCumleScreen onExit={onExit} />
}
