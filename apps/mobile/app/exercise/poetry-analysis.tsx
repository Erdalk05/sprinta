import React from 'react'
import { useRouter } from 'expo-router'
import PoetryAnalysisScreen from '../../src/screens/reading/PoetryAnalysisScreen'

export default function PoetryAnalysisRoute() {
  const router = useRouter()
  return <PoetryAnalysisScreen onExit={() => router.back()} />
}
