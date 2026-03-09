-- =====================================================
-- 015_user_contents.sql
-- Kullanıcının kendi yüklediği içerikler (PDF, URL, metin)
-- Chunk'lara bölünür → egzersiz olarak okunur
-- =====================================================

-- ─── user_contents ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_contents (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,

  -- Kaynak türü
  source_type         TEXT NOT NULL CHECK (source_type IN ('pdf', 'docx', 'url', 'text', 'epub')),
  source_name         TEXT NOT NULL,
  source_url          TEXT,
  source_file_path    TEXT,   -- Supabase Storage path

  -- İşlenmiş içerik
  full_text           TEXT NOT NULL,
  total_words         INTEGER NOT NULL DEFAULT 0,
  total_paragraphs    INTEGER DEFAULT 0,

  -- Analiz sonuçları
  detected_language   TEXT DEFAULT 'tr',
  detected_topics     TEXT[] DEFAULT '{}',
  readability_score   FLOAT,
  suggested_category  TEXT,   -- modül kodu: turkce, bilim, vb.

  -- Durum
  status              TEXT NOT NULL DEFAULT 'processing'
                        CHECK (status IN ('processing', 'ready', 'error')),
  error_message       TEXT,

  -- Meta
  is_favorite         BOOLEAN DEFAULT false,
  last_read_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─── user_content_chunks ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_content_chunks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id      UUID NOT NULL REFERENCES public.user_contents(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,

  -- Chunk bilgileri
  chunk_index     INTEGER NOT NULL,   -- 0-based sıra
  chunk_text      TEXT NOT NULL,
  word_count      INTEGER NOT NULL DEFAULT 0,
  paragraph_start INTEGER DEFAULT 0,  -- kaynak içindeki paragraf başlangıcı
  paragraph_end   INTEGER DEFAULT 0,

  -- Egzersiz durumu
  is_completed    BOOLEAN DEFAULT false,
  completed_at    TIMESTAMPTZ,
  session_id      UUID REFERENCES public.sessions(id) ON DELETE SET NULL,

  -- Performans (bu chunk için ölçülen)
  wpm             INTEGER,
  comprehension   INTEGER,
  score           NUMERIC(5,2),

  created_at      TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (content_id, chunk_index)
);

-- ─── İndeksler ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_user_contents_user_id    ON public.user_contents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_contents_status     ON public.user_contents(status);
CREATE INDEX IF NOT EXISTS idx_user_contents_created    ON public.user_contents(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_uc_chunks_content_id     ON public.user_content_chunks(content_id);
CREATE INDEX IF NOT EXISTS idx_uc_chunks_user_id        ON public.user_content_chunks(user_id);
CREATE INDEX IF NOT EXISTS idx_uc_chunks_completed      ON public.user_content_chunks(is_completed);

-- ─── Updated_at trigger ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_user_contents_updated_at ON public.user_contents;
CREATE TRIGGER trg_user_contents_updated_at
  BEFORE UPDATE ON public.user_contents
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── RLS ──────────────────────────────────────────────────────────
ALTER TABLE public.user_contents       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_content_chunks ENABLE ROW LEVEL SECURITY;

-- user_contents: kullanıcı sadece kendi içeriklerini görür
CREATE POLICY "users_own_contents" ON public.user_contents
  FOR ALL USING (
    user_id IN (
      SELECT id FROM public.students WHERE auth_user_id = auth.uid()
    )
  );

-- user_content_chunks: kullanıcı sadece kendi chunk'larını görür
CREATE POLICY "users_own_chunks" ON public.user_content_chunks
  FOR ALL USING (
    user_id IN (
      SELECT id FROM public.students WHERE auth_user_id = auth.uid()
    )
  );
