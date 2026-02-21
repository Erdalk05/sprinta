# 02 — DATABASE SCHEMA
## Multi-Tenant Veritabanı Mimarisi — Tam SQL

> **Migration:** `001_initial_schema.sql` + `002_multi_tenant.sql` + `003_rls_policies.sql`  
> **Son güncelleme:** 2026-02-21

---

## İÇİNDEKİLER

1. [Extensions & ENUMs](#1-extensions--enums)
2. [Core Tablolar](#2-core-tablolar)
3. [Multi-Tenant Tablolar](#3-multi-tenant-tablolar)
4. [Eğitim & İçerik Tablolar](#4-eğitim--içerik-tablolar)
5. [Performans & Analytics Tablolar](#5-performans--analytics-tablolar)
6. [Gamification Tablolar](#6-gamification-tablolar)
7. [RLS Helper Fonksiyonlar](#7-rls-helper-fonksiyonlar)
8. [RLS Politikaları](#8-rls-politikaları)
9. [Indexler](#9-indexler)
10. [Triggerlar](#10-triggerlar)
11. [Seed Verisi](#11-seed-verisi)

---

## 1. EXTENSIONS & ENUMs

```sql
-- supabase/migrations/001_initial_schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Kullanıcı rolleri (sadeleştirildi — 3 rol)
CREATE TYPE user_role AS ENUM ('super_admin', 'tenant_admin', 'student');

-- Kurum tipleri
CREATE TYPE tenant_type AS ENUM ('school', 'tutoring_center', 'individual');

-- Kurum abonelik paketleri
CREATE TYPE tenant_tier AS ENUM ('starter', 'professional', 'enterprise');

-- Sınav tipleri (MEB + yüksek öğretim)
CREATE TYPE exam_type AS ENUM ('lgs', 'tyt', 'ayt', 'kpss', 'ales', 'yds', 'other');

-- Sınıf seviyeleri
CREATE TYPE grade_level AS ENUM (
  'ilkokul_3', 'ilkokul_4',
  'ortaokul_5', 'ortaokul_6', 'ortaokul_7', 'ortaokul_8',
  'lise_9', 'lise_10', 'lise_11', 'lise_12',
  'universite', 'yetiskin'
);

-- Eğitim modülü kodları
CREATE TYPE module_code AS ENUM (
  'speed_control',     -- Hız Kontrolü
  'deep_comprehension', -- Derin Kavrama
  'attention_power',   -- Dikkat Gücü
  'mental_reset'       -- Zihinsel Sıfırlama
);

-- Egzersiz tipleri
CREATE TYPE exercise_type AS ENUM (
  -- Speed Control
  'rsvp',              -- Hızlı ardışık görsel sunum
  'pacing',            -- Rehberli hız okuma
  'speed_burst',       -- Hız patlaması
  'chunking',          -- Kelime gruplama
  -- Deep Comprehension
  'main_idea',         -- Ana fikir çıkarma
  'detail_recall',     -- Detay hatırlama
  'inference',         -- Çıkarım yapma
  'critical_reading',  -- Eleştirel okuma
  -- Attention Power
  'focus_lock',        -- Odak kilitleme
  'distraction_resist',-- Dikkat dağıtıcıya direnç
  'sustained_focus',   -- Sürdürülmüş dikkat
  -- Mental Reset
  'breathing',         -- Nefes egzersizi
  'eye_relaxation',    -- Göz dinlendirme
  'focus_reset'        -- Odak sıfırlama
);

-- Oturum tipleri
CREATE TYPE session_type AS ENUM ('exercise', 'diagnostic', 'free_reading');

-- Tanılama tipleri
CREATE TYPE diagnostic_type AS ENUM ('initial', 'periodic', 'final');

-- Risk seviyeleri
CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high', 'critical');

-- Abonelik durumları
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'expired', 'trialing', 'past_due');

-- Ödeme döngüsü
CREATE TYPE billing_cycle AS ENUM ('monthly', 'yearly');

-- İçerik kategorileri (MEB müfredatı uyumlu)
CREATE TYPE content_category AS ENUM (
  'fen_bilimleri',
  'sosyal_bilgiler',
  'turkce_edebiyat',
  'tarih',
  'cografya',
  'felsefe',
  'matematik_mantik',
  'teknoloji',
  'guncel_olaylar',
  'saglik',
  'cevre',
  'kultur_sanat'
);

-- İçerik zorluk seviyeleri
CREATE TYPE content_difficulty AS ENUM ('cok_kolay', 'kolay', 'orta', 'zor', 'cok_zor');
```

---

## 2. CORE TABLOLAR

```sql
-- supabase/migrations/001_initial_schema.sql (devam)

-- =====================================================
-- STUDENTS — Ana öğrenci tablosu
-- (Her öğrenci Supabase Auth'ta da kayıtlı)
-- =====================================================
CREATE TABLE students (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id     UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id        UUID REFERENCES tenants(id) ON DELETE SET NULL,
  email            TEXT NOT NULL UNIQUE,
  full_name        TEXT NOT NULL,
  grade_level      grade_level NOT NULL DEFAULT 'lise_11',
  exam_target      exam_type NOT NULL DEFAULT 'tyt',
  
  -- Performans baseline (tanılama sonrası dolar)
  baseline_wpm     INTEGER DEFAULT 0,
  baseline_comprehension INTEGER DEFAULT 0,   -- 0-100
  baseline_arp     NUMERIC(10,2) DEFAULT 0,
  
  -- Güncel performans (her session sonrası güncellenir)
  current_wpm      INTEGER DEFAULT 0,
  current_comprehension INTEGER DEFAULT 0,
  current_arp      NUMERIC(10,2) DEFAULT 0,
  growth_score     NUMERIC(5,2) DEFAULT 0,   -- % büyüme
  
  -- Gamification
  total_xp         INTEGER DEFAULT 0,
  level            INTEGER DEFAULT 1,
  streak_days      INTEGER DEFAULT 0,
  longest_streak   INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ,
  
  -- Durum
  is_active        BOOLEAN DEFAULT true,
  is_premium       BOOLEAN DEFAULT false,
  has_completed_diagnostic BOOLEAN DEFAULT false,
  
  -- B2B meta
  student_number   TEXT,                    -- Kurum öğrenci numarası
  
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- COGNITIVE_PROFILES — Bilişsel performans profili
-- (Her 5 session'da otomatik güncellenir)
-- =====================================================
CREATE TABLE cognitive_profiles (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id            UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  
  -- ARP bileşenleri
  sustainable_wpm       INTEGER DEFAULT 0,
  peak_wpm              INTEGER DEFAULT 0,
  comprehension_baseline NUMERIC(5,2) DEFAULT 0,
  
  -- KPI metrikleri
  rei                   NUMERIC(10,2) DEFAULT 0,  -- Okuma Verimliliği
  csf                   NUMERIC(5,4) DEFAULT 0,   -- Bilişsel Stabilite (0-1)
  arp                   NUMERIC(10,2) DEFAULT 0,  -- Ana KPI
  stability_index       NUMERIC(5,4) DEFAULT 0,   -- Tutarlılık (0-1)
  
  -- Alt beceriler (0-100 ölçeği)
  speed_skill           INTEGER DEFAULT 0,
  comprehension_skill   INTEGER DEFAULT 0,
  attention_skill       INTEGER DEFAULT 0,
  fatigue_resistance    INTEGER DEFAULT 0,
  
  -- Zayıf nokta tespiti
  primary_weakness      module_code,
  secondary_weakness    module_code,
  recommended_focus     module_code,
  
  -- Meta
  session_count         INTEGER DEFAULT 0,
  last_calculated_at    TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(student_id)  -- Her öğrencinin tek profili
);
```

---

## 3. MULTI-TENANT TABLOLAR

```sql
-- supabase/migrations/002_multi_tenant.sql

-- =====================================================
-- TENANTS — Kurumlar (Okul, Dershane)
-- =====================================================
CREATE TABLE tenants (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type              tenant_type NOT NULL DEFAULT 'school',
  name              TEXT NOT NULL,
  slug              TEXT NOT NULL UNIQUE,  -- URL-safe isim
  
  -- Abonelik
  tier              tenant_tier NOT NULL DEFAULT 'starter',
  max_students      INTEGER NOT NULL DEFAULT 50,
  used_students     INTEGER DEFAULT 0,
  
  -- Sözleşme
  contract_start    DATE,
  contract_end      DATE,
  trial_ends_at     TIMESTAMPTZ,
  is_trial          BOOLEAN DEFAULT true,
  
  -- Fatura
  tax_id            TEXT,                  -- Vergi kimlik no
  billing_address   JSONB DEFAULT '{}',
  monthly_revenue   NUMERIC(10,2) DEFAULT 0,
  
  -- Durum
  is_active         BOOLEAN DEFAULT true,
  
  -- İletişim
  primary_email     TEXT NOT NULL,
  phone             TEXT,
  city              TEXT,
  
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TENANT_SETTINGS — Kurum yapılandırmaları
-- =====================================================
CREATE TABLE tenant_settings (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id             UUID NOT NULL UNIQUE REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Özellik toggle'ları
  ai_enabled            BOOLEAN DEFAULT true,
  ai_monthly_budget_usd NUMERIC(8,2) DEFAULT 10.00,
  leaderboard_enabled   BOOLEAN DEFAULT true,
  pdf_upload_enabled    BOOLEAN DEFAULT false,
  
  -- Eğitim sınırları
  max_daily_minutes     INTEGER DEFAULT 60,
  min_session_minutes   INTEGER DEFAULT 5,
  
  -- Sınav hedefleri (kurum geneli varsayılan)
  default_exam_target   exam_type DEFAULT 'tyt',
  allowed_exam_types    exam_type[] DEFAULT '{lgs,tyt,ayt,kpss}',
  
  -- Gamification seviyesi
  gamification_level    INTEGER DEFAULT 2 CHECK (gamification_level BETWEEN 0 AND 3),
  -- 0: Kapalı, 1: Minimal, 2: Standart, 3: Tam
  
  -- Marka özelleştirme (Enterprise)
  custom_logo_url       TEXT,
  primary_color         TEXT DEFAULT '#6366F1',
  
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TENANT_ADMINS — Kurum yöneticileri
-- =====================================================
CREATE TABLE tenant_admins (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  auth_user_id      UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email             TEXT NOT NULL UNIQUE,
  full_name         TEXT NOT NULL,
  is_primary        BOOLEAN DEFAULT false,  -- Baş yönetici
  permissions       JSONB DEFAULT '{
    "manage_students": true,
    "view_reports": true,
    "manage_settings": false,
    "export_data": true
  }',
  last_login_at     TIMESTAMPTZ,
  is_active         BOOLEAN DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SUPER_ADMINS — Sprinta ekibi (sadece bu tabloda)
-- =====================================================
CREATE TABLE super_admins (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id      UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email             TEXT NOT NULL UNIQUE,
  full_name         TEXT NOT NULL,
  is_active         BOOLEAN DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. EĞİTİM & İÇERİK TABLOLAR

```sql
-- =====================================================
-- CONTENT_LIBRARY — Okuma metinleri
-- =====================================================
CREATE TABLE content_library (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- İçerik kimliği
  title             TEXT NOT NULL,
  body              TEXT NOT NULL,
  source            TEXT,              -- Kaynak (MEB, kitap adı, vb.)
  
  -- Sınıflandırma
  category          content_category NOT NULL,
  difficulty        content_difficulty NOT NULL,
  exam_types        exam_type[] DEFAULT '{}',   -- Hangi sınavlar için
  grade_levels      grade_level[] DEFAULT '{}', -- Hangi sınıflar için
  
  -- Metrikleri (hesaplanmış)
  word_count        INTEGER NOT NULL,
  avg_word_length   NUMERIC(4,2) DEFAULT 0,
  flesch_score      NUMERIC(5,2) DEFAULT 0,     -- Okunabilirlik skoru
  estimated_wpm_target INTEGER DEFAULT 200,     -- Bu metni okumak için hedef WPM
  
  -- Sorular (JSON array)
  questions         JSONB DEFAULT '[]',
  -- Her soru: { id, type: 'main_idea'|'detail'|'inference', text, options: [...], answer_index, explanation }
  
  -- Meta
  is_published      BOOLEAN DEFAULT true,
  is_exam_approved  BOOLEAN DEFAULT false,  -- MEB uyumluluğu onayı
  created_by        UUID REFERENCES super_admins(id),
  
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- EXERCISES — Egzersiz tanımları
-- =====================================================
CREATE TABLE exercises (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_code       module_code NOT NULL,
  exercise_type     exercise_type NOT NULL,
  name              TEXT NOT NULL,
  description       TEXT NOT NULL,
  instructions      TEXT NOT NULL,          -- Kullanıcıya gösterilecek yönergeler
  
  -- Zorluk skalası
  min_difficulty    INTEGER DEFAULT 1 CHECK (min_difficulty BETWEEN 1 AND 10),
  max_difficulty    INTEGER DEFAULT 10 CHECK (max_difficulty BETWEEN 1 AND 10),
  default_difficulty INTEGER DEFAULT 5,
  
  -- Süre
  min_duration_seconds INTEGER DEFAULT 60,
  max_duration_seconds INTEGER DEFAULT 300,
  default_duration_seconds INTEGER DEFAULT 120,
  
  -- Hedefler
  target_exam_types exam_type[] DEFAULT '{}',
  min_grade_level   grade_level DEFAULT 'ortaokul_5',
  
  -- Konfigürasyon (egzersiz tipine göre değişir)
  config_schema     JSONB DEFAULT '{}',
  -- Örnek RSVP için: { wpm_range: [150, 600], highlight_chunks: true }
  
  xp_base          INTEGER DEFAULT 10,
  is_premium        BOOLEAN DEFAULT false,
  is_active         BOOLEAN DEFAULT true,
  
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SESSIONS — Egzersiz oturumları (ana veri tablosu)
-- =====================================================
CREATE TABLE sessions (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id          UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  exercise_id         UUID NOT NULL REFERENCES exercises(id),
  content_id          UUID REFERENCES content_library(id),
  
  -- Oturum bilgileri
  session_type        session_type NOT NULL DEFAULT 'exercise',
  started_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at        TIMESTAMPTZ,
  duration_seconds    INTEGER DEFAULT 0,
  is_completed        BOOLEAN DEFAULT false,
  
  -- Performans metrikleri (JSONB — esneklik)
  metrics             JSONB NOT NULL DEFAULT '{}',
  -- Tüm egzersizler için ortak alanlar:
  -- { wpm, comprehension, accuracy, score, difficulty_level,
  --   error_count, regression_count, fatigue_index,
  --   response_times_ms: [...] }
  
  -- Hesaplanan KPI'ler
  rei                 NUMERIC(10,2) DEFAULT 0,
  csf                 NUMERIC(5,4) DEFAULT 0,
  arp                 NUMERIC(10,2) DEFAULT 0,
  xp_earned           INTEGER DEFAULT 0,
  
  -- Engine çıktısı
  fatigue_level       TEXT DEFAULT 'fresh',  -- fresh|mild|moderate|fatigued|exhausted
  suggested_difficulty INTEGER,
  
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- DIAGNOSTICS — Tanılama test sonuçları
-- =====================================================
CREATE TABLE diagnostics (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id            UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  diagnostic_type       diagnostic_type NOT NULL DEFAULT 'initial',
  
  -- Tanılama metrikleri
  baseline_wpm          INTEGER NOT NULL,
  baseline_comprehension INTEGER NOT NULL,   -- 0-100
  baseline_arp          NUMERIC(10,2) NOT NULL,
  
  -- Alt test sonuçları
  speed_test_wpm        INTEGER,
  comprehension_score   INTEGER,
  attention_score       INTEGER,
  
  -- Profil tespitleri
  primary_weakness      module_code,
  secondary_weakness    module_code,
  recommended_path      TEXT,              -- Önerilen başlangıç modülü açıklaması
  
  -- AI analizi
  ai_summary            TEXT,             -- Claude Haiku'nun yorumu
  
  completed_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 5. PERFORMANS & ANALYTICS TABLOLAR

```sql
-- =====================================================
-- DAILY_STATS — Günlük istatistik özeti (öğrenci bazlı)
-- =====================================================
CREATE TABLE daily_stats (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id          UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date                DATE NOT NULL,
  
  -- Günlük aktivite
  sessions_count      INTEGER DEFAULT 0,
  total_minutes       INTEGER DEFAULT 0,
  exercises_completed INTEGER DEFAULT 0,
  
  -- Günlük performans
  avg_wpm             INTEGER DEFAULT 0,
  avg_comprehension   INTEGER DEFAULT 0,
  avg_arp             NUMERIC(10,2) DEFAULT 0,
  xp_earned           INTEGER DEFAULT 0,
  
  -- Hedef takibi
  daily_goal_minutes  INTEGER DEFAULT 30,
  goal_completed      BOOLEAN DEFAULT false,
  
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, date)
);

-- =====================================================
-- TENANT_DAILY_STATS — Kurum günlük özeti (dashboard için)
-- =====================================================
CREATE TABLE tenant_daily_stats (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id             UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  date                  DATE NOT NULL,
  
  -- Kullanım
  total_students        INTEGER DEFAULT 0,
  active_students       INTEGER DEFAULT 0,    -- O gün kullanan
  total_sessions        INTEGER DEFAULT 0,
  total_minutes         INTEGER DEFAULT 0,
  
  -- Performans ortalamaları
  avg_wpm               INTEGER DEFAULT 0,
  avg_comprehension     INTEGER DEFAULT 0,
  avg_arp               NUMERIC(10,2) DEFAULT 0,
  avg_growth_score      NUMERIC(5,2) DEFAULT 0,
  
  -- Risk tespiti
  at_risk_count         INTEGER DEFAULT 0,
  critical_risk_count   INTEGER DEFAULT 0,
  
  -- En iyi gelişim gösterenler (JSON array)
  top_improvers         JSONB DEFAULT '[]',
  -- [{ student_id, name, growth_percent }]
  
  UNIQUE(tenant_id, date)
);

-- =====================================================
-- STUDENT_RISK_SCORES — Risk analizi
-- =====================================================
CREATE TABLE student_risk_scores (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id            UUID NOT NULL UNIQUE REFERENCES students(id) ON DELETE CASCADE,
  tenant_id             UUID REFERENCES tenants(id) ON DELETE CASCADE,
  
  risk_level            risk_level NOT NULL DEFAULT 'low',
  risk_score            INTEGER DEFAULT 0,   -- 0-100
  
  -- Risk faktörleri (hangileri aktif)
  risk_factors          JSONB DEFAULT '{}',
  -- {
  --   arp_drop: boolean,          -- ARP %20+ düştü
  --   streak_broken: boolean,     -- 7+ günlük seri bozuldu
  --   inactivity_7days: boolean,  -- 7 gün hareketsiz
  --   low_focus: boolean,         -- Odak < %40
  --   low_completion: boolean     -- 14 günde 10 egzersiz altı
  -- }
  
  recommendation        TEXT,               -- Admin için öneri
  last_activity_date    DATE,
  last_calculated_at    TIMESTAMPTZ DEFAULT NOW(),
  
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- FATIGUE_LOGS — Yorgunluk kayıtları
-- =====================================================
CREATE TABLE fatigue_logs (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id        UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  session_id        UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  
  fatigue_score     INTEGER NOT NULL,    -- 0-100
  fatigue_level     TEXT NOT NULL,       -- fresh|mild|moderate|fatigued|exhausted
  break_recommended BOOLEAN DEFAULT false,
  
  recorded_at       TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 6. GAMIFICATION TABLOLAR

```sql
-- =====================================================
-- BADGES — Rozet tanımları
-- =====================================================
CREATE TABLE badges (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code              TEXT NOT NULL UNIQUE,
  name              TEXT NOT NULL,
  description       TEXT NOT NULL,
  icon_name         TEXT NOT NULL,    -- Expo vector icon adı
  color             TEXT DEFAULT '#6366F1',
  
  -- Kazanma koşulları
  category          TEXT NOT NULL,   -- streak|speed|comprehension|milestone|special
  rarity            TEXT DEFAULT 'common',  -- common|rare|epic|legendary
  condition_type    TEXT NOT NULL,   -- 'streak_days'|'arp_reach'|'sessions_count' vb.
  condition_value   INTEGER NOT NULL,
  
  xp_reward         INTEGER DEFAULT 50,
  is_active         BOOLEAN DEFAULT true
);

-- =====================================================
-- STUDENT_BADGES — Öğrencinin kazandığı rozetler
-- =====================================================
CREATE TABLE student_badges (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id        UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  badge_id          UUID NOT NULL REFERENCES badges(id),
  earned_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(student_id, badge_id)
);

-- =====================================================
-- SUBSCRIPTIONS — Bireysel (B2C) abonelikler
-- =====================================================
CREATE TABLE subscriptions (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id            UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  
  status                subscription_status NOT NULL DEFAULT 'trialing',
  plan                  TEXT NOT NULL DEFAULT 'free',  -- 'free'|'premium_monthly'|'premium_yearly'
  billing_cycle         billing_cycle,
  
  -- RevenueCat
  revenuecat_id         TEXT UNIQUE,
  
  -- Tarihler
  current_period_start  TIMESTAMPTZ,
  current_period_end    TIMESTAMPTZ,
  trial_ends_at         TIMESTAMPTZ,
  cancelled_at          TIMESTAMPTZ,
  
  -- Fiyat
  amount                NUMERIC(10,2),
  currency              TEXT DEFAULT 'TRY',
  
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(student_id)  -- Her öğrencinin tek aboneliği
);
```

---

## 7. RLS HELPER FONKSİYONLAR

```sql
-- supabase/migrations/003_rls_policies.sql

-- Mevcut kullanıcının student ID'sini döndür
CREATE OR REPLACE FUNCTION public.get_student_id()
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT id FROM students
    WHERE auth_user_id = auth.uid()
    LIMIT 1
  );
END;
$$;

-- Mevcut kullanıcının tenant ID'sini döndür
CREATE OR REPLACE FUNCTION public.get_tenant_id()
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT tenant_id FROM students
    WHERE auth_user_id = auth.uid()
    LIMIT 1
  );
END;
$$;

-- Mevcut kullanıcının tenant_admin mi olduğunu kontrol et
CREATE OR REPLACE FUNCTION public.is_tenant_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM tenant_admins
    WHERE auth_user_id = auth.uid() AND is_active = true
  );
END;
$$;

-- Mevcut kullanıcının super_admin mi olduğunu kontrol et
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM super_admins
    WHERE auth_user_id = auth.uid() AND is_active = true
  );
END;
$$;

-- Tenant admin'in yönettiği tenant ID'sini döndür
CREATE OR REPLACE FUNCTION public.get_admin_tenant_id()
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT tenant_id FROM tenant_admins
    WHERE auth_user_id = auth.uid() AND is_active = true
    LIMIT 1
  );
END;
$$;
```

---

## 8. RLS POLİTİKALARI

```sql
-- RLS'yi etkinleştir
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE cognitive_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostics ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_risk_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_library ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STUDENTS politikaları
-- =====================================================
CREATE POLICY "student_select_own" ON students
  FOR SELECT USING (auth_user_id = auth.uid());

CREATE POLICY "student_update_own" ON students
  FOR UPDATE USING (auth_user_id = auth.uid());

CREATE POLICY "tenant_admin_select_students" ON students
  FOR SELECT USING (
    public.is_tenant_admin() AND
    tenant_id = public.get_admin_tenant_id()
  );

CREATE POLICY "super_admin_all" ON students
  FOR ALL USING (public.is_super_admin());

-- =====================================================
-- SESSIONS politikaları
-- =====================================================
CREATE POLICY "student_select_own_sessions" ON sessions
  FOR SELECT USING (student_id = public.get_student_id());

CREATE POLICY "student_insert_own_sessions" ON sessions
  FOR INSERT WITH CHECK (student_id = public.get_student_id());

CREATE POLICY "tenant_admin_select_sessions" ON sessions
  FOR SELECT USING (
    public.is_tenant_admin() AND
    student_id IN (
      SELECT id FROM students WHERE tenant_id = public.get_admin_tenant_id()
    )
  );

CREATE POLICY "super_admin_all_sessions" ON sessions
  FOR ALL USING (public.is_super_admin());

-- =====================================================
-- TENANTS politikaları
-- =====================================================
CREATE POLICY "tenant_admin_select_own_tenant" ON tenants
  FOR SELECT USING (
    id = public.get_admin_tenant_id() OR public.is_super_admin()
  );

CREATE POLICY "super_admin_all_tenants" ON tenants
  FOR ALL USING (public.is_super_admin());

-- =====================================================
-- CONTENT_LIBRARY politikaları
-- =====================================================
-- Yayınlanmış içerikleri herkes okuyabilir
CREATE POLICY "published_content_readable" ON content_library
  FOR SELECT USING (is_published = true);

-- Sadece super admin yönetebilir
CREATE POLICY "super_admin_manage_content" ON content_library
  FOR ALL USING (public.is_super_admin());

-- =====================================================
-- COGNITIVE_PROFILES politikaları
-- =====================================================
CREATE POLICY "student_own_profile" ON cognitive_profiles
  FOR ALL USING (student_id = public.get_student_id());

CREATE POLICY "tenant_admin_view_profiles" ON cognitive_profiles
  FOR SELECT USING (
    public.is_tenant_admin() AND
    student_id IN (
      SELECT id FROM students WHERE tenant_id = public.get_admin_tenant_id()
    )
  );

CREATE POLICY "super_admin_all_profiles" ON cognitive_profiles
  FOR ALL USING (public.is_super_admin());
```

---

## 9. İNDEXLER

```sql
-- supabase/migrations/005_indexes.sql

-- Students
CREATE INDEX idx_students_auth_user ON students(auth_user_id);
CREATE INDEX idx_students_tenant ON students(tenant_id);
CREATE INDEX idx_students_exam_target ON students(exam_target);
CREATE INDEX idx_students_arp ON students(current_arp DESC);

-- Sessions
CREATE INDEX idx_sessions_student ON sessions(student_id);
CREATE INDEX idx_sessions_created ON sessions(created_at DESC);
CREATE INDEX idx_sessions_student_created ON sessions(student_id, created_at DESC);
CREATE INDEX idx_sessions_type ON sessions(session_type);

-- Daily Stats
CREATE INDEX idx_daily_stats_student_date ON daily_stats(student_id, date DESC);
CREATE INDEX idx_tenant_daily_stats ON tenant_daily_stats(tenant_id, date DESC);

-- Content Library
CREATE INDEX idx_content_category ON content_library(category);
CREATE INDEX idx_content_difficulty ON content_library(difficulty);
CREATE INDEX idx_content_published ON content_library(is_published);
CREATE INDEX idx_content_fulltext ON content_library USING gin(to_tsvector('turkish', body));

-- Risk Scores
CREATE INDEX idx_risk_tenant ON student_risk_scores(tenant_id, risk_level);
CREATE INDEX idx_risk_student ON student_risk_scores(student_id);

-- Tenant Admins
CREATE INDEX idx_tenant_admins_auth ON tenant_admins(auth_user_id);
CREATE INDEX idx_tenant_admins_tenant ON tenant_admins(tenant_id);
```

---

## 10. TRİGGERLAR

```sql
-- supabase/migrations/004_functions_triggers.sql

-- updated_at otomatik güncellemesi
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Kurum öğrenci sayısı güncelleme
CREATE OR REPLACE FUNCTION update_tenant_student_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.tenant_id IS NOT NULL THEN
    UPDATE tenants SET used_students = used_students + 1
    WHERE id = NEW.tenant_id;
  ELSIF TG_OP = 'DELETE' AND OLD.tenant_id IS NOT NULL THEN
    UPDATE tenants SET used_students = GREATEST(0, used_students - 1)
    WHERE id = OLD.tenant_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER tenant_student_count_trigger
  AFTER INSERT OR DELETE ON students
  FOR EACH ROW EXECUTE FUNCTION update_tenant_student_count();

-- Session sonrası öğrenci istatistiklerini güncelle
CREATE OR REPLACE FUNCTION update_student_after_session()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.is_completed = true THEN
    UPDATE students SET
      current_wpm = (NEW.metrics->>'wpm')::INTEGER,
      current_comprehension = (NEW.metrics->>'comprehension')::INTEGER,
      current_arp = NEW.arp,
      total_xp = total_xp + NEW.xp_earned,
      last_activity_at = NOW(),
      growth_score = CASE
        WHEN baseline_arp > 0 THEN
          ROUND(((NEW.arp - baseline_arp) / baseline_arp * 100)::NUMERIC, 2)
        ELSE 0
      END
    WHERE id = NEW.student_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER session_completed_trigger
  AFTER INSERT OR UPDATE ON sessions
  FOR EACH ROW
  WHEN (NEW.is_completed = true)
  EXECUTE FUNCTION update_student_after_session();
```

---

## 11. SEED VERİSİ

```sql
-- supabase/migrations/006_seed_data.sql

-- Egzersiz tanımları
INSERT INTO exercises (module_code, exercise_type, name, description, instructions, default_difficulty, xp_base, is_premium) VALUES
-- Speed Control
('speed_control', 'rsvp', 'Flash Okuma', 'Kelimeler hızla ekranda belirir', 'Ekranda beliren kelimeleri takip et. Anlamaya çalış, WPM artıkça zorluk artar.', 5, 15, false),
('speed_control', 'chunking', 'Kelime Gruplama', 'Metni kelime grupları halinde oku', '2-3 kelimelik gruplara odaklan, aralarındaki boşluklarda gözünü durdur.', 4, 12, false),
('speed_control', 'pacing', 'Rehberli Okuma', 'Işıklı rehber ile hızlı okuma', 'Ekrandaki ışığı takip ederek oku. Geri dönme, ileriye devam et.', 3, 10, false),
('speed_control', 'speed_burst', 'Hız Patlaması', '30 saniyelik yoğun hız sprinti', '30 saniye boyunca mümkün olan en hızlı şekilde oku.', 7, 20, true),

-- Deep Comprehension
('deep_comprehension', 'main_idea', 'Ana Fikir Avı', 'Paragrafın ana fikrini bul', 'Metni oku ve en iyi ana fikri yansıtan seçeneği işaretle.', 4, 15, false),
('deep_comprehension', 'detail_recall', 'Detay Hafızası', 'Metin detaylarını hatırla', 'Metni okuduktan sonra ekranı kapat, soruları yanıtla.', 5, 15, false),
('deep_comprehension', 'inference', 'Çıkarım Ustası', 'Metinden çıkarım yap', 'Yazarın ima ettiği fikirleri sorgulayan soruları yanıtla.', 7, 20, true),
('deep_comprehension', 'critical_reading', 'Eleştirel Okuma', 'Metni analitik oku', 'Yazarın amacını, kullandığı kanıtları ve tutarsızlıkları tespit et.', 8, 25, true),

-- Attention Power
('attention_power', 'focus_lock', 'Odak Kilidi', 'Dikkat dağıtıcılara rağmen odaklan', 'Arka planda hareket ederken metni oku ve soruları yanıtla.', 5, 15, false),
('attention_power', 'sustained_focus', 'Sürdürülmüş Dikkat', '5 dakika tam konsantrasyon', '5 dakika boyunca hiç ara vermeden oku.', 6, 20, false),
('attention_power', 'distraction_resist', 'Dikkat Kalkanı', 'Bildirim simulasyonlarına direnç', 'Ekranda çıkan dikkat dağıtıcılara rağmen okumaya devam et.', 7, 20, true),

-- Mental Reset
('mental_reset', 'breathing', '4-7-8 Nefes', 'Stres azaltıcı nefes egzersizi', '4 say nefes al, 7 say tut, 8 say bırak. 4 kez tekrarla.', 2, 10, false),
('mental_reset', 'eye_relaxation', 'Göz Dinlendirme', 'Göz kaslarını gevşet', 'Ekrandan uzaklaş, uzağa bak, göz kaslarını gevşet.', 1, 8, false),
('mental_reset', 'focus_reset', 'Zihin Sıfırlama', 'Konsantrasyonu yenile', 'Kısa meditasyon ve odak tekrarlama egzersizi.', 3, 12, false);

-- Rozet tanımları
INSERT INTO badges (code, name, description, icon_name, color, category, rarity, condition_type, condition_value, xp_reward) VALUES
('first_session', 'İlk Adım', 'İlk egzersizini tamamladın!', 'play-circle', '#10B981', 'milestone', 'common', 'sessions_count', 1, 50),
('streak_3', '3 Günlük Seri', '3 gün üst üste çalıştın', 'flame', '#F59E0B', 'streak', 'common', 'streak_days', 3, 100),
('streak_7', 'Haftalık Şampiyon', '7 gün kesintisiz çalışma', 'flame', '#EF4444', 'streak', 'rare', 'streak_days', 7, 250),
('streak_30', 'Aylık Efsane', '30 gün kesintisiz!', 'trophy', '#8B5CF6', 'streak', 'epic', 'streak_days', 30, 1000),
('arp_200', 'ARP 200', 'ARP değerin 200''e ulaştı', 'trending-up', '#6366F1', 'speed', 'common', 'arp_reach', 200, 200),
('arp_300', 'ARP 300', 'Üst düzey okuma performansı', 'trending-up', '#EC4899', 'speed', 'rare', 'arp_reach', 300, 500),
('sessions_10', '10 Egzersiz', '10 egzersiz tamamladın', 'check-circle', '#10B981', 'milestone', 'common', 'sessions_count', 10, 150),
('sessions_50', '50 Egzersiz', '50 egzersiz tamamladın', 'star', '#F59E0B', 'milestone', 'rare', 'sessions_count', 50, 400),
('sessions_100', 'Yüzlük Kulüp', '100 egzersiz tamamladın', 'award', '#EF4444', 'milestone', 'epic', 'sessions_count', 100, 1000),
('comprehension_90', 'Anlama Uzmanı', 'Anlama oranı %90''a ulaştı', 'brain', '#8B5CF6', 'comprehension', 'rare', 'comprehension_reach', 90, 300),
('diagnostic_complete', 'Kendini Tanı', 'Tanılama testini tamamladın', 'clipboard', '#06B6D4', 'milestone', 'common', 'diagnostic', 1, 100);
```

---

## ✅ FAZ 02 TAMAMLANMA KRİTERLERİ

```bash
# Supabase sıfırla ve test et
supabase db reset

# Kontroller
supabase db lint                      # ✅ Hata yok
psql -c "\dt" sprinta                 # ✅ Tüm tablolar var

# Tablo sayısı kontrolü
# students, cognitive_profiles, tenants, tenant_settings, tenant_admins,
# super_admins, content_library, exercises, sessions, diagnostics,
# daily_stats, tenant_daily_stats, student_risk_scores, fatigue_logs,
# badges, student_badges, subscriptions
# Toplam: 17 tablo ✅

# RLS testi (Supabase Studio > Authentication > Policies)
# ✅ Her tabloda policy var
# ✅ Student sadece kendi verisini görüyor
# ✅ Tenant admin sadece kendi kurumunu görüyor
# ✅ Super admin her şeyi görüyor
```
