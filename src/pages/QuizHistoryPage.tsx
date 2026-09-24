import { useEffect, useMemo, useState } from "react";
import { Check, X, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { PpuriCard } from "@/components/PpuriCard";
import { todayKey } from "@/utils/dailySeed";

interface Attempt {
  id: string;
  day: string;
  question_text: string;
  user_answer: string | null;
  correct_answer: string | null;
  is_correct: boolean;
  explanation: string | null;
  category: string | null;
}

const POINTS_PER_CORRECT = 10;

export default function QuizHistoryPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Attempt[]>([]);
  const [totals, setTotals] = useState({ all: 0, correct: 0 });
  const [loading, setLoading] = useState(true);
  const [openDay, setOpenDay] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const since = new Date(Date.now() - 29 * 86400000);
      const [{ data }, allRes, correctRes] = await Promise.all([
        supabase
          .from("quiz_attempts")
          .select("id, day, question_text, user_answer, correct_answer, is_correct, explanation, category")
          .eq("user_id", user.id)
          .gte("day", todayKey(since))
          .order("created_at", { ascending: false }),
        supabase.from("quiz_attempts").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("quiz_attempts").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("is_correct", true),
      ]);
      setRows((data as Attempt[]) || []);
      setTotals({ all: allRes.count || 0, correct: correctRes.count || 0 });
      setOpenDay(todayKey());
      setLoading(false);
    })();
  }, [user]);

  const byDay = useMemo(() => {
    const m = new Map<string, Attempt[]>();
    rows.forEach((r) => m.set(r.day, [...(m.get(r.day) || []), r]));
    return m;
  }, [rows]);

  const last30 = useMemo(() => {
    const days: string[] = [];
    for (let i = 29; i >= 0; i--) days.push(todayKey(new Date(Date.now() - i * 86400000)));
    return days;
  }, []);

  const activeDays = last30.filter((d) => byDay.has(d)).length;
  const accuracy = totals.all ? Math.round((totals.correct / totals.all) * 100) : 0;

  return (
    <Layout>
      <h2 className="text-title font-bold text-foreground">나의 문제 기록</h2>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "누적 점수", value: `${totals.correct * POINTS_PER_CORRECT}` },
          { label: "정답률", value: `${accuracy}%` },
          { label: "30일 참여", value: `${activeDays}/30` },
        ].map((s) => (
          <PpuriCard key={s.label} className="text-center py-4">
            <p className="text-num-lg font-bold text-foreground tabular-nums">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </PpuriCard>
        ))}
      </div>

      <PpuriCard>
        <p className="text-small font-bold text-foreground mb-3">30일 진행 상황</p>
        <div className="grid grid-cols-10 gap-1.5" aria-label="30일 진행 상황">
          {last30.map((d) => {
            const list = byDay.get(d);
            const ok = list?.filter((r) => r.is_correct).length || 0;
            const ratio = list ? ok / list.length : 0;
            const tone = !list ? "bg-muted" : ratio >= 0.8 ? "bg-primary" : ratio >= 0.5 ? "bg-primary/60" : "bg-primary/30";
            return (
              <button
                key={d}
                title={`${d} ${list ? `${ok}/${list.length}` : "기록 없음"}`}
                onClick={() => list && setOpenDay(d)}
                className={`aspect-square rounded-md ${tone} ${d === openDay ? "ring-2 ring-foreground/40" : ""}`}
              />
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-2">칸이 진할수록 정답을 많이 맞힌 날이에요.</p>
      </PpuriCard>

      {loading ? (
        <p className="text-small text-muted-foreground text-center py-8">불러오는 중...</p>
      ) : rows.length === 0 ? (
        <PpuriCard className="text-center py-8">
          <p className="text-body text-foreground font-bold">아직 푼 문제가 없어요</p>
          <p className="text-small text-muted-foreground mt-1">오늘의 레슨을 풀면 여기에 쌓여요.</p>
        </PpuriCard>
      ) : (
        [...byDay.entries()].map(([day, list]) => {
          const ok = list.filter((r) => r.is_correct).length;
          const open = openDay === day;
          return (
            <PpuriCard key={day}>
              <button className="w-full flex items-center justify-between" onClick={() => setOpenDay(open ? null : day)}>
                <span className="text-body font-bold text-foreground">{day === todayKey() ? "오늘" : day}</span>
                <span className="flex items-center gap-2 text-small text-muted-foreground tabular-nums">
                  {ok}/{list.length} 정답
                  <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
                </span>
              </button>
              {open && (
                <ul className="mt-3 space-y-3">
                  {list.map((r) => (
                    <li key={r.id} className="border-t border-border pt-3">
                      <div className="flex gap-2">
                        {r.is_correct ? <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" /> : <X className="w-4 h-4 text-destructive shrink-0 mt-0.5" />}
                        <p className="text-small text-foreground">{r.question_text}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 ml-6">
                        내 답: {r.user_answer ?? "-"} · 정답: <span className="font-bold text-foreground">{r.correct_answer ?? "-"}</span>
                      </p>
                      {r.explanation && <p className="text-xs text-muted-foreground mt-1 ml-6 leading-relaxed">{r.explanation}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </PpuriCard>
          );
        })
      )}
    </Layout>
  );
}
