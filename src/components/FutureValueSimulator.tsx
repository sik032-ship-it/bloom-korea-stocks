import React, { useMemo, useState } from "react";
import { PpuriButton } from "@/components/PpuriButton";
import { LEGENDARY_BARGAINS, findClosestBargain } from "@/data/legendaryBargains";

interface FutureValueSimulatorProps {
  ticker: string;
  companyName: string;
  onClose: () => void;
}

type Mode = "lump" | "monthly";

// S&P500 + 우량 장기 평균 (역사 통계, 예측 아님)
const ANNUAL_RATE = 0.10; // 평균 시나리오만 메인으로 (단순화)

// 단타/레버리지 충격 통계 (보수적 출처 평균치)
const SHOCK_STATS = [
  { emoji: "💀", title: "단타 개미의 끝", desc: "5년 내 손실 마감 비율", value: "약 90%", source: "美 SEC·국내 증권사 통계 평균" },
  { emoji: "📉", title: "3배 레버리지 ETF", desc: "장기 보유 시 변동성 갉아먹힘", value: "10년 -70%대", source: "TQQQ/SOXL 등 실제 차트" },
  { emoji: "🎰", title: "단기 매매 수익률", desc: "거래 잦을수록 수익률은", value: "↓↓↓", source: "Barber & Odean 연구" },
];

// 격언
const QUOTES = [
  { who: "워렌 버핏", text: "주식시장은 인내심 없는 사람의 돈을 인내심 있는 사람에게 옮기는 장치다." },
  { who: "찰리 멍거", text: "큰 돈은 사고 파는 데 있지 않다. 기다리는 데 있다." },
  { who: "피터 린치", text: "주식으로 돈을 잃는 가장 빠른 방법? 시장 타이밍을 맞히려는 것." },
];

function formatKRW(usd: number): string {
  // 환율 1,400원 가정 — 한국 사용자 체감용
  const krw = usd * 1400;
  if (krw >= 100_000_000) return `${(krw / 100_000_000).toFixed(1)}억원`;
  if (krw >= 10_000) return `${Math.round(krw / 10_000).toLocaleString()}만원`;
  return `${Math.round(krw).toLocaleString()}원`;
}

function formatKRWFromKRW(krw: number): string {
  if (krw >= 100_000_000) return `${(krw / 100_000_000).toFixed(1)}억원`;
  if (krw >= 10_000) return `${Math.round(krw / 10_000).toLocaleString()}만원`;
  return `${Math.round(krw).toLocaleString()}원`;
}

