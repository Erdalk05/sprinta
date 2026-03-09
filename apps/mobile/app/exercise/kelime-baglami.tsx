import React from 'react'
import { useRouter } from 'expo-router'
import KelimeBaglamiScreen from '../../src/screens/reading/KelimeBaglamiScreen'

export default function KelimeBaglamiRoute() {
  const router = useRouter()
  return <KelimeBaglamiScreen onExit={() => router.back()} />
}
