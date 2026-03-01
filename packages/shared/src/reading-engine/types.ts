// =====================================================
// Reading Engine v2 — Tipler
//
// Bu tipler mevcut packages/shared/src/types/engine.ts ile
// ve apps/mobile/src/components/exercises/types.ts ile çakışmaz.
// ChunkRSVPEngine'deki Chunk tipi ile karışmaması için TextChunk adı kullanılır.
// =====================================================

/**
 * Desteklenen okuma modları.
 * Mevcut sprint/cruise modları FlowReadingEngine'de yaşamaya devam eder.
 */
export type ReadingMode =
  | 'chunking'       // Kelime grubu hızlı okuma (mevcut ChunkRSVP'nin soyutlaması)
  | 'timed'          // Zamanlı okuma — timerEnabled ile birlikte kullanılır
  | 'academic'       // Akademik yoğunluk — ağır metinler için yavaş tempo
  | 'keyword'        // Anahtar kelime avcısı
  | 'memory'         // Hafıza sabitleme
  | 'prediction'     // Anlamsal tahmin
  | 'regression'     // Regresyon analizi — geri dönüş takipli
  | 'focus_filter'   // Dikkat filtresi — focusMode ile birlikte
  | 'sustained'      // Uzun süreli odak
  | 'subvocal'       // Sessiz okuma egzersizi

/**
 * Engine yapılandırması.
 * examType: projedeki mevcut 'LGS' | 'TYT' | 'ALES' | 'KPSS' | 'General' ile uyumlu.
 */
export interface ReadingEngineConfig {
  mode: ReadingMode
  wpm: number                          // Hedef kelime/dakika (60–1000)
  groupSize?: number                   // Chunking için kelime grubu büyüklüğü (1–7), varsayılan 2
  regressionLocked?: boolean           // true → geri dönüş engellenir, sadece sayaç artar
  timerEnabled?: boolean               // Zaman baskısı aktif mi
  timerSeconds?: number                // Toplam süre saniye cinsinden
  focusMode?: boolean                  // Dikkat filtresi — her 5 chunk'ta ritim değişimi
  academicMode?: boolean               // Akademik mod — interval %20 artırılır
  examType?: 'LGS' | 'TYT' | 'ALES' | 'KPSS' | 'General'
}

/**
 * Tek bir metin parçası (chunk).
 * ChunkRSVPEngine'deki Chunk ile çakışmaz — o tip uygulamaya özgüdür.
 */
export interface TextChunk {
  index: number
  words: string[]
  displayText: string      // Ekranda gösterilecek birleşik string
  intervalMs: number       // Bu chunk için hesaplanan gösterim süresi (ms)
}

/**
 * Engine istatistikleri — canlı oturum verisi.
 * packages/shared/src/types/engine.ts'deki SessionMetrics ile çakışmaz.
 */
export interface EngineStats {
  totalChunks: number
  currentIndex: number
  elapsedMs: number
  estimatedWpm: number
  completionRate: number    // 0.0 – 1.0
  regressionCount: number   // Geri dönüş sayısı (regressionLocked false ise gerçek geri dönüş)
}

/**
 * Engine'in anlık durum snapshot'ı.
 * useReadingEngine hook'u bu tipi React state olarak yönetir.
 */
export interface ReadingEngineState {
  isRunning: boolean
  isPaused: boolean
  isComplete: boolean
  currentChunk: TextChunk | null
  stats: EngineStats
}
