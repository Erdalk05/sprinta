import { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'

const GOALS = [
  { minutes: 10, label: '10 dakika', desc: 'Hafif başlangıç' },
  { minutes: 20, label: '20 dakika', desc: 'Dengeli ilerleme' },
  { minutes: 30, label: '30 dakika', desc: 'Önerilen', recommended: true },
  { minutes: 45, label: '45 dakika', desc: 'Yoğun çalışma' },
  { minutes: 60, label: '60 dakika', desc: 'Tam odak' },
]

export default function DailyGoalScreen() {
  const router = useRouter()
  const [selected, setSelected] = useState(30)

  async function handleContinue() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    router.push('/(onboarding)/diagnostic-invite')
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.step}>2 / 3</Text>
        <Text style={styles.title}>Günlük Hedefin</Text>
        <Text style={styles.subtitle}>
          Günde kaç dakika çalışmak istersin?
        </Text>
      </View>

      <View style={styles.options}>
        {GOALS.map(goal => (
          <TouchableOpacity
            key={goal.minutes}
            style={[
              styles.option,
              selected === goal.minutes && styles.optionSelected,
            ]}
            onPress={() => {
              Haptics.selectionAsync()
              setSelected(goal.minutes)
            }}
          >
            <View style={styles.optionLeft}>
              <Text style={[
                styles.optionLabel,
                selected === goal.minutes && styles.optionLabelSelected,
              ]}>
                {goal.label}
              </Text>
              <Text style={styles.optionDesc}>
                {goal.desc}
                {goal.recommended ? ' ⭐' : ''}
              </Text>
            </View>
            {selected === goal.minutes && (
              <Text style={styles.check}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>Devam Et →</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', padding: 24 },
  header: { marginTop: 60, marginBottom: 40 },
  step: { color: '#6366F1', fontSize: 13, fontWeight: '600', marginBottom: 12 },
  title: { fontSize: 28, fontWeight: '700', color: '#F1F5F9', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#94A3B8' },
  options: { flex: 1, gap: 12 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  optionSelected: { borderColor: '#6366F1', backgroundColor: '#1E1B4B' },
  optionLeft: { gap: 2 },
  optionLabel: { fontSize: 17, fontWeight: '600', color: '#CBD5E1' },
  optionLabelSelected: { color: '#A5B4FC' },
  optionDesc: { fontSize: 13, color: '#64748B' },
  check: { fontSize: 20, color: '#6366F1' },
  button: {
    backgroundColor: '#6366F1',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
})
