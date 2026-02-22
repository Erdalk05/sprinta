import { Stack } from 'expo-router'

export default function DiagnosticLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, gestureEnabled: false }}>
      <Stack.Screen name="intro" />
      <Stack.Screen name="reading" />
      <Stack.Screen name="comprehension" />
      <Stack.Screen name="result" />
    </Stack>
  )
}
