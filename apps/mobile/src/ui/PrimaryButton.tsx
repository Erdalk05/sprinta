/**
 * Sprinta Design System v1.0 — PrimaryButton
 *
 * variant:
 *   primary   → gradient cyan (#38B6D8 → #4FD1FF), scale animasyonu
 *   secondary → şeffaf, #38B6D8 border, 2px
 *   small     → height 36px, kart içi kullanım
 */

import React from 'react'
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { C } from './colors'
import { R } from './radius'
import { T } from './typography'
import { SH } from './shadows'

interface PrimaryButtonProps {
  label:        string
  sublabel?:    string
  onPress:      () => void
  variant?:     'primary' | 'secondary' | 'small'
  loading?:     boolean
  disabled?:    boolean
  style?:       ViewStyle
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  label,
  sublabel,
  onPress,
  variant  = 'primary',
  loading  = false,
  disabled = false,
  style,
}) => {
  const scale = useSharedValue(1)
  const anim  = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  const pressIn  = () => { scale.value = withTiming(0.97, { duration: 120, easing: Easing.out(Easing.quad) }) }
  const pressOut = () => { scale.value = withTiming(1.00, { duration: 120, easing: Easing.out(Easing.quad) }) }

  // ── Secondary ─────────────────────────────────────
  if (variant === 'secondary') {
    return (
      <Animated.View style={[anim, style]}>
        <TouchableOpacity
          style={[s.secondary, disabled && s.disabled]}
          onPress={onPress}
          onPressIn={pressIn}
          onPressOut={pressOut}
          activeOpacity={1}
          disabled={disabled || loading}
        >
          <Text style={s.secondaryTxt}>{label}</Text>
          {sublabel && <Text style={s.sublabelSec}>{sublabel}</Text>}
        </TouchableOpacity>
      </Animated.View>
    )
  }

  // ── Small ─────────────────────────────────────────
  if (variant === 'small') {
    return (
      <Animated.View style={[{ borderRadius: R.pill, overflow: 'hidden' }, anim, style]}>
        <TouchableOpacity
          style={[s.smallBtn, disabled && s.disabled]}
          onPress={onPress}
          onPressIn={pressIn}
          onPressOut={pressOut}
          activeOpacity={1}
          disabled={disabled || loading}
        >
          <LinearGradient
            colors={['#38B6D8', '#4FD1FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.smallGradient}
          >
            <Text style={s.smallTxt}>{label}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    )
  }

  // ── Primary (default) ─────────────────────────────
  return (
    <Animated.View style={[s.wrap, SH.accent, anim, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        activeOpacity={1}
        disabled={disabled || loading}
      >
        <LinearGradient
          colors={['#38B6D8', '#4FD1FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[s.gradient, disabled && s.disabled]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={s.labelTxt}>{label}</Text>
              {sublabel && <Text style={s.sublabelTxt}>{sublabel}</Text>}
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  )
}

const s = StyleSheet.create({
  // Primary
  wrap: {
    borderRadius: R.xl,
    overflow:     'hidden',
  },
  gradient: {
    height:          56,
    borderRadius:    R.xl,       // 14px'e en yakın: xl=20, ama 14 yazacağız
    alignItems:     'center',
    justifyContent: 'center',
    gap:             3,
  },
  labelTxt: {
    fontSize:      17,
    fontWeight:    '700' as const,
    color:         '#FFFFFF',    // Her zaman beyaz
    letterSpacing: 0.3,
  },
  sublabelTxt: {
    ...T.caption,
    color: 'rgba(255,255,255,0.75)',
  },
  disabled: { opacity: 0.45 },

  // Secondary
  secondary: {
    height:         52,
    borderRadius:   R.xl,
    borderWidth:    2,
    borderColor:    C.accent,   // #38B6D8
    alignItems:     'center',
    justifyContent: 'center',
    gap:             3,
  },
  secondaryTxt: {
    fontSize:   15,
    fontWeight: '600' as const,
    color:      C.accent,
  },
  sublabelSec: {
    ...T.caption,
    color: C.textHint,
  },

  // Small
  smallBtn: {
    borderRadius: R.pill,
    overflow:    'hidden',
  },
  smallGradient: {
    height:         36,
    paddingHorizontal: 16,
    alignItems:     'center',
    justifyContent: 'center',
    borderRadius:   R.pill,
  },
  smallTxt: {
    fontSize:   12,
    fontWeight: '700' as const,
    color:      '#FFFFFF',
  },
})
