/**
 * TrainingBottomSheet — Reusable bottom sheet for Egzersiz and Okuma tabs.
 *
 * NOTE: Uses custom Reanimated v4 + Gesture Handler animation.
 * @gorhom/bottom-sheet is NOT used — it is incompatible with Reanimated v4.1.6
 * (crashes with "property is not writable" at runtime).
 *
 * API mirrors @gorhom/bottom-sheet for easy future migration.
 *
 * Snap points: 50% (default) | 90% (on scroll)
 */

import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useCallback,
  useMemo,
} from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native'
import { GestureDetector, Gesture } from 'react-native-gesture-handler'
import Animated, {
  useSharedValue,
  withSpring,
  runOnJS,
  interpolate,
  useAnimatedStyle,
  Extrapolation,
} from 'react-native-reanimated'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { useAppTheme } from '../../theme/useAppTheme'
import type { AppTheme } from '../../theme'
import {
  useVisualMechanicsStore,
} from '../../features/visual-mechanics/store/visualMechanicsStore'
import {
  EXERCISE_CONFIGS,
  EXERCISE_ID_LIST,
} from '../../features/visual-mechanics/constants/exerciseConfig'
import type { ExerciseId } from '../../features/visual-mechanics/constants/exerciseConfig'

// ─── Types ────────────────────────────────────────────────────────
export type SheetType = 'egzersiz' | 'okuma'

export interface TrainingSheetRef {
  open:  () => void
  close: () => void
}

interface Props {
  type:     SheetType
  onOpen?:  () => void
  onClose?: () => void
}

// ─── Constants ────────────────────────────────────────────────────
const { height: SCREEN_H } = Dimensions.get('window')
const Y_CLOSE = SCREEN_H
const Y_HALF  = SCREEN_H * 0.50   // 50% snap
const Y_FULL  = SCREEN_H * 0.08   // ~90% snap
const SPRING  = { damping: 22, stiffness: 220, mass: 0.8 } as const

// ─── Card accent colours (15 colours, cycled) ─────────────────────
const ACCENTS = [
  '#00F5FF', '#00FF94', '#6C3EE8', '#F59E0B', '#EF4444',
  '#3B82F6', '#8B5CF6', '#10B981', '#F97316', '#06B6D4',
  '#84CC16', '#EC4899', '#14B8A6', '#A855F7', '#F43F5E',
]

// ─── Okuma module data ────────────────────────────────────────────
const OKUMA_MODULES = [
  {
    icon: '⚡', label: 'RSVP Okuma',
    subtitle: 'Parça parça · Bionic · Hız kontrolü',
    route: '/exercise/chunk-rsvp',
  },
  {
    icon: '🌊', label: 'Akış Okuma',
    subtitle: 'Satır pacing · Cursor animasyon · Sprint',
    route: '/exercise/flow-reading',
  },
  {
    icon: '📖', label: 'Kelime Haznesi',
    subtitle: 'Bağlamsal kelime öğrenme · LGS / TYT',
    route: '/exercise/vocabulary',
  },
] as const

