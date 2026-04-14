import { useState } from "react";
import { LevelBadge } from "@/components/LevelBadge";
import { StreakDisplay } from "@/components/StreakDisplay";
import { DailySentenceInput } from "@/components/DailySentenceInput";
import { HoldingsList } from "@/components/HoldingsList";

// Demo data for first version (will be replaced with Supabase)
const DEMO_HOLDINGS = [
  { id: "1", ticker: "AAPL", company_name_kr: "애플", sentence_count: 12 },
  { id: "2", ticker: "TSLA", company_name_kr: "테슬라", sentence_count: 8 },
  { id: "3", ticker: "NVDA", company_name_kr: "엔비디아", sentence_count: 5 },
];

const Index = () => {
  const [holdings, setHoldings] = useState(DEMO_HOLDINGS);
  const [todayDone, setTodayDone] = useState(false);
  const [totalSentences, setTotalSentences] = useState(25);
  const [currentStreak, setCurrentStreak] = useState(7);

  const handleSentenceSubmit = (ticker: string, sentence: string) => {
    setTodayDone(true);
    setTotalSentences((prev) => prev + 1);
    setCurrentStreak((prev) => prev + 1);
    setHoldings((prev) =>
      prev.map((h) =>
        h.ticker === ticker ? { ...h, sentence_count: h.sentence_count + 1 } : h
      )
    );
  };

  const handleAddHolding = (ticker: string, nameKr: string) => {
    setHoldings((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        ticker,
        company_name_kr: nameKr,
        sentence_count: 0,
      },
    ]);
  };

  const handleRemoveHolding = (id: string) => {
    setHoldings((prev) => prev.filter((h) => h.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌱</span>
            <h1 className="text-title text-foreground font-bold">PPURI</h1>
          </div>
          <StreakDisplay currentStreak={currentStreak} longestStreak={14} />
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Level Card */}
        <div className="bg-card rounded-lg border border-border p-5 shadow-card">
          <LevelBadge totalSentences={totalSentences} />
          <div className="mt-3 flex items-center gap-2">
            <span className="text-small text-muted-foreground">총</span>
            <span className="text-title text-primary font-bold">{totalSentences}</span>
            <span className="text-small text-muted-foreground">문장 기록</span>
          </div>
        </div>

        {/* Daily Sentence */}
        <DailySentenceInput
          holdings={holdings.map((h) => ({
            ticker: h.ticker,
            company_name_kr: h.company_name_kr,
          }))}
          onSubmit={handleSentenceSubmit}
          disabled={todayDone}
        />

        {/* Holdings */}
        <HoldingsList
          holdings={holdings}
          onAdd={handleAddHolding}
          onRemove={handleRemoveHolding}
        />

        {/* Motivational Footer */}
        <div className="text-center py-4">
          <p className="text-small text-muted-foreground">
            🌱 매일 한 문장이 투자 체질을 바꿉니다
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;
