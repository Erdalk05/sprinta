import { Stack } from 'expo-router'
import { theme } from '../../src/theme'

export default function ProgramLayout() {
  return (
    <Stack screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: theme.colors.background },
      animation: 'slide_from_right',
    }} />
  )
}
