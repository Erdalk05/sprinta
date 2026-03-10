// hapticService.ts — Sprinta haptic servisi
// expo-haptics üzerine semantik katman

import * as Haptics from 'expo-haptics'

export const hapticService = {
  /** Hafif dokunma — buton, navigasyon */
  tap(): void {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
  },

  /** Orta darbe — cevap seçme, kart kaydırma */
  select(): void {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {})
  },

  /** Güçlü darbe — seviye atlama, boss kill, rozet */
  impact(): void {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {})
  },

  /** Başarı bildirimi — doğru cevap */
  success(): void {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {})
  },

  /** Hata bildirimi — yanlış cevap */
  error(): void {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {})
  },

  /** Uyarı bildirimi — süre azalıyor */
  warning(): void {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {})
  },

  /** Seviye atlama kutlaması — 3x hafif darbe */
  levelUp(): void {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {})
    }, 100)
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {})
    }, 220)
  },

  /** Boss kill kutlaması — güçlü + 2x orta */
  bossKill(): void {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {})
    setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {})
    }, 150)
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {})
    }, 350)
  },
}
