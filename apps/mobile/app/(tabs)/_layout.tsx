import { useRef, useState, useEffect } from 'react'
import { Tabs, useRouter } from 'expo-router'
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { useAppTheme } from '../../src/theme/useAppTheme'
import type { AppTheme } from '../../src/theme'
import * as Haptics from 'expo-haptics'
import { RadialFab } from '../../src/features/navigation/components/RadialFab'
import TrainingBottomSheet from '../../src/components/training/TrainingBottomSheet'
import type { TrainingSheetRef } from '../../src/components/training/TrainingBottomSheet'
import { notificationService } from '../../src/services/notificationService'

// ─── Tema renkleri ────────────────────────────────────────────────
const NAVY = '#0D1B3E'
const TEAL = '#40C8F0'   // İş Bankası accent

// ─── Eagle Eye Icon (Kartal Gözü) ────────────────────────────────
function EagleEyeIcon({ active }: { active: boolean }) {
  return (
    <View style={{
      opacity:        active ? 1.0 : 0.45,
      alignItems:     'center',
      justifyContent: 'center',
      shadowColor:    active ? TEAL : 'transparent',
      shadowOffset:   { width: 0, height: 0 },
      shadowRadius:   active ? 8 : 0,
      shadowOpacity:  active ? 0.70 : 0,
      elevation:      active ? 6 : 0,
    }}>
      <Text style={{ fontSize: 22, lineHeight: 28 }}>👁️</Text>
    </View>
  )
}

// ─── Tab Bar yüksekliği ───────────────────────────────────────────
const BAR_H = Platform.OS === 'ios' ? 84 : 68

// ─── Custom Sprinta Tab Bar ───────────────────────────────────────
interface SprintaTabBarProps extends BottomTabBarProps {
  onOpenEgzersiz:  () => void
  onOpenOkuma:     () => void
  onOpenAkademi:   () => void
  egzersizActive:  boolean
  okumaActive:     boolean
  akademiActive:   boolean
}

function SprintaTabBar({
  state,
  navigation,
  onOpenEgzersiz,
  onOpenOkuma,
  onOpenAkademi,
  egzersizActive,
  okumaActive,
  akademiActive,
}: SprintaTabBarProps) {
  const t = useAppTheme()
  const s = createStyles(t)

  const currentName   = state.routes[state.index]?.name ?? ''
  const isHome        = currentName === 'index'
  const isMenu        = currentName === 'menu'
  const isCalisActive = currentName === 'calis'

  // ─── Tek tab butonu ─────────────────────────────────────────────
  const TabItem = ({
    icon,
    label,
    isActive,
    onPress,
    customIcon,
  }: {
    icon?:       string
    label:       string
    isActive:    boolean
    onPress:     () => void
    customIcon?: React.ReactNode
  }) => (
    <TouchableOpacity
      style={s.tabBtn}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        onPress()
      }}
      activeOpacity={0.7}
    >
      {/* Aktif arka plan pill */}
      <View style={[s.iconPill, isActive && s.iconPillActive]}>
        {customIcon ?? (
          <Text style={[s.tabIcon, isActive && s.tabIconActive]}>{icon}</Text>
        )}
      </View>
      <Text style={[s.tabLabel, isActive && s.tabLabelActive]}>{label}</Text>
      {/* Aktif gösterge nokta */}
      {isActive && <View style={s.activeDot} />}
    </TouchableOpacity>
  )

  return (
    <View style={s.bar}>

      <TabItem
        icon="🏠"
        label="Ana Sayfa"
        isActive={isHome}
        onPress={() => navigation.navigate('index')}
      />

      <TabItem
        label="Kartal Gözü"
        isActive={egzersizActive}
        onPress={onOpenEgzersiz}
        customIcon={<EagleEyeIcon active={egzersizActive} />}
      />

      {/* FAB placeholder */}
      <View style={s.fabSlot} pointerEvents="none" />

      <TabItem
        icon="📖"
        label="Okuma"
        isActive={okumaActive}
        onPress={onOpenOkuma}
      />

      <TabItem
        icon="🎓"
        label="Akademi"
        isActive={isMenu || akademiActive}
        onPress={onOpenAkademi}
      />

    </View>
  )
}

