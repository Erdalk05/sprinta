// Monitoring — Sentry + Analytics
// Production'da hata takibi ve kullanıcı olayları

export function initMonitoring() {
  if (!__DEV__) {
    // Sentry kurulumu için: pnpm add @sentry/react-native
    // Sentry.init({
    //   dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    //   environment: 'production',
    //   tracesSampleRate: 0.2,
    // });
  }
}

export function trackExerciseComplete(params: {
  exerciseType: string;
  moduleCode: string;
  arp: number;
  xpEarned: number;
}) {
  if (!__DEV__) {
    // Mixpanel / Amplitude entegrasyonu buraya
    console.log('[Analytics] exercise_complete', params);
  }
}

export function trackScreenView(screenName: string) {
  if (!__DEV__) {
    console.log('[Analytics] screen_view', { screenName });
  }
}

export function trackPurchase(params: {
  tier: string;
  price: number;
  currency: string;
}) {
  if (!__DEV__) {
    console.log('[Analytics] purchase', params);
  }
}
