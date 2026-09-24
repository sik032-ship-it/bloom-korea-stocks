import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Layout } from "@/components/Layout";
import { PpuriCard } from "@/components/PpuriCard";
import { LEGENDARY_BARGAINS } from "@/data/legendaryBargains";

export default function LegendsPage() {
  return (
    <Layout>
      <div className="flex items-center gap-2">
        <Link to="/holdings" className="p-2 -ml-2 text-muted-foreground hover:text-foreground" aria-label="보유 종목으로 돌아가기">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-display text-foreground">역사 속 헐값 카드</h1>
      </div>
      <p className="text-small text-muted-foreground">당시엔 아무도 싸다고 하지 않았던 순간들이에요.</p>
      <div className="space-y-3">
        {LEGENDARY_BARGAINS.map((b) => (
          <PpuriCard key={b.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-caption text-muted-foreground">{b.investor} · {b.buyYear}년</p>
                <p className="text-body font-bold text-foreground">{b.company} <span className="text-muted-foreground font-medium">{b.ticker}</span></p>
              </div>
              <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-small font-bold text-primary">약 {b.multiplier}배</span>
            </div>
            <p className="mt-2 text-small text-muted-foreground">{b.buyPriceLabel} → {b.todayPriceLabel}</p>
            <p className="mt-3 text-small leading-relaxed text-foreground">{b.story}</p>
            <p className="mt-3 text-small font-semibold text-primary">{b.lesson}</p>
            {b.source && <p className="mt-2 text-caption text-muted-foreground">출처: {b.source}</p>}
          </PpuriCard>
        ))}
      </div>
    </Layout>
  );
}
