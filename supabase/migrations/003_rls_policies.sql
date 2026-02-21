-- =====================================================
-- 003_rls_policies.sql
-- RLS Helper Fonksiyonlar + Row Level Security Politikaları
-- =====================================================

-- =====================================================
-- HELPER FONKSİYONLAR
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_student_id()
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT id FROM students
    WHERE auth_user_id = auth.uid()
    LIMIT 1
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_tenant_id()
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT tenant_id FROM students
    WHERE auth_user_id = auth.uid()
    LIMIT 1
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_tenant_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM tenant_admins
    WHERE auth_user_id = auth.uid() AND is_active = true
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM super_admins
    WHERE auth_user_id = auth.uid() AND is_active = true
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_admin_tenant_id()
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT tenant_id FROM tenant_admins
    WHERE auth_user_id = auth.uid() AND is_active = true
    LIMIT 1
  );
END;
$$;

-- =====================================================
-- RLS ETKINLEŞTIR
-- =====================================================
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE cognitive_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostics ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_risk_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE fatigue_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE super_admins ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STUDENTS POLİTİKALARI
-- =====================================================
CREATE POLICY "student_select_own" ON students
  FOR SELECT USING (auth_user_id = auth.uid());

CREATE POLICY "student_update_own" ON students
  FOR UPDATE USING (auth_user_id = auth.uid());

CREATE POLICY "tenant_admin_select_students" ON students
  FOR SELECT USING (
    public.is_tenant_admin() AND
    tenant_id = public.get_admin_tenant_id()
  );

CREATE POLICY "super_admin_all_students" ON students
  FOR ALL USING (public.is_super_admin());

-- =====================================================
-- COGNITIVE_PROFILES POLİTİKALARI
-- =====================================================
CREATE POLICY "student_own_profile" ON cognitive_profiles
  FOR ALL USING (student_id = public.get_student_id());

CREATE POLICY "tenant_admin_view_profiles" ON cognitive_profiles
  FOR SELECT USING (
    public.is_tenant_admin() AND
    student_id IN (
      SELECT id FROM students WHERE tenant_id = public.get_admin_tenant_id()
    )
  );

CREATE POLICY "super_admin_all_profiles" ON cognitive_profiles
  FOR ALL USING (public.is_super_admin());

-- =====================================================
-- SESSIONS POLİTİKALARI
-- =====================================================
CREATE POLICY "student_select_own_sessions" ON sessions
  FOR SELECT USING (student_id = public.get_student_id());

CREATE POLICY "student_insert_own_sessions" ON sessions
  FOR INSERT WITH CHECK (student_id = public.get_student_id());

CREATE POLICY "student_update_own_sessions" ON sessions
  FOR UPDATE USING (student_id = public.get_student_id());

CREATE POLICY "tenant_admin_select_sessions" ON sessions
  FOR SELECT USING (
    public.is_tenant_admin() AND
    student_id IN (
      SELECT id FROM students WHERE tenant_id = public.get_admin_tenant_id()
    )
  );

CREATE POLICY "super_admin_all_sessions" ON sessions
  FOR ALL USING (public.is_super_admin());

-- =====================================================
-- DIAGNOSTICS POLİTİKALARI
-- =====================================================
CREATE POLICY "student_own_diagnostics" ON diagnostics
  FOR ALL USING (student_id = public.get_student_id());

CREATE POLICY "tenant_admin_view_diagnostics" ON diagnostics
  FOR SELECT USING (
    public.is_tenant_admin() AND
    student_id IN (
      SELECT id FROM students WHERE tenant_id = public.get_admin_tenant_id()
    )
  );

CREATE POLICY "super_admin_all_diagnostics" ON diagnostics
  FOR ALL USING (public.is_super_admin());

-- =====================================================
-- DAILY_STATS POLİTİKALARI
-- =====================================================
CREATE POLICY "student_own_daily_stats" ON daily_stats
  FOR ALL USING (student_id = public.get_student_id());

CREATE POLICY "tenant_admin_view_daily_stats" ON daily_stats
  FOR SELECT USING (
    public.is_tenant_admin() AND
    student_id IN (
      SELECT id FROM students WHERE tenant_id = public.get_admin_tenant_id()
    )
  );

CREATE POLICY "super_admin_all_daily_stats" ON daily_stats
  FOR ALL USING (public.is_super_admin());

