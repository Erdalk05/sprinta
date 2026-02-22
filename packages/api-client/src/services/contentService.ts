// eslint-disable-next-line @typescript-eslint/no-explicit-any
import type { SupabaseClient } from '@supabase/supabase-js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createContentService(supabase: SupabaseClient<any>) {
  return {
    /**
     * Öğrencinin profiline uygun metin getir
     * Şema: body (metin), estimated_wpm_target, is_published
     */
    async getAdaptiveContent(params: {
      studentId: string;
      exerciseType: string;
      difficulty: number;
      examTarget: string;
      excludeIds?: string[];
    }) {
      // Sayısal difficulty → enum değeri
      const difficultyEnum = mapDifficultyToEnum(params.difficulty);

      const excludeList = params.excludeIds ?? [];

      let query = supabase
        .from('content_library')
        .select('id, title, body, category, difficulty, word_count, questions')
        .contains('exam_types', [params.examTarget])
        .eq('difficulty', difficultyEnum)
        .eq('is_published', true)
        .limit(1);

      if (excludeList.length > 0) {
        query = query.not('id', 'in', `(${excludeList.join(',')})`);
      }

      const { data } = await query.single();
      return data;
    },

    /**
     * Son kullanılan metinlerin ID'lerini getir (tekrar önlemek için)
     */
    async getRecentlyUsedContentIds(
      studentId: string,
      limit = 20
    ): Promise<string[]> {
      const { data } = await supabase
        .from('sessions')
        .select('metrics')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(limit);

      const ids: string[] = [];
      data?.forEach((session: { metrics: unknown }) => {
        const metrics = session.metrics as Record<string, unknown> | null;
        const contentId = metrics?.['contentId'] as string | undefined;
        if (contentId) ids.push(contentId);
      });

      return ids;
    },
  };
}

/** Sayısal güçlük (1-10) → content_difficulty enum */
function mapDifficultyToEnum(difficulty: number): string {
  if (difficulty <= 2) return 'cok_kolay';
  if (difficulty <= 4) return 'kolay';
  if (difficulty <= 6) return 'orta';
  if (difficulty <= 8) return 'zor';
  return 'cok_zor';
}
