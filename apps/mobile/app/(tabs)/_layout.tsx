import { Tabs, useRouter } from 'expo-router'
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { theme } from '../../src/theme'

// ─── Custom CGD-style Tab Bar ────────────────────────────────────
function SprintaTabBar({ state, navigation }: BottomTabBarProps) {
  const router = useRouter()

  // Visible tabs: index=0 (Ana Sayfa), menu=1 (Menü)
  const isHome = state.index === 0
  const isMenu = state.routes[state.index]?.name === 'menu'

  return (
    <View style={s.bar}>
      {/* Ana Sayfa */}
      <TouchableOpacity
        style={s.tabBtn}
        onPress={() => navigation.navigate('index')}
        activeOpacity={0.7}
      >
        <Text style={[s.tabIcon, isHome && s.tabIconActive]}>🏠</Text>
        <Text style={[s.tabLabel, isHome && s.tabLabelActive]}>Ana Sayfa</Text>
      </TouchableOpacity>

      {/* Merkez — Sprinta butonu (yükseltilmiş) */}
      <View style={s.centerWrap}>
        <TouchableOpacity
          style={s.centerBtn}
          onPress={() => router.push('/exercise/speed_control')}
          activeOpacity={0.85}
        >
          <Text style={s.centerIcon}>🎓</Text>
        </TouchableOpacity>
      </View>

      {/* Menü */}
      <TouchableOpacity
        style={s.tabBtn}
        onPress={() => navigation.navigate('menu')}
        activeOpacity={0.7}
      >
        <Text style={[s.tabIcon, isMenu && s.tabIconActive]}>▦</Text>
        <Text style={[s.tabLabel, isMenu && s.tabLabelActive]}>Menü</Text>
      </TouchableOpacity>
    </View>
  )
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <SprintaTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      {/* Görünen sekmeler */}
      <Tabs.Screen name="index"   options={{ title: 'Ana Sayfa' }} />
      <Tabs.Screen name="menu"    options={{ title: 'Menü' }} />

      {/* Gizli route'lar — menü üzerinden erişilir */}
      <Tabs.Screen name="sessions"  options={{ href: null }} />
      <Tabs.Screen name="progress"  options={{ href: null }} />
      <Tabs.Screen name="social"    options={{ href: null }} />
      <Tabs.Screen name="profile"   options={{ href: null }} />
    </Tabs>
  )
}

const BAR_H = Platform.OS === 'ios' ? 80 : 68

const s = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,   // beyaz — WhatsApp bottom bar
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    height: BAR_H,
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 16 : 0,
    paddingHorizontal: 8,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  tabIcon:       { fontSize: 22, marginBottom: 3, color: theme.colors.iconGray },
  tabIconActive: { color: theme.colors.primary },
  tabLabel:      { fontSize: 10, color: theme.colors.textHint, fontWeight: '500' },
  tabLabelActive:{ color: theme.colors.primary, fontWeight: '700' },

  // Center
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: -28,
  },
  centerBtn: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: theme.colors.panel,     // #075E54 koyu yeşil
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: theme.colors.surface,
    ...theme.shadow.green,
  },
  centerIcon: { fontSize: 26 },
})