-- =====================================================
-- TENANTS POLİTİKALARI
-- =====================================================
CREATE POLICY "tenant_admin_select_own_tenant" ON tenants
  FOR SELECT USING (
    id = public.get_admin_tenant_id() OR public.is_super_admin()
  );

CREATE POLICY "super_admin_all_tenants" ON tenants
  FOR ALL USING (public.is_super_admin());

-- =====================================================
-- TENANT_SETTINGS POLİTİKALARI
-- =====================================================
CREATE POLICY "tenant_admin_manage_settings" ON tenant_settings
  FOR ALL USING (
    tenant_id = public.get_admin_tenant_id() OR public.is_super_admin()
  );

-- =====================================================
-- TENANT_ADMINS POLİTİKALARI
-- =====================================================
CREATE POLICY "tenant_admin_select_own" ON tenant_admins
  FOR SELECT USING (
    tenant_id = public.get_admin_tenant_id() OR public.is_super_admin()
  );

CREATE POLICY "super_admin_all_tenant_admins" ON tenant_admins
  FOR ALL USING (public.is_super_admin());

-- =====================================================
-- TENANT_DAILY_STATS POLİTİKALARI
-- =====================================================
CREATE POLICY "tenant_admin_view_tenant_stats" ON tenant_daily_stats
  FOR SELECT USING (
    tenant_id = public.get_admin_tenant_id() OR public.is_super_admin()
  );

CREATE POLICY "super_admin_all_tenant_stats" ON tenant_daily_stats
  FOR ALL USING (public.is_super_admin());

-- =====================================================
-- STUDENT_RISK_SCORES POLİTİKALARI
-- =====================================================
CREATE POLICY "student_view_own_risk" ON student_risk_scores
  FOR SELECT USING (student_id = public.get_student_id());

CREATE POLICY "tenant_admin_view_risk" ON student_risk_scores
  FOR SELECT USING (
    public.is_tenant_admin() AND
    tenant_id = public.get_admin_tenant_id()
  );

CREATE POLICY "super_admin_all_risk" ON student_risk_scores
  FOR ALL USING (public.is_super_admin());

-- =====================================================
-- STUDENT_BADGES POLİTİKALARI
-- =====================================================
CREATE POLICY "student_own_badges" ON student_badges
  FOR SELECT USING (student_id = public.get_student_id());

CREATE POLICY "super_admin_all_badges" ON student_badges
  FOR ALL USING (public.is_super_admin());

-- =====================================================
-- SUBSCRIPTIONS POLİTİKALARI
-- =====================================================
CREATE POLICY "student_own_subscription" ON subscriptions
  FOR SELECT USING (student_id = public.get_student_id());

CREATE POLICY "super_admin_all_subscriptions" ON subscriptions
  FOR ALL USING (public.is_super_admin());

-- =====================================================
-- CONTENT_LIBRARY POLİTİKALARI
-- =====================================================
CREATE POLICY "published_content_readable" ON content_library
  FOR SELECT USING (is_published = true);

CREATE POLICY "super_admin_manage_content" ON content_library
  FOR ALL USING (public.is_super_admin());

-- =====================================================
-- EXERCISES POLİTİKALARI
-- =====================================================
CREATE POLICY "exercises_readable_by_all" ON exercises
  FOR SELECT USING (is_active = true);

CREATE POLICY "super_admin_manage_exercises" ON exercises
  FOR ALL USING (public.is_super_admin());

-- =====================================================
-- BADGES POLİTİKALARI (tanım tablosu)
-- =====================================================
CREATE POLICY "badges_readable_by_all" ON badges
  FOR SELECT USING (is_active = true);

CREATE POLICY "super_admin_manage_badge_defs" ON badges
  FOR ALL USING (public.is_super_admin());

-- =====================================================
-- FATIGUE_LOGS POLİTİKALARI
-- =====================================================
CREATE POLICY "student_own_fatigue_logs" ON fatigue_logs
  FOR ALL USING (student_id = public.get_student_id());

CREATE POLICY "super_admin_all_fatigue_logs" ON fatigue_logs
  FOR ALL USING (public.is_super_admin());

-- =====================================================
-- SUPER_ADMINS POLİTİKALARI
-- =====================================================
CREATE POLICY "super_admin_view_self" ON super_admins
  FOR SELECT USING (auth_user_id = auth.uid());

CREATE POLICY "super_admin_all_super_admins" ON super_admins
  FOR ALL USING (public.is_super_admin());
