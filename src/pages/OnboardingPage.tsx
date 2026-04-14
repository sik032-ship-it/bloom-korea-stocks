import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { PpuriButton } from "@/components/PpuriButton";

const POPULAR_STOCKS = [
  { ticker: "AAPL", name: "애플" },
  { ticker: "TSLA", name: "테슬라" },
  { ticker: "NVDA", name: "엔비디아" },
  { ticker: "MSFT", name: "마이크로소프트" },
  { ticker: "GOOGL", name: "구글" },
  { ticker: "AMZN", name: "아마존" },
  { ticker: "META", name: "메타" },
  { ticker: "AMD", name: "AMD" },
  { ticker: "NFLX", name: "넷플릭스" },
  { ticker: "DIS", name: "디즈니" },
  { ticker: "COST", name: "코스트코" },
  { ticker: "JPM", name: "JP모건" },
  { ticker: "V", name: "비자" },
  { ticker: "MA", name: "마스터카드" },
  { ticker: "PLTR", name: "팔란티어" },
  { ticker: "COIN", name: "코인베이스" },
  { ticker: "SOFI", name: "소파이" },
  { ticker: "SNOW", name: "스노우플레이크" },
  { ticker: "CRM", name: "세일즈포스" },
  { ticker: "UBER", name: "우버" },
];

interface HoldingItem {
  ticker: string;
  company_name_kr: string;
}

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`w-2.5 h-2.5 rounded-full transition-colors ${
            i < current ? "bg-primary" : "bg-muted"
          }`}
        />
      ))}
    </div>
  );
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [holdings, setHoldings] = useState<HoldingItem[]>([]);
  const [customTicker, setCustomTicker] = useState("");
  const [customName, setCustomName] = useState("");
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const addHolding = (ticker: string, name: string) => {
    if (holdings.length >= 10 || holdings.find((h) => h.ticker === ticker)) return;
    setHoldings([...holdings, { ticker, company_name_kr: name }]);
  };

  const removeHolding = (ticker: string) => {
    setHoldings(holdings.filter((h) => h.ticker !== ticker));
  };

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // Insert holdings
      const holdingsData = holdings.map((h) => ({
        user_id: user.id,
        ticker: h.ticker,
        company_name_kr: h.company_name_kr,
      }));
      await supabase.from("holdings").insert(holdingsData);

      // Update profile display name
      const displayName = user.user_metadata?.display_name;
      if (displayName) {
        await supabase.from("profiles").update({ display_name: displayName }).eq("id", user.id);
      }

      navigate("/");
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ProgressDots current={step} total={3} />

      <div className="flex-1 flex flex-col px-6 max-w-lg mx-auto w-full">
        {step === 1 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-slide-up">
            <span className="text-7xl mb-6">🌱</span>
            <h1 className="text-display text-foreground mb-4">
              매일 한 문장이<br />투자 체질을 만듭니다
            </h1>
            <p className="text-body text-muted-foreground mb-2">
              보유 종목에 대해 하루에 딱 한 문장만 써보세요.
            </p>
            <p className="text-body text-muted-foreground mb-8">
              작은 습관이 반응적 매매를 의식적 투자로 바꿔줍니다.
            </p>
            <PpuriButton fullWidth onClick={() => setStep(2)}>
              다음
            </PpuriButton>
          </div>
        )}

        {step === 2 && (
          <div className="flex-1 flex flex-col animate-slide-up">
            <h1 className="text-display text-foreground mb-2 mt-4">
              보유 종목을 알려주세요
            </h1>
            <p className="text-small text-muted-foreground mb-4">
              최대 10개까지 추가할 수 있어요
            </p>

            {/* Added holdings */}
            {holdings.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {holdings.map((h) => (
                  <span
                    key={h.ticker}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-accent text-accent-foreground rounded-full text-small font-medium"
                  >
                    {h.ticker}
                    <button
                      onClick={() => removeHolding(h.ticker)}
                      className="ml-1 text-muted-foreground hover:text-destructive"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Popular stocks */}
            <p className="text-small font-medium text-foreground mb-2">인기 종목</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {POPULAR_STOCKS.filter((s) => !holdings.find((h) => h.ticker === s.ticker))
                .slice(0, 12)
                .map((s) => (
                  <button
                    key={s.ticker}
                    onClick={() => addHolding(s.ticker, s.name)}
                    className="px-3 py-1.5 rounded-md bg-muted text-muted-foreground text-small hover:border-primary hover:text-primary border border-transparent transition-colors"
                  >
                    {s.ticker}
                    <span className="text-xs ml-1 opacity-60">{s.name}</span>
                  </button>
                ))}
            </div>

            {/* Custom input */}
            <div className="flex gap-2 mb-6">
              <input
                value={customTicker}
                onChange={(e) => setCustomTicker(e.target.value.toUpperCase())}
                placeholder="티커"
                className="flex-1 h-11 px-3 rounded-md bg-input border border-border text-small focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="종목명"
                className="flex-1 h-11 px-3 rounded-md bg-input border border-border text-small focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <PpuriButton
                variant="secondary"
                onClick={() => {
                  if (customTicker && customName) {
                    addHolding(customTicker, customName);
                    setCustomTicker("");
                    setCustomName("");
                  }
                }}
              >
                추가
              </PpuriButton>
            </div>

            <div className="mt-auto pb-6 flex gap-3">
              <PpuriButton variant="ghost" onClick={() => setStep(1)}>
                이전
              </PpuriButton>
              <PpuriButton
                fullWidth
                disabled={holdings.length === 0}
                onClick={() => setStep(3)}
              >
                다음
              </PpuriButton>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-slide-up">
            <span className="text-6xl mb-4">🎉</span>
            <h1 className="text-display text-foreground mb-3">
              준비 완료!
            </h1>
            <p className="text-body text-muted-foreground mb-2">
              첫 번째 문장을 써볼까요?
            </p>
            <p className="text-title text-primary font-bold mb-6">
              {holdings.length}개 종목을 추가했어요
            </p>

            <div className="w-full space-y-2 mb-8">
              {holdings.map((h) => (
                <div
                  key={h.ticker}
                  className="flex items-center gap-3 p-3 bg-muted rounded-md"
                >
                  <span className="text-small font-bold text-foreground">
                    {h.ticker}
                  </span>
                  <span className="text-small text-muted-foreground">
                    {h.company_name_kr}
                  </span>
                </div>
              ))}
            </div>

            <div className="w-full flex gap-3">
              <PpuriButton variant="ghost" onClick={() => setStep(2)}>
                이전
              </PpuriButton>
              <PpuriButton fullWidth onClick={handleFinish} disabled={saving}>
                {saving ? "저장 중..." : "🌱 시작하기"}
              </PpuriButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
