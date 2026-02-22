-- =====================================================
-- 007_gamification.sql
-- Streak güncelleme + seviye hesaplama fonksiyonları
-- =====================================================

-- =====================================================
-- Streak güncelleme (session sonrası çağrılır)
-- =====================================================
CREATE OR REPLACE FUNCTION update_student_streak(p_student_id UUID)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_last_activity DATE;
  v_today         DATE := CURRENT_DATE;
  v_new_streak    INTEGER;
BEGIN
  SELECT last_activity_at::DATE INTO v_last_activity
  FROM students WHERE id = p_student_id;

  IF v_last_activity IS NULL OR v_last_activity < v_today - INTERVAL '1 day' THEN
    -- Seri kırıldı veya hiç oynanmamış → sıfırdan başla
    v_new_streak := 1;
  ELSIF v_last_activity = v_today - INTERVAL '1 day' THEN
    -- Dün oynamış → seri devam
    SELECT streak_days + 1 INTO v_new_streak FROM students WHERE id = p_student_id;
  ELSE
    -- Bugün zaten oynamış → değişme
    SELECT streak_days INTO v_new_streak FROM students WHERE id = p_student_id;
  END IF;

  UPDATE students
  SET streak_days      = v_new_streak,
      last_activity_at = NOW()
  WHERE id = p_student_id;

  RETURN v_new_streak;
END;
$$;

-- =====================================================
-- XP'ye göre seviye hesapla
-- Level eşikleri: L1=0, L2=200, L3=550, L4=1050...
-- Formül: her level için +150 XP eklenir
-- =====================================================
CREATE OR REPLACE FUNCTION calculate_level(p_xp INTEGER)
RETURNS INTEGER LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  v_level      INTEGER := 1;
  v_threshold  INTEGER := 0;
  v_increment  INTEGER := 200;
BEGIN
  LOOP
    v_threshold := v_threshold + v_increment;
    IF p_xp < v_threshold THEN
      RETURN v_level;
    END IF;
    v_level    := v_level + 1;
    v_increment := v_increment + 150;
    EXIT WHEN v_level >= 20;
  END LOOP;
  RETURN 20; -- max seviye
END;
$$;

-- =====================================================
-- Rozet kazanıldıktan sonra XP ver
-- =====================================================
CREATE OR REPLACE FUNCTION award_badge_xp()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_xp_reward INTEGER;
BEGIN
  SELECT xp_reward INTO v_xp_reward FROM badges WHERE id = NEW.badge_id;

  IF v_xp_reward > 0 THEN
    UPDATE students
    SET total_xp = total_xp + v_xp_reward,
        level    = calculate_level(total_xp + v_xp_reward)
    WHERE id = NEW.student_id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER badge_xp_trigger
  AFTER INSERT ON student_badges
  FOR EACH ROW EXECUTE FUNCTION award_badge_xp();

-- =====================================================
-- Session tamamlanınca seviyeyi güncelle
-- =====================================================
CREATE OR REPLACE FUNCTION sync_student_level()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.level := calculate_level(NEW.total_xp);
  RETURN NEW;
END;
$$;

CREATE TRIGGER sync_level_trigger
  BEFORE UPDATE OF total_xp ON students
  FOR EACH ROW EXECUTE FUNCTION sync_student_level();
