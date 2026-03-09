/**
 * ExerciseProgressBar — süre barı + 🔊/🔇 + ekran flash + COMBO banner
 *
 * Flash overlay: absolute, height 1000 → tüm egzersiz alanını kaplar
 *   - Yeşil (#00FF94) → hit
 *   - Altın (#FFD700) → combo
 *   - Kırmızı (#FF3333) → miss
 * Combo banner: COMBO x5 🔥 yazısı yukarıdan kayarak girer, 1.2sn sonra çıkar
 */

import React, { useEffect, useState, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  Easing,
} from 'react-native-reanimated'
import { useAppTheme } from '../../../theme/useAppTheme'
import { useSoundStore } from '../../../stores/soundStore'
import { feedbackEvents } from '../utils/feedbackEvents'

interface Props {
  durationSeconds: number
  onComplete: () => void
}

export const ExerciseProgressBar: React.FC<Props> = ({ durationSeconds, onComplete }) => {
  const t = useAppTheme()
  const { isMuted, toggleMute } = useSoundStore()

  // ── Progress bar ─────────────────────────────────────────────
  const progress = useSharedValue(1)
  useEffect(() => {
    progress.value = withTiming(0, { duration: durationSeconds * 1000, easing: Easing.linear })
    const timeout = setTimeout(onComplete, durationSeconds * 1000)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [durationSeconds])

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%` as `${number}%`,
  }))

  // ── Flash overlay (hit / combo / miss) ───────────────────────
  const hitFlash   = useSharedValue(0)
  const comboFlash = useSharedValue(0)
  const missFlash  = useSharedValue(0)

  const hitFlashStyle   = useAnimatedStyle(() => ({ opacity: hitFlash.value }))
  const comboFlashStyle = useAnimatedStyle(() => ({ opacity: comboFlash.value }))
  const missFlashStyle  = useAnimatedStyle(() => ({ opacity: missFlash.value }))

  // ── Combo banner ─────────────────────────────────────────────
  const [comboLabel, setComboLabel] = useState('')
  const [showCombo, setShowCombo]   = useState(false)
  const comboBannerY = useSharedValue(-60)
  const comboBannerO = useSharedValue(0)
  const comboHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const comboBannerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: comboBannerY.value }],
    opacity: comboBannerO.value,
  }))

  const showComboBanner = (label: string) => {
    setComboLabel(label)
    setShowCombo(true)
    comboBannerY.value = -60
    comboBannerO.value = 0
    comboBannerY.value = withSpring(0, { damping: 14, stiffness: 180 })
    comboBannerO.value = withTiming(1, { duration: 150 })
    if (comboHideTimer.current) clearTimeout(comboHideTimer.current)
    comboHideTimer.current = setTimeout(() => {
      comboBannerO.value = withTiming(0, { duration: 300 })
      comboBannerY.value = withTiming(-60, { duration: 300 }, () => {})
      setTimeout(() => setShowCombo(false), 310)
    }, 1100)
  }

  // ── Feedback event listener ───────────────────────────────────
  useEffect(() => {
    feedbackEvents.on((event, combo) => {
      if (event === 'hit') {
        hitFlash.value = withSequence(
          withTiming(0.18, { duration: 40 }),
          withTiming(0,    { duration: 180 }),
        )
      } else if (event === 'combo') {
        comboFlash.value = withSequence(
          withTiming(0.32, { duration: 50 }),
          withTiming(0,    { duration: 350 }),
        )
        const comboMessages: Record<number, string> = {
          5:  '🔥 Harika! 5 üst üste!',
          10: '⚡ Muhteşem! 10 isabet!',
          15: '🚀 Durdurulamaz! 15!',
          20: '💥 Efsane! 20 ardışık!',
          25: '👑 Şampiyon! 25 üst üste!',
        }
        const label = comboMessages[combo] ?? `🔥 ${combo} ardışık isabet!`
        showComboBanner(label)
      } else if (event === 'miss') {
        missFlash.value = withSequence(
          withTiming(0.14, { duration: 40 }),
          withTiming(0,    { duration: 200 }),
        )
      }
    })
    return () => feedbackEvents.off()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <View style={styles.wrapper}>
      {/* ── Ekran flash overlay'leri ── */}
      <Animated.View pointerEvents="none" style={[styles.flashOverlay, { backgroundColor: '#00FF94' }, hitFlashStyle]}   />
      <Animated.View pointerEvents="none" style={[styles.flashOverlay, { backgroundColor: '#FFD700' }, comboFlashStyle]} />
      <Animated.View pointerEvents="none" style={[styles.flashOverlay, { backgroundColor: '#FF3333' }, missFlashStyle]}  />

      {/* ── COMBO banner ── */}
      {showCombo && (
        <Animated.View style={[styles.comboBanner, comboBannerStyle]} pointerEvents="none">
          <Text style={styles.comboText}>{comboLabel}</Text>
        </Animated.View>
      )}

      {/* ── Progress bar ── */}
      <View style={[styles.container, { backgroundColor: t.colors.border }]}>
        <Animated.View style={[styles.bar, barStyle]} />
      </View>

      {/* ── Mute butonu ── */}
      <TouchableOpacity
        onPress={toggleMute}
        style={styles.muteBtn}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.muteIcon}>{isMuted ? '🔇' : '🔊'}</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           10,
    width:         '100%',
  },

  // Flash overlay — wrapper'ın altına, tüm egzersiz alanını kapsar
  flashOverlay: {
    position:     'absolute',
    top:          0,
    left:         0,
    right:        0,
    height:       1000,
    zIndex:       98,
    borderRadius: 0,
  },

  // Combo banner — ekranın ortasında, yukarıdan iner
  comboBanner: {
    position:        'absolute',
    top:             30,
    alignSelf:       'center',
    left:            0,
    right:           0,
    zIndex:          99,
    alignItems:      'center',
  },
  comboText: {
    fontSize:        28,
    fontWeight:      '900',
    color:           '#FFD700',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    letterSpacing:   1,
  },

  // Progress bar
  container: {
    flex:         1,
    height:       6,
    borderRadius: 3,
    overflow:     'hidden',
  },
  bar: {
    height:          '100%',
    borderRadius:    3,
    backgroundColor: '#00FF94',
  },

  // Mute button
  muteBtn: {
    width:          28,
    height:         28,
    alignItems:     'center',
    justifyContent: 'center',
  },
  muteIcon: { fontSize: 16 },
})
