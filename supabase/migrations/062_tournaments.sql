-- 062_tournaments.sql — Haftalık Turnuva Sistemi
-- Sprint 9.2: Her Pazartesi başlayan haftalık LGS/TYT yarışması

DO $migration$
BEGIN
  IF (SELECT COUNT(*) FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'tournaments') > 0 THEN
    RAISE NOTICE '062: tournaments already exists — skip';
    RETURN;
  END IF;

  -- ── tournaments ───────────────────────────────────────────────
  CREATE TABLE public.tournaments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           TEXT NOT NULL,
    exam_type       TEXT NOT NULL,   -- 'LGS', 'TYT', 'AYT'
    starts_at       TIMESTAMPTZ NOT NULL,
    ends_at         TIMESTAMPTZ NOT NULL,
    question_ids    JSONB DEFAULT '[]',   -- array of text_questions.id
    max_questions   INT DEFAULT 10,
    xp_reward_1st   INT DEFAULT 500,
    xp_reward_2nd   INT DEFAULT 300,
    xp_reward_3rd   INT DEFAULT 150,
    xp_reward_all   INT DEFAULT 50,       -- just for completing
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
  );

  -- ── tournament_entries ────────────────────────────────────────
  CREATE TABLE public.tournament_entries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id   UUID REFERENCES public.tournaments(id) ON DELETE CASCADE,
    student_id      UUID REFERENCES public.students(id) ON DELETE CASCADE,
    score           INT DEFAULT 0,        -- correct × 100 + speed_bonus
    correct_count   INT DEFAULT 0,
    wrong_count     INT DEFAULT 0,
    time_spent_ms   INT DEFAULT 0,
    rank            INT,
    xp_earned       INT DEFAULT 0,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (tournament_id, student_id)
  );

  -- ── RLS ───────────────────────────────────────────────────────
  ALTER TABLE public.tournaments       ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.tournament_entries ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "tournaments_read_all" ON public.tournaments
    FOR SELECT USING (TRUE);

  CREATE POLICY "tournament_entries_own" ON public.tournament_entries
    FOR ALL USING (
      student_id IN (
        SELECT id FROM public.students WHERE auth_user_id = auth.uid()
      )
    );

  CREATE POLICY "tournament_entries_read_all" ON public.tournament_entries
    FOR SELECT USING (TRUE);

  -- ── İndeksler ─────────────────────────────────────────────────
  CREATE INDEX idx_tournaments_active    ON public.tournaments(is_active, ends_at);
  CREATE INDEX idx_tournament_entries_rank ON public.tournament_entries(tournament_id, score DESC);

  -- ── Örnek turnuvalar (bu hafta + gelecek hafta) ───────────────
  INSERT INTO public.tournaments (title, exam_type, starts_at, ends_at, max_questions, is_active)
  VALUES
    (
      'LGS Haftası #1 — Türkçe & Fen',
      'LGS',
      DATE_TRUNC('week', NOW()),
      DATE_TRUNC('week', NOW()) + INTERVAL '7 days',
      10,
      TRUE
    ),
    (
      'TYT Haftası #1 — Karma Soru',
      'TYT',
      DATE_TRUNC('week', NOW()),
      DATE_TRUNC('week', NOW()) + INTERVAL '7 days',
      10,
      TRUE
    )
  ON CONFLICT DO NOTHING;

  RAISE NOTICE '062: tournaments created';
END;
$migration$;
