import React from 'react'
import { useRouter } from 'expo-router'
import GraphReadingScreen from '../../src/screens/reading/GraphReadingScreen'

export default function GraphReadingRoute() {
  const router = useRouter()
  return <GraphReadingScreen onExit={() => router.back()} />
}
