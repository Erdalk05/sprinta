-- ================================================================
-- 032_reading_streak_trigger.sql
-- reading_mode_sessions INSERT → streak + daily_stats güncelle
-- ================================================================

-- ── 1. Trigger fonksiyonu ─────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_reading_session_completed()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_today       DATE := CURRENT_DATE;
  v_duration_m  INT  := GREATEST(1, ROUND(NEW.duration_seconds::NUMERIC / 60));
  v_goal_min    INT  := 15;  -- varsayılan günlük hedef
BEGIN
  -- Streak güncelle
  PERFORM update_student_streak(NEW.student_id);

  -- Günlük hedefi students tablosundan çek (varsa)
  -- (Şimdilik 15 dk sabit; ileride student_settings eklenince dinamik olur)

  -- daily_stats upsert
  INSERT INTO daily_stats (
    student_id,
    date,
    total_minutes,
    daily_goal_minutes,
    goal_completed,
    xp_earned,
    sessions_count
  )
  VALUES (
    NEW.student_id,
    v_today,
    v_duration_m,
    v_goal_min,
    (v_duration_m >= v_goal_min),
    NEW.xp_earned,
    1
  )
  ON CONFLICT (student_id, date) DO UPDATE SET
    total_minutes    = daily_stats.total_minutes + EXCLUDED.total_minutes,
    xp_earned        = daily_stats.xp_earned    + EXCLUDED.xp_earned,
    sessions_count   = daily_stats.sessions_count + 1,
    goal_completed   = (daily_stats.total_minutes + EXCLUDED.total_minutes)
                         >= COALESCE(daily_stats.daily_goal_minutes, v_goal_min);

  RETURN NEW;
END;
$$;

-- ── 2. Trigger ────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_reading_session_completed ON reading_mode_sessions;

CREATE TRIGGER trg_reading_session_completed
  AFTER INSERT ON reading_mode_sessions
  FOR EACH ROW EXECUTE FUNCTION fn_reading_session_completed();
