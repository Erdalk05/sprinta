-- 068_fix_vocab_rls.sql
-- Güvenlik: vocabulary_words anon erişimini kaldır
-- Sadece authenticated kullanıcılar okuyabilir

DROP POLICY IF EXISTS "vocab_select_all" ON vocabulary_words;

CREATE POLICY "vocab_select_authenticated"
  ON vocabulary_words FOR SELECT
  TO authenticated
  USING (true);
