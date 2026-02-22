# SPRINTA — Geliştirme Durumu

Son Güncelleme: 2026-02-22 (14 KVKK & Hukuki Uyumluluk tamamlandı)

## Tamamlanan Adımlar

- [x] 01 — Monorepo kurulumu
- [x] 02 — Database migration
- [x] 03 — Auth / Onboarding
- [x] 04 — Performance Engine
- [x] 05 — Modüller
- [x] 06 — Tanılama Sistemi
- [x] 07 — Gamification
- [x] 08 — AI Coach
- [x] 09 — Ödeme Sistemi
- [x] 10 — B2B Admin Panel
- [x] 11 — Super Admin Panel
- [x] 12 — Deploy / CI-CD
- [x] 13 — İçerik Kütüphanesi
- [x] 14 — KVKK & Hukuki Uyumluluk

## Notlar

Bu dosyayı her görev sonrası güncelle.
Tamamlanan adımı `[x]` yap.

## 01 — Monorepo Kurulumu (Tamamlandı)
- pnpm workspace, turbo.json, tsconfig.base.json
- apps/mobile (Expo 54), apps/web (Next.js 16)
- packages/shared, packages/api-client
- supabase/, scripts/db-health.js

## 02 — Database Migration (Tamamlandı)
- 6 migration dosyası, 17 tablo
- RLS politikaları, 5 helper fonksiyon
- 25 index, 5 trigger
- 14 egzersiz + 11 rozet seed verisi
- supabase start ✅ db:health ✅

## 03 — Auth / Onboarding (Tamamlandı)
- packages/api-client/src/services/auth.ts — Zod validasyon + Türkçe hatalar
- apps/mobile/src/stores/authStore.ts — Zustand + MMKV persist
- apps/mobile/app/(auth)/login.tsx, register.tsx, forgot-password.tsx
- apps/mobile/app/(onboarding)/ — welcome, daily-goal, diagnostic-invite
- apps/mobile/app/_layout.tsx — Auth guard + onboarding yönlendirme
- supabase handle_new_user() trigger — kayıtta otomatik profil oluşturma
- supabase db reset ✅

## 05 — Modüller (Tamamlandı)
- src/constants/colors.ts + modules.ts — renk ve modül konfigürasyonları
- src/data/sampleContent.ts — 4 modül için örnek Türkçe içerik + sorular
- src/stores/sessionStore.ts — Zustand ile aktif session state (metrik toplama)
- src/hooks/useSessionTimer.ts — countdown/countup timer hook (firstHalf/secondHalf)
- src/components/exercise/ChunkReader.tsx — RSVP parça okuma (speed_control)
- src/components/exercise/TextReader.tsx — tam metin okuma + scroll takibi (deep_comprehension)
- src/components/exercise/AttentionGrid.tsx — 5×5 harf matrisi, 10 tur (attention_power)
- src/components/exercise/BreathingCircle.tsx — 4-7-8 nefes animasyonu, 3 tur (mental_reset)
- src/components/exercise/QuestionCard.tsx — çoktan seçmeli soru kartı + haptic feedback
- app/exercise/_layout.tsx — egzersiz stack layout
- app/exercise/[moduleCode]/index.tsx — egzersiz giriş ekranı
- app/exercise/[moduleCode]/session.tsx — aktif egzersiz + soru fazı
- app/exercise/[moduleCode]/result.tsx — ARP, XP, yorgunluk, öneri sonuç ekranı
- app/(tabs)/_layout.tsx — emoji ikonlu tab bar
- app/(tabs)/index.tsx — ana sayfa (ARP kartı, modül kısayolları, günlük ipucu)
- app/(tabs)/sessions.tsx — modül seçim ekranı (4 kart + günlük hedef)
- app/(tabs)/progress.tsx — ARP ilerleme, beceri çubukları, zayıf noktalar
- app/(tabs)/profile.tsx — öğrenci profili + çıkış
- TypeScript: 0 hata ✅ | Unit testler: 26/26 ✅

## 06 — Tanılama Sistemi (Tamamlandı)
- src/data/diagnosticContent.ts — 248 kelimelik Türkçe tanılama metni + 5 soru
- src/stores/diagnosticStore.ts — tanılama state (okuma WPM, anlama, ARP hesabı)
- packages/api-client/src/services/diagnosticService.ts — saveInitialDiagnostic() (diagnostics + students + cognitive_profiles)
- app/diagnostic/_layout.tsx — Stack layout (gestureEnabled: false)
- app/diagnostic/intro.tsx — 3 adımlı tanılama intro ekranı
- app/diagnostic/reading.tsx — Metni oku, bitince WPM hesapla
- app/diagnostic/comprehension.tsx — 5 anlama sorusu (QuestionCard)
- app/diagnostic/result.tsx — Baseline ARP göster, DB'ye kaydet, profil güncelle
- app/(onboarding)/diagnostic-invite.tsx — "Başlat" butonu → /diagnostic/intro
- app/_layout.tsx — diagnostic stack eklendi, auth guard güncellendi
- supabase/migrations/004_functions_triggers.sql — upsert_daily_stats bug fix (stat_date→date, total_minutes)
- supabase db reset ✅ | TypeScript: 0 hata ✅ | Unit testler: 26/26 ✅

