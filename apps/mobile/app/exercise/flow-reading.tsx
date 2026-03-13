import { usePendingSheetStore } from '../../src/stores/pendingSheetStore'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../src/stores/authStore'
import { supabase } from '../../src/lib/supabase'
import { createFlowReadingService } from '@sprinta/api'
import ReadingModuleFlow from '../../src/components/reading/ReadingModuleFlow'
import FlowReadingExercise, { FlowReadingMetrics } from '../../src/components/exercises/SpeedControl/FlowReadingExercise'

const flowSvc = createFlowReadingService(supabase)

export default function FlowReadingScreen() {
  const router    = useRouter()
  const { student } = useAuthStore()

  return (
    <ReadingModuleFlow
      moduleKey="flow-reading"
      onBack={() => { usePendingSheetStore.getState().setPendingSheet('okuma'); router.back() }}
      renderExercise={(content, onComplete, onExit, accentColor) => (
        <FlowReadingExercise
          initialContent={content ?? undefined}
          accentColor={accentColor}
          onComplete={(m: FlowReadingMetrics) => {
            if (student?.id) flowSvc.saveSession(m, student.id).catch(() => {})
            onComplete({
              avgWPM:          m.avgWPM,
              totalWords:      m.totalWords,
              durationSeconds: m.durationSeconds,
              completionRatio: 1,
              arpScore:        m.arpScore,
              xpEarned:        0,
              libraryTextId:   content?.libraryTextId,
            })
          }}
          onExit={onExit}
        />
      )}
    />
  )
}
