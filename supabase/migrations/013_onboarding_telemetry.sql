-- 013_onboarding_telemetry.sql
-- Onboarding quiz telemetri tablosu

CREATE TABLE IF NOT EXISTS onboarding_telemetry (
  id                      UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id                 UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  onboarding_duration_ms  INTEGER,
  quiz_accuracy           DECIMAL(5,2),
  avg_response_time_ms    INTEGER,
  strong_topic            TEXT,
  weak_topic              TEXT,
  base_arp                INTEGER,
  created_at              TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE onboarding_telemetry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own telemetry"
  ON onboarding_telemetry
  FOR ALL
  USING (user_id = auth.uid());

-- students tablosuna baseline_arp kolonu ekle (yoksa)
ALTER TABLE students ADD COLUMN IF NOT EXISTS baseline_arp INTEGER DEFAULT 0;
