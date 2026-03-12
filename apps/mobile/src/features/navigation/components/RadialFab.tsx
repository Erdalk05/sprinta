/**
 * EnergyRadialFAB — Sport Premium Edition
 *
 * Menü kategorileri kısayolu · 180° yayı (sol→üst→sağ)
 * energyGreen FAB · 2 sn'de bir nabız
 * Reanimated 4 withSpring (damping 12, stiffness 120)
 * iOS / Android / Web uyumlu
 */
import React, { useState, useCallback, useEffect, useRef } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  Pressable, Platform, BackHandler, Animated as RNAnimated,
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  type SharedValue,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'
import type { AppTheme } from '../../../theme'

// ─── Sabitler ─────────────────────────────────────────────────────
const FAB_SIZE  = 62
const MINI_SIZE = 58           // daire içinde ikon + label sığsın diye büyütüldü
const RADIUS    = 112          // px — büyük daire için biraz daha geniş yay

const FAB_NAVY  = '#0D1B3E'   // Ana FAB rengi
const MINI_BG   = '#162444'   // Mini buton arka planı
const TEAL_GLOW = '#00D4AA'   // Nabız hale + gölge rengi

// 6 item · 180° yay: -90° (sol) → -54 → -18 → 18 → 54 → 90° (sağ)
// step = 180 / (6-1) = 36°
const ANGLES_DEG = [-90, -54, -18, 18, 54, 90] as const

// ─── Menü kategorileri ─────────────────────────────────────────────
const MENU_ACTIONS = [
  { id: 'aicoach',  icon: '🤖', label: 'AI Koç',   route: '/ai-coach'          },
  { id: 'training', icon: '💪', label: 'Çalış',    route: '/(tabs)/sessions'   },
  { id: 'stats',    icon: '📊', label: 'İstatistik',route: '/(tabs)/progress'   },
  { id: 'library',  icon: '📚', label: 'Kütüphane', route: '/content-library'   },
  { id: 'achieve',  icon: '🏆', label: 'Başarılar', route: '/(tabs)/progress'   },
  { id: 'programs', icon: '🎯', label: 'Program',   route: '/program/select'    },
] as const

function degToRad(d: number): number { return (d * Math.PI) / 180 }

// ─── Mini Buton ───────────────────────────────────────────────────
interface MiniProps {
  open:    SharedValue<number>
  icon:    string
  label:   string
  tx:      number
  ty:      number
  onPress: () => void
}

