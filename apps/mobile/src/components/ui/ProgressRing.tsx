import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import { theme } from '../../theme'

interface Props {
  value: number      // 0-100
  size?: number
  stroke?: number
  color?: string
  label?: string
  sublabel?: string
}

export function ProgressRing({
  value, size = 80, stroke = 8, color = theme.colors.primary, label, sublabel,
}: Props) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const filled = circ * (Math.min(value, 100) / 100)
  const cx = size / 2
  const cy = size / 2

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle cx={cx} cy={cy} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none" />
        <Circle
          cx={cx} cy={cy} r={r}
          stroke={color} strokeWidth={stroke} fill="none"
          strokeDasharray={`${filled} ${circ}`}
          strokeLinecap="round"
          rotation="-90" origin={`${cx},${cy}`}
        />
      </Svg>
      {label !== undefined && (
        <View style={styles.center}>
          <Text style={[styles.label, { color }]}>{label}</Text>
          {sublabel && <Text style={styles.sub}>{sublabel}</Text>}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  center: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 16, fontWeight: '800' },
  sub: { fontSize: 9, color: theme.colors.textHint, marginTop: 1 },
})
