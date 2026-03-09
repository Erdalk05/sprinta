import React from 'react'
import { useRouter } from 'expo-router'
import FadingWordScreen from '../../src/screens/reading/FadingWordScreen'

export default function FadingWordRoute() {
  const router = useRouter()
  return <FadingWordScreen onExit={() => router.back()} />
}
