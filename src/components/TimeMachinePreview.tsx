import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BIG_TECH } from "@/data/bigTechHistory";
import { useLivePrices, liveBigTech } from "@/lib/livePrices";
import { PpuriCard } from "@/components/PpuriCard";
import { TIME_MACHINE, TM_FIRST_YEAR, closeAt, milestoneAt } from "@/data/timeMachineHistory";
import machineIcon from "@/assets/tm-machine.png";

const POOL = TIME_MACHINE;
const LAST_YEAR = POOL[0].closes[POOL[0].closes.length - 1].year;
const NOW = new Date().getFullYear();

function getDailyIndex(holdingsTickers: string[]) {
  const dayIdx = Math.floor(Date.now() / 86400000);
  const owned = POOL.map((b, i) => (holdingsTickers.includes(b.ticker) ? i : -1)).filter((i) => i >= 0);
  return owned.length ? owned[dayIdx % owned.length] : dayIdx % POOL.length;
}

type Phase = "idle" | "back" | "past" | "forward" | "arrived";

interface Props { holdingsTickers?: string[]; }

export function TimeMachinePreview({ holdingsTickers = [] }: Props) {
  const navigate = useNavigate();
  const [idx, setIdx] = useState(() => getDailyIndex(holdingsTickers));
  const [startYear, setStartYear] = useState(2016);
  const [phase, setPhase] = useState<Phase>("idle");
  const [year, setYear] = useState(NOW);
  const [value, setValue] = useState(10_000_000);
  const timers = useRef<number[]>([]);
  const lastTick = useRef(startYear);

  useEffect(() => { setIdx(getDailyIndex(holdingsTickers)); }, [holdingsTickers.join(",")]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const prices = useLivePrices();
  const c = POOL[idx];
  const rec = BIG_TECH.find((b) => b.ticker === c.ticker);
  const todayPrice = rec ? liveBigTech(rec, prices).priceToday : closeAt(c, LAST_YEAR);
  const multipleFrom = (y: number) => todayPrice / closeAt(c, y);
  const multiple = multipleFrom(startYear);
  const finalValue = 10_000_000 * multiple;
  const ms = milestoneAt(c, phase === "idle" ? startYear : Math.min(year, LAST_YEAR));
  const ownedHint = holdingsTickers.includes(c.ticker);
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

  const onDrag = (y: number) => {
    if (phase !== "idle" && phase !== "arrived") return;
    setPhase("idle");
    setStartYear(y);
    if (y !== lastTick.current) {
      lastTick.current = y;
      navigator.vibrate?.(8);
    }
  };

  const ride = () => {
    if (phase === "back" || phase === "forward") return;
    timers.current.forEach(clearTimeout);
    const target = 10_000_000 * multipleFrom(startYear);
    if (reduced) { setYear(NOW); setValue(target); setPhase("arrived"); return; }
    setPhase("back");
    setValue(10_000_000);
    animate(NOW, startYear, 700 + (NOW - startYear) * 40, (y) => setYear(Math.round(y)), () => {
      setPhase("past");
      timers.current.push(window.setTimeout(() => {
        setPhase("forward");
        animate(0, 1, 1600, (t) => {
          const y = Math.round(startYear + (NOW - startYear) * t);
          setYear(y);
          const p = y >= NOW ? todayPrice : closeAt(c, Math.min(y, LAST_YEAR));
          setValue(10_000_000 * (p / closeAt(c, startYear)));
        }, () => { setValue(target); setPhase("arrived"); });
      }, 1600));
    });
  };

  const warping = phase === "back" || phase === "forward";
  const pct = ((startYear - TM_FIRST_YEAR) / (LAST_YEAR - TM_FIRST_YEAR)) * 100;

  return (
    <PpuriCard className="overflow-hidden">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={machineIcon} alt="" width={36} height={36} className={`h-9 w-9 ${warping ? "tm-shake" : "mascot-alive"}`} />
          <p className="text-small font-bold text-foreground">오늘의 시간 머신</p>
        </div>
        {ownedHint && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">내 종목</span>}
      </div>

      <div className="mb-2 grid grid-cols-4 gap-1.5" role="tablist" aria-label="탑승할 기업">
        {POOL.map((b, i) => (
          <button
            key={b.ticker}
            type="button"
            role="tab"
            aria-selected={i === idx}
            disabled={warping}
            onClick={() => { setIdx(i); setPhase("idle"); }}
            className={`flex min-h-11 flex-col items-center rounded-xl border py-1 text-xs font-bold transition-all press-effect ${i === idx ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground"}`}
          >
            <img src={b.icon} alt="" width={32} height={32} loading="lazy" className={`h-8 w-8 transition-transform ${i === idx ? "scale-110" : "opacity-70 grayscale-[40%]"}`} />
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
          <p className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
            <img src={c.icon} alt="" width={20} height={20} className="h-5 w-5" /> {c.company}
          </p>
          <p className="rounded-lg bg-foreground px-2 py-0.5 font-mono text-sm font-extrabold tabular-nums text-background" aria-live="polite" data-testid="tm-year">
            {phase === "idle" ? startYear : year}년
          </p>
        </div>

        {(phase === "idle" || phase === "past") && (
          <div className="tm-arrive relative mt-2 rounded-lg bg-card/80 p-2.5" key={`${c.ticker}-${ms.year}`} data-testid="tm-milestone">
            <p className="text-xs font-bold text-primary">📍 {phase === "past" ? `${startYear}년 말 도착 · 1,000만원 투자` : `${startYear}년 말의 ${c.company}`}</p>
            <p className="mt-1 text-sm text-foreground break-keep">{ms.story}</p>
            <dl className="mt-2 grid grid-cols-3 gap-1 text-xs">
              <div><dt className="text-muted-foreground">주가</dt><dd className="font-bold tabular-nums text-foreground">${closeAt(c, startYear).toFixed(2)}</dd></div>
              <div><dt className="text-muted-foreground">{ms.year}년 매출</dt><dd className="font-bold text-foreground">{ms.revenue}</dd></div>
              <div><dt className="text-muted-foreground">{ms.year}년 순이익</dt><dd className="font-bold text-foreground">{ms.netIncome}</dd></div>
            </dl>
            <p className="mt-1 text-xs text-muted-foreground break-keep">👔 {ms.leader}</p>
          </div>
        )}

        {phase === "back" && <p className="relative mt-3 text-center text-sm font-extrabold text-primary">과거로 이동 중…</p>}

        {(phase === "forward" || phase === "arrived") && (
          <div className={`relative mt-2 ${phase === "arrived" ? "tm-arrive" : ""}`}>
            <p className="text-xs text-muted-foreground">{phase === "forward" ? "아무것도 하지 않고 기다리는 중…" : `📍 ${NOW}년 귀환 · ${NOW - startYear}년 동안 팔지 않고 머무른 결과`}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-extrabold tabular-nums text-primary">{fmt(phase === "arrived" ? finalValue : value)}원</p>
              {phase === "arrived" && <p className="text-small font-bold text-primary">×{multiple.toFixed(1)}배</p>}
            </div>
            {phase === "arrived" && <p className="mt-1 text-xs text-muted-foreground">과거 수익률은 미래 수익을 보장하지 않아요. 분할조정 연말 종가 기준, 배당·환율·세금 제외 추정치예요.</p>}
          </div>
        )}
      </div>

      {/* 시간 레버 — 끌어서 출발 연도 조절 */}
      <div className="mt-3 px-1">
        <div className="mb-1 flex items-center justify-between text-xs font-bold text-muted-foreground">
          <span>⏪ 끌어서 시간 조절</span>
          {phase === "idle" && <span className="text-primary">오늘 가치 미리보기 ×{multiple.toFixed(1)}</span>}
        </div>
        <div className="relative h-11">
          <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-muted" />
          <div className="absolute left-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-primary/60" style={{ width: `${pct}%` }} />
          {c.milestones.map((m) => (
            <span key={m.year} className="absolute top-1/2 h-3 w-1 -translate-y-1/2 rounded bg-foreground/30" style={{ left: `${((m.year - TM_FIRST_YEAR) / (LAST_YEAR - TM_FIRST_YEAR)) * 100}%` }} aria-hidden />
          ))}
          <img src={machineIcon} alt="" width={40} height={40} className="pointer-events-none absolute top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 drop-shadow transition-[left] duration-75" style={{ left: `${pct}%` }} />
          <input
            type="range"
            min={TM_FIRST_YEAR}
            max={LAST_YEAR}
            step={1}
            value={startYear}
            disabled={warping || phase === "past"}
            onChange={(e) => onDrag(Number(e.target.value))}
            aria-label="출발 연도"
            data-testid="tm-lever"
            className="absolute inset-0 h-11 w-full cursor-grab opacity-0 active:cursor-grabbing"
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground"><span>{TM_FIRST_YEAR}</span><span>{LAST_YEAR}</span></div>
      </div>

      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={ride}
          disabled={warping || phase === "past"}
          className="min-h-11 flex-1 rounded-xl bg-primary text-sm font-extrabold text-primary-foreground shadow-button press-effect disabled:opacity-60"
          data-testid="tm-ride"
        >
          {phase === "arrived" ? "🔁 다시 타기" : warping || phase === "past" ? "탑승 중…" : `🚀 ${startYear}년으로 출발`}
        </button>
        <button type="button" onClick={() => navigate("/timemachine")} className="min-h-11 rounded-xl border border-border px-3 text-xs font-bold text-primary press-effect">
          더 많은 시나리오 →
        </button>
      </div>
    </PpuriCard>
  );
}
