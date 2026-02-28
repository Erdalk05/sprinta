import type { SupabaseClient } from '@supabase/supabase-js'
import { createPerformancePipeline } from './performancePipeline'

/**
 * Chunk RSVP seans metrikleri — ChunkRSVPExercise ile uyumlu
 * (Cross-package import kaçınmak için burada tekrar tanımlanmıştır)
 */
export interface ChunkRSVPMetrics {
  avgWPM: number
  peakWPM: number
  totalWords: number
  totalChunks: number
  chunkSize: number
  readingMode: 'sprint' | 'cruise'
  bionicEnabled: boolean
  smartSlowingEnabled: boolean
  arpScore: number
  comprehensionScore: number
  regressionCount: number
  importSource: 'library' | 'text' | 'url'
  // SessionMetrics alanları (apps/mobile/src/components/exercises/types.ts)
  moduleCode: string
  exerciseId: string
  difficultyLevel: number
  durationSeconds: number
  wpm: number
  comprehension: number
  accuracy: number
  score: number
}

export interface WPMDataPoint {
  date: string   // YYYY-MM-DD
  avgWPM: number
  sessions: number
}

// ─── Servis fabrikası ──────────────────────────────────────────────

export function createChunkRsvpService(supabase: SupabaseClient) {
  const pipeline = createPerformancePipeline(supabase)

  /**
   * Seans kaydet — sessions tablosuna + XP + bilişsel profil güncelle
   */
  async function saveSession(metrics: ChunkRSVPMetrics, studentId: string): Promise<void> {
    try {
      const arpHistory = await pipeline.getArpHistory(studentId)

      await supabase.from('sessions').insert({
        student_id: studentId,
        exercise_id: 'chunk_rsvp',
        module_code: 'speed_control',
        session_type: 'exercise',
        difficulty_level: metrics.difficultyLevel,
        duration_seconds: metrics.durationSeconds,
        is_completed: true,
        metrics: {
          wpm: metrics.avgWPM,
          comprehension: metrics.comprehensionScore,
          accuracy: metrics.accuracy,
          score: metrics.score,
          chunkSize: metrics.chunkSize,
          totalWords: metrics.totalWords,
          peakWPM: metrics.peakWPM,
          bionicEnabled: metrics.bionicEnabled,
          regressionCount: metrics.regressionCount,
        },
        arp: metrics.arpScore,
        xp_earned: Math.round(metrics.arpScore / 3),
      })

      await pipeline.updateCognitiveProfile(
        studentId,
        {
          moduleCode: 'speed_control',
          exerciseType: 'chunk_rsvp',
          wpm: metrics.avgWPM,
          comprehension: metrics.comprehensionScore,
          accuracy: metrics.accuracy,
          score: metrics.score,
          durationSeconds: metrics.durationSeconds,
          difficultyLevel: metrics.difficultyLevel,
          regressionCount: metrics.regressionCount,
        },
        metrics.arpScore,
        arpHistory,
      )

      await pipeline.upsertDailyStats({
        studentId,
        xpEarned: Math.round(metrics.arpScore / 3),
        durationSeconds: metrics.durationSeconds,
        arp: metrics.arpScore,
      })
    } catch (e) {
      console.warn('ChunkRSVP seans kaydedilemedi:', e)
    }
  }

  /**
   * Son 30 günlük WPM grafiği verisi
   */
  async function getWPMHistory(studentId: string, days = 30): Promise<WPMDataPoint[]> {
    try {
      const since = new Date()
      since.setDate(since.getDate() - days)

      const { data } = await supabase
        .from('sessions')
        .select('created_at, metrics')
        .eq('student_id', studentId)
        .eq('module_code', 'speed_control')
        .gte('created_at', since.toISOString())
        .order('created_at')

      if (!data) return []

      const byDay: Record<string, { total: number; count: number }> = {}
      for (const row of data) {
        const day = (row.created_at as string).slice(0, 10)
        const wpm = (row.metrics as { wpm?: number })?.wpm ?? 0
        if (!byDay[day]) byDay[day] = { total: 0, count: 0 }
        byDay[day].total += wpm
        byDay[day].count += 1
      }

      return Object.entries(byDay).map(([date, v]) => ({
        date,
        avgWPM: Math.round(v.total / v.count),
        sessions: v.count,
      }))
    } catch {
      return []
    }
  }

  /**
   * Önerilen WPM — son 5 seans ortalaması + %10 (comprehension < %60 ise düşür)
   */
  async function getRecommendedWPM(studentId: string, currentWPM: number): Promise<number> {
    try {
      const { data } = await supabase
        .from('sessions')
        .select('metrics')
        .eq('student_id', studentId)
        .eq('module_code', 'speed_control')
        .order('created_at', { ascending: false })
        .limit(5)

      if (!data || data.length === 0) return currentWPM

      const avgWPM = data.reduce((s: number, r: { metrics: unknown }) => s + ((r.metrics as { wpm?: number })?.wpm ?? 0), 0) / data.length
      const avgComp = data.reduce((s: number, r: { metrics: unknown }) => s + ((r.metrics as { comprehension?: number })?.comprehension ?? 70), 0) / data.length

      if (avgComp < 60) return Math.max(100, Math.round(avgWPM * 0.9))
      return Math.round(avgWPM * 1.1)
    } catch {
      return currentWPM
    }
  }

  return { saveSession, getWPMHistory, getRecommendedWPM }
}
