// eslint-disable-next-line @typescript-eslint/no-explicit-any
import type { SupabaseClient } from '@supabase/supabase-js'

export interface SaveDiagnosticParams {
  studentId: string
  baselineWpm: number
  baselineComprehension: number
  baselineArp: number
  durationSeconds: number
  primaryWeakness: string | null
  secondaryWeakness: string | null
  recommendedPath: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createDiagnosticService(supabase: SupabaseClient<any>) {
  /**
   * Tanılama sonucunu kaydet ve öğrenci profilini güncelle
   */
  async function saveInitialDiagnostic(params: SaveDiagnosticParams): Promise<{ success: boolean; error?: string }> {
    const {
      studentId,
      baselineWpm,
      baselineComprehension,
      baselineArp,
      durationSeconds,
      primaryWeakness,
      secondaryWeakness,
      recommendedPath,
    } = params

    // 1. diagnostics tablosuna kaydet
    const { error: diagError } = await supabase.from('diagnostics').insert({
      student_id: studentId,
      diagnostic_type: 'initial',
      baseline_wpm: baselineWpm,
      baseline_comprehension: baselineComprehension,
      baseline_arp: baselineArp,
      speed_test_wpm: baselineWpm,
      comprehension_score: baselineComprehension,
      primary_weakness: primaryWeakness,
      secondary_weakness: secondaryWeakness,
      recommended_path: recommendedPath,
    })

    if (diagError) {
      return { success: false, error: diagError.message }
    }

    // 2. students tablosunu güncelle (trigger da çalışır ama açık olsun)
    const { error: studentError } = await supabase
      .from('students')
      .update({
        has_completed_diagnostic: true,
        baseline_wpm: baselineWpm,
        baseline_comprehension: baselineComprehension,
        baseline_arp: baselineArp,
        current_wpm: baselineWpm,
        current_comprehension: baselineComprehension,
        current_arp: baselineArp,
        last_activity_at: new Date().toISOString(),
      })
      .eq('id', studentId)

    if (studentError) {
      return { success: false, error: studentError.message }
    }

    // 3. cognitive_profiles güncelle
    const speedSkill = Math.min(100, Math.round((baselineWpm / 400) * 100))
    await supabase
      .from('cognitive_profiles')
      .update({
        sustainable_wpm: baselineWpm,
        peak_wpm: baselineWpm,
        comprehension_baseline: baselineComprehension,
        speed_skill: speedSkill,
        comprehension_skill: baselineComprehension,
        primary_weakness: primaryWeakness,
        secondary_weakness: secondaryWeakness,
        updated_at: new Date().toISOString(),
      })
      .eq('student_id', studentId)

    return { success: true }
  }

  /**
   * Öğrencinin daha önce tanılama yapıp yapmadığını kontrol et
   */
  async function hasCompletedDiagnostic(studentId: string): Promise<boolean> {
    const { data } = await supabase
      .from('students')
      .select('has_completed_diagnostic')
      .eq('id', studentId)
      .single()
    return data?.has_completed_diagnostic ?? false
  }

  return { saveInitialDiagnostic, hasCompletedDiagnostic }
}
