-- ================================================================
-- 040_eye_training.sql
-- Kartal Gözü — Göz Antrenman Seans Kayıtları
-- ================================================================

CREATE TABLE IF NOT EXISTS eye_training_sessions (
  id                      uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id              uuid        NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  exercise_id             text        NOT NULL,
  category                text        NOT NULL
    CHECK (category IN ('saccadic', 'peripheral', 'tracking')),
  difficulty              int         NOT NULL CHECK (difficulty BETWEEN 1 AND 4),
  duration_seconds        int         NOT NULL,
  -- EyeMetrics alanları
  reaction_time_ms        numeric(10,2) NOT NULL DEFAULT 0,
  accuracy_percent        numeric(5,2)  NOT NULL DEFAULT 0,
  tracking_error_px       numeric(10,2) NOT NULL DEFAULT 0,
  visual_attention_score  numeric(5,2)  NOT NULL DEFAULT 0,
  saccadic_speed_estimate numeric(10,4) NOT NULL DEFAULT 0,
  task_completion_ms      numeric(12,2) NOT NULL DEFAULT 0,
  arp_contribution        numeric(5,2)  NOT NULL DEFAULT 0,
  -- Ek
  xp_earned               int         NOT NULL DEFAULT 0,
  is_boss                 boolean     NOT NULL DEFAULT false,
  created_at              timestamptz DEFAULT now()
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_eye_sessions_student
  ON eye_training_sessions(student_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_eye_sessions_exercise
  ON eye_training_sessions(student_id, exercise_id);

CREATE INDEX IF NOT EXISTS idx_eye_sessions_category
  ON eye_training_sessions(student_id, category, created_at DESC);

-- RLS
ALTER TABLE eye_training_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "eye_sessions_select"
  ON eye_training_sessions FOR SELECT TO authenticated
  USING (
    student_id = (SELECT id FROM students WHERE auth_user_id = auth.uid() LIMIT 1)
  );

CREATE POLICY "eye_sessions_insert"
  ON eye_training_sessions FOR INSERT TO authenticated
  WITH CHECK (
    student_id = (SELECT id FROM students WHERE auth_user_id = auth.uid() LIMIT 1)
  );