// ─── Exercise Card (2-column grid) ───────────────────────────────
function ExCard({
  id, index, onPress, s,
}: {
  id: ExerciseId; index: number; onPress: () => void
  s: ReturnType<typeof ts>
}) {
  const cfg    = EXERCISE_CONFIGS[id]
  const accent = ACCENTS[index % ACCENTS.length]
  return (
    <TouchableOpacity
      style={[s.card, { borderColor: accent + '35', flex: 1 }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[s.cardNum, { backgroundColor: accent + '18' }]}>
        <Text style={[s.cardNumTxt, { color: accent }]}>{index + 1}</Text>
      </View>
      <Text style={s.cardTitle} numberOfLines={2}>{cfg.titleTR}</Text>
      <Text style={s.cardDesc}  numberOfLines={2}>{cfg.descriptionTR}</Text>
    </TouchableOpacity>
  )
}

// ─── Okuma Card (2-column grid, same style as ExCard) ────────────
function OkumaCard({
  item, index, onPress, s,
}: {
  item: typeof OKUMA_MODULES[number]
  index: number; onPress: () => void
  s: ReturnType<typeof ts>
}) {
  const accent = ACCENTS[index % ACCENTS.length]
  return (
    <TouchableOpacity
      style={[s.card, { borderColor: accent + '35', flex: 1 }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[s.cardNum, { backgroundColor: accent + '18' }]}>
        <Text style={{ fontSize: 18 }}>{item.icon}</Text>
      </View>
      <Text style={s.cardTitle} numberOfLines={2}>{item.label}</Text>
      <Text style={s.cardDesc}  numberOfLines={2}>{item.subtitle}</Text>
    </TouchableOpacity>
  )
}

// ─── Main Component ───────────────────────────────────────────────
const TrainingBottomSheet = forwardRef<TrainingSheetRef, Props>(
  ({ type, onOpen, onClose }, ref) => {
    const t   = useAppTheme()
    const s   = useMemo(() => ts(t), [t])
    const router = useRouter()
    const setPending = useVisualMechanicsStore((st) => st.setPendingExerciseId)

    const [isOpen, setIsOpen] = useState(false)
    const translateY = useSharedValue(Y_CLOSE)

    // ── Navigation helpers ────────────────────────────────────────
    const navigate = useCallback((route: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      router.push(route as any)
    }, [router])

    const navigateExercise = useCallback((id: ExerciseId) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      setPending(id)
      router.push('/visual-mechanics' as any)
    }, [router, setPending])

    // ── Open / close ──────────────────────────────────────────────
    const open = useCallback(() => {
      setIsOpen(true)
      translateY.value = withSpring(Y_FULL, SPRING)
      onOpen?.()
    }, [onOpen, translateY])

    const close = useCallback(() => {
      translateY.value = withSpring(Y_CLOSE, SPRING, () =>
        runOnJS(setIsOpen)(false),
      )
      onClose?.()
    }, [onClose, translateY])

    useImperativeHandle(ref, () => ({ open, close }), [open, close])

    const snapToFull = useCallback(() => {
      translateY.value = withSpring(Y_FULL, SPRING)
    }, [translateY])

    // ── Pan gesture (drag to snap / close) ────────────────────────
    const pan = Gesture.Pan().onEnd((e) => {
      'worklet'
      const y = translateY.value
      if (e.velocityY > 600 || y > SCREEN_H * 0.78) {
        runOnJS(close)()
      } else if (e.velocityY < -400 || y < SCREEN_H * 0.38) {
        translateY.value = withSpring(Y_FULL, SPRING)
      } else {
        translateY.value = withSpring(Y_HALF, SPRING)
      }
    })

    // ── Animated styles ───────────────────────────────────────────
    const sheetStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: translateY.value }],
    }))

    const backdropStyle = useAnimatedStyle(() => ({
      opacity: interpolate(
        translateY.value,
        [Y_FULL, Y_CLOSE],
        [1, 0],
        Extrapolation.CLAMP,
      ),
    }))

    if (!isOpen) return null

    const title = type === 'egzersiz' ? 'Kartal Gözü' : 'Okuma Modülleri'
    const sub   = type === 'egzersiz' ? '15 egzersiz'      : '3 modül'

    // Build 2-col pairs for both types
    const exPairs: ExerciseId[][] = []
    if (type === 'egzersiz') {
      for (let i = 0; i < EXERCISE_ID_LIST.length; i += 2) {
        exPairs.push(EXERCISE_ID_LIST.slice(i, i + 2))
      }
    }
    const okPairs: (typeof OKUMA_MODULES[number])[][] = []
    if (type === 'okuma') {
      for (let i = 0; i < OKUMA_MODULES.length; i += 2) {
        okPairs.push([...OKUMA_MODULES].slice(i, i + 2))
      }
    }

    return (
      <>
        {/* ── Backdrop — boşluğa tıklanınca kapat ── */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={close}
          activeOpacity={1}
        >
          <Animated.View style={[StyleSheet.absoluteFill, s.backdrop, backdropStyle]} />
        </TouchableOpacity>

        {/* ── Sheet ── */}
        <Animated.View style={[s.sheet, sheetStyle]}>

          {/* Handle (drag target) */}
          <GestureDetector gesture={pan}>
            <View style={s.handleWrap}>
              <View style={s.handle} />
            </View>
          </GestureDetector>

          {/* Header */}
          <View style={s.headerRow}>
            <TouchableOpacity style={s.headerBtn} onPress={close}>
              <Text style={s.headerBtnTxt}>‹ Geri</Text>
            </TouchableOpacity>
            <View style={s.headerMid}>
              <Text style={s.headerTitle}>{title}</Text>
              <Text style={s.headerSub}>{sub}</Text>
            </View>
            <TouchableOpacity style={s.headerBtn} onPress={close}>
              <Text style={s.headerBtnTxt}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={s.content}
            onScrollBeginDrag={snapToFull}
          >
            {/* ── Günlük Antrenman hero kartı (sadece egzersiz sheet'inde) ── */}
            {type === 'egzersiz' && (
              <TouchableOpacity
                style={s.dailyHero}
                onPress={() => navigate('/daily-training')}
                activeOpacity={0.85}
              >
                <View style={s.dailyLeft}>
                  <Text style={s.dailyIcon}>👁️</Text>
                  <View>
                    <Text style={s.dailyTitle}>Günlük Antrenman</Text>
                    <Text style={s.dailySub}>AI seçimi · 4 egzersiz · Zayıf alana odak</Text>
                  </View>
                </View>
                <Text style={s.dailyArrow}>▶</Text>
              </TouchableOpacity>
            )}

            {type === 'egzersiz'
              ? exPairs.map((pair, rowIdx) => (
                  <View key={rowIdx} style={s.gridRow}>
                    {pair.map((id, colIdx) => (
                      <ExCard
                        key={id}
                        id={id}
                        index={rowIdx * 2 + colIdx}
                        onPress={() => navigateExercise(id)}
                        s={s}
                      />
                    ))}
                    {pair.length === 1 && <View style={{ flex: 1 }} />}
                  </View>
                ))
              : okPairs.map((pair, rowIdx) => (
                  <View key={rowIdx} style={s.gridRow}>
                    {pair.map((item, colIdx) => (
                      <OkumaCard
                        key={item.route}
                        item={item}
                        index={rowIdx * 2 + colIdx}
                        onPress={() => navigate(item.route)}
                        s={s}
                      />
                    ))}
                    {pair.length === 1 && <View style={{ flex: 1 }} />}
                  </View>
                ))}
          </ScrollView>
        </Animated.View>
      </>
    )
  },
)

