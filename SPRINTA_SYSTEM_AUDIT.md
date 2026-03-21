# SPRINTA — TAM SİSTEM DENETİM RAPORU
> Tarih: 2026-03-21 | Denetçi: Senior Software Architect & Security Engineer

---

## İçindekiler

1. [Ürün Genel Bakış](#1-ürün-genel-bakış)
2. [Teknoloji Yığını](#2-teknoloji-yığını)
3. [Sistem Mimarisi](#3-sistem-mimarisi)
4. [Özellikler ve Modüller](#4-özellikler-ve-modüller)
5. [Temel Modüller Derin İnceleme](#5-temel-modüller-derin-i̇nceleme)
6. [Veritabanı ve Supabase Analizi](#6-veritabanı-ve-supabase-analizi)
7. [6.5 Edge Functions Denetimi](#65-edge-functions-denetimi)
8. [Altyapı ve DevOps](#7-altyapı-ve-devops)
9. [Güvenlik Denetimi](#8-güvenlik-denetimi)
10. [Kullanıcı Akışı](#9-kullanıcı-akışı)
11. [Kod Kalitesi](#10-kod-kalitesi)
12. [Performans](#11-performans)
13. [Eksik Parçalar](#12-eksik-parçalar)
14. [Öncelikli Düzeltme Listesi](#13-öncelikli-düzeltme-listesi)

---

# 1. Ürün Genel Bakış

## Nedir?

Sprinta, Türk öğrencilere yönelik yapay zeka destekli bir **hız okuma ve sınav hazırlık platformudur**. Mobil-öncelikli (React Native/Expo) yaklaşımla tasarlanmıştır; tamamlayıcı bir Next.js yönetim paneli ve tamamen Supabase tabanlı bir backend altyapısına sahiptir.

## Hangi Sorunu Çözüyor?

Türkiye'deki standart sınavlar (LGS, TYT, AYT, YDS, KPSS, ALES) oldukça uzun metinler ve anlama soruları içerir. Öğrencilerin büyük çoğunluğu:
- Yavaş okuma hızı nedeniyle sınavda zamana yetişemiyor
- Hızlı okuduğunda anlama kalitesi düşüyor
- Bireysel zayıf noktalarına göre uyarlanmış bir çalışma planına sahip olamıyor

Sprinta, bilimsel temelli okuma egzersizleri (RSVP, Bionic Reading, ORP), göz takibi antrenmanları ve yapay zeka koçluğu ile bu boşluğu kapatmaya çalışmaktadır.

## Hedef Kullanıcılar

| Segment | Profil |
|---------|--------|
| **Birincil** | LGS'ye hazırlanan 8. sınıf öğrencileri (13-15 yaş) |
| **İkincil** | TYT/AYT hazırlayan lise öğrencileri (16-18 yaş) |
| **Üçüncül** | YDS/KPSS/ALES hazırlayan üniversite öğrencileri ve yetişkinler |
| **B2B** | Dershaneler ve özel okullar (multi-tenant panel) |

---

# 2. Teknoloji Yığını

## 2.1 Frontend — Mobil (iOS / Android)

| Bileşen | Teknoloji | Versiyon |
|---------|-----------|----------|
| Framework | Expo + React Native | 54.0.33 / 0.81.5 |
| React | React | 19.1.0 |
| Routing | Expo Router (File-based) | ~6.0.23 |
| Animasyon | React Native Reanimated | ~4.1.6 |
| Gesture | React Native Gesture Handler | ~2.28.0 |
| State (global) | Zustand | ^5.0.3 |
| State (kalıcı) | React Native MMKV | ^3.3.0 |
| UI Grafik | React Native SVG | ^15.12.1 |
| Haptics | Expo Haptics | ~15.0.8 |
| Ses | Expo AV + Expo Audio | ~16.0.8 / ~1.1.1 |
| Bildirim | Expo Notifications | ~0.32.16 |
| Dosya | Expo Document Picker + File System | ~14.0.8 / ~19.0.21 |
| Font | Expo Google Fonts (Inter) | ^0.4.2 |
| Güvenli Depolama | Expo Secure Store | ~15.0.8 |
| Gradient | Expo Linear Gradient | ^15.0.8 |
| Blur | Expo Blur | ^15.0.8 |
| Supabase | @supabase/supabase-js | ^2.43.0 |
| Ödeme | react-native-purchases (RevenueCat) | ^9.10.1 |
| Validasyon | Zod | ^3.22.0 |
| Worklets | react-native-worklets | ^0.7.4 |
| Mimari | New Architecture (JSI) | Aktif |
| JS Engine | Hermes | Aktif |

**Not:** `expo-dev-client` kasıtlı olarak kurulmamış — RN 0.81.5 prebuilt core ile uyumsuzluk nedeniyle.

## 2.2 Frontend — Web (Admin Panel)

| Bileşen | Teknoloji | Versiyon |
|---------|-----------|----------|
| Framework | Next.js (App Router) | ^16.1.5 |
| React | React | 19.1.0 |
| Stil | TailwindCSS | ^4.2.0 |
| Grafik | Recharts | ^3.7.0 |
| İkon | Lucide React | ^0.575.0 |
| Supabase | @supabase/ssr + @supabase/supabase-js | ^0.8.0 / ^2.43.0 |
| Birleştirme | tailwind-merge | ^2.3.0 |
| Validasyon | Zod | ^3.22.0 |
| Tipler | @types/node, @types/react | ^22 / ^19 |

## 2.3 Backend

| Bileşen | Teknoloji |
|---------|-----------|
| Veritabanı | Supabase (PostgreSQL 15) |
| Auth | Supabase Auth (JWT, email/password) |
| Realtime | Supabase Realtime (WebSocket, not yet used actively) |
| Storage | Supabase Storage (50MB limit) |
| Edge Functions | Deno + TypeScript (8 fonksiyon) |
| AI / LLM | Anthropic Claude (Haiku + Sonnet) |
| Monorepo | pnpm workspaces + Turborepo |
| TypeScript | 5.4+ (strict mode) |

## 2.4 Paylaşımlı Paketler

| Paket | Yol | İçerik |
|-------|-----|--------|
| `@sprinta/shared` | `packages/shared` | Tip tanımları, ARP motoru, Yorgunluk dedektörü, Okuma motoru, Okunabilirlik skoru, KVKK metni |
| `@sprinta/api` | `packages/api-client` | Supabase servisleri (auth, content, diagnostics, badges, leaderboard, examService, mentorService, libraryService, adminService) |

## 2.5 Harici Servisler

| Servis | Amaç | Entegrasyon |
|--------|-------|-------------|
| **Anthropic Claude Haiku** | AI metadata, soru üretimi, mentor geri bildirimi, haftalık rapor | Edge Functions |
| **Anthropic Claude Sonnet** | AI Coach (yüksek kalite yanıt) | `ai-coach` Edge Function |
| **RevenueCat** | Abonelik yönetimi (iOS/Android) | `react-native-purchases` |
| **Supabase** | DB + Auth + Storage + Realtime | Tüm platform |
| **Expo EAS** | Mobil build servisi | `eas.json` config mevcut |

## 2.6 Geliştirme Araçları

| Araç | Versiyon | Amaç |
|------|----------|-------|
| pnpm | 9.0.0 | Paket yönetici |
| Turborepo | — | Monorepo orkestrasyon |
| Vitest | — | Unit test (shared paket) |
| TypeScript | ^5.4.0 | Tip güvenliği |
| Node.js | >=18 | Gereksinim |

---

# 3. Sistem Mimarisi

## 3.1 Yüksek Seviye Mimari

```
┌─────────────────────────────────────────────────────────────────┐
│                        KULLANICI KATMANI                         │
├───────────────────────────┬─────────────────────────────────────┤
│    MOBIL (iOS/Android)    │         WEB (Admin Panel)           │
│  Expo 54 / RN 0.81.5     │         Next.js App Router          │
│  Expo Router (file-based) │         TailwindCSS 4.2.0          │
│  Reanimated 4 + MMKV      │         Recharts + Lucide          │
└───────────────┬───────────┴────────────────┬────────────────────┘
                │                            │
                ▼                            ▼
┌───────────────────────────────────────────────────────────────┐
│                    @sprinta/api-client                         │
│         (Paylaşımlı Supabase servis katmanı)                   │
│  authService · contentService · examService · mentorService   │
│  badgeService · libraryService · adminService · aiCoachService │
└───────────────────────────────┬───────────────────────────────┘
                                │
                ┌───────────────┼──────────────────┐
                ▼               ▼                  ▼
┌───────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  SUPABASE CLOUD   │  │  EDGE FUNCTIONS  │  │ ANTHROPIC CLOUD  │
│                   │  │   (Deno + TS)    │  │                  │
│  PostgreSQL 15    │  │                  │  │  Claude Haiku    │
│  Row Level Sec    │  │  ai-coach        │  │  Claude Sonnet   │
│  Supabase Auth    │  │  gen-metadata    │  │                  │
│  Storage 50MiB   │  │  gen-questions   │  └──────────────────┘
│  Realtime (ws)   │  │  gen-mentor-fb   │
│                   │  │  ai-weekly-rpt   │
└───────────────────┘  │  extract-text   │
                        │  cron-risk-det  │
                        │  cron-daily-st  │
                        └──────────────────┘
```

## 3.2 Mobil Uygulama Mimarisi

```
app/                          ← Expo Router (file-based navigation)
├── (tabs)/                   ← Bottom tab navigator (4 sekme)
│   ├── index.tsx             ← GameHomeScreen (v3 Sport Theme)
│   ├── calis.tsx             ← ReadingHubScreen
│   ├── progress.tsx          ← İlerleme ekranı
│   └── menu.tsx              ← Ayarlar / profil
├── (auth)/                   ← Auth grubu (login, register)
├── (onboarding)/             ← Onboarding akışı
├── exercise/[moduleCode]/    ← Dinamik egzersiz rotaları
└── eye-training/             ← Kartal Gözü hub

src/
├── components/               ← Yeniden kullanılabilir bileşenler
├── features/                 ← Özellik bazlı organizasyon
│   ├── home/                 ← GameHomeScreen + sub-cards
│   ├── navigation/           ← RadialFab
│   └── visual-mechanics/     ← 17 egzersiz + hub
├── screens/                  ← Sayfa-düzey ekranlar
│   └── reading/              ← 12 okuma modu ekranı
├── stores/                   ← Zustand store'ları (17 adet)
├── hooks/                    ← Özel React hook'ları
├── services/                 ← Yerel servisler (haptic, sound, notif)
├── lib/supabase.ts           ← Singleton Supabase istemci
├── theme/                    ← Çift tema sistemi (light/dark)
├── types/                    ← Uygulama özel tip tanımları
└── data/                     ← Statik veri (examContentStructure)
```

## 3.3 Veri Akışı

### Tipik Egzersiz Seansı Akışı

```
Kullanıcı modüle basar
        │
        ▼
ModuleSetupScreen (faz: setup)
        │ "Metin Seç" veya "Hızlı Başlat"
        ▼
ContentLibraryScreen / ContentImportModal (faz: picking)
        │ içerik seçildi → ImportedContent nesnesi oluşturuldu
        ▼
Egzersiz Ekranı (faz: exercising)
        │ seans tamamlandı → SessionMetrics hesaplandı
        ▼
Soru Aşaması / QuestionModal (faz: questioning)
        │ sorular yanıtlandı → comprehensionScore
        ▼
Sonuç Ekranı (faz: results)
        │
        ├─→ ARP hesapla (arpCalculator.ts)
        ├─→ XP hesapla → Supabase sessions INSERT
        ├─→ daily_stats UPSERT
        ├─→ Badge kontrol → student_badges UPSERT
        └─→ cognitive_profile UPDATE
```

### Durum Yönetimi Akışı

```
Supabase Auth ──→ authStore (Zustand + MMKV persist)
                        │
                        ▼
                 student: Student | null
                 isAuthenticated: boolean (MMKV'de saklanır)

Egzersiz sonu ──→ gamificationStore (MMKV persist)
                        │
                        ├─→ earnedBadges[]
                        ├─→ pendingBadges[] (sadece RAM)
                        └─→ pendingLevelUp (sadece RAM)
```

---

# 4. Özellikler ve Modüller

## 4.1 Okuma Modülleri (29 modül)

### SpeedControl Grubu

| Modül | Açıklama | Dosya | Durum |
|-------|----------|-------|-------|
| **Chunk RSVP** | Kelime grupları halinde merkezi flaş okuma; ORP vurgulama, Bionic Reading, akıllı yavaşlama | `src/components/exercises/SpeedControl/ChunkRSVPExercise.tsx` | ✅ Tam |
| **Seri Vurgu Okuma** (FlowReading) | Satır bazlı kayan metin, vurgulu cursor, KELIME/HIZ/YAZI BOYUTU kontrol paneli | `src/components/exercises/SpeedControl/FlowReadingExercise.tsx` | ✅ Tam |

### ReadingModes Grubu (ReadingModesExercise.tsx — tek bileşen, 13+ mod)

| Mod Anahtarı | Etiket | Açıklama | Durum |
|--------------|--------|----------|-------|
| `timed` | Zamanlı Okuma | Sayaç geri sayımı, süre baskısı, urgency animasyonu | ✅ Tam |
| `academic` | Akademik Mod | 8 kelime/satır, derin anlama odaklı | ✅ Tam |
| `keyword` | Anahtar Kelime | Kritik kelimeleri tarama tekniği | ✅ Tam |
| `memory` | Hafıza Sabitleme | Oku→Gizle→Hatırla döngüsü, spaced rep temeli | ✅ Tam |
| `prediction` | Tahmin Okuma | Cümle sonu tamamlama, anlamsal bağlantı | ✅ Tam |
| `focus_filter` | Dikkat Filtresi | Tek paragraf odağı, çevresel dikkat filtresi | ✅ Tam |
| `subvocal` | Sessiz Okuma | Görsel ritimle iç sesi bastırma (subvokalizasyon) | ✅ Tam |
| `bionic` | Biyonik Okuma | Kelimenin ilk yarısı kalın, hız artırma | ✅ Tam |
| `auto_scroll` | Oto Kaydırma | WPM hızında otomatik scroll | ✅ Tam |
| `svr` | Seri Vurgu Okuma | Sıralı vurgu, tüm metni görerek okuma | ✅ Tam |
| `speed_ladder` | Hız Merdiveni | Artan hızlı RSVP antrenmanı | ✅ Tam |
| `word_burst` | Çok Kelime | 2-4 kelime RSVP | ✅ Tam |
| `sentence_step` | Cümle Adım | Cümle cümle anlama odaklı | ✅ Tam |

### Özel Okuma Ekranları

| Modül | Açıklama | Dosya | Durum |
|-------|----------|-------|-------|
| VanishingReading | Kelimeler sönüyor, hafıza güçlendirme | `src/screens/reading/VanishingReadingScreen.tsx` | ✅ Tam |
| FadingWord | Kelime solma animasyonu | `src/screens/reading/FadingWordScreen.tsx` | ✅ Tam |
| ClozeTest | Boşluk doldurma testi | `src/screens/reading/ClozeTestScreen.tsx` | ✅ Tam |
| DualColumn | İki sütun paralel okuma | `src/screens/reading/DualColumnScreen.tsx` | ✅ Tam |
| SoruTreni | Okurken soru zinciri | `src/screens/reading/SoruTreniScreen.tsx` | ✅ Tam |
| HataliCumle | Hatalı cümleleri bulma | `src/screens/reading/HataliCumleScreen.tsx` | ✅ Tam |
| FlashcardBank | Kelime kartları | `src/screens/reading/FlashcardBankScreen.tsx` | ✅ Tam |
| KelimeBaglami | Bağlamdan kelime anlama | `src/screens/reading/KelimeBaglamiScreen.tsx` | ✅ Tam |
| GraphReading | Grafik ve tablo okuma | `src/screens/reading/GraphReadingScreen.tsx` | ✅ Tam |
| PoetryAnalysis | Şiir analizi | `src/screens/reading/PoetryAnalysisScreen.tsx` | ✅ Tam |
| Vocabulary | MCQ flashcard, 10 kelime/seans, XP | `src/components/exercises/VocabularyExercise.tsx` | ✅ Tam |

## 4.2 Kartal Gözü — Göz Egzersizleri (23 egzersiz)

| Egzersiz | Kategori | Dosya | Durum |
|----------|----------|-------|-------|
| SchulteTablo | saccadic | EyeTraining/SchulteTablo.tsx | ✅ |
| SatirPanorama | tracking | EyeTraining/SatirPanorama.tsx | ✅ |
| FlashAtlamaMatrisi | saccadic | EyeTraining/FlashAtlamaMatrisi.tsx | ✅ |
| PeriferiFlashAvcisi | peripheral | EyeTraining/PeriferiFlashAvcisi.tsx | ✅ |
| HizNoktaFirtinasi | saccadic | EyeTraining/HizNoktaFirtinasi.tsx | ✅ |
| RastgeleFlashTuzagi | tracking | EyeTraining/RastgeleFlashTuzagi.tsx | ✅ |
| SpiralTakipRitmi | tracking | EyeTraining/SpiralTakipRitmi.tsx | ✅ |
| ZigZagAtlas | saccadic | EyeTraining/ZigZagAtlas.tsx | ✅ |
| DikeyNabizTakibi | tracking | EyeTraining/DikeyNabizTakibi.tsx | ✅ |
| GenisleyenHalkaOdagi | peripheral | EyeTraining/GenisleyenHalkaOdagi.tsx | ✅ |
| KalpRitim | tracking | EyeTraining/KalpRitim.tsx | ✅ |
| MeteorYagmuru | saccadic | EyeTraining/MeteorYagmuru.tsx | ✅ |
| PinballGoz | saccadic | EyeTraining/PinballGoz.tsx | ✅ |
| RakamSprint | saccadic | EyeTraining/RakamSprint.tsx | ✅ |
| YildizAgiTarama | peripheral | EyeTraining/YildizAgiTarama.tsx | ✅ |
| KartalMeydanOkumasi | boss fight | EyeTraining/KartalMeydanOkumasi.tsx | ✅ |
| KelimeYagmuru | kelime oyunu | EyeTraining/KelimeYagmuru.tsx | ✅ |
| HarfZinciri | kelime oyunu | EyeTraining/HarfZinciri.tsx | ✅ |
| KelimeEslestirme | kelime oyunu | EyeTraining/KelimeEslestirme.tsx | ✅ |
| AnagramCozucu | kelime oyunu | EyeTraining/AnagramCozucu.tsx | ✅ |
| KelimeSniper | kelime oyunu | EyeTraining/KelimeSniper.tsx | ✅ |
| CumleYarisi | kelime oyunu | EyeTraining/CumleYarisi.tsx | ✅ |
| HeceleAtla | kelime oyunu | EyeTraining/HeceleAtla.tsx | ✅ |
| SoruKosusu | kelime oyunu | EyeTraining/SoruKosusu.tsx | ✅ |

**Boss unlock:** 8 egzersiz tamamlandığında `KartalMeydanOkumasi` açılır (`eyeTrainingStore.bossUnlocked`).

## 4.3 Görsel Mekanik Egzersizleri (17 egzersiz)

| Egzersiz | Dosya | Durum |
|----------|-------|-------|
| CircularOrbitChase | visual-mechanics/components/exercises/ | ✅ |
| DiagonalLaserDash | visual-mechanics/components/exercises/ | ✅ |
| DoubleTargetSwitch | visual-mechanics/components/exercises/ | ✅ |
| ExpandingRingsFocus | visual-mechanics/components/exercises/ | ✅ |
| FlashJumpMatrix | visual-mechanics/components/exercises/ | ✅ |
| LineScanSprint | visual-mechanics/components/exercises/ | ✅ |
| MicroPauseReact | visual-mechanics/components/exercises/ | ✅ |
| OppositePull | visual-mechanics/components/exercises/ | ✅ |
| PeripheralFlashHunter | visual-mechanics/components/exercises/ | ✅ |
| RandomBlinkTrap | visual-mechanics/components/exercises/ | ✅ |
| RenkHafiza | visual-mechanics/components/exercises/ | ✅ |
| ShrinkZoomFocus | visual-mechanics/components/exercises/ | ✅ |
| SpeedDotStorm | visual-mechanics/components/exercises/ | ✅ |
| SplitScreenMirror | visual-mechanics/components/exercises/ | ✅ |
| TunnelVisionBreaker | visual-mechanics/components/exercises/ | ✅ |
| VerticalPulseTrack | visual-mechanics/components/exercises/ | ✅ |
| YagmurHedef | visual-mechanics/components/exercises/ | ✅ |

**Not:** `ComingSoonExercise.tsx` stub bileşeni hala bazı slotlarda kullanılıyor.

## 4.4 Gamification Sistemi

| Özellik | Dosya | Durum |
|---------|-------|-------|
| XP sistemi | `packages/shared/src/constants/levels.ts` | ✅ Tam |
| Level hesaplama | Migration `007_gamification.sql` | ✅ Tam |
| Badge sistemi | `packages/api-client/src/services/badgeService.ts` | ✅ Tam |
| Streak takibi | `packages/api-client/src/services/streakService.ts` | ✅ Tam |
| LevelUp modal | `src/components/gamification/LevelUpModal.tsx` | ✅ Tam |
| Badge modal | `src/components/gamification/BadgeAwardModal.tsx` | ✅ Tam |
| Günlük görev kartı | `src/features/home/components/DailyMissionCard.tsx` | ✅ Tam |
| Haftalık momentum | `src/features/home/components/WeeklyMomentumStrip.tsx` | ✅ Tam |
| Turnuvalar | Migration `062_tournaments.sql` | ⚠️ Kısmi (backend hazır, UI eksik) |
| Yıldız sistemi | `packages/api-client/src/services/starService.ts` | ⚠️ Kısmi |

## 4.5 Sosyal Özellikler

| Özellik | Dosya | Durum |
|---------|-------|-------|
| Günlük liderboard | `src/features/home/components/DailyLeaderboard.tsx` | ✅ Tam |
| Haftalık challenge | `app/(tabs)/social.tsx` → ChallengesView | ✅ Tam |
| Challenge gönder/kabul/reddet | `packages/api-client/src/services` | ✅ Tam |
| Turnuva UI | — | ❌ Yok |

## 4.6 Tanılama Sistemi

| Özellik | Dosya | Durum |
|---------|-------|-------|
| Tanılama daveti | `app/(onboarding)/diagnostic-invite.tsx` | ✅ |
| Okuma testi | `app/diagnostic/reading.tsx` | ✅ |
| Anlama soruları | `app/diagnostic/comprehension.tsx` | ✅ |
| Sonuç ekranı | `app/diagnostic/result.tsx` | ✅ |
| Baseline ARP | `packages/shared/src/engine/arpCalculator.ts` | ✅ |
| Tanılama geçmişi | `src/stores/tanilamaHistoryStore.ts` | ✅ |

## 4.7 Sınav Zeka Sistemi

| Özellik | Dosya | Durum |
|---------|-------|-------|
| Soru oturumu takibi | Migration `024_exam_intelligence.sql` | ✅ |
| Soru tipi performans | `user_exam_profile` tablosu | ✅ |
| Sınav içgörü kartı | `src/components/reading/ExamInsightCard.tsx` | ✅ |
| examService (7 metot) | `packages/api-client/src/services/intelligence/examService.ts` | ✅ |

## 4.8 AI Mentor

| Özellik | Dosya | Durum |
|---------|-------|-------|
| Mentor geri bildirimi | `supabase/functions/generate-mentor-feedback/` | ✅ |
| Mentor kartı | `src/components/reading/MentorFeedbackCard.tsx` | ✅ |
| AI Coach (yüksek tier) | `supabase/functions/ai-coach/` | ✅ |
| Haftalık rapor | `supabase/functions/ai-weekly-report/` | ✅ |

## 4.9 İçerik Kütüphanesi

| Özellik | Durum |
|---------|-------|
| Metin kütüphanesi (55+ metin) | ✅ |
| Bölüm navigasyonu (156 bölüm) | ✅ |
| Anlama soruları (500+ soru) | ✅ |
| 5 sınav türü (LGS/TYT/AYT/YDS/KPSS) | ✅ |
| Hiyerarşik kütüphane (Sınav→Ders→Metin) | ✅ (`ContentLibraryScreen.tsx`) |
| Yer imi / not alma | ✅ |
| Okuma ilerleme takibi | ✅ |

## 4.10 Admin Panel (Web — Next.js)

| Sayfa | Yol | Durum |
|-------|-----|-------|
| Metin yönetimi | `/admin/texts` | ✅ |
| Bölüm yönetimi | `/admin/texts/[id]/chapters` | ✅ |
| Öğrenci listesi | `/admin/students` | ✅ |
| Soru yönetimi | `/admin/questions` | ✅ |
| Analytics | `/admin/analytics` | ✅ (SVG pie chart) |
| Badge yönetimi | `/admin/badges` | ✅ |
| Oturum analitik | `/admin/sessions` | ✅ |
| AI metadata üretimi | Edge Function `generate-metadata` | ✅ |
| Multi-tenant panel | `/(panel)/` | ⚠️ Kısmi |

## 4.11 Abonelik / Premium

| Özellik | Dosya | Durum |
|---------|-------|-------|
| RevenueCat entegrasyonu | `packages/api-client/src/services/purchases.ts` | ✅ |
| Premium gating hook | `src/hooks/usePremiumGate.ts` | ✅ |
| Paywall modal | `app/(modals)/paywall.tsx` | ✅ |
| Premium içerik kısıtlaması | — | ⚠️ Kısmi (hook var, tüm modüllere uygulanmamış) |

---

# 5. Temel Modüller Derin İnceleme

## 5.1 Kimlik Doğrulama Sistemi

### Akış

```
1. app/_layout.tsx başlangıç kontrolü
       │
       ▼
2. authStore.isAuthenticated (MMKV'den yüklenir)
       │
       ├── true  → Uygulama ana sayfasına yönlendir
       └── false → /(auth)/login sayfasına yönlendir
                        │
                        ▼
             3. Login formu → authService.login()
                        │
                        ▼
             4. Supabase Auth → JWT token alınır
                        │
                        ▼
             5. authStore.refreshProfile()
                Supabase'den students tablosunu sorgula
                (RLS: sadece kendi satırını görebilir)
                        │
                        ▼
             6. student state set edilir
                isAuthenticated = true → MMKV'ye yazılır
```

### Güvenlik Tasarımı

- **MMKV'de saklanan:** Sadece `isAuthenticated: boolean` — hassas veriler saklanmaz
- **Session yenileme:** Uygulama açıldığında Supabase'den fresh profil çekilir
- **JWT:** 1 saat geçerlilik, refresh token rotation aktif
- **Kayıt:** `register()` → Supabase Auth kullanıcı oluşturur → DB trigger otomatik `students` satırı yaratır

### Güvenlik Açığı

`refreshProfile()` içinde:
```typescript
.from('students').select(…).single()
```
Burada `.eq('id', userId)` filtresi yazılmamıştır — RLS'e güvenilmektedir. RLS `get_student_id()` fonksiyonu `auth.uid()` eşleşmesini zorunlu kılsa da, RLS bypass edilirse tüm öğrenci verileri açılır. Açık filtre eklemek daha savunmacı bir yaklaşımdır.

## 5.2 Onboarding Akışı

```
/(onboarding)/welcome.tsx
       │
       ▼
/(onboarding)/consent.tsx     ← KVKK onayı
       │
       ▼
/(onboarding)/daily-goal.tsx  ← Günlük hedef belirleme
       │
       ▼
/(onboarding)/diagnostic-invite.tsx
       │
       ├── "Şimdi Yap" → /diagnostic/intro → reading → comprehension → result
       └── "Sonra"     → Ana sayfa (has_completed_diagnostic = false)
```

Onboarding tamamlandığında `students.has_completed_diagnostic` = true ayarlanır. Bu alan `authStore.student.hasCompletedDiagnostic` üzerinden erişilebilir.

## 5.3 Okuma Motoru (ARP Sistemi)

Sprinta'nın kalbi olan **ARP (Advanced Reading Performance)** metriği üç bileşenden oluşur:

### REI — Okuma Verimliliği İndeksi
```
REI = WPM × (anlama_puanı / 100)
```
Hız ile anlamayı dengeler. 300 WPM ama %50 anlama = REI 150.

### CSF — Bilişsel Stabilite Faktörü
```
CSF = 1 − (hata_oranı + geri_dönüş_oranı + yorgunluk_indeksi) / 3
```
Okuma kalitesini ölçer. 0.0 (kötü) ile 1.0 (mükemmel) arası.

### ARP — Final Skor
```
ARP = REI × CSF
```

### Sınav Hedefleri (EXAM_ARP_TARGETS)
| Sınav | Min ARP | Hedef ARP | Elite ARP |
|-------|---------|-----------|-----------|
| LGS | 120 | 180 | 250 |
| TYT | 150 | 220 | 300 |
| AYT | 200 | 280 | 380 |
| YDS | 180 | 260 | 360 |
| KPSS | 160 | 230 | 320 |

### Hesaplama Dosyaları
- `packages/shared/src/engine/arpCalculator.ts` — REI, CSF, ARP hesapları
- `packages/shared/src/engine/fatigueDetector.ts` — Yorgunluk tespiti
- `packages/shared/src/engine/difficultyAdapter.ts` — Uyarlamalı güçlük
- `packages/shared/src/engine/stabilityAnalyzer.ts` — Performans stabilite
- `packages/shared/src/engine/modeRecommender.ts` — Mod önerisi
- `packages/shared/src/engine/performanceEngine.ts` — Ana motor
- `apps/mobile/src/components/exercises/ReadingModes/ReadingModesEngine.ts` — Uygulama içi WPM/XP

## 5.4 Analitik Sistemi

### Veri Toplama Katmanları

| Katman | Tablo | Sıklık |
|--------|-------|--------|
| Anlık session | `sessions` | Her egzersiz sonunda |
| Okuma modu | `reading_mode_sessions` | Her okuma seansında |
| Göz antrenmanı | `eye_training_sessions` | Her Kartal Gözü egzersizinde |
| Görsel mekanik | `vm_sessions` | Her VM seansında |
| Soru takibi | `user_question_sessions` | Her soru yanıtında |
| Günlük özet | `daily_stats` | Trigger otomatik günceller |
| Streak | `daily_stats.streak_days` | reading_mode_sessions trigger |
| Risk skoru | `student_risk_scores` | Gece cron (cron-risk-detection) |

### Günlük İstatistik Trigger Akışı
```
reading_mode_sessions INSERT
        │ (032_reading_streak_trigger.sql)
        ▼
daily_stats UPSERT (student_id, tarih)
        │
        ├── total_xp += xp_earned
        ├── streak_days hesapla (ardışık gün sayısı)
        └── last_activity_at = NOW()
```

## 5.5 Admin Dashboard (Web)

### Erişim Kontrolü
```typescript
// apps/web/lib/adminGuard.ts
async function requireAdmin() {
  const session = await getServerSession()
  if (!session) redirect('/login')

  const role = await supabase.from('students')
    .select('role').eq('id', session.user.id).single()

  if (!['admin', 'super_admin'].includes(role.data?.role)) {
    redirect('/')
  }
}
```
Server-side guard + `useAdminGuard.ts` client-side hook.

### Özellikler
- Metin CRUD (oluştur/düzenle/sil/yayımla)
- Bölüm yönetimi
- AI metadata üretimi (Claude Haiku Edge Function)
- Öğrenci risk takibi
- Seans analitikleri (SVG/Recharts grafikler)
- Multi-tenant yönetimi

## 5.6 AI Entegrasyonu

### Kullanılan Modeller

| Edge Function | Model | Amaç |
|---------------|-------|-------|
| `ai-coach` | claude-sonnet-4-6 | Kişisel koçluk, analiz, içerik üretimi |
| `generate-mentor-feedback` | claude-haiku-4-5-20251001 | Öğrenci performans geri bildirimi |
| `generate-metadata` | claude-haiku-4-5-20251001 | İçerik metadata üretimi |
| `generate-questions` | claude-haiku-4-5-20251001 | Anlama sorusu üretimi |
| `ai-weekly-report` | claude-haiku-4-5-20251001 | Haftalık performans raporu |

### AI Coach Modları
- `morning_briefing` — Günlük rehberlik + ARP trendleri
- `analyze_weakness` — Güçlü/zayıf analizi + 3 adım iyileştirme
- `generate_content` — 100-150 kelime okuma pasajı üretimi
- `chat` — Genel sohbet (geçmiş destekli)

---

# 6. Veritabanı ve Supabase Analizi

## 6.1 Tüm Tablolar

### Kimlik / Profil
| Tablo | Açıklama | Satır Sayısı (tahmin) |
|-------|----------|-----------------------|
| `students` | Öğrenci profili, XP, ARP, streak, rol | 10-100 |
| `cognitive_profiles` | Bilişsel performans profili (WPM, anlama, dikkat) | students ile 1:1 |
| `super_admins` | Süper yönetici listesi | 1-5 |

### Multi-Tenant
| Tablo | Açıklama |
|-------|----------|
| `tenants` | Kurum kaydı (dershane, okul, bireysel) |
| `tenant_admins` | Kurum yöneticileri |
| `tenant_settings` | Kurum yapılandırması |
| `tenant_daily_stats` | Kurum günlük istatistikleri |
| `subscriptions` | Abonelik bilgileri |

### İçerik
| Tablo | Açıklama | Veri |
|-------|----------|------|
| `text_library` | Okuma metinleri | 55+ metin, 5 sınav türü |
| `text_chapters` | Metin bölümleri | 156+ bölüm |
| `text_questions` | Anlama soruları | 500+ soru (5 tip: main_idea, inference, detail, vocabulary, tone) |
| `vocabulary_words` | Kelime listesi (MCQ) | 40 kelime (LGS/TYT/AYT) |
| `content_library` | Genel içerik kütüphanesi | — |
| `exercises` | Egzersiz tanımları | — |
| `badges` | Rozet tanımları | — |

### Aktivite / Seans
| Tablo | Açıklama |
|-------|----------|
| `sessions` | Genel egzersiz seansları |
| `reading_mode_sessions` | 8 okuma modu seansları (mode, wpm, arp_score, xp_earned) |
| `eye_training_sessions` | Kartal Gözü seansları (reaction_time_ms, accuracy_percent, visual_attention_score) |
| `vm_sessions` | Görsel mekanik seansları |
| `user_question_sessions` | Soru-cevap takibi |
| `diagnostics` | Tanılama test sonuçları |
| `reading_progress` | Bölüm bazlı okuma ilerlemesi |
| `text_bookmarks` | Yer imi, not, highlight |
| `fatigue_logs` | Yorgunluk kayıtları |

### Analitik / Gamification
| Tablo | Açıklama |
|-------|----------|
| `daily_stats` | Günlük öğrenci istatistikleri (xp, streak, dakika) |
| `user_exam_profile` | Soru tipi başarı oranları (5 tip) |
| `student_risk_scores` | Gece risk skorları (critical/high/medium/low) |
| `student_badges` | Öğrenci rozet durumu |
| `ai_mentor_feedback` | Claude Haiku mentor geri bildirimleri |

### Sosyal
| Tablo | Açıklama |
|-------|----------|
| `challenges` | 7 günlük öğrenci yarışmaları (weekly_xp/arp_gain/streak) |
| `tournaments` | Haftalık turnuvalar (LGS/TYT, 10 soru, 500/300/150 XP) |
| `tournament_entries` | Turnuva katılımları |

### Sınav
| Tablo | Açıklama |
|-------|----------|
| `exam_programs` | Kılavuzlu çalışma programları |

## 6.2 İlişkiler (Kritik FK'lar)

```
auth.users (Supabase Auth)
    │ (trigger: 004_functions_triggers.sql)
    ├──→ students (1:1)
    │        │
    │        ├──→ cognitive_profiles (1:1)
    │        ├──→ daily_stats (1:N)
    │        ├──→ sessions (1:N)
    │        ├──→ reading_mode_sessions (1:N)
    │        ├──→ eye_training_sessions (1:N)
    │        ├──→ user_question_sessions (1:N)
    │        ├──→ user_exam_profile (1:1)
    │        ├──→ ai_mentor_feedback (1:N)
    │        ├──→ student_badges (1:N)
    │        ├──→ student_risk_scores (1:1)
    │        └──→ challenges (challenger_id / opponent_id)
    │
text_library (1:N)
    │
    ├──→ text_chapters (1:N)
    ├──→ text_questions (1:N) — FK hardening: migration 069
    └──→ reading_progress (1:N per student)
```

## 6.3 RLS Politikaları — Tam Matris

### students tablosu
| Politika | Kural | Açıklama |
|----------|-------|----------|
| `student_select_own` | `id = auth.uid()` | Öğrenci kendi satırını görür |
| `student_update_own` | `id = auth.uid()` | Öğrenci kendi profilini günceller |
| `tenant_admin_select_students` | tenant_id eşleşmesi | Kurum admini kendi öğrencilerini görür |
| `super_admin_all_students` | `is_super_admin()` | Süper admin hepsini görür |

### Tablo RLS Durumu

| Tablo | RLS | Not |
|-------|-----|-----|
| students | ✅ | 4 politika |
| cognitive_profiles | ✅ | 3 politika |
| sessions | ✅ | 5 politika |
| daily_stats | ✅ | 3 politika |
| text_library | ✅ | Authenticated okur, admin/editor yazar |
| text_questions | ✅ | Authenticated okur, admin/editor yazar |
| reading_mode_sessions | ✅ | student_id eşleşmesi |
| eye_training_sessions | ✅ | student_id eşleşmesi |
| vocabulary_words | ✅ | **068 ile düzeltildi:** sadece authenticated |
| challenges | ✅ | Katılımcılar yönetir |
| tournaments | ✅ | Turnuvalar herkese açık, entries: kendi |
| user_question_sessions | ✅ | user_id eşleşmesi |
| user_exam_profile | ✅ | ALL: user_id eşleşmesi |
| ai_mentor_feedback | ✅ | ALL: user_id eşleşmesi |
| student_risk_scores | ✅ | 3 politika |
| student_badges | ✅ | 2 politika |
| subscriptions | ✅ | 2 politika |
| tenants | ✅ | 2 politika |
| tenant_settings | ✅ | Tenant admins + super |
| content_library | ✅ | Published: herkese, super admin yazar |
| exercises | ✅ | Herkese readable, super admin yazar |
| badges (def) | ✅ | Herkese readable, super admin yazar |
| fatigue_logs | ✅ | 2 politika |
| super_admins | ✅ | self + super_admin all |
| text_bookmarks | ✅ | student_id eşleşmesi |

## 6.4 Veritabanı Güçlendirilmesi (Migration 069)

Migration `069_db_hardening.sql` ile eklenen:
- `user_question_sessions → text_questions` FK (ON DELETE SET NULL)
- `text_library.body` üzerinde Türkçe FULLTEXT index
- `text_library(exam_type, difficulty)` bileşik index

## 6.5 Zayıf Noktalar

| Sorun | Kritiklik | Açıklama |
|-------|-----------|----------|
| Email onayı devre dışı | 🔴 Yüksek | `config.toml`: `enable_confirmations = false` — sahte email kaydı mümkün |
| `refreshProfile()` implicit filter | 🟡 Orta | `.single()` RLS'e güveniyor, açık `.eq('id', userId)` yok |
| content_library SELECT | 🟡 Orta | `SELECT TRUE` — tüm yayımlanmış içerik herkese açık, auth kontrolü yok |
| Rate limiting yok | 🟡 Orta | Supabase varsayılan limitleri dışında kısıtlama uygulanmamış |
| Sınav içerik boşlukları | 🟠 Önemli | AYT/LGS bazı ders kategorilerinde içerik eksik |
| `vm_sessions` RLS | 🟡 Orta | Migration 044'te oluşturuldu; RLS politikası incelenmeli |

---

# 6.5 Edge Functions Denetimi

## Genel Güvenlik Durumu

| Fonksiyon | JWT Doğrulama | Sahiplik Kontrolü | Input Doğrulama | Rate Limit | Hata Yönetimi |
|-----------|---------------|-------------------|-----------------|------------|---------------|
| `ai-coach` | ✅ | ✅ studentId kontrolü | ✅ | ❌ | ✅ 401/403/404/500 |
| `generate-metadata` | ✅ | ✅ admin/editor role | ✅ | ❌ | ✅ 400/401/403/502 |
| `generate-mentor-feedback` | ✅ | ✅ student ownership | ✅ | ❌ | ✅ 400/422/500 |
| `generate-questions` | ✅ | ❌ (herhangi auth kullanıcı) | ✅ min 100 char | ❌ | ✅ 400/502/422 |
| `extract-text` | ✅ | ❌ (herhangi auth kullanıcı) | ✅ boyut limiti | ❌ | ✅ 400/401/422 |
| `ai-weekly-report` | ✅ | ✅ studentId kontrolü | ✅ | ❌ | ✅ 401/403/500 |
| `cron-risk-detection` | ❌ (service role) | N/A (batch) | N/A | N/A | ⚠️ implicit |
| `ai-weekly-report` | ✅ | ✅ | ✅ | ❌ | ✅ |

## Fonksiyon Detayları

### `ai-coach/index.ts`
```
Model: claude-sonnet-4-6 (en yüksek kalite)
Timeout: 45 saniye (Supabase 60s limit altında)
Modlar: morning_briefing, analyze_weakness, generate_content, chat
Context: student + cognitive_profile + daily_stats (7 gün) + active_program
Özel: İstek başına tam öğrenci bağlamı oluşturuluyor — token maliyeti yüksek
Risk: Rate limiting yok → kötüye kullanım durumunda yüksek Anthropic maliyeti
```

### `generate-metadata/index.ts`
```
Model: claude-haiku-4-5-20251001
Auth: JWT + students.role IN ('admin', 'editor')
Output: { summary, difficulty (1-5), keywords (max 8), examTags (max 5) }
Güçlü: Role kontrolü ekstra koruma katmanı sağlıyor
```

### `generate-mentor-feedback/index.ts`
```
Model: claude-haiku-4-5-20251001
Auth: JWT + student ownership verification
Veri: user_exam_profile + user_difficulty_profile + sessions (son 10)
Çıktı: feedback_text, key_insight, action_items (3), improvement_focus, risk_level
Service Role: ai_mentor_feedback INSERT için SUPABASE_SERVICE_ROLE_KEY kullanılıyor
Not: Yetersiz veri durumunda 422 insufficient_data döndürüyor
```

### `cron-risk-detection/index.ts`
```
Auth: SUPABASE_SERVICE_ROLE_KEY (cron, kullanıcı token'ı yok)
Schedule: Gece ~02:00 (Supabase cron)
İşlem: Tüm B2B öğrencileri batch olarak risk skorlama
Risk Faktörleri: arp_drop, streak_broken, inactivity_7days, not_diagnosed
Seviyeler: critical (4) → high (3) → medium (2) → low (0-1)
Zayıf: try-catch yok, Deno implicit error logging'e güveniyor
```

### `extract-text/index.ts`
```
Auth: JWT zorunlu
Modlar: URL fetch (HTML→text, 5MB, 10s timeout) | Base64 file (text/PDF, 10MB)
PDF Parsing: Temel regex (BT...ET) — pdfjs gibi sağlam bir kütüphane kullanılmıyor
Risk: PDF parsing güvenilirliği düşük
```

## Soğuk Başlangıç Riski

Tüm Edge Functions Deno runtime kullanıyor. Supabase Edge Functions cold start süresi genellikle 100-500ms'dir. `ai-coach` gibi büyük context yükleyen fonksiyonlarda bu süre daha uzun olabilir. Kritik kullanıcı akışlarında (sabah özeti, anlık koçluk) gecikme hissedilebilir.

## Gizli Bilgi Yönetimi

Tüm API anahtarları `Deno.env.get()` ile alınmaktadır:
- `ANTHROPIC_API_KEY` ✅
- `SUPABASE_URL` ✅
- `SUPABASE_ANON_KEY` ✅
- `SUPABASE_SERVICE_ROLE_KEY` ✅
- `ALLOWED_ORIGIN` (varsayılan: `*`) ⚠️

**Sonuç: Kaynak kodda hardcoded sır bulunamadı.**

---

# 7. Altyapı ve DevOps

## 7.1 Docker

**Docker kullanımı:** Projenin kaynak kodunda `Dockerfile` veya `docker-compose.yml` bulunamadı.

- Yerel geliştirme için Supabase CLI kullanılıyor (PostgreSQL container'ı Supabase tarafından yönetiliyor — `supabase start` komutuyla Docker'ı otomatik başlatır)
- Mobil uygulama için Docker gerekmez (Expo yerel geliştirme)
- Web uygulaması için Docker yapılandırması mevcut değil

**Risk:** Üretim ortamında containerization tanımı yoksa deploy süreci manuel / Vercel/platform bağımlı.

## 7.2 Deployment

### Mobil (iOS/Android)
```
Geliştirme: expo run:ios --device "iPhone 16 Pro"
Build: EAS Build (eas.json mevcut, profiller tanımlanmış)
Dağıtım: App Store / Google Play (EAS Submit)
```
EAS config mevcuttur ancak CI/CD pipeline'a bağlanıp bağlanmadığı bilinmiyor.

### Web (Admin Panel)
- `next.config.ts` mevcut
- **Vercel deployment yapılandırması** (`vercel.json`) bulunamadı
- `apps/web/.env.local` mevcut (gitignore'da olmalı)
- Üretim URL'si yapılandırılmamış

### Supabase
```
Yerel: supabase start (Docker, port 54321/54322/54323)
Üretim: Supabase Cloud proje (config.toml'da sadece localhost ayarları var)
Migration: supabase db push (manuel)
```
`config.toml`'daki `site_url = "http://127.0.0.1:3000"` üretim için değiştirilmemiş.

## 7.3 CI/CD

**Mevcut:** `.github/` dizini veya CI yapılandırma dosyası bulunamadı.

**Eksik:**
- GitHub Actions / GitLab CI pipeline
- Otomatik test koşumu
- Otomatik TypeScript kontrolü (PR'da)
- EAS Build tetikleme
- Supabase migration otomatik uygulama

## 7.4 Ortam Yönetimi

| Ortam | Durum |
|-------|-------|
| Yerel geliştirme | ✅ `.env` + Supabase CLI |
| Staging | ❌ Tanımlanmamış |
| Production | ⚠️ Kısmi (Supabase Cloud bağlantısı muhtemelen var, config eksik) |

## 7.5 Monorepo Yapılandırması

```
pnpm-workspace.yaml: apps/*, packages/*
turbo.json: build, dev, typecheck, lint görevleri
.npmrc: shamefully-hoist=true (CocoaPods uyumu zorunlu)
```

Turborepo cache'leme aktif; bağımsız paket build'leri paralel çalıştırılıyor.

---

# 8. Güvenlik Denetimi

## 8.1 Kimlik Doğrulama Açıkları

| Risk | Ciddiyet | Açıklama | Çözüm |
|------|----------|----------|-------|
| Email onayı devre dışı | 🔴 YÜKSEK | Sahte/geçersiz email ile kayıt yapılabilir | `config.toml`: `enable_confirmations = true` + SMTP yapılandır |
| refreshProfile implicit filter | 🟡 ORTA | `.from('students').select().single()` — RLS bypass senaryosunda tüm profil açılır | `.eq('id', (await supabase.auth.getUser()).data.user?.id)` ekle |
| JWT expiry 1 saat | 🟢 DÜŞÜK | Makul süre; refresh token rotation aktif | Kabul edilebilir |
| MMKV'de student data yok | ✅ İYİ | Sadece `isAuthenticated` boolean persist ediliyor | Mevcut tasarım doğru |

## 8.2 API Güvenliği

| Risk | Ciddiyet | Açıklama |
|------|----------|----------|
| Edge Functions rate limiting yok | 🔴 YÜKSEK | `ai-coach` Sonnet modeli ile → sınırsız AI çağrısı = yüksek fatura riski |
| `generate-questions` ownership kontrolü yok | 🟡 ORTA | Her authenticated kullanıcı herhangi bir metin için soru üretebilir |
| CORS `ALLOWED_ORIGIN = '*'` | 🟡 ORTA | Dev default; prod'da origin kısıtlanmalı |
| Supabase `max_rows = 1000` | 🟢 DÜŞÜK | API yanıt boyutu sınırlı, DDoS hafifletilmiş |

## 8.3 Supabase RLS Doğruluğu

**Genel değerlendirme: İYİ** — 20+ tablo RLS politikaları ile korunuyor.

| Risk | Ciddiyet | Açıklama |
|------|----------|----------|
| `content_library` SELECT TRUE | 🟡 ORTA | Tüm yayımlanmış içerik auth olmadan erişilebilir (tasarım gereği olabilir) |
| `tournaments` public read | 🟢 DÜŞÜK | Tasarım gereği, turnuvalar herkese görünür |
| vocabulary_words eski anon erişimi | ✅ DÜZELTİLDİ | Migration 068 ile authentication zorunlu kılındı |
| RLS helper fonksiyonları | ✅ İYİ | `get_student_id()`, `is_tenant_admin()`, `is_super_admin()` — merkezi fonksiyonlar |

## 8.4 Gizli Bilgi Yönetimi

| Alan | Durum |
|------|-------|
| Edge Function secrets | ✅ `Deno.env.get()` |
| Mobil `.env` (`EXPO_PUBLIC_*`) | ⚠️ Dikkat: `EXPO_PUBLIC_` öneki tüm değerleri bundle'a gömer (istemci tarafında görünür) |
| Web `.env.local` | ✅ `.gitignore`'da olmalı |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Sadece Edge Functions içinde kullanılıyor |

**Kritik Not:** `EXPO_PUBLIC_SUPABASE_ANON_KEY` mobil bundle'a gömülü. Bu kasıtlı bir Expo tasarımıdır — anon key client-side kullanım için tasarlanmış, RLS politikaları korumayı sağlar. Ancak hassas server-side operasyonlar için service role key kullanılmamalı.

## 8.5 Injection Riskleri

| Risk | Durum |
|------|-------|
| SQL injection | ✅ GÜVENLİ — Supabase JS SDK parametreli sorgular kullanıyor |
| XSS (web) | ✅ DÜŞÜK — Next.js JSX escape, TailwindCSS sınıf bazlı |
| AI prompt injection | 🟡 DİKKAT — Kullanıcı metni AI prompt'larına ekleniyor (`extract-text` → `generate-questions` zinciri); kötü niyetli metin prompt'u yönlendirebilir |
| File upload | ✅ Boyut limiti (10MB) + MIME type kontrolü |

## 8.6 Veri İfşa Riskleri

| Risk | Ciddiyet | Açıklama |
|------|----------|----------|
| `SELECT *` sorgular | 🟡 ORTA | Bazı sorgularda tüm sütunlar çekiliyor |
| Öğrenci email exposure | 🟢 DÜŞÜK | RLS ile korunuyor |
| Turnuva entry public read | 🟢 DÜŞÜK | Tasarım gereği leaderboard |
| Hata mesajlarında veri sızıntısı | 🟢 DÜŞÜK | Edge Functions'da generic error mesajları kullanılıyor |

---

# 9. Kullanıcı Akışı

## 9.1 Yeni Kullanıcı Akışı (B2C)

```
1. App Store / Google Play'den indir
         │
         ▼
2. Açılış ekranı → /(onboarding)/welcome
         │
         ▼
3. KVKK onayı → /(onboarding)/consent
         │
         ▼
4. Günlük hedef seç (30dk / 45dk / 60dk) → /(onboarding)/daily-goal
         │
         ▼
5. Tanılama daveti → /(onboarding)/diagnostic-invite
         │
         ├── "Şimdi Yap"
         │        ▼
         │   Okuma testi (/diagnostic/reading)
         │        ▼
         │   Anlama soruları (/diagnostic/comprehension)
         │        ▼
         │   Tanılama sonucu (/diagnostic/result)
         │        │ → baseline ARP hesaplandı, cognitive_profile oluşturuldu
         │
         └── "Sonra"
                  ▼
6. Ana Sayfa — GameHomeScreen
         │
         ├── AICoachCard → "Sabah Özeti" (Edge Function)
         ├── DailyMissionCard → Günlük hedef halkası
         ├── BrainPowerMap → Modül seç
         ├── WeeklyMomentumStrip → ARP trendi
         └── RadialFAB → Hızlı egzersiz başlat

7. Çalış Sekmesi → ReadingHubScreen
         ├── PerformancePanel → WPM trendi, günlük hedef
         ├── ModeGrid → 11 mod kartı
         │        ▼
         │   Mod'a dokun → ModuleSetupScreen (egzersiz tanıtımı)
         │        ▼
         │   "Metin Seç" → ContentLibraryScreen (Sınav→Ders→Metin)
         │   veya "Hızlı Başlat" → Direkt egzersiz
         │        ▼
         │   Egzersiz ekranı (okuma)
         │        ▼
         │   QuestionModal (5 anlama sorusu)
         │        ▼
         │   Sonuç: ARP, SpeedTier, ComprehensionTier, XP, Badge
         │
         └── LibraryPreview → Metin seç → ReadingModePickerSheet → Egzersiz

8. İlerleme Sekmesi → Günlük/haftalık/aylık grafik

9. Kartal Gözü → /eye-training → Egzersiz seç → Seans → Metrics

10. Abonelik → Paywall (usePremiumGate hook ile gated içerik)
```

## 9.2 Mevcut Kullanıcı Akışı

```
App açıldı
    │
    ▼ MMKV'den isAuthenticated kontrol et
    │
    ├── true  → refreshProfile() (Supabase'den güncel veri çek)
    │        ▼
    │   Ana Sayfa (son kaldığı yerden devam)
    │
    └── false → Login ekranı
```

## 9.3 B2B Akışı (Dershane)

```
Tenant Admin → /login (web)
    │
    ▼ requireAdmin() server guard
    │
    ▼ /(panel)/students → Öğrenci listesi + risk uyarıları
    │
    ├── Öğrenci detay → ARP trendi, modül kullanımı, risk skoru
    ├── İçerik yönetimi → /admin/texts CRUD
    └── Analytics → /admin/analytics → Recharts grafikler
```

---

# 10. Kod Kalitesi

## 10.1 Yapısal Değerlendirme

### Güçlü Yönler

| Alan | Değerlendirme |
|------|---------------|
| Monorepo organizasyonu | ✅ pnpm + Turborepo, net sorumluluk ayrımı |
| Tip güvenliği | ✅ TypeScript strict mode, paylaşımlı tip tanımları |
| State yönetimi | ✅ Zustand + MMKV, partialize ile seçici kalıcılık |
| Supabase singleton | ✅ `apps/mobile/src/lib/supabase.ts` — AsyncStorage, persistSession |
| Tema sistemi | ✅ Çift tema (light/dark), `useAppTheme()` hook |
| Pure function engine | ✅ `arpCalculator.ts` side-effect yok, test edilebilir |
| File-based routing | ✅ Expo Router, URL tahmin edilebilir |
| Egzersiz tiplendirmesi | ✅ `ExerciseProps`, `RawMetrics`, `SessionMetrics` — tutarlı |

### Zayıf Yönler

| Alan | Sorun | Öneri |
|------|-------|-------|
| Bileşen boyutu | `ReadingModesExercise.tsx` ~1250 satır, `ChunkRSVPExercise.tsx` ~1400 satır | Custom hook'lara bölün |
| Inline stiller | JSX içinde inline style nesneleri (performans riski) | `StyleSheet.create` veya theme token'larına taşı |
| `(supabase as any)` cast | 40+ dosyada type-unsafe cast | Supabase generated types kullan |
| Mock data karışımı | `homeStore.ts` production kodu ile mock veri karışık | Factory pattern ile ayır |
| `console.error` | Production kodunda log sızıntısı | Error monitoring servisi (Sentry) |
| Test coverage | Sadece `packages/shared` unit testleri var | E2E ve bileşen testleri eksik |

## 10.2 Modülerlik

```
Yüksek modülerlik:
  ✅ packages/shared — platform-agnostic engine
  ✅ packages/api-client — servis katmanı soyutlaması
  ✅ Zustand store'larının bağımsızlığı
  ✅ Edge Functions arasında _shared/cors.ts

Düşük modülerlik:
  ⚠️ ReadingModesExercise tek bileşende 13+ mod
  ⚠️ FlowReadingExercise hem select hem reading hem result içeriyor
  ⚠️ Bazı ekranlar Supabase'i doğrudan çağırıyor (servis katmanını atlıyor)
```

## 10.3 Ölçeklenebilirlik

| Boyut | Durum |
|-------|-------|
| Yatay (multi-tenant) | ✅ Mimari hazır, tenant_id bazlı ayrım |
| İçerik ölçeklenmesi | ✅ Supabase, büyük içerik miktarını destekler |
| Kullanıcı ölçeklenmesi | ⚠️ Connection pooling yapılandırılmamış görünüyor |
| Edge Function ölçeklenmesi | ⚠️ Rate limiting yok → ani trafik artışında AI maliyet riski |

## 10.4 Teknik Borç

| Borç | Öncelik |
|------|---------|
| `(supabase as any)` cast → 40+ lokasyon | Yüksek |
| Email onayı devre dışı | Kritik (prod öncesi) |
| CI/CD pipeline yokluğu | Yüksek |
| Büyük bileşenler (1000+ satır) | Orta |
| Test coverage eksikliği | Yüksek |
| Production Supabase config | Kritik |
| Mock veri temizleme | Orta |
| `console.log` temizleme | Düşük |

---

# 11. Performans

## 11.1 Mobil Performans

### Güçlü Yönler
- **New Architecture (JSI):** Bridge yerine doğrudan JS-Native iletişim → animasyonlar akıcı
- **Hermes:** Bytecode compilation → hızlı başlangıç
- **MMKV:** AsyncStorage'dan 10x hızlı → auth ve ayar yüklemeleri anında
- **Reanimated 4:** UI thread animasyonları → okuma modülü geçişleri akıcı
- **useMemo + useCallback:** Bileşen stili hesaplamaları memoize ediliyor

### Olası Darboğazlar

| Risk | Açıklama | Çözüm |
|------|----------|-------|
| Büyük migration SQL'ler | 012.sql (69MB), 038.sql (187MB) — seed veri boyutu | Lazy loading / pagination |
| `SELECT *` sorgular | Gereksiz sütunlar network'e taşınıyor | Explicit column seçimi |
| `supabase.auth.getUser()` her render | Bazı bileşenlerde session kontrolü tekrar ediyor | Auth store'dan oku, cache'le |
| Chunk RSVP timer hassasiyeti | `setTimeout` birikimi uzun seanslarda sapabilir | `performance.now()` bazlı scheduler |
| AI Coach context boyutu | Her istekte tam öğrenci bağlamı → token maliyeti + gecikme | Önceki yanıtları önbelleğe al |

## 11.2 Veritabanı Performansı

### Mevcut Index'ler (Migration 005 + 069)
```sql
-- students
idx_students_tenant_id
idx_students_exam_target
idx_students_current_arp

-- sessions
idx_sessions_student_id
idx_sessions_created_at
idx_sessions_module_code

-- text_library (Migration 069 hardening)
idx_text_library_fulltext (GIN tsvector - Türkçe)
idx_text_library_exam_difficulty (exam_type, difficulty)

-- daily_stats
idx_daily_stats_student_date (student_id, date)
```

### Eksik Index'ler
```sql
-- Önerilir:
CREATE INDEX ON reading_mode_sessions (student_id, created_at DESC);
CREATE INDEX ON user_question_sessions (student_id, question_type);
CREATE INDEX ON challenges (challenger_id, status);
CREATE INDEX ON eye_training_sessions (student_id, exercise_id);
```

## 11.3 API Gecikme Riskleri

| Senaryo | Tahmin | Risk |
|---------|--------|------|
| Supabase anon sorgu | 50-150ms | Düşük |
| Edge Function (Haiku) | 800-2000ms | Orta |
| Edge Function (Sonnet) | 1500-4000ms | Yüksek (cold start + model) |
| Büyük metin fetch (body) | 100-300ms | Düşük |
| AI Coach (morning briefing) | 2-5 saniye | Yüksek — kullanıcı bekleme |

---

# 12. Eksik Parçalar

## 12.1 Üretim Lansmanını Engelleyen Kritikler

| Eksik | Açıklama | Blok mu? |
|-------|----------|----------|
| Email onayı | Sahte kaydı önlemez | 🔴 Evet |
| Production Supabase config | `config.toml` localhost URL'leri | 🔴 Evet |
| CI/CD pipeline | Manuel deploy → insan hatası riski | 🔴 Evet |
| Rate limiting (Edge Functions) | Sınırsız AI çağrısı → fatura riski | 🔴 Evet |
| Üretim environment değişkenleri | `.env.production` yok | 🔴 Evet |
| App Store provisioning | EAS Submit konfigürasyonu gerekirebilir | 🟠 Bağlam |

## 12.2 Önemli Eksikler

| Eksik | Açıklama |
|-------|----------|
| **Mock Sınav Sistemi** | `mockExamStore.ts` var, `MockExamScreen.tsx` var ama tam akış bağlanmamış |
| **Push Bildirim Backend** | `notificationService.ts` var, `expo-notifications` kurulu ama backend trigger yok |
| **SRS (Aralıklı Tekrar)** | Spaced repetition algoritması planlandı ama implement edilmedi |
| **Offline mod** | `offlineStore.ts` + `downloadService.ts` var ama tam offline çalışma yok |
| **Turnuva UI** | `062_tournaments.sql` ile backend hazır ama mobil UI yok |
| **Süper Admin Dashboard** | Dokümanlarda var (`11-SUPER-ADMIN.md`) ama web'de implement edilmemiş |
| **Test Suite** | Sadece `packages/shared` unit testleri var; E2E, integration testleri yok |
| **Error Monitoring** | Sentry / Bugsnag gibi bir crash reporting yok |
| **Analytics (Ürün)** | Mixpanel / Amplitude gibi bir kullanıcı davranış analitik yok |

## 12.3 İçerik Eksikleri

| Sınav / Ders | Durum |
|--------------|-------|
| LGS Türkçe | ✅ Kapsamlı |
| LGS Matematik | ⚠️ Kısmi (migration 046'da ekleniyor) |
| LGS Fen | ⚠️ Kısmi |
| LGS İngilizce | ⚠️ Az |
| TYT | ✅ Kapsamlı |
| AYT | ⚠️ Kısmi (schema fix gerekiyordu — 045) |
| YDS | ⚠️ Kısmi |
| KPSS | ⚠️ Az |
| ALES | ⚠️ Az |
| Vocabulary (kelime) | ⚠️ Sadece 40 kelime (hedef: 500+) |

## 12.4 Ölçeklenmeyi Engelleyen Eksikler

| Eksik | Açıklama |
|-------|----------|
| Connection pooling | Yüksek eş zamanlı bağlantılarda Supabase varsayılan limitleri yetersiz kalabilir |
| CDN / Storage optimization | Büyük metin içerikleri için CDN önbelleğe alma yok |
| Edge Function rate limiting | Anthropic API maliyeti kontrol edilmiyor |
| Horizontal scaling plan | B2B büyümesi için tenant-level ölçekleme stratejisi belgelenmemiş |

---

# 13. Öncelikli Düzeltme Listesi

## TOP 10 — Öncelik Sıralaması (1 = En Kritik)

### 1. 🔴 Email Onayını Aktif Et
**Neden:** Sahte email kaydını önlemek; App Store incelemesi için şart.
```toml
# supabase/config.toml
[auth.email]
enable_confirmations = true
```
SMTP (Supabase SMTP veya Resend) yapılandır.

---

### 2. 🔴 Edge Functions Rate Limiting Ekle
**Neden:** `ai-coach` (Sonnet) + diğer AI fonksiyonları sınırsız çağrılabilir → günlük yüzlerce dolar Anthropic faturası.
```typescript
// Her fonksiyon için Redis (Upstash) veya DB bazlı rate limit:
// Max 10 AI çağrısı/öğrenci/saat
const rateKey = `ai_rate:${studentId}`
const count = await redis.incr(rateKey)
await redis.expire(rateKey, 3600)
if (count > 10) return Response.json({ error: 'rate_limited' }, { status: 429 })
```

---

### 3. 🔴 Production Supabase Yapılandırması
**Neden:** `config.toml` localhost URL'leri üretimde hatalara yol açar.
- `site_url` → gerçek domain
- `additional_redirect_urls` → app deep link scheme (`app.sprinta.mobile://`)
- `ALLOWED_ORIGIN` → gerçek domain

---

### 4. 🔴 CI/CD Pipeline Kur
**Neden:** Manuel deploy riski + ekip büyürken paralel çalışma imkânsız.
```yaml
# .github/workflows/ci.yml
on: [push, pull_request]
jobs:
  typecheck:
    - cd apps/mobile && tsc --noEmit
    - cd apps/web && tsc --noEmit
  test:
    - cd packages/shared && vitest run
  eas-build: (main branch'te)
    - eas build --platform ios --non-interactive
```

---

### 5. 🟠 `(supabase as any)` Cast'lerini Temizle
**Neden:** 40+ lokasyonda type-unsafe kod → runtime hataları tespit edilemiyor.
```bash
# Supabase CLI ile tip üretimi:
supabase gen types typescript --local > packages/api-client/src/types/database.types.ts
```
Ardından `supabase` istemcisini `SupabaseClient<Database>` olarak tiplendir.

---

### 6. 🟠 Error Monitoring Ekle (Sentry)
**Neden:** Production'da crash'ler sessizce geçiyor.
```typescript
// apps/mobile/app/_layout.tsx
import * as Sentry from '@sentry/react-native'
Sentry.init({ dsn: process.env.EXPO_PUBLIC_SENTRY_DSN })
```
Edge Functions için de Sentry Deno entegrasyonu.

---

### 7. 🟠 `refreshProfile()` Explicit Filter Ekle
**Neden:** RLS bypass durumunda tüm öğrenci verileri açılır.
```typescript
const { data: { user } } = await supabase.auth.getUser()
if (!user) return
const { data } = await supabase
  .from('students')
  .select('id, email, full_name, ...')
  .eq('id', user.id)  // ← açık filtre ekle
  .single()
```

---

### 8. 🟡 Push Bildirim Backend Bağla
**Neden:** `notificationService.ts` ve `expo-notifications` kurulu ama trigger yok → kullanıcı retention riski.
```sql
-- Cron veya trigger ile:
-- Her sabah 07:00'de aktif kullanıcılara "Bugün çalıştın mı?" bildirimi
-- Streak kırılmadan önce uyarı bildirimi
-- AI Coach sabah özeti push trigger
```

---

### 9. 🟡 Mock Sınav Sistemini Tamamla
**Neden:** `mockExamStore.ts` + `MockExamScreen.tsx` mevcut ama tam akış yok; rakip uygulamaların en çok kullandığı özellik.
Adımlar:
1. `text_questions` + `user_question_sessions` → mock sınav session
2. Süre sayacı (LGS 40dk, TYT 135dk)
3. Soru atlama/işaretleme
4. Sonuç analizi (doğru/yanlış/boş per konu)

---

### 10. 🟡 Vocabulary Bank Genişlet + SRS Ekle
**Neden:** Sadece 40 kelime var; kelime bilgisi sınavlarda kritik.
- Hedef: 500+ kelime (LGS 200, TYT 200, AYT 100)
- SRS algoritması: `vocabulary_words` tablosuna `next_review_at`, `interval`, `ease_factor` ekle
- Günlük kelime bildirimi

---

## Özet Tablo

| # | Öncelik | Kategori | Çaba | Etki |
|---|---------|----------|------|------|
| 1 | 🔴 Kritik | Güvenlik | Düşük | Çok Yüksek |
| 2 | 🔴 Kritik | Maliyet | Orta | Çok Yüksek |
| 3 | 🔴 Kritik | Deploy | Düşük | Çok Yüksek |
| 4 | 🔴 Kritik | DevOps | Orta | Yüksek |
| 5 | 🟠 Önemli | Kod Kalitesi | Yüksek | Yüksek |
| 6 | 🟠 Önemli | Observability | Düşük | Yüksek |
| 7 | 🟠 Önemli | Güvenlik | Düşük | Orta |
| 8 | 🟡 Orta | Özellik | Orta | Yüksek |
| 9 | 🟡 Orta | Özellik | Yüksek | Çok Yüksek |
| 10 | 🟡 Orta | İçerik | Çok Yüksek | Yüksek |

---

## Son Değerlendirme

**Genel puan: 7.2 / 10**

Sprinta, düşünülmüş bir mimari ve kapsamlı özellik seti üzerine inşa edilmiş güçlü bir MVP'dir. Supabase RLS altyapısı, ARP performans motoru ve AI entegrasyonu bakımından çoğu rakip startup'tan üstün bir teknik temele sahiptir.

**Ana riskler:** Email onayı devre dışı, rate limiting yok ve CI/CD eksikliği — bu üç sorun production launch öncesinde mutlaka çözülmelidir. Kod tabanının %60'ı production-ready kalitesinde iken geri kalan %40'ı (mock sınav, SRS, offline, push notification) tamamlanmayı beklemektedir.

**Güçlü yönler:**
- Monorepo + TypeScript strict → tip güvenli, ölçeklenebilir
- Supabase RLS → sağlam erişim kontrolü
- ARP motoru → bilimsel, test edilebilir
- 72 migration → database evolution iyi yönetilmiş
- 8 Edge Function → AI entegrasyonu sağlam

**Kritik eksikler:**
- Email onayı kapalı (güvenlik deliği)
- AI rate limiting yok (maliyet riski)
- CI/CD yok (operasyonel risk)
- Test coverage çok düşük (%5 tahmin)

---

*Bu rapor, 2026-03-21 tarihinde otomatik codebase analizi ve manuel inceleme ile oluşturulmuştur. Kaynak kod değişiklikleri bu raporu geçersiz kılabilir.*
