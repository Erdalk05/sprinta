// =====================================================
// adminGuard.ts — Sprint 6
// Server-side admin role guard (App Router)
// =====================================================

import { redirect } from 'next/navigation'
import { createServerClient } from './supabase/server'

/**
 * Server Component / Route Handler'da çağrılır.
 * Admin değilse redirect atar — asla throw etmez.
 */
export async function requireAdmin(): Promise<void> {
  const supabase = await createServerClient()

  // ── 1. Session kontrolü ───────────────────────────
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // ── 2. Role kontrolü ─────────────────────────────
  const { data: student, error } = await supabase
    .from('students')
    .select('role')
    .eq('auth_user_id', user.id)
    .single()

  if (error || !student || student.role !== 'admin') {
    redirect('/')
  }
}
