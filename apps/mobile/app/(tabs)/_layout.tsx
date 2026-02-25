import { Tabs, useRouter } from 'expo-router'
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { useAppTheme } from '../../src/theme/useAppTheme'
import type { AppTheme } from '../../src/theme'
import * as Haptics from 'expo-haptics'

// ─── Custom Sprinta Tab Bar ───────────────────────────────────────
function SprintaTabBar({ state, navigation }: BottomTabBarProps) {
  const t      = useAppTheme()
  const router = useRouter()
  const s      = createStyles(t)

  const currentName = state.routes[state.index]?.name ?? ''
  const isHome      = currentName === 'index'
  const isSession   = currentName === 'sessions'
  const isProgress  = currentName === 'progress'
  const isMenu      = currentName === 'menu'

  const handleFAB = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    router.push('/exercise/speed_control' as any)
  }

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

      {/* Çalış */}
      <TouchableOpacity
        style={s.tabBtn}
        onPress={() => navigation.navigate('sessions')}
        activeOpacity={0.7}
      >
        <Text style={[s.tabIcon, isSession && s.tabIconActive]}>📚</Text>
        <Text style={[s.tabLabel, isSession && s.tabLabelActive]}>Çalış</Text>
      </TouchableOpacity>

      {/* FAB — Merkez yükseltilmiş başlat butonu */}
      <View style={s.fabWrap}>
        <TouchableOpacity onPress={handleFAB} activeOpacity={0.85}>
          <LinearGradient
            colors={t.gradients.hero as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.fabGrad}
          >
            <Text style={s.fabIcon}>⚡</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* İlerleme */}
      <TouchableOpacity
        style={s.tabBtn}
        onPress={() => navigation.navigate('progress')}
        activeOpacity={0.7}
      >
        <Text style={[s.tabIcon, isProgress && s.tabIconActive]}>📊</Text>
        <Text style={[s.tabLabel, isProgress && s.tabLabelActive]}>İlerleme</Text>
      </TouchableOpacity>

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
      <Tabs.Screen name="index"    options={{ title: 'Ana Sayfa' }} />
      <Tabs.Screen name="sessions" options={{ title: 'Çalış' }} />
      <Tabs.Screen name="progress" options={{ title: 'İlerleme' }} />
      <Tabs.Screen name="menu"     options={{ title: 'Menü' }} />
      {/* Gizli route'lar */}
      <Tabs.Screen name="social"   options={{ href: null }} />
      <Tabs.Screen name="profile"  options={{ href: null }} />
    </Tabs>
  )
}

// ─── Stiller ─────────────────────────────────────────────────────

function createStyles(t: AppTheme) {
  const BAR_H = Platform.OS === 'ios' ? 78 : 64
  return StyleSheet.create({
    bar: {
      flexDirection:    'row',
      backgroundColor:  t.colors.surface,
      borderTopWidth:   1,
      borderTopColor:   t.colors.divider,
      height:           BAR_H,
      alignItems:       'center',
      paddingBottom:    Platform.OS === 'ios' ? 16 : 0,
      paddingHorizontal: 4,
      ...t.shadows.sm,
    },
    tabBtn: {
      flex:           1,
      alignItems:     'center',
      justifyContent: 'center',
      paddingTop:     8,
    },
    tabIcon:        { fontSize: 22, marginBottom: 3, opacity: 0.45 },
    tabIconActive:  { opacity: 1 },
    tabLabel:       { fontSize: 11, color: t.colors.textHint, fontWeight: '600' },
    tabLabelActive: { color: t.colors.primary, fontWeight: '700' },

    // FAB
    fabWrap: {
      flex:           1,
      alignItems:     'center',
      justifyContent: 'flex-start',
      marginTop:      -28,
    },
    fabGrad: {
      width:          62,
      height:         62,
      borderRadius:   31,
      alignItems:     'center',
      justifyContent: 'center',
      borderWidth:    3,
      borderColor:    t.colors.surface,
      // shadow via elevation
      elevation:      10,
      shadowColor:    '#000',
      shadowOffset:   { width: 0, height: 4 },
      shadowOpacity:  0.3,
      shadowRadius:   8,
    },
    fabIcon: { fontSize: 26 },
  })
}
