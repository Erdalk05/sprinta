-- =====================================================
-- 008_ai_cron.sql
-- AI Coach Edge Functions + Nightly Cron Schedule
-- =====================================================

-- pg_cron ve pg_net extensionlarını aktif et
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- =====================================================
-- Nightly Risk Detection Cron (Her gece 02:00)
-- =====================================================
-- Supabase Cron: Her gece saat 02:00'da B2B risk skorlarını günceller.
-- Bu job production'da edge function'ı çağırır.
-- Lokal geliştirme ortamında job kaydedilir ama HTTP çağrısı çalışmaz.

SELECT cron.schedule(
  'nightly-risk-detection',
  '0 2 * * *',
  $$
  SELECT net.http_post(
    url        := current_setting('app.settings.supabase_url', true)
                  || '/functions/v1/cron-risk-detection',
    headers    := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer '
        || current_setting('app.settings.service_role_key', true)
    ),
    body       := '{}'::jsonb
  );
  $$
);

-- =====================================================
-- Daily Stats Cron (Her gece 00:05)
-- daily_stats tablosunu günlük bazda özetler
-- =====================================================
SELECT cron.schedule(
  'nightly-daily-stats-cleanup',
  '5 0 * * *',
  $$
  SELECT net.http_post(
    url        := current_setting('app.settings.supabase_url', true)
                  || '/functions/v1/cron-daily-stats',
    headers    := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer '
        || current_setting('app.settings.service_role_key', true)
    ),
    body       := '{}'::jsonb
  );
  $$
);
