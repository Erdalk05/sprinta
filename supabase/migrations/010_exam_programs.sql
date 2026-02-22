-- =============================================================
-- 010 — Sınav Programları
-- =============================================================

-- Sınav programı şablonları
CREATE TABLE IF NOT EXISTS public.exam_programs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_type      public.exam_type NOT NULL,
  title          TEXT NOT NULL,
  subtitle       TEXT,
  duration_days  INT  NOT NULL,
  daily_minutes  INT  NOT NULL DEFAULT 20,
  target_arp     INT  NOT NULL,
  phases         JSONB NOT NULL DEFAULT '[]',
  daily_tasks    JSONB NOT NULL DEFAULT '[]',
  color          TEXT NOT NULL DEFAULT '#6C3EE8',
  icon           TEXT NOT NULL DEFAULT '📚',
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Öğrencinin aktif programı
CREATE TABLE IF NOT EXISTS public.student_programs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id       UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  program_id       UUID NOT NULL REFERENCES public.exam_programs(id),
  exam_type        public.exam_type NOT NULL,
  start_date       DATE NOT NULL DEFAULT CURRENT_DATE,
  target_exam_date DATE,
  current_phase    INT  NOT NULL DEFAULT 1,
  current_day      INT  NOT NULL DEFAULT 1,
  progress_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  completed_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Günlük program tamamlama kaydı
CREATE TABLE IF NOT EXISTS public.program_daily_logs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id     UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  program_id     UUID NOT NULL REFERENCES public.student_programs(id) ON DELETE CASCADE,
  log_date       DATE NOT NULL DEFAULT CURRENT_DATE,
  day_number     INT  NOT NULL,
  tasks_done     JSONB NOT NULL DEFAULT '[]',
  arp_at_log     INT,
  minutes_spent  INT  NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, program_id, log_date)
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_student_programs_student ON public.student_programs(student_id);
CREATE INDEX IF NOT EXISTS idx_student_programs_active  ON public.student_programs(student_id, is_active);
CREATE INDEX IF NOT EXISTS idx_program_logs_student     ON public.program_daily_logs(student_id, log_date);

-- RLS
ALTER TABLE public.exam_programs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_daily_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "exam_programs_read" ON public.exam_programs
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "student_programs_own" ON public.student_programs
  FOR ALL USING (student_id IN (
    SELECT id FROM public.students WHERE auth_user_id = auth.uid()
  ));

CREATE POLICY "program_logs_own" ON public.program_daily_logs
  FOR ALL USING (student_id IN (
    SELECT id FROM public.students WHERE auth_user_id = auth.uid()
  ));

-- =============================================================
-- SEED — 6 Sınav Programı
-- =============================================================

INSERT INTO public.exam_programs (exam_type, title, subtitle, duration_days, daily_minutes, target_arp, color, icon, phases, daily_tasks) VALUES

-- LGS
('lgs', 'LGS Hazırlık Programı', '6-8. Sınıf · 45 Günlük Yoğun Antrenman', 45, 20, 200, '#8B5CF6', '🎯',
'[
  {"phase":1,"title":"Temel Hız","days":[1,15],"focus":["speed_control"],"target_wpm":200,"description":"Okuma hızını 200 WPM''e çıkar"},
  {"phase":2,"title":"Kavrama Derinleştirme","days":[16,30],"focus":["deep_comprehension"],"target_comprehension":80,"description":"Anlama oranını %80''e taşı"},
  {"phase":3,"title":"Karma Antrenman","days":[31,45],"focus":["speed_control","deep_comprehension","attention_power"],"description":"Tüm modüller entegrasyon"}
]',
'[
  {"id":"speed5","module":"speed_control","title":"5 dk Hız Isınma","duration":5,"required":true},
  {"id":"comp10","module":"deep_comprehension","title":"LGS Paragraf Analizi","duration":10,"required":true},
  {"id":"attention5","module":"attention_power","title":"Dikkat Egzersizi","duration":5,"required":false}
]'),

-- TYT
('tyt', 'TYT Türkçe Programı', '12. Sınıf & Mezunlar · 60 Günlük Program', 60, 25, 250, '#6C3EE8', '📖',
'[
  {"phase":1,"title":"Hız ve Temel","days":[1,20],"focus":["speed_control","mental_reset"],"target_wpm":250,"description":"300 WPM hedefine git"},
  {"phase":2,"title":"Anlam Katmanları","days":[21,40],"focus":["deep_comprehension"],"target_comprehension":85,"description":"TYT paragraf tipleri"},
  {"phase":3,"title":"Sınav Simülasyonu","days":[41,60],"focus":["speed_control","deep_comprehension","attention_power"],"description":"Sınav koşullarında pratik"}
]',
'[
  {"id":"warmup","module":"mental_reset","title":"5 dk Zihinsel Isınma","duration":5,"required":true},
  {"id":"tyt_text","module":"deep_comprehension","title":"TYT Paragraf (Anlama + Çıkarım)","duration":12,"required":true},
  {"id":"speed","module":"speed_control","title":"Hız Sprint","duration":8,"required":true}
]'),

