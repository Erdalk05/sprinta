import { useRouter } from 'expo-router'
import ReadingModuleFlow from '../../src/components/reading/ReadingModuleFlow'
import ReadingModesExercise, { ReadingModesMetrics } from '../../src/components/exercises/ReadingModes/ReadingModesExercise'

export default function WordBurstScreen() {
  const router = useRouter()
  return (
    <ReadingModuleFlow
      moduleKey="word-burst"
      onBack={() => router.back()}
      renderExercise={(content, onComplete, onExit, accentColor) => (
        <ReadingModesExercise
          mode="word_burst"
          initialContent={content}
          onComplete={(m: ReadingModesMetrics) => onComplete({
            avgWPM: m.avgWPM, totalWords: m.totalWords,
            durationSeconds: m.durationSeconds, completionRatio: m.completionRatio,
            arpScore: m.arpScore, xpEarned: m.xpEarned,
            libraryTextId: content.libraryTextId,
          })}
          onExit={onExit}
          accentColor={accentColor}
        />
      )}
    />
  )
}
