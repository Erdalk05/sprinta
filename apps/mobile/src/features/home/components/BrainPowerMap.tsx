/**
 * BrainPowerMap — Sport Premium Edition
 * 2-col grid · Level 1-10 · Animated bars · Tap → Detail Modal
 */
import React, { useMemo, useState, useEffect, useRef } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  Modal, Pressable, Animated, ScrollView,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'
import { useHomeStore } from '../../../stores/homeStore'
import { useAppTheme } from '../../../theme/useAppTheme'
import type { AppTheme } from '../../../theme'
import type { SkillLevel } from '../../../stores/homeStore'

// ─── Yardımcı ────────────────────────────────────────────────────
function toLevel(value: number): number {
  return Math.max(1, Math.min(10, Math.ceil(value / 10)))
}

// ─── Skill Cell ───────────────────────────────────────────────────
function SkillCell({
  skill,
  onPress,
  t,
}: {
  skill:   SkillLevel
  onPress: () => void
  t:       AppTheme
}) {
  const level = toLevel(skill.value)
  const s     = useMemo(() => cellStyles(t), [t])

  // Animated bar fill
  const barAnim = useRef(new Animated.Value(0)).current
  useEffect(() => {
    Animated.timing(barAnim, {
      toValue:         skill.value,
      duration:        700,
      useNativeDriver: false,
    }).start()
  }, [skill.value])

  return (
    <TouchableOpacity
      style={s.cell}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        onPress()
      }}
      activeOpacity={0.75}
    >
      {/* Header */}
      <View style={s.cellHeader}>
        <Text style={s.cellIcon}>{skill.icon}</Text>
        <View style={s.levelBadge}>
          <Text style={s.levelTxt}>Lv.{level}</Text>
        </View>
      </View>

      {/* Label */}
      <Text style={s.cellLabel}>{skill.label}</Text>

      {/* Animated bar */}
      <View style={s.barBg}>
        <Animated.View
          style={[
            s.barFill,
            {
              width: barAnim.interpolate({
                inputRange:  [0, 100],
                outputRange: ['0%', '100%'],
              }),
              backgroundColor: skill.value >= 70
                ? t.colors.energyGreen
                : skill.value >= 50
                  ? '#F59E0B'
                  : '#EF4444',
            },
          ]}
        />
      </View>

      {/* Value + tap hint */}
      <View style={s.cellFooter}>
        <Text style={s.cellValue}>{skill.value}/100</Text>
        <Text style={s.tapHint}>›</Text>
      </View>
    </TouchableOpacity>
  )
}