## 07 — Gamification (Tamamlandı)
- packages/shared/src/constants/levels.ts — LEVEL_XP_THRESHOLDS, LEVEL_NAMES, getLevelFromXp(), getXpToNextLevel()
- packages/api-client/src/services/streakService.ts — günlük seri güncelleme (streak kırılma tespiti)
- apps/mobile/app/exercise-result.tsx — ARP animasyonu, XP banner, rozet gösterimi, yorgunluk uyarısı
- apps/mobile/app/(tabs)/index.tsx — Lv.X/seviye adı badge + XP ilerleme çubuğu eklendi
- supabase/migrations/007_gamification.sql ✅ (update_student_streak, calculate_level, award_badge_xp trigger)
- supabase db reset ✅ | TypeScript: 0 hata ✅

## 12 — Deploy / CI-CD (Tamamlandı)
- apps/web/vercel.json — Vercel monorepo build config (pnpm filter, env vars)
- apps/mobile/eas.json — EAS Build: development / preview / production profilleri
- apps/mobile/app.json — buildNumber, versionCode, expo-haptics plugin, EAS projectId eklendi
- .github/workflows/deploy.yml — GitHub Actions: typecheck → test → web deploy + supabase functions + mobile build
- apps/mobile/src/utils/monitoring.ts — Sentry + Analytics placeholder (trackExerciseComplete, trackScreenView, trackPurchase)
- TypeScript: 0 hata ✅ (mobile + web)

### GitHub Actions Secrets (production'da ayarlanmalı)
- VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID_WEB
- SUPABASE_ACCESS_TOKEN, SUPABASE_PROJECT_REF
- EXPO_TOKEN

### Supabase Production Komutları
  supabase link --project-ref YOUR_PROJECT_REF
  supabase db push
  supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
  supabase functions deploy ai-coach
  supabase functions deploy ai-weekly-report
  supabase functions deploy cron-risk-detection
  supabase functions deploy cron-daily-stats

## 11 — Super Admin Panel (Tamamlandı)
- apps/web/app/(admin)/layout.tsx — Super admin sidebar (amber badge, auth guard)
- apps/web/app/(admin)/page.tsx — Dashboard: global metrikler (kurum, öğrenci, MRR, trial uyarıları)
- apps/web/app/(admin)/tenants/new/page.tsx — Yeni kurum formu (Zod validasyon, tier fiyatlama, MRR hesaplama)
- apps/web/app/api/admin/tenants/route.ts — POST: tenant + tenant_settings + auth user + tenant_admins oluşturma
- apps/web/components/admin/TenantsTable.tsx — Kurum listesi (tier badge, doluluk bar, MRR, trial durumu)
- apps/web/components/admin/NewTenantButton.tsx — Client component buton
- TypeScript: 0 hata ✅

## 10 — B2B Admin Panel (Tamamlandı)
- apps/web/app/(auth)/login/page.tsx — Kurum admin girişi (client-side Supabase auth)
- apps/web/app/(panel)/layout.tsx — Sidebar + auth guard (server component)
- apps/web/app/(panel)/page.tsx — Dashboard: özet kartlar + haftalık aktivite grafiği + risk uyarıları
- apps/web/app/(panel)/students/page.tsx — Öğrenci listesi (arama + sınav filtresi)
- apps/web/app/(panel)/students/[id]/page.tsx — Öğrenci detay: ARP trend + bilişsel profil
- apps/web/app/api/auth/signout/route.ts — Çıkış route
- apps/web/components/charts/WeeklyActivityChart.tsx — Recharts AreaChart
- apps/web/components/charts/ARPTrendChart.tsx — Recharts LineChart
- apps/web/components/panel/RiskStudentsAlert.tsx — Risk uyarı kartları
- apps/web/components/panel/StudentFilters.tsx — Arama + sınav filtresi
- apps/web/components/panel/ModuleProgressBars.tsx — Beceri çubukları
- apps/web/middleware.ts — Supabase SSR auth guard
- lucide-react eklendi, server.ts createServerClient olarak güncellendi
- TypeScript: 0 hata ✅
- React versiyon fix: 19.2.4 → 19.1.0 (react-native-renderer uyumu) ✅

