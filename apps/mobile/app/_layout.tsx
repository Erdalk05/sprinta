import { useEffect, useState } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useAuthStore } from '../src/stores/authStore'

export default function RootLayout() {
  const router = useRouter()
  const segments = useSegments()
  const { isAuthenticated, student } = useAuthStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const inAuthGroup = segments[0] === '(auth)'
    const inOnboarding = segments[0] === '(onboarding)'
    const inDiagnostic = segments[0] === 'diagnostic'

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login')
    } else if (
      isAuthenticated &&
      !student?.hasCompletedDiagnostic &&
      !inOnboarding &&
      !inDiagnostic
    ) {
      router.replace('/(onboarding)/welcome')
    } else if (
      isAuthenticated &&
      student?.hasCompletedDiagnostic &&
      (inAuthGroup || inOnboarding || inDiagnostic)
    ) {
      router.replace('/(tabs)')
    }
  }, [mounted, isAuthenticated, student?.hasCompletedDiagnostic])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="exercise" />
        <Stack.Screen name="diagnostic" />
        <Stack.Screen name="program" />
        <Stack.Screen name="ai-coach" />
      </Stack>
    </GestureHandlerRootView>
  )
}
