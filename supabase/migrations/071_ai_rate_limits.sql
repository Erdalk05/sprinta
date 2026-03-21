-- 071_ai_rate_limits.sql
-- AI Edge Function günlük rate limiting
-- ai-coach: 10 istek/gün  |  generate-questions: 20 istek/gün

-- ── Tablo ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_rate_limits (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  function_name  text        NOT NULL,   -- 'ai-coach' | 'generate-questions'
  request_date   date        NOT NULL DEFAULT CURRENT_DATE,
  request_count  integer     NOT NULL DEFAULT 0,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_ai_rate_limits UNIQUE (user_id, function_name, request_date)
);

-- ── Index ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_ai_rate_limits_lookup
  ON ai_rate_limits (user_id, function_name, request_date);

-- ── RLS ────────────────────────────────────────────────────────────────────
ALTER TABLE ai_rate_limits ENABLE ROW LEVEL SECURITY;

-- Kullanıcı kendi günlük sayacını okuyabilir (kalan kota UI için)
CREATE POLICY "rate_limits_select_own"
  ON ai_rate_limits FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT / UPDATE yalnızca SECURITY DEFINER fonksiyonu üzerinden yapılır.

-- ── check_and_increment_ai_rate_limit() ────────────────────────────────────
-- Atomic rate limit kontrolü + koşullu artış.
-- Algoritma:
--   1. Satır yoksa (user, function, tarih) için 0 sayaçla oluştur.
--   2. request_count < p_daily_limit ise sayacı +1 artır → TRUE döndür.
--   3. Limit doluysa hiçbir şeyi değiştirme → FALSE döndür.
-- Race-condition güvenlidir: UPDATE satır bazında atomic çalışır.
CREATE OR REPLACE FUNCTION check_and_increment_ai_rate_limit(
  p_user_id       uuid,
  p_function_name text,
  p_daily_limit   integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_count integer;
BEGIN
  -- Satır yoksa sıfır sayaçla oluştur; varsa dokunma
  INSERT INTO ai_rate_limits (user_id, function_name, request_date, request_count)
  VALUES (p_user_id, p_function_name, CURRENT_DATE, 0)
  ON CONFLICT ON CONSTRAINT uq_ai_rate_limits DO NOTHING;

  -- Limit altındaysa sayacı artır; limitteyse UPDATE hiç satır etkilemez
  UPDATE ai_rate_limits
  SET    request_count = request_count + 1,
         updated_at    = now()
  WHERE  user_id       = p_user_id
    AND  function_name = p_function_name
    AND  request_date  = CURRENT_DATE
    AND  request_count < p_daily_limit
  RETURNING request_count INTO v_new_count;

  -- v_new_count NULL ise limit doluydu → reddet
  RETURN v_new_count IS NOT NULL;
END;
$$;

-- Edge Function service role client'ı aracılığıyla çağırıyor;
-- authenticated grubuna da izin veriliyor (gelecekteki istemci tarafı kullanımı için)
GRANT EXECUTE ON FUNCTION check_and_increment_ai_rate_limit(uuid, text, integer)
  TO authenticated;
