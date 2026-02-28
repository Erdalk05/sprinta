-- ============================================================
-- 016_star_gamification.sql
-- Isolated Stars + Streak gamification layer
-- Reversible: rollback at bottom
-- ============================================================

-- ─── TABLE: user_star_records ────────────────────────────────
CREATE TABLE IF NOT EXISTS user_star_records (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id  text        NOT NULL,
  stars_earned smallint    NOT NULL CHECK (stars_earned BETWEEN 0 AND 3),
  accuracy     numeric(5,2) NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_star_records_user_id    ON user_star_records(user_id);
CREATE INDEX IF NOT EXISTS idx_star_records_created_at ON user_star_records(created_at);

-- ─── TABLE: user_daily_progress ──────────────────────────────
CREATE TABLE IF NOT EXISTS user_daily_progress (
  id              uuid      PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid      NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date            date      NOT NULL,
  stars_today     smallint  NOT NULL DEFAULT 0,
  daily_completed boolean   NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_user_daily UNIQUE (user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_daily_progress_user_date ON user_daily_progress(user_id, date);

-- ─── TABLE: user_streaks ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_streaks (
  user_id          uuid  PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak   int   NOT NULL DEFAULT 0,
  longest_streak   int   NOT NULL DEFAULT 0,
  last_active_date date,
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- ─── TABLE: user_total_stats ──────────────────────────────────
CREATE TABLE IF NOT EXISTS user_total_stats (
  user_id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_stars     int  NOT NULL DEFAULT 0,
  total_sessions  int  NOT NULL DEFAULT 0,
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ─── RLS ──────────────────────────────────────────────────────
ALTER TABLE user_star_records   ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_daily_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks        ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_total_stats    ENABLE ROW LEVEL SECURITY;

-- Policies: each user accesses only their own rows
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_star_records' AND policyname = 'star_records_own'
  ) THEN
    CREATE POLICY star_records_own ON user_star_records
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_daily_progress' AND policyname = 'daily_progress_own'
  ) THEN
    CREATE POLICY daily_progress_own ON user_daily_progress
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_streaks' AND policyname = 'streaks_own'
  ) THEN
    CREATE POLICY streaks_own ON user_streaks
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_total_stats' AND policyname = 'total_stats_own'
  ) THEN
    CREATE POLICY total_stats_own ON user_total_stats
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ─── RPC: update_star_streak ──────────────────────────────────
-- Soft streak decay: missed day → floor(current / 2), NOT reset to 0
CREATE OR REPLACE FUNCTION update_star_streak(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_last   date;
  v_curr   int;
  v_long   int;
  v_today  date := CURRENT_DATE;
BEGIN
  SELECT current_streak, longest_streak, last_active_date
    INTO v_curr, v_long, v_last
    FROM user_streaks
    WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_active_date, updated_at)
    VALUES (p_user_id, 1, 1, v_today, now());
    RETURN;
  END IF;

  -- Already updated today — nothing to do
  IF v_last = v_today THEN RETURN; END IF;

  -- Consecutive day → extend
  IF v_last = v_today - INTERVAL '1 day' THEN
    v_curr := v_curr + 1;
  ELSE
    -- Missed day(s) → soft decay: floor(current / 2), minimum 1
    v_curr := GREATEST(1, v_curr / 2);
  END IF;

  v_long := GREATEST(v_long, v_curr);

  UPDATE user_streaks
    SET current_streak   = v_curr,
        longest_streak   = v_long,
        last_active_date = v_today,
        updated_at       = now()
    WHERE user_id = p_user_id;
END;
$$;

-- ============================================================
-- ROLLBACK (run manually if needed):
-- DROP TABLE IF EXISTS user_star_records    CASCADE;
-- DROP TABLE IF EXISTS user_daily_progress  CASCADE;
-- DROP TABLE IF EXISTS user_streaks         CASCADE;
-- DROP TABLE IF EXISTS user_total_stats     CASCADE;
-- DROP FUNCTION IF EXISTS update_star_streak(uuid);
-- ============================================================
