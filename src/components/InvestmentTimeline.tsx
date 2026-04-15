import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { QuestionBadge } from "@/components/QuestionBadge";
import type { Database } from "@/integrations/supabase/types";
import type { QuestionType } from "@/styles/colors";

type Sentence = Database["public"]["Tables"]["sentences"]["Row"];
type Holding = Database["public"]["Tables"]["holdings"]["Row"];

interface DayGroup {
  date: string;
  label: string;
  sentences: (Sentence & { holding?: Holding })[];
  totalForDay: number;
}

interface InvestmentTimelineProps {
  userId: string;
  holdings: Holding[];
}

export function InvestmentTimeline({ userId, holdings }: InvestmentTimelineProps) {
  const [groups, setGroups] = useState<DayGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("sentences")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (!data) { setLoading(false); return; }

      const holdingMap = new Map(holdings.map(h => [h.id, h]));
      const dayMap = new Map<string, Sentence[]>();

      data.forEach(s => {
        const date = new Date(s.created_at).toISOString().split("T")[0];
        if (!dayMap.has(date)) dayMap.set(date, []);
        dayMap.get(date)!.push(s);
      });

      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

      const result: DayGroup[] = [];
      dayMap.forEach((sentences, date) => {
        let label: string;
        if (date === today) label = "오늘";
        else if (date === yesterday) label = "어제";
        else {
          const d = new Date(date + "T00:00:00");
          label = `${d.getMonth() + 1}월 ${d.getDate()}일`;
        }
        result.push({
          date,
          label,
          sentences: sentences.map(s => ({ ...s, holding: holdingMap.get(s.holding_id) })),
          totalForDay: sentences.length,
        });
      });

      result.sort((a, b) => b.date.localeCompare(a.date));
      setGroups(result);
      if (result.length > 0) setExpandedDay(result[0].date);
      setLoading(false);
    };
    fetch();
  }, [userId, holdings]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="text-center py-8">
        <span className="text-4xl block mb-2">📖</span>
        <p className="text-small font-semibold text-foreground mb-1">투자 일기가 비어있어요</p>
        <p className="text-xs text-muted-foreground">레슨을 완료하면 타임라인이 채워져요!</p>
      </div>
    );
  }

  // Calculate streak info for timeline dots
  const consecutiveDays = groups.length;

  return (
    <div className="space-y-1">
      {/* Streak summary */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex -space-x-1">
          {groups.slice(0, 7).map((g, i) => (
            <div
              key={g.date}
              className="w-5 h-5 rounded-full border-2 border-background flex items-center justify-center text-[8px] font-bold"
              style={{
                backgroundColor: i === 0 ? "hsl(var(--primary))" : `hsl(var(--primary) / ${Math.max(0.2, 1 - i * 0.12)})`,
                color: i < 3 ? "white" : "hsl(var(--primary))",
              }}
            >
              {g.totalForDay}
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          최근 <strong className="text-foreground">{consecutiveDays}</strong>일 활동
        </p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-border" />

        {groups.map((group, gi) => {
          const isExpanded = expandedDay === group.date;
          return (
            <div key={group.date} className="relative pl-8 pb-4">
              {/* Timeline dot */}
              <div
                className={`absolute left-1.5 top-1 w-3 h-3 rounded-full border-2 border-background ${
                  gi === 0 ? "bg-primary" : "bg-muted-foreground/30"
                }`}
              />

              {/* Day header */}
              <button
                onClick={() => setExpandedDay(isExpanded ? null : group.date)}
                className="flex items-center gap-2 w-full text-left mb-1 group"
              >
                <span className={`text-xs font-bold ${gi === 0 ? "text-primary" : "text-foreground"}`}>
                  {group.label}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {group.totalForDay}문장
                </span>
                <span className={`text-[10px] text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`}>
                  ▶
                </span>
              </button>

              {/* Expanded entries */}
              {isExpanded && (
                <div className="space-y-2 animate-fade-in">
                  {group.sentences.map(s => (
                    <div
                      key={s.id}
                      className="bg-card border border-border rounded-xl p-3 hover:border-primary/20 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        {s.holding && (
                          <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                            {s.holding.ticker}
                          </span>
                        )}
                        <QuestionBadge type={s.question_type as QuestionType} />
                        <span className="text-[10px] text-muted-foreground ml-auto">
                          {new Date(s.created_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground italic mb-1 line-clamp-1">
                        Q: {s.question_text}
                      </p>
                      <p className="text-small text-foreground leading-relaxed">
                        {s.answer_text}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Collapsed preview */}
              {!isExpanded && group.sentences.length > 0 && (
                <div className="flex gap-1.5 flex-wrap">
                  {group.sentences.slice(0, 3).map(s => (
                    <span
                      key={s.id}
                      className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full"
                    >
                      {s.holding?.ticker || "종목"} · {s.answer_text.slice(0, 15)}...
                    </span>
                  ))}
                  {group.sentences.length > 3 && (
                    <span className="text-[10px] text-muted-foreground">+{group.sentences.length - 3}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
