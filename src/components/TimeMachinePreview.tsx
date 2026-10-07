import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BIG_TECH } from "@/data/bigTechHistory";
import { useLivePrices, liveBigTech } from "@/lib/livePrices";
import { PpuriCard } from "@/components/PpuriCard";
import { CuteIcon } from "@/components/CuteIcon";

// PPURI 앵커 4개 기업만 탑승 대상
const BIG4 = ["MSFT", "GOOGL", "AMZN", "AAPL"];
const RIDES = BIG_TECH.filter((b) => BIG4.includes(b.ticker));
const POOL = RIDES.length ? RIDES : BIG_TECH;

function getDailyIndex(holdingsTickers: string[]) {
  const dayIdx = Math.floor(Date.now() / 86400000);
  const owned = POOL.map((b, i) => (holdingsTickers.includes(b.ticker) ? i : -1)).filter((i) => i >= 0);
  return owned.length ? owned[dayIdx % owned.length] : dayIdx % POOL.length;
}

type Phase = "idle" | "back" | "past" | "forward" | "arrived";
const NOW = new Date().getFullYear();
const PAST = NOW - 10;

interface Props {
  holdingsTickers?: string[];
}

export function TimeMachinePreview({ holdingsTickers = [] }: Props) {
  const navigate = useNavigate();
  const [idx, setIdx] = useState(() => getDailyIndex(holdingsTickers));
  const [phase, setPhase] = useState<Phase>("idle");
  const [year, setYear] = useState(NOW);
  const [value, setValue] = useState(10_000_000);
  const timers = useRef<number[]>([]);

  useEffect(() => { setIdx(getDailyIndex(holdingsTickers)); }, [holdingsTickers.join(",")]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const prices = useLivePrices();
  const pick = liveBigTech(POOL[idx], prices);
  const multiple = pick.priceToday / pick.price10yAgo;
  const finalValue = 10_000_000 * multiple;
  const ownedHint = holdingsTickers.includes(pick.ticker);
  const reduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const fmt = (v: number) => (v >= 100_000_000 ? `${(v / 100_000_000).toFixed(1)}억` : `${Math.round(v / 10_000).toLocaleString()}만`);

  const animate = (from: number, to: number, ms: number, onTick: (t: number) => void, done: () => void) => {
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      onTick(from + (to - from) * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(step); else done();
    };
    requestAnimationFrame(step);
  };

  const ride = (nextIdx = idx) => {
    if (phase === "back" || phase === "forward") return;
    timers.current.forEach(clearTimeout);
    setIdx(nextIdx);
    if (reduced) { setYear(NOW); setValue(10_000_000 * (liveBigTech(POOL[nextIdx], prices).priceToday / POOL[nextIdx].price10yAgo)); setPhase("arrived"); return; }
    setPhase("back");
    setValue(10_000_000);
    animate(NOW, PAST, 900, (y) => setYear(Math.round(y)), () => {
      setPhase("past");
      timers.current.push(window.setTimeout(() => {
        setPhase("forward");
        const target = 10_000_000 * (liveBigTech(POOL[nextIdx], prices).priceToday / POOL[nextIdx].price10yAgo);
        animate(0, 1, 1400, (t) => { setYear(Math.round(PAST + (NOW - PAST) * t)); setValue(10_000_000 + (target - 10_000_000) * t); }, () => setPhase("arrived"));
      }, 1300));
    });
  };

  const warping = phase === "back" || phase === "forward";

  return (
    <PpuriCard className="overflow-hidden">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CuteIcon emoji="⏰" size="sm" />
          <p className="text-small font-bold text-foreground">오늘의 시간 머신</p>
        </div>
        {ownedHint && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">내 종목</span>}
      </div>

      {/* 탑승할 기업 고르기 */}
      <div className="mb-2 flex gap-1.5" role="tablist" aria-label="탑승할 기업">
        {POOL.map((b, i) => (
          <button
            key={b.ticker}
            type="button"
            role="tab"
            aria-selected={i === idx}
            onClick={() => ride(i)}
            className={`min-h-11 flex-1 rounded-xl border text-xs font-bold transition-all press-effect ${i === idx ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground"}`}
          >
            {b.ticker}
          </button>
        ))}
      </div>

      <div className={`relative rounded-xl bg-gradient-to-r from-primary/10 to-accent/30 p-3 ${warping ? "tm-shake" : ""}`} data-testid="tm-cockpit">
        {warping && (
          <span className="tm-warp" aria-hidden>
            <i /><i /><i /><i />
            <b style={{ left: 0, top: "30%" }} /><b style={{ left: 0, top: "55%", animationDelay: ".15s" }} /><b style={{ left: 0, top: "75%", animationDelay: ".3s" }} />
          </span>
        )}

        <div className="relative flex items-center justify-between">
          <p className="text-xs font-bold text-muted-foreground">{pick.emoji} {pick.company}</p>
          <p className="rounded-lg bg-foreground px-2 py-0.5 font-mono text-sm font-extrabold tabular-nums text-background" aria-live="polite" data-testid="tm-year">
            {year}년
          </p>
        </div>

        {phase === "idle" && (
          <div className="relative mt-2">
            <p className="text-sm text-foreground break-keep">10년 전 <b>{PAST}년</b>으로 돌아가 <b>{pick.company}</b>에 1,000만원을 넣고 기다려 볼까요?</p>
          </div>
        )}

        {phase === "back" && <p className="relative mt-3 text-center text-sm font-extrabold text-primary">과거로 이동 중…</p>}

        {phase === "past" && (
          <div className="tm-arrive relative mt-2 rounded-lg bg-card/80 p-2.5">
            <p className="text-xs font-bold text-primary">📍 {PAST}년 도착 · 1,000만원 투자</p>
            <p className="mt-1 text-sm italic text-foreground break-keep">"{pick.story}"</p>
          </div>
        )}

        {(phase === "forward" || phase === "arrived") && (
          <div className={`relative mt-2 ${phase === "arrived" ? "tm-arrive" : ""}`}>
            <p className="text-xs text-muted-foreground">{phase === "forward" ? "아무것도 하지 않고 기다리는 중…" : `📍 ${NOW}년 귀환 · 팔지 않고 머무른 결과`}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-extrabold tabular-nums text-primary">{fmt(phase === "arrived" ? finalValue : value)}원</p>
              {phase === "arrived" && <p className="text-small font-bold text-primary">×{multiple.toFixed(1)}배</p>}
            </div>
            {phase === "arrived" && <p className="mt-1 text-xs text-muted-foreground">과거 수익률은 미래 수익을 보장하지 않아요. 분할조정 종가 기준 추정치예요.</p>}
          </div>
        )}
      </div>

      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={() => ride()}
          disabled={warping || phase === "past"}
          className="min-h-11 flex-1 rounded-xl bg-primary text-sm font-extrabold text-primary-foreground shadow-button press-effect disabled:opacity-60"
          data-testid="tm-ride"
        >
          {phase === "idle" ? `🚀 ${PAST}년으로 출발` : phase === "arrived" ? "🔁 다시 타기" : "탑승 중…"}
        </button>
        <button type="button" onClick={() => navigate("/timemachine")} className="min-h-11 rounded-xl border border-border px-3 text-xs font-bold text-primary press-effect">
          더 많은 시나리오 →
        </button>
      </div>
    </PpuriCard>
  );
}
