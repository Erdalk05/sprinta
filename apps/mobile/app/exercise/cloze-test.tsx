import React from 'react'
import { useRouter } from 'expo-router'
import ClozeTestScreen from '../../src/screens/reading/ClozeTestScreen'

export default function ClozeTestRoute() {
  const router = useRouter()
  return <ClozeTestScreen onExit={() => router.back()} />
}
