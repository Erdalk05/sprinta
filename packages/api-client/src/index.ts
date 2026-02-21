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
export { PurchasesService } from './services/purchases'
export type { Database } from './types/database'
