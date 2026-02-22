import type { TopicId, Question } from './QuizEngine'

export interface QuizAnswer {
  questionId: string
  selectedOptionId: string
  responseTimeMs: number
}

export interface ARPResult {
  baseARP: number
  level: number
  strongTopic: TopicId
  weakTopic: TopicId
  scores: Record<TopicId, number>
  accuracy: number
  avgResponseTimeMs: number
}

const FAST_ANSWER_THRESHOLD_MS = 3000
const FAST_BONUS = 2

function normalize(raw: number, max: number): number {
  return Math.round((raw / max) * 400)
}

export function calculateResult(answers: QuizAnswer[], questions: Question[]): ARPResult {
  const scores: Partial<Record<TopicId, number>> = {}
  let totalCorrect = 0
  let totalResponseTime = 0

  for (const answer of answers) {
    const q = questions.find((x) => x.id === answer.questionId)
    if (!q) continue

    const isCorrect = answer.selectedOptionId === q.correctOptionId
    let score = 0

    if (isCorrect) {
      score = q.weight * 10
      totalCorrect++
      if (answer.responseTimeMs < FAST_ANSWER_THRESHOLD_MS) {
        score += FAST_BONUS
      }
    }

    const prev = scores[q.topicId] ?? 0
    scores[q.topicId] = prev + score
    totalResponseTime += answer.responseTimeMs
  }

  const allTopics: TopicId[] = [
    'reading_speed',
    'comprehension',
    'attention',
    'visual_tracking',
    'focus_duration',
  ]

  const fullScores: Record<TopicId, number> = {
    reading_speed: 0,
    comprehension: 0,
    attention: 0,
    visual_tracking: 0,
    focus_duration: 0,
  }

  for (const t of allTopics) {
    fullScores[t] = scores[t] ?? 0
  }

  // Sadece quiz'de sorulan konuları karşılaştır
  const usedTopics = questions.map((q) => q.topicId) as TopicId[]
  const usedScores = usedTopics.map((t) => ({ topic: t, score: fullScores[t] }))

  const sorted = [...usedScores].sort((a, b) => b.score - a.score)
  const strongTopic = sorted[0]?.topic ?? 'comprehension'
  const weakTopic = sorted[sorted.length - 1]?.topic ?? 'reading_speed'

  const maxPossible = questions.reduce((acc, q) => acc + q.weight * 10 + FAST_BONUS, 0)
  const totalScore = usedScores.reduce((acc, s) => acc + s.score, 0)

  const baseARP = Math.max(50, Math.min(400, normalize(totalScore, maxPossible)))
  const level = baseARP < 150 ? 1 : baseARP < 300 ? 2 : 3
  const accuracy = answers.length > 0 ? Math.round((totalCorrect / answers.length) * 100) : 0
  const avgResponseTimeMs = answers.length > 0 ? Math.round(totalResponseTime / answers.length) : 0

  return { baseARP, level, strongTopic, weakTopic, scores: fullScores, accuracy, avgResponseTimeMs }
}
