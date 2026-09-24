import { useEffect, useRef, useState } from "react";

/** 숫자가 통통 튀며 올라가는 카운트업 — 홈 핵심 지표에 생동감 부여 */
export function CountUp({ value, duration = 900, className }: { value: number; duration?: number; className?: string }) {
  const [display, setDisplay] = useState(0);
  const [popping, setPopping] = useState(false);
  const prevRef = useRef(0);

  useEffect(() => {
    const from = prevRef.current;
    prevRef.current = value;
    if (from === value) { setDisplay(value); return; }
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // easeOutBack — 살짝 오버슈트해서 통통 튀는 느낌
      const c1 = 1.70158, c3 = c1 + 1;
      const eased = 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
      setDisplay(Math.round(from + (value - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
      else { setPopping(true); setTimeout(() => setPopping(false), 300); }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return (
    <span className={`${className ?? ""} ${popping ? "animate-scale-pop" : ""} inline-block`}>
      {display}
    </span>
  );
}
