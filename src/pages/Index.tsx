import { useState } from "react";
import { Layout } from "@/components/Layout";
import { PpuriCard } from "@/components/PpuriCard";
import { MascotAvatar } from "@/components/MascotAvatar";
import { LevelBadge } from "@/components/LevelBadge";
import { ProgressBar } from "@/components/ProgressBar";
import { QuestionBadge } from "@/components/QuestionBadge";
import { DailySentenceInput } from "@/components/DailySentenceInput";
import { HoldingsList } from "@/components/HoldingsList";

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

  const handleSentenceSubmit = (ticker: string, _sentence: string) => {
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
      { id: crypto.randomUUID(), ticker, company_name_kr: nameKr, sentence_count: 0 },
    ]);
  };

  const handleRemoveHolding = (id: string) => {
    setHoldings((prev) => prev.filter((h) => h.id !== id));
  };

  return (
    <Layout currentStreak={currentStreak} longestStreak={14}>
      {/* Level & Progress */}
      <PpuriCard>
        <div className="flex items-center gap-4">
          <MascotAvatar level={1} size="lg" />
          <div className="flex-1">
            <LevelBadge totalSentences={totalSentences} />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span className="text-small text-muted-foreground">총</span>
          <span className="text-title text-primary font-bold">{totalSentences}</span>
          <span className="text-small text-muted-foreground">문장 기록</span>
        </div>
      </PpuriCard>

      {/* Question Type Badges Preview */}
      <PpuriCard>
        <p className="text-small font-semibold text-foreground mb-3">질문 유형</p>
        <div className="flex flex-wrap gap-2">
          <QuestionBadge type="daily" />
          <QuestionBadge type="earnings" />
          <QuestionBadge type="drop" />
          <QuestionBadge type="surge" />
          <QuestionBadge type="fomo" />
        </div>
      </PpuriCard>

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
    </Layout>
  );
};

export default Index;
