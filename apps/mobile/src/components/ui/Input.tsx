import React, { useState, useRef } from 'react'
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../../theme/colors'
import { typography } from '../../theme/typography'
import { spacing } from '../../theme/spacing'

interface InputProps extends TextInputProps {
  label?: string
  error?: string
  leftIcon?: keyof typeof Ionicons.glyphMap
  rightIcon?: keyof typeof Ionicons.glyphMap
  onRightIconPress?: () => void
  isPassword?: boolean
  containerStyle?: ViewStyle
}

export function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  isPassword = false,
  containerStyle,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const borderAnim = useRef(new Animated.Value(0)).current

  const handleFocus = () => {
    setFocused(true)
    Animated.timing(borderAnim, {
      toValue: 1, duration: 200, useNativeDriver: false,
    }).start()
    props.onFocus?.({} as any)
  }

  const handleBlur = () => {
    setFocused(false)
    Animated.timing(borderAnim, {
      toValue: 0, duration: 200, useNativeDriver: false,
    }).start()
    props.onBlur?.({} as any)
  }

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      error ? colors.borderError : colors.border,
      error ? colors.borderError : colors.borderFocus,
    ],
  })

  const effectiveRightIcon = isPassword
    ? (showPassword ? 'eye-off-outline' : 'eye-outline')
    : rightIcon

  const handleRightPress = isPassword
    ? () => setShowPassword(v => !v)
    : onRightIconPress

  return (
    <View style={[s.container, containerStyle]}>
      {label && <Text style={s.label}>{label}</Text>}
      <Animated.View style={[s.inputWrap, { borderColor }]}>
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={focused ? colors.primary : colors.textDisabled}
            style={s.leftIcon}
          />
        )}
        <TextInput
          {...props}
          style={[s.input, leftIcon ? s.inputWithLeft : null]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={isPassword && !showPassword}
          placeholderTextColor={colors.textDisabled}
          autoCapitalize={isPassword ? 'none' : props.autoCapitalize}
        />
        {effectiveRightIcon && (
          <Pressable onPress={handleRightPress} style={s.rightIcon}>
            <Ionicons name={effectiveRightIcon} size={20} color={colors.textDisabled} />
          </Pressable>
        )}
      </Animated.View>
      {error && <Text style={s.error}>{error}</Text>}
    </View>
  )
}

const s = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: {
    ...(typography.label as object),
    color: colors.textPrimary,
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm + 4,
    minHeight: 50,
  },
  leftIcon:  { marginRight: spacing.sm },
  rightIcon: { padding: 4 },
  input: {
    flex: 1,
    ...(typography.body as object),
    color: colors.textPrimary,
    paddingVertical: 12,
  },
  inputWithLeft: { marginLeft: 4 },
  error: {
    ...(typography.caption as object),
    color: colors.error,
    marginTop: 4,
  },
})
