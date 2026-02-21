import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

// Validasyon şemaları
export const RegisterSchema = z.object({
  email: z.string().email('Geçerli bir email girin'),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalı'),
  fullName: z.string().min(2, 'Ad soyad en az 2 karakter olmalı'),
  examTarget: z.enum(['lgs', 'tyt', 'ayt', 'kpss', 'ales', 'yds', 'other']),
  gradeLevel: z.string(),
})

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Şifre girin'),
})

export type RegisterInput = z.infer<typeof RegisterSchema>
export type LoginInput = z.infer<typeof LoginSchema>

type AuthResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createAuthService(supabase: ReturnType<typeof createClient<any, any, any>>) {
  return {
    // ── Kayıt ──────────────────────────────────────
    async register(input: RegisterInput): Promise<AuthResult<{ userId: string }>> {
      try {
        const validated = RegisterSchema.parse(input)

        const { data, error } = await supabase.auth.signUp({
          email: validated.email,
          password: validated.password,
          options: {
            data: {
              full_name: validated.fullName,
              exam_target: validated.examTarget,
              grade_level: validated.gradeLevel,
              role: 'student',
            },
          },
        })

        if (error) return { success: false, error: error.message }
        if (!data.user) return { success: false, error: 'Kayıt başarısız' }

        return { success: true, data: { userId: data.user.id } }
      } catch (err) {
        if (err instanceof z.ZodError) {
          return { success: false, error: err.errors[0].message }
        }
        return { success: false, error: 'Kayıt sırasında hata oluştu' }
      }
    },

    // ── Giriş ──────────────────────────────────────
    async login(input: LoginInput): Promise<AuthResult<{ session: unknown }>> {
      try {
        const validated = LoginSchema.parse(input)

        const { data, error } = await supabase.auth.signInWithPassword({
          email: validated.email,
          password: validated.password,
        })

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            return { success: false, error: 'Email veya şifre hatalı' }
          }
          if (error.message.includes('Email not confirmed')) {
            return { success: false, error: 'Email adresinizi doğrulamanız gerekiyor' }
          }
          return { success: false, error: error.message }
        }

        if (!data.session) return { success: false, error: 'Giriş başarısız' }

        return { success: true, data: { session: data.session } }
      } catch (err) {
        return { success: false, error: 'Giriş sırasında hata oluştu' }
      }
    },

    // ── Çıkış ──────────────────────────────────────
    async logout(): Promise<AuthResult<void>> {
      try {
        const { error } = await supabase.auth.signOut()
        if (error) return { success: false, error: error.message }
        return { success: true, data: undefined }
      } catch (err) {
        return { success: false, error: 'Çıkış sırasında hata oluştu' }
      }
    },

    // ── Mevcut kullanıcıyı getir ──────────────────
    async getCurrentUser() {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    },

    // ── Şifre sıfırlama ───────────────────────────
    async resetPassword(email: string): Promise<AuthResult<void>> {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: 'sprinta://auth/reset-password',
        })
        if (error) return { success: false, error: error.message }
        return { success: true, data: undefined }
      } catch (err) {
        return { success: false, error: 'Şifre sıfırlama başarısız' }
      }
    },

    // ── Şifre güncelleme ──────────────────────────
    async updatePassword(newPassword: string): Promise<AuthResult<void>> {
      try {
        if (newPassword.length < 8) {
          return { success: false, error: 'Şifre en az 8 karakter olmalı' }
        }
        const { error } = await supabase.auth.updateUser({ password: newPassword })
        if (error) return { success: false, error: error.message }
        return { success: true, data: undefined }
      } catch (err) {
        return { success: false, error: 'Şifre güncelleme başarısız' }
      }
    },

    // ── Session dinleyicisi ───────────────────────
    onAuthStateChange(callback: (event: string, session: unknown) => void) {
      return supabase.auth.onAuthStateChange(callback)
    },
  }
}
