import React, { useRef } from 'react'
import {
  Animated,
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
  TextStyle,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import { colors } from '../../theme/colors'
import { typography } from '../../theme/typography'
import { shadows } from '../../theme/shadows'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  disabled?: boolean
  style?: ViewStyle
  textStyle?: TextStyle
  fullWidth?: boolean
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const scale = useRef(new Animated.Value(1)).current

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start()
  }

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start()
  }

  const handlePress = () => {
    if (disabled || loading) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onPress()
  }

  const containerStyle = [
    s.base,
    s[`size_${size}`],
    s[`variant_${variant}`],
    (disabled || loading) && s.disabled,
    fullWidth && s.fullWidth,
    style,
  ]

  const labelStyle = [
    s.label,
    s[`label_${size}`],
    s[`labelVariant_${variant}`],
    (disabled || loading) && s.labelDisabled,
    textStyle,
  ]

  return (
    <Animated.View style={[{ transform: [{ scale }] }, fullWidth && s.fullWidth]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={containerStyle}
        disabled={disabled || loading}
      >
        {loading
          ? <ActivityIndicator
              size="small"
              color={variant === 'primary' || variant === 'danger' ? colors.white : colors.primary}
            />
          : <Text style={labelStyle}>{title}</Text>
        }
      </Pressable>
    </Animated.View>
  )
}

const s = StyleSheet.create({
  base: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: { width: '100%' },

  // Sizes
  size_sm: { paddingVertical: 8,  paddingHorizontal: 16, minHeight: 36 },
  size_md: { paddingVertical: 14, paddingHorizontal: 24, minHeight: 48 },
  size_lg: { paddingVertical: 18, paddingHorizontal: 32, minHeight: 56 },

  // Variants
  variant_primary:   { backgroundColor: colors.primary, ...shadows.sm },
  variant_secondary: { backgroundColor: colors.primaryDark },
  variant_outline:   { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary },
  variant_ghost:     { backgroundColor: 'transparent' },
  variant_danger:    { backgroundColor: colors.error, ...shadows.sm },

  disabled: { opacity: 0.5 },

  // Labels
  label: { ...(typography.bodyMedium as object) },
  label_sm: { fontSize: 14 },
  label_md: { fontSize: 16 },
  label_lg: { fontSize: 17 },

  labelVariant_primary:   { color: colors.white },
  labelVariant_secondary: { color: colors.white },
  labelVariant_outline:   { color: colors.primary },
  labelVariant_ghost:     { color: colors.primary },
  labelVariant_danger:    { color: colors.white },

  labelDisabled: { opacity: 0.7 },
})
