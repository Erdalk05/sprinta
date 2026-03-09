import React from 'react'
import { useRouter } from 'expo-router'
import HataliCumleScreen from '../../src/screens/reading/HataliCumleScreen'

export default function HataliCumleRoute() {
  const router = useRouter()
  return <HataliCumleScreen onExit={() => router.back()} />
}
