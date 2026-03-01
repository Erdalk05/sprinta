-- ================================================================
-- 026_text_questions.sql
-- Sprint 10: Embedded Questions — metne gömülü sorular
-- ================================================================

CREATE TABLE IF NOT EXISTS text_questions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text_id        uuid NOT NULL REFERENCES text_library(id) ON DELETE CASCADE,
  chapter_id     uuid REFERENCES text_chapters(id) ON DELETE CASCADE,
  question_type  text NOT NULL CHECK (
    question_type IN ('main_idea','inference','detail','vocabulary','tone')
  ),
  question_text  text NOT NULL,
  options        jsonb NOT NULL,         -- ["A) ...", "B) ...", "C) ...", "D) ..."]
  correct_index  int  NOT NULL CHECK (correct_index BETWEEN 0 AND 3),
  explanation    text,
  difficulty     int  DEFAULT 3 CHECK (difficulty BETWEEN 1 AND 5),
  order_index    int  DEFAULT 0,
  created_at     timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_questions_text    ON text_questions(text_id);
CREATE INDEX IF NOT EXISTS idx_questions_chapter ON text_questions(chapter_id);

-- Tüm authenticate kullanıcılar okuyabilir (sorular herkese açık)
ALTER TABLE text_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "questions_read"
  ON text_questions FOR SELECT TO authenticated
  USING (true);

-- Admin / editor yazabilir
CREATE POLICY "questions_write"
  ON text_questions FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.auth_user_id = auth.uid()
        AND students.role IN ('admin', 'editor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.auth_user_id = auth.uid()
        AND students.role IN ('admin', 'editor')
    )
  );
