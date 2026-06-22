import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import { PpuriCard } from "@/components/PpuriCard";

type EventRow = {
  id: string;
  user_id: string;
  step: number;
  event_type: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

type Check = {
  label: string;
  pass: boolean;
  detail: string;
};

const EXPECTED_EVENT_TYPES = ["step_reached", "onboarding_completed", "onboarding_abandoned"];

export default function OnboardingEventCheckPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [scope, setScope] = useState<"me" | "all">("me");

  const refresh = async () => {
    setLoading(true);
    setErr(null);
    let q = supabase
      .from("onboarding_events")
      .select("id,user_id,step,event_type,metadata,created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (scope === "me" && user) q = q.eq("user_id", user.id);
    const { data, error } = await q;
    if (error) setErr(error.message);
    else setRows((data ?? []) as EventRow[]);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, user?.id]);

  // Checklist
  const myRows = user ? rows.filter((r) => r.user_id === user.id) : [];
  const stepsReachedSet = new Set(
    myRows.filter((r) => r.event_type === "step_reached").map((r) => r.step)
  );
  const allHaveUser = rows.every((r) => !!r.user_id);
  const allHaveTimestamp = rows.every((r) => {
    const d = new Date(r.created_at);
    return !isNaN(d.getTime());
  });
  const userIdMatch = scope === "me" ? myRows.every((r) => r.user_id === user?.id) : true;
  const typesPresent = EXPECTED_EVENT_TYPES.filter((t) =>
    rows.some((r) => r.event_type === t)
  );

  const checks: Check[] = [
    {
      label: "이벤트가 1건 이상 기록됨",
      pass: rows.length > 0,
      detail: `${rows.length}건 조회됨`,
    },
    {
      label: "모든 이벤트에 user_id가 채워짐",
      pass: allHaveUser,
      detail: allHaveUser ? "✅ 모든 행 user_id 존재" : "⚠️ user_id 누락된 행 발견",
    },
    {
      label: "모든 이벤트에 유효한 timestamp(created_at)",
      pass: allHaveTimestamp,
      detail: allHaveTimestamp ? "✅ 모든 행 유효한 시각" : "⚠️ 유효하지 않은 시각 발견",
    },
    {
      label: "user_id가 현재 로그인 사용자와 일치 (내 데이터 모드)",
      pass: userIdMatch,
      detail:
        scope === "me"
          ? userIdMatch
            ? `✅ 모두 ${user?.id?.slice(0, 8)}…`
            : "⚠️ 타 사용자 행 발견 (RLS 위반 가능)"
          : "전체 모드 - 생략",
    },
    {
      label: "step_reached 이벤트 0~6단계 모두 기록 (내 데이터 모드)",
      pass: scope === "me" ? [0, 1, 2, 3, 4, 5, 6].every((s) => stepsReachedSet.has(s)) : true,
      detail:
        scope === "me"
          ? `도달 단계: [${[...stepsReachedSet].sort((a, b) => a - b).join(", ") || "없음"}]`
          : "전체 모드 - 생략",
    },
    {
      label: "예상 event_type 3종 모두 존재",
      pass: typesPresent.length === EXPECTED_EVENT_TYPES.length,
      detail: `발견: [${typesPresent.join(", ") || "없음"}]`,
    },
    {
      label: "onboarding_completed 이벤트 존재 (내 데이터 모드)",
      pass:
        scope === "me"
          ? myRows.some((r) => r.event_type === "onboarding_completed")
          : true,
      detail:
        scope === "me"
          ? myRows.some((r) => r.event_type === "onboarding_completed")
            ? "✅ 완료 이벤트 기록됨"
            : "⏳ 아직 온보딩 미완료 (완료 후 재확인)"
          : "전체 모드 - 생략",
    },
  ];

  const passedCount = checks.filter((c) => c.pass).length;

  return (
    <Layout>
      <div className="space-y-4">
        <header>
          <h1 className="text-display text-foreground">🧪 온보딩 이벤트 검증</h1>
          <p className="text-small text-muted-foreground mt-1">
            onboarding_events 행이 정확한 user_id / timestamp / event_type 으로 기록되는지
            체크리스트로 검증합니다.
          </p>
        </header>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setScope("me")}
            className={`px-3 py-2 rounded-xl text-small font-bold ${
              scope === "me"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground"
            }`}
          >
            내 데이터
          </button>
          <button
            onClick={() => setScope("all")}
            className={`px-3 py-2 rounded-xl text-small font-bold ${
              scope === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground"
            }`}
          >
            전체 (RLS 적용됨)
          </button>
          <button
            onClick={refresh}
            disabled={loading}
            className="ml-auto px-3 py-2 rounded-xl bg-secondary text-secondary-foreground font-bold text-small disabled:opacity-50"
          >
            {loading ? "조회 중..." : "🔄 새로고침"}
          </button>
        </div>

        {err && (
          <PpuriCard className="border-destructive/40 bg-destructive/5">
            <p className="text-small text-destructive font-bold">⚠️ {err}</p>
          </PpuriCard>
        )}

        <PpuriCard>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-title font-bold">체크리스트</h2>
            <span
              className={`text-small font-bold tabular-nums ${
                passedCount === checks.length ? "text-primary" : "text-destructive"
              }`}
            >
              {passedCount} / {checks.length}
            </span>
          </div>
          <ul className="space-y-2">
            {checks.map((c, i) => (
              <li
                key={i}
                className={`flex items-start gap-2 p-2 rounded-lg ${
                  c.pass ? "bg-primary/5" : "bg-destructive/5"
                }`}
              >
                <span className="text-base leading-none mt-0.5">{c.pass ? "✅" : "❌"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-small font-bold text-foreground">{c.label}</p>
                  <p className="text-xs text-muted-foreground break-words">{c.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </PpuriCard>

        <PpuriCard>
          <h2 className="text-title font-bold mb-3">최근 이벤트 (최대 100건)</h2>
          {rows.length === 0 ? (
            <p className="text-small text-muted-foreground">기록된 이벤트가 없습니다.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="py-1 pr-2">시각</th>
                    <th className="py-1 pr-2">type</th>
                    <th className="py-1 pr-2">step</th>
                    <th className="py-1 pr-2">user_id</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const isMe = r.user_id === user?.id;
                    const ts = new Date(r.created_at);
                    return (
                      <tr key={r.id} className="border-b border-border/50">
                        <td className="py-1 pr-2 tabular-nums whitespace-nowrap">
                          {ts.toLocaleString("ko-KR", { hour12: false })}
                        </td>
                        <td className="py-1 pr-2 font-mono">{r.event_type}</td>
                        <td className="py-1 pr-2 tabular-nums">{r.step}</td>
                        <td className="py-1 pr-2 font-mono">
                          <span className={isMe ? "text-primary font-bold" : ""}>
                            {r.user_id.slice(0, 8)}…
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </PpuriCard>

        <PpuriCard className="bg-accent/30">
          <p className="text-xs text-muted-foreground leading-relaxed">
            💡 검증 방법: ① 새 계정으로 가입 → ② 온보딩 0~6단계 진행 → ③ 완료 후 이
            페이지에서 "내 데이터"로 7개 체크 모두 ✅ 인지 확인. 중간에 닫고 다시 들어오면
            <code className="mx-1 px-1 bg-muted rounded">onboarding_abandoned</code>
            이벤트도 보여야 합니다.
          </p>
        </PpuriCard>
      </div>
    </Layout>
  );
}
