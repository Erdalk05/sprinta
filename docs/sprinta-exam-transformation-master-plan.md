# SPRINTA — Exam Acceleration & Cognitive Performance Platform
## Master Transformation Plan v1.0
### Tarih: Mart 2026 | Geliştirici: Erdal Kızıroğlu

---

## BÖLÜM 1 — YÖNETİCİ VİZYONU (Executive Vision)

### Mevcut Durum
Sprinta, hızlı okuma ve bilişsel performans ölçümü yapan Türkiye odaklı bir mobil uygulamadır.
- 12 okuma modu, ARP algoritması, adaptif WPM
- 55 metin kütüphanesi (LGS/TYT/AYT/KPSS/ALES)
- Gamification (XP, rozet, streak, challenge)
- Claude Haiku AI mentor entegrasyonu
- Multi-tenant Supabase altyapısı

### Hedef Durum (2027)
> **Sprinta = Türkiye'nin Sınav Hazırlık İşletim Sistemi**

Tek platformda:
- Bilişsel hız + anlama geliştirme
- Sınav simülasyonu (LGS / TYT / AYT / YDT / KPSS / ALES / DGS)
- Konu bazlı soru bankası (50.000+ soru)
- AI adaptif çalışma planı
- Zayıf alan tespiti + güçlendirme
- Öğretmen / veli / kurum dashboard'u

### Stratejik Fark
```
Rakip A (Vitamin)    → Soru bankası var, bilişsel performans YOK
Rakip B (Rehber)     → Soru var, adaptif plan YOK
Rakip C (Sınav.tv)   → Video ders var, okuma antrenmanı YOK
SPRINTA              → HEPSİ + Bilişsel motor + AI planlayıcı + Gerçek zamanlı metrik
```

---

## BÖLÜM 2 — MEVCUT CODEBASE ANALİZİ

### 2.1 Mobil Uygulama (apps/mobile)
```
Expo 54 / RN 0.81.5 / New Architecture / Hermes
├── app/(tabs)/           → Ana navigasyon (index, menu, calis, sessions, social)
├── app/(auth)/           → login, register, onboarding
├── app/exercise/         → 12+ okuma modu result ekranı
├── app/tanilama/         → Tanılama testi
├── app/visual-mechanics/ → 15 göz egzersizi
│
├── src/features/
│   ├── home/             → GameHomeScreen (PerformanceHeader, DailyMission, BrainPowerMap)
│   ├── navigation/       → RadialFAB (5 egzersiz)
│   ├── visual-mechanics/ → 15 göz/dikkat egzersizi (engines + components + store)
│   └── onboarding/       → Quiz + onboarding flow
│
├── src/components/
│   ├── exercises/
│   │   ├── ReadingModes/ → ReadingModesExercise (7 mod birleşik)
│   │   └── SpeedControl/ → FlowReadingExercise, ChunkRSVPExercise
│   ├── reading/          → ReadingModePickerSheet, LibraryPreview
│   └── training/         → TrainingBottomSheet
│
├── src/screens/
│   ├── ReadingHubScreen  → Sprint 4 Okuma Merkezi
│   ├── TextDetailScreen  → Kitap detay
│   └── ReaderScreen      → Tam ekran okuyucu
│
└── src/stores/           → Zustand (auth, session, theme, home, pendingReading)
```

### 2.2 Web Admin (apps/web)
```
Next.js 15 / App Router / TypeScript
├── app/admin/
│   ├── texts/            → İçerik yönetimi (CRUD + bölüm yönetimi)
│   ├── chapters/         → Bölüm editörü
│   └── analytics/        → Kullanıcı istatistikleri
│
└── app/api/              → (Supabase ile doğrudan iletişim)
```

### 2.3 Packages
```
packages/
├── api-client/           → Supabase servis katmanı
│   ├── library/          → libraryService, TextWithProgress
│   ├── intelligence/     → examService (7 method)
│   ├── admin/            → adminContentService, aiGenerationService
│   └── services/         → badgeService, performancePipeline
│
└── shared/               → TypeScript types, constants, reading-engine
    ├── reading-engine/   → ReadingEngine + chunkUtils
    └── constants/        → levels.ts (XP/Level sistemi)
```

