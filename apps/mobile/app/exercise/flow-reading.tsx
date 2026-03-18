/**
 * flow-reading.tsx — Akış Okuma 3-adımlı akış
 *
 * Adım 1 → ModuleSetupScreen    (modül tanıtımı, faydalar, adımlar)
 * Adım 2-4 → ContentLibraryScreen (sınav → ders → metin seçimi)
 * Adım 5 → FlowReadingExercise  (egzersiz + sonuç)
 */
import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../src/stores/authStore'
import { supabase } from '../../src/lib/supabase'
import { usePendingSheetStore } from '../../src/stores/pendingSheetStore'
import { createFlowReadingService } from '@sprinta/api'

import FlowReadingExercise, { FlowReadingMetrics } from '../../src/components/exercises/SpeedControl/FlowReadingExercise'
import type { ImportedContent } from '../../src/components/exercises/shared/ContentImportModal'
import ContentLibraryScreen from '../../src/screens/reading/ContentLibraryScreen'

const flowSvc   = createFlowReadingService(supabase)
const ACCENT    = '#059669'
const MODULE_KEY = 'flow-reading'

type Phase = 'picking' | 'reading'

export default function FlowReadingScreen() {
  const router      = useRouter()
  const { student } = useAuthStore()

  const [phase,        setPhase]        = useState<Phase>('picking')
  const [content,      setContent]      = useState<ImportedContent | null>(null)
  const [pickFiltered, setPickFiltered] = useState(false)

  const onExit = () => (usePendingSheetStore.getState().setPendingSheet('okuma'), router.back())

  // ── Adım 1: Modül Tanıtımı ───────────────────────────────────────
  // ── Adım 2-4: İçerik Kütüphanesi ────────────────────────────────
  if (phase === 'picking') {
    return (
      <ContentLibraryScreen
        accentColor={ACCENT}
        moduleKey={MODULE_KEY}
        onContentSelected={(c) => { setContent(c); setPhase('reading') }}
        onBack={onExit}
        initialExamKey={pickFiltered ? (student?.examTarget ?? undefined) : undefined}
      />
    )
  }

  // ── Adım 5: Egzersiz ─────────────────────────────────────────────
  return (
    <FlowReadingExercise
      initialContent={content ?? undefined}
      accentColor={ACCENT}
      onComplete={(m: FlowReadingMetrics) => {
        if (student?.id) flowSvc.saveSession(m, student.id).catch(() => {})
      }}
      onExit={onExit}
      onRepeat={() => { setContent(null); setPhase('picking') }}
    />
  )
}
