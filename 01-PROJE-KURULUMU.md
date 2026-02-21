# 01 — PROJE KURULUMU
## Monorepo, Paketler, Ortam Değişkenleri

---

## İÇİNDEKİLER

1. [Monorepo Yapısı](#1-monorepo-yapısı)
2. [Paket Versiyonları](#2-paket-versiyonları)
3. [Turborepo Konfigürasyonu](#3-turborepo-konfigürasyonu)
4. [Ortam Değişkenleri](#4-ortam-değişkenleri)
5. [Kurulum Adımları](#5-kurulum-adımları)
6. [Sağlık Kontrolü](#6-sağlık-kontrolü)

---

## 1. MONOREPO YAPISI

```
sprinta/
├── package.json                  ← Root: turbo + prettier + scripts
├── turbo.json                    ← Pipeline tanımları
├── pnpm-workspace.yaml           ← Workspace tanımları
├── .env.example                  ← Tüm env sablon
├── .gitignore
├── apps/
│   ├── mobile/                   ← Expo SDK 54 (React Native)
│   │   ├── app/                  ← expo-router (file-based routing)
│   │   │   ├── (auth)/           ← Giriş/kayıt ekranları
│   │   │   ├── (tabs)/           ← Ana tab navigation
│   │   │   └── _layout.tsx
│   │   ├── src/
│   │   │   ├── components/       ← Yeniden kullanılabilir UI bileşenleri
│   │   │   ├── stores/           ← Zustand stores
│   │   │   ├── hooks/            ← Custom React hooks
│   │   │   └── utils/            ← Yardımcı fonksiyonlar
│   │   ├── assets/               ← Görseller, fontlar, ses dosyaları
│   │   ├── app.json              ← Expo konfigürasyonu
│   │   ├── eas.json              ← EAS Build konfigürasyonu
│   │   └── package.json
│   └── web/                      ← Next.js 16 (App Router)
│       ├── app/
│       │   ├── (auth)/           ← Login/register
│       │   ├── (panel)/          ← Kurum admin paneli
│       │   └── (admin)/          ← Super admin paneli
│       ├── components/
│       ├── lib/
│       │   ├── supabase/         ← Server/client/middleware
│       │   └── utils.ts
│       ├── middleware.ts
│       ├── next.config.ts
│       ├── vercel.json
│       └── package.json
├── packages/
│   ├── shared/                   ← @sprinta/shared
│   │   ├── src/
│   │   │   ├── types/            ← TypeScript tip tanımları
│   │   │   ├── engine/           ← Performance Engine (pure TS)
│   │   │   ├── constants/        ← Sabitler (sınav hedefleri, vb.)
│   │   │   └── index.ts
│   │   └── package.json
│   └── api-client/               ← @sprinta/api
│       ├── src/
│       │   ├── services/         ← Supabase servis katmanı
│       │   ├── types/            ← Supabase generated types
│       │   └── index.ts
│       └── package.json
└── supabase/
    ├── config.toml               ← Supabase local konfigürasyonu
    ├── migrations/               ← Numaralı SQL dosyaları
    │   ├── 001_initial_schema.sql
    │   ├── 002_multi_tenant.sql
    │   ├── 003_rls_policies.sql
    │   ├── 004_functions_triggers.sql
    │   ├── 005_indexes.sql
    │   └── 006_seed_data.sql
    └── functions/
        ├── ai-coach/             ← Claude Haiku günlük öneri
        ├── ai-weekly-report/     ← Haftalık AI raporu
        ├── cron-risk-detection/  ← Günlük risk hesaplama
        └── cron-daily-stats/     ← Günlük istatistik aggregate
```

---

## 2. PAKET VERSİYONLARI

### Root `package.json`

```json
{
  "name": "sprinta",
  "private": true,
  "packageManager": "pnpm@9.0.0",
  "engines": { "node": ">=18" },
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "typecheck": "turbo run typecheck",
    "db:start": "supabase start",
    "db:stop": "supabase stop",
    "db:reset": "supabase db reset",
    "db:push": "supabase db push",
    "db:health": "node scripts/db-health.js",
    "db:seed": "supabase db seed"
  },
  "devDependencies": {
    "turbo": "^2.8.10",
    "typescript": "^5.4.0",
    "prettier": "^3.7.4",
    "@supabase/supabase-js": "^2.43.0",
    "dotenv": "^16.4.7"
  }
}
```

### `pnpm-workspace.yaml`

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### `turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [".env"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "typecheck": {
      "dependsOn": ["^build"]
    }
  }
}
```

### `@sprinta/shared` (`packages/shared/package.json`)

```json
{
  "name": "@sprinta/shared",
  "version": "1.0.0",
  "main": "./src/index.ts",
  "dependencies": {
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0"
  }
}
```

### `@sprinta/api` (`packages/api-client/package.json`)

```json
{
  "name": "@sprinta/api",
  "version": "1.0.0",
  "main": "./src/index.ts",
  "dependencies": {
    "@sprinta/shared": "workspace:*",
    "@supabase/supabase-js": "^2.43.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "@types/node": "^22.0.0"
  }
}
```

### `apps/mobile/package.json` (ana bağımlılıklar)

```json
{
  "name": "mobile",
  "version": "1.0.0",
  "dependencies": {
    "@sprinta/shared": "workspace:*",
    "@sprinta/api": "workspace:*",
    "expo": "~54.0.33",
    "react": "19.1.0",
    "react-native": "0.81.5",
    "expo-router": "~6.0.23",
    "expo-secure-store": "~14.0.1",
    "expo-haptics": "~14.0.1",
    "expo-av": "~15.0.2",
    "react-native-reanimated": "~4.1.6",
    "react-native-gesture-handler": "~2.21.2",
    "react-native-safe-area-context": "4.14.0",
    "react-native-screens": "~4.4.0",
    "react-native-svg": "^15.11.2",
    "zustand": "^5.0.3",
    "react-native-mmkv": "^3.2.0",
    "react-native-purchases": "^9.10.1",
    "@supabase/supabase-js": "^2.43.0",
    "@react-native-async-storage/async-storage": "^2.1.0",
    "zod": "^3.22.0"
  }
}
```

### `apps/web/package.json` (ana bağımlılıklar)

```json
{
  "name": "web",
  "version": "1.0.0",
  "dependencies": {
    "@sprinta/shared": "workspace:^",
    "@sprinta/api": "workspace:^",
    "next": "^16.1.5",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "@supabase/ssr": "^0.8.0",
    "@supabase/supabase-js": "^2.43.0",
    "recharts": "^3.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.3.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "tailwindcss": "^4.2.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0"
  }
}
```

---

## 3. TURBOREPO KONFİGÜRASYONU

```json
// turbo.json (detaylı)
{
  "$schema": "https://turbo.build/schema.json",
  "globalEnv": [
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  ],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"],
      "env": ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "typecheck": {
      "dependsOn": ["^typecheck"],
      "outputs": []
    },
    "lint": {
      "dependsOn": ["^lint"]
    }
  }
}
```

---

## 4. ORTAM DEĞİŞKENLERİ

### `.env.example` (Root)

```bash
# ===================================
# SPRINTA — Ortam Değişkenleri Şablon
# ===================================
# Bu dosyayı kopyalayıp .env olarak kaydet
# cp .env.example .env

# SUPABASE LOCAL (geliştirme)
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# SUPABASE PRODUCTION
# SUPABASE_URL=https://xxx.supabase.co
# SUPABASE_ANON_KEY=eyJ...
# SUPABASE_SERVICE_ROLE_KEY=eyJ...

# AI (Anthropic)
ANTHROPIC_API_KEY=sk-ant-...

# REVENUECAT (Ödeme)
REVENUECAT_API_KEY_IOS=appl_...
REVENUECAT_API_KEY_ANDROID=goog_...
REVENUECAT_WEBHOOK_SECRET=...

# EAS / EXPO
EXPO_TOKEN=...
EXPO_PROJECT_ID=...

# VERCEL
VERCEL_TOKEN=...
VERCEL_ORG_ID=...
VERCEL_PROJECT_ID_WEB=...
```

### `apps/mobile/.env.example`

```bash
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
EXPO_PUBLIC_REVENUECAT_API_KEY_IOS=appl_...
EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID=goog_...
EXPO_PUBLIC_ENV=development
```

### `apps/web/.env.local.example`

```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_ENV=development
```

---

## 5. KURULUM ADIMLARI

### 5.1 Gereksinimler

```bash
# Sürüm kontrolleri
node --version   # ≥ 18
pnpm --version   # ≥ 9
supabase --version  # ≥ 1.200

# Docker masaüstü çalışır olmalı (Supabase local için)
```

### 5.2 İlk Kurulum

```bash
# 1. Repoyu klonla
git clone https://github.com/yourorg/sprinta.git
cd sprinta

# 2. Bağımlılıkları yükle
pnpm install

# 3. Ortam değişkenlerini hazırla
cp .env.example .env
cp apps/mobile/.env.example apps/mobile/.env
cp apps/web/.env.local.example apps/web/.env.local

# 4. Supabase'i başlat
supabase start

# 5. Supabase çıktısından URL ve anahtarları kopyala
# API URL: http://127.0.0.1:54321
# anon key: eyJ...
# .env dosyalarını güncelle

# 6. Veritabanını kur
supabase db reset  # Tüm migration'ları ve seed'i çalıştırır

# 7. Bağlantıyı doğrula
pnpm run db:health

# 8. Geliştirme modunda başlat
pnpm run dev
```

### 5.3 Mobile Geliştirme

```bash
cd apps/mobile

# Expo Go ile (hızlı test)
npx expo start

# Geliştirici build (tam özellikler)
npx expo run:ios
npx expo run:android
```

### 5.4 Web Geliştirme

```bash
cd apps/web
pnpm run dev
# http://localhost:3000
```

---

## 6. SAĞLIK KONTROLÜ

```javascript
// scripts/db-health.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function checkHealth() {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

  console.log('🔍 Veritabanı bağlantısı kontrol ediliyor...');
  
  const { data, error } = await supabase
    .from('students')
    .select('count', { count: 'exact', head: true });

  if (error) {
    console.error('❌ Bağlantı HATASI:', error.message);
    process.exit(1);
  }
  
  console.log('✅ Veritabanı bağlantısı başarılı!');
  console.log(`📊 Öğrenci sayısı: ${data}`);
}

checkHealth();
```

---

## 7. TypeScript YAPISI

### `packages/shared/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "lib": ["ES2020"],
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "outDir": "./dist",
    "declaration": true,
    "skipLibCheck": true,
    "esModuleInterop": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### `packages/api-client/tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

---

## ✅ FAZ 01 TAMAMLANMA KRİTERLERİ

```bash
# Şunların hepsi başarılı olmalı:
pnpm install             # ✅ Hata yok
pnpm run typecheck       # ✅ Hata yok
supabase start           # ✅ Çalışıyor
pnpm run db:health       # ✅ Bağlantı OK
npx expo start           # ✅ QR kodu görünüyor
pnpm run dev (web)       # ✅ localhost:3000 açılıyor
```
