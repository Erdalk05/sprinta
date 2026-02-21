import { Stack } from 'expo-router'

export default function ExerciseLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, gestureEnabled: false }}>
      <Stack.Screen name="[moduleCode]/index" />
      <Stack.Screen name="[moduleCode]/session" />
      <Stack.Screen name="[moduleCode]/result" />
    </Stack>
  )
}
