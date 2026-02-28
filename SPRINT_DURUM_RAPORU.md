# SPRINTA — Sprint Durum Raporu
> **Tarih:** 23 Şubat 2026 | **Branch:** claude | **Versiyon:** 1.0.0

---

## 1. Proje Genel Bakış

**Sprinta**, okuma hızı ve anlama becerisini geliştiren, gamification tabanlı bir mobil + web uygulamasıdır.

### Stack

| Katman | Teknoloji |
|--------|-----------|
| **Mobile** | Expo 54, React Native 0.81.5, expo-router v4 |
| **Web** | Next.js 16.1.5, React 19.1.0, Tailwind CSS 4 |
| **State** | Zustand ^5.0.3 + AsyncStorage persist |
| **Backend** | Supabase (PostgreSQL + RLS + Edge Functions) |
| **API Paketi** | @sprinta/api (api-client) — Supabase servis katmanı |
| **Paylaşılan** | @sprinta/shared — ARP engine, types, utils |
| **Premium** | RevenueCat (react-native-purchases ^9.10.1) |
| **Build** | pnpm@9 + Turborepo monorepo |
| **iOS Native** | New Architecture (Fabric/TurboModules) + Hermes |
| **Animasyon** | react-native-reanimated ~4.1.6 + react-native-worklets |

### Mimari

```
sprinta-22-subat-2026/
├── apps/
│   ├── mobile/                  # Expo 54 + RN 0.81.5 (iOS + Android)
│   └── web/                     # Next.js 16 (admin/panel)
├── packages/
│   ├── shared/                  # @sprinta/shared — ARP engine, types
│   └── api-client/              # @sprinta/api — Supabase servisler
├── supabase/
│   ├── migrations/              # 13 SQL migration dosyası
│   └── seed/                    # Seed data
├── .npmrc                       # shamefully-hoist=true (CocoaPods uyumu)
├── turbo.json
└── pnpm-lock.yaml
```

---

## 2. Mevcut Durum

### 2.1 Tamamlanan Fazlar

#### FAZ 0 — Altyapı ✅
- pnpm monorepo + Turborepo kurulumu
- Expo 54 + React Native 0.81.5 + New Architecture (Fabric/TurboModules)
- Hermes JS engine aktif
- `shamefully-hoist=true` (`.npmrc`) — CocoaPods uyumu için zorunlu
- pnpm override: `react-native-mmkv: 3.3.3`, `react: 19.1.0`
- GitHub CI/CD + EAS CLI v18 kurulumu

#### FAZ 1 — Database Katmanı ✅
13 Supabase migration dosyası tamamlandı:

| Migration | İçerik |
|-----------|--------|
| 001_initial_schema | `students`, `sessions`, `readings` temel tabloları |
| 002_multi_tenant | Organizasyon/multi-tenant desteği |
| 003_rls_policies | Row Level Security — tüm tablolar |
| 004_functions_triggers | PL/pgSQL fonksiyonlar + triggerlar |
| 005_indexes | Performans indexleri |
| 006_seed_data | Demo/test verisi |
| 007_gamification | `badges`, `streaks`, `xp_logs` tabloları |
| 008_ai_cron | AI cron jobs |
| 009_content_library | İçerik kütüphanesi şeması |
| 010_exam_programs | LGS, TYT, AYT, KPSS programları |
| 011_social_leaderboard | Sosyal özellikler + liderlik tablosu |
| 012_content_seed | **70 KB** — Ana içerik verisi |
| 013_onboarding_telemetry | Onboarding telemetri tablosu + `baseline_arp` kolonu |

#### FAZ 2 — Auth Flow ✅
- `app/(auth)/login.tsx` — Supabase email/password girişi
- `app/(auth)/register.tsx` — Kayıt + quiz telemetri kaydı
- `app/(auth)/forgot-password.tsx` — Şifre sıfırlama

#### FAZ 3 — Tema Sistemi (Çift Tema) ✅
**WhatsApp-inspired tasarım dili:**

