import { supabase } from "@/integrations/supabase/client";
import { registerWeeklyQuestions } from "@/data/quizQuestions";

let loading: Promise<void> | null = null;

/** 최근 4주 주간 AI 검수 문항을 하루 퀴즈 풀에 한 번만 주입 (실패 시 정적 풀만 사용) */
export function ensureWeeklyQuestions(): Promise<void> {
  if (!loading) {
    loading = (async () => {
      try {
        const since = new Date(Date.now() - 28 * 86400000).toISOString().slice(0, 10);
        const { data } = await supabase
          .from("weekly_questions")
          .select("category, statement, answer, explanation, insight")
          .gte("week_start", since)
          .order("week_start", { ascending: false });
        if (data) registerWeeklyQuestions(data);
      } catch {
        /* 폴백: 정적 풀 */
      }
    })();
  }
  return loading;
}
