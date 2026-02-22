import React, { useEffect, useRef } from 'react'
import { Animated, StyleSheet, Text, View, ViewStyle } from 'react-native'
import { colors } from '../../theme/colors'
import { typography } from '../../theme/typography'

interface ProgressBarProps {
  progress: number          // 0–1
  color?: string
  showPercent?: boolean
  height?: number
  style?: ViewStyle
  trackColor?: string
}

export function ProgressBar({
  progress,
  color = colors.primary,
  showPercent = false,
  height = 8,
  style,
  trackColor = 'rgba(0,0,0,0.08)',
}: ProgressBarProps) {
  const anim = useRef(new Animated.Value(0)).current
  const clampedProgress = Math.min(1, Math.max(0, progress))

  useEffect(() => {
    Animated.timing(anim, {
      toValue: clampedProgress,
      duration: 600,
      useNativeDriver: false,
    }).start()
  }, [clampedProgress])

  return (
    <View style={[s.row, style]}>
      <View style={[s.track, { height, backgroundColor: trackColor, borderRadius: height / 2 }]}>
        <Animated.View
          style={[
            s.fill,
            {
              height,
              borderRadius: height / 2,
              backgroundColor: color,
              width: anim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
      {showPercent && (
        <Text style={s.pct}>{Math.round(clampedProgress * 100)}%</Text>
      )}
    </View>
  )
}

const s = StyleSheet.create({
  row:  { flexDirection: 'row', alignItems: 'center' },
  track: { flex: 1, overflow: 'hidden' },
  fill:  {},
  pct: {
    ...(typography.captionMedium as object),
    color: colors.textSecondary,
    marginLeft: 8,
    minWidth: 32,
    textAlign: 'right',
  },
})