export const FutureValueSimulator: React.FC<FutureValueSimulatorProps> = ({ ticker, companyName, onClose }) => {
  const [mode, setMode] = useState<Mode>("monthly");
  const [lumpUSD, setLumpUSD] = useState<string>("");
  const [monthlyKRW, setMonthlyKRW] = useState<string>("500000");
  const [years, setYears] = useState<number>(20);
  const [pledged, setPledged] = useState(false);

  const targetYear = new Date().getFullYear() + years;
  const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);

  // 연도별 누적 가치 계산
  const yearly = useMemo(() => {
    const arr: { year: number; longTerm: number; shortTerm: number; principal: number }[] = [];
    if (mode === "lump") {
      const p = parseFloat(lumpUSD);
      if (isNaN(p) || p <= 0) return null;
      for (let y = 1; y <= years; y++) {
        const longTerm = p * Math.pow(1 + ANNUAL_RATE, y);
        // 단타/레버리지 시뮬레이션: 평균적으로 원금 손실 (-50% 수렴)
        const shortTerm = p * Math.pow(0.93, y); // 매년 -7% 누적 가정 (수수료+감마손실+오판)
        arr.push({ year: y, longTerm, shortTerm, principal: p });
      }
      return { unit: "USD" as const, data: arr };
    } else {
      const m = parseFloat(monthlyKRW);
      if (isNaN(m) || m <= 0) return null;
      const monthlyRate = ANNUAL_RATE / 12;
      const shortMonthlyRate = -0.07 / 12;
      for (let y = 1; y <= years; y++) {
        const months = y * 12;
        // 적립식 미래가치 공식: PMT * [((1+r)^n - 1)/r]
        const longTerm = m * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
        const principal = m * months;
        // 단타: 매년 -7% 손실 후 매월 추가 적립 (연간 단순화)
        let shortTerm = 0;
        for (let yi = 1; yi <= y; yi++) {
          shortTerm = (shortTerm + m * 12) * 0.93;
        }
        arr.push({ year: y, longTerm, shortTerm, principal });
      }
      return { unit: "KRW" as const, data: arr };
    }
  }, [mode, lumpUSD, monthlyKRW, years]);

  const final = yearly?.data[yearly.data.length - 1];
  const maxValue = yearly ? Math.max(...yearly.data.map((d) => d.longTerm)) : 0;

  const fmt = (v: number) => (yearly?.unit === "USD" ? `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : formatKRWFromKRW(v));
  const fmtCompare = (v: number) => (yearly?.unit === "USD" ? `≈ ${formatKRW(v)}` : "");

  const legendCase = findClosestBargain(ticker) ?? LEGENDARY_BARGAINS[0];

  const multipleVsPrincipal = final && final.principal > 0 ? final.longTerm / final.principal : 0;
  const gainVsShortTerm = final ? final.longTerm - final.shortTerm : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-card rounded-2xl p-5 w-full max-w-md max-h-[92vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-1">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">시간 관점 전환</p>
            <h2 className="text-title text-foreground font-bold leading-tight">
              {targetYear}년의 내가<br/>{companyName}을 본다면?
            </h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground text-2xl leading-none shrink-0 ml-2">×</button>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          ⚠️ 미래 예측이 아닌 <b>S&amp;P500 역사적 평균(연 10%)</b>을 단순 적용한 참고용입니다.
        </p>

        {/* Mode Toggle */}
        <div className="flex bg-muted rounded-lg p-1 mb-4">
          <button
            onClick={() => setMode("monthly")}
            className={`flex-1 h-9 rounded-md text-small font-semibold transition ${mode === "monthly" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
          >
            💰 월 적립식
          </button>
          <button
            onClick={() => setMode("lump")}
            className={`flex-1 h-9 rounded-md text-small font-semibold transition ${mode === "lump" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
          >
            📦 1회 매수
          </button>
        </div>

        {/* Inputs */}
        <div className="space-y-3 mb-4">
          {mode === "lump" ? (
            <div>
              <label className="text-small text-foreground font-medium block mb-1.5">
                {ticker} 평균 매수가 (USD)
              </label>
              <input
                type="number"
                inputMode="decimal"
                value={lumpUSD}
                onChange={(e) => setLumpUSD(e.target.value)}
                placeholder="예: 185.50"
                className="w-full h-11 px-4 rounded-md bg-input border border-border text-body text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          ) : (
            <div>
              <label className="text-small text-foreground font-medium block mb-1.5">
                매월 투자할 금액 (원)
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={monthlyKRW}
                onChange={(e) => setMonthlyKRW(e.target.value)}
                placeholder="예: 500000"
                className="w-full h-11 px-4 rounded-md bg-input border border-border text-body text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <div className="flex gap-1.5 mt-2">
                {[300000, 500000, 1000000, 2000000].map((v) => (
                  <button
                    key={v}
                    onClick={() => setMonthlyKRW(String(v))}
                    className="flex-1 h-8 text-xs rounded-md border border-border bg-card hover:bg-accent text-foreground"
                  >
                    {v / 10000}만
                  </button>
                ))}
              </div>
            </div>
          )}

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

        {/* Result Hero */}
        {final && (
          <div className="rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 border-2 border-primary/30 p-4 mb-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">
              {years}년 후 당신의 자산
            </p>
            <p className="text-3xl font-extrabold text-primary leading-tight tabular-nums">
              {fmt(final.longTerm)}
            </p>
            {yearly?.unit === "USD" && (
              <p className="text-xs text-muted-foreground mt-0.5">{fmtCompare(final.longTerm)}</p>
            )}
            <div className="flex items-center gap-3 mt-2 text-xs">
              <span className="text-muted-foreground">투자 원금</span>
              <span className="font-semibold text-foreground tabular-nums">{fmt(final.principal)}</span>
              <span className="ml-auto bg-primary text-primary-foreground rounded-full px-2 py-0.5 font-bold">
                ×{multipleVsPrincipal.toFixed(1)}배
              </span>
            </div>
          </div>
        )}

        {/* Yearly Bar Chart */}
        {yearly && (
          <div className="mb-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-2">
              📈 시간이 만드는 눈덩이 (연도별)
            </p>
            <div className="flex items-end gap-0.5 h-32 bg-muted/30 rounded-md p-2">
              {yearly.data.map((d, i) => {
                const h = (d.longTerm / maxValue) * 100;
                const showLabel = i === 0 || i === yearly.data.length - 1 || (i + 1) % 5 === 0;
                return (
                  <div key={d.year} className="flex-1 flex flex-col items-center justify-end h-full group" title={`${d.year}년 후: ${fmt(d.longTerm)}`}>
                    <div
                      className="w-full bg-gradient-to-t from-primary to-primary/60 rounded-t-sm transition-all"
                      style={{ height: `${h}%`, minHeight: "2px" }}
                    />
                    {showLabel && (
                      <span className="text-[9px] text-muted-foreground mt-0.5">{d.year}y</span>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-1">
              💡 후반 5년이 전체 수익의 절반 이상을 만듭니다 — 이게 복리예요.
            </p>
          </div>
        )}

        {/* 단타 vs 장기 비교 */}
        {final && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="rounded-lg border-2 border-destructive/30 bg-destructive/5 p-3">
              <p className="text-[10px] text-destructive font-bold uppercase">😵 단타·레버리지</p>
              <p className="text-lg font-bold text-destructive mt-1 tabular-nums">{fmt(Math.max(final.shortTerm, 0))}</p>
              <p className="text-[10px] text-muted-foreground mt-1">평균 -7%/년 누적<br/>(수수료+오판+감마손실)</p>
            </div>
            <div className="rounded-lg border-2 border-primary/40 bg-primary/5 p-3">
              <p className="text-[10px] text-primary font-bold uppercase">🌳 장기 보유</p>
              <p className="text-lg font-bold text-primary mt-1 tabular-nums">{fmt(final.longTerm)}</p>
              <p className="text-[10px] text-muted-foreground mt-1">연 10% 복리<br/>(S&amp;P500 역사 평균)</p>
            </div>
            <div className="col-span-2 text-center bg-foreground/5 rounded-md py-2">
              <p className="text-xs text-foreground">
                같은 돈, {years}년 차이 → <b className="text-primary">{fmt(gainVsShortTerm)}</b> 차이
              </p>
            </div>
          </div>
        )}

        {/* 충격 통계 카드 */}
        <div className="mb-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-2">
            ⚠️ 단타·레버리지가 쓰레기인 이유
          </p>
          <div className="space-y-1.5">
            {SHOCK_STATS.map((s) => (
              <div key={s.title} className="flex items-center gap-2 rounded-md border border-border bg-card p-2.5">
                <span className="text-xl">{s.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-small font-semibold text-foreground leading-tight">{s.title}</p>
                  <p className="text-[10px] text-muted-foreground">{s.desc} · <span className="italic">{s.source}</span></p>
                </div>
                <p className="text-small font-bold text-destructive shrink-0">{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 전설 사례 */}
        <div className="rounded-md border border-border p-3 mb-4">
          <p className="text-xs text-muted-foreground mb-1">📜 실제 역사 — 시간이 증명한 것</p>
          <p className="text-small text-foreground">
            {legendCase.investorEmoji} <b>{legendCase.investor}</b>의 <b>{legendCase.company}</b> ({legendCase.buyYear})
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            당시 {legendCase.buyPriceLabel} → 오늘 {legendCase.todayPriceLabel}
            <span className="text-primary font-bold ml-2">×{legendCase.multiplier < 10 ? legendCase.multiplier.toFixed(1) : Math.round(legendCase.multiplier)}배</span>
          </p>
          <p className="text-xs text-foreground mt-2 italic">"{legendCase.lesson}"</p>
        </div>

        {/* 격언 */}
        <div className="rounded-lg bg-accent/40 border-l-4 border-primary p-3 mb-4">
          <p className="text-small text-foreground italic leading-relaxed">"{quote.text}"</p>
          <p className="text-xs text-muted-foreground text-right mt-1">— {quote.who}</p>
        </div>

        {/* 서약 CTA */}
        <div className="rounded-xl border-2 border-primary bg-primary/5 p-4 mb-3">
          <p className="text-small font-bold text-foreground mb-1">🤝 미래의 나에게 약속</p>
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
            "다음 위기가 와도, 뉴스가 무서워도, 나는 <b className="text-foreground">{companyName}</b>을 {years}년간 팔지 않겠다."
          </p>
          <PpuriButton
            fullWidth
            variant={pledged ? "ghost" : "primary"}
            onClick={() => setPledged(!pledged)}
          >
            {pledged ? "✅ 서약 완료 — 위기에 다시 보여드릴게요" : "🖋 위기 와도 안 팔겠다 — 서약하기"}
          </PpuriButton>
        </div>

        <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
          ⚠️ 본 시뮬레이션은 과거 평균 수익률을 단순 적용한 교육용 참고치이며,
          미래 수익을 보장하거나 투자 자문을 제공하지 않습니다. 모든 투자 결정은 본인 책임입니다.
        </p>
        <PpuriButton fullWidth variant="ghost" className="mt-3" onClick={onClose}>
          닫기
        </PpuriButton>
      </div>
    </div>
  );
};
