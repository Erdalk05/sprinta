/**
 * DailyPlanCard — Bugünün Planı
 * generate-daily-plan edge function'dan alınan 3 modülü gösterir
 * "Sırayı Başlat" ilk modüle yönlendirir
 */
import React, { useEffect, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Animated } from 'react-native'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { useHomeStore } from '../../../stores/homeStore'

const NAVY = '#1A3594'
const TEAL = '#40C8F0'
const BLUE = '#1877F2'

const PRIORITY_ICONS = ['①', '②', '③']

export function DailyPlanCard() {
  const router      = useRouter()
  const { dailyPlan, dailyPlanReason, dailyPlanLoading } = useHomeStore()

  // Fade-in animasyonu (plan yüklenince)
  const opacity = useRef(new Animated.Value(0)).current
  useEffect(() => {
    if (!dailyPlanLoading && dailyPlan.length > 0) {
      Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }).start()
    }
  }, [dailyPlanLoading, dailyPlan.length])

  const handleStartPlan = () => {
    if (dailyPlan.length === 0) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    router.push(`/exercise/${dailyPlan[0].module_key}` as any)
  }

  const handleModulePress = (moduleKey: string) => {
    Haptics.selectionAsync()
    router.push(`/exercise/${moduleKey}` as any)
  }

  return (
    <View style={s.card}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>📋 Bugünün Planı</Text>
        {dailyPlanLoading && <ActivityIndicator size="small" color={TEAL} />}
      </View>

      {/* Reason subtitle */}
      {dailyPlanReason ? (
        <Text style={s.reason} numberOfLines={1}>{dailyPlanReason}</Text>
      ) : null}

      {/* Plan items */}
      <Animated.View style={{ opacity }}>
        {dailyPlan.length === 0 && !dailyPlanLoading ? (
          <Text style={s.empty}>Plan yükleniyor…</Text>
        ) : (
          dailyPlan.map((item, i) => (
            <TouchableOpacity
              key={item.module_key}
              style={s.row}
              onPress={() => handleModulePress(item.module_key)}
              activeOpacity={0.75}
            >
              <Text style={s.priority}>{PRIORITY_ICONS[i] ?? `${i + 1}.`}</Text>
              <View style={s.rowMid}>
                <Text style={s.moduleLabel}>{item.label}</Text>
                <Text style={s.timeTxt}>⏱ {item.time_minutes} dk</Text>
              </View>
              <Text style={s.arrow}>›</Text>
            </TouchableOpacity>
          ))
        )}
      </Animated.View>

      {/* Sırayı Başlat */}
      {dailyPlan.length > 0 && (
        <TouchableOpacity style={s.startBtn} onPress={handleStartPlan} activeOpacity={0.88}>
          <Text style={s.startBtnTxt}>Sırayı Başlat →</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const s = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop:        16,
    borderRadius:     18,
    backgroundColor:  '#fff',
    paddingHorizontal: 16,
    paddingVertical:  16,
    gap:              10,
    shadowColor:      '#1A3594',
    shadowOpacity:    0.08,
    shadowRadius:     10,
    shadowOffset:     { width: 0, height: 3 },
    elevation:        3,
  },
  header: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  title: {
    fontSize:     15,
    fontWeight:   '800',
    color:        NAVY,
    letterSpacing: 0.1,
  },
  reason: {
    fontSize:   12,
    color:      '#6B7280',
    fontWeight: '500',
    marginTop:  -4,
  },
  empty: {
    fontSize:  13,
    color:     '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 8,
  },
  row: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  priority: {
    fontSize:   18,
    color:      BLUE,
    minWidth:   24,
  },
  rowMid: {
    flex:           1,
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
  },
  moduleLabel: {
    fontSize:   14,
    fontWeight: '600',
    color:      '#111827',
    flex:       1,
  },
  timeTxt: {
    fontSize:   12,
    color:      '#9CA3AF',
    fontWeight: '500',
  },
  arrow: {
    fontSize:   18,
    color:      '#D1D5DB',
    fontWeight: '700',
  },
  startBtn: {
    backgroundColor: TEAL,
    borderRadius:    12,
    paddingVertical: 13,
    alignItems:      'center',
    marginTop:       4,
    shadowColor:     TEAL,
    shadowOpacity:   0.25,
    shadowRadius:    6,
    shadowOffset:    { width: 0, height: 2 },
    elevation:       2,
  },
  startBtnTxt: {
    fontSize:   15,
    fontWeight: '800',
    color:      '#fff',
  },
})
