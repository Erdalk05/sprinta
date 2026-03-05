/**
 * ModulesBottomSheet — Custom Implementation
 *
 * @gorhom/bottom-sheet Reanimated v4 ile uyumsuz olduğu için
 * react-native-gesture-handler + react-native-reanimated + expo-blur
 * kullanılarak sıfırdan yazıldı.
 *
 * API:
 *   ref.snapToIndex(0)  → 45% aç
 *   ref.snapToIndex(1)  → 90% genişlet
 *   ref.close()         → kapat
 */
import React, {
  forwardRef, useImperativeHandle,
  useCallback, useMemo, useState,
} from 'react'
import {
  View, Text, TouchableOpacity, Pressable,
  StyleSheet, Dimensions, ScrollView,
} from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, runOnJS, interpolate, Extrapolation,
} from 'react-native-reanimated'

import * as Haptics from 'expo-haptics'
import { useAppTheme } from '../../theme/useAppTheme'
import type { AppTheme } from '../../theme'

// ─── Public ref API ───────────────────────────────────────────────
export interface ModulesSheetRef {
  snapToIndex: (index: 0 | 1) => void
  close: () => void
}

// ─── Tipler ───────────────────────────────────────────────────────
export interface SheetModule {
  code:        string
  label:       string
  subtitle:    string
  icon:        string
  duration:    string
  route:       string
  description: string
}

interface Props {
  modules:    SheetModule[]
  title:      string
  onNavigate: (route: string) => void
  onReset:    () => void
}

type SheetMode = 'grid' | 'detail'

// ─── Sabitler ─────────────────────────────────────────────────────
const { height: SCREEN_H, width: SCREEN_W } = Dimensions.get('window')

// Sheet translateY değerleri (ekran üstünden aşağıya mesafe)
const Y_FULL  = SCREEN_H * 0.08   // 90% görünür
const Y_HALF  = SCREEN_H * 0.55   // 45% görünür
const Y_CLOSE = SCREEN_H          // tamamen gizli

const GUTTER   = 16
const GAP      = 12
const CARD_W   = (SCREEN_W - GUTTER * 2 - GAP) / 2
const BRAND_BLUE = '#1877F2'

const SPRING       = { damping: 22, stiffness: 220, mass: 0.85 }
const SPRING_CLOSE = { damping: 26, stiffness: 300, mass: 0.75 }

// ─── Grid Kartı ───────────────────────────────────────────────────
function ModuleCard({
  mod, onPress, s,
}: {
  mod: SheetModule; onPress: () => void; s: ReturnType<typeof makeStyles>
}) {
  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.78}>
      <View style={s.cardIconBox}>
        <Text style={s.cardIcon}>{mod.icon}</Text>
      </View>
      <Text style={s.cardLabel} numberOfLines={2}>{mod.label}</Text>
      <Text style={s.cardSub}   numberOfLines={2}>{mod.subtitle}</Text>
      <View style={s.cardPill}>
        <Text style={s.cardDur}>⏱ {mod.duration}</Text>
      </View>
    </TouchableOpacity>
  )
}

