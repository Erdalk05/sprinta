-- =====================================================
-- Migration 014: text_chapters
-- Bölüm tablosu — text_library ile ilişkili
-- =====================================================

CREATE TABLE IF NOT EXISTS text_chapters (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  text_id        uuid        NOT NULL REFERENCES text_library(id) ON DELETE CASCADE,
  chapter_number int         NOT NULL CHECK (chapter_number > 0),
  title          text        NOT NULL,
  body           text        NOT NULL,
  word_count     int         GENERATED ALWAYS AS (
                               array_length(
                                 regexp_split_to_array(trim(body), '\s+'), 1
                               )
                             ) STORED,
  created_at     timestamptz DEFAULT now(),
  UNIQUE (text_id, chapter_number)
);

CREATE INDEX IF NOT EXISTS idx_text_chapters_text_id
  ON text_chapters(text_id);

CREATE INDEX IF NOT EXISTS idx_text_chapters_order
  ON text_chapters(text_id, chapter_number ASC);

ALTER TABLE text_chapters ENABLE ROW LEVEL SECURITY;

-- SELECT: tüm authenticated kullanıcılar (text_library ile aynı pattern)
CREATE POLICY "text_chapters_select_authenticated"
  ON text_chapters FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: sadece super_admin (003_rls_policies.sql'deki is_super_admin() mirror)
CREATE POLICY "text_chapters_insert_super_admin"
  ON text_chapters FOR INSERT
  WITH CHECK (public.is_super_admin());

-- UPDATE: sadece super_admin
CREATE POLICY "text_chapters_update_super_admin"
  ON text_chapters FOR UPDATE
  USING (public.is_super_admin());

-- DELETE: sadece super_admin
CREATE POLICY "text_chapters_delete_super_admin"
  ON text_chapters FOR DELETE
  USING (public.is_super_admin());
