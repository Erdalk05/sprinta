-- ================================================================
-- 033_text_bookmarks.sql
-- Kullanıcı yer imleri ve okuma notları
-- ================================================================

CREATE TABLE IF NOT EXISTS text_bookmarks (
  id          uuid      PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  uuid      NOT NULL REFERENCES students(id)      ON DELETE CASCADE,
  text_id     uuid      NOT NULL REFERENCES text_library(id)  ON DELETE CASCADE,
  chapter_id  uuid               REFERENCES text_chapters(id) ON DELETE SET NULL,
  -- Bölüm içindeki konum (0–1 arası scroll yüzdesi)
  position    numeric(5,4) NOT NULL DEFAULT 0
    CHECK (position >= 0 AND position <= 1),
  -- Seçilen metin pasajı (highlight için)
  selected_text text,
  -- Kullanıcı notu
  note        text,
  -- Tipi: 'bookmark' | 'note' | 'highlight'
  type        text      NOT NULL DEFAULT 'bookmark'
    CHECK (type IN ('bookmark', 'note', 'highlight')),
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_student_text
  ON text_bookmarks(student_id, text_id, created_at DESC);

-- RLS
ALTER TABLE text_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bookmarks_select"
  ON text_bookmarks FOR SELECT TO authenticated
  USING (auth.uid() = (
    SELECT auth_user_id FROM students WHERE id = student_id LIMIT 1
  ));

CREATE POLICY "bookmarks_insert"
  ON text_bookmarks FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = (
    SELECT auth_user_id FROM students WHERE id = student_id LIMIT 1
  ));

CREATE POLICY "bookmarks_update"
  ON text_bookmarks FOR UPDATE TO authenticated
  USING (auth.uid() = (
    SELECT auth_user_id FROM students WHERE id = student_id LIMIT 1
  ))
  WITH CHECK (auth.uid() = (
    SELECT auth_user_id FROM students WHERE id = student_id LIMIT 1
  ));

CREATE POLICY "bookmarks_delete"
  ON text_bookmarks FOR DELETE TO authenticated
  USING (auth.uid() = (
    SELECT auth_user_id FROM students WHERE id = student_id LIMIT 1
  ));

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_bookmarks_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bookmarks_updated_at ON text_bookmarks;
CREATE TRIGGER trg_bookmarks_updated_at
  BEFORE UPDATE ON text_bookmarks
  FOR EACH ROW EXECUTE FUNCTION update_bookmarks_updated_at();
