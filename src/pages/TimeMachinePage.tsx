import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { PpuriCard } from "@/components/PpuriCard";
import { PpuriButton } from "@/components/PpuriButton";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { BIG_TECH, dcaFutureValue, type BigTechRecord } from "@/data/bigTechHistory";

type Mode = "lump" | "dca";
type Period = 10 | 20;

function fmtKRW(v: number) {
  if (v >= 100_000_000) return `${(v / 100_000_000).toFixed(2)}억원`;
  if (v >= 10_000) return `${Math.round(v / 10_000).toLocaleString()}만원`;
  return `${Math.round(v).toLocaleString()}원`;
}

export default function TimeMachinePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<Mode>("lump");
  const [period, setPeriod] = useState<Period>(10);
  const [lumpKRW, setLumpKRW] = useState(10_000_000); // 1,000만원
  const [monthlyKRW, setMonthlyKRW] = useState(300_000); // 월 30만원
  const [ownedTickers, setOwnedTickers] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("holdings")
      .select("ticker")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .is("deleted_at", null)
      .then(({ data }) => {
        if (data) setOwnedTickers(data.map((h) => h.ticker));
      });
  }, [user]);

  const calc = (b: BigTechRecord) => {
    const past = period === 10 ? b.price10yAgo : b.price20yAgo;
    const cagr = period === 10 ? b.cagr10y : b.cagr20y;
    const multiplier = b.priceToday / past;

    if (mode === "lump") {
      return {
        principal: lumpKRW,
        future: lumpKRW * multiplier,
        multiplier,
        cagr,
      };
    } else {
      const future = dcaFutureValue(monthlyKRW, period, cagr);
      const principal = monthlyKRW * 12 * period;
      return {
        principal,
        future,
        multiplier: future / principal,
        cagr,
      };
    }
  };

  const sorted = useMemo(() => {
    return [...BIG_TECH].sort((a, b) => {
      const aOwned = ownedTickers.includes(a.ticker) ? 1 : 0;
      const bOwned = ownedTickers.includes(b.ticker) ? 1 : 0;
      if (aOwned !== bOwned) return bOwned - aOwned;
      const aMul = a.priceToday / (period === 10 ? a.price10yAgo : a.price20yAgo);
      const bMul = b.priceToday / (period === 10 ? b.price10yAgo : b.price20yAgo);
      return bMul - aMul;
    });
  }, [period, ownedTickers]);

  return (
    <Layout>
      <div className="space-y-4 pb-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-2xl text-muted-foreground">←</button>
          <div className="flex-1">
            <h1 className="text-title font-bold text-foreground">⏰ 시간 머신</h1>
            <p className="text-xs text-muted-foreground">
              그때 샀다면, 오늘은 얼마?
            </p>
          </div>
        </div>

        {/* Mode + Period Toggles */}
        <PpuriCard>
          <div className="flex bg-muted rounded-lg p-1 mb-3">
            <button
              onClick={() => setMode("lump")}
              className={`flex-1 h-9 rounded-md text-small font-semibold transition ${
                mode === "lump" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              📦 한 번에 투자
            </button>
            <button
              onClick={() => setMode("dca")}
              className={`flex-1 h-9 rounded-md text-small font-semibold transition ${
                mode === "dca" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              💰 매월 적립
            </button>
          </div>

          <div className="flex bg-muted rounded-lg p-1 mb-3">
            {([10, 20] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`flex-1 h-9 rounded-md text-small font-semibold transition ${
                  period === p ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                {p}년 전
              </button>
            ))}
          </div>

          {/* Amount Input */}
          {mode === "lump" ? (
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">투자 금액 (원)</label>
              <input
                type="number"
                inputMode="numeric"
                value={lumpKRW}
                onChange={(e) => setLumpKRW(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full h-11 px-4 rounded-md bg-input border border-border text-body text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <div className="flex gap-1.5 mt-2">
                {[1_000_000, 5_000_000, 10_000_000, 50_000_000].map((v) => (
                  <button
                    key={v}
                    onClick={() => setLumpKRW(v)}
                    className="flex-1 h-8 text-xs rounded-md border border-border bg-card hover:bg-accent text-foreground"
                  >
                    {v >= 10_000_000 ? `${v / 10_000_000}천만` : `${v / 10_000}만`}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">매월 적립 (원)</label>
              <input
                type="number"
                inputMode="numeric"
                value={monthlyKRW}
                onChange={(e) => setMonthlyKRW(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full h-11 px-4 rounded-md bg-input border border-border text-body text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <div className="flex gap-1.5 mt-2">
                {[100_000, 300_000, 500_000, 1_000_000].map((v) => (
                  <button
                    key={v}
                    onClick={() => setMonthlyKRW(v)}
                    className="flex-1 h-8 text-xs rounded-md border border-border bg-card hover:bg-accent text-foreground"
                  >
                    {v / 10_000}만
                  </button>
                ))}
              </div>
            </div>
          )}
        </PpuriCard>

        {/* Results */}
        <div className="space-y-3">
          {sorted.map((b) => {
            const r = calc(b);
            const owned = ownedTickers.includes(b.ticker);
            return (
              <PpuriCard
                key={b.ticker}
                className={owned ? "border-2 border-primary/40" : ""}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{b.emoji}</span>
                    <div>
                      <p className="text-small font-bold text-foreground">{b.company}</p>
                      <p className="text-[10px] text-muted-foreground">{b.ticker}</p>
                    </div>
                  </div>
                  {owned && (
                    <span className="text-[10px] bg-primary text-primary-foreground font-bold rounded-full px-2 py-0.5">
                      ★ 내 종목
                    </span>
                  )}
                </div>

                <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-3 mb-2">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">
                    {period}년 후 오늘
                  </p>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <p className="text-2xl font-extrabold text-primary tabular-nums">
                      {fmtKRW(r.future)}
                    </p>
                    <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs font-bold">
                      ×{r.multiplier.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1.5 text-[11px]">
                    <span className="text-muted-foreground">
                      투자 원금 <b className="text-foreground">{fmtKRW(r.principal)}</b>
                    </span>
                    <span className="text-muted-foreground">
                      연 <b className="text-foreground">{(r.cagr * 100).toFixed(1)}%</b>
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-foreground italic">"{b.story}"</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {period === 10 ? "2016.4" : "2006.4"} ${(period === 10 ? b.price10yAgo : b.price20yAgo).toFixed(2)} → 오늘 ${b.priceToday}
                  {" · "}출처: {b.source}
                </p>
              </PpuriCard>
            );
          })}
        </div>

        {/* Bottom Insight */}
        <div className="rounded-xl bg-accent/40 border-l-4 border-primary p-4">
          <p className="text-small font-bold text-foreground mb-1">💡 깨달음</p>
          <p className="text-xs text-foreground leading-relaxed">
            "그때 알았더라면…"이 아니라, <b className="text-primary">"지금 시작하면 10년 뒤의 내가 똑같이 말할 것"</b>입니다.
            가장 좋은 시작 시점은 10년 전, 그다음은 <b>오늘</b>이에요.
          </p>
        </div>

        <p className="text-[10px] text-muted-foreground text-center leading-relaxed px-2">
          ⚠️ 본 데이터는 분할조정 종가 기반 과거 사실이며, 미래 수익을 보장하지 않습니다.
          모든 투자 결정은 본인 책임입니다.
        </p>

        <PpuriButton fullWidth variant="ghost" onClick={() => navigate("/")}>
          홈으로 돌아가기
        </PpuriButton>
      </div>
    </Layout>
  );
}
