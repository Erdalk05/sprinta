import { usePendingSheetStore } from '../../src/stores/pendingSheetStore'
/**
 * chunk-rsvp.tsx — Chunk RSVP 5-adımlı sihirbaz
 *
 * Adım 1 → ModuleSetupScreen    (modül tanıtımı, faydalar, adımlar)
 * Adım 2-4 → ContentLibraryScreen (sınav → ders → metin seçimi)
 * Adım 5 → ChunkRSVPExercise   (egzersiz + sonuç)
 */
import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../src/stores/authStore'
import { supabase } from '../../src/lib/supabase'
import { createChunkRsvpService } from '@sprinta/api'

import ChunkRSVPExercise, { ChunkRSVPMetrics } from '../../src/components/exercises/SpeedControl/ChunkRSVPExercise'
import type { ImportedContent } from '../../src/components/exercises/shared/ContentImportModal'
import ModuleSetupScreen from '../../src/screens/reading/ModuleSetupScreen'
import ContentLibraryScreen from '../../src/screens/reading/ContentLibraryScreen'

const chunkSvc = createChunkRsvpService(supabase)

const ACCENT = '#0891B2'
const MODULE_KEY = 'chunk-rsvp'

type Phase = 'setup' | 'picking' | 'reading'

export default function ChunkRSVPScreen() {
  const router        = useRouter()
  const { student }   = useAuthStore()

  const [phase,        setPhase]        = useState<Phase>('setup')
  const [content,      setContent]      = useState<ImportedContent | null>(null)
  const [pickFiltered, setPickFiltered] = useState(false)

  const onExit = () => ( usePendingSheetStore.getState().setPendingSheet('okuma'), router.back() )

  // ── Adım 1: Modül Tanıtımı ───────────────────────────────────────
  if (phase === 'setup') {
    return (
      <ModuleSetupScreen
        moduleKey={MODULE_KEY}
        onSelectText={() => { setPickFiltered(false); setPhase('picking') }}
        onQuickStart={() => { setPickFiltered(true);  setPhase('picking') }}
        onBack={onExit}
      />
    )
  }

  // ── Adım 2-4: İçerik Kütüphanesi ────────────────────────────────
  if (phase === 'picking') {
    return (
      <ContentLibraryScreen
        accentColor={ACCENT}
        moduleKey={MODULE_KEY}
        onContentSelected={(c) => { setContent(c); setPhase('reading') }}
        onBack={() => setPhase('setup')}
        initialExamKey={pickFiltered ? (student?.examTarget ?? undefined) : undefined}
      />
    )
  }

  // ── Adım 5: Egzersiz ─────────────────────────────────────────────
  return (
    <ChunkRSVPExercise
      initialContent={content}
      accentColor={ACCENT}
      onComplete={(metrics: ChunkRSVPMetrics) => {
        if (student?.id) chunkSvc.saveSession(metrics, student.id).catch(() => {})
      }}
      onExit={onExit}
      onRepeat={() => { setContent(null); setPhase('setup') }}
    />
  )
}
