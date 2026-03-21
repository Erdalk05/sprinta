-- 072_analysis_cache.sql
-- analyze-student-performance sonuçlarını önbelleğe alır

CREATE TABLE IF NOT EXISTS analysis_cache (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid        REFERENCES auth.users(id) ON DELETE CASCADE,
  result     jsonb       NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analysis_cache_student
  ON analysis_cache (student_id, created_at DESC);

ALTER TABLE analysis_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "analysis_cache_select_own"
  ON analysis_cache FOR SELECT
  USING (auth.uid() = student_id);