### 2.4 Supabase Schema (49 tablo)
```
Core:
  students              → Kullanıcı profili (role, grade_level, exam_target, ARP)
  sessions              → Her egzersiz oturumu (XP, ARP, REI, CSF)
  cognitive_profiles    → Bilişsel profil (WPM trend, anlama oranı)
  daily_stats           → Günlük performans özeti
  user_streaks          → Streak takibi

İçerik:
  text_library          → 55 metin (exam_type, category, difficulty)
  text_chapters         → 156 bölüm (gövde metin)
  text_questions        → 275+ soru (main_idea/detail/inference/vocabulary/tone)
  vocabulary_words      → 40 kelime (MCQ flashcard)
  text_bookmarks        → Yer imi + not + highlight

Sınav Zekası:
  user_exam_profile     → Sınav bazlı performans profili
  user_question_sessions → Soru oturumu geçmişi
  diagnostics           → Tanılama testi sonuçları

Gamification:
  badges                → Rozet tanımları
  student_badges        → Kullanıcı rozetleri
  challenges            → Arkadaş challenge sistemi
  leaderboard_weekly    → Haftalık sıralama

AI:
  ai_mentor_feedback    → Claude Haiku mentor geri bildirimi
  onboarding_telemetry  → Onboarding quiz analitik

Multi-Tenant (B2B):
  tenants               → Kurum kaydı
  tenant_admins         → Kurum yöneticisi
  tenant_settings       → Kurum ayarları
  tenant_daily_stats    → Kurum günlük istatistik
  subscriptions         → Abonelik yönetimi

Gelişmiş Analitik:
  chapter_dropoff_analytics → Bölüm terk analizi
  content_analytics         → İçerik kullanım analizi
  fatigue_logs              → Yorgunluk takibi
  risk_distribution         → Risk dağılımı
  readers_over_time         → Okuyucu trend
```

### 2.5 Performans Metrikleri (Mevcut)
```
ARP  (Adaptive Reading Performance) → WPM × Anlama × Zorluk
REI  (Reading Efficiency Index)     → ARP / Süre normalizasyonu
CSF  (Cognitive Stress Factor)      → Hata oranı + yorgunluk
XP   → Seans tamamlama + anlama doğruluğu
```

---

## BÖLÜM 3 — DÖNÜŞÜM STRATEJİSİ: 7 KATMAN

### KATMAN 1 — Core Cognitive Engine (Mevcut + Güçlendirme)

**Amaç:** Okuma hızı, anlama ve dikkat becerilerini bilimsel metriklerle ölçmek ve geliştirmek.

**Mevcut:**
- 12 okuma modu, FlowReading, ChunkRSVP, FixationTrainer
- ARP / REI / CSF metrikleri
- Adaptif WPM (son 5 seans ortalaması)
- 15 göz & dikkat egzersizi (visual-mechanics)

**Eksik / Geliştirilecek:**
```
[ ] Saccadic movement trainer (gelişmiş)
[ ] Peripheral vision expansion (daha geniş açı)
[ ] Working memory exercises (N-back task)
[ ] Metacognitive reading strategies
[ ] Timed chunking with comprehension score
[ ] Eye-span measurement (character/satır ölçümü)
```

**DB Değişikliği:** Mevcut sessions + cognitive_profiles yeterli, extended_metrics JSON alanı eklenecek.

**Öncelik:** Orta (mevcut sağlam)

---

### KATMAN 2 — Exam Simulation Engine (YENİ)

**Amaç:** Gerçek sınav koşullarını simüle et — zaman baskısı, soru türü dağılımı, puan hesaplama.

**Gerekli DB Tabloları:**
```sql
exam_simulations        → Simülasyon tanımları (exam_type, time_limit, question_count)
exam_simulation_sessions → Kullanıcı simülasyon oturumu
exam_simulation_answers  → Her soru cevabı (doğru/yanlış/boş + süre)
exam_simulation_results  → Net puan, bölüm bazlı analiz, tahmin sıralama
question_bank            → 50.000+ soru (subject, topic, difficulty, exam_type)
question_options         → 4-5 seçenek
question_explanations    → Çözüm açıklaması + video link
```

**Gerekli API'ler:**
```
POST /api/simulation/start         → Yeni simülasyon oturumu aç
GET  /api/simulation/:id/questions → Rastgele soru seçimi (konu dağılımına göre)
POST /api/simulation/:id/answer    → Cevap kaydet
POST /api/simulation/:id/finish    → Oturumu bitir, net hesapla
GET  /api/simulation/history       → Geçmiş simülasyonlar
GET  /api/simulation/analytics     → Net trend, konu bazlı başarı
```

**Gerekli UI Ekranları (Mobil):**
```
SimulationHomeScreen     → Sınav seçimi (LGS/TYT/AYT...)
SimulationSetupScreen    → Süre + konu + zorluk ayarı
SimulationActiveScreen   → Sayaç + soru + seçenek (tam ekran, dokunmatik)
SimulationResultScreen   → Net + performans haritası + AI yorum
SimulationHistoryScreen  → Geçmiş simülasyonlar trend grafiği
```

