-- ================================================================
-- 030_reading_mode_sessions.sql
-- 8 okuma modu oturum tablosu
-- ================================================================

CREATE TABLE IF NOT EXISTS reading_mode_sessions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id       uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  mode             text NOT NULL,
  avg_wpm          int  NOT NULL DEFAULT 0,
  total_words      int  NOT NULL DEFAULT 0,
  duration_seconds int  NOT NULL DEFAULT 0,
  arp_score        numeric(10,2) NOT NULL DEFAULT 0,
  xp_earned        int  NOT NULL DEFAULT 0,
  completion_ratio numeric(5,4)  NOT NULL DEFAULT 0,
  created_at       timestamptz   DEFAULT now()
);

ALTER TABLE reading_mode_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY rms_select ON reading_mode_sessions
  FOR SELECT TO authenticated
  USING (
    student_id IN (
      SELECT id FROM students WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY rms_insert ON reading_mode_sessions
  FOR INSERT TO authenticated
  WITH CHECK (
    student_id IN (
      SELECT id FROM students WHERE auth_user_id = auth.uid()
    )
  );

CREATE INDEX idx_rms_student ON reading_mode_sessions (student_id, created_at DESC);
