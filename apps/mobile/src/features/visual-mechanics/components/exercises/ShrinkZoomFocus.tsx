// ShrinkZoomFocus.tsx — STUB (v1.2'de implement edilecek)
import React from 'react'
import type { ExerciseProps } from '../../../../components/exercises/types'
import type { DifficultyLevel } from '../../constants/exerciseConfig'
import type { RawMetrics } from '../../engines/scoringEngine'
import { ComingSoonExercise } from './ComingSoonExercise'

interface Props extends ExerciseProps {
  level: DifficultyLevel
  onComplete: (metrics: RawMetrics) => void
}

const ShrinkZoomFocus: React.FC<Props> = ({ onExit }) => (
  <ComingSoonExercise title="Küçül & Yaklaş Odağı" onExit={onExit} />
)

export default ShrinkZoomFocus
