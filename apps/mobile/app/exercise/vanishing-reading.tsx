import React from 'react'
import { useRouter } from 'expo-router'
import VanishingReadingScreen from '../../src/screens/reading/VanishingReadingScreen'

export default function VanishingReadingRoute() {
  const router = useRouter()
  return <VanishingReadingScreen onExit={() => router.back()} />
}
