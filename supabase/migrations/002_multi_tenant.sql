-- =====================================================
-- 002_multi_tenant.sql
-- Tenant tablolar + Eğitim + Analytics + Gamification
-- =====================================================

-- =====================================================
-- TENANTS
-- =====================================================
CREATE TABLE tenants (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type              tenant_type NOT NULL DEFAULT 'school',
  name              TEXT NOT NULL,
  slug              TEXT NOT NULL UNIQUE,

  tier              tenant_tier NOT NULL DEFAULT 'starter',
  max_students      INTEGER NOT NULL DEFAULT 50,
  used_students     INTEGER DEFAULT 0,

  contract_start    DATE,
  contract_end      DATE,
  trial_ends_at     TIMESTAMPTZ,
  is_trial          BOOLEAN DEFAULT true,

  tax_id            TEXT,
  billing_address   JSONB DEFAULT '{}',
  monthly_revenue   NUMERIC(10,2) DEFAULT 0,

  is_active         BOOLEAN DEFAULT true,

  primary_email     TEXT NOT NULL,
  phone             TEXT,
  city              TEXT,

  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- students.tenant_id için FK ekle (tenants oluşturulduktan sonra)
ALTER TABLE students
  ADD CONSTRAINT fk_students_tenant
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL;

-- =====================================================
-- TENANT_SETTINGS
-- =====================================================
CREATE TABLE tenant_settings (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id             UUID NOT NULL UNIQUE REFERENCES tenants(id) ON DELETE CASCADE,

  ai_enabled            BOOLEAN DEFAULT true,
  ai_monthly_budget_usd NUMERIC(8,2) DEFAULT 10.00,
  leaderboard_enabled   BOOLEAN DEFAULT true,
  pdf_upload_enabled    BOOLEAN DEFAULT false,

  max_daily_minutes     INTEGER DEFAULT 60,
  min_session_minutes   INTEGER DEFAULT 5,

  default_exam_target   exam_type DEFAULT 'tyt',
  allowed_exam_types    exam_type[] DEFAULT '{lgs,tyt,ayt,kpss}',

  gamification_level    INTEGER DEFAULT 2 CHECK (gamification_level BETWEEN 0 AND 3),

  custom_logo_url       TEXT,
  primary_color         TEXT DEFAULT '#6366F1',

  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TENANT_ADMINS
-- =====================================================
CREATE TABLE tenant_admins (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  auth_user_id      UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email             TEXT NOT NULL UNIQUE,
  full_name         TEXT NOT NULL,
  is_primary        BOOLEAN DEFAULT false,
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
-- SUPER_ADMINS
-- =====================================================
CREATE TABLE super_admins (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id      UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email             TEXT NOT NULL UNIQUE,
  full_name         TEXT NOT NULL,
  is_active         BOOLEAN DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CONTENT_LIBRARY
-- =====================================================
CREATE TABLE content_library (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title                 TEXT NOT NULL,
  body                  TEXT NOT NULL,
  source                TEXT,

  category              content_category NOT NULL,
  difficulty            content_difficulty NOT NULL,
  exam_types            exam_type[] DEFAULT '{}',
  grade_levels          grade_level[] DEFAULT '{}',

  word_count            INTEGER NOT NULL,
  avg_word_length       NUMERIC(4,2) DEFAULT 0,
  flesch_score          NUMERIC(5,2) DEFAULT 0,
  estimated_wpm_target  INTEGER DEFAULT 200,

  questions             JSONB DEFAULT '[]',

  is_published          BOOLEAN DEFAULT true,
  is_exam_approved      BOOLEAN DEFAULT false,
  created_by            UUID REFERENCES super_admins(id),

  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- EXERCISES
-- =====================================================
CREATE TABLE exercises (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_code               module_code NOT NULL,
  exercise_type             exercise_type NOT NULL,
  name                      TEXT NOT NULL,
  description               TEXT NOT NULL,
  instructions              TEXT NOT NULL,

  min_difficulty            INTEGER DEFAULT 1 CHECK (min_difficulty BETWEEN 1 AND 10),
  max_difficulty            INTEGER DEFAULT 10 CHECK (max_difficulty BETWEEN 1 AND 10),
  default_difficulty        INTEGER DEFAULT 5,

  min_duration_seconds      INTEGER DEFAULT 60,
  max_duration_seconds      INTEGER DEFAULT 300,
  default_duration_seconds  INTEGER DEFAULT 120,

  target_exam_types         exam_type[] DEFAULT '{}',
  min_grade_level           grade_level DEFAULT 'ortaokul_5',

  config_schema             JSONB DEFAULT '{}',

  xp_base                   INTEGER DEFAULT 10,
  is_premium                BOOLEAN DEFAULT false,
  is_active                 BOOLEAN DEFAULT true,

  created_at                TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SESSIONS
-- =====================================================
CREATE TABLE sessions (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id          UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  exercise_id         UUID NOT NULL REFERENCES exercises(id),
  content_id          UUID REFERENCES content_library(id),

  session_type        session_type NOT NULL DEFAULT 'exercise',
  started_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at        TIMESTAMPTZ,
  duration_seconds    INTEGER DEFAULT 0,
  is_completed        BOOLEAN DEFAULT false,

  metrics             JSONB NOT NULL DEFAULT '{}',

  rei                 NUMERIC(10,2) DEFAULT 0,
  csf                 NUMERIC(5,4) DEFAULT 0,
  arp                 NUMERIC(10,2) DEFAULT 0,
  xp_earned           INTEGER DEFAULT 0,

  fatigue_level       TEXT DEFAULT 'fresh',
  suggested_difficulty INTEGER,

  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- DIAGNOSTICS
-- =====================================================
CREATE TABLE diagnostics (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id            UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  diagnostic_type       diagnostic_type NOT NULL DEFAULT 'initial',

  baseline_wpm          INTEGER NOT NULL,
  baseline_comprehension INTEGER NOT NULL,
  baseline_arp          NUMERIC(10,2) NOT NULL,

  speed_test_wpm        INTEGER,
  comprehension_score   INTEGER,
  attention_score       INTEGER,

  primary_weakness      module_code,
  secondary_weakness    module_code,
  recommended_path      TEXT,

  ai_summary            TEXT,

  completed_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- DAILY_STATS
-- =====================================================
CREATE TABLE daily_stats (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id          UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date                DATE NOT NULL,

  sessions_count      INTEGER DEFAULT 0,
  total_minutes       INTEGER DEFAULT 0,
  exercises_completed INTEGER DEFAULT 0,

  avg_wpm             INTEGER DEFAULT 0,
  avg_comprehension   INTEGER DEFAULT 0,
  avg_arp             NUMERIC(10,2) DEFAULT 0,
  xp_earned           INTEGER DEFAULT 0,

  daily_goal_minutes  INTEGER DEFAULT 30,
  goal_completed      BOOLEAN DEFAULT false,

  created_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, date)
);

-- =====================================================
-- TENANT_DAILY_STATS
-- =====================================================
CREATE TABLE tenant_daily_stats (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id             UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  date                  DATE NOT NULL,

  total_students        INTEGER DEFAULT 0,
  active_students       INTEGER DEFAULT 0,
  total_sessions        INTEGER DEFAULT 0,
  total_minutes         INTEGER DEFAULT 0,

  avg_wpm               INTEGER DEFAULT 0,
  avg_comprehension     INTEGER DEFAULT 0,
  avg_arp               NUMERIC(10,2) DEFAULT 0,
  avg_growth_score      NUMERIC(5,2) DEFAULT 0,

  at_risk_count         INTEGER DEFAULT 0,
  critical_risk_count   INTEGER DEFAULT 0,

  top_improvers         JSONB DEFAULT '[]',

  UNIQUE(tenant_id, date)
);

-- =====================================================
-- STUDENT_RISK_SCORES
-- =====================================================
CREATE TABLE student_risk_scores (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id            UUID NOT NULL UNIQUE REFERENCES students(id) ON DELETE CASCADE,
  tenant_id             UUID REFERENCES tenants(id) ON DELETE CASCADE,

  risk_level            risk_level NOT NULL DEFAULT 'low',
  risk_score            INTEGER DEFAULT 0,

  risk_factors          JSONB DEFAULT '{}',

  recommendation        TEXT,
  last_activity_date    DATE,
  last_calculated_at    TIMESTAMPTZ DEFAULT NOW(),

  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- FATIGUE_LOGS
-- =====================================================
CREATE TABLE fatigue_logs (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id        UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  session_id        UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,

  fatigue_score     INTEGER NOT NULL,
  fatigue_level     TEXT NOT NULL,
  break_recommended BOOLEAN DEFAULT false,

  recorded_at       TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- BADGES
-- =====================================================
CREATE TABLE badges (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code              TEXT NOT NULL UNIQUE,
  name              TEXT NOT NULL,
  description       TEXT NOT NULL,
  icon_name         TEXT NOT NULL,
  color             TEXT DEFAULT '#6366F1',

  category          TEXT NOT NULL,
  rarity            TEXT DEFAULT 'common',
  condition_type    TEXT NOT NULL,
  condition_value   INTEGER NOT NULL,

  xp_reward         INTEGER DEFAULT 50,
  is_active         BOOLEAN DEFAULT true
);

-- =====================================================
-- STUDENT_BADGES
-- =====================================================
CREATE TABLE student_badges (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id        UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  badge_id          UUID NOT NULL REFERENCES badges(id),
  earned_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(student_id, badge_id)
);

-- =====================================================
-- SUBSCRIPTIONS
-- =====================================================
CREATE TABLE subscriptions (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id            UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,

  status                subscription_status NOT NULL DEFAULT 'trialing',
  plan                  TEXT NOT NULL DEFAULT 'free',
  billing_cycle         billing_cycle,

  revenuecat_id         TEXT UNIQUE,

  current_period_start  TIMESTAMPTZ,
  current_period_end    TIMESTAMPTZ,
  trial_ends_at         TIMESTAMPTZ,
  cancelled_at          TIMESTAMPTZ,

  amount                NUMERIC(10,2),
  currency              TEXT DEFAULT 'TRY',

  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(student_id)
);
