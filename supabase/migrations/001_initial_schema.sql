-- =====================================================
-- 001_initial_schema.sql
-- Extensions, ENUMs, Core Tablolar
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Kullanıcı rolleri
CREATE TYPE user_role AS ENUM ('super_admin', 'tenant_admin', 'student');

-- Kurum tipleri
CREATE TYPE tenant_type AS ENUM ('school', 'tutoring_center', 'individual');

-- Kurum abonelik paketleri
CREATE TYPE tenant_tier AS ENUM ('starter', 'professional', 'enterprise');

-- Sınav tipleri
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
  'speed_control',
  'deep_comprehension',
  'attention_power',
  'mental_reset'
);

-- Egzersiz tipleri
CREATE TYPE exercise_type AS ENUM (
  'rsvp',
  'pacing',
  'speed_burst',
  'chunking',
  'main_idea',
  'detail_recall',
  'inference',
  'critical_reading',
  'focus_lock',
  'distraction_resist',
  'sustained_focus',
  'breathing',
  'eye_relaxation',
  'focus_reset'
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

-- İçerik kategorileri
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

-- =====================================================
-- STUDENTS — Ana öğrenci tablosu
-- =====================================================
CREATE TABLE students (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id               UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id                  UUID,  -- REFERENCES tenants(id) sonradan eklenir
  email                      TEXT NOT NULL UNIQUE,
  full_name                  TEXT NOT NULL,
  grade_level                grade_level NOT NULL DEFAULT 'lise_11',
  exam_target                exam_type NOT NULL DEFAULT 'tyt',

  -- Performans baseline
  baseline_wpm               INTEGER DEFAULT 0,
  baseline_comprehension     INTEGER DEFAULT 0,
  baseline_arp               NUMERIC(10,2) DEFAULT 0,

  -- Güncel performans
  current_wpm                INTEGER DEFAULT 0,
  current_comprehension      INTEGER DEFAULT 0,
  current_arp                NUMERIC(10,2) DEFAULT 0,
  growth_score               NUMERIC(5,2) DEFAULT 0,

  -- Gamification
  total_xp                   INTEGER DEFAULT 0,
  level                      INTEGER DEFAULT 1,
  streak_days                INTEGER DEFAULT 0,
  longest_streak             INTEGER DEFAULT 0,
  last_activity_at           TIMESTAMPTZ,

  -- Durum
  is_active                  BOOLEAN DEFAULT true,
  is_premium                 BOOLEAN DEFAULT false,
  has_completed_diagnostic   BOOLEAN DEFAULT false,

  -- B2B meta
  student_number             TEXT,

  created_at                 TIMESTAMPTZ DEFAULT NOW(),
  updated_at                 TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- COGNITIVE_PROFILES
-- =====================================================
CREATE TABLE cognitive_profiles (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id                UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,

  sustainable_wpm           INTEGER DEFAULT 0,
  peak_wpm                  INTEGER DEFAULT 0,
  comprehension_baseline    NUMERIC(5,2) DEFAULT 0,

  rei                       NUMERIC(10,2) DEFAULT 0,
  csf                       NUMERIC(5,4) DEFAULT 0,
  arp                       NUMERIC(10,2) DEFAULT 0,
  stability_index           NUMERIC(5,4) DEFAULT 0,

  speed_skill               INTEGER DEFAULT 0,
  comprehension_skill       INTEGER DEFAULT 0,
  attention_skill           INTEGER DEFAULT 0,
  fatigue_resistance        INTEGER DEFAULT 0,

  primary_weakness          module_code,
  secondary_weakness        module_code,
  recommended_focus         module_code,

  session_count             INTEGER DEFAULT 0,
  last_calculated_at        TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(student_id)
);
