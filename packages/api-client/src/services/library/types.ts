// =====================================================
// Library Core — TypeScript Tipleri
// =====================================================

export type SkillFocus = 'balanced' | 'inference' | 'detail' | 'vocabulary'

export interface TextItem {
  id: string
  title: string
  category: string
  exam_type: 'LGS' | 'TYT' | 'ALES' | 'KPSS' | 'General'
  difficulty: 1 | 2 | 3 | 4 | 5
  word_count: number
  estimated_read_time: number
  body: string
  tags: string[]
  created_at: string
  skill_focus?: SkillFocus | null  // Sprint 8
}

export interface TextFilters {
  exam_type?: TextItem['exam_type']
  category?: string
  difficulty?: number
  tags?: string[]
}

export interface LibraryServiceResult<T> {
  data: T | null
  error: string | null
}

// ── Sprint 5: Chapter + Reading Progress ──────────────

export interface TextChapter {
  id: string
  text_id: string
  chapter_number: number
  title: string
  body: string
  word_count: number | null
  created_at: string
}

export interface ReadingProgress {
  user_id: string
  text_id: string
  chapter_id: string | null
  last_ratio: number
  updated_at: string
}

export interface TextWithProgress extends TextItem {
  chapters: TextChapter[]
  progress: ReadingProgress | null
}

export interface SaveProgressInput {
  text_id: string
  chapter_id: string | null
  last_ratio: number
}

// ── Sprint 6: Admin / Content Management ──────────────

export type ContentStatus = 'draft' | 'published' | 'archived'
export type UserRole      = 'student' | 'admin' | 'editor'
export type ExamType      = 'LGS' | 'TYT' | 'ALES' | 'KPSS' | 'General'

/** TextItem + Sprint 6 alanları (eski kayıtlarda undefined olabilir) */
export interface TextItemExtended extends TextItem {
  status:       ContentStatus
  cover_url:    string | null
  description:  string | null
  version:      number
  created_by:   string | null
  published_at: string | null
  updated_at:   string | null
}

export interface CreateTextInput {
  title:               string
  description:         string
  category:            string
  exam_type:           ExamType
  difficulty:          1 | 2 | 3 | 4 | 5
  estimated_read_time: number
  cover_url?:          string
  status:              ContentStatus
  tags:                string[]
}

export interface UpdateTextInput extends Partial<CreateTextInput> {
  id: string
}

export interface CreateChapterInput {
  text_id:        string
  chapter_number: number
  title:          string
  body:           string
  status:         'draft' | 'published'
}

export interface UpdateChapterInput extends Partial<CreateChapterInput> {
  id: string
}

export interface ContentAnalytics {
  text_id:            string
  title:              string
  exam_type:          string
  status:             ContentStatus
  total_readers:      number
  avg_completion_pct: number
  chapters_reached:   number
  last_read_at:       string | null
}

export interface AiMetadata {
  text_id:      string
  ai_summary:   string | null
  ai_difficulty: number | null
  ai_keywords:  string[]
  ai_exam_tags: string[]
  generated_at: string
  model_used:   string
}

export interface ChapterReorderInput {
  id:             string
  chapter_number: number
}

// ── Sprint 7: Adaptive Intelligence & Performance Layer ──

// ─── Chapter Session ──────────────────────────────────────

export interface ChapterSession {
  id: string
  user_id: string
  text_id: string
  chapter_id: string
  started_at: string
  completed_at: string | null
  duration_seconds: number
  completion_ratio: number
  avg_scroll_speed: number | null
  xp_earned: number
}

// difficulty intentionally excluded — never from client
export interface RecordChapterSessionInput {
  text_id: string
  chapter_id: string
  started_at: string
  duration_seconds: number
  completion_ratio: number
  avg_scroll_speed?: number
}

// ─── XP ───────────────────────────────────────────────────

export interface XpUpdateResult {
  xp_earned: number
  new_xp: number
  new_level: number
  level_up: boolean
}

// ─── Adaptive Profile ─────────────────────────────────────

export interface UserDifficultyProfile {
  user_id: string
  avg_wpm: number
  avg_completion: number
  difficulty_score: number
  recommended_level: 1 | 2 | 3 | 4 | 5
  sessions_analyzed: number
  updated_at: string
}

// ─── Recommendations ──────────────────────────────────────

export type RecommendationReason =
  | 'resume'
  | 'difficulty_match'
  | 'exam_match'
  | 'skill_match'    // Sprint 8

export interface RecommendedText extends TextItem {
  recommendation_reason: RecommendationReason
  match_score: number
}

// ─── Admin Analytics ──────────────────────────────────────

export interface ChapterDropoff {
  chapter_id: string
  chapter_title: string
  chapter_number: number
  text_id: string
  text_title: string
  total_sessions: number
  drop_off_count: number
  drop_off_pct: number
  avg_completion_pct: number
  avg_duration_min: number
}

export interface ReadersOverTime {
  reading_date: string
  unique_readers: number
  total_sessions: number
}

// ─── Performance Stats (PerformancePanel) ─────────────────

export interface ReadingStats {
  total_sessions: number
  total_duration_seconds: number
  avg_completion: number
  avg_wpm: number
}

export interface DailyReadingProgress {
  date: string
  sessions: number
  xp_earned: number
  duration_seconds: number
}

// ── Sprint 8: Comprehension & Exam Intelligence ────────

export type QuestionType = 'main_idea' | 'inference' | 'detail' | 'vocabulary' | 'tone'

export interface RecordQuestionSessionInput {
  text_id:               string
  chapter_id?:           string
  question_id:           string
  question_type:         QuestionType
  is_correct:            boolean
  response_time_seconds?: number
}

export interface QuestionSession {
  id:                    string
  user_id:               string
  text_id:               string
  chapter_id:            string | null
  question_id:           string
  question_type:         QuestionType
  is_correct:            boolean
  response_time_seconds: number | null
  created_at:            string
}

export interface UserExamProfile {
  user_id:               string
  main_idea_accuracy:    number
  inference_accuracy:    number
  detail_accuracy:       number
  vocabulary_accuracy:   number
  tone_accuracy:         number
  avg_response_time:     number
  risk_level:            1 | 2 | 3 | 4 | 5
  updated_at:            string
}

export type ReadingStyle = 'surface_reader' | 'deep_slow' | 'balanced'
export type ImprovementFocus = 'inference' | 'detail' | 'speed_control'

export interface ReadingExamCorrelation {
  avg_completion:      number
  avg_wpm:             number
  inference_accuracy:  number
  response_time:       number
  reading_style:       ReadingStyle
  risk_flags:          string[]
  improvement_focus:   ImprovementFocus
}

export interface ExamPrediction {
  predicted_exam_band: 'low' | 'medium' | 'high'
  confidence:          number   // 0..1
}

// ─── Admin Exam Analytics ──────────────────────────────

export interface ExamAccuracyByType {
  question_type:    QuestionType
  total_questions:  number
  correct_count:    number
  accuracy_pct:     number
  avg_response_sec: number | null
}

export interface RiskDistribution {
  risk_level:    number
  student_count: number
}

// ─── Sprint 9 — AI Mentor ──────────────────────────────

export type MentorImprovementFocus =
  | 'inference' | 'detail' | 'speed_control' | 'vocabulary' | 'consistency'

export interface AiMentorFeedback {
  id:                string
  user_id:           string
  feedback_text:     string
  key_insight:       string
  action_items:      string[]
  improvement_focus: MentorImprovementFocus
  weak_skill:        string | null
  risk_level:        number | null
  session_count:     number
  seen_at:           string | null
  generated_at:      string
}