**Gerekli UI Ekranları (Web Admin):**
```
/admin/question-bank     → Soru ekleme/düzenleme (Excel import)
/admin/simulations       → Simülasyon şablonları
/admin/analytics/sims    → Kurum bazlı simülasyon analizi
```

**Öncelik:** YÜKSEK — Platform değişiminin çekirdeği

---

### KATMAN 3 — Subject Practice Modules (YENİ)

**Amaç:** Ders bazlı soru çözme — Türkçe, Matematik, Fen, Sosyal, İngilizce, Biyoloji, Fizik, Kimya...

**Konu Ağacı:**
```
LGS:
  Türkçe       → Paragraf anlama, sözcük türleri, cümle bilgisi, noktalama
  Matematik    → Sayılar, geometri, olasılık, denklemler
  Fen          → Hücre, ekosistem, kuvvet, enerji
  Sosyal       → Tarih, coğrafya, vatandaşlık
  İngilizce    → Reading, vocabulary, grammar
  Din/Ahlak    → Temel kavramlar

TYT:
  Türkçe       → Dil bilgisi, paragraf, sözel muhakeme
  Matematik    → Temel mat, geometri, analitik geometri
  Biyoloji     → Hücre, genetik, sinir sistemi
  Fizik        → Mekanik, elektrik, dalgalar
  Kimya        → Periyodik tablo, organik, denge
  Sosyal       → Tarih, coğrafya, felsefe, din

AYT (Sayısal):
  İleri Matematik → Türev, integral, kompleks
  Fizik           → Optik, modern fizik
  Kimya           → Organik, analitik kimya
  Biyoloji        → Moleküler biyoloji, ekoloji

KPSS:
  Genel Kültür → Tarih, Coğrafya, Anayasa, Hukuk
  Genel Yetenek → Matematik, Türkçe
  Alan Bilgisi → Eğitim Bilimleri
```

**Gerekli DB Tabloları:**
```sql
subjects              → Ders tanımları (name, exam_type, icon, color)
topics                → Konu ağacı (subject_id, parent_id, name, order)
subtopics             → Alt konu (topic_id, name, description)
question_bank         → Soru (subtopic_id, difficulty, question_type, body, options, correct)
student_topic_mastery → Kullanıcı konu hakimiyet skoru (0-100)
practice_sessions     → Konu çalışma oturumu
```

**Gerekli UI Ekranları:**
```
SubjectMapScreen       → Tüm dersler grid (ikon + renk + tamamlanma yüzdesi)
TopicTreeScreen        → Ders içi konu ağacı (accordion)
PracticeScreen         → Soru çözme (animasyonlu, instant feedback)
TopicMasteryScreen     → Konu hakimiyet haritası (renk gradyan)
WeakTopicsScreen       → Zayıf konular listesi + AI önerisi
```

**Öncelik:** YÜKSEK

---

### KATMAN 4 — AI Study Planner (YENİ)

**Amaç:** Her öğrenciye özel günlük/haftalık çalışma programı oluştur ve adapte et.

**Giriş Verileri:**
```
- Hedef sınav + tarih
- Mevcut seviye (tanılama skoru)
- Zayıf konular (Katman 5'ten)
- Günlük çalışma süresi tercihi
- Geçmiş performans (sessions, daily_stats)
```

**Çıktı:**
```
Günlük Plan:
  09:00 → Okuma antrenmanı (15 dk) — FlowReading + Metin
  09:15 → TYT Türkçe: Paragraf (20 dk) — 10 soru
  09:35 → Matematik: Denklemler (25 dk) — 15 soru
  Günlük Hedef XP: 500
```

**AI Mimarisi (Claude Haiku üzerinden):**
```
Edge Function: generate-study-plan
Girdi:
  - student_profile (seviye, hedef, zayıf konular)
  - exam_date (kalan gün)
  - daily_available_minutes
  - last_7_days_performance

Çıktı (JSON):
  {
    plan_date: "2026-03-04",
    tasks: [
      { type: "reading", module: "flow-reading", duration: 15, text_id: "..." },
      { type: "practice", subject: "türkçe", topic: "paragraf", count: 10 },
      { type: "simulation", exam: "TYT", sections: ["türkçe"], duration: 20 }
    ],
    motivational_message: "Dün harika bir performans gösterdin! ...",
    focus_tip: "Bugün özellikle paragraf sorularına odaklan."
  }
```

**Gerekli DB Tabloları:**
```sql
study_plans           → Günlük plan başlığı (date, student_id, ai_generated)
study_plan_tasks      → Plan görevleri (type, module/subject/topic, duration, order)
study_plan_completions → Görev tamamlama kaydı (task_id, completed_at, xp_earned)
```

