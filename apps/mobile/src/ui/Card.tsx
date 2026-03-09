/**
 * Sprinta Design System v1.0 — Card
 *
 * variant:
 *   default  → beyaz kart, #E5ECFF border, yumuşak gölge
 *   elevated → daha belirgin gölge
 *   accent   → mavi aksan border
 *   dark     → koyu kart (immersive ekranlar için)
 */

import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { C } from './colors'
import { R } from './radius'
import { S } from './spacing'
import { SH } from './shadows'

interface CardProps {
  children:  React.ReactNode
  style?:    ViewStyle
  variant?:  'default' | 'elevated' | 'accent' | 'dark'
  padding?:  number
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  padding = S.lg,
}) => (
  <View
    style={[
      s.base,
      { padding },
      variant === 'elevated' && s.elevated,
      variant === 'accent'   && s.accent,
      variant === 'dark'     && s.dark,
      style,
    ]}
  >
    {children}
  </View>
)

const s = StyleSheet.create({
  base: {
    backgroundColor: C.surface,      // #FFFFFF
    borderRadius:    R.lg,            // 16
    borderWidth:     1,
    borderColor:     C.border,        // #E5ECFF
    ...SH.card,                       // 0 8px 20px rgba(0,0,0,0.08)
  },
  elevated: {
    ...SH.card,
    shadowOpacity: 0.12,
    shadowRadius:  24,
    elevation:     6,
  },
  accent: {
    borderColor: C.borderAccent,
    borderWidth: 1.5,
  },
  dark: {
    backgroundColor: C.surfaceAlt,   // #162449
    borderColor:     'rgba(255,255,255,0.08)',
  },
})
