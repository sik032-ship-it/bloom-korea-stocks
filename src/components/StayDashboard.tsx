// 머무름 대시보드 — 보유 종목별 "얼마나 머물렀는지(보유 기간)"를 시각화
// 10계명 #10: When이 아니라 Where. 매수일·수익률 대신 "오래 머물렀다는 사실" 자체를 자랑한다.
// 시간이 위대한 기업의 편이라는 감각을 매일 시각적으로 강화.

import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Sprout } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Holding = Database["public"]["Tables"]["holdings"]["Row"];

interface Props {
  holdings: Holding[];
}

const DAY_MS = 86_400_000;

function daysHeld(addedAt: string): number {
  return Math.max(1, Math.floor((Date.now() - new Date(addedAt).getTime()) / DAY_MS));
}

function tierFor(days: number): { label: string; tone: string; barTone: string } {
  if (days >= 365 * 5) return { label: "5년+ 머묾",   tone: "text-tone-growth-fg",  barTone: "bg-tone-growth-fg" };
  if (days >= 365 * 3) return { label: "3년+ 머묾",   tone: "text-tone-growth-fg",  barTone: "bg-tone-growth-fg" };
  if (days >= 365)     return { label: "1년+ 머묾",   tone: "text-tone-growth-fg",  barTone: "bg-tone-growth-fg/80" };
  if (days >= 90)      return { label: "분기+ 머묾",  tone: "text-foreground",      barTone: "bg-tone-growth-fg/60" };
  if (days >= 30)      return { label: "한 달+",      tone: "text-foreground",      barTone: "bg-tone-growth-fg/45" };
  return                      { label: "막 시작",     tone: "text-muted-foreground",barTone: "bg-tone-growth-fg/30" };
}

function formatStay(days: number): string {
  if (days >= 365) {
    const y = Math.floor(days / 365);
    const remM = Math.floor((days % 365) / 30);
    return remM > 0 ? `${y}년 ${remM}개월` : `${y}년`;
  }
  if (days >= 30) {
    const m = Math.floor(days / 30);
    const remD = days % 30;
    return remD > 0 ? `${m}개월 ${remD}일` : `${m}개월`;
  }
  return `${days}일`;
}

export function StayDashboard({ holdings }: Props) {
  const items = useMemo(() => {
    return holdings
      .map((h) => ({ h, days: daysHeld(h.added_at) }))
      .sort((a, b) => b.days - a.days);
  }, [holdings]);

  if (items.length === 0) {
    return (
      <section
        aria-label="머무름 대시보드"
        className="rounded-2xl border border-border bg-card p-4 text-center"
      >
        <p className="text-2xl mb-2">🌳</p>
        <p className="text-small font-bold text-foreground mb-1">머무름은 아직 0일</p>
        <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
          좋은 회사를 골라 오래 머무르는 것이 우리의 전략이에요.
        </p>
        <Link
          to="/holdings"
          className="inline-block px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 press-effect"
        >
          첫 종목 추가하기
        </Link>
      </section>
    );
  }

  const maxDays = items[0].days;
  const totalDays = items.reduce((s, x) => s + x.days, 0);
  const longestTier = tierFor(maxDays);

  return (
    <section
      aria-label="머무름 대시보드"
      className="rounded-2xl border border-border bg-card p-4 animate-fade-in"
    >
      <div className="flex items-end justify-between mb-1">
        <h2 className="text-small font-bold text-foreground">머무름 대시보드</h2>
        <span className="text-[10px] text-muted-foreground tracking-widest uppercase">Where, not When</span>
      </div>
      <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">
        매수일이 아니라 <strong className="text-foreground">얼마나 머물렀는지</strong>가 중요해요.
        시간은 좋은 기업의 편이에요.
      </p>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <Stat label="가장 오래" value={formatStay(maxDays)} />
        <Stat label="총 머무름" value={formatStay(totalDays)} />
        <Stat label="종목 수" value={`${items.length}개`} />
      </div>

      {/* Bars */}
      <ul className="space-y-2.5">
        {items.map(({ h, days }) => {
          const tier = tierFor(days);
          const pct = Math.max(4, Math.round((days / maxDays) * 100));
          return (
            <li key={h.id}>
              <div className="flex items-baseline justify-between mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-xs font-bold text-foreground tabular-nums shrink-0">
                    {h.ticker}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {h.company_name_kr}
                  </span>
                </div>
                <span className={`text-xs font-bold tabular-nums shrink-0 ${tier.tone}`}>
                  {formatStay(days)}
                </span>
              </div>
              <div
                className="h-2 bg-muted rounded-full overflow-hidden"
                role="progressbar"
                aria-valuenow={days}
                aria-valuemin={0}
                aria-valuemax={maxDays}
                aria-label={`${h.ticker} 보유 기간`}
              >
                <div
                  className={`h-full rounded-full transition-all duration-700 ${tier.barTone}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">{tier.label}</p>
            </li>
          );
        })}
      </ul>

      <p className="text-[11px] text-center text-muted-foreground mt-4 italic leading-relaxed">
        "우리의 이상적인 보유 기간은 <strong className="text-foreground">영원히</strong>다."
        <br />— 워런 버핏
      </p>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-tone-growth-bg border border-tone-growth-fg/15 p-2.5 text-center">
      <p className="text-small font-bold text-tone-growth-fg tabular-nums leading-tight">{value}</p>
      <p className="text-[10px] text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
