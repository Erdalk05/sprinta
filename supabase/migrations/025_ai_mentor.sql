-- ================================================================
-- 025_ai_mentor.sql
-- Sprint 9: AI Academic Mentor — geri bildirim tablosu
-- ================================================================

-- ── Mentor geri bildirim tablosu ────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_mentor_feedback (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feedback_text      text NOT NULL,
  key_insight        text NOT NULL,
  action_items       jsonb NOT NULL DEFAULT '[]',
  improvement_focus  text NOT NULL
    CHECK (improvement_focus IN ('inference','detail','speed_control','vocabulary','consistency')),
  weak_skill         text,
  risk_level         int,
  session_count      int DEFAULT 0,
  seen_at            timestamptz,
  generated_at       timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mentor_feedback_user
  ON ai_mentor_feedback(user_id, generated_at DESC);

ALTER TABLE ai_mentor_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mentor_feedback_own"
  ON ai_mentor_feedback
  FOR ALL
  TO authenticated
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
