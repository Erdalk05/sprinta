// Sprint 11 — Göz Genişliği Antrenmanı route wrapper
import React, { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import ReadingModuleIntro from '../../src/components/exercise/ReadingModuleIntro'
import AsyncStorage from '@react-native-async-storage/async-storage'
import FixationTrainerExercise, {
  type FixationTrainerMetrics,
} from '../../src/components/exercises/FixationTrainer/FixationTrainerExercise'
import { supabase } from '../../src/lib/supabase'

export default function FixationTrainerScreen() {
  const router = useRouter()
  const [started,  setStarted]  = useState(false)
  const [spanLevel, setSpanLevel] = useState(1)
  const [userId,    setUserId]    = useState<string | null>(null)

  // Kayıtlı span seviyesini yükle
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
        // Yeni span seviyesini kaydet
        await AsyncStorage.setItem(
          `fixation_span_${userId}`,
          String(metrics.newSpanLevel),
        )

        // DB'ye oturum kaydet
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
    } catch (e) {
      // sessiz hata
    }
    router.back()
  }, [userId, router])

  const handleExit = useCallback(() => {
    router.back()
  }, [router])

  if (!started) return <ReadingModuleIntro moduleKey="fixation-trainer" onStart={() => setStarted(true)} onBack={() => router.back()} />

  return (
    <FixationTrainerExercise
      spanLevel={spanLevel}
      onComplete={handleComplete}
      onExit={handleExit}
    />
  )
}
