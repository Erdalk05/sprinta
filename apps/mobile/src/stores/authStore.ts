import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createAuthService } from '@sprinta/api'
import { supabase } from '../lib/supabase'

interface Student {
  id: string
  email: string
  fullName: string
  examTarget: string
  gradeLevel: string
  isActive: boolean
  isPremium: boolean
  hasCompletedDiagnostic: boolean
  currentArp: number
  totalXp: number
  level: number
  streakDays: number
}

interface AuthState {
  student: Student | null
  isLoading: boolean
  isAuthenticated: boolean

  register: (input: {
    fullName: string
    email: string
    password: string
    examTarget: string
    gradeLevel: string
  }) => Promise<{ success: boolean; error?: string }>

  login: (input: {
    email: string
    password: string
  }) => Promise<{ success: boolean; error?: string }>

  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
  updateProfile: (updates: Partial<Student>) => void
}

const authService = createAuthService(supabase)

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      student: null,
      isLoading: false,
      isAuthenticated: false,

      register: async (input) => {
        set({ isLoading: true })
        try {
          const result = await authService.register(input as Parameters<typeof authService.register>[0])
          if (!result.success) {
            return { success: false, error: result.error }
          }
          await get().refreshProfile()
          set({ isAuthenticated: true })
          return { success: true }
        } finally {
          set({ isLoading: false })
        }
      },

      login: async (input) => {
        set({ isLoading: true })
        try {
          const result = await authService.login(input)
          if (!result.success) {
            return { success: false, error: result.error }
          }
          await get().refreshProfile()
          set({ isAuthenticated: true })
          return { success: true }
        } finally {
          set({ isLoading: false })
        }
      },

      logout: async () => {
        set({ isLoading: true })
        try {
          await authService.logout()
          set({ student: null, isAuthenticated: false })
        } finally {
          set({ isLoading: false })
        }
      },

      refreshProfile: async () => {
        try {
          const { data, error } = await supabase
            .from('students')
            .select(`
              id, email, full_name, exam_target, grade_level,
              is_active, is_premium, has_completed_diagnostic,
              current_arp, total_xp, level, streak_days
            `)
            .single()

          if (error || !data) return

          set({
            student: {
              id: data.id,
              email: data.email,
              fullName: data.full_name,
              examTarget: data.exam_target,
              gradeLevel: data.grade_level,
              isActive: data.is_active,
              isPremium: data.is_premium,
              hasCompletedDiagnostic: data.has_completed_diagnostic,
              currentArp: data.current_arp,
              totalXp: data.total_xp,
              level: data.level,
              streakDays: data.streak_days,
            },
          })
        } catch (err) {
          console.error('Profil yüklenirken hata:', err)
        }
      },

      updateProfile: (updates) => {
        const current = get().student
        if (current) {
          set({ student: { ...current, ...updates } })
        }
      },
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        student: state.student,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
