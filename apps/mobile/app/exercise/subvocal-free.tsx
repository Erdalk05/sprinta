import { usePendingSheetStore } from '../../src/stores/pendingSheetStore'
import React from 'react'
import { useRouter } from 'expo-router'
import ReadingModuleFlow from '../../src/components/reading/ReadingModuleFlow'
import ReadingModesExercise, { ReadingModesMetrics } from '../../src/components/exercises/ReadingModes/ReadingModesExercise'

const MODULE_KEY = 'subvocal-free'

export default function SubvocalFreeScreen() {
  const router = useRouter()
  const onBack = () => { usePendingSheetStore.getState().setPendingSheet('okuma'); router.back() }

  return (
    <ReadingModuleFlow
      moduleKey={MODULE_KEY}
      onBack={onBack}
      renderExercise={(c, onComplete, onExit, accentColor) => (
        <ReadingModesExercise
          mode="subvocal"
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
