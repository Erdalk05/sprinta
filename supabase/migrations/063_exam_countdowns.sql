-- 063_exam_countdowns.sql — Sınav Geri Sayım Tablosu
-- Sprint 10.2: Öğrencilerin sınav tarihlerini kaydettiği tablo

DO $migration$
BEGIN
  IF (SELECT COUNT(*) FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'exam_countdowns') > 0 THEN
    RAISE NOTICE '063: exam_countdowns already exists — skip';
    RETURN;
  END IF;

  CREATE TABLE public.exam_countdowns (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id  UUID REFERENCES public.students(id) ON DELETE CASCADE,
    exam_type   TEXT NOT NULL,      -- 'LGS', 'TYT', 'AYT', 'YDS', 'ALES', 'KPSS'
    exam_date   DATE NOT NULL,
    exam_label  TEXT,               -- ör. "2026 LGS"
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
  );

  ALTER TABLE public.exam_countdowns ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "exam_countdowns_own" ON public.exam_countdowns
    FOR ALL USING (
      student_id IN (
        SELECT id FROM public.students WHERE auth_user_id = auth.uid()
      )
    );

  CREATE INDEX idx_exam_countdowns_student ON public.exam_countdowns(student_id, is_active);

  RAISE NOTICE '063: exam_countdowns created';
END;
$migration$;
