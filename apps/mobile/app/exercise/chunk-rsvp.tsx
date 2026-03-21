import { usePendingSheetStore } from '../../src/stores/pendingSheetStore'
import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../src/stores/authStore'
import { supabase } from '../../src/lib/supabase'
import { createChunkRsvpService } from '@sprinta/api'

import ChunkRSVPExercise, { ChunkRSVPMetrics } from '../../src/components/exercises/SpeedControl/ChunkRSVPExercise'
import type { ImportedContent } from '../../src/components/exercises/shared/ContentImportModal'
import ContentLibraryScreen from '../../src/screens/reading/ContentLibraryScreen'
import ModuleSetupScreen from '../../src/screens/reading/ModuleSetupScreen'

const chunkSvc   = createChunkRsvpService(supabase)
const ACCENT     = '#0891B2'
const MODULE_KEY = 'chunk-rsvp'

type Phase = 'setup' | 'picking' | 'reading'

export default function ChunkRSVPScreen() {
  const router      = useRouter()
  const { student } = useAuthStore()

  const [phase,   setPhase]   = useState<Phase>('setup')
  const [content, setContent] = useState<ImportedContent | null>(null)

  const onExit = () => (usePendingSheetStore.getState().setPendingSheet('okuma'), router.back())

  if (phase === 'setup') {
    return (
      <ModuleSetupScreen
        moduleKey={MODULE_KEY}
        onSelectText={() => setPhase('picking')}
        onQuickStart={() => setPhase('reading')}
        onBack={onExit}
      />
    )
  }

  if (phase === 'picking') {
    return (
      <ContentLibraryScreen
        accentColor={ACCENT}
        moduleKey={MODULE_KEY}
        onContentSelected={(c) => { setContent(c); setPhase('reading') }}
        onBack={() => setPhase('setup')}
      />
    )
  }

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
