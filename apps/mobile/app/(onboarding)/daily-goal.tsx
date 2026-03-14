import { SafeAreaView } from 'react-native-safe-area-context'
import { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated'

const BG     = '#080E1F'
const SURF   = '#111827'
const ACCENT = '#6366F1'
const TEXT   = '#F1F5F9'
const SUB    = '#94A3B8'
const DIM    = '#475569'
const BORDER = '#1E293B'

function ProgressDots({ current }: { current: number }) {
  return (
    <View style={dots.row}>
      {[1, 2, 3].map(i => (
        <View key={i} style={[dots.dot, i === current && dots.active, i < current && dots.done]} />
      ))}
    </View>
  )
}
const dots = StyleSheet.create({
  row:    { flexDirection: 'row', gap: 6, justifyContent: 'center', marginBottom: 28 },
  dot:    { width: 8, height: 8, borderRadius: 4, backgroundColor: BORDER },
  active: { width: 28, backgroundColor: ACCENT },
  done:   { backgroundColor: ACCENT + '60' },
})

const GOALS = [
  { minutes: 10, label: '10 dakika', desc: 'Hafif başlangıç', icon: '☕' },
  { minutes: 20, label: '20 dakika', desc: 'Dengeli ilerleme', icon: '⚡' },
  { minutes: 30, label: '30 dakika', desc: 'Önerilen', recommended: true, icon: '🎯' },
  { minutes: 45, label: '45 dakika', desc: 'Yoğun çalışma', icon: '🔥' },
  { minutes: 60, label: '60 dakika', desc: 'Tam odak', icon: '🏆' },
]

function GoalCard({
  goal, selected, onPress,
}: { goal: typeof GOALS[0]; selected: boolean; onPress: () => void }) {
  const scale = useSharedValue(1)
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  function handlePress() {
    scale.value = withSpring(0.96, { duration: 80 }, () => {
      scale.value = withSpring(1, { duration: 100 })
    })
    onPress()
  }

  return (
    <Animated.View style={style}>
      <TouchableOpacity
        style={[s.option, selected && s.optionSel]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Text style={s.optionIcon}>{goal.icon}</Text>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={[s.optionLabel, selected && s.optionLabelSel]}>{goal.label}</Text>
            {goal.recommended && (
              <View style={s.badge}>
                <Text style={s.badgeText}>⭐ Önerilen</Text>
              </View>
            )}
          </View>
          <Text style={s.optionDesc}>{goal.desc}</Text>
        </View>
        <View style={[s.radio, selected && s.radioSel]}>
          {selected && <View style={s.radioDot} />}
        </View>
      </TouchableOpacity>
    </Animated.View>
  )
}

export default function DailyGoalScreen() {
  const router = useRouter()
  const [selected, setSelected] = useState(30)

  async function handleContinue() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    router.push('/(onboarding)/diagnostic-invite')
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>
        <ProgressDots current={2} />

        <View style={s.header}>
          <Text style={s.title}>Günlük Hedefin</Text>
          <Text style={s.subtitle}>Günde kaç dakika çalışmak istersin?</Text>
        </View>

        <View style={s.options}>
          {GOALS.map(goal => (
            <GoalCard
              key={goal.minutes}
              goal={goal}
              selected={selected === goal.minutes}
              onPress={() => {
                Haptics.selectionAsync()
                setSelected(goal.minutes)
              }}
            />
          ))}
        </View>

        <TouchableOpacity style={s.button} onPress={handleContinue} activeOpacity={0.85}>
          <Text style={s.buttonText}>Devam Et →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: BG },
  container:     { flex: 1, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16 },
  header:        { marginBottom: 24 },
  title:         { fontSize: 28, fontWeight: '800', color: TEXT, marginBottom: 8 },
  subtitle:      { fontSize: 16, color: SUB },
  options:       { flex: 1, gap: 10 },
  option:        {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: SURF, borderRadius: 14, padding: 14,
    borderWidth: 1.5, borderColor: BORDER,
  },
  optionSel:     { borderColor: ACCENT, backgroundColor: '#1E1B4B' },
  optionIcon:    { fontSize: 22, width: 32, textAlign: 'center' },
  optionLabel:   { fontSize: 16, fontWeight: '600', color: TEXT },
  optionLabelSel:{ color: '#A5B4FC' },
  optionDesc:    { fontSize: 13, color: DIM, marginTop: 2 },
  badge:         { backgroundColor: ACCENT + '25', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText:     { fontSize: 11, fontWeight: '700', color: '#A5B4FC' },
  radio:         {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: BORDER,
    alignItems: 'center', justifyContent: 'center',
  },
  radioSel:      { borderColor: ACCENT },
  radioDot:      { width: 10, height: 10, borderRadius: 5, backgroundColor: ACCENT },
  button:        { backgroundColor: ACCENT, borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginTop: 16 },
  buttonText:    { color: '#FFF', fontSize: 17, fontWeight: '700' },
})
