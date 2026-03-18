import { usePendingSheetStore } from '../../src/stores/pendingSheetStore'
import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../src/stores/authStore'
import type { ImportedContent } from '../../src/components/exercises/shared/ContentImportModal'
import ContentLibraryScreen from '../../src/screens/reading/ContentLibraryScreen'
import ReadingModuleFlow from '../../src/components/reading/ReadingModuleFlow'
import ReadingModesExercise, { ReadingModesMetrics } from '../../src/components/exercises/ReadingModes/ReadingModesExercise'

const ACCENT     = '#EA580C'
const MODULE_KEY = 'timed-reading'

type Phase = 'picking' | 'reading'

export default function TimedReadingScreen() {
  const router      = useRouter()
  const { student } = useAuthStore()
  const [phase,        setPhase]        = useState<Phase>('picking')
  const [content,      setContent]      = useState<ImportedContent | null>(null)
  const [pickFiltered, setPickFiltered] = useState(false)

  const onBack = () => { usePendingSheetStore.getState().setPendingSheet('okuma'); router.back() }

  if (phase === 'picking') {
    return (
      <ContentLibraryScreen
        accentColor={ACCENT}
        moduleKey={MODULE_KEY}
        onContentSelected={(c) => { setContent(c); setPhase('reading') }}
        onBack={onBack}
        initialExamKey={pickFiltered ? (student?.examTarget ?? undefined) : undefined}
      />
    )
  }

  return (
    <ReadingModuleFlow
      moduleKey={MODULE_KEY}
      initialContent={content}
      onBack={onBack}
      renderExercise={(c, onComplete, onExit, accentColor) => (
        <ReadingModesExercise
          mode="timed"
          initialContent={c ?? undefined}
          onComplete={(m: ReadingModesMetrics) => onComplete({
            avgWPM: m.avgWPM, totalWords: m.totalWords,
            durationSeconds: m.durationSeconds, completionRatio: m.completionRatio,
            arpScore: m.arpScore, xpEarned: m.xpEarned,
            libraryTextId: c?.libraryTextId,
          })}
          onExit={onExit}
          accentColor={accentColor}
        />
      )}
    />
  )
}
