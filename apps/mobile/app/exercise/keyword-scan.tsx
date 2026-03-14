import { usePendingSheetStore } from '../../src/stores/pendingSheetStore'
import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import type { ImportedContent } from '../../src/components/exercises/shared/ContentImportModal'
import ModuleSetupScreen from '../../src/screens/reading/ModuleSetupScreen'
import ContentLibraryScreen from '../../src/screens/reading/ContentLibraryScreen'
import ReadingModuleFlow from '../../src/components/reading/ReadingModuleFlow'
import ReadingModesExercise, { ReadingModesMetrics } from '../../src/components/exercises/ReadingModes/ReadingModesExercise'

const ACCENT = '#DC2626'
const MODULE_KEY = 'keyword-scan'

type Phase = 'setup' | 'picking' | 'reading'

export default function KeywordScanScreen() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('setup')
  const [content, setContent] = useState<ImportedContent | null>(null)

  const onBack = () => { usePendingSheetStore.getState().setPendingSheet('okuma'); router.back() }

  if (phase === 'setup') {
    return (
      <ModuleSetupScreen
        moduleKey={MODULE_KEY}
        onSelectText={() => setPhase('picking')}
        onQuickStart={() => setPhase('reading')}
        onBack={onBack}
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
    <ReadingModuleFlow
      moduleKey={MODULE_KEY}
      initialContent={content}
      onBack={onBack}
      renderExercise={(c, onComplete, onExit, accentColor) => (
        <ReadingModesExercise
          mode="keyword"
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
