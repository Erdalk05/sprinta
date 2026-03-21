/**
 * Notifications Settings Screen
 * Allows users to manage push notification preferences.
 * Uses expo-notifications for permission check.
 */
import React, { useEffect, useState } from 'react'
import {
  View, Text, Switch, TouchableOpacity,
  StyleSheet, SafeAreaView, ScrollView,
  Alert, Linking, Platform,
} from 'react-native'
import { useRouter } from 'expo-router'
import * as Notifications from 'expo-notifications'

const NAVY = '#1A3594'

type PermissionStatus = 'granted' | 'denied' | 'undetermined' | 'loading'

export default function NotificationsSettingsScreen() {
  const router = useRouter()
  const [permStatus, setPermStatus] = useState<PermissionStatus>('loading')
  const [dailyReminder, setDailyReminder] = useState(true)
  const [weeklyReport,  setWeeklyReport]  = useState(true)
  const [streakAlert,   setStreakAlert]    = useState(true)

  useEffect(() => {
    checkPermission()
  }, [])

  async function checkPermission() {
    try {
      const { status } = await Notifications.getPermissionsAsync()
      setPermStatus(status as PermissionStatus)
    } catch {
      setPermStatus('undetermined')
    }
  }

  async function requestPermission() {
    try {
      const { status } = await Notifications.requestPermissionsAsync()
      setPermStatus(status as PermissionStatus)
      if (status !== 'granted') {
        Alert.alert(
          'Bildirim İzni Gerekli',
          'Bildirimleri etkinleştirmek için Ayarlar\'dan izin ver.',
          [
            { text: 'İptal', style: 'cancel' },
            { text: 'Ayarlara Git', onPress: () => Linking.openSettings() },
          ]
        )
      }
    } catch {
      // silent
    }
  }

  const isGranted = permStatus === 'granted'

  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.7}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>Bildirimler</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* Permission banner */}
        {!isGranted && permStatus !== 'loading' && (
          <TouchableOpacity style={s.permBanner} onPress={requestPermission} activeOpacity={0.85}>
            <Text style={s.permBannerIcon}>🔔</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.permBannerTitle}>Bildirimler kapalı</Text>
              <Text style={s.permBannerSub}>Günlük hatırlatıcı almak için izin ver</Text>
            </View>
            <Text style={s.permBannerBtn}>Aç →</Text>
          </TouchableOpacity>
        )}

        <Text style={s.sectionLabel}>BİLDİRİM TERCİHLERİ</Text>

        <Row
          icon="⏰"
          label="Günlük Hatırlatıcı"
          sub="Her gün çalışma saatinde hatırlat"
          value={isGranted && dailyReminder}
          disabled={!isGranted}
          onToggle={setDailyReminder}
        />
        <Row
          icon="📊"
          label="Haftalık Rapor"
          sub="Pazar günü ilerleme özeti"
          value={isGranted && weeklyReport}
          disabled={!isGranted}
          onToggle={setWeeklyReport}
        />
        <Row
          icon="🔥"
          label="Seri Uyarısı"
          sub="Günlük serin kırılmak üzereyken bildir"
          value={isGranted && streakAlert}
          disabled={!isGranted}
          onToggle={setStreakAlert}
        />

        <Text style={s.note}>
          Bildirim zamanlaması sistem ayarlarından değiştirilebilir.
          {Platform.OS === 'ios' ? '\niOS Ayarlar → Sprinta → Bildirimler' : ''}
        </Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

function Row({
  icon, label, sub, value, disabled, onToggle,
}: {
  icon: string; label: string; sub: string
  value: boolean; disabled: boolean
  onToggle: (v: boolean) => void
}) {
  return (
    <View style={[s.row, disabled && s.rowDisabled]}>
      <Text style={s.rowIcon}>{icon}</Text>
      <View style={s.rowMid}>
        <Text style={s.rowLabel}>{label}</Text>
        <Text style={s.rowSub}>{sub}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        disabled={disabled}
        trackColor={{ true: NAVY, false: '#D1D5DB' }}
        thumbColor="#FFFFFF"
      />
    </View>
  )
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: '#F9FAFB' },
  header:  {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  backBtn:   { width: 40, alignItems: 'flex-start' },
  backArrow: { fontSize: 22, color: NAVY },
  title:     { fontSize: 16, fontWeight: '700', color: '#111827' },

  content: { paddingTop: 16, paddingHorizontal: 16 },

  permBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#FEF3C7',
    borderRadius: 12, padding: 14, marginBottom: 20,
  },
  permBannerIcon:  { fontSize: 24 },
  permBannerTitle: { fontSize: 14, fontWeight: '700', color: '#92400E' },
  permBannerSub:   { fontSize: 12, color: '#B45309', marginTop: 2 },
  permBannerBtn:   { fontSize: 14, fontWeight: '700', color: '#D97706' },

  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: '#9CA3AF',
    letterSpacing: 1, marginBottom: 8,
  },

  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12, padding: 14, marginBottom: 10,
  },
  rowDisabled: { opacity: 0.5 },
  rowIcon:     { fontSize: 22, width: 30 },
  rowMid:      { flex: 1 },
  rowLabel:    { fontSize: 14, fontWeight: '600', color: '#111827' },
  rowSub:      { fontSize: 12, color: '#6B7280', marginTop: 2 },

  note: {
    fontSize: 12, color: '#9CA3AF', lineHeight: 18,
    marginTop: 8, paddingHorizontal: 4,
  },
})
