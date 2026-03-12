import { useRouter } from 'expo-router'
import ReadingModuleFlow from '../../src/components/reading/ReadingModuleFlow'
import ReadingModesExercise, { ReadingModesMetrics } from '../../src/components/exercises/ReadingModes/ReadingModesExercise'

export default function FocusFilterScreen() {
  const router = useRouter()
  return (
    <ReadingModuleFlow
      moduleKey="focus-filter"
      onBack={() => router.back()}
      renderExercise={(content, onComplete, onExit) => (
        <ReadingModesExercise
          mode="focus_filter"
          initialContent={content}
          onComplete={(m: ReadingModesMetrics) => onComplete({
            avgWPM: m.avgWPM, totalWords: m.totalWords,
            durationSeconds: m.durationSeconds, completionRatio: m.completionRatio,
            arpScore: m.arpScore, xpEarned: m.xpEarned,
            libraryTextId: content.libraryTextId,
          })}
          onExit={onExit}
        />
      )}
    />
  )
}
