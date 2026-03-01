import { useEffect, useState } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated'
import { useAuthStore } from '../src/stores/authStore'
import { useOnboardingStore } from '../src/features/onboarding/onboardingStore'
import { initRewardEngine } from '../src/features/rewards/RewardEngine'
import { notificationService } from '../src/services/notificationService'

// Reanimated strict mode uyarılarını kapat (kursorun render sırasında okunması)
configureReanimatedLogger({ level: ReanimatedLogLevel.warn, strict: false })

export default function RootLayout() {
  const router = useRouter()
  const segments = useSegments()
  const { isAuthenticated, student } = useAuthStore()
  const { completed: quizCompleted, loadFromStorage } = useOnboardingStore()
  const [mounted, setMounted] = useState(false)
  const [quizLoaded, setQuizLoaded] = useState(false)

  useEffect(() => {
    initRewardEngine()
    notificationService.init().then(() => {
      notificationService.scheduleDailyReminder()
    })
    loadFromStorage().finally(() => {
      setQuizLoaded(true)
      setMounted(true)
    })
  }, [])

  useEffect(() => {
    if (!mounted || !quizLoaded) return

    const inAuthGroup   = segments[0] === '(auth)'
    const inOnboarding  = segments[0] === '(onboarding)'
    const inDiagnostic  = segments[0] === 'diagnostic'
    const inQuizOnboard = segments[0] === 'onboarding'

    // 1. Henüz quiz tamamlanmadıysa → quiz onboarding (production'da)
    // DEV modda onboarding'i atla — rebuild'de AsyncStorage sıfırlanıyor
    if (!quizCompleted && !inQuizOnboard && !__DEV__) {
      router.replace('/onboarding')
      return
    }

    // 2. Quiz tamamlandı ama giriş yapılmamış → login
    if (!isAuthenticated && !inAuthGroup && !inQuizOnboard) {
      router.replace('/(auth)/login')
      return
    }

    // 3. Giriş yapıldı ama diagnostic tamamlanmamış → mevcut onboarding flow
    if (
      isAuthenticated &&
      !student?.hasCompletedDiagnostic &&
      !inOnboarding &&
      !inDiagnostic
    ) {
      router.replace('/(onboarding)/welcome')
      return
    }

    // 4. Her şey tamam → tabs
    if (
      isAuthenticated &&
      student?.hasCompletedDiagnostic &&
      (inAuthGroup || inOnboarding || inDiagnostic || inQuizOnboard)
    ) {
      router.replace('/(tabs)')
    }
  }, [mounted, quizLoaded, quizCompleted, isAuthenticated, student?.hasCompletedDiagnostic])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="exercise" />
        <Stack.Screen name="diagnostic" />
        <Stack.Screen name="program" />
        <Stack.Screen name="ai-coach" />
        <Stack.Screen name="text-detail" />
        <Stack.Screen name="reader" options={{ gestureEnabled: false }} />
      </Stack>
    </GestureHandlerRootView>
  )
}
