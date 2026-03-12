// Göz Genişliği Antrenmanı route wrapper
import React, { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import FixationTrainerExercise, {
  type FixationTrainerMetrics,
} from '../../src/components/exercises/FixationTrainer/FixationTrainerExercise'
import { supabase } from '../../src/lib/supabase'

export default function FixationTrainerScreen() {
  const router = useRouter()
  const [spanLevel, setSpanLevel] = useState(1)
  const [userId,    setUserId]    = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setUserId(user.id)
      AsyncStorage.getItem(`fixation_span_${user.id}`).then(val => {
        if (val) setSpanLevel(Math.max(1, Math.min(5, parseInt(val, 10))))
      }).catch(() => {})
    }).catch(() => {})
  }, [])

  const handleComplete = useCallback(async (metrics: FixationTrainerMetrics) => {
    try {
      if (userId) {
        await AsyncStorage.setItem(
          `fixation_span_${userId}`,
          String(metrics.newSpanLevel),
        )
        await (supabase as any)
          .from('fixation_sessions')
          .insert({
            user_id:        userId,
            span_level:     metrics.spanLevel,
            correct_count:  Math.round(metrics.accuracy * 45),
            total_count:    45,
            accuracy:       metrics.accuracy,
            effective_wpm:  metrics.effectiveWPM,
            new_span_level: metrics.newSpanLevel,
            xp_earned:      metrics.xpEarned,
            duration_ms:    metrics.durationMs,
          })
      }
    } catch {
      // sessiz hata
    }
    router.back()
  }, [userId, router])

  return (
    <FixationTrainerExercise
      spanLevel={spanLevel}
      onComplete={handleComplete}
      onExit={() => router.back()}
    />
  )
}