**Öncelik:** ORTA (Katman 2+3 bittikten sonra)

---

### KATMAN 5 — Adaptive Weakness Detection (YENİ)

**Amaç:** Öğrencinin tam olarak nerede takıldığını tespit et.

**Algoritma:**
```
Zayıf Alan Skoru = f(
  doğruluk_oranı,          # son 20 soruda doğru %
  hız_metriki,             # soru başına ortalama süre
  tekrar_hata_oranı,       # aynı konu hata tekrarı
  son_seans_trendi         # son 3 seansta iyileşme var mı?
)

Eşik:
  0-40%  → KRİTİK (kırmızı) — Temel konuyu öğren
  40-65% → GELİŞTİR (turuncu) — Pekiştir + alıştır
  65-80% → TAKİP ET (sarı) — Sürekliliği koru
  80%+   → SAĞLAM (yeşil) — Üst seviye sorulara geç
```

**Gerekli DB Tabloları:**
```sql
weakness_reports      → Haftalık zayıf alan raporu (student_id, subject, topic, score)
strength_reports      → Güçlü alan raporu
topic_error_patterns  → Hata örüntüsü (hangi tip soruda hangi hata)
```

**Gerekli UI:**
```
WeaknessRadarChart    → 6 eksende radar grafiği (Türkçe/Mat/Fen/Sosyal/İng/Alan)
TopicHeatMap          → Konu ısı haritası (yeşil→kırmızı)
AIRecommendation      → "Bu hafta şu 3 konuya odaklan"
```

**Öncelik:** ORTA-YÜKSEK

---

### KATMAN 6 — Teacher / Admin Dashboard (Kısmen Mevcut)

**Mevcut:** Next.js admin paneli (içerik yönetimi + temel analitik)

**Genişletilecek:**
```
Öğretmen Paneli:
  /teacher/students         → Öğrenci listesi + performans özeti
  /teacher/assignments      → Ödev ata (belirli metin + soru seti)
  /teacher/progress         → Sınıf bazlı ilerleme raporu
  /teacher/weak-areas       → Sınıfın en zayıf konuları
  /teacher/live             → Canlı ders modu (simültane simülasyon)

Kurum Paneli (B2B):
  /admin/institution        → Kurum bilgileri
  /admin/students           → Öğrenci yönetimi (import/export)
  /admin/licenses           → Lisans yönetimi
  /admin/reports            → Kurum performans raporu (PDF export)
  /admin/billing            → Fatura + abonelik
```

**Gerekli DB Tabloları:**
```sql
teacher_students      → Öğretmen-öğrenci ilişkisi
assignments           → Ödev tanımı (teacher_id, due_date, content)
assignment_submissions → Ödev tamamlama
class_groups          → Sınıf grupları
class_memberships     → Öğrenci-sınıf ilişkisi
```

**Öncelik:** B2B stratejisi için YÜKSEK

---

### KATMAN 7 — Parent Monitoring Layer (YENİ)

**Amaç:** Veli, çocuğunun gelişimini takip eder.

**Özellikler:**
```
- Haftalık otomatik e-posta raporu
- Çalışma süresi grafik
- ARP gelişim eğrisi
- Zayıf konu uyarısı
- "Bu hafta 5 gün çalıştı — harika!" bildirimi
- Abonelik yönetimi
```

**Gerekli DB Tabloları:**
```sql
parent_accounts       → Veli hesabı
parent_child_links    → Veli-öğrenci bağlantısı
parent_notifications  → Bildirim geçmişi
weekly_parent_reports → Haftalık rapor (JSON özet)
```

**Gerekli UI:**
```
ParentDashboard       → Web + mobil responsive
WeeklyDigest          → E-posta şablonu (HTML)
ParentAppScreen       → Basit mobil görünüm
```

**Öncelik:** DÜŞÜK (Phase 3+)

---

## BÖLÜM 4 — TÜRK SINAV EŞLEŞTİRMESİ

| Sınav | Hedef Kitle | Süre | Soru | Okuma Yoğunluğu | Zaman Baskısı | Sprinta Önceliği |
|-------|-------------|------|------|-----------------|----------------|------------------|
| **LGS** | 8. Sınıf (14 yaş) | 65 dk | 90 soru | Orta | Yüksek | ARP < 200 WPM hedefe al |
| **TYT** | Lise 12 (18 yaş) | 135 dk | 120 soru | Yüksek | Çok Yüksek | 250+ WPM + paragraf modu |
| **AYT** | Lise 12 (18 yaş) | 180 dk | 80 soru | Çok Yüksek | Orta | Akademik okuma + anlama |
| **YDT** | Lise 12 (18 yaş) | 120 dk | 80 soru | İng. Yoğun | Yüksek | İngilizce metin modülü |
| **KPSS** | Mezun (22-35 yaş) | 130 dk | 120 soru | Çok Yüksek | Yüksek | Akademik okuma modu |
| **ALES** | Yükseklisans adayı | 150 dk | 100 soru | Akademik | Yüksek | ALES metin seti |
| **DGS** | Önlisans mezunu | 90 dk | 80 soru | Orta | Yüksek | TYT benzeri |

