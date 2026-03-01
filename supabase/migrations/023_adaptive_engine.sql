-- =====================================================
-- 023_adaptive_engine.sql
-- Sprint 7: Adaptive Intelligence & Performance Layer
-- =====================================================

-- ── 1. Bölüm bazlı okuma oturumu ─────────────────────
CREATE TABLE IF NOT EXISTS user_chapter_sessions (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid        NOT NULL
                               REFERENCES auth.users(id) ON DELETE CASCADE,
  text_id          uuid        NOT NULL
                               REFERENCES text_library(id) ON DELETE CASCADE,
  chapter_id       uuid        NOT NULL
                               REFERENCES text_chapters(id) ON DELETE CASCADE,
  started_at       timestamptz NOT NULL DEFAULT now(),
  completed_at     timestamptz,
  duration_seconds int         NOT NULL DEFAULT 0
                               CHECK (duration_seconds >= 0),
  completion_ratio float       NOT NULL DEFAULT 0
                               CHECK (completion_ratio BETWEEN 0 AND 1),
  avg_scroll_speed float,
  xp_earned        int         NOT NULL DEFAULT 0
                               CHECK (xp_earned >= 0 AND xp_earned <= 200)
);

CREATE INDEX IF NOT EXISTS idx_chapter_sessions_user
  ON user_chapter_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chapter_sessions_text
  ON user_chapter_sessions(text_id);
CREATE INDEX IF NOT EXISTS idx_chapter_sessions_chapter
  ON user_chapter_sessions(chapter_id);
CREATE INDEX IF NOT EXISTS idx_chapter_sessions_user_time
  ON user_chapter_sessions(user_id, started_at DESC);

ALTER TABLE user_chapter_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chapter_sessions_select"
  ON user_chapter_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "chapter_sessions_insert"
  ON user_chapter_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- UPDATE ve DELETE yok.

-- ── 2. XP ve level kolonları (IF NOT EXISTS — zaten varsa no-op) ─
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS xp    int NOT NULL DEFAULT 0
                                 CHECK (xp >= 0);
-- level zaten mevcut; no-op
-- (001_initial_schema.sql'de tanımlandı)

-- ── 3. Adaptif zorluk profili ─────────────────────────
CREATE TABLE IF NOT EXISTS user_difficulty_profile (
  user_id             uuid  PRIMARY KEY
                            REFERENCES auth.users(id) ON DELETE CASCADE,
  avg_wpm             float NOT NULL DEFAULT 0,
  avg_completion      float NOT NULL DEFAULT 0
                            CHECK (avg_completion BETWEEN 0 AND 1),
  difficulty_score    float NOT NULL DEFAULT 0
                            CHECK (difficulty_score BETWEEN 0 AND 1),
  recommended_level   int   NOT NULL DEFAULT 1
                            CHECK (recommended_level BETWEEN 1 AND 5),
  sessions_analyzed   int   NOT NULL DEFAULT 0,
  updated_at          timestamptz DEFAULT now()
);

ALTER TABLE user_difficulty_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "difficulty_profile_own"
  ON user_difficulty_profile FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── 4. increment_xp — atomik XP artışı ───────────────
-- Supabase JS .update() aritmetik desteklemez → RPC kullanılır
-- SECURITY DEFINER ile çalışır, race condition yoktur
CREATE OR REPLACE FUNCTION increment_xp(
  p_user_id   uuid,
  p_xp_amount int
)
RETURNS TABLE(new_xp int, new_level int)
LANGUAGE plpgsql
SECURITY DEFINER AS $$
DECLARE
  v_new_xp    int;
  v_new_level int;
BEGIN
  -- total_xp + level atomik UPDATE → yarış koşulu yok
  UPDATE students
  SET
    total_xp = total_xp + p_xp_amount,
    level    = GREATEST(1, FLOOR((total_xp + p_xp_amount)::float / 500) + 1)
  WHERE auth_user_id = p_user_id
  RETURNING total_xp, level
  INTO v_new_xp, v_new_level;

  RETURN QUERY SELECT v_new_xp, v_new_level;
END;
$$;

-- ── 5. Drop-off analytics view (admin only) ──────────
CREATE OR REPLACE VIEW chapter_dropoff_analytics AS
SELECT
  tc.id                                                         AS chapter_id,
  tc.title                                                      AS chapter_title,
  tc.chapter_number,
  tl.id                                                         AS text_id,
  tl.title                                                      AS text_title,
  COUNT(ucs.id)                                                 AS total_sessions,
  COUNT(ucs.id) FILTER (WHERE ucs.completion_ratio < 0.5)      AS drop_off_count,
  ROUND(
    (COUNT(ucs.id) FILTER (WHERE ucs.completion_ratio < 0.5))::numeric
    / NULLIF(COUNT(ucs.id), 0) * 100, 1
  )                                                             AS drop_off_pct,
  ROUND((AVG(ucs.completion_ratio) * 100)::numeric, 1)         AS avg_completion_pct,
  ROUND((AVG(ucs.duration_seconds) / 60.0)::numeric, 1)        AS avg_duration_min
FROM user_chapter_sessions ucs
JOIN text_chapters tc ON tc.id = ucs.chapter_id
JOIN text_library  tl ON tl.id = ucs.text_id
GROUP BY tc.id, tc.title, tc.chapter_number, tl.id, tl.title
ORDER BY drop_off_count DESC;

-- ── 6. Readers over time view (admin charts, son 30 gün) ─
CREATE OR REPLACE VIEW readers_over_time AS
SELECT
  DATE_TRUNC('day', started_at)::date AS reading_date,
  COUNT(DISTINCT user_id)             AS unique_readers,
  COUNT(*)                            AS total_sessions
FROM user_chapter_sessions
WHERE started_at >= now() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', started_at)::date
ORDER BY reading_date ASC;
