// @sprinta/api — Supabase servis katmanı

export { createSupabaseClient } from './services/supabase'
export { createAuthService, RegisterSchema, LoginSchema } from './services/auth'
export type { RegisterInput, LoginInput } from './services/auth'
export { createPerformancePipeline } from './services/performancePipeline'
export { createDiagnosticService } from './services/diagnosticService'
export type { SaveDiagnosticParams } from './services/diagnosticService'
export { createBadgeService } from './services/badgeService'
export type { Badge, StudentStats } from './services/badgeService'
export { createStreakService } from './services/streakService'
export { createContentService } from './services/contentService'
export { createProgramService } from './services/programService'
export type { ExamProgram, StudentProgram, Phase, DailyTask } from './services/programService'
export { createAICoachService } from './services/aiCoachService'
export type { AICoachMode, ChatMessage as AIChatMessage, AICoachResponse } from './services/aiCoachService'
export { createLeaderboardService } from './services/leaderboardService'
export type { LeaderboardEntry, Challenge, ChallengeType, LeaderboardSort } from './services/leaderboardService'
export { createChunkRsvpService } from './services/chunkRsvpService'
export type { WPMDataPoint } from './services/chunkRsvpService'
export { createFlowReadingService } from './services/flowReadingService'
export type { FlowReadingMetrics } from './services/flowReadingService'
export { createUserContentService, analyzeContent, suggestChunks } from './services/userContentService'
export type { UserContent, UserContentChunk, ContentAnalysis, SuggestedChunk } from './services/userContentService'
export type { Database } from './types/database'
export { createStarService, calculateStars } from './services/starService'
export type { GamificationState, DailyProgress, StarStreak, StarTotalStats, StarMilestone } from './services/starService'
export { createLibraryService } from './services/library/libraryService'
export type {
  TextItem, TextFilters, LibraryServiceResult,
  TextChapter, ReadingProgress, TextWithProgress, SaveProgressInput,
} from './services/library/types'

// ── Sprint 6: Admin / Content Management ──────────────
export { createAdminContentService } from './services/admin/adminContentService'
export type { AdminContentService }  from './services/admin/adminContentService'
export { createAiGenerationService } from './services/admin/aiGenerationService'
export type {
  AiGenerationService,
  AiGenerationRequest,
  AiGenerationResponse,
} from './services/admin/aiGenerationService'
export type {
  ContentStatus,
  UserRole,
  ExamType,
  TextItemExtended,
  CreateTextInput,
  UpdateTextInput,
  CreateChapterInput,
  UpdateChapterInput,
  ContentAnalytics,
  AiMetadata,
  ChapterReorderInput,
} from './services/library/types'

// ── Sprint 7: Adaptive Intelligence ───────────────────
export { createAdaptiveService } from './services/intelligence'
export type { AdaptiveService }  from './services/intelligence'
export type {
  ChapterSession,
  RecordChapterSessionInput,
  XpUpdateResult,
  UserDifficultyProfile,
  RecommendationReason,
  RecommendedText,
  ChapterDropoff,
  ReadersOverTime,
  ReadingStats,
  DailyReadingProgress,
} from './services/library/types'

// ── Sprint 8: Exam Intelligence ────────────────────────
export { createExamService } from './services/intelligence'
export type { ExamService }  from './services/intelligence'
export type {
  SkillFocus,
  QuestionType,
  RecordQuestionSessionInput,
  QuestionSession,
  UserExamProfile,
  ReadingStyle,
  ImprovementFocus,
  ReadingExamCorrelation,
  ExamPrediction,
  ExamAccuracyByType,
  RiskDistribution,
} from './services/library/types'

// ── Sprint 9: AI Academic Mentor ───────────────────────
export { createMentorService } from './services/intelligence'
export type { MentorService }  from './services/intelligence'
export type {
  AiMentorFeedback,
  MentorImprovementFocus,
} from './services/library/types'

// ── Sprint 10: Embedded Questions ──────────────────────
export { createQuestionService } from './services/intelligence'
export type { QuestionService, TextQuestion, QuestionAnswer } from './services/intelligence'

// ── Kartal Gözü: Eye Training ──────────────────────────
export { createEyeTrainingService } from './services/eyeTrainingService'
export type { EyeSessionPayload, EyeProgressEntry } from './services/eyeTrainingService'