### Sınav Bazlı Özellik Matrisi

```
                    LGS  TYT  AYT  YDT  KPSS ALES DGS
Okuma Antrenmanı     ✓    ✓    ✓    ✓    ✓    ✓    ✓
Soru Bankası         ✓    ✓    ✓    ✓    ✓    ✓    ✓
Paragraf Modu        ✓    ✓    ✓    ✓    ✓    ✓    ✓
İngilizce Metinler   ✓    -    -    ✓    -    ✓    -
Simülasyon           ✓    ✓    ✓    ✓    ✓    ✓    ✓
Akademik Okuma       -    ✓    ✓    ✓    ✓    ✓    ✓
AI Çalışma Planı     ✓    ✓    ✓    ✓    ✓    ✓    ✓
Zayıf Konu Tespiti   ✓    ✓    ✓    ✓    ✓    ✓    ✓
Veli Raporu          ✓    ✓    -    -    -    -    -
```

---

## BÖLÜM 5 — MİMARİ GENİŞLEME PLANI

### 5.1 Mevcut Mimari
```
┌─────────────────────────────────────────────────────┐
│                   SPRINTA v1.0                      │
├────────────────────┬────────────────────────────────┤
│   Expo Mobile      │   Next.js Web Admin             │
│   RN 0.81.5        │   App Router                    │
├────────────────────┴────────────────────────────────┤
│              packages/api-client                     │
│              packages/shared                         │
├─────────────────────────────────────────────────────┤
│              Supabase                               │
│   PostgreSQL + RLS + Edge Functions + Auth          │
└─────────────────────────────────────────────────────┘
```

### 5.2 Hedef Mimari (v2.0)
```
┌──────────────────────────────────────────────────────────────────┐
│                     SPRINTA v2.0                                 │
├──────────────────┬──────────────────┬────────────────────────────┤
│  Expo Mobile     │ Next.js Web App  │ Next.js Teacher Portal     │
│  (Öğrenci)       │ (Veli + Web öğr) │ (Öğretmen + Kurum Admin)   │
├──────────────────┴──────────────────┴────────────────────────────┤
│                   packages/                                      │
│   api-client / shared / exam-engine / ai-planner / analytics     │
├──────────────────────────────────────────────────────────────────┤
│                   Supabase                                       │
│   PostgreSQL (49→80+ tablo) + RLS + Edge Functions               │
├──────────────────────────────────────────────────────────────────┤
│                   AI Layer                                       │
│   Claude Haiku (mentor + planner) + Embedding (semantic search)  │
├──────────────────────────────────────────────────────────────────┤
│                   External                                       │
│   RevenueCat (IAP) + Resend (email) + Vercel (deploy)            │
└──────────────────────────────────────────────────────────────────┘
```

### 5.3 Yeni Packages
```
packages/
├── exam-engine/          → Simülasyon motoru (soru seçici, puanlama, net hesap)
├── ai-planner/           → Study plan generator (Claude + Supabase)
├── weakness-detector/    → Analitik algoritma (zayıf konu tespiti)
└── report-generator/     → PDF/e-posta rapor üreteci
```

---

## BÖLÜM 6 — VERİTABANI GENİŞLEME PLANI

### Mevcut: 49 tablo → Hedef: ~85 tablo

