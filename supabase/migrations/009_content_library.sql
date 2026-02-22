-- 009 — content_library iyileştirmeleri
-- content_library tablosu 002_multi_tenant.sql'de tanımlıdır.
-- Bu migration yalnızca eksik olan source_type sütununu ekler.

ALTER TABLE content_library
  ADD COLUMN IF NOT EXISTS source_type TEXT NOT NULL DEFAULT 'original';

-- Tam metin araması için GIN indeks (henüz yoksa)
CREATE INDEX IF NOT EXISTS idx_content_exam_types
  ON content_library USING GIN (exam_types);

CREATE INDEX IF NOT EXISTS idx_content_grade_levels
  ON content_library USING GIN (grade_levels);

CREATE INDEX IF NOT EXISTS idx_content_is_published
  ON content_library (is_published)
  WHERE is_published = true;
