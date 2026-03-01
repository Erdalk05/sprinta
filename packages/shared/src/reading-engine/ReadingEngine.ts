/*
 * SPRINTA READING ENGINE v2
 *
 * Mevcut egzersiz componentleri (ChunkRSVPExercise, FlowReadingExercise)
 * kendi internal logic'leriyle çalışmaya devam eder. Bu engine onları
 * bozmaz, onların yerine geçmez.
 *
 * Bu engine gelecekte eklenecek modüller için merkezi motor görevi görür:
 * - Chunking          → mode: 'chunking'
 * - Zaman Baskılı     → mode: 'timed',    timerEnabled: true
 * - Akademik Yoğunluk → mode: 'academic', academicMode: true
 * - Anahtar Kelime    → mode: 'keyword'
 * - Hafıza Sabitleme  → mode: 'memory'
 * - Anlamsal Tahmin   → mode: 'prediction'
 * - Dikkat Filtresi   → mode: 'focus_filter', focusMode: true
 *
 * Mevcut componentler bu engine'e migrate edilmek istenirse
 * useReadingEngine hook'unu import etmek yeterlidir.
 * Zorla migration yapma — kademeli geçiş stratejisi.
 */

import type {
  ReadingEngineConfig,
  ReadingEngineState,
  TextChunk,
  EngineStats,
} from './types'
import { splitIntoChunks, applyModeAdjustments } from './chunkUtils'

export class ReadingEngine {
  private chunks: TextChunk[] = []
  private currentIndex: number = 0
  private startTime: number = 0
  private elapsedMs: number = 0
  private regressionCount: number = 0
  private _currentChunk: TextChunk | null = null
  private config: ReadingEngineConfig
  private _isRunning: boolean = false
  private _isPaused: boolean = false

  constructor(config: ReadingEngineConfig) {
    this.config = config
  }

  /**
   * Metni yükle, chunk'lara böl ve engine'i hazırla.
   * start() çağrısından önce çalıştırılmalıdır.
   */
  initialize(text: string): void {
    const groupSize = this.config.groupSize ?? 2
    const raw = splitIntoChunks(text, groupSize)
    this.chunks = applyModeAdjustments(raw, this.config)
    this.currentIndex = 0
    this.elapsedMs = 0
    this.regressionCount = 0
    this._currentChunk = null
    this._isRunning = false
    this._isPaused = false
    this.startTime = 0
  }

  /**
   * Bir sonraki chunk'ı döner ve currentIndex'i ilerletir.
   * Tüm chunk'lar tükendiyse null döner.
   */
  getNextChunk(): TextChunk | null {
    if (this.currentIndex >= this.chunks.length) return null
    const chunk = this.chunks[this.currentIndex] ?? null
    this._currentChunk = chunk
    this.currentIndex++
    return chunk
  }

  /**
   * Bir önceki chunk'a git.
   *
   * regressionLocked = true → Geri dönüşü engelle, sadece regressionCount artır.
   *   Mevcut chunk değişmez, null döner.
   * regressionLocked = false → currentIndex geri alınır, önceki chunk döner.
   *   Bir sonraki getNextChunk() çağrısı doğru devam eder.
   */
  getPreviousChunk(): TextChunk | null {
    if (this.config.regressionLocked) {
      this.regressionCount++
      return null
    }

    if (this.currentIndex <= 1) {
      // En başa gelinmiş, geri gidilemez
      return this.chunks[0] ?? null
    }

    // currentIndex bir ilerideydi, iki geri gidip tekrar ileri al
    this.currentIndex -= 2
    const chunk = this.chunks[this.currentIndex] ?? null
    this._currentChunk = chunk
    this.currentIndex++
    return chunk
  }

  /**
   * Gösterilecek chunk kaldı mı?
   */
  hasNext(): boolean {
    return this.currentIndex < this.chunks.length
  }

  /**
   * Engine'i başlat. startTime kaydedilir.
   * initialize() sonrası çağrılmalıdır.
   */
  start(): void {
    this.startTime = Date.now()
    this._isRunning = true
    this._isPaused = false
  }

  /**
   * Okumayı duraklat. Geçen süre biriktirilir.
   */
  pause(): void {
    if (!this._isRunning || this._isPaused) return
    this.elapsedMs += Date.now() - this.startTime
    this._isRunning = false
    this._isPaused = true
  }

  /**
   * Duraklatılmış okumaya devam et.
   */
  resume(): void {
    if (!this._isPaused) return
    this.startTime = Date.now()
    this._isRunning = true
    this._isPaused = false
  }

  /**
   * Engine'i başa döndür. Tüm state sıfırlanır.
   * Chunk'lar korunur — initialize() tekrar çağrılmasına gerek yok.
   */
  reset(): void {
    this.currentIndex = 0
    this.startTime = 0
    this.elapsedMs = 0
    this.regressionCount = 0
    this._currentChunk = null
    this._isRunning = false
    this._isPaused = false
  }

  /**
   * Anlık istatistikleri döner.
   * Running durumda aktif süreyi de hesaba katar.
   */
  getStats(): EngineStats {
    const totalElapsed = this._isRunning
      ? this.elapsedMs + (Date.now() - this.startTime)
      : this.elapsedMs

    // O ana kadar gösterilen toplam kelime sayısı
    const wordsRead = this.chunks
      .slice(0, this.currentIndex)
      .reduce((sum, c) => sum + c.words.length, 0)

    // Gerçek zamanlı WPM tahmini (ms → dakika)
    const estimatedWpm =
      totalElapsed > 0
        ? Math.round((wordsRead / totalElapsed) * 60_000)
        : this.config.wpm

    return {
      totalChunks: this.chunks.length,
      currentIndex: this.currentIndex,
      elapsedMs: totalElapsed,
      estimatedWpm,
      completionRate:
        this.chunks.length > 0
          ? Math.min(1, this.currentIndex / this.chunks.length)
          : 0,
      regressionCount: this.regressionCount,
    }
  }

  /**
   * Mevcut engine durumunun tam snapshot'ını döner.
   * useReadingEngine hook'u bu değeri React state olarak tutar.
   */
  getState(): ReadingEngineState {
    const isComplete =
      this.chunks.length > 0 && this.currentIndex >= this.chunks.length

    return {
      isRunning: this._isRunning,
      isPaused: this._isPaused,
      isComplete,
      currentChunk: this._currentChunk,
      stats: this.getStats(),
    }
  }

  /**
   * Config'i güncelle — reset gerekmez.
   * wpm, groupSize, academicMode veya focusMode değişirse
   * chunk interval'ları yeniden hesaplanır.
   */
  updateConfig(partial: Partial<ReadingEngineConfig>): void {
    this.config = { ...this.config, ...partial }

    const needsIntervalRecalc =
      partial.wpm !== undefined ||
      partial.groupSize !== undefined ||
      partial.academicMode !== undefined ||
      partial.focusMode !== undefined

    if (needsIntervalRecalc && this.chunks.length > 0) {
      this.chunks = applyModeAdjustments(this.chunks, this.config)
    }
  }
}
