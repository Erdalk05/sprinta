/**
 * AICoachCard — Sport Premium Edition
 * Dynamic suggestion · Drill name · XP · Difficulty · Quick start
 */
import React, { useMemo } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'
import { useHomeStore } from '../../../stores/homeStore'
import { useAppTheme } from '../../../theme/useAppTheme'
import type { AppTheme } from '../../../theme'

export function AICoachCard() {
  const t      = useAppTheme()
  const s      = useMemo(() => ms(t), [t])
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
          <Text style={s.iconEmoji}>🤖</Text>
        </View>
        <View style={s.headerTexts}>
          <Text style={s.title}>AI Koç</Text>
          <Text style={s.subtitle}>Kişisel Performans Analizi</Text>
        </View>
      </View>

      {/* Suggestion */}
      <Text style={s.suggestion}>{aiCoachSuggestion}</Text>

      {/* Drill details row */}
      <View style={s.detailRow}>
        <View style={s.drillInfo}>
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
          <Text style={s.startTxt}>Başla</Text>
          <Text style={s.startArrow}>⚡</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

// ─── Stiller ─────────────────────────────────────────────────────
function ms(t: AppTheme) {
  return StyleSheet.create({
    card: {
      backgroundColor:  t.colors.sportCard,
      marginHorizontal: 16,
      marginTop:        12,
      borderRadius:     18,
      padding:          18,
      shadowColor:      '#000',
      shadowOffset:     { width: 0, height: 2 },
      shadowOpacity:    0.08,
      shadowRadius:     8,
      elevation:        3,
    },

    header: {
      flexDirection: 'row',
      alignItems:    'center',
      gap:           12,
      marginBottom:  14,
    },
    iconBox: {
      width:           46,
      height:          46,
      borderRadius:    23,
      backgroundColor: t.colors.energyLight,
      alignItems:      'center',
      justifyContent:  'center',
    },
    iconEmoji:    { fontSize: 24 },
    headerTexts:  { flex: 1 },
    title:        { fontSize: 14, fontWeight: '800', color: t.colors.deepGreen },
    subtitle:     { fontSize: 11, color: t.colors.textHint, marginTop: 1 },

    suggestion: {
      fontSize:     13,
      color:        t.colors.textSub,
      lineHeight:   20,
      marginBottom: 16,
    },

    detailRow: {
      flexDirection:  'row',
      alignItems:     'center',
      justifyContent: 'space-between',
      gap:            12,
    },
    drillInfo: { flex: 1 },
    drillName: {
      fontSize:     13,
      fontWeight:   '700',
      color:        t.colors.text,
      marginBottom: 6,
    },
    tagRow: { flexDirection: 'row', gap: 6 },
    diffTag: {
      backgroundColor: t.colors.sportSoft,
      borderRadius:    7,
      paddingHorizontal: 8,
      paddingVertical:   3,
    },
    diffTxt: { fontSize: 11, fontWeight: '700', color: t.colors.textSub },
    xpTag:   {
      backgroundColor: '#FEF3C7',
      borderRadius:    7,
      paddingHorizontal: 8,
      paddingVertical:   3,
    },
    xpTxt:   { fontSize: 11, fontWeight: '700', color: '#92400E' },

    startBtn: {
      backgroundColor:   t.colors.deepGreen,
      borderRadius:      14,
      paddingHorizontal: 16,
      paddingVertical:   12,
      flexDirection:     'row',
      alignItems:        'center',
      gap:               6,
    },
    startTxt:   { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
    startArrow: { fontSize: 14 },
  })
}
