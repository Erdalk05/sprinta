-- 069_db_hardening.sql
-- Veritabanı sağlamlaştırma: eksik FK, FULLTEXT index, composite index

-- ── 1. user_question_sessions.question_id → text_questions(id) FK ──────────
-- Silinmiş soruya dangling referans riskini önler.
ALTER TABLE user_question_sessions
  ADD CONSTRAINT fk_question_sessions_question
  FOREIGN KEY (question_id) REFERENCES text_questions(id) ON DELETE CASCADE;

-- ── 2. text_library.body FULLTEXT index ─────────────────────────────────────
-- searchTexts() ILIKE sorgusu tüm tabloyu tarıyordu (content_library'deki
-- index bu tablo için değildi). Türkçe full-text search aktif eder.
CREATE INDEX IF NOT EXISTS idx_text_library_fulltext
  ON text_library USING gin(to_tsvector('turkish', coalesce(body, '')));

-- ── 3. text_library composite index (exam_type, difficulty) ─────────────────
-- getTextsByFilters() sorgusunu (exam_type + difficulty filtresi) hızlandırır.
CREATE INDEX IF NOT EXISTS idx_text_library_exam_difficulty
  ON text_library(exam_type, difficulty);
