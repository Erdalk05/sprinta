-- ================================================================
-- 034_text_library_anon_policy.sql
-- text_library yayınlanmış metinleri anonim role için de açar
--
-- Sorun: text_library_select policy'si sadece `authenticated`
-- role için tanımlıydı. Supabase JS istemcileri AsyncStorage
-- olmadan oluşturulursa session anon role ile sorgu atar → 0 satır.
-- Çözüm: published metinler herkese (anon dahil) görünür olsun.
-- ================================================================

-- Anon role için SELECT politikası
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'text_library'
      AND policyname = 'text_library_select_anon'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "text_library_select_anon"
        ON text_library FOR SELECT TO anon
        USING (status = 'published')
    $policy$;
  END IF;
END;
$$;

-- text_chapters da aynı şekilde anon'a aç
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'text_chapters'
      AND policyname = 'text_chapters_select_anon'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "text_chapters_select_anon"
        ON text_chapters FOR SELECT TO anon
        USING (true)
    $policy$;
  END IF;
END;
$$;
