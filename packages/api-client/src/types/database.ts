// Supabase Database Types
// Bu dosya `supabase gen types typescript` ile güncellenir
// Manuel olarak şema ile eşlenmiştir

export type ExamType = 'lgs' | 'tyt' | 'ayt' | 'kpss' | 'ales' | 'yds' | 'other'
export type GradeLevel =
  | 'ilkokul_3' | 'ilkokul_4'
  | 'ortaokul_5' | 'ortaokul_6' | 'ortaokul_7' | 'ortaokul_8'
  | 'lise_9' | 'lise_10' | 'lise_11' | 'lise_12'
  | 'universite' | 'yetiskin'
export type ModuleCode = 'speed_control' | 'deep_comprehension' | 'attention_power' | 'mental_reset'
export type ExerciseType =
  | 'rsvp' | 'pacing' | 'speed_burst' | 'chunking'
  | 'main_idea' | 'detail_recall' | 'inference' | 'critical_reading'
  | 'focus_lock' | 'distraction_resist' | 'sustained_focus'
  | 'breathing' | 'eye_relaxation' | 'focus_reset'
export type SessionType = 'exercise' | 'diagnostic' | 'free_reading'
export type DiagnosticType = 'initial' | 'periodic' | 'final'
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'trialing' | 'past_due'
export type TenantType = 'school' | 'tutoring_center' | 'individual'
export type TenantTier = 'starter' | 'professional' | 'enterprise'

export type Database = {
  public: {
    Tables: {
      students: {
        Row: {
          id: string
          auth_user_id: string
          tenant_id: string | null
          email: string
          full_name: string
          grade_level: GradeLevel
          exam_target: ExamType
          baseline_wpm: number
          baseline_comprehension: number
          baseline_arp: number
          current_wpm: number
          current_comprehension: number
          current_arp: number
          growth_score: number
          total_xp: number
          level: number
          streak_days: number
          longest_streak: number
          last_activity_at: string | null
          is_active: boolean
          is_premium: boolean
          has_completed_diagnostic: boolean
          student_number: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['students']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['students']['Insert']>
      }
      tenants: {
        Row: {
          id: string
          type: TenantType
          name: string
          slug: string
          tier: TenantTier
          max_students: number
          used_students: number
          contract_start: string | null
          contract_end: string | null
          trial_ends_at: string | null
          is_trial: boolean
          tax_id: string | null
          billing_address: Record<string, unknown>
          monthly_revenue: number
          is_active: boolean
          primary_email: string
          phone: string | null
          city: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['tenants']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['tenants']['Insert']>
      }
      sessions: {
        Row: {
          id: string
          student_id: string
          exercise_id: string
          content_id: string | null
          session_type: SessionType
          started_at: string
          completed_at: string | null
          duration_seconds: number
          is_completed: boolean
          metrics: Record<string, unknown>
          rei: number
          csf: number
          arp: number
          xp_earned: number
          fatigue_level: string
          suggested_difficulty: number | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['sessions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['sessions']['Insert']>
      }
      cognitive_profiles: {
        Row: {
          id: string
          student_id: string
          sustainable_wpm: number
          peak_wpm: number
          comprehension_baseline: number
          rei: number
          csf: number
          arp: number
          stability_index: number
          speed_skill: number
          comprehension_skill: number
          attention_skill: number
          fatigue_resistance: number
          primary_weakness: ModuleCode | null
          secondary_weakness: ModuleCode | null
          recommended_focus: ModuleCode | null
          session_count: number
          last_calculated_at: string
        }
        Insert: Omit<Database['public']['Tables']['cognitive_profiles']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['cognitive_profiles']['Insert']>
      }
      diagnostics: {
        Row: {
          id: string
          student_id: string
          diagnostic_type: DiagnosticType
          baseline_wpm: number
          baseline_comprehension: number
          baseline_arp: number
          speed_test_wpm: number | null
          comprehension_score: number | null
          attention_score: number | null
          primary_weakness: ModuleCode | null
          secondary_weakness: ModuleCode | null
          recommended_path: string | null
          ai_summary: string | null
          completed_at: string
        }
        Insert: Omit<Database['public']['Tables']['diagnostics']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['diagnostics']['Insert']>
      }
      badges: {
        Row: {
          id: string
          code: string
          name: string
          description: string
          icon_name: string
          color: string
          category: string
          rarity: string
          condition_type: string
          condition_value: number
          xp_reward: number
          is_active: boolean
        }
        Insert: Omit<Database['public']['Tables']['badges']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['badges']['Insert']>
      }
      student_badges: {
        Row: {
          id: string
          student_id: string
          badge_id: string
          earned_at: string
        }
        Insert: Omit<Database['public']['Tables']['student_badges']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['student_badges']['Insert']>
      }
    }
    Views: Record<string, never>
    Functions: {
      get_student_id: { Args: Record<never, never>; Returns: string }
      get_tenant_id: { Args: Record<never, never>; Returns: string }
      is_tenant_admin: { Args: Record<never, never>; Returns: boolean }
      is_super_admin: { Args: Record<never, never>; Returns: boolean }
      get_admin_tenant_id: { Args: Record<never, never>; Returns: string }
    }
  }
}
