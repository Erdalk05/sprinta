import { Stack } from 'expo-router'

export default function ExerciseLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, gestureEnabled: false }}>
      <Stack.Screen name="[moduleCode]/index" />
      <Stack.Screen name="[moduleCode]/session" />
      <Stack.Screen name="[moduleCode]/result" />
      <Stack.Screen name="chunk-rsvp" />
      <Stack.Screen name="flow-reading" />
      <Stack.Screen name="timed-reading" />
      <Stack.Screen name="academic-mode" />
      <Stack.Screen name="keyword-scan" />
      <Stack.Screen name="memory-anchor" />
      <Stack.Screen name="prediction-reading" />
      <Stack.Screen name="focus-filter" />
      <Stack.Screen name="subvocal-free" />
      <Stack.Screen name="vocabulary" />
      <Stack.Screen name="fixation-trainer" />
      <Stack.Screen name="speed-camp" />
    </Stack>
  )
}
