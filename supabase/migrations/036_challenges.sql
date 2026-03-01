-- ================================================================
-- 036_challenges.sql
-- Öğrenciler arası meydan okuma (7 günlük yarışma)
-- leaderboardService.ts şemasıyla uyumlu
-- ================================================================

CREATE TABLE IF NOT EXISTS challenges (
  id              uuid      PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id   uuid      NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  opponent_id     uuid      NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  -- Yarışma türü (leaderboardService'deki ChallengeType ile eşleşir)
  challenge_type  text      NOT NULL DEFAULT 'weekly_xp'
    CHECK (challenge_type IN ('weekly_xp', 'arp_gain', 'streak')),
  -- Durum
  status          text      NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'completed', 'declined', 'cancelled')),
  -- Süre
  duration_days   int       NOT NULL DEFAULT 7,
  started_at      timestamptz,
  ends_at         timestamptz,
  -- Puanlar
  challenger_score numeric(10,2) DEFAULT 0,
  opponent_score   numeric(10,2) DEFAULT 0,
  winner_id        uuid      REFERENCES students(id) ON DELETE SET NULL,
  bonus_xp         int       NOT NULL DEFAULT 200,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_challenges_challenger ON challenges(challenger_id, status);
CREATE INDEX IF NOT EXISTS idx_challenges_opponent   ON challenges(opponent_id, status);
CREATE INDEX IF NOT EXISTS idx_challenges_active     ON challenges(status, ends_at)
  WHERE status = 'active';

-- RLS
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "challenges_select"
  ON challenges FOR SELECT TO authenticated
  USING (
    challenger_id = (SELECT id FROM students WHERE auth_user_id = auth.uid() LIMIT 1)
    OR
    opponent_id   = (SELECT id FROM students WHERE auth_user_id = auth.uid() LIMIT 1)
  );

CREATE POLICY "challenges_insert"
  ON challenges FOR INSERT TO authenticated
  WITH CHECK (
    challenger_id = (SELECT id FROM students WHERE auth_user_id = auth.uid() LIMIT 1)
  );

CREATE POLICY "challenges_update"
  ON challenges FOR UPDATE TO authenticated
  USING (
    challenger_id = (SELECT id FROM students WHERE auth_user_id = auth.uid() LIMIT 1)
    OR
    opponent_id   = (SELECT id FROM students WHERE auth_user_id = auth.uid() LIMIT 1)
  );

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_challenges_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_challenges_updated_at ON challenges;
CREATE TRIGGER trg_challenges_updated_at
  BEFORE UPDATE ON challenges
  FOR EACH ROW EXECUTE FUNCTION update_challenges_updated_at();