-- AYT
('ayt', 'AYT Edebiyat & Alan Programı', 'SÖZ / EA / SAY · 90 Günlük Derinlemesine Program', 90, 30, 280, '#059669', '🧠',
'[
  {"phase":1,"title":"Akademik Okuma","days":[1,30],"focus":["deep_comprehension"],"target_comprehension":88,"description":"Edebi ve bilimsel metin analizi"},
  {"phase":2,"title":"Kritik Düşünce","days":[31,60],"focus":["deep_comprehension","attention_power"],"description":"Çıkarım ve eleştirel okuma"},
  {"phase":3,"title":"Yoğun Sprint","days":[61,90],"focus":["speed_control","deep_comprehension"],"description":"Hız + derinlik dengesi"}
]',
'[
  {"id":"literary","module":"deep_comprehension","title":"Edebi Metin Analizi","duration":15,"required":true},
  {"id":"inference","module":"deep_comprehension","title":"Çıkarım Egzersizi","duration":10,"required":true},
  {"id":"attention","module":"attention_power","title":"Odak Kilidi","duration":5,"required":false}
]'),

-- KPSS
('kpss', 'KPSS Genel Yetenek Programı', 'Devlet Memurluğu · 75 Günlük Program', 75, 25, 290, '#D97706', '🏛️',
'[
  {"phase":1,"title":"Hızlı Tarama","days":[1,25],"focus":["speed_control","attention_power"],"description":"Çoklu soru için hızlı okuma"},
  {"phase":2,"title":"Paragraf Hakimiyeti","days":[26,50],"focus":["deep_comprehension"],"description":"KPSS paragraf yapısını öğren"},
  {"phase":3,"title":"Performans Zirvesi","days":[51,75],"focus":["speed_control","deep_comprehension","attention_power"],"description":"Sınav temposu"}
]',
'[
  {"id":"scan","module":"speed_control","title":"Hızlı Tarama Tekniği","duration":10,"required":true},
  {"id":"kpss_para","module":"deep_comprehension","title":"KPSS Paragraf Soruları","duration":12,"required":true},
  {"id":"reset","module":"mental_reset","title":"Odak Sıfırlama","duration":3,"required":false}
]'),

-- ALES
('ales', 'ALES Sözel Bölüm Programı', 'Lisansüstü Başvuru · 60 Günlük Yoğun', 60, 30, 310, '#EF4444', '🎓',
'[
  {"phase":1,"title":"Akademik Kelime & Hız","days":[1,20],"focus":["speed_control","attention_power"],"description":"Akademik metin hızı 350+ WPM"},
  {"phase":2,"title":"Mantıksal Çıkarım","days":[21,40],"focus":["deep_comprehension"],"target_comprehension":90,"description":"Akademik paragraf ve çıkarım"},
  {"phase":3,"title":"Yoğun Simülasyon","days":[41,60],"focus":["speed_control","deep_comprehension","attention_power"],"description":"ALES sınav süresi pratiği"}
]',
'[
  {"id":"academic","module":"deep_comprehension","title":"Akademik Makale Okuma","duration":15,"required":true},
  {"id":"speed_ales","module":"speed_control","title":"Hız & Kelime Çıkarımı","duration":10,"required":true},
  {"id":"focus","module":"attention_power","title":"35 dk Sürekli Dikkat","duration":8,"required":true}
]'),

-- YDS
('yds', 'YDS / YÖKDİL İngilizce Programı', 'Akademik İngilizce · 90 Günlük Program', 90, 35, 320, '#0EA5E9', '🌍',
'[
  {"phase":1,"title":"İngilizce Temel Hız","days":[1,30],"focus":["speed_control"],"target_wpm":250,"description":"İngilizce okuma hızı 250 WPM"},
  {"phase":2,"title":"Akademik Kelime","days":[31,60],"focus":["deep_comprehension","attention_power"],"description":"Akademik İngilizce kelime + anlama"},
  {"phase":3,"title":"Sınav Şartları","days":[61,90],"focus":["speed_control","deep_comprehension"],"description":"YDS sınav süresi ve tipi"}
]',
'[
  {"id":"eng_speed","module":"speed_control","title":"İngilizce Okuma Hızı","duration":15,"required":true},
  {"id":"eng_comp","module":"deep_comprehension","title":"Akademik Paragraf (İngilizce)","duration":15,"required":true},
  {"id":"eng_focus","module":"attention_power","title":"Kelime Dikkat Egzersizi","duration":5,"required":false}
]')

ON CONFLICT DO NOTHING;
