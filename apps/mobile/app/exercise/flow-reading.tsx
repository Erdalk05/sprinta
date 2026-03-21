import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../src/stores/authStore'
import { supabase } from '../../src/lib/supabase'
import { usePendingSheetStore } from '../../src/stores/pendingSheetStore'
import { createFlowReadingService } from '@sprinta/api'

import FlowReadingExercise, { FlowReadingMetrics } from '../../src/components/exercises/SpeedControl/FlowReadingExercise'
import type { ImportedContent } from '../../src/components/exercises/shared/ContentImportModal'
import ContentLibraryScreen from '../../src/screens/reading/ContentLibraryScreen'
import ModuleSetupScreen from '../../src/screens/reading/ModuleSetupScreen'

const flowSvc    = createFlowReadingService(supabase)
const ACCENT     = '#059669'
const MODULE_KEY = 'flow-reading'

type Phase = 'setup' | 'picking' | 'reading'

export default function FlowReadingScreen() {
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
    <FlowReadingExercise
      initialContent={content ?? undefined}
      accentColor={ACCENT}
      onComplete={(m: FlowReadingMetrics) => {
        if (student?.id) flowSvc.saveSession(m, student.id).catch(() => {})
      }}
      onExit={onExit}
      onRepeat={() => { setContent(null); setPhase('setup') }}
    />
  )
}