TrainingBottomSheet.displayName = 'TrainingBottomSheet'
export default TrainingBottomSheet

// ─── Styles ───────────────────────────────────────────────────────
function ts(t: AppTheme) {
  return StyleSheet.create({
    // Backdrop
    backdrop: {
      backgroundColor: t.isDark ? 'rgba(0,0,0,0.72)' : 'rgba(11,20,26,0.62)',
      zIndex: 100,
    },

    // Sheet container
    sheet: {
      position:        'absolute',
      left:            0,
      right:           0,
      bottom:          0,
      height:          SCREEN_H * 0.92,
      backgroundColor: t.colors.surface,
      borderTopLeftRadius:  24,
      borderTopRightRadius: 24,
      zIndex: 101,
      shadowColor:  '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: t.isDark ? 0.5 : 0.12,
      shadowRadius: 20,
      elevation: 24,
    },

    // Handle bar
    handleWrap: {
      alignItems:    'center',
      paddingTop:    12,
      paddingBottom: 8,
    },
    handle: {
      width:         40,
      height:        4,
      borderRadius:  2,
      backgroundColor: t.colors.divider,
    },

    // Header
    headerRow: {
      flexDirection:     'row',
      alignItems:        'center',
      paddingHorizontal: 16,
      paddingBottom:     12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: t.colors.divider,
    },
    headerBtn: {
      paddingHorizontal: 8,
      paddingVertical:   6,
      minWidth: 52,
    },
    headerBtnTxt: {
      fontSize:   14,
      color:      t.colors.primary,
      fontWeight: '600',
    },
    headerMid:   { flex: 1, alignItems: 'center' },
    headerTitle: { fontSize: 17, fontWeight: '800', color: t.colors.text },
    headerSub:   { fontSize: 11, color: t.colors.textHint, marginTop: 1 },

    // Content area
    content: {
      paddingHorizontal: 14,
      paddingVertical:   14,
      gap:               10,
    },

    // Günlük Antrenman hero kartı
    dailyHero: {
      flexDirection:    'row',
      alignItems:       'center',
      justifyContent:   'space-between',
      backgroundColor:  t.isDark ? '#0E2A1A' : '#E8F8EF',
      borderRadius:     18,
      padding:          16,
      borderWidth:      1.5,
      borderColor:      'rgba(37,211,102,0.35)',
      marginBottom:     2,
    },
    dailyLeft:  { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    dailyIcon:  { fontSize: 28 },
    dailyTitle: {
      fontSize: 15, fontWeight: '800', color: t.colors.text, marginBottom: 3,
    },
    dailySub:   { fontSize: 11, color: t.colors.textHint },
    dailyArrow: { fontSize: 20, color: '#1877F2', fontWeight: '900' },

    // 2-column grid row
    gridRow: {
      flexDirection: 'row',
      gap:           10,
    },

    // Exercise card
    card: {
      backgroundColor: t.colors.surface,
      borderWidth:     1.5,
      borderRadius:    16,
      padding:         14,
      minHeight:       118,
    },
    cardNum: {
      width:          32,
      height:         32,
      borderRadius:   9,
      alignItems:     'center',
      justifyContent: 'center',
      marginBottom:   10,
    },
    cardNumTxt: { fontSize: 14, fontWeight: '800' },
    cardTitle:  { fontSize: 13, fontWeight: '700', color: t.colors.text, marginBottom: 4 },
    cardDesc:   { fontSize: 11, color: t.colors.textSub, lineHeight: 15 },

  })
}
