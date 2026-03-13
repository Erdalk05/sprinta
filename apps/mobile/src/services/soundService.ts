// soundService.ts — Sprinta ses yöneticisi
// expo-av kullanır; paket yoksa veya ses dosyası yoksa sessizce devre dışı kalır.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Audio: any = null
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Audio = require('expo-av').Audio
} catch {
  // expo-av kurulu değil — silent
}

// Semantik ses anahtarları
export type SoundKey =
  | 'correct'   // → success.wav  (doğru cevap)
  | 'wrong'     // → miss.wav     (yanlış cevap)
  | 'empty'     // → tick.wav     (boş geçme)
  | 'levelUp'   // → level_up.wav (seviye atlama)
  | 'bossKill'  // → combo.wav    (boss yenildi)
  | 'bossHit'   // → hit.wav      (boss'a vuruş)
  | 'tap'       // → flip.wav     (genel dokunma)
  | 'success'   // → complete.wav (egzersiz tamamlama)
  | 'fail'      // → miss.wav     (başarısız)
  | 'tick'      // → tick.wav     (geri sayım)
  | 'appear'    // → appear.wav   (eleman beliriş)
  | 'whoosh'    // → whoosh.wav   (geçiş)

// Metro bundler statik analiz için her require ayrı try/catch içinde
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SOUND_ASSETS: Partial<Record<SoundKey, any>> = {}

try { SOUND_ASSETS.correct  = require('../../assets/sounds/success.wav')  } catch { /* no file */ }
try { SOUND_ASSETS.wrong    = require('../../assets/sounds/miss.wav')      } catch { /* no file */ }
try { SOUND_ASSETS.empty    = require('../../assets/sounds/tick.wav')      } catch { /* no file */ }
try { SOUND_ASSETS.levelUp  = require('../../assets/sounds/level_up.wav')  } catch { /* no file */ }
try { SOUND_ASSETS.bossKill = require('../../assets/sounds/combo.wav')     } catch { /* no file */ }
try { SOUND_ASSETS.bossHit  = require('../../assets/sounds/hit.wav')       } catch { /* no file */ }
try { SOUND_ASSETS.tap      = require('../../assets/sounds/flip.wav')      } catch { /* no file */ }
try { SOUND_ASSETS.success  = require('../../assets/sounds/complete.wav')  } catch { /* no file */ }
try { SOUND_ASSETS.fail     = require('../../assets/sounds/miss.wav')      } catch { /* no file */ }
try { SOUND_ASSETS.tick     = require('../../assets/sounds/tick.wav')      } catch { /* no file */ }
try { SOUND_ASSETS.appear   = require('../../assets/sounds/appear.wav')    } catch { /* no file */ }
try { SOUND_ASSETS.whoosh   = require('../../assets/sounds/whoosh.wav')    } catch { /* no file */ }

class SoundService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private soundCache: Partial<Record<SoundKey, any>> = {}
  private _isMuted = false
  private _audioSessionReady = false

  private async _ensureAudioSession(): Promise<void> {
    if (!Audio || this._audioSessionReady) return
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      })
      this._audioSessionReady = true
    } catch { /* ignore */ }
  }

  /**
   * Belirtilen sesi çalar. İlk çağrıda yükler, sonrakilerde önbellekten kullanır.
   * expo-av yoksa veya dosya eksikse sessizce geçer.
   */
  async play(key: SoundKey): Promise<void> {
    if (!Audio || this._isMuted) return
    const asset = SOUND_ASSETS[key]
    if (!asset) return
    await this._ensureAudioSession()
    try {
      let sound = this.soundCache[key]
      if (!sound) {
        const { sound: newSound } = await Audio.Sound.createAsync(asset, {
          shouldPlay: false,
          volume: 1.0,
        })
        this.soundCache[key] = newSound
        sound = newSound
      }
      await sound.setPositionAsync(0)
      await sound.playAsync()
    } catch (e) {
      if (__DEV__) {
        console.warn(`[SoundService] play(${key}):`, e)
      }
    }
  }

  /**
   * Sık kullanılan sesleri önceden yükler.
   * Uygulama başlangıcında veya ekran useEffect'inde çağrılır.
   */
  async preload(keys: SoundKey[]): Promise<void> {
    if (!Audio) return
    await Promise.all(keys.map(k => this._loadSound(k)))
  }

  /**
   * Tüm yüklü sesleri bellekten boşaltır.
   */
  async unloadAll(): Promise<void> {
    if (!Audio) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const entries = Object.entries(this.soundCache) as [SoundKey, any][]
    await Promise.all(
      entries.map(async ([key, sound]) => {
        try { await sound.unloadAsync() } catch { /* already unloaded */ }
        delete this.soundCache[key]
      }),
    )
  }

  /** Sesi kapat / aç */
  toggleMute(): void {
    this._isMuted = !this._isMuted
  }

  /** Mevcut sessizlik durumunu döner */
  isMuted(): boolean {
    return this._isMuted
  }

  private async _loadSound(key: SoundKey): Promise<void> {
    if (!Audio || this.soundCache[key]) return
    const asset = SOUND_ASSETS[key]
    if (!asset) return
    try {
      const { sound } = await Audio.Sound.createAsync(asset, { shouldPlay: false, volume: 1.0 })
      this.soundCache[key] = sound
    } catch (e) {
      if (__DEV__) {
        console.warn(`[SoundService] preload(${key}):`, e)
      }
    }
  }
}

export const soundService = new SoundService()
