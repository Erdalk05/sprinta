# Sprinta — Proje Durum Raporu
**Tarih:** 22 Şubat 2026
**Branch:** `claude` (main'den ayrı)
**Son commit:** `d40ccf5` — v1.0 çalışan temel uygulama

---

## ✅ Tamamlanan

### Altyapı
- [x] Monorepo kurulumu (pnpm + Turborepo)
- [x] Expo 54 + React Native 0.81.5 + New Architecture + Hermes
- [x] `@sprinta/shared` paketi (ARP engine, types, utils)
- [x] `@sprinta/api` paketi (Supabase servis katmanı)
- [x] `.npmrc` — `shamefully-hoist=true` (CocoaPods uyumu)
- [x] iOS simulator build çalışıyor (iPhone 16 Pro)
- [x] Git repo kurulumu (`sprinta-22-subat-2026/`)

### Database (Supabase) — 11 Migration
- [x] `001` — Temel tablolar (users, sessions, readings)
- [x] `002` — Multi-tenant organizasyon desteği
- [x] `003` — Row Level Security (RLS) politikaları
- [x] `004` — Fonksiyonlar & trigger'lar
- [x] `005` — Performans index'leri
- [x] `006` — Seed data (demo verisi)
- [x] `007` — Gamification (badges, XP, streaks)
- [x] `008` — AI cron joblar
- [x] `009` — Content library şeması
- [x] `010` — Sınav programları (LGS, TYT, AYT, KPSS)
- [x] `011` — Sosyal özellikler & leaderboard

### Auth & Onboarding
- [x] Login ekranı (`app/(auth)/login.tsx`)
- [x] Register ekranı (`app/(auth)/register.tsx`)
- [x] Şifremi unuttum (`app/(auth)/forgot-password.tsx`)
- [x] Welcome ekranı (`app/(onboarding)/welcome.tsx`)
- [x] Günlük hedef seçimi (`app/(onboarding)/daily-goal.tsx`)
- [x] Tanılama daveti (`app/(onboarding)/diagnostic-invite.tsx`)
- [x] KVKK onay ekranı (`app/(onboarding)/consent.tsx`)

### Tab Ekranları (7 tab)
- [x] Ana Sayfa — ARP skoru, kısayollar, aktiviteler (`index.tsx`)
- [x] Antrenmanlar — Seans geçmişi ve yönetimi (`sessions.tsx`)
- [x] İlerleme — Grafikler ve analizler (`progress.tsx`)
- [x] Sosyal — Liderlik tablosu (`social.tsx`)
- [x] Profil — Kullanıcı bilgileri (`profile.tsx`)
- [x] Menü — Ayarlar ve navigasyon (`menu.tsx`)

### Tema Sistemi
- [x] Çift tema: Gündüz (WhatsApp açık) + Gece (WhatsApp koyu)
- [x] `useAppTheme()` hook — tüm ekranlarda aktif
- [x] `makeStyles` (ms(t)) pattern — tüm ekranlarda uygulandı
- [x] Gece/Gündüz toggle butonu (Menü ekranında)
- [x] Zustand + AsyncStorage ile kalıcı tema tercihi

### ARP Engine (`packages/shared/src/engine/`)
- [x] `arpCalculator.ts` — REI × CSF formülü
- [x] `performanceEngine.ts` — Ana performans hesaplama
- [x] `fatigueDetector.ts` — Yorgunluk tespiti
- [x] `difficultyAdapter.ts` — Adaptif zorluk ayarı
- [x] `stabilityAnalyzer.ts` — Performans stabilitesi
- [x] `modeRecommender.ts` — Seans modu önerisi
- [x] Test dosyaları (arpCalculator, performanceEngine, fatigueDetector)

### Egzersiz Akışı
- [x] Modül seçim ekranı (`exercise/[moduleCode]/index.tsx`)
- [x] Aktif okuma seansı (`exercise/[moduleCode]/session.tsx`)
- [x] Seans sonucu (`exercise/[moduleCode]/result.tsx`)
- [x] 4 temel modül: speed_control, deep_comprehension, attention_power, mental_reset

### Gamification (Adım 07)
- [x] 15 seviye sistemi (Başlangıç → Titan, 0–60.000 XP)
- [x] Badge (rozet) sistemi + RPC entegrasyonu
- [x] Streak takibi
- [x] XP bar, Level up modal, Badge award modal
- [x] Sosyal liderlik tablosu
- [x] `exercise-result.tsx` — Gamification sonuç ekranı

### Tanılama (Diagnostic)
- [x] Intro ekranı
- [x] Okuma hızı testi
- [x] Kavrama testi
- [x] Sonuç ekranı

### Sınav Programları
- [x] Program seçim ekranı (LGS, TYT, AYT, KPSS)
- [x] `programService.ts` — Program yönetim servisi

### Premium / Paywall
- [x] `paywall.tsx` modal ekranı
- [x] `usePremiumGate.ts` hook
- [x] RevenueCat entegrasyonu (`react-native-purchases ^9.10.1`)
- [x] `purchases.ts` servis dosyası

### API Servisleri (`packages/api-client/src/services/`)
- [x] `auth.ts` — Kimlik doğrulama
- [x] `performancePipeline.ts` — ARP işleme pipeline
- [x] `diagnosticService.ts` — Tanılama servisi
- [x] `badgeService.ts` — Rozet + streak RPC
- [x] `streakService.ts` — Streak servisi
- [x] `contentService.ts` — İçerik kütüphanesi
- [x] `programService.ts` — Program yönetimi
- [x] `aiCoachService.ts` — AI koç entegrasyonu
- [x] `leaderboardService.ts` — Liderlik tablosu
- [x] `purchases.ts` — Satın alma yönetimi

---

## ⏳ Yarım Kalan

### AI Coach (Adım 08 — Başlandı, bitmedi)
- [x] `ai-coach.tsx` ekran dosyası var (425 satır, tam UI)
- [x] `aiCoachService.ts` servis dosyası var
- [x] `useAiCoach.ts` hook var
- [x] Migration 008 (AI cron) var
- [ ] Gerçek AI bağlantısı (Claude API veya OpenAI) **eksik**
- [ ] Mesaj geçmişi Supabase'e kaydedilmiyor
- [ ] "Sabah brifing" özelliği tamamlanmadı
- [ ] AI Coach'un ARP verilerini okuması **bağlanmadı**

### Fiziksel Cihaz Build
- [ ] Code signing sertifikası ayarlanmadı
  - Xcode → Sprinta → Signing & Capabilities → Team seç
- [ ] WiFi üzerinden build için USB ile bir kez eşleştirme gerekiyor

### İçerik Kütüphanesi
- [ ] `009_content_library.sql` şeması var ama **gerçek içerik yok**
- [ ] `sampleContent.ts`'de örnek veriler var, DB'ye aktarılmadı
- [ ] Okuma metinleri (Türkçe) eklenmedi

---

## ❌ Henüz Başlanmayan

### Adım 09 — Sosyal & Meydan Okuma
- [ ] Arkadaş ekleme sistemi
- [ ] Meydan okuma (challenge) gönderme
- [ ] Grup antrenmanı
- [ ] Sosyal feed

### Adım 10 — Bildirimler
- [ ] Push notification kurulumu (expo-notifications)
- [ ] Günlük hatırlatma bildirimi
- [ ] Streak uyarısı bildirimi
- [ ] Rozet kazanma bildirimi

### Adım 11 — Offline Mod
- [ ] Çevrimdışı içerik indirme
- [ ] Sync mekanizması (online gelince yükle)
- [ ] MMKV cache katmanı (kurulu: v3.3.3, kullanılmıyor)

### Adım 12 — Analytics & Raporlama
- [ ] Haftalık/aylık rapor ekranı
- [ ] PDF rapor çıktısı
- [ ] Veli/öğretmen raporu

### Adım 13 — App Store Yayını
- [ ] EAS Build kurulumu
- [ ] App Store metadata (açıklama, ekran görüntüleri)
- [ ] TestFlight dağıtımı
- [ ] App Store Review süreci

---

## 📁 Dosya Yapısı

```
sprinta-22-subat-2026/
├── apps/
│   ├── mobile/                    # Expo RN uygulaması
│   │   ├── app/
│   │   │   ├── (auth)/            # login, register, forgot-password
│   │   │   ├── (onboarding)/      # welcome, daily-goal, consent, diagnostic-invite
│   │   │   ├── (tabs)/            # 7 tab ekranı
│   │   │   ├── (modals)/          # paywall
│   │   │   ├── diagnostic/        # intro, reading, comprehension, result
│   │   │   ├── exercise/          # [moduleCode]/index, session, result
│   │   │   ├── program/           # select
│   │   │   ├── ai-coach.tsx       # AI Koç ekranı
│   │   │   └── exercise-result.tsx
│   │   ├── src/
│   │   │   ├── constants/         # colors, levels, modules
│   │   │   ├── stores/            # authStore, gamificationStore, sessionStore,
│   │   │   │                      # diagnosticStore, themeStore
│   │   │   ├── hooks/             # useAiCoach, usePremiumGate, useSessionTimer
│   │   │   ├── components/        # exercise/, gamification/, ui/
│   │   │   ├── data/              # diagnosticContent, sampleContent
│   │   │   └── theme/             # useAppTheme.ts, index.ts
│   │   └── ios/                   # Native iOS (Podfile, Sprinta.xcworkspace)
│   └── web/                       # Next.js web (minimal)
├── packages/
│   ├── shared/                    # ARP engine, types, utils, legal
│   │   └── src/
│   │       ├── engine/            # 7 engine dosyası + testler
│   │       ├── constants/         # levels, content
│   │       ├── types/             # engine.ts, index.ts
│   │       └── utils/             # readabilityScorer
│   └── api-client/                # Supabase servis katmanı
│       └── src/services/          # 10 servis dosyası
├── supabase/
│   └── migrations/                # 11 migration dosyası (001–011)
├── STATUS.md                      # Bu dosya
├── .npmrc                         # shamefully-hoist=true
├── turbo.json                     # Turborepo config
└── package.json                   # Root workspace
```

---

## 🗄️ Database Durumu

| Tablo | Durum | Notlar |
|-------|-------|--------|
| `students` | ✅ Aktif | auth entegre |
| `sessions` | ✅ Aktif | ARP verileri |
| `reading_contents` | ⚠️ Boş | Şema var, içerik yok |
| `badges` | ✅ Aktif | 7+ rozet tanımlı |
| `streaks` | ✅ Aktif | RPC fonksiyonları var |
| `organizations` | ✅ Aktif | Multi-tenant hazır |
| `exam_programs` | ✅ Aktif | LGS/TYT/AYT/KPSS |
| `leaderboards` | ✅ Aktif | Haftalık/aylık |
| `ai_conversations` | ⚠️ Var | AI bağlantısı eksik |

**Supabase:** Remote (prod) bağlantısı `.env` dosyasında tanımlı
**RLS:** Tüm tablolarda aktif

---

## 🐛 Bilinen Hatalar ve Çözümleri

| Hata | Çözüm |
|------|-------|
| `expo-dev-client` build crash | Kurulu DEĞİL — RN 0.81.5 prebuilt ile uyumsuz, kurma |
| Fiziksel cihaz code signing | Xcode → Signing & Capabilities → Team seç |
| WiFi build çalışmıyor | USB ile bir kez bağla → "Connect via network" işaretle |
| `git add (tabs)/*.tsx` zsh glob hatası | `git add -A` veya tırnak içinde yaz |
| `simctl tap` komutu yok | AppleScript ile tıklama yap |
| Simulator penceresi kayboldu | `defaults delete com.apple.iphonesimulator` → yeniden aç |
| TypeScript binary lokasyonu | Root'ta: `node_modules/.bin/tsc`, mobile'da değil |
| `expo run:ios` interactive mod | `--device "cihaz adı"` ile belirt |

---

## 🚀 Sonraki Adımlar (Öncelik Sırasıyla)

### Kısa Vadeli (Bu Hafta)
1. **Fiziksel cihaz code signing** — Xcode'da Team ayarla, gerçek cihazda test et
2. **AI Coach tamamla (Adım 08)** — Claude API bağlantısı + mesaj kaydı
3. **İçerik kütüphanesi** — En az 20 Türkçe okuma metni ekle
4. **Sabah brifing** — AI Coach'un günlük özet özelliği

### Orta Vadeli (Bu Ay)
5. **Adım 09** — Sosyal & meydan okuma özellikleri
6. **Adım 10** — Push bildirimler
7. **MMKV cache** — Offline performans iyileştirmesi
8. **Adım 11** — Offline mod

### Uzun Vadeli
9. **EAS Build** — TestFlight dağıtımı
10. **Analytics** — Haftalık/aylık raporlar
11. **App Store** — Yayın süreci

---

## 🔑 Önemli Komutlar

```bash
# iOS Simulator build
cd apps/mobile && /path/to/root/node_modules/.bin/expo run:ios --device "iPhone 16 Pro"

# Fiziksel cihaz build (code signing gerekli)
cd apps/mobile && /path/to/root/node_modules/.bin/expo run:ios --device "E pur si muove"

# TypeScript kontrol
cd apps/mobile && /Users/erdalkiziroglu/sprinta-22-subat-2026/node_modules/.bin/tsc --noEmit

# v1.0'a dön
git reset --hard d40ccf5

# DB migration uygula
supabase db push  # ya da: supabase db reset

# Test çalıştır
pnpm --filter @sprinta/shared test
```

---

*Bu dosya otomatik oluşturuldu — 22 Şubat 2026*
