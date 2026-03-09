/**
 * Sprinta Design System v1.0 — SelectionCard
 * Seçilebilir kart: seviye seçimi, mod, antrenman tipi…
 * States: default | selected | disabled
 * Animation: scale 0.97 on press (120ms)
 */

import React from 'react'
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import { C } from './colors'
import { R } from './radius'
import { S } from './spacing'
import { T } from './typography'

interface SelectionCardProps {
  icon?:     string
  title:     string
  subtitle?: string
  selected?: boolean
  disabled?: boolean
  onPress:   () => void
  style?:    ViewStyle
}

export const SelectionCard: React.FC<SelectionCardProps> = ({
  icon,
  title,
  subtitle,
  selected  = false,
  disabled  = false,
  onPress,
  style,
}) => {
  const scale = useSharedValue(1)
  const anim  = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  return (
    <Animated.View style={[{ flex: 1 }, anim, style]}>
      <TouchableOpacity
        style={[
          s.card,
          selected  && s.cardSelected,
          disabled  && s.cardDisabled,
        ]}
        onPress={onPress}
        onPressIn={() => {
          scale.value = withTiming(0.97, { duration: 120, easing: Easing.out(Easing.quad) })
        }}
        onPressOut={() => {
          scale.value = withTiming(1.00, { duration: 120, easing: Easing.out(Easing.quad) })
        }}
        activeOpacity={1}
        disabled={disabled}
      >
        {icon && <Text style={s.icon}>{icon}</Text>}
        <Text style={[s.title, selected && s.titleSelected]}>{title}</Text>
        {subtitle && (
          <Text style={[s.subtitle, selected && s.subtitleSelected]}>
            {subtitle}
          </Text>
        )}
        {selected && <View style={s.dot} />}
      </TouchableOpacity>
    </Animated.View>
  )
}

const s = StyleSheet.create({
  card: {
    backgroundColor: C.surface,    // #FFFFFF
    borderRadius:    R.lg,          // 16
    borderWidth:     1,
    borderColor:     C.border,      // #E5ECFF
    padding:         S.lg,
    alignItems:      'center',
    gap:             S.xs,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 2 },
    shadowOpacity:   0.06,
    shadowRadius:    8,
    elevation:       2,
  },
  cardSelected: {
    backgroundColor: C.accentGlow,     // rgba(56,182,216,0.15)
    borderColor:     C.accent,          // #38B6D8
    borderWidth:     1.5,
  },
  cardDisabled: { opacity: 0.40 },

  icon:  { fontSize: 22 },
  title: {
    ...T.label,
    color:     C.textSec,      // #6B7A99
    textAlign: 'center',
  },
  titleSelected: {
    color: C.text,             // #1C1E21
  },
  subtitle: {
    ...T.caption,
    color:     C.textHint,
    textAlign: 'center',
  },
  subtitleSelected: {
    color: C.accent,           // #38B6D8
  },
  dot: {
    width:           6,
    height:          6,
    borderRadius:    3,
    backgroundColor: C.accent, // #38B6D8
    marginTop:       S.xs,
  },
})
