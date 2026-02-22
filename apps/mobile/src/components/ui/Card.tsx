import React from 'react'
import { StyleSheet, View, ViewStyle } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { colors } from '../../theme/colors'
import { shadows } from '../../theme/shadows'
import { spacing } from '../../theme/spacing'

export type CardVariant = 'default' | 'elevated' | 'cognitive'

interface CardProps {
  variant?: CardVariant
  children: React.ReactNode
  style?: ViewStyle
  gradientColors?: [string, string]
  padding?: number
}

export function Card({
  variant = 'default',
  children,
  style,
  gradientColors,
  padding = spacing.md,
}: CardProps) {
  if (variant === 'cognitive') {
    const grad = gradientColors ?? (colors.arpGradient as unknown as [string, string])
    return (
      <LinearGradient
        colors={grad}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[s.base, s.cognitive, { padding }, style]}
      >
        {children}
      </LinearGradient>
    )
  }

  return (
    <View style={[
      s.base,
      variant === 'elevated' ? s.elevated : s.default,
      { padding },
      style,
    ]}>
      {children}
    </View>
  )
}

const s = StyleSheet.create({
  base: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  default: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  elevated: {
    backgroundColor: colors.surface,
    ...shadows.md,
  },
  cognitive: {
    // gradient ile çalışır
  },
})