```
YENİ TABLOLAR (36 adet):

Soru Bankası (6 tablo):
  question_bank          → Ana soru tablosu
  question_subjects      → Ders tanımları
  question_topics        → Konu ağacı
  question_subtopics     → Alt konular
  question_media         → Görsel/şekil ekleri
  question_reports       → Hata bildirimi

Sınav Simülasyonu (5 tablo):
  exam_simulations       → Simülasyon şablonları
  simulation_sessions    → Kullanıcı oturumu
  simulation_answers     → Cevap kaydı
  simulation_results     → Sonuç analizi
  simulation_rankings    → Günlük sıralama

Konu Hakimiyeti (4 tablo):
  student_topic_mastery  → Kullanıcı konu skoru
  topic_error_patterns   → Hata örüntüsü
  weakness_reports       → Haftalık zayıf rapor
  strength_reports       → Güçlü alan raporu

AI Planlayıcı (3 tablo):
  study_plans            → Günlük plan
  study_plan_tasks       → Plan görevleri
  study_plan_completions → Görev tamamlama

Öğretmen Katmanı (5 tablo):
  teacher_students       → Öğretmen-öğrenci
  assignments            → Ödev
  assignment_submissions → Ödev teslim
  class_groups           → Sınıflar
  class_memberships      → Sınıf üyeliği

Veli Katmanı (4 tablo):
  parent_accounts        → Veli hesabı
  parent_child_links     → Veli-öğrenci
  parent_notifications   → Bildirimler
  weekly_parent_reports  → Haftalık rapor

Ödeme / Abonelik (3 tablo):
  products               → Abonelik planları
  invoices               → Fatura
  coupon_codes           → İndirim kodu

İçerik Genişleme (4 tablo):
  video_content          → Video ders bağlantıları
  interactive_exercises  → İnteraktif alıştırmalar
  formula_sheets         → Formül kartları
  mind_maps              → Zihin haritaları

Bildirim (2 tablo):
  push_notifications     → Push bildirim kuyruğu
  notification_templates → Şablon yönetimi
```

---

## BÖLÜM 7 — AI KATMANI GENİŞLEMESİ

### Mevcut AI
```
Claude Haiku via Edge Function:
  generate-mentor-feedback  → Seans sonrası kişisel yorum
  generate-metadata         → İçerik zorluk/kategori tespiti
```

### Hedef AI Fonksiyonları
```
Edge Functions (Yeni):

generate-study-plan
  → Günlük çalışma planı üret
  → Girdi: profil + kalan gün + zayıf konular
  → Çıktı: JSON görev listesi

analyze-weakness
  → Zayıf konu analizi + öneri
  → Girdi: son 30 günlük oturum verisi
  → Çıktı: kritik konu listesi + aksiyon planı

generate-question-explanation
  → Yanlış soruya açıklama üret
  → Girdi: soru + yanlış cevap + doğru cevap
  → Çıktı: adım adım çözüm

generate-parent-report
  → Haftalık veli raporu oluştur
  → Girdi: 7 günlük stats + milestone'lar
  → Çıktı: sıcak dilli HTML rapor

predict-exam-score
  → Simülasyon verisinden gerçek sınav tahmini
  → Girdi: son 5 simülasyon sonucu
  → Çıktı: tahmini net + güven aralığı
```

### Semantic Search (Embedding)
```
text_library → pgvector extension
→ "Bu konuyu açıklayan metin var mı?" sorgusu
→ Öğrenci zayıf konusuna göre metin önerisi
→ OpenAI/Supabase Vector Store ile
```

---

## BÖLÜM 8 — YAYGIN (PHASE) YOL HARİTASI

### Phase 1 — Temel Soru Bankası (Sprint 13-15) [2 ay]
```
✓ question_bank + question_topics tabloları
✓ İlk 5.000 soru (LGS Türkçe + Matematik + Fen)
✓ PracticeScreen (mobil)
✓ Admin soru editörü (/admin/question-bank)
✓ TopicMasteryCard (ana sayfaya ekle)
```

### Phase 2 — Sınav Simülasyonu (Sprint 16-18) [2 ay]
```
✓ exam_simulations + simulation_sessions + simulation_answers
✓ SimulationActiveScreen (tam ekran, sayaç, soru, seçenek)
✓ SimulationResultScreen (net + konu dağılımı + AI yorum)
✓ LGS + TYT simülasyonu aktif
```

### Phase 3 — AI Çalışma Planı (Sprint 19-20) [1.5 ay]
```
✓ generate-study-plan Edge Function
✓ DailyPlanCard (ana sayfa güncelleme)
✓ study_plans + tasks + completions tabloları
✓ Adaptif plan (performansa göre otomatik revizyon)
```

### Phase 4 — Zayıf Alan Algılama (Sprint 21) [1 ay]
```
✓ weakness_reports algoritması
✓ WeaknessRadarChart
✓ TopicHeatMap
✓ AIRecommendation kartı
```

### Phase 5 — Soru Bankası Genişletme (Sprint 22-24) [2 ay]
```
✓ TYT / AYT tam konu kapsamı
✓ 20.000 soru hedefi
✓ Video çözüm linkleri
✓ Excel toplu import aracı
```

### Phase 6 — Öğretmen Paneli (Sprint 25-27) [2 ay]
```
✓ Teacher Portal (/teacher/*)
✓ Ödev sistemi
✓ Sınıf yönetimi
✓ Kurum raporlama
✓ B2B satış paketi hazır
```

