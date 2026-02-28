/**
 * /daily-training — Günlük Antrenman Rotası
 *
 * TrainingBottomSheet'teki "Günlük Antrenman" kartından açılır.
 * DailyTrainingSession bileşenini tam ekran olarak render eder.
 */

import React from 'react'
import { View, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import DailyTrainingSession from '../../src/components/training/DailyTrainingSession'
import { useVisualMechanicsStore } from '../../src/features/visual-mechanics/store/visualMechanicsStore'

export default function DailyTrainingScreen() {
  const router = useRouter()

  // Seri gün sayısı — basit yaklaşım: son 7 günde kaç gün egzersiz yapılmış
  const completedExercises = useVisualMechanicsStore((s) => s.completedExercises)
  const streakDays = React.useMemo(() => {
    const days = new Set<string>()
    const now = Date.now()
    for (const r of completedExercises) {
      const diff = now - new Date(r.completedAt).getTime()
      if (diff < 7 * 24 * 60 * 60 * 1000) {
        days.add(new Date(r.completedAt).toDateString())
      }
    }
    return Math.max(1, days.size)
  }, [completedExercises])

  return (
    <SafeAreaProvider>
      <View style={s.root}>
        <DailyTrainingSession
          streakDays={streakDays}
          onFinish={() => router.back()}
        />
      </View>
    </SafeAreaProvider>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A0F1F' },
})
