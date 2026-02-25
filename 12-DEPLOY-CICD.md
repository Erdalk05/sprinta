# 12 — DEPLOY & CI/CD
## Vercel + EAS Build + Supabase Production

---

## 1. SUPABASE PRODUCTION

```bash
# 1. Production proje oluştur (supabase.com)
# Dashboard → New Project → ad: sprinta-prod

# 2. Projeyi bağla
supabase link --project-ref YOUR_PROJECT_REF

# 3. Migration'ları push et
supabase db push

# 4. Secrets ayarla
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

# 5. Edge functions'ları deploy et
supabase functions deploy ai-daily-recommendation
supabase functions deploy ai-weekly-report
supabase functions deploy cron-risk-detection
supabase functions deploy cron-daily-stats
```

---

## 2. VERCEL DEPLOY (Web)

### `apps/web/vercel.json`

```json
{
  "framework": "nextjs",
  "buildCommand": "cd ../.. && pnpm run build --filter=web",
  "installCommand": "cd ../.. && pnpm install",
  "outputDirectory": ".next",
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-prod-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-prod-anon-key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase-service-role-key"
  }
}
```

```bash
# Vercel CLI
npm i -g vercel

# Deploy
cd apps/web
vercel --prod
```

---

## 3. EAS BUILD (Mobile)

### `apps/mobile/eas.json`

```json
{
  "cli": { "version": ">= 5.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": { "simulator": true }
    },
    "production": {
      "ios": { "resourceClass": "m-medium" },
      "android": { "buildType": "apk" }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your@email.com",
        "ascAppId": "123456789"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json"
      }
    }
  }
}
```

### `apps/mobile/app.json`

```json
{
  "expo": {
    "name": "Sprinta",
    "slug": "sprinta",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#0F172A"
    },
    "ios": {
      "bundleIdentifier": "app.sprinta.mobile",
      "supportsTablet": false,
      "buildNumber": "1"
    },
    "android": {
      "package": "app.sprinta.mobile",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#0F172A"
      }
    },
    "plugins": [
      "expo-router",
      "expo-secure-store",
      "expo-haptics"
    ],
    "extra": {
      "eas": { "projectId": "YOUR_EAS_PROJECT_ID" }
    }
  }
}
```

```bash
# Build
eas build --platform ios --profile production
eas build --platform android --profile production

# Store'lara gönder
eas submit --platform ios
eas submit --platform android
```

---

## 4. CI/CD (GitHub Actions)

```yaml
# .github/workflows/deploy.yml

name: Deploy

on:
  push:
    branches: [main]

jobs:
  web:
    name: Deploy Web
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm run typecheck
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID_WEB }}
          vercel-args: '--prod'
          working-directory: apps/web

  mobile:
    name: Build Mobile
    runs-on: ubuntu-latest
    if: contains(github.event.head_commit.message, '[build-mobile]')
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: pnpm install
      - run: eas build --platform all --profile production --non-interactive
        working-directory: apps/mobile
```

---

## 5. ÖN AÇILIŞ KONTROL LİSTESİ

```bash
# Veritabanı
☐ Supabase production migration'ları push edildi
☐ RLS politikaları test edildi
☐ Seed data yüklendi (rozet tanımları, egzersizler)
☐ Edge functions deploy edildi
☐ Cron job'lar konfigüre edildi
☐ ANTHROPIC_API_KEY secret ayarlandı

# Mobile
☐ app.json'da bundleIdentifier/package doğru
☐ EAS projectId ayarlandı
☐ iOS: App Store Connect hesabı ve uygulama oluşturuldu
☐ Android: Google Play Console hesabı ve uygulama oluşturuldu
☐ RevenueCat: iOS ve Android ürünler oluşturuldu
☐ Privacy policy ve Terms of Service URL'leri hazır
☐ Uygulama ikonu ve splash ekranı hazır (assets/)
☐ Production build başarılı

# Web
☐ Vercel'de çevre değişkenleri ayarlandı
☐ Domain konfigürasyonu (panel.sprinta.app, admin.sprinta.app)
☐ SSL aktif
☐ Middleware auth guard test edildi

# Güvenlik
☐ KVKK politikası sayfası yayında
☐ Kullanım şartları yayında
☐ Veri işleme sözleşmesi hazır (B2B)
☐ 13 yaş altı uyarısı eklendi (App Store/Play Store metadata)
```

---

## 6. MONITORING

```typescript
// apps/mobile/src/utils/monitoring.ts

import * as Sentry from '@sentry/react-native';

export function initMonitoring() {
  if (!__DEV__) {
    Sentry.init({
      dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
      environment: 'production',
      tracesSampleRate: 0.2,
    });
  }
}

// Egzersiz tamamlanma olayını izle
export function trackExerciseComplete(params: {
  exerciseType: string;
  moduleCode: string;
  arp: number;
  xpEarned: number;
}) {
  if (!__DEV__) {
    // Mixpanel veya Amplitude ile analytics
    console.log('[Analytics] exercise_complete', params);
  }
}
```

---

## ✅ FAZ 12 TAMAMLANMA KRİTERLERİ

```
✅ Supabase production migration'lar push edildi
✅ Edge functions canlıda çalışıyor
✅ Web (Vercel): panel.sprinta.app ve admin.sprinta.app canlı
✅ Mobile (EAS): iOS ve Android production build hazır
✅ App Store / Play Store: İnceleme için gönderildi
✅ CI/CD: main'e push = otomatik web deploy
✅ Ön açılış kontrol listesi tamamlandı
```
