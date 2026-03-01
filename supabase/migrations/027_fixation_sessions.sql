-- ================================================================
-- 027_fixation_sessions.sql
-- Sprint 11: Göz Genişliği (Visual Span) Antrenman Oturumları
-- ================================================================

CREATE TABLE IF NOT EXISTS fixation_sessions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  span_level     int  NOT NULL CHECK (span_level BETWEEN 1 AND 5),
  correct_count  int  NOT NULL DEFAULT 0,
  total_count    int  NOT NULL CHECK (total_count > 0),
  accuracy       numeric(5,4) NOT NULL,          -- 0.0000 – 1.0000
  effective_wpm  int  NOT NULL DEFAULT 0,
  new_span_level int  NOT NULL CHECK (new_span_level BETWEEN 1 AND 5),
  xp_earned      int  NOT NULL DEFAULT 0,
  duration_ms    int  NOT NULL DEFAULT 0,
  created_at     timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fixation_user       ON fixation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_fixation_created_at ON fixation_sessions(user_id, created_at DESC);

ALTER TABLE fixation_sessions ENABLE ROW LEVEL SECURITY;

-- Kullanıcı sadece kendi verilerini okur/yazar
CREATE POLICY "fixation_owner"
  ON fixation_sessions FOR ALL TO authenticated
  USING  (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
