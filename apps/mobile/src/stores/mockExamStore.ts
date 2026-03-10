/**
 * mockExamStore — Mock Sınav State (Zustand)
 * Sınav süreci: yükle → çöz → gönder → sonuç
 */
import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export interface ExamQuestion {
  id: string
  textId: string
  textTitle: string
  textBody: string
  category: string
  questionText: string
  options: string[]
  correctIndex: number
  explanation: string
  difficulty: number
  orderIndex: number
}

export interface ExamAnswer {
  questionId: string
  selectedIndex: number | null   // null = boş
  timeSpentMs: number
  isFlagged: boolean
}

export interface MockExamResult {
  examId: string
  correct: number
  wrong: number
  empty: number
  net: number
  timeSpentSeconds: number
  byCategory: Record<string, { correct: number; wrong: number; empty: number }>
}

interface MockExamState {
  // Config
  examType: string
  subject: string | null
  durationSeconds: number

  // Questions
  questions: ExamQuestion[]
  loading: boolean
  error: string | null

  // Session
  currentIndex: number
  answers: Record<string, ExamAnswer>
  startedAt: Date | null
  timeRemaining: number   // saniye
  isRunning: boolean

  // Result
  result: MockExamResult | null
  submitting: boolean

  // Actions
  loadQuestions: (examType: string, subject?: string, count?: number) => Promise<void>
  startExam: () => void
  tickTimer: () => void
  goTo: (index: number) => void
  answer: (questionId: string, selectedIndex: number, timeSpentMs: number) => void
  toggleFlag: (questionId: string) => void
  submitExam: (studentId: string) => Promise<void>
  reset: () => void
}

const EXAM_DURATION: Record<string, number> = {
  LGS:    25 * 60,   // 25 dk (her ders)
  TYT:    40 * 60,   // 40 dk Türkçe
  AYT:    40 * 60,
  YDS:    60 * 60,   // 60 dk
  YOKDIL: 60 * 60,
  ALES:   30 * 60,
  KPSS:   45 * 60,
}

export const useMockExamStore = create<MockExamState>((set, get) => ({
  examType: 'LGS',
  subject: null,
  durationSeconds: 25 * 60,

  questions: [],
  loading: false,
  error: null,

  currentIndex: 0,
  answers: {},
  startedAt: null,
  timeRemaining: 25 * 60,
  isRunning: false,

  result: null,
  submitting: false,

  loadQuestions: async (examType, subject, count = 20) => {
    set({ loading: true, error: null, examType, subject: subject ?? null })

    let query = supabase
      .from('text_questions')
      .select(`
        id,
        text_id,
        question_text,
        options,
        correct_index,
        explanation,
        difficulty,
        order_index,
        text_library!inner (
          title,
          body,
          category,
          exam_type
        )
      `)
      .eq('text_library.exam_type', examType)
      .order('difficulty', { ascending: true })

    if (subject) {
      query = query.ilike('text_library.category', `%${subject}%`)
    }

    const { data, error } = await query.limit(count)

    if (error) {
      set({ loading: false, error: error.message })
      return
    }

    const questions: ExamQuestion[] = (data ?? []).map((row: any) => ({
      id: row.id,
      textId: row.text_id,
      textTitle: row.text_library?.title ?? '',
      textBody: row.text_library?.body ?? '',
      category: row.text_library?.category ?? '',
      questionText: row.question_text,
      options: Array.isArray(row.options) ? row.options : [],
      correctIndex: row.correct_index,
      explanation: row.explanation ?? '',
      difficulty: row.difficulty,
      orderIndex: row.order_index,
    }))

    const duration = EXAM_DURATION[examType] ?? 30 * 60
    set({
      loading: false,
      questions,
      durationSeconds: duration,
      timeRemaining: duration,
      currentIndex: 0,
      answers: {},
      result: null,
    })
  },

  startExam: () => {
    set({ startedAt: new Date(), isRunning: true })
  },

  tickTimer: () => {
    const { timeRemaining, isRunning } = get()
    if (!isRunning || timeRemaining <= 0) return
    const next = timeRemaining - 1
    if (next <= 0) {
      set({ timeRemaining: 0, isRunning: false })
    } else {
      set({ timeRemaining: next })
    }
  },

  goTo: (index) => {
    const { questions } = get()
    if (index >= 0 && index < questions.length) {
      set({ currentIndex: index })
    }
  },

  answer: (questionId, selectedIndex, timeSpentMs) => {
    const { answers } = get()
    set({
      answers: {
        ...answers,
        [questionId]: {
          questionId,
          selectedIndex,
          timeSpentMs,
          isFlagged: answers[questionId]?.isFlagged ?? false,
        },
      },
    })
  },

  toggleFlag: (questionId) => {
    const { answers } = get()
    const existing = answers[questionId]
    set({
      answers: {
        ...answers,
        [questionId]: {
          questionId,
          selectedIndex: existing?.selectedIndex ?? null,
          timeSpentMs: existing?.timeSpentMs ?? 0,
          isFlagged: !(existing?.isFlagged ?? false),
        },
      },
    })
  },

  submitExam: async (studentId) => {
    const { questions, answers, examType, subject, durationSeconds, timeRemaining, startedAt } = get()
    set({ submitting: true, isRunning: false })

    const timeSpentSeconds = durationSeconds - timeRemaining

    // Skor hesapla
    let correct = 0, wrong = 0, empty = 0
    const byCategory: Record<string, { correct: number; wrong: number; empty: number }> = {}

    questions.forEach((q) => {
      const ans = answers[q.id]
      const cat = q.category

      if (!byCategory[cat]) byCategory[cat] = { correct: 0, wrong: 0, empty: 0 }

      if (ans?.selectedIndex == null) {
        empty++
        byCategory[cat].empty++
      } else if (ans.selectedIndex === q.correctIndex) {
        correct++
        byCategory[cat].correct++
      } else {
        wrong++
        byCategory[cat].wrong++
      }
    })

    const net = correct - wrong * 0.25

    // Supabase'e kaydet
    try {
      const { data: examData } = await supabase
        .from('mock_exams')
        .insert({
          student_id: studentId,
          exam_type: examType,
          subject: subject,
          question_count: questions.length,
          duration_seconds: durationSeconds,
          started_at: startedAt?.toISOString(),
          finished_at: new Date().toISOString(),
          time_spent_seconds: timeSpentSeconds,
          correct_count: correct,
          wrong_count: wrong,
          empty_count: empty,
          subject_breakdown: byCategory,
        })
        .select('id')
        .single()

      const examId = examData?.id

      if (examId) {
        const answerRows = questions.map((q) => {
          const ans = answers[q.id]
          return {
            exam_id: examId,
            student_id: studentId,
            question_id: q.id,
            selected_index: ans?.selectedIndex ?? null,
            is_correct: ans?.selectedIndex != null ? ans.selectedIndex === q.correctIndex : false,
            time_spent_ms: ans?.timeSpentMs ?? 0,
            is_flagged: ans?.isFlagged ?? false,
          }
        })

        await supabase.from('mock_exam_answers').insert(answerRows)
      }

      set({
        submitting: false,
        result: {
          examId: examId ?? '',
          correct,
          wrong,
          empty,
          net,
          timeSpentSeconds,
          byCategory,
        },
      })
    } catch (err) {
      set({ submitting: false })
    }
  },

  reset: () => {
    set({
      questions: [],
      loading: false,
      error: null,
      currentIndex: 0,
      answers: {},
      startedAt: null,
      timeRemaining: 25 * 60,
      isRunning: false,
      result: null,
      submitting: false,
    })
  },
}))
