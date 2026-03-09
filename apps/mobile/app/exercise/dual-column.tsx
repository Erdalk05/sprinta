import React from 'react'
import { useRouter } from 'expo-router'
import DualColumnScreen from '../../src/screens/reading/DualColumnScreen'

export default function DualColumnRoute() {
  const router = useRouter()
  return <DualColumnScreen onExit={() => router.back()} />
}
