import { useRouter } from 'expo-router'
import ReadingModuleFlow from '../../src/components/reading/ReadingModuleFlow'
import ReadingModesExercise, { ReadingModesMetrics } from '../../src/components/exercises/ReadingModes/ReadingModesExercise'

export default function BionicReadingScreen() {
  const router = useRouter()
  return (
    <ReadingModuleFlow
      moduleKey="bionic-reading"
      onBack={() => router.back()}
      renderExercise={(content, onComplete, onExit) => (
        <ReadingModesExercise
          mode="bionic"
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