### Phase 7 — Veli Katmanı (Sprint 28-29) [1.5 ay]
```
✓ Veli hesabı + çocuk bağlantısı
✓ Haftalık e-posta rapor (Resend)
✓ Veli mobil görünüm
```

### Phase 8 — KPSS / ALES Modülü (Sprint 30-31) [1.5 ay]
```
✓ KPSS tam içerik paketi
✓ ALES akademik okuma seti
✓ Yetişkin kullanıcı UX uyarlaması
```

### Phase 9 — Premium Özellikler & Monetizasyon (Sprint 32) [1 ay]
```
✓ RevenueCat tam entegrasyon
✓ Freemium vs Premium sınırlar
✓ Okul lisansı paketi
✓ API (3. parti entegrasyon)
```

### Phase 10 — Ölçeklendirme & Android (Sprint 33-35) [2 ay]
```
✓ Android build + Play Store
✓ CDN optimizasyonu
✓ Çoklu dil desteği (EN/AR)
✓ Enterprise onboarding flow
```

---

## BÖLÜM 9 — GELİR MODELİ

### 9.1 B2C (Bireysel Kullanıcı)
```
Ücretsiz (Freemium):
  - 5 okuma modu
  - 20 soru/gün
  - 1 simülasyon/ay
  - Temel AI mentor

Premium — Aylık ₺149:
  - Tüm okuma modları
  - Sınırsız soru
  - Sınırsız simülasyon
  - AI çalışma planı
  - Zayıf konu analizi
  - Tüm simülasyon sınavları

Yıllık ₺999 (%44 indirim):
  - Premium + veli raporu + sertifika
```

### 9.2 B2B (Okul / Dershane)
```
Starter (50 öğrenci): ₺2.500/ay
  - Öğrenci yönetimi
  - Öğretmen paneli
  - Temel raporlama

Growth (250 öğrenci): ₺9.000/ay
  - Tüm Starter
  - Ödev sistemi
  - Sınıf bazlı analitik
  - AI çalışma planı

Enterprise (500+ öğrenci): Özel fiyat
  - Tüm Growth
  - API erişimi
  - Özel içerik yükleme
  - Beyaz etiket (white-label)
  - SLA garantisi
```

### 9.3 Gelir Projeksiyonu
```
Yıl 1 (2026):
  B2C: 5.000 kullanıcı × ₺99 ortalama = ₺495.000
  B2B: 10 okul × ₺4.000/ay × 12 = ₺480.000
  Toplam: ~₺975.000 (~$30.000)

Yıl 2 (2027):
  B2C: 30.000 kullanıcı × ₺120 ortalama = ₺3.600.000
  B2B: 80 okul × ₺5.000/ay × 12 = ₺4.800.000
  Toplam: ~₺8.400.000 (~$250.000)

Yıl 3 (2028):
  B2C: 150.000 kullanıcı × ₺140 ortalama = ₺21.000.000
  B2B: 300 okul + Enterprise = ₺24.000.000
  Toplam: ~₺45.000.000 (~$1.3M)
```

---

## BÖLÜM 10 — REKABETÇİ AVANTAJ

### Konumlandırma
```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  Yüksek                                                      │
│  Bilişsel    ●  SPRINTA                                       │
│  Performans  │  (Hedef Konum)                                 │
│              │                                               │
│              │                      ● Dijitalders            │
│              │                      ● Vitamin                │
│  Düşük       └────────────────────────────────────────────   │
│              Geniş Konu   →          Dar Konu                │
└──────────────────────────────────────────────────────────────┘
```

### Sprinta'nın Kopyalanamaz Avantajları
```
1. ARP Algoritması       → Bilişsel performans ölçümü (patent alınabilir)
2. Okuma + Soru Entegrasyon → Tek akışta okuma antrenmanı + soru çözme
3. Adaptif WPM           → Kişiye özel hız ayarı (kimse yapmıyor)
4. Türkçe Bilişsel Metrik → Türkçeye özgü okuma hızı normları
5. Göz Antrenmanı        → Periferik görüş + sakkad + fixation (benzersiz)
6. Gamification Derinliği → Challenge + XP + rozet + streak (yüksek bağlılık)
```

---

## BÖLÜM 11 — TEKNİK RİSKLER

| Risk | Olasılık | Etki | Azaltma Stratejisi |
|------|----------|------|-------------------|
| Supabase ölçekleme sorunu | Orta | Yüksek | Connection pooling + edge caching |
| Soru bankası kalite kontrolü | Yüksek | Yüksek | Admin onay akışı + raporlama |
| AI maliyet artışı | Orta | Orta | Haiku tercih et, önbellek kullan |
| App Store reddi (eğitim) | Düşük | Çok Yüksek | App Store review guide uyum |
| Android uyumluluk | Orta | Orta | Expo managed workflow |
| RLS politika karmaşıklığı | Yüksek | Orta | Test suite + policy dokümantasyonu |
| Rekabet (Cepte YKS vb.) | Yüksek | Orta | Bilişsel motor differentiator |
| KVKK/GDPR | Orta | Yüksek | Mevcut lib/kvkk + DPO ataması |

