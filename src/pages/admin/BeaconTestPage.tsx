import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { PpuriCard } from "@/components/PpuriCard";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  sendEventBeacon,
  sendEventNow,
  flushQueue,
  getQueueSize,
} from "@/utils/onboardingBeacon";

type Row = {
  id: string;
  user_id: string;
  step: number;
  event_type: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

type Check = { label: string; pass: boolean; detail: string };

const STEP_MARKER = 999; // sentinel step so test events don't pollute real funnel

export default function BeaconTestPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [queueSize, setQueueSize] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lastReason, setLastReason] = useState<string | null>(null);

  const refresh = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("onboarding_events")
      .select("id,user_id,step,event_type,metadata,created_at")
      .eq("user_id", user.id)
      .eq("step", STEP_MARKER)
      .order("created_at", { ascending: false })
      .limit(50);
    setRows((data ?? []) as Row[]);
    setQueueSize(getQueueSize());
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Track last unload reason locally so the user can verify which lifecycle
  // event fired in their browser (helps mobile Safari / PWA debugging).
  useEffect(() => {
    const onPagehide = () => {
      try {
        localStorage.setItem("ppuri:beacon_test:last_lifecycle", "pagehide");
      } catch {/* noop */}
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        try {
          localStorage.setItem("ppuri:beacon_test:last_lifecycle", "visibilitychange:hidden");
        } catch {/* noop */}
      }
    };
    const onBeforeUnload = () => {
      try {
        localStorage.setItem("ppuri:beacon_test:last_lifecycle", "beforeunload");
      } catch {/* noop */}
    };
    window.addEventListener("pagehide", onPagehide);
    window.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("beforeunload", onBeforeUnload);
    try {
      setLastReason(localStorage.getItem("ppuri:beacon_test:last_lifecycle"));
    } catch {/* noop */}
    return () => {
      window.removeEventListener("pagehide", onPagehide);
      window.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, []);

  const fireBeacon = (reason: string) => {
    if (!user) return;
    sendEventBeacon({
      user_id: user.id,
      step: STEP_MARKER,
      event_type: "onboarding_abandoned",
      metadata: { test: true, reason, ua: navigator.userAgent },
    });
    setQueueSize(getQueueSize());
  };

  const fireNow = async () => {
    if (!user) return;
    await sendEventNow({
      user_id: user.id,
      step: STEP_MARKER,
      event_type: "step_reached",
      metadata: { test: true, reason: "manual_now" },
    });
    await refresh();
  };

  const doFlush = async () => {
    const r = await flushQueue();
    alert(`전송 ${r.sent}건 / 남음 ${r.remaining}건 / 폐기 ${r.dropped}건`);
    await refresh();
  };

  // ---------- checklist ----------
  const beforeRow = rows.find(
    (r) => (r.metadata as { reason?: string } | null)?.reason === "beforeunload_test",
  );
  const pagehideRow = rows.find(
    (r) => (r.metadata as { reason?: string } | null)?.reason === "pagehide_test",
  );
  const visibilityRow = rows.find(
    (r) => (r.metadata as { reason?: string } | null)?.reason === "visibility_test",
  );

  const checks: Check[] = [
    {
      label: "① beforeunload 시뮬레이션 이벤트가 DB에 기록됨",
      pass: !!beforeRow,
      detail: beforeRow
        ? `✅ ${new Date(beforeRow.created_at).toLocaleString("ko-KR")}`
        : "버튼 → 탭 닫기/새로고침 후 새로고침 버튼 클릭",
    },
    {
      label: "② pagehide 시뮬레이션 이벤트가 DB에 기록됨 (모바일/PWA 필수)",
      pass: !!pagehideRow,
      detail: pagehideRow
        ? `✅ ${new Date(pagehideRow.created_at).toLocaleString("ko-KR")}`
        : "버튼 → 백그라운드 전환 후 확인",
    },
    {
      label: "③ visibilitychange(hidden) 시뮬레이션 이벤트가 DB에 기록됨",
      pass: !!visibilityRow,
      detail: visibilityRow
        ? `✅ ${new Date(visibilityRow.created_at).toLocaleString("ko-KR")}`
        : "버튼 → 다른 탭으로 전환 후 확인",
    },
    {
      label: "④ 큐가 비어 있음 (재시도 대기 없음)",
      pass: queueSize === 0,
      detail: queueSize === 0 ? "✅ 큐 비어있음" : `⚠️ 대기 ${queueSize}건 - flush 시도`,
    },
    {
      label: "⑤ 마지막 감지된 라이프사이클 이벤트",
      pass: !!lastReason,
      detail: lastReason ?? "(아직 감지 없음)",
    },
  ];

  const passed = checks.filter((c) => c.pass).length;

  return (
    <Layout>
      <div className="space-y-4">
        <header>
          <h1 className="text-display text-foreground">📡 Beacon / 라이프사이클 테스트</h1>
          <p className="text-small text-muted-foreground mt-1">
            탭 닫기·백그라운드 전환 상황에서 이탈 이벤트가 유실되지 않는지 검증합니다.
            (테스트 행은 step={STEP_MARKER} 마커로 실제 퍼널과 분리됩니다.)
          </p>
        </header>

        <PpuriCard>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-title font-bold">체크리스트</h2>
            <span
              className={`text-small font-bold tabular-nums ${
                passed === checks.length ? "text-primary" : "text-destructive"
              }`}
            >
              {passed} / {checks.length}
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
                <span className="text-base leading-none mt-0.5">{c.pass ? "✅" : "⏳"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-small font-bold text-foreground">{c.label}</p>
                  <p className="text-xs text-muted-foreground break-words">{c.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </PpuriCard>

        <PpuriCard>
          <h2 className="text-title font-bold mb-3">시뮬레이션 액션</h2>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => fireBeacon("beforeunload_test")}
              className="px-3 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-small text-left"
            >
              1) beforeunload 이벤트 enqueue → 즉시 탭 새로고침/닫기
            </button>
            <button
              onClick={() => fireBeacon("pagehide_test")}
              className="px-3 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-small text-left"
            >
              2) pagehide 이벤트 enqueue → 홈으로 전환/PWA 백그라운드
            </button>
            <button
              onClick={() => fireBeacon("visibility_test")}
              className="px-3 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-small text-left"
            >
              3) visibilitychange 이벤트 enqueue → 다른 탭/앱으로 전환
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={fireNow}
                className="px-3 py-2 rounded-xl bg-secondary text-secondary-foreground font-bold text-small"
              >
                4) 일반 insert 테스트
              </button>
              <button
                onClick={doFlush}
                className="px-3 py-2 rounded-xl bg-secondary text-secondary-foreground font-bold text-small"
              >
                5) 큐 flush 실행
              </button>
            </div>
            <button
              onClick={refresh}
              disabled={loading}
              className="px-3 py-2 rounded-xl bg-muted text-foreground font-bold text-small disabled:opacity-50"
            >
              🔄 {loading ? "조회 중..." : "결과 새로고침"} (현재 큐: {queueSize}건)
            </button>
          </div>
        </PpuriCard>

        <PpuriCard className="bg-accent/30">
          <h2 className="text-title font-bold mb-2">📱 디바이스별 테스트 흐름</h2>
          <div className="space-y-3 text-xs text-foreground leading-relaxed">
            <div>
              <p className="font-bold">🖥 데스크탑 (Chrome / Edge / Firefox)</p>
              <ol className="list-decimal ml-4 space-y-0.5 text-muted-foreground">
                <li>버튼 1) 클릭 → 즉시 ⌘R(F5)로 새로고침</li>
                <li>다시 이 페이지 열기 → 새로고침 버튼 → ① ✅ 확인</li>
                <li>버튼 3) 클릭 → 다른 탭으로 전환 → 돌아와서 ③ ✅ 확인</li>
              </ol>
            </div>
            <div>
              <p className="font-bold">🦋 데스크탑 Safari</p>
              <ol className="list-decimal ml-4 space-y-0.5 text-muted-foreground">
                <li>Safari는 beforeunload 미지원 → 버튼 2) pagehide 위주로 테스트</li>
                <li>탭 닫기 후 다시 열어 ② ✅ 확인</li>
              </ol>
            </div>
            <div>
              <p className="font-bold">📱 iOS Safari / iOS PWA</p>
              <ol className="list-decimal ml-4 space-y-0.5 text-muted-foreground">
                <li>버튼 2) 클릭 → 홈 버튼/위로 스와이프로 백그라운드</li>
                <li>10초 후 앱 복귀 → ② ✅ 확인 (iOS는 pagehide만 신뢰 가능)</li>
                <li>PWA 모드는 beforeunload 호출 안 됨 → ① 미통과 정상</li>
              </ol>
            </div>
            <div>
              <p className="font-bold">🤖 Android Chrome / Android PWA</p>
              <ol className="list-decimal ml-4 space-y-0.5 text-muted-foreground">
                <li>버튼 3) 클릭 → 최근 앱으로 전환 → ③ ✅ 확인</li>
                <li>버튼 2) 클릭 → 탭 닫기 → 재진입 후 ② ✅</li>
              </ol>
            </div>
            <div className="pt-2 border-t border-border">
              <p className="font-bold">⚠ 실패 시 점검</p>
              <ul className="list-disc ml-4 space-y-0.5 text-muted-foreground">
                <li>큐가 0이 아니면 → flush 버튼으로 재전송 가능한지 확인</li>
                <li>네트워크 탭에서 <code className="px-1 bg-muted rounded">/rest/v1/onboarding_events</code> 요청이 status 201인지 확인</li>
                <li>401/403이면 토큰 만료 → 재로그인 후 재시도</li>
              </ul>
            </div>
          </div>
        </PpuriCard>
      </div>
    </Layout>
  );
}