// ─── Ana Bileşen ──────────────────────────────────────────────────
const ModulesBottomSheet = forwardRef<ModulesSheetRef, Props>(
  ({ modules, title, onNavigate, onReset }, ref) => {
    const t = useAppTheme()
    const s = useMemo(() => makeStyles(t), [t])

    const [mode,   setMode]   = useState<SheetMode>('grid')
    const [selIdx, setSelIdx] = useState(0)
    const [isOpen, setIsOpen] = useState(false)

    // Animate ile kontrol edilen translateY
    const translateY = useSharedValue(Y_CLOSE)
    const startY     = useSharedValue(Y_CLOSE)

    // ── Kapatma ────────────────────────────────────────────────
    const closeSheet = useCallback(() => {
      translateY.value = withSpring(Y_CLOSE, SPRING_CLOSE, () => {
        runOnJS(setIsOpen)(false)
        runOnJS(setMode)('grid')
        runOnJS(setSelIdx)(0)
        runOnJS(onReset)()
      })
    }, [translateY, onReset])

    // ── Imperative handle ──────────────────────────────────────
    useImperativeHandle(ref, () => ({
      snapToIndex: (index: 0 | 1) => {
        setIsOpen(true)
        translateY.value = withSpring(index === 0 ? Y_HALF : Y_FULL, SPRING)
      },
      close: closeSheet,
    }), [translateY, closeSheet])

    // ── Pan gesture (handle üzerinde sürükleme) ────────────────
    const panGesture = Gesture.Pan()
      .onStart(() => {
        startY.value = translateY.value
      })
      .onUpdate((e) => {
        const next = startY.value + e.translationY
        // Yukarı doğru limit: Y_FULL'un %70'ine kadar
        translateY.value = Math.max(Y_FULL * 0.7, next)
      })
      .onEnd((e) => {
        const vel = e.velocityY
        const cur = translateY.value

        // Hızlı aşağı kaydırma → kapat
        if (vel > 800) {
          runOnJS(closeSheet)()
          return
        }

        // En yakın snap noktasına tuttur
        const dFull  = Math.abs(cur - Y_FULL)
        const dHalf  = Math.abs(cur - Y_HALF)
        const dClose = Math.abs(cur - Y_CLOSE)

        if (dClose < dHalf && dClose < dFull) {
          runOnJS(closeSheet)()
        } else if (dHalf <= dFull) {
          translateY.value = withSpring(Y_HALF, SPRING)
        } else {
          translateY.value = withSpring(Y_FULL, SPRING)
        }
      })

    // ── Animated stiller ───────────────────────────────────────
    const sheetAnim = useAnimatedStyle(() => ({
      transform: [{ translateY: translateY.value }],
    }))

    const backdropAnim = useAnimatedStyle(() => ({
      opacity: interpolate(
        translateY.value,
        [Y_CLOSE, Y_HALF, Y_FULL],
        [0, 0.55, 0.70],
        Extrapolation.CLAMP,
      ),
    }))

    // ── Sheet mantığı ──────────────────────────────────────────
    const openDetail = useCallback((idx: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      setSelIdx(idx)
      setMode('detail')
      translateY.value = withSpring(Y_FULL, SPRING)
    }, [translateY])

    const goBackToGrid = useCallback(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      setMode('grid')
      translateY.value = withSpring(Y_HALF, SPRING)
    }, [translateY])

    const handleClose = useCallback(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      closeSheet()
    }, [closeSheet])

    const handleNavigate = useCallback(() => {
      const route = modules[selIdx]?.route
      if (!route) return
      closeSheet()
      onNavigate(route)
    }, [modules, selIdx, closeSheet, onNavigate])

    const goPrev = useCallback(() => {
      Haptics.selectionAsync()
      setSelIdx((i) => (i - 1 + modules.length) % modules.length)
    }, [modules.length])

    const goNext = useCallback(() => {
      Haptics.selectionAsync()
      setSelIdx((i) => (i + 1) % modules.length)
    }, [modules.length])

    const selectedMod = modules[selIdx]
    const headerTitle = mode === 'grid' ? title : (selectedMod?.label ?? '')

    // ── Grid (2-kolon, map — 15 modüle kadar) ─────────────────
    const renderGrid = () => {
      const rows: SheetModule[][] = []
      for (let i = 0; i < modules.length; i += 2) {
        rows.push(modules.slice(i, i + 2))
      }
      return (
        <View style={s.gridWrap}>
          {rows.map((row, rIdx) => (
            <View key={rIdx} style={s.gridRow}>
              {row.map((mod, cIdx) => (
                <ModuleCard
                  key={mod.code}
                  mod={mod}
                  onPress={() => openDetail(rIdx * 2 + cIdx)}
                  s={s}
                />
              ))}
              {row.length === 1 && <View style={[s.card, s.cardPhantom]} />}
            </View>
          ))}
        </View>
      )
    }

    // ── Detay ─────────────────────────────────────────────────
    const renderDetail = () => {
      if (!selectedMod) return null
      return (
        <View style={s.detailWrap}>
          <View style={s.detailIconBox}>
            <Text style={s.detailIcon}>{selectedMod.icon}</Text>
          </View>
          <Text style={s.detailLabel}>{selectedMod.label}</Text>
          <Text style={s.detailSub}>{selectedMod.subtitle}</Text>
          <Text style={s.detailDur}>⏱ {selectedMod.duration}</Text>
          <Text style={s.detailDesc}>{selectedMod.description}</Text>

          <TouchableOpacity style={s.startBtn} onPress={handleNavigate} activeOpacity={0.85}>
            <Text style={s.startBtnTxt}>⚡  Başla</Text>
          </TouchableOpacity>

          <View style={s.navRow}>
            <TouchableOpacity style={s.navBtn} onPress={goPrev} activeOpacity={0.7}>
              <Text style={s.navArrow}>‹</Text>
              <Text style={s.navBtnTxt}>Önceki</Text>
            </TouchableOpacity>
            <Text style={s.navCounter}>{selIdx + 1} / {modules.length}</Text>
            <TouchableOpacity style={s.navBtn} onPress={goNext} activeOpacity={0.7}>
              <Text style={s.navBtnTxt}>Sonraki</Text>
              <Text style={s.navArrow}>›</Text>
            </TouchableOpacity>
          </View>
        </View>
      )
    }

    // Kapalıyken hiç render etme
    if (!isOpen) return null

    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">

        {/* ── Blur Backdrop ─────────────────────────────────── */}
        <Animated.View
          style={[StyleSheet.absoluteFill, backdropAnim]}
          pointerEvents={isOpen ? 'auto' : 'none'}
        >
          <View style={[StyleSheet.absoluteFill, s.backdropBg]} />
          <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        </Animated.View>

        {/* ── Sheet ─────────────────────────────────────────── */}
        <Animated.View style={[s.sheet, sheetAnim]}>

          {/* Handle — sürüklenebilir alan */}
          <GestureDetector gesture={panGesture}>
            <View style={s.handleArea}>
              <View style={s.handleBar} />
            </View>
          </GestureDetector>

          {/* Sticky Header */}
          <View style={s.header}>
            {mode === 'detail' ? (
              <TouchableOpacity onPress={goBackToGrid} style={s.hBtn} hitSlop={10}>
                <Text style={s.hBtnIco}>‹</Text>
              </TouchableOpacity>
            ) : (
              <View style={s.hBtn} />
            )}
            <Text style={s.hTitle} numberOfLines={1}>{headerTitle}</Text>
            <TouchableOpacity onPress={handleClose} style={s.hBtn} hitSlop={10}>
              <Text style={s.hBtnIco}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Scrollable içerik */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={s.scrollContent}
            bounces={false}
          >
            {mode === 'grid'   && renderGrid()}
            {mode === 'detail' && renderDetail()}
          </ScrollView>
        </Animated.View>
      </View>
    )
  }
)

