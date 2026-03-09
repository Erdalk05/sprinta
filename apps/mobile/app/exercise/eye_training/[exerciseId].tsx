/**
 * /exercise/eye_training/[exerciseId]
 * Göz egzersizi route.
 *
 * Fazlar:
 *   1. intro     → EyeExerciseIntroScreen (seviye seçimi, bilgiler, ARP)
 *   2. countdown → 3-2-1
 *   3. exercise  → Egzersiz bileşeni
 *   4. saving    → Kaydediliyor...
 *   5. done      → Sonuç özeti
 */
import React, { useState, useCallback, useEffect } from 'react'
import {
  View, Text, StyleSheet, SafeAreaView, ActivityIndicator, TouchableOpacity,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { supabase } from '../../../src/lib/supabase'
import { useAuthStore } from '../../../src/stores/authStore'
import { useEyeTrainingStore } from '../../../src/stores/eyeTrainingStore'
import { useStarStore } from '../../../src/stores/starStore'
import { createEyeTrainingService } from '@sprinta/api'
import { EYE_EXERCISE_CONFIGS } from '@sprinta/shared'
import type { EyeMetrics } from '@sprinta/shared'
import EyeExerciseIntroScreen from '../../../src/components/exercises/EyeTraining/EyeExerciseIntroScreen'
import type { DifficultyLevel } from '../../../src/components/exercises/EyeTraining/EyeExerciseIntroScreen'
import { useEyeSoundFeedback } from '../../../src/components/exercises/EyeTraining/useEyeSoundFeedback'

// ── Egzersiz bileşenleri ──────────────────────────────────────────
import FlashAtlamaMatrisi   from '../../../src/components/exercises/EyeTraining/FlashAtlamaMatrisi'
import SchulteTablo         from '../../../src/components/exercises/EyeTraining/SchulteTablo'
import RakamSprint          from '../../../src/components/exercises/EyeTraining/RakamSprint'
import PeriferiFlashAvcisi  from '../../../src/components/exercises/EyeTraining/PeriferiFlashAvcisi'
import SatirPanorama        from '../../../src/components/exercises/EyeTraining/SatirPanorama'
import YildizAgiTarama      from '../../../src/components/exercises/EyeTraining/YildizAgiTarama'
import RastgeleFlashTuzagi  from '../../../src/components/exercises/EyeTraining/RastgeleFlashTuzagi'
import SpiralTakipRitmi     from '../../../src/components/exercises/EyeTraining/SpiralTakipRitmi'
import DalgaSurucusu        from '../../../src/components/exercises/EyeTraining/DalgaSurucusu'
import KartalMeydanOkumasi  from '../../../src/components/exercises/EyeTraining/KartalMeydanOkumasi'
// ── Yeni oyun egzersizleri ────────────────────────────────────────
import BesgenArena          from '../../../src/components/exercises/EyeTraining/BesgenArena'
import ZigZagAtlas          from '../../../src/components/exercises/EyeTraining/ZigZagAtlas'
import MeteorYagmuru        from '../../../src/components/exercises/EyeTraining/MeteorYagmuru'
import KalpRitim            from '../../../src/components/exercises/EyeTraining/KalpRitim'
import PinballGoz           from '../../../src/components/exercises/EyeTraining/PinballGoz'
import CupOyunu             from '../../../src/components/exercises/EyeTraining/CupOyunu'
// ── Yeni kelime/dil egzersizleri ──────────────────────────────────
import KelimeYagmuru       from '../../../src/components/exercises/EyeTraining/KelimeYagmuru'
import HarfZinciri         from '../../../src/components/exercises/EyeTraining/HarfZinciri'
import KelimeEslestirme    from '../../../src/components/exercises/EyeTraining/KelimeEslestirme'
import AnagramCozucu       from '../../../src/components/exercises/EyeTraining/AnagramCozucu'
import KelimeSniper        from '../../../src/components/exercises/EyeTraining/KelimeSniper'
import CumleYarisi         from '../../../src/components/exercises/EyeTraining/CumleYarisi'
import HeceleAtla          from '../../../src/components/exercises/EyeTraining/HeceleAtla'
import SoruKosusu          from '../../../src/components/exercises/EyeTraining/SoruKosusu'

// ── Bileşen haritası ─────────────────────────────────────────────
const EXERCISE_MAP: Record<string, React.ComponentType<import('@sprinta/shared').EyeExerciseProps>> = {
  // Mevcut (yeniden adlandırıldı, kod aynı)
  flash_atlama_matrisi:   FlashAtlamaMatrisi,
  schulte_tablo:          SchulteTablo,
  rakam_sprint:           RakamSprint,
  periferi_flash_avcisi:  PeriferiFlashAvcisi,
  satir_panorama:         SatirPanorama,
  yildiz_agi_tarama:      YildizAgiTarama,
  rastgele_flash_tuzagi:  RastgeleFlashTuzagi,
  spiral_takip_ritmi:     SpiralTakipRitmi,
  dalga_surucusu:         DalgaSurucusu,
  kartal_meydan_okumasi:  KartalMeydanOkumasi,
  // Yeni oyunlar
  besgen_arena:           BesgenArena,
  zigzag_atlas:           ZigZagAtlas,
  meteor_yagmuru:         MeteorYagmuru,
  kalp_ritim:             KalpRitim,
  pinball_goz:            PinballGoz,
  cup_oyunu:              CupOyunu,
  // Kelime/dil egzersizleri
  kelime_yagmuru:         KelimeYagmuru,
  harf_zinciri:           HarfZinciri,
  kelime_eslestirme:      KelimeEslestirme,
  anagram_cozucu:         AnagramCozucu,
  kelime_sniper:          KelimeSniper,
  cumle_yarisi:           CumleYarisi,
  hecele_atla:            HeceleAtla,
  soru_kosusu:            SoruKosusu,
}

const eyeService = createEyeTrainingService(supabase)

type Phase = 'intro' | 'countdown' | 'exercise' | 'saving' | 'done'

// ── Countdown ────────────────────────────────────────────────────
function CountdownScreen({ onDone }: { onDone: () => void }) {
  const [count, setCount] = useState<number | null>(null) // null = sesler yükleniyor
  const { playTick, playAppear } = useEyeSoundFeedback()

  // Sesler yüklensin diye 700ms bekle, sonra 3'ten başla
  useEffect(() => {
    const t = setTimeout(() => setCount(3), 700)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (count === null) return
    if (count === 0) {
      // Başlangıç sesi + başarı haptik
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      playAppear()
      const t = setTimeout(onDone, 350)
      return () => clearTimeout(t)
    }
    // 3-2-1: tik sesi + orta haptik (son sayıda güçlü)
    Haptics.impactAsync(
      count === 1 ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Medium,
    )
    playTick()
    const t = setTimeout(() => setCount(c => (c ?? 1) - 1), 1000)
    return () => clearTimeout(t)
  }, [count])

  return (
    <SafeAreaView style={styles.countdownSafe}>
      <Text style={styles.countdownNum}>{count === null ? '' : count > 0 ? count : '🚀'}</Text>
      <Text style={styles.countdownLabel}>{count === null ? '' : 'Hazırlan!'}</Text>
    </SafeAreaView>
  )
}

// ── Sonuç ─────────────────────────────────────────────────────────
function ResultSummary({
  metrics, xpEarned, onBack, title,
}: { metrics: EyeMetrics; xpEarned: number; onBack: () => void; title: string }) {
  return (
    <SafeAreaView style={styles.resultSafe}>
      <View style={styles.resultCard}>
        <Text style={styles.resultEmoji}>👁</Text>
        <Text style={styles.resultTitle}>Tamamlandı!</Text>
        <Text style={styles.resultExTitle}>{title}</Text>

        <View style={styles.resultGrid}>
          <View style={styles.resultItem}>
            <Text style={styles.resultVal}>{Math.round(metrics.visualAttentionScore)}</Text>
            <Text style={styles.resultKey}>Dikkat Skoru</Text>
          </View>
          <View style={styles.resultItem}>
            <Text style={styles.resultVal}>{Math.round(metrics.accuracyPercent)}%</Text>
            <Text style={styles.resultKey}>Doğruluk</Text>
          </View>
          <View style={styles.resultItem}>
            <Text style={styles.resultVal}>{Math.round(metrics.reactionTimeMs)}ms</Text>
            <Text style={styles.resultKey}>Tepki</Text>
          </View>
        </View>

        <View style={styles.xpBadge}>
          <Text style={styles.xpText}>+{xpEarned} XP</Text>
        </View>

        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
          <Text style={styles.backBtnText}>← Egzersizlere Dön</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

// ── Ana Route ────────────────────────────────────────────────────
export default function EyeExerciseRoute() {
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>()
  const router = useRouter()
  const { student } = useAuthStore()
  const { markCompleted, updateCategoryScore, updateBestScore } = useEyeTrainingStore()
  const recordExercise = useStarStore((s) => s.recordExercise)

  const [phase, setPhase] = useState<Phase>('intro')
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>(2)
  const [savedMetrics, setSavedMetrics] = useState<EyeMetrics | null>(null)
  const [savedXP, setSavedXP] = useState(0)

  const config = EYE_EXERCISE_CONFIGS.find(c => c.id === exerciseId)
  const ExerciseComponent = EXERCISE_MAP[exerciseId ?? '']

  if (!config || !ExerciseComponent) {
    return (
      <SafeAreaView style={styles.errorSafe}>
        <Text style={styles.errorText}>Egzersiz bulunamadı: {exerciseId}</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>← Geri Dön</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  const handleStart = useCallback((level: DifficultyLevel) => {
    setSelectedDifficulty(level)
    setPhase('countdown')
  }, [])

  const handleComplete = useCallback((metrics: EyeMetrics) => {
    const xp = config.xpReward

    markCompleted(config.id)
    updateCategoryScore(config.category, metrics.visualAttentionScore)
    updateBestScore(config.id, metrics.visualAttentionScore)

    // Fire-and-forget — UI'yı bloklamaz
    if (student?.id) {
      eyeService.saveSession({
        studentId:        student.id,
        exerciseId:       config.id,
        category:         config.category,
        difficulty:       selectedDifficulty,
        durationSeconds:  config.durationSeconds,
        metrics,
        xpEarned:         xp,
        isBoss:           config.isBoss ?? false,
      }).catch(() => {})
      recordExercise(student.id, config.id, metrics.visualAttentionScore).catch(() => {})
    }

    setSavedMetrics(metrics)
    setSavedXP(xp)
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    setPhase('done')
  }, [config, student, markCompleted, updateCategoryScore, updateBestScore, selectedDifficulty, recordExercise])

  if (phase === 'intro') {
    return (
      <EyeExerciseIntroScreen
        config={config}
        onStart={handleStart}
        onBack={() => router.back()}
      />
    )
  }

  if (phase === 'countdown') {
    return <CountdownScreen onDone={() => setPhase('exercise')} />
  }

  if (phase === 'exercise') {
    return (
      <ExerciseComponent
        exerciseId={config.id}
        difficulty={selectedDifficulty}
        durationSeconds={config.durationSeconds}
        onComplete={handleComplete}
        onExit={() => setPhase('intro')}
      />
    )
  }

  if (phase === 'saving') {
    return (
      <SafeAreaView style={styles.savingSafe}>
        <ActivityIndicator size="large" color="#40C8F0" />
        <Text style={styles.savingText}>Kaydediliyor...</Text>
      </SafeAreaView>
    )
  }

  return (
    <ResultSummary
      metrics={savedMetrics!}
      xpEarned={savedXP}
      title={config.title}
      onBack={() => router.back()}
    />
  )
}

const BG = '#0A0F1F'

const styles = StyleSheet.create({
  countdownSafe: {
    flex: 1, backgroundColor: BG, alignItems: 'center', justifyContent: 'center',
  },
  countdownNum: { color: '#FFFFFF', fontSize: 110, fontWeight: '900', lineHeight: 120 },
  countdownLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 20, marginTop: 8 },

  savingSafe: {
    flex: 1, backgroundColor: BG, alignItems: 'center', justifyContent: 'center', gap: 16,
  },
  savingText: { color: 'rgba(255,255,255,0.65)', fontSize: 16 },

  resultSafe: {
    flex: 1, backgroundColor: BG, alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  resultCard: {
    backgroundColor: '#162040', borderRadius: 22, padding: 28,
    width: '100%', alignItems: 'center', gap: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 20, elevation: 10,
  },
  resultEmoji:    { fontSize: 48 },
  resultTitle:    { color: '#FFFFFF', fontSize: 24, fontWeight: '800' },
  resultExTitle:  { color: 'rgba(255,255,255,0.55)', fontSize: 13, textAlign: 'center' },
  resultGrid:     { flexDirection: 'row', gap: 14, marginVertical: 4 },
  resultItem:     { alignItems: 'center', flex: 1 },
  resultVal:      { color: '#40C8F0', fontSize: 28, fontWeight: '900' },
  resultKey:      { color: 'rgba(255,255,255,0.45)', fontSize: 11, marginTop: 2 },
  xpBadge: {
    backgroundColor: 'rgba(255,215,0,0.12)',
    borderRadius: 12, paddingHorizontal: 20, paddingVertical: 8,
    borderWidth: 1, borderColor: 'rgba(255,215,0,0.30)',
  },
  xpText:   { color: '#FFD700', fontSize: 18, fontWeight: '800' },
  backBtn: {
    backgroundColor: '#1877F2', borderRadius: 14, paddingVertical: 14,
    paddingHorizontal: 32, width: '100%', alignItems: 'center', marginTop: 4,
  },
  backBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  errorSafe: {
    flex: 1, backgroundColor: BG, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16,
  },
  errorText: { color: '#EF4444', fontSize: 16, textAlign: 'center' },
  backLink:  { color: '#40C8F0', fontSize: 14 },
})
