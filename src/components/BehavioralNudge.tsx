/**
 * 🧠 행동 편향 감지 & 넛지 시스템
 * 사용자가 자기도 모르게 놓치는 것들을 잡아주는 컴포넌트
 */
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Mascot } from "@/components/Mascot";
import type { Database } from "@/integrations/supabase/types";

type Holding = Database["public"]["Tables"]["holdings"]["Row"];

interface Bias {
  type: string;
  severity: "low" | "medium" | "high";
  evidence: string;
  nudge: string;
}

interface BiasAnalysis {
  biases: Bias[];
  overall_pattern?: string;
  growth_area?: string;
  strength?: string;
  nudge?: string;
}

const BIAS_LABELS: Record<string, { emoji: string; name: string }> = {
  fomo: { emoji: "🏃", name: "FOMO" },
  overconfidence: { emoji: "😤", name: "과잉 확신" },
  loss_aversion: { emoji: "😰", name: "손실 회피" },
  anchoring: { emoji: "⚓", name: "앵커링" },
  recency: { emoji: "🔄", name: "최신 편향" },
  herd: { emoji: "🐑", name: "군중 심리" },
  expectation_gap: { emoji: "📈", name: "기대 격차" },
  time_value_blind: { emoji: "⏰", name: "시간 가치 간과" },
};

const SEVERITY_COLORS: Record<string, string> = {
  low: "bg-accent text-accent-foreground",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-destructive/10 text-destructive",
};

interface BehavioralNudgeProps {
  userId: string;
  holdings: Holding[];
  triggerAfterLesson?: boolean;
}

export function BehavioralNudge({ userId, holdings, triggerAfterLesson }: BehavioralNudgeProps) {
  const [analysis, setAnalysis] = useState<BiasAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [expandedBias, setExpandedBias] = useState<number | null>(null);

  useEffect(() => {
    if (!triggerAfterLesson || dismissed) return;

    const analyze = async () => {
      setLoading(true);
      try {
        // Get recent sentences (last 7 days)
        const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
        const { data: sentences } = await supabase
          .from("sentences")
          .select("question_text, answer_text")
          .eq("user_id", userId)
          .gte("created_at", weekAgo)
          .order("created_at", { ascending: false })
          .limit(10);

        if (!sentences || sentences.length < 2) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.functions.invoke("analyze-bias", {
          body: { sentences, holdings },
        });

        if (!error && data && !data.error) {
          setAnalysis(data);
        }
      } catch {
        // Silently fail - nudges are supplementary
      }
      setLoading(false);
    };

    // Delay slightly so it doesn't compete with lesson completion animation
    const timer = setTimeout(analyze, 2000);
    return () => clearTimeout(timer);
  }, [userId, holdings, triggerAfterLesson, dismissed]);

  if (dismissed || loading || !analysis) return null;
  if (!analysis.nudge && analysis.biases.length === 0) return null;

  return (
    <div className="w-full max-w-sm animate-slide-up">
      {/* Main nudge card */}
      <div className="bg-card border border-border rounded-2xl p-4 mb-3">
        <div className="flex items-start gap-3 mb-3">
          <Mascot mood="thinking" size="sm" />
          <div className="flex-1">
            <p className="text-xs font-bold text-primary mb-1">🧠 오늘의 행동 인사이트</p>
            {analysis.nudge && (
              <p className="text-small text-foreground leading-relaxed">{analysis.nudge}</p>
            )}
          </div>
        </div>

        {/* Strength - always show positive first */}
        {analysis.strength && (
          <div className="bg-primary/5 rounded-xl px-3 py-2 mb-2 flex items-center gap-2">
            <span className="text-xs">✨</span>
            <p className="text-xs text-primary">{analysis.strength}</p>
          </div>
        )}

        {/* Detected biases */}
        {analysis.biases.length > 0 && (
          <div className="space-y-2 mt-3">
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              감지된 패턴
            </p>
            {analysis.biases.map((bias, i) => {
              const label = BIAS_LABELS[bias.type] || { emoji: "🔍", name: bias.type };
              const isExpanded = expandedBias === i;
              return (
                <button
                  key={i}
                  onClick={() => setExpandedBias(isExpanded ? null : i)}
                  className={`w-full text-left rounded-xl p-3 transition-all ${SEVERITY_COLORS[bias.severity]} hover:opacity-90`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{label.emoji}</span>
                    <span className="text-xs font-bold">{label.name}</span>
                    <span className={`ml-auto text-[10px] transition-transform ${isExpanded ? "rotate-90" : ""}`}>▶</span>
                  </div>
                  {isExpanded && (
                    <div className="mt-2 space-y-1 animate-fade-in">
                      <p className="text-[11px] opacity-80">{bias.evidence}</p>
                      <p className="text-[11px] font-medium mt-1">💡 {bias.nudge}</p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Growth area */}
        {analysis.growth_area && (
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-[10px] text-muted-foreground mb-1">🌱 성장 포인트</p>
            <p className="text-xs text-foreground">{analysis.growth_area}</p>
          </div>
        )}
      </div>

      <button
        onClick={() => setDismissed(true)}
        className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
      >
        확인했어요 ✓
      </button>
    </div>
  );
}