| Özellik | Light Tema | Dark Tema |
|---------|-----------|-----------|
| Arkaplan | `#ECE5DD` | `#0B141A` |
| Primary | `#25D366` | `#00A884` |
| Panel | `#075E54` | `#202C33` |

- `src/theme/index.ts` — `buildTheme()` fabrikası, `lightTheme` + `darkTheme`
- `src/theme/colors.ts`, `typography.ts`, `spacing.ts`, `shadows.ts`
- `src/stores/themeStore.ts` — Zustand + AsyncStorage persist
- `src/theme/useAppTheme.ts` — `useAppTheme()` + `useThemeToggle()`
- Toggle butonu: `menu.tsx` header'da 🌙/☀️
- **Tüm ekranlar** `useAppTheme()` + `useMemo(() => ms(t), [t])` pattern ile güncellendi

#### FAZ 4 — Navigasyon ✅
**CGD-style 3 tab navigasyon:**

```
Ana Sayfa | 🎓 Sprinta (merkez) | Menü
```

- `app/(tabs)/_layout.tsx` — Custom `SprintaTabBar` bileşeni
- `app/_layout.tsx` — 4-seviyeli routing guard:
  1. Quiz tamamlanmadı → `/onboarding`
  2. Login yok → `/(auth)/login`
  3. Diagnostic yok → `/(onboarding)/welcome`
  4. Her şey tamam → `/(tabs)`

#### FAZ 5 — Onboarding Flow ✅
**İki katmanlı onboarding:**

**Katman 1 — Quiz Onboarding (yeni v2.5):**
- `app/onboarding.tsx` + `src/features/onboarding/OnboardingScreen.tsx`
- `src/features/onboarding/QuizEngine.ts` — 15 soruluk havuz, 5 topic, AsyncStorage history
- `src/features/onboarding/ResultEngine.ts` — ARP hesabı (doğruluk × ağırlık + hız bonusu)
- `src/features/onboarding/onboardingStore.ts` — Zustand + failsafe try/catch
- **3 adım:** Quiz → Loading (1500ms) → Result (CountUp animasyon + confetti)

**Katman 2 — Diagnostic Onboarding:**
- `app/(onboarding)/` — welcome, daily-goal, diagnostic-invite, consent (4 adım)
- `app/diagnostic/` — intro, reading, comprehension, result (4 adım)

#### FAZ 6 — Gamification Engine ✅
- `src/features/rewards/EventBus.ts` — Type-safe event bus (8 event tipi)
- `src/features/rewards/LevelEngine.ts` — 3 seviye: Başlangıç/Gelişen/Uzman, üstel XP eğrisi
- `src/features/rewards/ConfettiController.ts` — 5s cooldown, pure callback (harici paket yok)
- `src/features/rewards/RewardEngine.ts` — 8 rozet, EventBus-driven, Haptics
- `src/features/rewards/rewardStore.ts` — Zustand + AsyncStorage
- `src/constants/levels.ts` — 15 seviye tanımı (Başlangıç → Titan)
- `packages/shared/src/engine/` — ARP hesaplama motoru (REI × CSF formülü)

#### FAZ 7 — Ana Sayfa (GameHomeScreen) ✅
- `src/features/home/GameHomeScreen.tsx` — tam v2.5 upgrade
- Özellikler:
  - `MOTIVATION_MESSAGES[6]` — mount'ta rastgele motivasyon mesajı
  - `StreakWarningBanner` — saat ≥ 20 ve streak > 0 ise uyarı
  - `DailyMissionCard` — dinamik CTA (devam et vs hızlı başla)
  - `useCountUp(target, 800)` — XP count-up animasyonu
  - `MomentumStats` — Animated.spring micro animasyon
  - `BadgeToast` — EventBus'tan BADGE_UNLOCKED → slide-in toast (2s)

#### FAZ 8 — UI Bileşen Kütüphanesi ✅
```
src/components/
├── gamification/   # BadgeAwardModal, BadgeCard, LevelUpModal, XPBar
├── exercise/       # AttentionGrid, BreathingCircle, ChunkReader, QuestionCard, TextReader
└── ui/             # Badge, Button, Card, ChatBubble, GradientCard, Input,
                    # LineChart, ProgressBar, ProgressRing, StatChip
```

