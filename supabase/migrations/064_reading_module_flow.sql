-- 064_reading_module_flow.sql
-- reading_mode_sessions tablosuna ReadingModuleFlow için yeni sütunlar ekle

ALTER TABLE reading_mode_sessions
  ADD COLUMN IF NOT EXISTS module_key          text,
  ADD COLUMN IF NOT EXISTS comprehension_score int     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS correct_answers     int     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_questions     int     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS library_text_id     uuid    REFERENCES text_library(id) ON DELETE SET NULL;

-- Eski mode sütunu null yapılabilir (hem eski hem yeni format desteklensin)
ALTER TABLE reading_mode_sessions
  ALTER COLUMN mode DROP NOT NULL;

-- İndeks
CREATE INDEX IF NOT EXISTS idx_rms_module_key ON reading_mode_sessions (student_id, module_key);
CREATE INDEX IF NOT EXISTS idx_rms_library_text ON reading_mode_sessions (library_text_id);
