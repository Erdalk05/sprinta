-- =====================================================
-- 005_indexes.sql
-- Performans indexleri
-- =====================================================

-- Students
CREATE INDEX idx_students_auth_user    ON students(auth_user_id);
CREATE INDEX idx_students_tenant       ON students(tenant_id);
CREATE INDEX idx_students_exam_target  ON students(exam_target);
CREATE INDEX idx_students_arp          ON students(current_arp DESC);
CREATE INDEX idx_students_active       ON students(is_active) WHERE is_active = true;

-- Sessions
CREATE INDEX idx_sessions_student         ON sessions(student_id);
CREATE INDEX idx_sessions_created         ON sessions(created_at DESC);
CREATE INDEX idx_sessions_student_created ON sessions(student_id, created_at DESC);
CREATE INDEX idx_sessions_type            ON sessions(session_type);
CREATE INDEX idx_sessions_completed       ON sessions(is_completed) WHERE is_completed = true;

-- Daily Stats
CREATE INDEX idx_daily_stats_student_date ON daily_stats(student_id, date DESC);
CREATE INDEX idx_tenant_daily_stats       ON tenant_daily_stats(tenant_id, date DESC);

-- Content Library
CREATE INDEX idx_content_category  ON content_library(category);
CREATE INDEX idx_content_difficulty ON content_library(difficulty);
CREATE INDEX idx_content_published  ON content_library(is_published) WHERE is_published = true;
CREATE INDEX idx_content_fulltext   ON content_library
  USING gin(to_tsvector('turkish', body));

-- Risk Scores
CREATE INDEX idx_risk_tenant  ON student_risk_scores(tenant_id, risk_level);
CREATE INDEX idx_risk_student ON student_risk_scores(student_id);
CREATE INDEX idx_risk_level   ON student_risk_scores(risk_level);

-- Tenant Admins
CREATE INDEX idx_tenant_admins_auth   ON tenant_admins(auth_user_id);
CREATE INDEX idx_tenant_admins_tenant ON tenant_admins(tenant_id);

-- Cognitive Profiles
CREATE INDEX idx_cognitive_student ON cognitive_profiles(student_id);
CREATE INDEX idx_cognitive_arp     ON cognitive_profiles(arp DESC);

-- Student Badges
CREATE INDEX idx_student_badges_student ON student_badges(student_id);
CREATE INDEX idx_student_badges_badge   ON student_badges(badge_id);

-- Diagnostics
CREATE INDEX idx_diagnostics_student ON diagnostics(student_id);
CREATE INDEX idx_diagnostics_type    ON diagnostics(diagnostic_type);
