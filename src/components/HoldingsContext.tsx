import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Holding = Database["public"]["Tables"]["holdings"]["Row"];
type Sentence = Database["public"]["Tables"]["sentences"]["Row"];

interface HoldingsContextProps {
  userId: string;
  holdings: Holding[];
  currentHolding?: Holding | null;
}

interface HoldingInsight {
  ticker: string;
  name: string;
  sentenceCount: number;
  lastWritten: string | null;
  recentSentence: string | null;
  daysSinceLastWrite: number | null;
}

export function HoldingsContext({ userId, holdings, currentHolding }: HoldingsContextProps) {
  const [insights, setInsights] = useState<HoldingInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      // Get recent sentences per holding
      const { data: sentences } = await supabase
        .from("sentences")
        .select("holding_id, answer_text, created_at")
        .eq("user_id", userId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(100);

      const today = new Date();
      const holdingInsights: HoldingInsight[] = holdings.map(h => {
        const holdingSentences = (sentences || []).filter(s => s.holding_id === h.id);
        const latest = holdingSentences[0];
        const daysSince = latest
          ? Math.floor((today.getTime() - new Date(latest.created_at).getTime()) / 86400000)
          : null;

        return {
          ticker: h.ticker,
          name: h.company_name_kr,
          sentenceCount: h.sentence_count,
          lastWritten: latest?.created_at || null,
          recentSentence: latest?.answer_text || null,
          daysSinceLastWrite: daysSince,
        };
      });

      // Sort: least practiced first
      holdingInsights.sort((a, b) => a.sentenceCount - b.sentenceCount);
      setInsights(holdingInsights);
      setLoading(false);
    };
    fetch();
  }, [userId, holdings]);

  if (loading || insights.length === 0) return null;

  // Find holdings that need attention
  const neglected = insights.filter(i =>
    i.daysSinceLastWrite === null || i.daysSinceLastWrite >= 3
  );

  const currentInsight = currentHolding
    ? insights.find(i => i.ticker === currentHolding.ticker)
    : null;

  return (
    <div className="bg-accent/30 border border-border rounded-xl p-3 mb-3 animate-fade-in">
      {/* Current holding context */}
      {currentInsight && (
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-primary">{currentInsight.ticker}</span>
            <span className="text-[10px] text-muted-foreground">{currentInsight.name}</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span>📝 {currentInsight.sentenceCount}문장 작성</span>
            {currentInsight.daysSinceLastWrite !== null && (
              <span>
                {currentInsight.daysSinceLastWrite === 0
                  ? "✅ 오늘 기록함"
                  : `⏰ ${currentInsight.daysSinceLastWrite}일 전 마지막 기록`}
              </span>
            )}
          </div>
          {currentInsight.recentSentence && (
            <p className="text-[10px] text-foreground/60 mt-1 italic line-clamp-1">
              💬 지난 기록: "{currentInsight.recentSentence.slice(0, 40)}..."
            </p>
          )}
        </div>
      )}

      {/* Neglected holdings hint */}
      {neglected.length > 0 && !currentInsight && (
        <div className="flex items-start gap-2">
          <span className="text-sm">💡</span>
          <div>
            <p className="text-[11px] text-foreground font-medium">
              {neglected[0].name}({neglected[0].ticker})에 대해 써본 적이 {
                neglected[0].sentenceCount === 0 ? "없어요" : `${neglected[0].daysSinceLastWrite}일째 없어요`
              }
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              다양한 종목에 대해 생각해보면 편향을 줄일 수 있어요
            </p>
          </div>
        </div>
      )}

      {/* Holdings practice heat map */}
      <div className="flex gap-1.5 mt-2 flex-wrap">
        {insights.map(i => {
          const intensity = Math.min(1, i.sentenceCount / 10);
          const isNeglected = i.daysSinceLastWrite === null || i.daysSinceLastWrite >= 3;
          const isCurrent = currentHolding?.ticker === i.ticker;
          return (
            <div
              key={i.ticker}
              className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
                isCurrent
                  ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                  : isNeglected
                  ? "bg-destructive/10 text-destructive border border-destructive/20"
                  : "bg-primary/10 text-primary"
              }`}
              title={`${i.name}: ${i.sentenceCount}문장`}
              style={!isCurrent && !isNeglected ? { opacity: 0.5 + intensity * 0.5 } : undefined}
            >
              {i.ticker}
              <span className="ml-1 opacity-70">{i.sentenceCount}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
