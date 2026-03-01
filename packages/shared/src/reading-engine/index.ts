// =====================================================
// Reading Engine v2 — Public API
//
// Hook (useReadingEngine) React gerektirdiğinden
// packages/shared'de değil apps/mobile/src/hooks/ altında yaşar.
// Buradan import: import { ReadingEngine, ... } from '@sprinta/shared/src/reading-engine'
// Hook import:    import { useReadingEngine } from '../hooks/useReadingEngine'
// =====================================================

export type {
  ReadingMode,
  ReadingEngineConfig,
  TextChunk,
  EngineStats,
  ReadingEngineState,
} from './types'

export { splitIntoChunks, calculateIntervalMs, applyModeAdjustments } from './chunkUtils'
export { ReadingEngine } from './ReadingEngine'
