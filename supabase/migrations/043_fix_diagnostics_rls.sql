-- ================================================================
-- 043_fix_diagnostics_rls.sql
-- Diagnostics RLS güvenilirlik düzeltmesi
--
-- Sorun: get_student_id() NULL döndürüğünde RLS INSERT başarısız.
-- Neden: students tablosu yoksa (trigger çalışmadıysa) veya
--         AsyncStorage'da eski UUID varsa.
-- Çözüm: get_or_create_student_id() — öğrenci kaydı yoksa oluşturur.
-- ================================================================

-- ── Öğrenciyi getir ya da oluştur (SECURITY DEFINER = RLS bypass) ──
CREATE OR REPLACE FUNCTION public.get_or_create_student_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id   UUID;
  v_student   UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN RETURN NULL; END IF;

  -- Önce mevcut kaydı bul
  SELECT id INTO v_student
    FROM students WHERE auth_user_id = v_user_id LIMIT 1;

  -- Kayıt yoksa oluştur (trigger çalışmadıysa fallback)
  IF v_student IS NULL THEN
    INSERT INTO students (auth_user_id, email, full_name, exam_target, grade_level)
    SELECT
      v_user_id,
      u.email,
      COALESCE(u.raw_user_meta_data->>'full_name', 'Öğrenci'),
      COALESCE((u.raw_user_meta_data->>'exam_target')::exam_type, 'tyt'),
      COALESCE((u.raw_user_meta_data->>'grade_level')::grade_level, 'lise_11')
    FROM auth.users u
    WHERE u.id = v_user_id
    ON CONFLICT (auth_user_id) DO NOTHING
    RETURNING id INTO v_student;

    -- Çakışma durumunda tekrar bul
    IF v_student IS NULL THEN
      SELECT id INTO v_student
        FROM students WHERE auth_user_id = v_user_id LIMIT 1;
    END IF;

    -- cognitive_profiles kaydı da oluştur
    IF v_student IS NOT NULL THEN
      INSERT INTO cognitive_profiles (student_id)
      VALUES (v_student)
      ON CONFLICT (student_id) DO NOTHING;
    END IF;
  END IF;

  RETURN v_student;
END;
$$;

-- ── Diagnostics tablosu INSERT politikasını güncelle ──
-- Eski çakışan politikaları temizle
DROP POLICY IF EXISTS "student_own_diagnostics"       ON diagnostics;
DROP POLICY IF EXISTS "student_insert_own_diagnostics" ON diagnostics;
DROP POLICY IF EXISTS "tenant_admin_view_diagnostics"  ON diagnostics;
DROP POLICY IF EXISTS "super_admin_all_diagnostics"    ON diagnostics;

-- SELECT: kendi tanılama kayıtları
CREATE POLICY "diag_select_own" ON diagnostics
  FOR SELECT
  USING (student_id = public.get_student_id());

-- INSERT: get_or_create kullanarak güvenilir kimlik doğrulama
CREATE POLICY "diag_insert_own" ON diagnostics
  FOR INSERT TO authenticated
  WITH CHECK (student_id = public.get_or_create_student_id());

-- UPDATE: kendi kayıtları
CREATE POLICY "diag_update_own" ON diagnostics
  FOR UPDATE
  USING (student_id = public.get_student_id())
  WITH CHECK (student_id = public.get_student_id());

-- Kurum yöneticisi görüntüleme
CREATE POLICY "diag_tenant_admin_view" ON diagnostics
  FOR SELECT
  USING (
    public.is_tenant_admin()
    AND student_id IN (
      SELECT id FROM students WHERE tenant_id = public.get_admin_tenant_id()
    )
  );

-- Süper admin tam erişim
CREATE POLICY "diag_super_admin" ON diagnostics
  FOR ALL
  USING (public.is_super_admin());
