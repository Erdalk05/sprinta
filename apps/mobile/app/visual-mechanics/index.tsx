/**
 * app/visual-mechanics/index.tsx
 * Expo Router route — Visual Mechanics modülüne giriş noktası.
 *
 * Navigasyon: Tab Bar → eye_training → bu ekran
 * URL: /visual-mechanics
 */

import React from 'react'
import { useRouter } from 'expo-router'
import { VisualMechanicsHomeScreen } from '../../src/features/visual-mechanics'

export default function VisualMechanicsRoute() {
  const router = useRouter()
  return <VisualMechanicsHomeScreen onBack={() => router.back()} />
}
