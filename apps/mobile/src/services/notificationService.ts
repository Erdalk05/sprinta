// Notification Service — expo-notifications ile günlük hatırlatıcılar
// Paket kurulu değilse sessizce devre dışı kalır (offline-first).

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Notifications: any = null

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Notifications = require('expo-notifications')
} catch {
  // expo-notifications kurulu değil — silent
}

export const notificationService = {
  /**
   * İzin iste. Uygulama açılışında _layout.tsx'ten çağrılır.
   */
  async init(): Promise<void> {
    if (!Notifications) return
    try {
      const { status: existing } = await Notifications.getPermissionsAsync()
      let finalStatus = existing
      if (existing !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync()
        finalStatus = status
      }
      if (finalStatus !== 'granted') return

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      })
    } catch (e) {
      console.warn('[NotificationService] init:', e)
    }
  },

  /**
   * Her gün 19:00'da antrenman hatırlatıcısı planla.
   */
  async scheduleDailyReminder(): Promise<void> {
    if (!Notifications) return
    try {
      await Notifications.cancelAllScheduledNotificationsAsync()
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎓 Sprinta — Günlük Antrenman',
          body: 'Günlük antrenmanın seni bekliyor! ARP skorunu geliştir. 🚀',
          sound: true,
        },
        trigger: { hour: 19, minute: 0, repeats: true } as never,
      })
    } catch (e) {
      console.warn('[NotificationService] scheduleDailyReminder:', e)
    }
  },

  /**
   * Streak tehlikede bildirimi — saat 21:00.
   */
  async scheduleStreakWarning(streakCount: number): Promise<void> {
    if (!Notifications) return
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔥 Streakini Kaybetmek Üzeresin!',
          body: `${streakCount} günlük serinizi koru. Hemen 5 dakikalık egzersiz yap!`,
          sound: true,
        },
        trigger: { hour: 21, minute: 0, repeats: false } as never,
      })
    } catch (e) {
      console.warn('[NotificationService] scheduleStreakWarning:', e)
    }
  },

  /**
   * Tüm planlanmış bildirimleri iptal et (çıkış yaparken).
   */
  async cancelAll(): Promise<void> {
    if (!Notifications) return
    try {
      await Notifications.cancelAllScheduledNotificationsAsync()
    } catch (e) {
      console.warn('[NotificationService] cancelAll:', e)
    }
  },
}
