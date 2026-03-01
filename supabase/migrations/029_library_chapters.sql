-- ================================================================
-- 029_library_chapters.sql
-- text_library metinleri için otomatik bölüm oluşturma
-- Her metnin body'si \n\n ile ayrılmış paragraflardır.
-- Her paragraf ayrı bir chapter olarak eklenir.
-- ================================================================

-- Zaten chapter varsa tekrar ekleme
DO $$
BEGIN
  IF (SELECT COUNT(*) FROM text_chapters) > 0 THEN
    RETURN;
  END IF;

  -- Her published metin için body'yi paragraflara böl ve chapter ekle
  INSERT INTO text_chapters (text_id, chapter_number, title, body, status, is_locked)
  SELECT
    tl.id                                             AS text_id,
    ROW_NUMBER() OVER (PARTITION BY tl.id ORDER BY para.ordinal) AS chapter_number,
    CASE
      WHEN ROW_NUMBER() OVER (PARTITION BY tl.id ORDER BY para.ordinal) = 1
        THEN tl.title
      ELSE tl.title || ' — Bölüm ' ||
           ROW_NUMBER() OVER (PARTITION BY tl.id ORDER BY para.ordinal)::text
    END                                               AS title,
    TRIM(para.content)                                AS body,
    'published'                                       AS status,
    FALSE                                             AS is_locked
  FROM text_library tl
  CROSS JOIN LATERAL (
    SELECT
      ordinality::int AS ordinal,
      chunk           AS content
    FROM regexp_split_to_table(tl.body, E'\\n\\n') WITH ORDINALITY AS t(chunk, ordinality)
    WHERE TRIM(chunk) <> ''
  ) AS para
  WHERE tl.status = 'published';

END $$;
