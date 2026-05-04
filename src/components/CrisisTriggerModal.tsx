// 위기 자동 트리거 모달
// 보유 종목 중 -10% 이상 하락이 감지되면 홈 진입 시 자동 노출.
// 같은 ticker+날짜 조합은 하루 1회만 노출 (피로도 관리).

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MentorCard } from "@/components/MentorCard";
import { useMentorExperiment } from "@/hooks/useMentorExperiment";
import { detectCrisisTrigger, type PriceSnapshot } from "@/utils/simulatedPrice";

interface Props {
  tickers: string[];
}

const SEEN_KEY = (ticker: string, day: string) =>
  `ppuri:crisis-seen:${ticker}:${day}`;

export function CrisisTriggerModal({ tickers }: Props) {
  const navigate = useNavigate();
  const [trigger, setTrigger] = useState<PriceSnapshot | null>(null);

  useEffect(() => {
    const t = detectCrisisTrigger(tickers, -0.10);
    if (!t) return;
    const day = new Date().toISOString().slice(0, 10);
    if (localStorage.getItem(SEEN_KEY(t.ticker, day))) return;
    setTrigger(t);
    localStorage.setItem(SEEN_KEY(t.ticker, day), "1");
  }, [tickers]);

  if (!trigger) return null;
  return (
    <CrisisModalInner
      trigger={trigger}
      onClose={() => setTrigger(null)}
      onPlan={() => {
        setTrigger(null);
        navigate("/holdings");
      }}
    />
  );
}

function CrisisModalInner({
  trigger,
  onClose,
  onPlan,
}: {
  trigger: PriceSnapshot;
  onClose: () => void;
  onPlan: () => void;
}) {
  const dropPct = Math.round(trigger.changePct * 100);
  const { variant, log } = useMentorExperiment("crisis_trigger", true, {
    ticker: trigger.ticker,
    drop_pct: dropPct,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md mx-auto sm:mx-4 max-h-[92vh] overflow-y-auto animate-slide-up p-4 sm:p-0">
        {/* 위기 헤더 — 사실만 차분히 */}
        <div className="bg-tone-caution-bg border border-tone-caution-fg/20 rounded-t-2xl px-5 py-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-tone-caution-fg tracking-wide">
              가격 알림
            </p>
            <p className="text-small text-foreground font-bold mt-0.5">
              {trigger.ticker} <span className="text-tone-caution-fg tabular-nums">{dropPct}%</span>
            </p>
          </div>
          <button
            onClick={() => {
              log("dismiss");
              onClose();
            }}
            className="text-muted-foreground text-2xl leading-none px-2"
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        <MentorCard
          mentor={variant.mentor}
          quote={variant.quote}
          commandment={variant.commandment}
          commandmentLabel={variant.commandmentLabel}
          ctaLabel={variant.ctaLabel}
          onCta={() => {
            log("cta_click");
            onClose();
          }}
          secondaryLabel={variant.secondaryLabel}
          onSecondary={() => {
            log("secondary_click");
            onPlan();
          }}
          footnote={
            <>
              하루에 한 번씩 가격은 흔들립니다. 흔들림이 곧 손실은 아니에요.
              우리는 <strong className="text-foreground">{trigger.ticker}</strong>의 10년 후를 보고 머무릅니다.
            </>
          }
          className="rounded-t-none"
        />
      </div>
    </div>
  );
}
