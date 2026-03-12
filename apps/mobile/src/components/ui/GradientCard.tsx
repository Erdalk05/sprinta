import React from 'react'
import { StyleSheet, ViewStyle } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { theme } from '../../theme'

interface Props {
  colors?: [string, string, ...string[]]
  style?: ViewStyle | ViewStyle[]
  children: React.ReactNode
  radius?: number
  padding?: number
}

export function GradientCard({
  colors: gradColors = ['#0F2357', '#1A3594'],
  style,
  children,
  radius = 16,
  padding = theme.spacing.xl,
}: Props) {
  return (
    <LinearGradient
      colors={gradColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, { borderRadius: radius, padding }, theme.shadows.md, style]}
    >
      {children}
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
})
