import { useRef, useState } from 'react'
import { Tabs } from 'expo-router'
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { useAppTheme } from '../../src/theme/useAppTheme'
import type { AppTheme } from '../../src/theme'
import * as Haptics from 'expo-haptics'
import { RadialFab } from '../../src/features/navigation/components/RadialFab'
import TrainingBottomSheet from '../../src/components/training/TrainingBottomSheet'
import type { TrainingSheetRef } from '../../src/components/training/TrainingBottomSheet'

// ─── Eagle Eye Icon (Kartal Gözü) ────────────────────────────────
// Sistem emojisi 👁️ — Apple retina kalitesi, aktifken altın glow
function EagleEyeIcon({ active }: { active: boolean }) {
  return (
    <View style={{
      opacity:       active ? 1.0 : 0.38,
      alignItems:    'center',
      justifyContent: 'center',
      shadowColor:   '#D97706',
      shadowOffset:  { width: 0, height: 0 },
      shadowRadius:  active ? 10 : 0,
      shadowOpacity: active ? 0.80 : 0,
      elevation:     active ? 10 : 0,
    }}>
      <Text style={{ fontSize: 26, lineHeight: 30 }}>👁️</Text>
    </View>
  )
}

// ─── Tab Bar yüksekliği ───────────────────────────────────────────
const BAR_H = Platform.OS === 'ios' ? 80 : 66

// ─── Custom Sprinta Tab Bar ───────────────────────────────────────
interface SprintaTabBarProps extends BottomTabBarProps {
  onOpenEgzersiz:  () => void
  onNavigateCalis: () => void
  egzersizActive:  boolean
  okumaActive:     boolean
}

function SprintaTabBar({
  state,
  navigation,
  onOpenEgzersiz,
  onNavigateCalis,
  egzersizActive,
  okumaActive,
}: SprintaTabBarProps) {
  const t = useAppTheme()
  const s = createStyles(t)

  const currentName      = state.routes[state.index]?.name ?? ''
  const isHome           = currentName === 'index'
  const isMenu           = currentName === 'menu'
  const isSessionsActive = currentName === 'sessions'

  // Regular nav tab
  const navTab = (
    name: string,
    icon: string,
    label: string,
    isActive: boolean,
  ) => (
    <TouchableOpacity
      style={s.tabBtn}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        navigation.navigate(name)
      }}
      activeOpacity={0.7}
    >
      <Text style={[s.tabIcon, isActive && s.tabIconActive]}>{icon}</Text>
      <Text style={[s.tabLabel, isActive && s.tabLabelActive]}>{label}</Text>
    </TouchableOpacity>
  )

  // Sheet-opening tab — emoji ikon ile
  const sheetTab = (
    icon: string,
    label: string,
    isActive: boolean,
    onPress: () => void,
  ) => (
    <TouchableOpacity
      style={s.tabBtn}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        onPress()
      }}
      activeOpacity={0.7}
    >
      <Text style={[s.tabIcon, isActive && s.tabIconActive]}>{icon}</Text>
      <Text style={[s.tabLabel, isActive && s.tabLabelActive]}>{label}</Text>
    </TouchableOpacity>
  )

  return (
    <View style={s.bar}>
      {navTab('index', '🏠', 'Ana Sayfa', isHome)}

      {/* Egzersiz — özel mavi göz ikonu */}
      <TouchableOpacity
        style={s.tabBtn}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
          onOpenEgzersiz()
        }}
        activeOpacity={0.7}
      >
        <EagleEyeIcon active={egzersizActive} />
        <Text style={[s.tabLabel, egzersizActive && s.tabLabelActive]}>Kartal Gözü</Text>
      </TouchableOpacity>

      {/* FAB placeholder — RadialFab overlay olarak render edilir */}
      <View style={s.fabSlot} pointerEvents="none" />

      {sheetTab('📚', 'Çalış', okumaActive || isSessionsActive, onNavigateCalis)}
      {navTab('menu', '🎓', 'Üssü', isMenu)}
    </View>
  )
}

// ─── Layout ───────────────────────────────────────────────────────
export default function TabsLayout() {
  const t = useAppTheme()

  // Bottom sheet ref (sadece egzersiz sheet'i)
  const egzersizRef = useRef<TrainingSheetRef>(null)

  // Active states for tab highlight
  const [egzersizActive, setEgzersizActive] = useState(false)
  const [okumaActive,    setOkumaActive]    = useState(false)

  return (
    <View style={rootStyle}>
      <Tabs
        tabBar={(props) => (
          <SprintaTabBar
            {...props}
            onOpenEgzersiz={() => {
              setOkumaActive(false)
              setEgzersizActive(true)
              egzersizRef.current?.open()
            }}
            onNavigateCalis={() => {
              setEgzersizActive(false)
              setOkumaActive(true)
              props.navigation.navigate('sessions')
            }}
            egzersizActive={egzersizActive}
            okumaActive={okumaActive}
          />
        )}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="index"    options={{ title: 'Ana Sayfa' }} />
        <Tabs.Screen name="menu"     options={{ title: 'Üssü' }} />

        {/* Navigable but hidden from tab bar */}
        <Tabs.Screen name="calis"    options={{ href: null }} />
        <Tabs.Screen name="coach"    options={{ href: null }} />
        <Tabs.Screen name="sessions" options={{ title: 'Çalış' }} />
        <Tabs.Screen name="progress" options={{ href: null }} />
        <Tabs.Screen name="social"   options={{ href: null }} />
        <Tabs.Screen name="profile"  options={{ href: null }} />
      </Tabs>

      {/* Radial FAB — Tabs'ın üzerinde */}
      <RadialFab theme={t} tabBarHeight={BAR_H} />

      {/* Egzersiz Training Bottom Sheet */}
      <TrainingBottomSheet
        ref={egzersizRef}
        type="egzersiz"
        onClose={() => setEgzersizActive(false)}
      />
    </View>
  )
}

const rootStyle = { flex: 1 } as const

// ─── Stiller ─────────────────────────────────────────────────────
function createStyles(t: AppTheme) {
  return StyleSheet.create({
    bar: {
      flexDirection:     'row',
      backgroundColor:   t.colors.surface,
      borderTopWidth:    StyleSheet.hairlineWidth,
      borderTopColor:    t.colors.border,
      height:            BAR_H,
      alignItems:        'center',
      paddingBottom:     Platform.OS === 'ios' ? 16 : 0,
      paddingHorizontal: 4,
      shadowColor:       t.colors.primary,
      shadowOffset:      { width: 0, height: -2 },
      shadowOpacity:     t.isDark ? 0.15 : 0.06,
      shadowRadius:      8,
      elevation:         12,
    },

    tabBtn: {
      flex:           1,
      alignItems:     'center',
      justifyContent: 'center',
      paddingTop:     8,
    },
    tabIcon:        { fontSize: 22, marginBottom: 3, opacity: 0.35 },
    tabIconActive:  { opacity: 1.0 },
    tabLabel:       { fontSize: 10, color: t.colors.textHint, fontWeight: '600' },
    tabLabelActive: { color: t.colors.primary, fontWeight: '800' },

    // FAB yerini tutan boş alan
    fabSlot: { flex: 1 },
  })
}
