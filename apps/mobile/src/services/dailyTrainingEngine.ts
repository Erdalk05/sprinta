/**
 * Daily Training Engine — Günlük Karışık Antrenman Planı Üretici
 *
 * generateDailyPlan(userStats):
 *  1. Son 3 gündeki egzersizleri hariç tut
 *  2. Zayıf kategoriyi tespit et (en düşük focusStabilityScore ortalaması)
 *  3. Zayıf kategoriye 1.3× ağırlık uygula
 *  4. 4 egzersiz seç
 *  5. Ard arda aynı kategori olmasın, en az 2 farklı kategori
 */

import type { ExerciseId, DifficultyLevel } from '../features/visual-mechanics/constants/exerciseConfig'
import type { ExerciseResult } from '../features/visual-mechanics/store/visualMechanicsStore'

// ─── Kategori tanımları ───────────────────────────────────────────
export type ExerciseCategory =
  | 'sakkadik'
  | 'periferik'
  | 'fiksasyon'
  | 'dayanıklılık'
  | 'refleks'

export const EXERCISE_CATEGORIES: Record<ExerciseId, ExerciseCategory> = {
  flash_jump_matrix:        'sakkadik',
  vertical_pulse_track:     'fiksasyon',
  diagonal_laser_dash:      'sakkadik',
  peripheral_flash_hunter:  'periferik',
  expanding_rings_focus:    'periferik',
  speed_dot_storm:          'dayanıklılık',
  opposite_pull:            'refleks',
  random_blink_trap:        'dayanıklılık',
  circular_orbit_chase:     'fiksasyon',
  shrink_zoom_focus:        'fiksasyon',
  double_target_switch:     'sakkadik',
  line_scan_sprint:         'sakkadik',
  split_screen_mirror:      'periferik',
  micro_pause_react:        'refleks',
  tunnel_vision_breaker:    'periferik',
}

const ALL_CATEGORIES: ExerciseCategory[] = [
  'sakkadik', 'periferik', 'fiksasyon', 'dayanıklılık', 'refleks',
]

// ─── Types ────────────────────────────────────────────────────────
export interface DailyPlanExercise {
  exerciseId:  ExerciseId
  category:    ExerciseCategory
  level:       DifficultyLevel
}

export interface DailyPlan {
  exercises:        DailyPlanExercise[]
  weakestCategory:  ExerciseCategory
  generatedAt:      string
}

export interface UserStats {
  completedExercises: ExerciseResult[]
  lastSelectedLevel:  DifficultyLevel
}

// ─── Weighted random helper ───────────────────────────────────────
function weightedSample(
  items: { id: ExerciseId; weight: number }[],
  count: number,
): ExerciseId[] {
  const result: ExerciseId[] = []
  const pool = [...items]
  while (result.length < count && pool.length > 0) {
    const total = pool.reduce((s, e) => s + e.weight, 0)
    let r = Math.random() * total
    let idx = pool.length - 1
    for (let i = 0; i < pool.length; i++) {
      r -= pool[i].weight
      if (r <= 0) { idx = i; break }
    }
    result.push(pool[idx].id)
    pool.splice(idx, 1)
  }
  return result
}

// ─── Ana fonksiyon ───────────────────────────────────────────────
export function generateDailyPlan(stats: UserStats): DailyPlan {
  const { completedExercises, lastSelectedLevel } = stats
  const allIds = Object.keys(EXERCISE_CATEGORIES) as ExerciseId[]

  // 1. Son 3 gündeki egzersizleri hariç tut
  const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000
  const recentIds = new Set(
    completedExercises
      .filter((r) => new Date(r.completedAt).getTime() > threeDaysAgo)
      .map((r) => r.exerciseId),
  )
  const pool = allIds.filter((id) => !recentIds.has(id))
  const effectivePool = pool.length >= 4 ? pool : allIds

  // 2. Zayıf kategoriyi bul (en düşük ortalama focusStabilityScore)
  const catStats: Partial<Record<ExerciseCategory, { sum: number; cnt: number }>> = {}
  for (const r of completedExercises) {
    const cat = EXERCISE_CATEGORIES[r.exerciseId]
    if (!catStats[cat]) catStats[cat] = { sum: 0, cnt: 0 }
    catStats[cat]!.sum += r.focusStabilityScore
    catStats[cat]!.cnt++
  }
  let weakestCategory: ExerciseCategory = 'periferik'
  let lowestAvg = Infinity
  for (const cat of ALL_CATEGORIES) {
    const d = catStats[cat]
    const avg = d ? d.sum / d.cnt : 50
    if (avg < lowestAvg) { lowestAvg = avg; weakestCategory = cat }
  }

  // 3. Ağırlık uygula
  const weighted = effectivePool.map((id) => ({
    id,
    weight: EXERCISE_CATEGORIES[id] === weakestCategory ? 1.3 : 1.0,
  }))

  // 4. 4 egzersiz seç
  const candidates = weightedSample(weighted, Math.min(8, effectivePool.length))

  // 5. Ard arda aynı kategori olmasın, en az 2 farklı kategori
  const selected: ExerciseId[] = []
  const usedCats: ExerciseCategory[] = []

  for (const id of candidates) {
    if (selected.length >= 4) break
    const cat = EXERCISE_CATEGORIES[id]
    const last = usedCats[usedCats.length - 1]
    if (cat === last) continue
    selected.push(id)
    usedCats.push(cat)
  }

  // Yeterli seçim yoksa kalan adaylardan tamamla
  if (selected.length < 4) {
    for (const id of candidates) {
      if (selected.length >= 4) break
      if (!selected.includes(id)) selected.push(id)
    }
  }

  // Ensure at least 2 categories — fallback (usually satisfied above)
  const uniqueCats = new Set(selected.map((id) => EXERCISE_CATEGORIES[id]))
  if (uniqueCats.size < 2 && selected.length >= 2) {
    // swap second item with a different category from candidates
    for (const id of candidates) {
      if (EXERCISE_CATEGORIES[id] !== EXERCISE_CATEGORIES[selected[0]]) {
        selected[1] = id; break
      }
    }
  }

  // Suggested level: average of last 5 sessions, min 1
  const recentResults = [...completedExercises].slice(-5)
  const suggestedLevel: DifficultyLevel =
    recentResults.length > 0
      ? (Math.min(4, Math.max(1, Math.round(
          recentResults.reduce((s, r) => s + r.level, 0) / recentResults.length,
        ))) as DifficultyLevel)
      : lastSelectedLevel

  return {
    exercises: selected.map((id) => ({
      exerciseId: id,
      category:   EXERCISE_CATEGORIES[id],
      level:      suggestedLevel,
    })),
    weakestCategory,
    generatedAt: new Date().toISOString(),
  }
}

// ─── Kategori görsel yardımcıları ─────────────────────────────────
export const CATEGORY_META: Record<ExerciseCategory, { icon: string; label: string; color: string }> = {
  sakkadik:     { icon: '⚡', label: 'Sakkadik',     color: '#F59E0B' },
  periferik:    { icon: '👁️', label: 'Periferik',    color: '#0EA5E9' },
  fiksasyon:    { icon: '🎯', label: 'Fiksasyon',    color: '#8B5CF6' },
  dayanıklılık: { icon: '🔥', label: 'Dayanıklılık', color: '#EF4444' },
  refleks:      { icon: '⚡', label: 'Refleks',      color: '#10B981' },
}
