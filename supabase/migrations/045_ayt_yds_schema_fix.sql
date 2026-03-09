-- ================================================================
-- 045_ayt_yds_schema_fix.sql
-- Sprint 1: AYT/YDS/YÖKDİL altyapısı + wrong_answers + mock_exams
-- ================================================================

-- ────────────────────────────────────────────────────────────────
-- 1. text_library exam_type CHECK genişlet (AYT, YDS, YOKDIL ekle)
-- ────────────────────────────────────────────────────────────────
ALTER TABLE text_library
  DROP CONSTRAINT IF EXISTS text_library_exam_type_check;

ALTER TABLE text_library
  ADD CONSTRAINT text_library_exam_type_check
  CHECK (exam_type IN ('LGS','TYT','AYT','YDS','YOKDIL','ALES','KPSS','General'));

-- ────────────────────────────────────────────────────────────────
-- 2. vocabulary_words exam_type CHECK genişlet
-- ────────────────────────────────────────────────────────────────
ALTER TABLE vocabulary_words
  DROP CONSTRAINT IF EXISTS vocabulary_words_exam_type_check;

ALTER TABLE vocabulary_words
  ADD CONSTRAINT vocabulary_words_exam_type_check
  CHECK (exam_type IN ('lgs','tyt','ayt','yds','yokdil','ales','kpss','all'));

-- ────────────────────────────────────────────────────────────────
-- 3. students tablosuna exam_date kolonu ekle
-- ────────────────────────────────────────────────────────────────
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS exam_date DATE;

