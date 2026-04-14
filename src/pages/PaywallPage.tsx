import React from "react";
import { useNavigate } from "react-router-dom";
import { PpuriButton } from "@/components/PpuriButton";
import { PpuriCard } from "@/components/PpuriCard";

const FEATURES = [
  { feature: "일일 문장", free: "1개", premium: "무제한" },
  { feature: "보유 종목", free: "최대 3개", premium: "무제한" },
  { feature: "기록 보관소", free: "30일", premium: "무제한" },
  { feature: "위기 모드", free: "✗", premium: "✓" },
  { feature: "데이터 내보내기", free: "✗", premium: "✓" },
  { feature: "고급 질문 유형", free: "✗", premium: "✓" },
];

export default function PaywallPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-xl">←</button>
          <h1 className="text-title font-bold text-foreground">프리미엄으로 업그레이드</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-5 flex-1">
        {/* Hero */}
        <div className="text-center">
          <span className="text-6xl block mb-3">🌳</span>
          <h2 className="text-display text-foreground">PPURI 프리미엄</h2>
          <p className="text-body text-muted-foreground mt-2">
            무제한 문장으로 투자 체질을 완성하세요
          </p>
        </div>

        {/* Comparison Table */}
        <PpuriCard>
          <div className="overflow-x-auto">
            <table className="w-full text-small">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-muted-foreground font-medium">기능</th>
                  <th className="text-center py-2 text-muted-foreground font-medium">무료</th>
                  <th className="text-center py-2 text-primary font-bold">프리미엄</th>
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((f) => (
                  <tr key={f.feature} className="border-b border-border last:border-0">
                    <td className="py-2.5 text-foreground">{f.feature}</td>
                    <td className="py-2.5 text-center text-muted-foreground">{f.free}</td>
                    <td className="py-2.5 text-center text-primary font-medium">{f.premium}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PpuriCard>

        {/* Pricing Cards */}
        <div className="grid grid-cols-2 gap-3">
          <PpuriCard className="text-center border-2 border-border">
            <p className="text-small text-muted-foreground mb-1">월간</p>
            <p className="text-display text-foreground">₩4,900</p>
            <p className="text-xs text-muted-foreground mb-3">/ 월</p>
            <PpuriButton variant="secondary" fullWidth>
              구독하기
            </PpuriButton>
          </PpuriCard>

          <PpuriCard className="text-center border-2 border-primary relative">
            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-primary text-primary-foreground text-xs font-bold rounded-full">
              33% 할인
            </span>
            <p className="text-small text-muted-foreground mb-1">연간</p>
            <p className="text-display text-foreground">₩39,000</p>
            <p className="text-xs text-muted-foreground mb-3">/ 년 (₩3,250/월)</p>
            <PpuriButton fullWidth>
              구독하기
            </PpuriButton>
          </PpuriCard>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          구독은 언제든 취소할 수 있어요. 결제 연동은 곧 준비됩니다.
        </p>
      </main>
    </div>
  );
}
