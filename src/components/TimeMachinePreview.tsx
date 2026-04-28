import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BIG_TECH } from "@/data/bigTechHistory";
import { PpuriCard } from "@/components/PpuriCard";

// 매일 다른 종목을 자동 로테이션 (요일 기반 → 동일 일자엔 동일 종목 보장)
function getDailyPick(holdingsTickers: string[]) {
  const dayIdx = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  // 보유 종목 중 빅테크가 있으면 우선
  const owned = BIG_TECH.filter((b) => holdingsTickers.includes(b.ticker));
  if (owned.length > 0) return owned[dayIdx % owned.length];
  return BIG_TECH[dayIdx % BIG_TECH.length];
}

interface Props {
  holdingsTickers?: string[];
}

export function TimeMachinePreview({ holdingsTickers = [] }: Props) {
  const navigate = useNavigate();
  const [pick, setPick] = useState(() => getDailyPick(holdingsTickers));

  useEffect(() => {
    setPick(getDailyPick(holdingsTickers));
  }, [holdingsTickers.join(",")]);

  const krw1000 = 10_000_000; // 1,000만원 기준
  const todayValueKRW = krw1000 * (pick.priceToday / pick.price10yAgo);
  const ownedHint = holdingsTickers.includes(pick.ticker);

  const fmt = (v: number) => {
    if (v >= 100_000_000) return `${(v / 100_000_000).toFixed(1)}억`;
    return `${Math.round(v / 10_000).toLocaleString()}만`;
  };

  return (
    <PpuriCard
      className="cursor-pointer hover:border-primary/40 transition-all press-effect"
      onClick={() => navigate("/timemachine")}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">⏰</span>
          <p className="text-small font-bold text-foreground">오늘의 시간 머신</p>
        </div>
        {ownedHint && (
          <span className="text-[10px] bg-primary/10 text-primary font-bold rounded-full px-2 py-0.5">
            내 종목
          </span>
        )}
      </div>

      <div className="bg-gradient-to-r from-primary/10 to-accent/30 rounded-lg p-3">
        <p className="text-xs text-muted-foreground mb-1">
          {pick.emoji} <b className="text-foreground">{pick.company}</b>에 10년 전 1,000만원을 넣었다면…
        </p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-extrabold text-primary tabular-nums">
            {fmt(todayValueKRW)}원
          </p>
          <p className="text-small font-bold text-primary">
            ×{(pick.priceToday / pick.price10yAgo).toFixed(1)}배
          </p>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1 italic">"{pick.story}"</p>
      </div>

      <p className="text-xs text-primary text-right mt-2 font-medium">
        더 많은 시나리오 보기 →
      </p>
    </PpuriCard>
  );
}
