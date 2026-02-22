// eslint-disable-next-line @typescript-eslint/no-explicit-any
import type { SupabaseClient } from '@supabase/supabase-js'
import { processSession, calculateSustainableWpm, calculateStabilityIndex } from '@sprinta/shared'
import type { SessionMetrics, CognitiveProfile } from '@sprinta/shared'

/**
 * Performans pipeline — session tamamlandığında tüm adımları çalıştırır
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createPerformancePipeline(supabase: SupabaseClient<any>) {
  /**
   * Session tamamla: hesapla → session kaydet → profili güncelle → günlük stat
   */
  async function completeSession(params: {
    studentId: string
    exerciseId: string
    metrics: SessionMetrics
    arpHistory: number[]
    profile: CognitiveProfile
  }) {
    const { studentId, exerciseId, metrics, arpHistory, profile } = params

    // 1. Hesapla
    const result = processSession(metrics, profile, arpHistory)

    // 2. Session kaydet
    const sessionPayload = {
      student_id: studentId,
      exercise_id: exerciseId,
      module_code: metrics.moduleCode as string,
      session_type: 'exercise' as string,
      difficulty_level: metrics.difficultyLevel,
      duration_seconds: metrics.durationSeconds,
      is_completed: true,
      metrics: {
        wpm: metrics.wpm,
        comprehension: metrics.comprehension,
        accuracy: metrics.accuracy,
        score: metrics.score,
        errorsPerMinute: metrics.errorsPerMinute ?? 0,
        regressionCount: metrics.regressionCount ?? 0,
      },
      rei: result.rei,
      csf: result.csf,
      arp: result.arp,
      fatigue_score: result.fatigueScore,
      xp_earned: result.xpEarned,
    }

    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert(sessionPayload)
      .select('id')
      .single()

    if (sessionError) throw new Error(`Session kaydedilemedi: ${sessionError.message}`)

    // 3. Bilişsel profili güncelle
    await updateCognitiveProfile(studentId, metrics, result.arp, arpHistory)

    // 4. Günlük istatistik güncelle
    await upsertDailyStats({
      studentId,
      xpEarned: result.xpEarned,
      durationSeconds: metrics.durationSeconds,
      arp: result.arp,
    })

    return {
      sessionId: session.id,
      result,
    }
  }

  /**
   * Bilişsel profili son session verisine göre güncelle
   */
  async function updateCognitiveProfile(
    studentId: string,
    metrics: SessionMetrics,
    currentArp: number,
    arpHistory: number[]
  ) {
    const updatedHistory = [...arpHistory.slice(-9), currentArp]
    const sustainableWpm = calculateSustainableWpm(updatedHistory.map(() => metrics.wpm))
    const stabilityIndex = calculateStabilityIndex(updatedHistory)

    // Skill skorları (0-100): basit normalize
    const speedSkill = Math.min(100, Math.round((metrics.wpm / 400) * 100))
    const comprehensionSkill = Math.min(100, metrics.comprehension)
    const attentionSkill = Math.min(100, metrics.accuracy)

    const { error } = await supabase
      .from('cognitive_profiles')
      .update({
        sustainable_wpm: sustainableWpm,
        peak_wpm: metrics.wpm,
        stability_index: stabilityIndex,
        speed_skill: speedSkill,
        comprehension_skill: comprehensionSkill,
        attention_skill: attentionSkill,
        updated_at: new Date().toISOString(),
      })
      .eq('student_id', studentId)

    if (error) console.error('Profil güncellenemedi:', error.message)
  }

  /**
   * Günlük istatistik oluştur veya güncelle
   */
  async function upsertDailyStats(params: {
    studentId: string
    xpEarned: number
    durationSeconds: number
    arp: number
  }) {
    const { studentId, xpEarned, durationSeconds, arp } = params
    const today = new Date().toISOString().split('T')[0]

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).rpc('upsert_daily_stats', {
      p_student_id: studentId,
      p_date: today,
      p_xp_earned: xpEarned,
      p_duration_seconds: durationSeconds,
      p_arp: arp,
    })

    if (error) console.error('Günlük stat güncellenemedi:', error.message)
  }

  /**
   * Öğrencinin son N session ARP geçmişini çek
   */
  async function getArpHistory(studentId: string, limit = 10): Promise<number[]> {
    const { data, error } = await supabase
      .from('sessions')
      .select('arp')
      .eq('student_id', studentId)
      .eq('is_completed', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error || !data) return []
    return data.map((s) => s.arp).reverse()
  }

  /**
   * Öğrencinin mevcut bilişsel profilini çek
   */
  async function getCognitiveProfile(studentId: string): Promise<CognitiveProfile | null> {
    const { data, error } = await supabase
      .from('cognitive_profiles')
      .select('*')
      .eq('student_id', studentId)
      .single()

    if (error || !data) return null

    return {
      sustainableWpm: data.sustainable_wpm ?? 0,
      peakWpm: data.peak_wpm ?? 0,
      comprehensionBaseline: data.comprehension_baseline ?? 0,
      stabilityIndex: data.stability_index ?? 0.5,
      fatigueThreshold: data.fatigue_threshold ?? 50,
      speedSkill: data.speed_skill ?? 0,
      comprehensionSkill: data.comprehension_skill ?? 0,
      attentionSkill: data.attention_skill ?? 0,
      primaryWeakness: data.primary_weakness ?? null,
      secondaryWeakness: data.secondary_weakness ?? null,
    }
  }

  return {
    completeSession,
    updateCognitiveProfile,
    upsertDailyStats,
    getArpHistory,
    getCognitiveProfile,
  }
}
