-- =====================================================
-- 017_text_library.sql
-- Metin Kütüphanesi — text_library tablosu
-- =====================================================

CREATE TABLE text_library (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title               text        NOT NULL,
  category            text        NOT NULL,
  exam_type           text        NOT NULL CHECK (exam_type IN ('LGS', 'TYT', 'ALES', 'KPSS', 'General')),
  difficulty          int         NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
  word_count          int,
  estimated_read_time int,
  body                text        NOT NULL,
  tags                text[]      DEFAULT '{}',
  created_at          timestamptz DEFAULT now()
);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE text_library ENABLE ROW LEVEL SECURITY;

-- Tüm authenticated kullanıcılar okuyabilir
CREATE POLICY "text_library_select_authenticated" ON text_library
  FOR SELECT USING (auth.role() = 'authenticated');

-- Sadece super_admin yazabilir / güncelleyebilir / silebilir
-- (003_rls_policies.sql'deki is_super_admin() pattern'i)
CREATE POLICY "text_library_insert_super_admin" ON text_library
  FOR INSERT WITH CHECK (public.is_super_admin());

CREATE POLICY "text_library_update_super_admin" ON text_library
  FOR UPDATE USING (public.is_super_admin());

CREATE POLICY "text_library_delete_super_admin" ON text_library
  FOR DELETE USING (public.is_super_admin());

-- =====================================================
-- PERFORMANS İNDEKSLERİ
-- =====================================================
CREATE INDEX idx_text_library_exam_type  ON text_library (exam_type);
CREATE INDEX idx_text_library_difficulty ON text_library (difficulty);
CREATE INDEX idx_text_library_created_at ON text_library (created_at DESC);
