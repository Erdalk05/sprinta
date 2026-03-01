// =====================================================
// @sprinta/api — Admin Services
// Sprint 6: Content Management Engine
// =====================================================

export { createAdminContentService } from './adminContentService'
export type { AdminContentService }  from './adminContentService'

export { createAiGenerationService } from './aiGenerationService'
export type {
  AiGenerationService,
  AiGenerationRequest,
  AiGenerationResponse,
} from './aiGenerationService'

// Type re-exports for convenience
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
} from '../library/types'
