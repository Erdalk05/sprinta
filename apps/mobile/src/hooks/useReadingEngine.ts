// =====================================================
// useReadingEngine — React Native Hook
//
// packages/shared'deki ReadingEngine sınıfını React state'e bağlar.
// Tema pattern: useAppTheme() + useMemo kullanılmaz (UI değil logic hook).
// Mevcut useSessionTimer, useArticles vb. hook'larla aynı dizinde yaşar.
//
// Kullanım:
//   const { state, initialize, start, pause, resume, reset, next, previous } =
//     useReadingEngine({ mode: 'chunking', wpm: 300, groupSize: 2 })
// =====================================================

import { useRef, useState, useCallback } from 'react'
import { ReadingEngine } from '../../../../packages/shared/src/reading-engine/ReadingEngine'
import type {
  ReadingEngineConfig,
  ReadingEngineState,
} from '../../../../packages/shared/src/reading-engine/types'

/** Engine başlangıç state'i — initialize() çağrılmadan önce */
function buildInitialState(config: ReadingEngineConfig): ReadingEngineState {
  return {
    isRunning: false,
    isPaused: false,
    isComplete: false,
    currentChunk: null,
    stats: {
      totalChunks: 0,
      currentIndex: 0,
      elapsedMs: 0,
      estimatedWpm: config.wpm,
      completionRate: 0,
      regressionCount: 0,
    },
  }
}

export function useReadingEngine(config: ReadingEngineConfig) {
  // Engine instance — re-render'da yeniden oluşturulmaz
  const engineRef = useRef<ReadingEngine>(new ReadingEngine(config))

  const [state, setState] = useState<ReadingEngineState>(() =>
    buildInitialState(config),
  )

  /** Engine'den güncel state çek ve React state'e yaz */
  const syncState = useCallback(() => {
    setState(engineRef.current.getState())
  }, [])

  /**
   * Metni yükle ve engine'i hazırla.
   * start() çağrısından önce çalıştırılmalıdır.
   */
  const initialize = useCallback(
    (text: string) => {
      engineRef.current.initialize(text)
      syncState()
    },
    [syncState],
  )

  /** Okumayı başlat */
  const start = useCallback(() => {
    engineRef.current.start()
    syncState()
  }, [syncState])

  /** Okumayı duraklat */
  const pause = useCallback(() => {
    engineRef.current.pause()
    syncState()
  }, [syncState])

  /** Duraklatılmış okumaya devam et */
  const resume = useCallback(() => {
    engineRef.current.resume()
    syncState()
  }, [syncState])

  /** Başa dön, tüm state sıfırla */
  const reset = useCallback(() => {
    engineRef.current.reset()
    syncState()
  }, [syncState])

  /** Sonraki chunk'a geç */
  const next = useCallback(() => {
    engineRef.current.getNextChunk()
    syncState()
  }, [syncState])

  /**
   * Önceki chunk'a dön.
   * regressionLocked true ise sadece sayaç artar, chunk değişmez.
   */
  const previous = useCallback(() => {
    engineRef.current.getPreviousChunk()
    syncState()
  }, [syncState])

  /**
   * Config'i güncelle (wpm, mod, vb.).
   * reset() gerekmez — sadece interval'lar yeniden hesaplanır.
   */
  const updateConfig = useCallback(
    (partial: Partial<ReadingEngineConfig>) => {
      engineRef.current.updateConfig(partial)
      syncState()
    },
    [syncState],
  )

  return {
    state,
    initialize,
    start,
    pause,
    resume,
    reset,
    next,
    previous,
    updateConfig,
  }
}