function MiniButton({ open, icon, label, tx, ty, onPress }: MiniProps) {
  const anim = useAnimatedStyle(() => ({
    opacity: interpolate(open.value, [0, 0.25, 1], [0, 0, 1]),
    transform: [
      { translateX: interpolate(open.value, [0, 1], [0, tx]) },
      { translateY: interpolate(open.value, [0, 1], [0, ty]) },
      { scale:      interpolate(open.value, [0, 1], [0.35, 1]) },
    ],
  }))

  return (
    <Animated.View style={[s.miniWrap, anim]} pointerEvents="box-none">
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.80}
        style={s.miniCircle}
        accessibilityLabel={label}
        accessibilityRole="button"
      >
        <Text style={s.miniIcon}>{icon}</Text>
        <Text style={s.miniLabel} numberOfLines={1}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

// ─── Energy Radial FAB ────────────────────────────────────────────
interface RadialFabProps {
  theme:        AppTheme
  tabBarHeight: number
}

export function RadialFab({ theme: t, tabBarHeight }: RadialFabProps) {
  const router  = useRouter()
  const open    = useSharedValue(0)
  const [isOpen, setIsOpen] = useState(false)

  // ── Nabız animasyonu (RN Animated — arka planda sürekli döner) ──
  const pulse = useRef(new RNAnimated.Value(1)).current
  useEffect(() => {
    const animation = RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(pulse, { toValue: 1.14, duration: 350, useNativeDriver: true }),
        RNAnimated.timing(pulse, { toValue: 1.00, duration: 350, useNativeDriver: true }),
        RNAnimated.delay(1300),
      ]),
    )
    animation.start()
    return () => animation.stop()
  }, [])

  // ── Toggle ───────────────────────────────────────────────────────
  const toggle = useCallback(() => {
    const next = !isOpen
    setIsOpen(next)
    open.value = withSpring(next ? 1 : 0, {
      damping:   12,
      stiffness: 120,
      mass:      0.85,
    })
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
  }, [isOpen, open])

  const closeMenu = useCallback(() => {
    if (!isOpen) return
    setIsOpen(false)
    open.value = withTiming(0, { duration: 200 })
  }, [isOpen, open])

  // ── Android geri tuşu ───────────────────────────────────────────
  useEffect(() => {
    if (Platform.OS !== 'android') return
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isOpen) { closeMenu(); return true }
      return false
    })
    return () => sub.remove()
  }, [isOpen, closeMenu])

  // ── Aksiyon ─────────────────────────────────────────────────────
  const handleAction = useCallback((route: string) => {
    setIsOpen(false)
    open.value = withTiming(0, { duration: 180 })
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setTimeout(() => router.push(route as any), 120)
  }, [open, router])

  // ── Animasyon stilleri ──────────────────────────────────────────
  const overlayAnim = useAnimatedStyle(() => ({
    opacity: interpolate(open.value, [0, 1], [0, 0.45]),
  }))

  const fabRotateAnim = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${interpolate(open.value, [0, 1], [0, 45])}deg` },
    ],
  }))

  // ── Mini buton koordinatları (6 item) ───────────────────────────
  const miniPositions = ANGLES_DEG.map((deg) => {
    const rad = degToRad(deg)
    return {
      tx: RADIUS * Math.sin(rad),
      ty: -(RADIUS * Math.cos(rad)),
    }
  })

  return (
    <>
      {/* ── Dim Overlay ─────────────────────────────────────────── */}
      <Animated.View
        style={[StyleSheet.absoluteFill, s.overlay, overlayAnim]}
        pointerEvents={isOpen ? 'auto' : 'none'}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={closeMenu}
          accessibilityLabel="Menüyü kapat"
        />
      </Animated.View>

      {/* ── FAB Katmanı ─────────────────────────────────────────── */}
      <View
        style={[s.outerRow, { bottom: tabBarHeight }]}
        pointerEvents="box-none"
      >
        <View style={s.anchor} pointerEvents="box-none">

          {/* Menü kategorisi kısayolları */}
          {MENU_ACTIONS.map((item, i) => (
            <MiniButton
              key={item.id}
              open={open}
              icon={item.icon}
              label={item.label}
              tx={miniPositions[i].tx}
              ty={miniPositions[i].ty}
              onPress={() => handleAction(item.route)}
            />
          ))}

          {/* Ana FAB — nabız + döner ikon */}
          <RNAnimated.View
            style={[
              s.pulseRing,
              {
                transform: [{ scale: pulse }],
                opacity:   isOpen ? 0 : 1,
              },
            ]}
            pointerEvents="none"
          />

          <TouchableOpacity
            onPress={toggle}
            activeOpacity={0.85}
            style={s.fabTouch}
            accessibilityLabel={isOpen ? 'Menüyü kapat' : 'Egzersiz menüsünü aç'}
            accessibilityRole="button"
          >
            <Animated.View
              style={[
                s.fabInner,
                fabRotateAnim,
              ]}
            >
              <Text style={s.fabIcon}>{isOpen ? '✕' : '⚡'}</Text>
            </Animated.View>
          </TouchableOpacity>

        </View>
      </View>
    </>
  )
}

// ─── Stiller ─────────────────────────────────────────────────────
const s = StyleSheet.create({
  overlay: {
    backgroundColor: FAB_NAVY,
    zIndex: 90,
  },

  outerRow: {
    position:   'absolute',
    left:       0,
    right:      0,
    alignItems: 'center',
    zIndex:     100,
  },

  anchor: {
    width:  0,
    height: 0,
  },

  // Mini buton — ikon + label daire içinde birlikte
  miniWrap: {
    position: 'absolute',
    top:      -(MINI_SIZE / 2),
    left:     -(MINI_SIZE / 2),
  },
  miniCircle: {
    width:           MINI_SIZE,
    height:          MINI_SIZE,
    borderRadius:    MINI_SIZE / 2,
    backgroundColor: MINI_BG,
    alignItems:      'center',
    justifyContent:  'center',
    gap:             2,
    elevation:       8,
    shadowColor:     FAB_NAVY,
    shadowOffset:    { width: 0, height: 3 },
    shadowOpacity:   0.35,
    shadowRadius:    8,
    borderWidth:     1,
    borderColor:     TEAL_GLOW + '30',
  },
  miniIcon:  { fontSize: 18 },
  miniLabel: {
    fontSize:      9,
    fontWeight:    '700',
    color:         '#FFFFFF',
    letterSpacing: 0.2,
    textAlign:     'center',
    maxWidth:      MINI_SIZE - 8,
  },

  // Nabız halka
  pulseRing: {
    position:        'absolute',
    top:             -(FAB_SIZE / 2) - 8,
    left:            -(FAB_SIZE / 2) - 8,
    width:           FAB_SIZE + 16,
    height:          FAB_SIZE + 16,
    borderRadius:    (FAB_SIZE + 16) / 2,
    backgroundColor: TEAL_GLOW + '22',
  },

  // Ana FAB
  fabTouch: {
    position: 'absolute',
    top:      -(FAB_SIZE / 2),
    left:     -(FAB_SIZE / 2),
  },
  fabInner: {
    width:           FAB_SIZE,
    height:          FAB_SIZE,
    borderRadius:    FAB_SIZE / 2,
    backgroundColor: FAB_NAVY,
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     3,
    borderColor:     TEAL_GLOW + '60',
    elevation:       14,
    shadowColor:     TEAL_GLOW,
    shadowOffset:    { width: 0, height: 0 },
    shadowOpacity:   0.55,
    shadowRadius:    16,
  },
  fabIcon: { fontSize: 24 },
})
