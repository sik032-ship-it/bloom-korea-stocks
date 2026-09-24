// 주간 자동 갱신 가격 → "N배" 수치를 실제 최신 종가로 다시 계산
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { BigTechRecord } from "@/data/bigTechHistory";
import type { LegendaryBargain } from "@/data/legendaryBargains";

export type PriceMap = Record<string, { price: number; asOf: string }>;

let cache: PriceMap | null = null;
let inflight: Promise<PriceMap> | null = null;

function load(): Promise<PriceMap> {
  if (cache) return Promise.resolve(cache);
  inflight ??= Promise.resolve(
    supabase.from("stock_prices").select("ticker, price, as_of").then(({ data }) => {
      const m: PriceMap = {};
      (data ?? []).forEach((r) => { m[r.ticker] = { price: Number(r.price), asOf: r.as_of }; });
      cache = m;
      return m;
    }),
  ).catch(() => ({}) as PriceMap);
  return inflight;
}

/** 실패하면 빈 맵 → 코드에 적힌 기준 가격으로 조용히 폴백 */
export function useLivePrices(): PriceMap {
  const [p, setP] = useState<PriceMap>(cache ?? {});
  useEffect(() => { let on = true; load().then((m) => on && setP(m)); return () => { on = false; }; }, []);
  return p;
}

export function latestAsOf(p: PriceMap): string | null {
  const d = Object.values(p).map((x) => x.asOf).sort();
  return d.length ? d[d.length - 1] : null;
}

// 기준 시점: 2006.4 / 2016.4
const yearsSince = (y: number, m: number) => (Date.now() - Date.UTC(y, m - 1, 15)) / (365.25 * 86400000);

export function liveBigTech(b: BigTechRecord, p: PriceMap): BigTechRecord {
  const live = p[b.ticker]?.price;
  if (!live) return b;
  return {
    ...b,
    priceToday: live,
    cagr10y: Math.pow(live / b.price10yAgo, 1 / yearsSince(2016, 4)) - 1,
    cagr20y: Math.pow(live / b.price20yAgo, 1 / yearsSince(2006, 4)) - 1,
  };
}

const fmtMul = (m: number) => (m < 10 ? m.toFixed(1) : Math.round(m).toLocaleString("ko-KR"));

export function liveBargain(b: LegendaryBargain, p: PriceMap): LegendaryBargain {
  const live = p[b.ticker]?.price;
  const snap = Number(b.todayPriceLabel.replace(/[^0-9.]/g, ""));
  if (!live || !snap) return b;
  const mul = b.multiplier * (live / snap);
  const oldTxt = `약 ${fmtMul(b.multiplier)}배`;
  const newTxt = `약 ${fmtMul(mul)}배`;
  return {
    ...b,
    multiplier: Math.round(mul * 10) / 10,
    todayPriceLabel: `약 $${Math.round(live).toLocaleString("en-US")}`,
    story: b.story.split(oldTxt).join(newTxt),
    lesson: b.lesson.split(oldTxt).join(newTxt),
  };
}
