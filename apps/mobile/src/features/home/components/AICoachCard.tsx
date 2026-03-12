/**
 * AICoachCard — v4 Modern Design
 * Beyaz kart · Teal sol çizgi · Mavi "Başla" butonu
 */
import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'
import { useHomeStore } from '../../../stores/homeStore'

const BLUE   = '#2D5BE3'
const TEAL   = '#40C8F0'   // İş Bankası accent blue
const CARD   = '#FFFFFF'
const BORDER = '#E2E8F8'
const TEXT   = '#1A1A2E'
const TEXT_S = '#6B7A99'

export function AICoachCard() {
  const router = useRouter()
  const {
    aiCoachSuggestion,
    aiCoachDrill,
    aiCoachDrillRoute,
    aiCoachXpReward,
    aiCoachDifficulty,
  } = useHomeStore()

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    router.push(aiCoachDrillRoute as any)
  }

  return (
    <View style={s.card}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.iconBox}>
          <Text style={{ fontSize: 22 }}>🤖</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>AI Koç</Text>
          <Text style={s.subtitle}>Kişisel Performans Analizi</Text>
        </View>
      </View>

      {/* Öneri metni */}
      <Text style={s.suggestion}>{aiCoachSuggestion}</Text>

      {/* Drill + Başla butonu */}
      <View style={s.detailRow}>
        <View style={{ flex: 1 }}>
          <Text style={s.drillName}>📋 {aiCoachDrill}</Text>
          <View style={s.tagRow}>
            <View style={s.diffTag}>
              <Text style={s.diffTxt}>{aiCoachDifficulty}</Text>
            </View>
            <View style={s.xpTag}>
              <Text style={s.xpTxt}>+{aiCoachXpReward} XP ⭐</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={s.startBtn} onPress={handleStart} activeOpacity={0.85}>
          <Text style={s.startTxt}>Başla ⚡</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  card: {
    backgroundColor: CARD,
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 18,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: TEAL,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: BORDER,
  },
  header: {
    flexDirection: 'row', alignItems: 'center',
    gap: 12, marginBottom: 12,
  },
  iconBox: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#E6FDF8',
    alignItems: 'center', justifyContent: 'center',
  },
  title:    { fontSize: 14, fontWeight: '800', color: BLUE },
  subtitle: { fontSize: 11, color: TEXT_S, marginTop: 1 },
  suggestion: {
    fontSize: 13, color: TEXT_S,
    lineHeight: 20, marginBottom: 14,
  },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  drillName: { fontSize: 13, fontWeight: '700', color: TEXT, marginBottom: 6 },
  tagRow:    { flexDirection: 'row', gap: 6 },
  diffTag: {
    backgroundColor: '#D9E5FF', borderRadius: 7,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  diffTxt: { fontSize: 11, fontWeight: '700', color: BLUE },
  xpTag: {
    backgroundColor: '#E8F0FE', borderRadius: 7,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  xpTxt: { fontSize: 11, fontWeight: '700', color: '#92400E' },
  startBtn: {
    backgroundColor: BLUE, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 11,
  },
  startTxt: { fontSize: 13, fontWeight: '700', color: '#fff' },
})