function cellStyles(t: AppTheme) {
  return StyleSheet.create({
    cell: {
      flex:            1,
      backgroundColor: t.colors.sportCard,
      borderRadius:    16,
      padding:         14,
      shadowColor:     '#000',
      shadowOffset:    { width: 0, height: 1 },
      shadowOpacity:   0.06,
      shadowRadius:    4,
      elevation:       2,
    },
    cellHeader: {
      flexDirection:  'row',
      justifyContent: 'space-between',
      alignItems:     'center',
      marginBottom:   6,
    },
    cellIcon:   { fontSize: 22 },
    levelBadge: {
      backgroundColor: 'rgba(0,200,83,0.12)',
      borderRadius:    6,
      paddingHorizontal: 6,
      paddingVertical:   2,
    },
    levelTxt: { fontSize: 10, fontWeight: '800', color: '#00C853' },
    cellLabel: { fontSize: 13, fontWeight: '700', color: t.colors.text, marginBottom: 8 },
    barBg:     { height: 5, backgroundColor: t.colors.sportSoft, borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
    barFill:   { height: 5, borderRadius: 3 },
    cellFooter:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cellValue: { fontSize: 11, color: t.colors.textHint, fontWeight: '600' },
    tapHint:   { fontSize: 16, color: t.colors.textHint },
  })
}

// ─── Detail Modal ─────────────────────────────────────────────────
function SkillModal({
  skill,
  onClose,
  t,
}: {
  skill:   SkillLevel | null
  onClose: () => void
  t:       AppTheme
}) {
  const s      = useMemo(() => modalStyles(t), [t])
  const router = useRouter()
  if (!skill) return null

  const level = toLevel(skill.value)

  return (
    <Modal
      visible={skill !== null}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={s.overlay} onPress={onClose}>
        <Pressable style={s.card} onPress={() => {}}>
          {/* Icon + Title */}
          <View style={s.header}>
            <Text style={s.headerIcon}>{skill.icon}</Text>
            <View>
              <Text style={s.headerTitle}>{skill.label}</Text>
              <Text style={s.headerLevel}>Seviye {level}/10</Text>
            </View>
            <TouchableOpacity style={s.closeBtn} onPress={onClose}>
              <Text style={s.closeTxt}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Level bar */}
          <View style={s.levelBarBg}>
            <View style={[s.levelBarFill, { width: `${skill.value}%` as any }]} />
          </View>
          <Text style={s.valueText}>{skill.value}/100 puan</Text>

          {/* Description */}
          <Text style={s.description}>{skill.description}</Text>

          {/* Drill CTA */}
          <TouchableOpacity
            style={s.drillBtn}
            activeOpacity={0.85}
            onPress={() => {
              onClose()
              setTimeout(() => router.push(skill.drillRoute as any), 100)
            }}
          >
            <Text style={s.drillTxt}>→ {skill.drillLabel}</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

function modalStyles(t: AppTheme) {
  return StyleSheet.create({
    overlay: {
      flex:            1,
      backgroundColor: 'rgba(15,61,46,0.35)',
      justifyContent:  'flex-end',
    },
    card: {
      backgroundColor: t.colors.sportCard,
      borderTopLeftRadius:  24,
      borderTopRightRadius: 24,
      padding: 24,
      paddingBottom: 40,
    },
    header: {
      flexDirection: 'row',
      alignItems:    'center',
      gap:           12,
      marginBottom:  16,
    },
    headerIcon:  { fontSize: 32 },
    headerTitle: { fontSize: 18, fontWeight: '800', color: t.colors.deepGreen },
    headerLevel: { fontSize: 13, color: t.colors.textSub, marginTop: 2 },
    closeBtn:    { marginLeft: 'auto', padding: 6 },
    closeTxt:    { fontSize: 18, color: t.colors.textHint },
    levelBarBg:  {
      height:          8,
      backgroundColor: t.colors.sportSoft,
      borderRadius:    4,
      overflow:        'hidden',
      marginBottom:    6,
    },
    levelBarFill: { height: 8, backgroundColor: '#00C853', borderRadius: 4 },
    valueText:   { fontSize: 12, color: t.colors.textSub, marginBottom: 14, fontWeight: '600' },
    description: { fontSize: 14, color: t.colors.textSub, lineHeight: 22, marginBottom: 20 },
    drillBtn: {
      backgroundColor: t.colors.deepGreen,
      borderRadius:    14,
      paddingVertical: 14,
      alignItems:      'center',
    },
    drillTxt: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  })
}

// ─── Ana Bileşen ─────────────────────────────────────────────────
export function BrainPowerMap() {
  const t      = useAppTheme()
  const s      = useMemo(() => ms(t), [t])
  const { skills } = useHomeStore()
  const [modalSkill, setModalSkill] = useState<SkillLevel | null>(null)

  // 2-col layout: split into pairs
  const rows: SkillLevel[][] = []
  for (let i = 0; i < skills.length; i += 2) {
    rows.push(skills.slice(i, i + 2))
  }

  return (
    <View style={s.wrap}>
      <Text style={s.sectionTitle}>🧠 Bilişsel Güç Haritası</Text>

      {rows.map((row, ri) => (
        <View key={ri} style={[s.row, ri > 0 && s.rowGap]}>
          {row.map((skill) => (
            <SkillCell
              key={skill.id}
              skill={skill}
              t={t}
              onPress={() => setModalSkill(skill)}
            />
          ))}
          {/* Odd last item: empty placeholder */}
          {row.length === 1 && <View style={{ flex: 1 }} />}
        </View>
      ))}

      <SkillModal
        skill={modalSkill}
        onClose={() => setModalSkill(null)}
        t={t}
      />
    </View>
  )
}

// ─── Stiller ─────────────────────────────────────────────────────
function ms(t: AppTheme) {
  return StyleSheet.create({
    wrap:         { marginHorizontal: 16, marginTop: 16 },
    sectionTitle: { fontSize: 14, fontWeight: '700', color: t.colors.text, marginBottom: 12 },
    row:          { flexDirection: 'row', gap: 10 },
    rowGap:       { marginTop: 10 },
  })
}