ModulesBottomSheet.displayName = 'ModulesBottomSheet'
export default ModulesBottomSheet

// ─── Stiller ─────────────────────────────────────────────────────
function makeStyles(t: AppTheme) {
  return StyleSheet.create({
    // Backdrop
    backdropBg: {
      backgroundColor: t.isDark ? 'rgba(0,0,0,0.72)' : 'rgba(11,20,26,0.65)',
    },

    // Sheet kapsayıcı
    sheet: {
      position:           'absolute',
      left:               0,
      right:              0,
      top:                0,
      height:             SCREEN_H * 0.95,
      backgroundColor:    t.colors.surface,
      borderTopLeftRadius:  22,
      borderTopRightRadius: 22,
      ...t.shadow.lg,
    },

    // Handle
    handleArea: {
      alignItems:     'center',
      justifyContent: 'center',
      paddingVertical: 10,
    },
    handleBar: {
      width:        40,
      height:       4,
      borderRadius: 2,
      backgroundColor: t.colors.textHint,
      opacity:      0.5,
    },

    // Sticky header
    header: {
      flexDirection:     'row',
      alignItems:        'center',
      paddingHorizontal: 8,
      paddingBottom:     12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: t.colors.border,
    },
    hBtn:    { width: 48, height: 40, alignItems: 'center', justifyContent: 'center' },
    hBtnIco: { fontSize: 22, color: t.colors.textSub },
    hTitle: {
      flex:       1,
      textAlign:  'center',
      fontSize:   16,
      fontWeight: '700',
      color:      t.colors.text,
    },

    scrollContent: { paddingBottom: 40 },

    // Grid
    gridWrap: { padding: GUTTER, paddingTop: 14 },
    gridRow:  { flexDirection: 'row', gap: GAP, marginBottom: GAP },

    card: {
      width:           CARD_W,
      backgroundColor: t.colors.surface,
      borderRadius:    16,
      padding:         14,
      borderWidth:     1.5,
      borderColor:     t.colors.border,
      ...t.shadow.md,
    },
    cardPhantom: {
      backgroundColor: 'transparent',
      borderColor:     'transparent',
      shadowOpacity:   0,
      elevation:       0,
    },
    cardIconBox: {
      width:           48,
      height:          48,
      borderRadius:    14,
      backgroundColor: t.colors.greenLight,
      alignItems:      'center',
      justifyContent:  'center',
      marginBottom:    10,
    },
    cardIcon:  { fontSize: 24 },
    cardLabel: { fontSize: 14, fontWeight: '700', color: t.colors.text, marginBottom: 4 },
    cardSub:   { fontSize: 11, color: t.colors.textSub, marginBottom: 8, lineHeight: 15 },
    cardPill: {
      alignSelf:         'flex-start',
      backgroundColor:   BRAND_BLUE + '18',
      borderRadius:      999,
      paddingHorizontal: 8,
      paddingVertical:   3,
    },
    cardDur:   { fontSize: 10, fontWeight: '600', color: BRAND_BLUE },

    // Detail
    detailWrap: {
      alignItems:        'center',
      paddingHorizontal: 24,
      paddingTop:        28,
    },
    detailIconBox: {
      width:           88,
      height:          88,
      borderRadius:    26,
      backgroundColor: t.colors.greenLight,
      borderWidth:     2,
      borderColor:     BRAND_BLUE + '30',
      alignItems:      'center',
      justifyContent:  'center',
      marginBottom:    18,
    },
    detailIcon:  { fontSize: 44 },
    detailLabel: {
      fontSize: 22, fontWeight: '800', color: t.colors.text,
      textAlign: 'center', marginBottom: 8,
    },
    detailSub: {
      fontSize: 13, color: t.colors.textSub,
      textAlign: 'center', marginBottom: 6,
    },
    detailDur: {
      fontSize: 12, color: BRAND_BLUE, fontWeight: '700', marginBottom: 18,
    },
    detailDesc: {
      fontSize: 14, color: t.colors.text,
      lineHeight: 22, textAlign: 'center', marginBottom: 28,
    },
    startBtn: {
      backgroundColor:   BRAND_BLUE,
      borderRadius:      999,
      paddingHorizontal: 36,
      paddingVertical:   14,
      marginBottom:      24,
      ...t.shadow.md,
    },
    startBtnTxt: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },

    navRow: {
      flexDirection:     'row',
      alignItems:        'center',
      justifyContent:    'space-between',
      width:             '100%',
      paddingHorizontal: 8,
    },
    navBtn:     { flexDirection: 'row', alignItems: 'center', padding: 8, gap: 4 },
    navArrow:   { fontSize: 22, color: BRAND_BLUE, fontWeight: '700' },
    navBtnTxt:  { fontSize: 14, fontWeight: '700', color: BRAND_BLUE },
    navCounter: { fontSize: 13, color: t.colors.textHint },
  })
}