## 09 — Ödeme Sistemi (Tamamlandı)
- packages/api-client/src/services/purchases.ts — PurchasesService (RevenueCat: init, getOfferings, purchase, restore, isPremium)
- apps/mobile/app/(modals)/_layout.tsx — modal stack layout
- apps/mobile/app/(modals)/paywall.tsx — Paywall ekranı (aylık/yıllık paket, satın alma, geri yükleme)
- apps/mobile/src/hooks/usePremiumGate.ts — requirePremium() → paywall yönlendirme
- TypeScript: 0 hata ✅
- NOT: Production'da EXPO_PUBLIC_REVENUECAT_API_KEY_IOS / _ANDROID gerekli

## 08 — AI Coach (Tamamlandı)
- supabase/functions/ai-coach/index.ts — günlük öneri (Claude Haiku, max_tokens: 300, Türkçe)
- supabase/functions/ai-weekly-report/index.ts — haftalık rapor (Claude Haiku, max_tokens: 500)
- supabase/functions/cron-risk-detection/index.ts — B2B nightly risk scoring (arp_drop, streak, inactivity, not_diagnosed)
- apps/mobile/src/hooks/useAiCoach.ts — useAiCoach() hook (getDailyRecommendation, getWeeklyReport)
- supabase/migrations/008_ai_cron.sql — pg_cron + pg_net, gece 02:00 risk tespiti schedule
- supabase db reset ✅ | TypeScript: 0 hata ✅
- NOT: Production'da `supabase secrets set ANTHROPIC_API_KEY=sk-...` gerekli

## Altyapı (2026-02-21 Fix)
- .npmrc: shamefully-hoist=true (pnpm + CocoaPods uyumu)
- react-native-mmkv: v2 → v3.3.3 (JSI TurboModule, New Architecture native)
- Podfile.properties.json: newArchEnabled=true, expo.jsEngine=hermes
- iOS build: Build Succeeded ✅ (90 pods, 0 hata)

## 14 — KVKK & Hukuki Uyumluluk (Tamamlandı)
- packages/shared/src/legal/kvkk.ts — KVKK_AYDINLATMA_METNI, RIZA_METNI_B2C, RIZA_METNI_VELI
- apps/mobile/app/(onboarding)/consent.tsx — Rıza akışı (13 yaş altı veli onayı, 13-18 özel koruma)
- apps/web/app/api/account/delete/route.ts — B2C: CASCADE sil, B2B: anonimleştir + pasife al
- TypeScript: 0 hata ✅

## 13 — İçerik Kütüphanesi (Tamamlandı)
- packages/shared/src/constants/content.ts — CONTENT_CATEGORIES, EXAM_CONTENT_WEIGHTS, DIFFICULTY_TEXT_PARAMS
- packages/shared/src/utils/readabilityScorer.ts — calculateFleschScore(), getTargetWpm(), estimateDifficulty()
- packages/api-client/src/services/contentService.ts — getAdaptiveContent(), getRecentlyUsedContentIds()
- supabase/migrations/009_content_library.sql — source_type kolonu + GIN indeksler
- supabase/seed/content.sql — 15 metin (5 güçlük × tüm sınav tipleri), tümü JSONB sorularla
- apps/web/app/(admin)/content/new/page.tsx — Flesch/güçlük canlı hesaplayan admin içerik editörü
- apps/web/app/api/admin/content/route.ts — POST: content_library'ye kayıt
- supabase db reset ✅ | seed: 15 metin ✅ | TypeScript: 0 hata ✅ | Unit testler: 26/26 ✅

## 04 — Performance Engine (Tamamlandı)
- packages/shared/src/types/engine.ts — SessionMetrics, PerformanceResult, CognitiveProfile, EXAM_ARP_TARGETS
- packages/shared/src/engine/arpCalculator.ts — REI, CSF, ARP hesaplama + sınav ilerlemesi
- packages/shared/src/engine/fatigueDetector.ts — İki yarı karşılaştırma, ağırlıklı skor (WPM 40%, doğruluk 35%, yanıt süresi 25%)
- packages/shared/src/engine/difficultyAdapter.ts — Kural tabanlı adaptif zorluk (1-10)
- packages/shared/src/engine/stabilityAnalyzer.ts — CV tabanlı stabilite, plato tespiti, medyan WPM
- packages/shared/src/engine/modeRecommender.ts — Profil bazlı modül önerisi ve zayıflık sıralaması
- packages/shared/src/engine/performanceEngine.ts — processSession() ana girdi noktası + calculateXP()
- packages/api-client/src/services/performancePipeline.ts — completeSession(), getArpHistory(), getCognitiveProfile()
- supabase/migrations/004_functions_triggers.sql — upsert_daily_stats() SQL fonksiyonu eklendi
- packages/shared/src/engine/__tests__/ — 26 birim testi (3 dosya) ✅
- supabase db reset ✅
