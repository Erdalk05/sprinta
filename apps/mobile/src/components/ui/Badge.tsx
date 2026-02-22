import React from 'react'
import { StyleSheet, Text, View, ViewStyle } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { colors } from '../../theme/colors'
import { typography } from '../../theme/typography'

export type BadgeType = 'xp' | 'streak' | 'level'
export type BadgeSize = 'sm' | 'md' | 'lg'

interface BadgeProps {
  type?: BadgeType
  value: string | number
  size?: BadgeSize
  style?: ViewStyle
}

export function Badge({ type = 'xp', value, size = 'md', style }: BadgeProps) {
  const pad = size === 'sm' ? { px: 8, py: 3 } : size === 'lg' ? { px: 16, py: 8 } : { px: 12, py: 5 }

  if (type === 'streak') {
    return (
      <View style={[s.base, s.streak, { paddingHorizontal: pad.px, paddingVertical: pad.py }, style]}>
        <Text style={[s.label, s[`size_${size}`]]}>🔥 {value}</Text>
      </View>
    )
  }

  if (type === 'level') {
    return (
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[s.base, { paddingHorizontal: pad.px, paddingVertical: pad.py }, style]}
      >
        <Text style={[s.label, s[`size_${size}`], { color: colors.white }]}>⭐ {value}</Text>
      </LinearGradient>
    )
  }

  // xp
  return (
    <View style={[s.base, s.xp, { paddingHorizontal: pad.px, paddingVertical: pad.py }, style]}>
      <Text style={[s.label, s[`size_${size}`], { color: colors.primaryDarker }]}>⚡ {value} XP</Text>
    </View>
  )
}

const s = StyleSheet.create({
  base:   { borderRadius: 999, flexDirection: 'row', alignItems: 'center' },
  xp:     { backgroundColor: colors.primaryLight },
  streak: { backgroundColor: '#FFF3E0' },
  label:  { ...(typography.captionMedium as object), fontWeight: '600' },
  size_sm: { fontSize: 11 },
  size_md: { fontSize: 12 },
  size_lg: { fontSize: 14 },
})
