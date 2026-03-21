export type ExamTypeKey =
  | 'LGS'
  | 'TYT'
  | 'AYT'
  | 'YDS'
  | 'YOKDIL'
  | 'ALES'
  | 'KPSS'
  | 'General'

export interface LessonFolder {
  category: string   // text_library.category ile eşleşir
  label:    string
  icon:     string
}

export interface ExamCategory {
  key:     ExamTypeKey
  label:   string
  icon:    string
  color:   string
  lessons: LessonFolder[]
}

export interface LibraryText {
  id:            string
  title:         string
  category:      string
  exam_type:     string
  difficulty:    number
  word_count:    number | null
  questionCount: number
}

export type SpeedTier =
  | 'Yeni Başlayan'
  | 'Geliştiriyor'
  | 'Orta Seviye'
  | 'Hızlı Okuyucu'
  | 'Uzman'

export type ComprehensionTier =
  | 'Geliştirilmeli'
  | 'Orta'
  | 'İyi'
  | 'Çok İyi'
  | 'Mükemmel'

export type LibraryLevel = 'exams' | 'lessons' | 'texts'

export interface AnalysisResult {
  weaknesses:  string[]
  strengths:   string[]
  risk_level:  'low' | 'medium' | 'high'
  trend:       'improving' | 'declining' | 'stable'
  focus_area:  string
  next_action: string[]
}
