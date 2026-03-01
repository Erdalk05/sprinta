-- =====================================================
-- 022_ai_metadata.sql
-- Sprint 6: AI tarafından üretilen içerik metadata
-- =====================================================

CREATE TABLE IF NOT EXISTS text_ai_metadata (
  text_id       uuid        PRIMARY KEY REFERENCES text_library(id) ON DELETE CASCADE,
  ai_summary    text,
  ai_difficulty int         CHECK (ai_difficulty BETWEEN 1 AND 5),
  ai_keywords   text[]      DEFAULT '{}',
  ai_exam_tags  text[]      DEFAULT '{}',
  generated_at  timestamptz DEFAULT now(),
  model_used    text        DEFAULT 'claude-haiku-4-5-20251001'
);

ALTER TABLE text_ai_metadata ENABLE ROW LEVEL SECURITY;

-- Sadece admin ve editor okuyabilir / yazabilir
CREATE POLICY "ai_metadata_admin_editor"
  ON text_ai_metadata FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE auth_user_id = auth.uid()
        AND role IN ('admin', 'editor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE auth_user_id = auth.uid()
        AND role IN ('admin', 'editor')
    )
  );

CREATE INDEX IF NOT EXISTS idx_ai_metadata_text_id ON text_ai_metadata(text_id);
