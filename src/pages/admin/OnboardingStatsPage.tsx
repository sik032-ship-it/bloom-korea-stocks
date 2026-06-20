import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { PpuriCard } from "@/components/PpuriCard";

type Funnel = {
  total_started: number;
  total_completed: number;
  steps: { step: number; users_reached: number }[];
};

const STEP_LABELS: Record<number, string> = {
  0: "0. WHY 소개",
  1: "1. 투자 목표",
  2: "2. 경험 수준",
  3: "3. 일일 목표",
  4: "4. 보유 종목",
  5: "5. 미리보기 퀴즈",
  6: "6. 시작하기",
};

export default function OnboardingStatsPage() {
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setErr(null);
    const { data, error } = await supabase.rpc("get_onboarding_funnel");
    if (error) setErr(error.message);
    else setFunnel(data as unknown as Funnel);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const maxUsers = funnel
    ? Math.max(funnel.total_started, ...funnel.steps.map((s) => s.users_reached), 1)
    : 1;

  const stepByIndex = (idx: number) =>
    funnel?.steps.find((s) => s.step === idx)?.users_reached ?? 0;

  const completionRate =
    funnel && funnel.total_started > 0
      ? Math.round((funnel.total_completed / funnel.total_started) * 100)
      : 0;

  return (
    <Layout>
      <div className="space-y-4">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-display text-foreground">📊 온보딩 퍼널</h1>
            <p className="text-small text-muted-foreground mt-1">
              단계별 도달자 수와 이탈률을 확인합니다.
            </p>
          </div>
          <button
            onClick={refresh}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-small disabled:opacity-50"
          >
            {loading ? "조회 중..." : "🔄 새로고침"}
          </button>
        </header>

        {err && (
          <PpuriCard className="border-destructive/40 bg-destructive/5">
            <p className="text-small text-destructive font-bold">⚠️ {err}</p>
          </PpuriCard>
        )}

        {funnel && (
          <>
            <div className="grid grid-cols-3 gap-3">
              <PpuriCard>
                <p className="text-xs text-muted-foreground">시작</p>
                <p className="text-2xl font-bold text-foreground tabular-nums">
                  {funnel.total_started}
                </p>
              </PpuriCard>
              <PpuriCard>
                <p className="text-xs text-muted-foreground">완료</p>
                <p className="text-2xl font-bold text-primary tabular-nums">
                  {funnel.total_completed}
                </p>
              </PpuriCard>
              <PpuriCard>
                <p className="text-xs text-muted-foreground">완료율</p>
                <p
                  className={`text-2xl font-bold tabular-nums ${
                    completionRate >= 50 ? "text-primary" : "text-destructive"
                  }`}
                >
                  {completionRate}%
                </p>
              </PpuriCard>
            </div>

            <PpuriCard>
              <h2 className="text-title font-bold text-foreground mb-4">단계별 도달자</h2>
              <div className="space-y-3">
                {[0, 1, 2, 3, 4, 5, 6].map((i) => {
                  const users = stepByIndex(i);
                  const pct = (users / maxUsers) * 100;
                  const prev = i === 0 ? users : stepByIndex(i - 1);
                  const dropoff =
                    prev > 0 && i > 0 ? Math.round((1 - users / prev) * 100) : 0;
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-foreground">{STEP_LABELS[i]}</span>
                        <span className="text-muted-foreground tabular-nums">
                          {users}명
                          {i > 0 && dropoff > 0 && (
                            <span className="text-destructive ml-2">-{dropoff}%</span>
                          )}
                        </span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </PpuriCard>

            <PpuriCard className="bg-accent/30">
              <p className="text-xs text-muted-foreground leading-relaxed">
                💡 이벤트는 사용자별로 단계당 1회 집계됩니다 (DISTINCT user_id). 이탈률은
                이전 단계 대비 다음 단계 도달 실패 비율입니다.
              </p>
            </PpuriCard>
          </>
        )}
      </div>
    </Layout>
  );
}
