import React from 'react'
import { useRouter } from 'expo-router'
import SoruTreniScreen from '../../src/screens/reading/SoruTreniScreen'

export default function SoruTreniRoute() {
  const router = useRouter()
  return <SoruTreniScreen onExit={() => router.back()} />
}
