/**
 * BrainPowerMap — v4 Modern Design
 * Beyaz kartlar · Teal çubuklar · Mavi aksan
 * 2-col grid · Level 1-10 · Animated bars · Tap → Detail Modal
 */
import React, { useState, useEffect, useRef } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  Modal, Pressable, Animated,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'
import { useHomeStore } from '../../../stores/homeStore'
import type { SkillLevel } from '../../../stores/homeStore'

const BLUE   = '#2D5BE3'
const TEAL   = '#40C8F0'   // İş Bankası accent blue
const CARD   = '#FFFFFF'
const BORDER = '#E2E8F8'
const TEXT   = '#1A1A2E'
const TEXT_S = '#6B7A99'
const TEXT_H = '#8892A4'
const SOFT   = '#F0F4FF'
const ORANGE = '#F59E0B'
const RED    = '#EF4444'

// ─── Yardımcı ─────────────────────────────────────────────────────
function toLevel(value: number): number {
  return Math.max(1, Math.min(10, Math.ceil(value / 10)))
}

function barColor(value: number): string {
  if (value >= 70) return TEAL
  if (value >= 50) return ORANGE
  return RED
}

// ─── Skill Cell ───────────────────────────────────────────────────
function SkillCell({
  skill,
  onPress,
}: {
  skill:   SkillLevel
  onPress: () => void
}) {
  const level   = toLevel(skill.value)
  const barAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(barAnim, {
      toValue: skill.value, duration: 700, useNativeDriver: false,
    }).start()
  }, [skill.value])

  return (
    <TouchableOpacity
      style={cs.cell}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        onPress()
      }}
      activeOpacity={0.75}
    >
      <View style={cs.cellHeader}>
        <Text style={cs.cellIcon}>{skill.icon}</Text>
        <View style={cs.levelBadge}>
          <Text style={cs.levelTxt}>Lv.{level}</Text>
        </View>
      </View>
      <Text style={cs.cellLabel}>{skill.label}</Text>
      <View style={cs.barBg}>
        <Animated.View
          style={[
            cs.barFill,
            {
              width: barAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
              backgroundColor: barColor(skill.value),
            },
          ]}
        />
      </View>
      <View style={cs.cellFooter}>
        <Text style={cs.cellValue}>{skill.value}/100</Text>
        <Text style={cs.tapHint}>›</Text>
      </View>
    </TouchableOpacity>
  )
}

const cs = StyleSheet.create({
  cell: {
    flex: 1,
    backgroundColor: CARD,
    borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4,
    elevation: 2,
  },
  cellHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 6,
  },
  cellIcon: { fontSize: 22 },
  levelBadge: {
    backgroundColor: 'rgba(0,212,170,0.12)',
    borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2,
  },
  levelTxt:   { fontSize: 10, fontWeight: '800', color: TEAL },
  cellLabel:  { fontSize: 13, fontWeight: '700', color: TEXT, marginBottom: 8 },
  barBg:      { height: 5, backgroundColor: SOFT, borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  barFill:    { height: 5, borderRadius: 3 },
  cellFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cellValue:  { fontSize: 11, color: TEXT_H, fontWeight: '600' },
  tapHint:    { fontSize: 16, color: TEXT_H },
})

// ─── Detail Modal ─────────────────────────────────────────────────
function SkillModal({
  skill,
  onClose,
}: {
  skill:   SkillLevel | null
  onClose: () => void
}) {
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
      <Pressable style={ms.overlay} onPress={onClose}>
        <Pressable style={ms.card} onPress={() => {}}>
          <View style={ms.header}>
            <Text style={ms.headerIcon}>{skill.icon}</Text>
            <View>
              <Text style={ms.headerTitle}>{skill.label}</Text>
              <Text style={ms.headerLevel}>Seviye {level}/10</Text>
            </View>
            <TouchableOpacity style={ms.closeBtn} onPress={onClose}>
              <Text style={ms.closeTxt}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={ms.levelBarBg}>
            <View style={[ms.levelBarFill, { width: `${skill.value}%` as any }]} />
          </View>
          <Text style={ms.valueText}>{skill.value}/100 puan</Text>

          <Text style={ms.description}>{skill.description}</Text>

          <TouchableOpacity
            style={ms.drillBtn}
            activeOpacity={0.85}
            onPress={() => {
              onClose()
              setTimeout(() => router.push(skill.drillRoute as any), 100)
            }}
          >
            <Text style={ms.drillTxt}>→ {skill.drillLabel}</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const ms = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(13,27,62,0.45)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: CARD,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40,
  },
  header: {
    flexDirection: 'row', alignItems: 'center',
    gap: 12, marginBottom: 16,
  },
  headerIcon:  { fontSize: 32 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: BLUE },
  headerLevel: { fontSize: 13, color: TEXT_S, marginTop: 2 },
  closeBtn:    { marginLeft: 'auto', padding: 6 },
  closeTxt:    { fontSize: 18, color: TEXT_H },
  levelBarBg: {
    height: 8, backgroundColor: SOFT,
    borderRadius: 4, overflow: 'hidden', marginBottom: 6,
  },
  levelBarFill: { height: 8, backgroundColor: TEAL, borderRadius: 4 },
  valueText:    { fontSize: 12, color: TEXT_S, marginBottom: 14, fontWeight: '600' },
  description:  { fontSize: 14, color: TEXT_S, lineHeight: 22, marginBottom: 20 },
  drillBtn: {
    backgroundColor: BLUE, borderRadius: 14,
    paddingVertical: 14, alignItems: 'center',
  },
  drillTxt: { fontSize: 15, fontWeight: '700', color: '#fff' },
})

// ─── Ana Bileşen ──────────────────────────────────────────────────
export function BrainPowerMap() {
  const { skills } = useHomeStore()
  const [modalSkill, setModalSkill] = useState<SkillLevel | null>(null)

  const rows: SkillLevel[][] = []
  for (let i = 0; i < skills.length; i += 2) {
    rows.push(skills.slice(i, i + 2))
  }

  return (
    <View style={wrap.container}>
      <Text style={wrap.sectionTitle}>🧠 Bilişsel Güç Haritası</Text>

      {rows.map((row, ri) => (
        <View key={ri} style={[wrap.row, ri > 0 && wrap.rowGap]}>
          {row.map((skill) => (
            <SkillCell
              key={skill.id}
              skill={skill}
              onPress={() => setModalSkill(skill)}
            />
          ))}
          {row.length === 1 && <View style={{ flex: 1 }} />}
        </View>
      ))}

      <SkillModal
        skill={modalSkill}
        onClose={() => setModalSkill(null)}
      />
    </View>
  )
}

const wrap = StyleSheet.create({
  container:    { marginHorizontal: 16, marginTop: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: TEXT, marginBottom: 12 },
  row:          { flexDirection: 'row', gap: 10 },
  rowGap:       { marginTop: 10 },
})
