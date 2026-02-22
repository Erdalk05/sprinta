-- =====================================================
-- 011_social_leaderboard.sql
-- Sosyal özellikler: haftalık liderlik + meydan okumalar
-- =====================================================

-- ─── Haftalık Liderlik Görünümü ─────────────────────
-- Gerçek zamanlı haftalık sıralama (her sorgu taze veri)
CREATE OR REPLACE VIEW public.leaderboard_weekly AS
WITH base AS (
  SELECT
    s.id              AS student_id,
    s.full_name,
    NULL::TEXT        AS avatar_url,
    s.exam_target,
    s.current_arp::INTEGER,
    s.streak_days,
    COALESCE(SUM(ds.xp_earned), 0)::INTEGER AS weekly_xp,
    COALESCE(
      MAX(ds.avg_arp) - MIN(NULLIF(ds.avg_arp, 0)), 0
    )::INTEGER AS arp_gain
  FROM public.students s
  LEFT JOIN public.daily_stats ds
    ON ds.student_id = s.id
    AND ds.date >= CURRENT_DATE - INTERVAL '7 days'
  GROUP BY
    s.id, s.full_name, s.exam_target, s.current_arp, s.streak_days
)
SELECT
  *,
  RANK() OVER (ORDER BY weekly_xp DESC)   AS xp_rank,
  RANK() OVER (ORDER BY current_arp DESC) AS arp_rank,
  RANK() OVER (ORDER BY streak_days DESC) AS streak_rank
FROM base;

-- ─── Meydan Okumalar ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.challenges (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  opponent_id   UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'active', 'completed', 'declined')),
  challenge_type TEXT NOT NULL DEFAULT 'weekly_xp'
                CHECK (challenge_type IN ('weekly_xp', 'arp_gain', 'streak')),
  duration_days  INTEGER NOT NULL DEFAULT 7,
  started_at     TIMESTAMPTZ,
  ends_at        TIMESTAMPTZ,
  challenger_score INTEGER DEFAULT 0,
  opponent_score   INTEGER DEFAULT 0,
  winner_id        UUID REFERENCES public.students(id),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT no_self_challenge CHECK (challenger_id <> opponent_id)
);

CREATE INDEX IF NOT EXISTS idx_challenges_challenger ON public.challenges(challenger_id);
CREATE INDEX IF NOT EXISTS idx_challenges_opponent   ON public.challenges(opponent_id);
CREATE INDEX IF NOT EXISTS idx_challenges_status     ON public.challenges(status);

-- ─── RLS ────────────────────────────────────────────
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

-- Kendi meydan okumalarını gör
CREATE POLICY "challenges_select" ON public.challenges FOR SELECT
  USING (
    auth.uid() IN (
      SELECT auth_user_id FROM public.students
      WHERE id IN (challenger_id, opponent_id)
    )
  );

-- Sadece meydan okuyanlar oluşturabilir
CREATE POLICY "challenges_insert" ON public.challenges FOR INSERT
  WITH CHECK (
    challenger_id IN (
      SELECT id FROM public.students WHERE auth_user_id = auth.uid()
    )
  );

-- Rakip kabul/reddetme + güncelleme
CREATE POLICY "challenges_update" ON public.challenges FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT auth_user_id FROM public.students
      WHERE id IN (challenger_id, opponent_id)
    )
  );

-- leaderboard_weekly RLS (herkes okuyabilir — public leaderboard)
GRANT SELECT ON public.leaderboard_weekly TO anon, authenticated;

-- Seed verisi supabase/seed/demo_users.sql dosyasına taşındı
