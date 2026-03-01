-- =====================================================
-- 024_exam_intelligence.sql
-- Sprint 8: Comprehension & Exam Intelligence Engine
-- =====================================================

-- ── 1. User Question Sessions ─────────────────────
CREATE TABLE IF NOT EXISTS user_question_sessions (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid        NOT NULL
                                    REFERENCES auth.users(id) ON DELETE CASCADE,
  text_id               uuid        NOT NULL
                                    REFERENCES text_library(id) ON DELETE CASCADE,
  chapter_id            uuid
                                    REFERENCES text_chapters(id) ON DELETE SET NULL,
  question_id           uuid        NOT NULL,
  question_type         text        NOT NULL CHECK (
    question_type IN ('main_idea', 'inference', 'detail', 'vocabulary', 'tone')
  ),
  is_correct            boolean     NOT NULL,
  response_time_seconds int         CHECK (response_time_seconds >= 0),
  created_at            timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_question_sessions_user
  ON user_question_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_question_sessions_type
  ON user_question_sessions(question_type);
CREATE INDEX IF NOT EXISTS idx_question_sessions_user_time
  ON user_question_sessions(user_id, created_at DESC);

ALTER TABLE user_question_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "question_sessions_select"
  ON user_question_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "question_sessions_insert"
  ON user_question_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ── 2. User Exam Profile ───────────────────────────
CREATE TABLE IF NOT EXISTS user_exam_profile (
  user_id               uuid    PRIMARY KEY
                                REFERENCES auth.users(id) ON DELETE CASCADE,
  main_idea_accuracy    float   NOT NULL DEFAULT 0
                                CHECK (main_idea_accuracy BETWEEN 0 AND 1),
  inference_accuracy    float   NOT NULL DEFAULT 0
                                CHECK (inference_accuracy BETWEEN 0 AND 1),
  detail_accuracy       float   NOT NULL DEFAULT 0
                                CHECK (detail_accuracy BETWEEN 0 AND 1),
  vocabulary_accuracy   float   NOT NULL DEFAULT 0
                                CHECK (vocabulary_accuracy BETWEEN 0 AND 1),
  tone_accuracy         float   NOT NULL DEFAULT 0
                                CHECK (tone_accuracy BETWEEN 0 AND 1),
  avg_response_time     float   NOT NULL DEFAULT 0,
  risk_level            int     NOT NULL DEFAULT 1
                                CHECK (risk_level BETWEEN 1 AND 5),
  updated_at            timestamptz DEFAULT now()
);

ALTER TABLE user_exam_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "exam_profile_own"
  ON user_exam_profile FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── 3. skill_focus kolonu text_library ─────────────
ALTER TABLE text_library
  ADD COLUMN IF NOT EXISTS skill_focus text
  CHECK (skill_focus IN ('balanced', 'inference', 'detail', 'vocabulary'));

-- ── 4. Admin view: soru tipi başarı oranları ────────
CREATE OR REPLACE VIEW exam_accuracy_by_type AS
SELECT
  question_type,
  COUNT(*)                                                          AS total_questions,
  COUNT(*) FILTER (WHERE is_correct)                                AS correct_count,
  ROUND(
    (COUNT(*) FILTER (WHERE is_correct))::numeric
    / NULLIF(COUNT(*), 0) * 100, 1
  )                                                                 AS accuracy_pct,
  ROUND(AVG(response_time_seconds)::numeric, 1)                     AS avg_response_sec
FROM user_question_sessions
GROUP BY question_type
ORDER BY accuracy_pct ASC;

-- ── 5. Admin view: risk seviyesi dağılımı ──────────
CREATE OR REPLACE VIEW risk_distribution AS
SELECT
  risk_level,
  COUNT(*) AS student_count
FROM user_exam_profile
GROUP BY risk_level
ORDER BY risk_level ASC;
