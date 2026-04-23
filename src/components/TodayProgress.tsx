import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, TrendingUp, ArrowUp } from "lucide-react";

interface TodayProgressProps {
  userId: string;
  totalSentences: number;
  currentStreak: number;
  todayDone: boolean;
}

export function TodayProgress({ userId, totalSentences, currentStreak, todayDone }: TodayProgressProps) {
  const [insight, setInsight] = useState<string | null>(null);
  const [todayCount, setTodayCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const fetchTodayData = async () => {
      const today = new Date().toISOString().split("T")[0];
      const todayStart = `${today}T00:00:00.000Z`;

      // Get today's sentences
      const { data: todaySentences } = await supabase
        .from("sentences")
        .select("question_text, answer_text")
        .eq("user_id", userId)
        .is("deleted_at", null)
        .gte("created_at", todayStart);

      const count = todaySentences?.length || 0;
      setTodayCount(count);

      // Generate AI insight if user wrote sentences today
      if (count > 0 && !loading) {
        setLoading(true);
        try {
          const { data, error } = await supabase.functions.invoke("generate-daily-insight", {
            body: { sentences: todaySentences },
          });
          if (!error && data?.insight) {
            setInsight(data.insight);
          }
        } catch {
          // Silently fail - fallback handled
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTodayData();
  }, [userId, todayDone]);

  // Calculate deltas (simulated from today's activity)
  const skillDelta = todayCount * 1; // Each sentence = ~1 skill point
  const streakText = currentStreak > 1 ? `${currentStreak}일 연속 🔥` : "오늘 시작!";

  if (!todayDone && todayCount === 0) return null;

  return (
    <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
      {/* Today's progress header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-primary" />
          <p className="text-small font-bold text-foreground">오늘의 성장</p>
        </div>
        <span className="text-[10px] text-muted-foreground">{streakText}</span>
      </div>

      {/* Delta chips */}
      <div className="flex flex-wrap gap-2">
        {todayCount > 0 && (
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
            <ArrowUp size={10} />
            문장 +{todayCount}
          </div>
        )}
        {skillDelta > 0 && (
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#8B5CF6]/10 text-[#8B5CF6] text-[11px] font-semibold">
            <ArrowUp size={10} />
            스킬 +{skillDelta}
          </div>
        )}
        {currentStreak > 0 && (
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] text-[11px] font-semibold">
            🔥 {currentStreak}일
          </div>
        )}
      </div>

      {/* AI Insight */}
      {(insight || loading) && (
        <div className="bg-accent/50 rounded-xl px-3 py-2.5 flex items-start gap-2">
          <Sparkles size={13} className="text-primary shrink-0 mt-0.5" />
          {loading ? (
            <p className="text-[11px] text-muted-foreground animate-pulse">인사이트 분석 중...</p>
          ) : (
            <p className="text-[11px] text-foreground leading-relaxed">{insight}</p>
          )}
        </div>
      )}
    </div>
  );
}
