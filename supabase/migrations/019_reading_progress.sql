-- =====================================================
-- Migration 015: user_reading_progress
-- Kullanıcı okuma ilerlemesi — ratio tabanlı, trigger yönetimli
-- =====================================================

CREATE TABLE IF NOT EXISTS user_reading_progress (
  user_id    uuid  NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text_id    uuid  NOT NULL REFERENCES text_library(id) ON DELETE CASCADE,
  chapter_id uuid  REFERENCES text_chapters(id) ON DELETE SET NULL,
  last_ratio float NOT NULL DEFAULT 0
             CHECK (last_ratio >= 0 AND last_ratio <= 1),
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, text_id)
);

CREATE INDEX IF NOT EXISTS idx_reading_progress_user
  ON user_reading_progress(user_id);

ALTER TABLE user_reading_progress ENABLE ROW LEVEL SECURITY;

-- SELECT: sadece kendi satırları
CREATE POLICY "reading_progress_select"
  ON user_reading_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- INSERT: sadece kendi satırı
CREATE POLICY "reading_progress_insert"
  ON user_reading_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: sadece kendi satırı
CREATE POLICY "reading_progress_update"
  ON user_reading_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE yok — ilerleme hiç silinmez.

-- ── updated_at otomatik trigger ──────────────────────
CREATE OR REPLACE FUNCTION update_reading_progress_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_reading_progress_updated_at
  BEFORE UPDATE ON user_reading_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_reading_progress_timestamp();