-- ────────────────────────────────────────────────────────────────
-- 4. wrong_answers — SM-2 Spaced Repetition tablosu
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wrong_answers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  question_id     UUID NOT NULL REFERENCES text_questions(id) ON DELETE CASCADE,

  -- SM-2 Algoritması alanları
  ease_factor     FLOAT   NOT NULL DEFAULT 2.5,   -- başlangıç: 2.5
  interval_days   INTEGER NOT NULL DEFAULT 1,      -- sonraki tekrar gün sayısı
  repetitions     INTEGER NOT NULL DEFAULT 0,      -- başarılı tekrar sayısı
  next_review_at  DATE    NOT NULL DEFAULT CURRENT_DATE,

  -- İstatistik
  attempt_count   INTEGER NOT NULL DEFAULT 1,
  correct_count   INTEGER NOT NULL DEFAULT 0,
  last_quality    INTEGER CHECK (last_quality BETWEEN 0 AND 5), -- SM-2: 0=tamamen yanlış, 5=kolay

  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (student_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_wrong_answers_student
  ON wrong_answers (student_id, next_review_at);

CREATE INDEX IF NOT EXISTS idx_wrong_answers_due
  ON wrong_answers (next_review_at);

ALTER TABLE wrong_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY wa_own ON wrong_answers
  FOR ALL USING (
    student_id IN (SELECT id FROM students WHERE auth_user_id = auth.uid())
  );

-- Updated_at trigger
DROP TRIGGER IF EXISTS trg_wrong_answers_updated_at ON wrong_answers;
CREATE TRIGGER trg_wrong_answers_updated_at
  BEFORE UPDATE ON wrong_answers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ────────────────────────────────────────────────────────────────
-- 5. mock_exams — Tam sınav simülasyonu
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mock_exams (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,

  exam_type       TEXT NOT NULL CHECK (exam_type IN ('LGS','TYT','AYT','YDS','YOKDIL','ALES','KPSS')),
  subject         TEXT,            -- 'Türkçe', 'Matematik', vb. (NULL = karma)
  question_count  INTEGER NOT NULL DEFAULT 0,

  -- Zamanlama
  duration_seconds INTEGER NOT NULL DEFAULT 0,  -- toplam izin verilen süre
  started_at      TIMESTAMPTZ,
  finished_at     TIMESTAMPTZ,
  time_spent_seconds INTEGER,      -- gerçekte harcanan süre

  -- Sonuç
  correct_count   INTEGER NOT NULL DEFAULT 0,
  wrong_count     INTEGER NOT NULL DEFAULT 0,
  empty_count     INTEGER NOT NULL DEFAULT 0,
  net_score       FLOAT GENERATED ALWAYS AS
                  (correct_count - wrong_count * 0.25) STORED,

  -- Detaylı analiz (JSON)
  time_per_question_ms JSONB DEFAULT '{}', -- {question_id: ms}
  subject_breakdown    JSONB DEFAULT '{}', -- {Türkçe: {doğru:X, yanlış:Y}}

  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mock_exams_student
  ON mock_exams (student_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_mock_exams_type
  ON mock_exams (student_id, exam_type, created_at DESC);

ALTER TABLE mock_exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY me_own ON mock_exams
  FOR ALL USING (
    student_id IN (SELECT id FROM students WHERE auth_user_id = auth.uid())
  );

-- ────────────────────────────────────────────────────────────────
-- 6. mock_exam_answers — Sınav içi soru cevapları
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mock_exam_answers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id         UUID NOT NULL REFERENCES mock_exams(id) ON DELETE CASCADE,
  student_id      UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  question_id     UUID NOT NULL REFERENCES text_questions(id) ON DELETE CASCADE,

  selected_index  INTEGER,          -- NULL = boş bırakıldı
  is_correct      BOOLEAN,
  time_spent_ms   INTEGER NOT NULL DEFAULT 0,
  is_flagged      BOOLEAN DEFAULT FALSE,  -- "işaretlendi"

  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mea_exam
  ON mock_exam_answers (exam_id);

CREATE INDEX IF NOT EXISTS idx_mea_student_q
  ON mock_exam_answers (student_id, question_id);

ALTER TABLE mock_exam_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY mea_own ON mock_exam_answers
  FOR ALL USING (
    student_id IN (SELECT id FROM students WHERE auth_user_id = auth.uid())
  );

-- ────────────────────────────────────────────────────────────────
-- 7. SM-2 güncelleme fonksiyonu
-- ────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_sm2(
  p_student_id  UUID,
  p_question_id UUID,
  p_quality     INTEGER  -- 0-5 (0-1: yanlış, 2-3: zor, 4-5: kolay)
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ef      FLOAT;
  v_int     INTEGER;
  v_reps    INTEGER;
  v_next    DATE;
BEGIN
  -- Mevcut kaydı al, yoksa oluştur
  INSERT INTO wrong_answers (student_id, question_id, last_quality)
  VALUES (p_student_id, p_question_id, p_quality)
  ON CONFLICT (student_id, question_id) DO UPDATE
    SET last_quality  = p_quality,
        attempt_count = wrong_answers.attempt_count + 1,
        correct_count = wrong_answers.correct_count + CASE WHEN p_quality >= 3 THEN 1 ELSE 0 END;

  -- SM-2 hesaplama
  SELECT ease_factor, interval_days, repetitions
  INTO v_ef, v_int, v_reps
  FROM wrong_answers
  WHERE student_id = p_student_id AND question_id = p_question_id;

  IF p_quality < 3 THEN
    -- Yanlış cevap: sıfırla
    v_reps := 0;
    v_int  := 1;
  ELSE
    -- Doğru cevap: interval artır
    IF v_reps = 0 THEN
      v_int := 1;
    ELSIF v_reps = 1 THEN
      v_int := 6;
    ELSE
      v_int := ROUND(v_int * v_ef)::INTEGER;
    END IF;
    v_reps := v_reps + 1;
  END IF;

  -- EF güncelle: EF = EF + (0.1 - (5-q)*(0.08 + (5-q)*0.02))
  v_ef := v_ef + 0.1 - (5 - p_quality) * (0.08 + (5 - p_quality) * 0.02);
  v_ef := GREATEST(1.3, v_ef);  -- minimum 1.3

  v_next := CURRENT_DATE + v_int;

  UPDATE wrong_answers
  SET ease_factor    = v_ef,
      interval_days  = v_int,
      repetitions    = v_reps,
      next_review_at = v_next,
      updated_at     = NOW()
  WHERE student_id = p_student_id AND question_id = p_question_id;
END;
$$;
