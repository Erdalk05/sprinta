/**
 * ExerciseProgressBar — Reanimated v4 animasyonlu süre barı
 * Süre dolduğunda onComplete çağrılır.
 */

import React, { useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import { useAppTheme } from '../../../theme/useAppTheme'

interface ExerciseProgressBarProps {
  durationSeconds: number
  onComplete: () => void
}

export const ExerciseProgressBar: React.FC<ExerciseProgressBarProps> = ({
  durationSeconds,
  onComplete,
}) => {
  const t = useAppTheme()
  const progress = useSharedValue(1)

  useEffect(() => {
    progress.value = withTiming(0, {
      duration: durationSeconds * 1000,
      easing: Easing.linear,
    })

    const timeout = setTimeout(onComplete, durationSeconds * 1000)
    return () => {
      clearTimeout(timeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [durationSeconds])

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%` as `${number}%`,
  }))

  return (
    <View style={[styles.container, { backgroundColor: t.colors.border }]}>
      <Animated.View
        style={[
          styles.bar,
          { backgroundColor: '#00FF94' }, // neon yeşil — egzersiz teması, sabit renk
          animatedStyle,
        ]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    width: '100%',
  },
  bar: {
    height: '100%',
    borderRadius: 3,
  },
})
