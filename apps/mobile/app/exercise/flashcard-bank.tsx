import React from 'react'
import { useRouter } from 'expo-router'
import FlashcardBankScreen from '../../src/screens/reading/FlashcardBankScreen'

export default function FlashcardBankRoute() {
  const router = useRouter()
  return <FlashcardBankScreen onExit={() => router.back()} />
}
