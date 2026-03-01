'use client'
// =====================================================
// useAdminGuard.ts — Sprint 6
// Client-side ek güvenlik katmanı
// =====================================================

import { useEffect, useState } from 'react'
import { useRouter }           from 'next/navigation'
import { createClient }        from '../lib/supabase/client'

interface AdminGuardState {
  isAdmin:  boolean
  loading:  boolean
}

export function useAdminGuard(): AdminGuardState {
  const router = useRouter()
  const [state, setState] = useState<AdminGuardState>({ isAdmin: false, loading: true })

  useEffect(() => {
    let cancelled = false

    async function check(): Promise<void> {
      const supabase = createClient()

      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          if (!cancelled) router.replace('/login')
          return
        }

        const { data: student } = await supabase
          .from('students')
          .select('role')
          .eq('auth_user_id', user.id)
          .single()

        if (!cancelled) {
          if (!student || student.role !== 'admin') {
            router.replace('/')
            setState({ isAdmin: false, loading: false })
          } else {
            setState({ isAdmin: true, loading: false })
          }
        }
      } catch {
        if (!cancelled) {
          router.replace('/login')
          setState({ isAdmin: false, loading: false })
        }
      }
    }

    void check()
    return () => { cancelled = true }
  }, [router])

  return state
}
