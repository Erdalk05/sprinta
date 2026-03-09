/**
 * useSoundFeedback — Kartal Gözü ses + görsel geri bildirim
 * Sesler pre-load edilir, feedbackEvents ile ExerciseProgressBar'a flash/combo sinyal gönderir
 */

import { useEffect, useRef, useCallback } from 'react'
import { Audio } from 'expo-av'
import { useSoundStore } from '../../../stores/soundStore'
import { feedbackEvents } from '../utils/feedbackEvents'

type SoundKey = 'hit' | 'miss' | 'appear' | 'combo' | 'complete'

const SOURCES: Record<SoundKey, any> = {
  hit:      require('../../../../assets/sounds/hit.wav'),
  miss:     require('../../../../assets/sounds/miss.wav'),
  appear:   require('../../../../assets/sounds/appear.wav'),
  combo:    require('../../../../assets/sounds/combo.wav'),
  complete: require('../../../../assets/sounds/complete.wav'),
}

const VOLUMES: Record<SoundKey, number> = {
  hit:      0.80,
  miss:     0.65,
  appear:   0.45,
  combo:    0.90,
  complete: 0.95,
}

export function useSoundFeedback() {
  const { isMuted } = useSoundStore()
  const sounds     = useRef<Partial<Record<SoundKey, Audio.Sound>>>({})
  const comboCount = useRef(0)

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS:      false,
      staysActiveInBackground: false,
      playsInSilentModeIOS:    true,
    }).catch(() => {})

    const load = async () => {
      for (const [key, src] of Object.entries(SOURCES) as [SoundKey, any][]) {
        try {
          const { sound } = await Audio.Sound.createAsync(src, { volume: VOLUMES[key as SoundKey] })
          sounds.current[key as SoundKey] = sound
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

  // ── Public API ─────────────────────────────────────────────────

  const playHit = useCallback(() => {
    comboCount.current += 1
    if (comboCount.current % 5 === 0) {
      play('combo')
      feedbackEvents.emit('combo', comboCount.current)
    } else {
      play('hit')
      feedbackEvents.emit('hit', comboCount.current)
    }
  }, [play])

  const playMiss = useCallback(() => {
    comboCount.current = 0
    play('miss')
    feedbackEvents.emit('miss', 0)
  }, [play])

  const playAppear   = useCallback(() => play('appear'),   [play])
  const playComplete = useCallback(() => play('complete'),  [play])
  const resetCombo   = useCallback(() => { comboCount.current = 0 }, [])

  return { playHit, playMiss, playAppear, playComplete, resetCombo }
}
