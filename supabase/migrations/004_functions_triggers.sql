-- =====================================================
-- 004_functions_triggers.sql
-- Triggerlar ve yardımcı fonksiyonlar
-- =====================================================

-- =====================================================
-- Auth sonrası otomatik öğrenci profili oluştur (B2C)
-- =====================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_full_name TEXT;
  v_exam_target exam_type;
  v_grade_level grade_level;
BEGIN
  v_full_name    := COALESCE(NEW.raw_user_meta_data->>'full_name', 'Öğrenci');
  v_exam_target  := COALESCE((NEW.raw_user_meta_data->>'exam_target')::exam_type, 'tyt');
  v_grade_level  := COALESCE((NEW.raw_user_meta_data->>'grade_level')::grade_level, 'lise_11');

  IF NEW.raw_user_meta_data->>'role' IS NULL OR
     NEW.raw_user_meta_data->>'role' = 'student' THEN

    INSERT INTO students (auth_user_id, email, full_name, exam_target, grade_level)
    VALUES (NEW.id, NEW.email, v_full_name, v_exam_target, v_grade_level)
    ON CONFLICT (auth_user_id) DO NOTHING;

    INSERT INTO cognitive_profiles (student_id)
    SELECT id FROM students WHERE auth_user_id = NEW.id
    ON CONFLICT (student_id) DO NOTHING;

  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- updated_at otomatik güncelleme
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_settings_updated_at
  BEFORE UPDATE ON tenant_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_risk_scores_updated_at
  BEFORE UPDATE ON student_risk_scores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Kurum öğrenci sayısı güncelleme
-- =====================================================
CREATE OR REPLACE FUNCTION update_tenant_student_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.tenant_id IS NOT NULL THEN
    UPDATE tenants SET used_students = used_students + 1
    WHERE id = NEW.tenant_id;
  ELSIF TG_OP = 'DELETE' AND OLD.tenant_id IS NOT NULL THEN
    UPDATE tenants SET used_students = GREATEST(0, used_students - 1)
    WHERE id = OLD.tenant_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER tenant_student_count_trigger
  AFTER INSERT OR DELETE ON students
  FOR EACH ROW EXECUTE FUNCTION update_tenant_student_count();

-- =====================================================
-- Session tamamlanınca öğrenci istatistiklerini güncelle
-- =====================================================
CREATE OR REPLACE FUNCTION update_student_after_session()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.is_completed = true THEN
    UPDATE students SET
      current_wpm           = COALESCE((NEW.metrics->>'wpm')::INTEGER, current_wpm),
      current_comprehension = COALESCE((NEW.metrics->>'comprehension')::INTEGER, current_comprehension),
      current_arp           = NEW.arp,
      total_xp              = total_xp + NEW.xp_earned,
      last_activity_at      = NOW(),
      growth_score          = CASE
        WHEN baseline_arp > 0 THEN
          ROUND(((NEW.arp - baseline_arp) / baseline_arp * 100)::NUMERIC, 2)
        ELSE 0
      END
    WHERE id = NEW.student_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER session_completed_trigger
  AFTER INSERT OR UPDATE ON sessions
  FOR EACH ROW
  WHEN (NEW.is_completed = true)
  EXECUTE FUNCTION update_student_after_session();

-- =====================================================
-- Tanılama tamamlanınca baseline'ı güncelle
-- =====================================================
CREATE OR REPLACE FUNCTION update_student_baseline_after_diagnostic()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.diagnostic_type = 'initial' THEN
    UPDATE students SET
      baseline_wpm           = NEW.baseline_wpm,
      baseline_comprehension = NEW.baseline_comprehension,
      baseline_arp           = NEW.baseline_arp,
      current_wpm            = NEW.baseline_wpm,
      current_comprehension  = NEW.baseline_comprehension,
      current_arp            = NEW.baseline_arp,
      has_completed_diagnostic = true
    WHERE id = NEW.student_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER diagnostic_baseline_trigger
  AFTER INSERT ON diagnostics
  FOR EACH ROW EXECUTE FUNCTION update_student_baseline_after_diagnostic();

-- =====================================================
-- Yeni tenant için otomatik settings oluştur
-- =====================================================
CREATE OR REPLACE FUNCTION create_default_tenant_settings()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO tenant_settings (tenant_id)
  VALUES (NEW.id)
  ON CONFLICT (tenant_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER auto_create_tenant_settings
  AFTER INSERT ON tenants
  FOR EACH ROW EXECUTE FUNCTION create_default_tenant_settings();

-- =====================================================
-- Günlük istatistik upsert (session pipeline'dan çağrılır)
-- =====================================================
CREATE OR REPLACE FUNCTION upsert_daily_stats(
  p_student_id       UUID,
  p_date             DATE,
  p_xp_earned        INTEGER,
  p_duration_seconds INTEGER,
  p_arp              INTEGER
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_minutes INTEGER := GREATEST(1, ROUND(p_duration_seconds / 60.0));
BEGIN
  INSERT INTO daily_stats (
    student_id,
    date,
    sessions_count,
    total_minutes,
    exercises_completed,
    xp_earned,
    avg_arp
  ) VALUES (
    p_student_id,
    p_date,
    1,
    v_minutes,
    1,
    p_xp_earned,
    p_arp
  )
  ON CONFLICT (student_id, date) DO UPDATE SET
    sessions_count      = daily_stats.sessions_count + 1,
    total_minutes       = daily_stats.total_minutes + v_minutes,
    exercises_completed = daily_stats.exercises_completed + 1,
    xp_earned           = daily_stats.xp_earned + p_xp_earned,
    avg_arp             = ROUND(
                            (daily_stats.avg_arp * daily_stats.sessions_count + p_arp) /
                            (daily_stats.sessions_count + 1)
                          );
END;
$$;
