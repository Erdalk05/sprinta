/**
 * useEyeSoundFeedback — Kartal Gözü Göz Antrenmanı Ses Geri Bildirimi
 *
 * Kullanım:
 *   const { playHit, playMiss, playAppear, playFlip, playTick,
 *           playWhoosh, playSuccess, playLevelUp, playComplete } = useEyeSoundFeedback()
 *
 * Ses haritası:
 *   playHit      → Doğru tap / puan kazanma  (hit.wav, 5'te bir combo.wav)
 *   playMiss     → Yanlış tap / hata          (miss.wav)
 *   playAppear   → Yeni hedef beliriyor        (appear.wav)
 *   playFlip     → Kart çevirme               (flip.wav)
 *   playTick     → Sayaç tiki (son 3sn)       (tick.wav)
 *   playWhoosh   → Düşen/hareket eden nesne   (whoosh.wav)
 *   playSuccess  → Kelime/tur tamamlandı       (success.wav)
 *   playLevelUp  → Bölüm tamamlama / seviye   (level_up.wav)
 *   playComplete → Egzersiz bitti             (complete.wav)
 */

import { useEffect, useRef, useCallback } from 'react'
import { Audio } from 'expo-av'
import { useSoundStore } from '../../../stores/soundStore'

type SoundKey =
  | 'hit' | 'miss' | 'appear' | 'combo' | 'complete'
  | 'flip' | 'tick' | 'whoosh' | 'success' | 'level_up'

const SOURCES: Record<SoundKey, any> = {
  hit:      require('../../../../assets/sounds/hit.wav'),
  miss:     require('../../../../assets/sounds/miss.wav'),
  appear:   require('../../../../assets/sounds/appear.wav'),
  combo:    require('../../../../assets/sounds/combo.wav'),
  complete: require('../../../../assets/sounds/complete.wav'),
  flip:     require('../../../../assets/sounds/flip.wav'),
  tick:     require('../../../../assets/sounds/tick.wav'),
  whoosh:   require('../../../../assets/sounds/whoosh.wav'),
  success:  require('../../../../assets/sounds/success.wav'),
  level_up: require('../../../../assets/sounds/level_up.wav'),
}

const VOLUMES: Record<SoundKey, number> = {
  hit:      0.80,
  miss:     0.65,
  appear:   0.45,
  combo:    0.90,
  complete: 0.95,
  flip:     0.70,
  tick:     0.55,
  whoosh:   0.60,
  success:  0.85,
  level_up: 0.85,
}

export function useEyeSoundFeedback() {
  const { isMuted } = useSoundStore()
  const sounds      = useRef<Partial<Record<SoundKey, Audio.Sound>>>({})
  const comboCount  = useRef(0)

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS:      false,
      staysActiveInBackground: false,
      playsInSilentModeIOS:    true,
    }).catch(() => {})

    const load = async () => {
      for (const [key, src] of Object.entries(SOURCES) as [SoundKey, any][]) {
        try {
          const { sound } = await Audio.Sound.createAsync(src, { volume: VOLUMES[key] })
          sounds.current[key] = sound
        } catch (_) {}
      }
    }
    load()

    return () => {
      Object.values(sounds.current).forEach(s => s?.unloadAsync().catch(() => {}))
      sounds.current = {}
    }
  }, [])

  const play = useCallback(async (key: SoundKey) => {
    if (isMuted) return
    try {
      const s = sounds.current[key]
      if (!s) return
      await s.setPositionAsync(0)
      await s.playAsync()
    } catch (_) {}
  }, [isMuted])

  // ── Public API ───────────────────────────────────────────────────

  /** Doğru tap / puan — 5 ardışık hit'te combo sesi */
  const playHit = useCallback(() => {
    comboCount.current += 1
    if (comboCount.current % 5 === 0) {
      void play('combo')
    } else {
      void play('hit')
    }
  }, [play])

  /** Yanlış tap / hata — combo sıfırlanır */
  const playMiss = useCallback(() => {
    comboCount.current = 0
    void play('miss')
  }, [play])

  /** Yeni hedef / soru / kart beliriyor */
  const playAppear = useCallback(() => void play('appear'), [play])

  /** Kart çevirme (KelimeEslestirme, CupOyunu) */
  const playFlip = useCallback(() => void play('flip'), [play])

  /** Sayaç tiki — son 3 saniye gibi kısa aralıklar */
  const playTick = useCallback(() => void play('tick'), [play])

  /** Düşen / hareket eden nesne (KelimeYagmuru) */
  const playWhoosh = useCallback(() => void play('whoosh'), [play])

  /** Kelime / tur tamamlandı (kısa ödül) */
  const playSuccess = useCallback(() => {
    comboCount.current = 0
    void play('success')
  }, [play])

  /** Bölüm / seviye atladı (uzun ödül) */
  const playLevelUp = useCallback(() => {
    comboCount.current = 0
    void play('level_up')
  }, [play])

  /** Egzersiz tamamen bitti */
  const playComplete = useCallback(() => {
    comboCount.current = 0
    void play('complete')
  }, [play])

  /** Manuel combo sıfırlama */
  const resetCombo = useCallback(() => { comboCount.current = 0 }, [])

  return {
    playHit, playMiss, playAppear, playFlip,
    playTick, playWhoosh, playSuccess, playLevelUp,
    playComplete, resetCombo,
  }
}
