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

// ─── Deep Blue Eye Icon ───────────────────────────────────────────
// Katmanlı iris: koyu lacivert → okyanus mavisi → parlak cyan
// Speküler yansıma noktası → cam/göz derinliği hissi
// Aktifken neon glow border
function BlueEyeIcon({ active }: { active: boolean }) {
  const opacity    = active ? 1.0 : 0.40
  const borderClr  = active ? '#38BDF8' : '#0EA5E9'
  const glowOp     = active ? 0.65 : 0.15

  return (
    <View style={{
      opacity,
      width: 32, height: 22,
      alignItems: 'center', justifyContent: 'center',
      // Aktifken iris rengi glow
      shadowColor:   '#0EA5E9',
      shadowOffset:  { width: 0, height: 0 },
      shadowRadius:  active ? 7 : 3,
      shadowOpacity: glowOp,
      elevation:     active ? 8 : 2,
    }}>
      {/* Badem (almond) göz şekli */}
      <View style={{
        width: 32, height: 20,
        borderRadius: 10,
        borderWidth:  1.6,
        borderColor:  borderClr,
        overflow:     'hidden',
        alignItems:   'center',
        justifyContent: 'center',
        // Sklerada çok hafif mavi ton
        backgroundColor: 'rgba(14,165,233,0.06)',
      }}>

        {/* İris — Katman 1: Dış halka (koyu lacivert — derinlik) */}
        <View style={{
          width: 15, height: 15, borderRadius: 7.5,
          backgroundColor: '#0B2849',
          alignItems: 'center', justifyContent: 'center',
        }}>
          {/* İris — Katman 2: Orta halka (okyanus mavisi) */}
          <View style={{
            width: 11, height: 11, borderRadius: 5.5,
            backgroundColor: '#0369A1',
            alignItems: 'center', justifyContent: 'center',
          }}>
            {/* İris — Katman 3: İç halka (parlak cyan) */}
            <View style={{
              width: 7.5, height: 7.5, borderRadius: 3.75,
              backgroundColor: '#38BDF8',
              alignItems: 'center', justifyContent: 'center',
            }}>
              {/* Pupil (saf siyah merkez) */}
              <View style={{
                width: 3.8, height: 3.8, borderRadius: 1.9,
                backgroundColor: '#020617',
              }} />
            </View>
          </View>
        </View>

        {/* Speküler yansıma — sağ üst, cam/göz derinliği illüzyonu */}
        <View style={{
          position: 'absolute', top: 3, right: 6,
          width: 3, height: 3, borderRadius: 1.5,
          backgroundColor: 'rgba(255,255,255,0.88)',
        }} />

      </View>
    </View>
  )
}

// ─── Tab Bar yüksekliği ───────────────────────────────────────────
const BAR_H = Platform.OS === 'ios' ? 80 : 66

// ─── Custom Sprinta Tab Bar ───────────────────────────────────────
interface SprintaTabBarProps extends BottomTabBarProps {
  onOpenEgzersiz: () => void
  onOpenOkuma:    () => void
  egzersizActive: boolean
  okumaActive:    boolean
}

function SprintaTabBar({
  state,
  navigation,
  onOpenEgzersiz,
  onOpenOkuma,
  egzersizActive,
  okumaActive,
}: SprintaTabBarProps) {
  const t = useAppTheme()
  const s = createStyles(t)

  const currentName = state.routes[state.index]?.name ?? ''
  const isHome      = currentName === 'index'
  const isMenu      = currentName === 'menu'

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
        <BlueEyeIcon active={egzersizActive} />
        <Text style={[s.tabLabel, egzersizActive && s.tabLabelActive]}>Kartal Gözü</Text>
      </TouchableOpacity>

      {/* FAB placeholder — RadialFab overlay olarak render edilir */}
      <View style={s.fabSlot} pointerEvents="none" />

      {sheetTab('📖', 'Okuma', okumaActive, onOpenOkuma)}
      {navTab('menu', '🎓', 'Üssü', isMenu)}
    </View>
  )
}

// ─── Layout ───────────────────────────────────────────────────────
export default function TabsLayout() {
  const t = useAppTheme()

  // Bottom sheet refs
  const egzersizRef = useRef<TrainingSheetRef>(null)
  const okumaRef    = useRef<TrainingSheetRef>(null)

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
            onOpenOkuma={() => {
              setEgzersizActive(false)
              setOkumaActive(true)
              okumaRef.current?.open()
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
        <Tabs.Screen name="coach"    options={{ href: null }} />
        <Tabs.Screen name="sessions" options={{ href: null }} />
        <Tabs.Screen name="progress" options={{ href: null }} />
        <Tabs.Screen name="social"   options={{ href: null }} />
        <Tabs.Screen name="profile"  options={{ href: null }} />
      </Tabs>

      {/* Radial FAB — Tabs'ın üzerinde */}
      <RadialFab theme={t} tabBarHeight={BAR_H} />

      {/* Training Bottom Sheets — en üstte render edilir */}
      <TrainingBottomSheet
        ref={egzersizRef}
        type="egzersiz"
        onClose={() => setEgzersizActive(false)}
      />
      <TrainingBottomSheet
        ref={okumaRef}
        type="okuma"
        onClose={() => setOkumaActive(false)}
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
