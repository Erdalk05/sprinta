import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useAuthStore } from '../stores/authStore';

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);

export function useAiCoach() {
  const { student } = useAuthStore();
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [weeklyReport, setWeeklyReport] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function getDailyRecommendation() {
    if (!student) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-coach', {
        body: { studentId: student.id },
      });
      if (!error && data.success) {
        setRecommendation(data.recommendation);
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function getWeeklyReport() {
    if (!student) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-weekly-report', {
        body: { studentId: student.id },
      });
      if (!error && data.success) {
        setWeeklyReport(data.report);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return { recommendation, weeklyReport, isLoading, getDailyRecommendation, getWeeklyReport };
}