---

## BÖLÜM 12 — ÖLÇEKLENDIRME STRATEJİSİ

### Altyapı Ölçekleme
```
Şu an (0-5K kullanıcı):
  Supabase Free/Pro → Yeterli
  Vercel Hobby → Yeterli
  Expo EAS → CI/CD

5K-50K kullanıcı:
  Supabase Pro + connection pooler
  Vercel Pro + Edge Functions
  Redis cache (oturum + soru önbellek)
  CDN (metin/görsel)

50K-500K kullanıcı:
  Supabase Scale / self-hosted PostgreSQL
  Multi-region deploy (İstanbul + Frankfurt)
  Elasticsearch (soru arama)
  Message queue (bildirim + AI task)

500K+ kullanıcı:
  Microservices (exam-service / analytics-service)
  Kubernetes
  Real-time pub/sub (sınıf canlı modu)
```

### İçerik Ölçekleme
```
Faz 1: 5.000 soru (elle yazılmış, yüksek kalite)
Faz 2: 20.000 soru (öğretmen katkısı + AI önerisi)
Faz 3: 50.000+ soru (topluluk + AI üretim + manuel onay)
Faz 4: Görsel soru desteği (geometri şekilleri, grafik)
```

---

## BÖLÜM 13 — 3 YILLIK BÜYÜME PROJEKSİYONU

```
                2026          2027          2028
               ──────        ──────        ──────
Kullanıcı      5.000         30.000        150.000
Günlük Aktif   500           4.500         25.000
B2B Okul       10            80            300
Soru Sayısı    5.000         20.000        50.000+
ARR            ₺975K         ₺8.4M         ₺45M
Platform       iOS           iOS+Android   iOS+Android+Web
Özellik        Soru Bankası  AI Plan       Ekosistem

Temel Büyütücüler:
→ LGS sezonu (Mart-Haziran) → Peak kullanım
→ TYT sezonu (Temmuz) → Premium spike
→ Okul yılı başı (Eylül) → B2B akın
→ KPSS dönemleri → Yetişkin segment
```

---

## BÖLÜM 14 — HIZLI KAZANIMLAR (Quick Wins)

Hemen başlanabilecek, yüksek etki düşük maliyet:

```
1. Soru Bankası Sprint (2 hafta)
   → question_bank + question_topics tabloları
   → İlk 500 TYT Türkçe sorusu
   → PracticeScreen basit versiyonu
   BEKLENEN ETKİ: Retention +40%, Session +25%

2. Ana Sayfa "Bugünkü Hedef" Kartı (3 gün)
   → Günlük 3 görev (okuma + soru + egzersiz)
   → Tamamlanma animasyonu
   BEKLENEN ETKİ: DAU +30%

3. Simülasyon Sayacı MVP (1 hafta)
   → 20 soruluk mini deneme
   → Sadece zamanlı çözüm
   → Sonuç ekranı
   BEKLENEN ETKİ: Kullanıcı başına seans +50%

4. Öğretmen Demo Paketi (1 hafta)
   → /teacher login
   → 5 öğrenci demo verisi
   → PDF rapor
   BEKLENEN ETKİ: B2B satış başlat
```

---

## ÖZET — PRİORİTE MATRİSİ

| Özellik | Etki | Çaba | Öncelik |
|---------|------|------|---------|
| Soru Bankası (5K soru) | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | 🔴 HEMEN |
| Simülasyon MVP | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 🔴 HEMEN |
| AI Çalışma Planı | ⭐⭐⭐⭐ | ⭐⭐⭐ | 🟡 Sprint 19 |
| Zayıf Konu Algılama | ⭐⭐⭐⭐ | ⭐⭐⭐ | 🟡 Sprint 21 |
| Öğretmen Paneli | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 🟠 Phase 6 |
| Veli Katmanı | ⭐⭐⭐ | ⭐⭐⭐ | 🟢 Phase 7 |
| Android | ⭐⭐⭐⭐ | ⭐⭐⭐ | 🟢 Phase 10 |

---

*Geliştirici: Erdal Kızıroğlu | Teknoloji: React Native + Supabase + Claude AI*
*Platform: iOS (Android yolda) | Versiyon: Master Plan v1.0 | Tarih: Mart 2026*
