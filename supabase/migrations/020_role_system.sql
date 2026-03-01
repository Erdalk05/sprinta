-- =====================================================
-- 020_role_system.sql
-- Sprint 6: Role tabanlı erişim sistemi
-- students tablosuna role kolonu + yeni RLS policies
-- =====================================================

-- ── 1. students tablosuna role kolonu ekle ───────────
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'student'
  CHECK (role IN ('student', 'admin', 'editor'));

CREATE INDEX IF NOT EXISTS idx_students_role ON students(role);

-- ── 2. text_library'ye status kolonu ekle (policy için) ─
-- (021_content_extensions daha fazla kolon ekleyecek)
ALTER TABLE text_library
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft'
  CHECK (status IN ('draft', 'published', 'archived'));

CREATE INDEX IF NOT EXISTS idx_text_library_status ON text_library(status);

-- Mevcut tüm kayıtları published yap (seed data görünür kalsın)
UPDATE text_library SET status = 'published' WHERE status = 'draft';

-- ── 3. text_library eski policy'leri kaldır ──────────
DROP POLICY IF EXISTS "text_library_select_authenticated"  ON text_library;
DROP POLICY IF EXISTS "text_library_insert_super_admin"    ON text_library;
DROP POLICY IF EXISTS "text_library_update_super_admin"    ON text_library;
DROP POLICY IF EXISTS "text_library_delete_super_admin"    ON text_library;

-- ── 4. text_library yeni role-tabanlı policies ───────

-- SELECT: student'lar sadece published; admin/editor hepsini görebilir
CREATE POLICY "text_library_select"
  ON text_library FOR SELECT
  TO authenticated
  USING (
    status = 'published'
    OR EXISTS (
      SELECT 1 FROM students
      WHERE auth_user_id = auth.uid()
        AND role IN ('admin', 'editor')
    )
  );

-- INSERT: admin veya editor
CREATE POLICY "text_library_insert"
  ON text_library FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE auth_user_id = auth.uid()
        AND role IN ('admin', 'editor')
    )
  );

-- UPDATE: admin veya editor
CREATE POLICY "text_library_update"
  ON text_library FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE auth_user_id = auth.uid()
        AND role IN ('admin', 'editor')
    )
  );

-- DELETE: sadece admin
CREATE POLICY "text_library_delete"
  ON text_library FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE auth_user_id = auth.uid()
        AND role = 'admin'
    )
  );

-- ── 5. text_chapters eski policy'leri kaldır ─────────
DROP POLICY IF EXISTS "text_chapters_select_authenticated" ON text_chapters;
DROP POLICY IF EXISTS "text_chapters_insert_super_admin"   ON text_chapters;
DROP POLICY IF EXISTS "text_chapters_update_super_admin"   ON text_chapters;
DROP POLICY IF EXISTS "text_chapters_delete_super_admin"   ON text_chapters;

-- ── 6. text_chapters yeni role-tabanlı policies ──────

-- SELECT: text_library status'una bağlı + role kontrolü
CREATE POLICY "text_chapters_select"
  ON text_chapters FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM text_library tl
      WHERE tl.id = text_chapters.text_id
        AND (
          tl.status = 'published'
          OR EXISTS (
            SELECT 1 FROM students
            WHERE auth_user_id = auth.uid()
              AND role IN ('admin', 'editor')
          )
        )
    )
  );

-- INSERT: admin veya editor
CREATE POLICY "text_chapters_insert"
  ON text_chapters FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE auth_user_id = auth.uid()
        AND role IN ('admin', 'editor')
    )
  );

-- UPDATE: admin veya editor
CREATE POLICY "text_chapters_update"
  ON text_chapters FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE auth_user_id = auth.uid()
        AND role IN ('admin', 'editor')
    )
  );

-- DELETE: sadece admin
CREATE POLICY "text_chapters_delete"
  ON text_chapters FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE auth_user_id = auth.uid()
        AND role = 'admin'
    )
  );
