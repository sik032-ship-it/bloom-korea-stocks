import React, { useMemo, useState } from "react";
import { PpuriButton } from "@/components/PpuriButton";
import { LEGENDARY_BARGAINS, findClosestBargain } from "@/data/legendaryBargains";

interface FutureValueSimulatorProps {
  ticker: string;
  companyName: string;
  onClose: () => void;
}

// 보수적/평균/낙관 — S&P500 장기 역사 평균 기반 (예측 아님, 과거 통계)
const SCENARIOS = [
  { key: "conservative", label: "보수적", rate: 0.07, color: "text-muted-foreground" },
  { key: "average", label: "역사 평균", rate: 0.10, color: "text-primary" },
  { key: "optimistic", label: "낙관적", rate: 0.12, color: "text-foreground" },
] as const;

export const FutureValueSimulator: React.FC<FutureValueSimulatorProps> = ({ ticker, companyName, onClose }) => {
  const [buyPrice, setBuyPrice] = useState<string>("");
  const [years, setYears] = useState<number>(20);

  const price = parseFloat(buyPrice);
  const valid = !isNaN(price) && price > 0;

  const targetYear = new Date().getFullYear() + years;

  const projections = useMemo(() => {
    if (!valid) return null;
    return SCENARIOS.map((s) => ({
      ...s,
      futureValue: price * Math.pow(1 + s.rate, years),
      multiple: Math.pow(1 + s.rate, years),
    }));
  }, [price, years, valid]);

  // 비교할 전설적 사례 (같은 티커 우선, 없으면 첫번째)
  const legendCase = findClosestBargain(ticker) ?? LEGENDARY_BARGAINS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-card rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-xs text-muted-foreground">시간 관점 전환</p>
            <h2 className="text-title text-foreground font-bold">
              {targetYear}년의 내가 {companyName}을 본다면?
            </h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground text-2xl leading-none shrink-0">×</button>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          ⚠️ 미래 예측이 아닌 <b>S&P500 역사적 평균 수익률</b>을 적용한 참고용 시뮬레이션입니다.
        </p>

        {/* Inputs */}
        <div className="space-y-3 mb-5">
          <div>
            <label className="text-small text-foreground font-medium block mb-1.5">
              {ticker} 평균 매수가 (USD)
            </label>
            <input
              type="number"
              inputMode="decimal"
              value={buyPrice}
              onChange={(e) => setBuyPrice(e.target.value)}
              placeholder="예: 185.50"
              className="w-full h-11 px-4 rounded-md bg-input border border-border text-body text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              autoFocus
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-small text-foreground font-medium">보유 기간</label>
              <span className="text-small font-bold text-primary">{years}년 후 ({targetYear})</span>
            </div>
            <input
              type="range"
              min={10}
              max={30}
              step={1}
              value={years}
              onChange={(e) => setYears(parseInt(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>10년</span>
              <span>20년</span>
              <span>30년</span>
            </div>
          </div>
        </div>

        {/* Projections */}
        {projections && (
          <div className="space-y-2 mb-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
              {years}년 후 예상 가치
            </p>
            {projections.map((p) => (
              <div
                key={p.key}
                className={`flex items-center justify-between rounded-md border p-3 ${
                  p.key === "average" ? "border-primary/40 bg-primary/5" : "border-border bg-card"
                }`}
              >
                <div>
                  <p className="text-small font-semibold text-foreground">{p.label}</p>
                  <p className="text-xs text-muted-foreground">연 {(p.rate * 100).toFixed(0)}% 복리</p>
                </div>
                <div className="text-right">
                  <p className={`text-body font-bold ${p.color}`}>
                    ${p.futureValue.toFixed(0)}
                  </p>
                  <p className="text-xs text-muted-foreground">×{p.multiple.toFixed(1)}배</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reframe message */}
        {projections && (
          <div className="rounded-lg bg-accent/40 border-l-4 border-primary p-4 mb-4">
            <p className="text-small text-foreground leading-relaxed">
              💡 {targetYear}년의 내가 오늘의 매수가 <b className="text-primary">${price.toFixed(2)}</b>를 본다면,
              아마 이렇게 말할 거예요 — <b>"그때 정말 잘 샀네, 너무 싸게 샀네."</b>
            </p>
          </div>
        )}

        {/* Legend comparison */}
        <div className="rounded-md border border-border p-3">
          <p className="text-xs text-muted-foreground mb-2">📜 역사적 참고 사례</p>
          <p className="text-small text-foreground">
            {legendCase.investorEmoji} <b>{legendCase.investor}</b>의 <b>{legendCase.company}</b> ({legendCase.buyYear})
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            당시 {legendCase.buyPriceLabel} → 오늘 {legendCase.todayPriceLabel}
            <span className="text-primary font-bold ml-2">×{legendCase.multiplier < 10 ? legendCase.multiplier.toFixed(1) : Math.round(legendCase.multiplier)}배</span>
          </p>
          <p className="text-xs text-foreground mt-2 italic">"{legendCase.lesson}"</p>
        </div>

        <p className="text-[10px] text-muted-foreground text-center mt-4 leading-relaxed">
          ⚠️ 본 시뮬레이션은 S&amp;P500 과거 평균 수익률을 단순 적용한 교육용 참고치이며,
          미래 수익을 보장하거나 투자 자문을 제공하지 않습니다. 모든 투자 결정은 본인 책임입니다.
        </p>
        <PpuriButton fullWidth variant="ghost" className="mt-3" onClick={onClose}>
          닫기
        </PpuriButton>
      </div>
    </div>
  );
};
