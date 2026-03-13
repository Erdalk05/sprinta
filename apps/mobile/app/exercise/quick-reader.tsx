import React, { useEffect } from 'react'
import { useRouter } from 'expo-router'
import { usePendingSheetStore } from '../../src/stores/pendingSheetStore'
import { useQuickContentStore } from '../../src/stores/quickContentStore'
import ReadingModuleFlow from '../../src/components/reading/ReadingModuleFlow'
import ReadingModesExercise, { ReadingModesMetrics } from '../../src/components/exercises/ReadingModes/ReadingModesExercise'

export default function QuickReaderRoute() {
  const router  = useRouter()
  const content = useQuickContentStore((s) => s.content)
  const clear   = useQuickContentStore((s) => s.clear)

  useEffect(() => () => { clear() }, [])

  const onBack = () => {
    usePendingSheetStore.getState().setPendingSheet('okuma')
    router.back()
  }

  return (
    <ReadingModuleFlow
      moduleKey="timed-reading"
      initialContent={content}
      onBack={onBack}
      renderExercise={(c, onComplete, onExit, accentColor) => (
        <ReadingModesExercise
          mode="timed"
          initialContent={c ?? undefined}
          onComplete={(m: ReadingModesMetrics) => onComplete({
            avgWPM:          m.avgWPM,
            totalWords:      m.totalWords,
            durationSeconds: m.durationSeconds,
            completionRatio: m.completionRatio,
            arpScore:        m.arpScore,
            xpEarned:        m.xpEarned,
            libraryTextId:   c?.libraryTextId,
          })}
          onExit={onExit}
          accentColor={accentColor}
        />
      )}
    />
  )
}
