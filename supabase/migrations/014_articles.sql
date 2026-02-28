-- =====================================================
-- 014_articles.sql
-- Konu bazlı okuma makaleleri tablosu
-- tenant_id ile çok kiracılı yapı desteklenir
-- NULL tenant_id = platform genelinde (global) içerik
-- =====================================================

CREATE TABLE articles (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- NULL = global (tüm kiracılar okuyabilir), UUID = kiracıya özel
  tenant_id        UUID REFERENCES tenants(id) ON DELETE CASCADE,

  -- Modül kodu: turkce, ingilizce, teknoloji, bilim, felsefe, tarih,
  --              psikoloji, cografya, edebiyat, sosyal, fen, saglik …
  subject_code     TEXT NOT NULL,

  title            TEXT NOT NULL,
  content_text     TEXT NOT NULL,

  word_count       INTEGER NOT NULL DEFAULT 0,
  -- 1-10 arası, 5 = orta
  difficulty_level INTEGER NOT NULL DEFAULT 5
                    CHECK (difficulty_level BETWEEN 1 AND 10),

  -- Hedef sınav: lgs, tyt, ayt …
  target_exam      exam_type[] DEFAULT '{lgs,tyt}',

  -- Her makale için JSONB formatında sorular
  -- [{question, options: string[], correctIndex: number}]
  questions        JSONB DEFAULT '[]',

  is_published     BOOLEAN DEFAULT true,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─── İndeksler ───────────────────────────────────────
CREATE INDEX idx_articles_subject_code
  ON articles(subject_code)
  WHERE is_published = true;

CREATE INDEX idx_articles_tenant_id
  ON articles(tenant_id);

CREATE INDEX idx_articles_target_exam
  ON articles USING GIN(target_exam);

CREATE INDEX idx_articles_difficulty
  ON articles(subject_code, difficulty_level)
  WHERE is_published = true;

-- ─── RLS ─────────────────────────────────────────────
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Yayınlanmış global makaleler (tenant_id IS NULL) herkes tarafından okunabilir
-- Kiracıya özel makaleler yalnızca o kiracının öğrencileri tarafından okunabilir
CREATE POLICY "articles_readable" ON articles
  FOR SELECT USING (
    is_published = true
    AND (
      tenant_id IS NULL
      OR tenant_id IN (
        SELECT tenant_id FROM students WHERE auth_user_id = auth.uid()
      )
    )
  );

-- Super admin tüm makaleleri yönetebilir
CREATE POLICY "super_admin_manage_articles" ON articles
  FOR ALL USING (public.is_super_admin());

-- Tenant admin kendi kiracısının makalelerini yönetebilir
CREATE POLICY "tenant_admin_manage_articles" ON articles
  FOR ALL USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_admins WHERE auth_user_id = auth.uid()
    )
  );

-- updated_at otomatik güncelleme
CREATE OR REPLACE FUNCTION update_articles_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_articles_updated_at();
