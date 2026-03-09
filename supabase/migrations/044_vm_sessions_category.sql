-- migration 044: eye_training_sessions category CHECK kısıtına visual_mechanics ekle
-- Görsel Mekanik egzersizleri de aynı tabloya kaydedilecek

ALTER TABLE eye_training_sessions
  DROP CONSTRAINT IF EXISTS eye_training_sessions_category_check;

ALTER TABLE eye_training_sessions
  ADD CONSTRAINT eye_training_sessions_category_check
  CHECK (category IN ('saccadic', 'peripheral', 'tracking', 'visual_mechanics'));
