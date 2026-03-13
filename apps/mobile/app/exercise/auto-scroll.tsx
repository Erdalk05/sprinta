import { usePendingSheetStore } from '../../src/stores/pendingSheetStore'
import { useRouter } from 'expo-router'
import ReadingModuleFlow from '../../src/components/reading/ReadingModuleFlow'
import ReadingModesExercise, { ReadingModesMetrics } from '../../src/components/exercises/ReadingModes/ReadingModesExercise'

export default function AutoScrollScreen() {
  const router = useRouter()
  return (
    <ReadingModuleFlow
      moduleKey="auto-scroll"
      onBack={() => { usePendingSheetStore.getState().setPendingSheet('okuma'); router.back() }}
      renderExercise={(content, onComplete, onExit, accentColor) => (
        <ReadingModesExercise
          mode="auto_scroll"
          initialContent={content ?? undefined}
          onComplete={(m: ReadingModesMetrics) => onComplete({
            avgWPM: m.avgWPM, totalWords: m.totalWords,
            durationSeconds: m.durationSeconds, completionRatio: m.completionRatio,
            arpScore: m.arpScore, xpEarned: m.xpEarned,
            libraryTextId: content?.libraryTextId,
          })}
          onExit={onExit}
          accentColor={accentColor}
        />
      )}
    />
  )
}
