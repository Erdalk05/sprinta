import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import FadingWordScreen from '../../src/screens/reading/FadingWordScreen'
import ReadingModuleIntro from '../../src/components/exercise/ReadingModuleIntro'

export default function ufadinguwordRoute() {
  const router = useRouter()
  const [started, setStarted] = useState(false)
  if (!started) return <ReadingModuleIntro moduleKey="fading-word" onStart={() => setStarted(true)} onBack={() => router.back()} />
  return <FadingWordScreen onExit={() => router.back()} />
}