// ─── Layout ───────────────────────────────────────────────────────
export default function TabsLayout() {
  const t = useAppTheme()

  // Push bildirim izni + günlük hatırlatıcı
  useEffect(() => {
    notificationService.init().then(() => {
      notificationService.scheduleDailyReminder()
    })
  }, [])

  const egzersizRef = useRef<TrainingSheetRef>(null)
  const okumaRef    = useRef<TrainingSheetRef>(null)
  const akademiRef  = useRef<TrainingSheetRef>(null)
  const [egzersizActive, setEgzersizActive] = useState(false)
  const [okumaActive,    setOkumaActive]    = useState(false)
  const [akademiActive,  setAkademiActive]  = useState(false)

  return (
    <View style={rootStyle}>
      <Tabs
        tabBar={(props) => (
          <SprintaTabBar
            {...props}
            onOpenEgzersiz={() => {
              setOkumaActive(false)
              setAkademiActive(false)
              setEgzersizActive(true)
              egzersizRef.current?.open()
            }}
            onOpenOkuma={() => {
              setEgzersizActive(false)
              setAkademiActive(false)
              setOkumaActive(true)
              okumaRef.current?.open()
            }}
            onOpenAkademi={() => {
              setEgzersizActive(false)
              setOkumaActive(false)
              setAkademiActive(true)
              akademiRef.current?.open()
            }}
            egzersizActive={egzersizActive}
            okumaActive={okumaActive}
            akademiActive={akademiActive}
          />
        )}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="index"    options={{ title: 'Ana Sayfa' }} />
        <Tabs.Screen name="menu"     options={{ title: 'Akademi' }} />
        <Tabs.Screen name="calis"    options={{ href: null }} />
        <Tabs.Screen name="coach"    options={{ href: null }} />
        <Tabs.Screen name="sessions" options={{ href: null }} />
        <Tabs.Screen name="progress" options={{ href: null }} />
        <Tabs.Screen name="social"   options={{ href: null }} />
        <Tabs.Screen name="profile"  options={{ href: null }} />
        <Tabs.Screen name="practice" options={{ href: null }} />
      </Tabs>

      <RadialFab theme={t} tabBarHeight={BAR_H} />

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
      <TrainingBottomSheet
        ref={akademiRef}
        type="akademi"
        onClose={() => setAkademiActive(false)}
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
      borderTopColor:    t.isDark ? '#1E293B' : '#E2E8F8',
      height:            BAR_H,
      alignItems:        'center',
      paddingBottom:     Platform.OS === 'ios' ? 20 : 0,
      paddingHorizontal: 4,
      // Derin gölge — kartın altından yükseliyormuş hissi
      shadowColor:       NAVY,
      shadowOffset:      { width: 0, height: -4 },
      shadowOpacity:     t.isDark ? 0.25 : 0.08,
      shadowRadius:      12,
      elevation:         16,
    },

    tabBtn: {
      flex:           1,
      alignItems:     'center',
      justifyContent: 'center',
      paddingTop:     6,
      position:       'relative',
    },

    // İkon pill — aktifken navy %8 arkaplan
    iconPill: {
      width:          44,
      height:         30,
      borderRadius:   14,
      alignItems:     'center',
      justifyContent: 'center',
      marginBottom:   2,
    },
    iconPillActive: {
      backgroundColor: NAVY + '12',
    },

    tabIcon:       { fontSize: 22, opacity: 0.45 },
    tabIconActive: { opacity: 1.0 },

    tabLabel:      { fontSize: 10, color: t.isDark ? '#64748B' : '#8892A4', fontWeight: '600' },
    tabLabelActive: { color: NAVY, fontWeight: '800' },

    // Küçük teal nokta — aktif gösterge
    activeDot: {
      position:        'absolute',
      bottom:          Platform.OS === 'ios' ? -2 : 0,
      width:           20,
      height:          3,
      borderRadius:    1.5,
      backgroundColor: TEAL,
    },

    // FAB boşluk
    fabSlot: { flex: 1 },
  })
}