#### FAZ 9 — Egzersiz Flow ✅
- `app/exercise/[moduleCode]/` — index (seçim), session (seans), result (sonuç)
- 4 modül: `speed_control`, `deep_comprehension`, `attention_power`, `mental_reset`
- `QuestionCard` — `key={questionIndex}` fix (soru geçişi bug'ı çözüldü)
- `app/exercise-result.tsx` — Gamification sonuç ekranı

#### FAZ 10 — API Servisleri ✅
```
packages/api-client/src/services/
├── auth.ts                   # Kimlik doğrulama
├── performancePipeline.ts    # ARP işleme pipeline'ı
├── diagnosticService.ts      # Tanılama
├── badgeService.ts           # Rozet + streak RPC
├── streakService.ts          # Streak yönetimi
├── aiCoachService.ts         # AI koç servisi
├── contentService.ts         # İçerik servisi
├── leaderboardService.ts     # Sosyal liderlik tablosu
├── programService.ts         # Sınav programları
└── purchases.ts              # RevenueCat premium
```

#### FAZ 11 — Premium Katmanı (Kısmi) ✅
- `app/(modals)/paywall.tsx` — Paywall ekranı
- `src/hooks/usePremiumGate.ts` — Premium kontrol hook
- RevenueCat entegrasyonu (react-native-purchases ^9.10.1)

---

## 3. Dosya Yapısı — Kritik Dosyalar Durumu

### Mobile App (`apps/mobile/`)

| Dosya | Durum | Not |
|-------|-------|-----|
| `app/_layout.tsx` | ✅ Tam | 4-seviyeli routing guard |
| `app/(tabs)/_layout.tsx` | ✅ Tam | Custom CGD bottom bar |
| `app/(tabs)/index.tsx` | ✅ Tam | GameHomeScreen entegre |
| `app/(tabs)/menu.tsx` | ✅ Tam | Tema toggle dahil |
| `app/onboarding.tsx` | ✅ Tam | v2.5 quiz onboarding |
| `app/(auth)/login.tsx` | ✅ Tam | Telemetri kaydı dahil |
| `app/(auth)/register.tsx` | ✅ Tam | Telemetri kaydı dahil |
| `app/diagnostic/comprehension.tsx` | ✅ Fix | key={questionIndex} bug fix |
| `app/exercise/[moduleCode]/session.tsx` | ✅ Fix | key={questionIndex} bug fix |
| `app/ai-coach.tsx` | ✅ Var | |
| `app/program/select.tsx` | ✅ Var | |
| `babel.config.js` | ✅ Fix | `react-native-worklets/plugin` (kritik fix) |
| `Podfile` | ✅ Tam | 89 pod |

### Source (`apps/mobile/src/`)

| Dosya/Klasör | Durum | Not |
|-------------|-------|-----|
| `features/onboarding/OnboardingScreen.tsx` | ✅ Tam | 407 satır, 3 adım |
| `features/onboarding/QuizEngine.ts` | ✅ Tam | 15 soru, history protection |
| `features/onboarding/ResultEngine.ts` | ✅ Tam | ARP hesabı |
| `features/onboarding/onboardingStore.ts` | ✅ Tam | Failsafe |
| `features/rewards/EventBus.ts` | ✅ Tam | 8 event tipi |
| `features/rewards/RewardEngine.ts` | ✅ Tam | 8 rozet |
| `features/rewards/LevelEngine.ts` | ✅ Tam | Üstel XP |
| `features/rewards/ConfettiController.ts` | ✅ Tam | Pure callback |
| `features/rewards/rewardStore.ts` | ✅ Tam | Zustand persist |
| `features/home/GameHomeScreen.tsx` | ✅ Tam | v2.5 upgrade |
| `theme/index.ts` | ✅ Tam | Light + Dark |
| `stores/themeStore.ts` | ✅ Tam | AsyncStorage |
| `stores/authStore.ts` | ✅ Tam | |
| `stores/gamificationStore.ts` | ✅ Tam | |
| `stores/sessionStore.ts` | ✅ Tam | |
| `stores/diagnosticStore.ts` | ✅ Tam | |
| `components/ui/*` | ✅ Tam | 10 bileşen |
| `components/exercise/*` | ✅ Tam | 5 bileşen |
| `components/gamification/*` | ✅ Tam | 4 bileşen |

### Shared Package (`packages/shared/`)

| Dosya | Durum | Not |
|-------|-------|-----|
| `engine/arpCalculator.ts` | ✅ Tam | REI × CSF |
| `engine/performanceEngine.ts` | ✅ Tam | |
| `engine/fatigueDetector.ts` | ✅ Tam | |
| `engine/difficultyAdapter.ts` | ✅ Tam | |
| `engine/stabilityAnalyzer.ts` | ✅ Tam | |
| `engine/modeRecommender.ts` | ✅ Tam | |
| `constants/levels.ts` | ✅ Tam | 15 seviye |
| `legal/kvkk.ts` | ✅ Tam | |

---

## 4. Sprint Özeti

### ✅ Tamamlanan İşler

**Sprint 1 — Altyapı ve Database**
- [x] pnpm monorepo + Turborepo kurulumu
- [x] Expo 54 + React Native 0.81.5 + New Architecture
- [x] 13 Supabase migration (132 KB SQL)
- [x] RLS politikaları + PL/pgSQL fonksiyonları
- [x] GitHub CI/CD + EAS CLI v18
- [x] DEPLOY.md oluşturuldu

**Sprint 2 — Auth ve Navigasyon**
- [x] Login / Register / Forgot Password ekranları
- [x] Supabase auth entegrasyonu
- [x] 4-seviyeli routing guard (`_layout.tsx`)
- [x] CGD-style 3-tab bottom navigasyon

**Sprint 3 — Tema Sistemi**
- [x] WhatsApp-inspired çift tema (Light + Dark)
- [x] `buildTheme()` fabrikası
- [x] `useAppTheme()` hook
- [x] Tüm ekranlar `useMemo` pattern ile güncellendi
- [x] Tema toggle (menu header 🌙/☀️)

**Sprint 4 — Onboarding Flow**
- [x] Quiz onboarding (OnboardingScreen v2.5 — 14 adım prompt)
- [x] QuizEngine (15 soru, 5 topic, AsyncStorage history)
- [x] ResultEngine (ARP hesabı, hız bonusu)
- [x] Confetti animasyonu (pure Animated API)
- [x] Diagnostic onboarding (welcome → consent → reading → result)
- [x] Onboarding telemetri (`013_onboarding_telemetry.sql`)

**Sprint 5 — Gamification Engine**
- [x] EventBus (8 event tipi, type-safe)
- [x] LevelEngine (üstel XP eğrisi)
- [x] RewardEngine (8 rozet, Haptics)
- [x] ConfettiController (5s cooldown)
- [x] rewardStore (Zustand + AsyncStorage)
- [x] GameHomeScreen v2.5 (motivasyon, streak uyarı, CountUp, BadgeToast)
- [x] 15 seviye sistemi (Başlangıç → Titan)

**Sprint 6 — Egzersiz ve UI**
- [x] Egzersiz flow (seçim → seans → sonuç)
- [x] QuestionCard `key` bug fix (soru geçişi)
- [x] Gamification sonuç ekranı (`exercise-result.tsx`)
- [x] UI bileşen kütüphanesi (10 ui + 5 exercise + 4 gamification)
- [x] ARP engine (shared paketi)

**Sprint 7 — API ve Premium**
- [x] 10 API servis dosyası (api-client paketi)
- [x] Paywall ekranı
- [x] RevenueCat entegrasyonu
- [x] `usePremiumGate` hook

**Sprint 8 — Build/Babel Fix (Son Sprint)**
- [x] `react-native-worklets/plugin` babel fix (kritik)
- [x] Full clean iOS rebuild (node_modules → DerivedData → pod install → build)
- [x] **Sprinta.app** başarıyla simülatörde çalışıyor (PID 14759, 0 hata)

---

### 🔄 Devam Eden / Kısmi İşler

| Alan | Durum | Not |
|------|-------|-----|
| **Premium İçerik** | 🔄 Kısmi | Paywall var, içerik kilitleme tamamlanmadı |
| **AI Koç** | 🔄 Kısmi | `ai-coach.tsx` var, servis var; UI eksik |
| **Seans Ekranları** | 🔄 Kısmi | `sessions.tsx`, `progress.tsx`, `social.tsx` tab'ları gizli |
| **Sosyal/Liderlik** | 🔄 Kısmi | DB + servis var, UI yok |
| **Web Uygulaması** | 🔄 Kısmi | Next.js yapısı var, içerik eksik |
| **Push Notifications** | 🔄 Yok | Cron jobs var, expo-notifications kurulu değil |

---

### ⏳ Yapılacaklar (Öncelik Sırasına Göre)

#### Öncelik 1 — Kritik (Sonraki Sprint)

1. **Seans Akışı Tam Bağlantısı**
   - `sessions.tsx` tab'ını aktif et (gizlemeden çıkar)
   - Egzersiz sonrası XP kaydını Supabase'e yaz (şu an yalnızca local store)
   - `performancePipeline.ts` uçtan uca test et

2. **Progress Ekranı**
   - `progress.tsx` aktif et
   - ARP geçmişi grafiği (LineChart bileşeni hazır)
   - Streak takvimi

3. **Premium İçerik Kilitleme**
   - `usePremiumGate` hook'unu egzersiz akışına bağla
   - Ücretsiz kullanıcı için limit (örn: 3 seans/gün)

4. **Android Build**
   - Şu an yalnızca iOS test edildi
   - `expo run:android` test edilmeli

#### Öncelik 2 — Önemli

5. **AI Koç UI**
   - `ai-coach.tsx` ekranını tamamla
   - Chat bubble UI (bileşen hazır)
   - Streaming response

6. **Profil Ekranı**
   - `profile.tsx` tab'ını aktif et
   - Kullanıcı istatistikleri
   - Badge koleksiyonu gösterimi

7. **Sosyal / Liderlik**
   - `social.tsx` tab'ını aktif et
   - Leaderboard listesi (servis hazır)
   - Arkadaş ekleme

8. **Bildirimler**
   - `expo-notifications` kur
   - Günlük antrenman hatırlatıcısı
   - Streak kaybolmak üzere uyarısı

#### Öncelik 3 — İyileştirme

9. **Offline Support**
   - MMKV cache (kurulu ama kullanılmıyor)
   - Offline seans desteği

10. **Web Dashboard**
    - Next.js admin panelini tamamla
    - Kullanıcı istatistik grafikleri
    - İçerik yönetimi

11. **EAS Build (App Store)**
    - `eas.json` yapılandır
    - TestFlight yükleme
    - App Store metadata

---

## 5. Teknik Borç

| # | Alan | Sorun | Öncelik |
|---|------|-------|---------|
| 1 | **expo-dev-client** | Kurulu değil — RN 0.81.5 prebuilt core ile uyumsuz. Hot reload yok. | Yüksek |
| 2 | **EAS Project ID** | `app.json`'da `YOUR_EAS_PROJECT_ID` placeholder | Yüksek |
| 3 | **Seans XP Kaydı** | XP yalnızca local Zustand store'da, Supabase'e yazılmıyor | Yüksek |
| 4 | **Android Test** | Hiç test edilmedi | Yüksek |
| 5 | **`sessions.tsx`** | Tab gizli, içerik yok | Orta |
| 6 | **`progress.tsx`** | Tab gizli, içerik yok | Orta |
| 7 | **`social.tsx`** | Tab gizli, içerik yok | Orta |
| 8 | **MMKV** | Kurulu ama kullanılmıyor (offline cache yok) | Orta |
| 9 | **Confetti** | Pure Animated kullanılıyor (react-native-confetti-cannon kaldırıldı — Babel uyumsuzluğu) | Düşük |
| 10 | **Web App** | Next.js yapısı var ama içerik eksik | Düşük |
| 11 | **Test Coverage** | Yalnızca `packages/shared` testleri var (3 dosya) | Düşük |
| 12 | **Push Notifications** | `expo-notifications` kurulu değil | Düşük |

---

## 6. Kritik Teknik Notlar

```bash
# iOS build komutu (tek doğru yol)
cd /Users/erdalkiziroglu/sprinta-22-subat-2026/apps/mobile
../../../node_modules/.bin/expo run:ios --device "iPhone 16 Pro"

# tsc binary (root'ta, mobile'da değil)
/Users/erdalkiziroglu/sprinta-22-subat-2026/node_modules/.bin/tsc

# Tam cache temizleme (build hatasında)
pkill -9 -f "node"
lsof -ti :8081 | xargs kill -9
rm -rf apps/mobile/.expo
watchman watch-del-all
rm -rf apps/mobile/node_modules/.cache
rm -rf ~/Library/Developer/Xcode/DerivedData/Sprinta-*
pnpm install
cd apps/mobile/ios && pod install
```

### Paket Versiyon Sabitlemeleri
```
react-native-mmkv: 3.3.3 (pnpm override — MMKV native uyumsuzluğu)
react: 19.1.0 (pnpm override — RN 0.81.5 ile uyum)
babel.config.js: react-native-worklets/plugin (reanimated v4.1.6 breaking change)
```

### Test Kullanıcıları
```
test@test.com / Test1234          (genel test)
ayse@sprinta.app / Demo1234       (demo)
mehmet@sprinta.app / Demo1234     (demo)
```

---

## 7. Sonraki Sprint Önerileri

### Öneri A — "Seans Döngüsü Sprint" (En Kritik)
> Kullanıcı seans yapabilmeli ve XP kazanabilmeli (uçtan uca)

1. `sessions.tsx` tab aktif et
2. Egzersiz bitince XP → Supabase `xp_logs` tablosuna yaz
3. Streak güncelleme (gün sonu cron veya seans anında)
4. `progress.tsx` — ARP grafiği göster

**Tahmini süre:** 1 sprint (2-3 gün)

---

### Öneri B — "Android + App Store Sprint"
> Production'a hazırlık

1. Android build test (`expo run:android`)
2. EAS Project ID ayarla
3. `eas.json` yapılandır
4. TestFlight yükle

**Tahmini süre:** 1 sprint (1-2 gün)

---

### Öneri C — "Sosyal + Bildirim Sprint"
> Kullanıcı tutma mekanizmaları

1. `social.tsx` — leaderboard UI
2. `expo-notifications` — günlük hatırlatıcı
3. Streak kaybolma uyarısı push notification
4. Profil ekranı

**Tahmini süre:** 1 sprint (3-4 gün)

---

## 8. Dosya Sayısı Özeti

| Kategori | Dosya Sayısı |
|----------|-------------|
| Mobile app ekranları (`app/`) | 32 .tsx |
| Mobile src (`src/`) | 48 .ts/.tsx |
| Shared paketi | 20 dosya |
| API-client paketi | 14 dosya |
| Supabase migrations | 13 .sql |
| **TOPLAM** | **~300+ TypeScript/SQL dosyası** |

---

## 9. Son Build Durumu

```
Tarih         : 23 Şubat 2026, 01:58 AM
Build Tipi    : Debug (iphonesimulator)
Hedef         : iPhone 16 Pro (D480B886-A19B-47CA-BE1D-FE835CE84993)
Durum         : ✅ BUILD SUCCEEDED
Native Hatası : 0
JS Hatası     : 0
PID           : 14759 (UIKitApplication:app.sprinta.mobile)
Bundle ID     : app.sprinta.mobile
```

**Babel Fix (Kritik):**
```js
// babel.config.js — react-native-reanimated v4.1.6 breaking change
// ❌ Eski (hata veren):
plugins: ['react-native-reanimated/plugin']

// ✅ Yeni (çalışan):
plugins: ['react-native-worklets/plugin']
```

---

*Rapor otomatik oluşturuldu — Claude Code tarafından, 23 Şubat 2026*
