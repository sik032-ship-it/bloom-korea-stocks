import React, { useState } from "react";
import { Layout } from "@/components/Layout";
import { PpuriCard } from "@/components/PpuriCard";
import { LEGENDARY_BARGAINS, type LegendaryBargain } from "@/data/legendaryBargains";

const FILTERS: { key: "all" | LegendaryBargain["category"]; label: string; emoji: string }[] = [
  { key: "all", label: "전체", emoji: "✨" },
  { key: "consumer", label: "일상 소비", emoji: "🛒" },
  { key: "tech", label: "테크", emoji: "💻" },
  { key: "finance", label: "금융", emoji: "🏦" },
  { key: "industrial", label: "산업", emoji: "🏭" },
];

export default function LegendsPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const items = filter === "all" ? LEGENDARY_BARGAINS : LEGENDARY_BARGAINS.filter((b) => b.category === filter);
  const open = openId ? LEGENDARY_BARGAINS.find((b) => b.id === openId) : null;

  return (
    <Layout>
      <div className="space-y-2">
        <h1 className="text-display text-foreground">📜 역사 속 헐값 카드</h1>
        <p className="text-small text-muted-foreground">
          전설적 투자자들이 "비싸다"는 소리를 들으며 매수했던 그 가격 — 오늘 보면 어떨까요?
        </p>
      </div>

      {/* Disclaimer */}
      <div className="rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
        ⚠️ 이건 미래 예측이 아니라 <b>역사적 사실</b>입니다. 가격은 분할조정 기준 근사치이며, 과거 수익이 미래를 보장하진 않아요.
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`shrink-0 px-3 h-9 rounded-full border text-small font-medium transition-all press-effect ${
              filter === f.key
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            {f.emoji} {f.label}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {items.map((b) => (
          <PpuriCard key={b.id} hoverable onClick={() => setOpenId(b.id)}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{b.investorEmoji}</span>
                  <span className="text-xs text-muted-foreground">{b.investor} · {b.buyYear}년</span>
                </div>
                <p className="text-body font-bold text-foreground">
                  {b.company} <span className="text-xs text-muted-foreground font-normal">({b.ticker})</span>
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-xs text-muted-foreground">당시</span>
                  <span className="text-small font-semibold text-foreground">{b.buyPriceLabel}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="text-small font-semibold text-primary">{b.todayPriceLabel}</span>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-display text-primary font-bold leading-none">×{b.multiplier < 10 ? b.multiplier.toFixed(1) : Math.round(b.multiplier)}</div>
                <div className="text-xs text-muted-foreground mt-1">배 성장</div>
              </div>
            </div>
          </PpuriCard>
        ))}
      </div>

      {/* Detail modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 backdrop-blur-sm p-4" onClick={() => setOpenId(null)}>
          <div className="bg-card rounded-2xl p-6 w-full max-w-md max-h-[85vh] overflow-y-auto animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{open.investorEmoji}</span>
                <div>
                  <p className="text-small text-muted-foreground">{open.investor}</p>
                  <p className="text-title text-foreground font-bold">{open.company}</p>
                </div>
              </div>
              <button onClick={() => setOpenId(null)} className="text-muted-foreground text-2xl leading-none">×</button>
            </div>

            <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 mb-4">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-xs text-muted-foreground">{open.buyYear}년 매수가</span>
                <span className="text-small font-bold text-foreground">{open.buyPriceLabel}</span>
              </div>
              <div className="flex items-baseline justify-between mb-3">
                <span className="text-xs text-muted-foreground">오늘 가격</span>
                <span className="text-small font-bold text-primary">{open.todayPriceLabel}</span>
              </div>
              <div className="text-center pt-3 border-t border-primary/20">
                <span className="text-display text-primary font-bold">×{open.multiplier < 10 ? open.multiplier.toFixed(1) : Math.round(open.multiplier)}</span>
                <span className="text-small text-muted-foreground ml-2">배 성장</span>
              </div>
            </div>

            <p className="text-small text-foreground leading-relaxed mb-4">{open.story}</p>

            <div className="rounded-md bg-accent/40 p-3 border-l-4 border-primary">
              <p className="text-small text-foreground font-medium">💡 {open.lesson}</p>
            </div>
            <p className="text-[10px] text-muted-foreground mt-3 leading-relaxed">
              ⚠️ 위 사례는 역사적 사실 기록으로, 특정 종목 매수를 권유하거나 미래 수익을 보장하지 않습니다.
              모든 투자 결정은 본인 책임입니다.
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
