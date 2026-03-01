-- =====================================================
-- 021_content_extensions.sql
-- Sprint 6: text_library + text_chapters genişletme
-- Cover, description, versioning, triggers, analytics
-- =====================================================

-- ── 1. text_library ek kolonlar ──────────────────────
-- (status 020'de eklendi — IF NOT EXISTS güvenli)
ALTER TABLE text_library
  ADD COLUMN IF NOT EXISTS status       text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  ADD COLUMN IF NOT EXISTS cover_url    text,
  ADD COLUMN IF NOT EXISTS description  text,
  ADD COLUMN IF NOT EXISTS version      int NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS created_by   uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_by   uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS published_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at   timestamptz DEFAULT now();

-- ── 2. text_chapters ek kolonlar ─────────────────────
ALTER TABLE text_chapters
  ADD COLUMN IF NOT EXISTS status     text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published')),
  ADD COLUMN IF NOT EXISTS is_locked  boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS version    int NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- ── 3. text_library updated_at trigger ───────────────
CREATE OR REPLACE FUNCTION update_text_library_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_text_library_updated_at ON text_library;
CREATE TRIGGER trg_text_library_updated_at
  BEFORE UPDATE ON text_library
  FOR EACH ROW
  EXECUTE FUNCTION update_text_library_timestamp();

-- ── 4. text_chapters updated_at trigger ──────────────
CREATE OR REPLACE FUNCTION update_text_chapters_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_text_chapters_updated_at ON text_chapters;
CREATE TRIGGER trg_text_chapters_updated_at
  BEFORE UPDATE ON text_chapters
  FOR EACH ROW
  EXECUTE FUNCTION update_text_chapters_timestamp();

-- ── 5. Content analytics view ────────────────────────
CREATE OR REPLACE VIEW content_analytics AS
SELECT
  tl.id                                         AS text_id,
  tl.title,
  tl.exam_type,
  tl.status,
  COUNT(DISTINCT urp.user_id)                   AS total_readers,
  ROUND(CAST(AVG(urp.last_ratio) * 100 AS NUMERIC), 1) AS avg_completion_pct,
  COUNT(DISTINCT urp.chapter_id)                AS chapters_reached,
  MAX(urp.updated_at)                           AS last_read_at
FROM text_library tl
LEFT JOIN user_reading_progress urp ON urp.text_id = tl.id
GROUP BY tl.id, tl.title, tl.exam_type, tl.status;

-- View'a RLS yoktur ama server-side guard yeterli
-- (sadece admin panelinden çağrılır)

-- ── NOT: Supabase Storage bucket 'covers' ────────────
-- Dashboard > Storage > New bucket:
--   Name: covers
--   Public: true
--   Max file size: 5 MB
--   Allowed MIME: image/jpeg, image/png, image/webp
