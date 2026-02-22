import { SupabaseClient } from '@supabase/supabase-js'

export interface ExamProgram {
  id: string
  examType: string
  title: string
  subtitle: string
  durationDays: number
  dailyMinutes: number
  targetArp: number
  color: string
  icon: string
  phases: Phase[]
  dailyTasks: DailyTask[]
}

export interface Phase {
  phase: number
  title: string
  days: [number, number]
  focus: string[]
  description: string
  target_wpm?: number
  target_comprehension?: number
}

export interface DailyTask {
  id: string
  module: string
  title: string
  duration: number
  required: boolean
}

export interface StudentProgram {
  id: string
  studentId: string
  programId: string
  examType: string
  startDate: string
  targetExamDate: string | null
  currentPhase: number
  currentDay: number
  progressPercent: number
  isActive: boolean
  program: ExamProgram
}

export function createProgramService(supabase: SupabaseClient<any>) {
  return {
    async getAllPrograms(): Promise<ExamProgram[]> {
      const { data, error } = await supabase
        .from('exam_programs')
        .select('*')
        .eq('is_active', true)
        .order('target_arp', { ascending: true })
      if (error || !data) return []
      return data.map(mapProgram)
    },

    async getProgramByExamType(examType: string): Promise<ExamProgram | null> {
      const { data, error } = await supabase
        .from('exam_programs')
        .select('*')
        .eq('exam_type', examType)
        .eq('is_active', true)
        .single()
      if (error || !data) return null
      return mapProgram(data)
    },

    async getActiveProgram(studentId: string): Promise<StudentProgram | null> {
      const { data, error } = await supabase
        .from('student_programs')
        .select('*, program:exam_programs(*)')
        .eq('student_id', studentId)
        .eq('is_active', true)
        .single()
      if (error || !data) return null
      return mapStudentProgram(data)
    },

    async startProgram(params: {
      studentId: string
      programId: string
      examType: string
      targetExamDate?: string
    }): Promise<StudentProgram | null> {
      // Önceki aktif programı pasife al
      await supabase
        .from('student_programs')
        .update({ is_active: false })
        .eq('student_id', params.studentId)
        .eq('is_active', true)

      const { data, error } = await supabase
        .from('student_programs')
        .insert({
          student_id:       params.studentId,
          program_id:       params.programId,
          exam_type:        params.examType,
          target_exam_date: params.targetExamDate ?? null,
          start_date:       new Date().toISOString().split('T')[0],
        })
        .select('*, program:exam_programs(*)')
        .single()
      if (error || !data) return null
      return mapStudentProgram(data)
    },

    async logDailyCompletion(params: {
      studentId: string
      programId: string
      dayNumber: number
      tasksDone: string[]
      arpAtLog: number
      minutesSpent: number
    }): Promise<void> {
      const today = new Date().toISOString().split('T')[0]
      await supabase.from('program_daily_logs').upsert({
        student_id:    params.studentId,
        program_id:    params.programId,
        log_date:      today,
        day_number:    params.dayNumber,
        tasks_done:    params.tasksDone,
        arp_at_log:    params.arpAtLog,
        minutes_spent: params.minutesSpent,
      })

      // İlerleme yüzdesini güncelle
      const { data: prog } = await supabase
        .from('student_programs')
        .select('id, current_day')
        .eq('student_id', params.studentId)
        .eq('is_active', true)
        .single()
      if (!prog) return

      const { data: program } = await supabase
        .from('exam_programs')
        .select('duration_days')
        .eq('id', prog.id)
        .single()

      const newDay = Math.max(prog.current_day, params.dayNumber + 1)
      const pct    = program
        ? Math.min(100, Math.round((newDay / program.duration_days) * 100))
        : 0

      await supabase
        .from('student_programs')
        .update({ current_day: newDay, progress_percent: pct, updated_at: new Date().toISOString() })
        .eq('student_id', params.studentId)
        .eq('is_active', true)
    },

    async getTodayLog(studentId: string, programId: string) {
      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabase
        .from('program_daily_logs')
        .select('*')
        .eq('student_id', studentId)
        .eq('program_id', programId)
        .eq('log_date', today)
        .single()
      return data
    },
  }
}

function mapProgram(d: any): ExamProgram {
  return {
    id:          d.id,
    examType:    d.exam_type,
    title:       d.title,
    subtitle:    d.subtitle,
    durationDays:d.duration_days,
    dailyMinutes:d.daily_minutes,
    targetArp:   d.target_arp,
    color:       d.color,
    icon:        d.icon,
    phases:      Array.isArray(d.phases) ? d.phases : [],
    dailyTasks:  Array.isArray(d.daily_tasks) ? d.daily_tasks : [],
  }
}

function mapStudentProgram(d: any): StudentProgram {
  return {
    id:             d.id,
    studentId:      d.student_id,
    programId:      d.program_id,
    examType:       d.exam_type,
    startDate:      d.start_date,
    targetExamDate: d.target_exam_date,
    currentPhase:   d.current_phase,
    currentDay:     d.current_day,
    progressPercent:d.progress_percent,
    isActive:       d.is_active,
    program:        mapProgram(d.program),
  }
}
