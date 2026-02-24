// CircularOrbitChase.tsx — STUB (v1.2'de implement edilecek)
import React from 'react'
import type { ExerciseProps } from '../../../../components/exercises/types'
import type { DifficultyLevel } from '../../constants/exerciseConfig'
import type { RawMetrics } from '../../engines/scoringEngine'
import { ComingSoonExercise } from './ComingSoonExercise'

interface Props extends ExerciseProps {
  level: DifficultyLevel
  onComplete: (metrics: RawMetrics) => void
}

const CircularOrbitChase: React.FC<Props> = ({ onExit }) => (
  <ComingSoonExercise title="Dairesel Yörünge Takibi" onExit={onExit} />
)

export default CircularOrbitChase
