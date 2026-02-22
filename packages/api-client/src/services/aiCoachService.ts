import type { SupabaseClient } from '@supabase/supabase-js'

export type AICoachMode = 'morning_briefing' | 'chat' | 'analyze_weakness' | 'generate_content'

export interface ChatMessage {
  role:    'user' | 'assistant'
  content: string
}

export interface AICoachResponse {
  success:      boolean
  reply:        string
  mode:         AICoachMode
  model?:       string
  inputTokens?:  number
  outputTokens?: number
  error?:       string
}

export function createAICoachService(supabase: SupabaseClient) {
  const call = async (params: {
    studentId: string
    mode:      AICoachMode
    message?:  string
    history?:  ChatMessage[]
  }): Promise<AICoachResponse> => {
    const { data, error } = await supabase.functions.invoke('ai-coach', {
      body: params,
    })
    if (error) throw error
    return data as AICoachResponse
  }

  return {
    /** Kişisel sabah brifingi */
    getMorningBriefing: (studentId: string) =>
      call({ studentId, mode: 'morning_briefing' }),

    /** Zayıflık analizi */
    analyzeWeakness: (studentId: string) =>
      call({ studentId, mode: 'analyze_weakness' }),

    /** Adaptif içerik üretimi */
    generateContent: (studentId: string) =>
      call({ studentId, mode: 'generate_content' }),

    /** Serbest sohbet (çok turlu) */
    chat: (studentId: string, message: string, history: ChatMessage[] = []) =>
      call({ studentId, mode: 'chat', message, history }),
  }
}
