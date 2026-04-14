import { useState } from "react";

interface Holding {
  id: string;
  ticker: string;
  company_name_kr: string;
  sentence_count: number;
}

interface HoldingsListProps {
  holdings: Holding[];
  onAdd: (ticker: string, nameKr: string) => void;
  onRemove: (id: string) => void;
}

const POPULAR_STOCKS = [
  { ticker: "AAPL", name: "애플" },
  { ticker: "TSLA", name: "테슬라" },
  { ticker: "NVDA", name: "엔비디아" },
  { ticker: "MSFT", name: "마이크로소프트" },
  { ticker: "GOOGL", name: "구글" },
  { ticker: "AMZN", name: "아마존" },
  { ticker: "META", name: "메타" },
  { ticker: "AMD", name: "AMD" },
];

export const HoldingsList = ({ holdings, onAdd, onRemove }: HoldingsListProps) => {
  const [showAdd, setShowAdd] = useState(false);
  const [customTicker, setCustomTicker] = useState("");
  const [customName, setCustomName] = useState("");

  const handleQuickAdd = (ticker: string, name: string) => {
    if (holdings.find((h) => h.ticker === ticker)) return;
    onAdd(ticker, name);
  };

  const handleCustomAdd = () => {
    if (!customTicker.trim() || !customName.trim()) return;
    onAdd(customTicker.toUpperCase().trim(), customName.trim());
    setCustomTicker("");
    setCustomName("");
  };

  return (
    <div className="bg-card rounded-lg border border-border p-5 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">📊</span>
          <h2 className="text-title text-foreground">내 종목</h2>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="text-small font-medium text-primary hover:underline"
        >
          {showAdd ? "닫기" : "+ 추가"}
        </button>
      </div>

      {showAdd && (
        <div className="mb-4 p-3 bg-muted rounded-md animate-slide-up">
          <p className="text-small font-medium text-foreground mb-2">인기 종목</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {POPULAR_STOCKS.filter(
              (s) => !holdings.find((h) => h.ticker === s.ticker)
            ).map((s) => (
              <button
                key={s.ticker}
                onClick={() => handleQuickAdd(s.ticker, s.name)}
                className="px-2.5 py-1 rounded-md bg-card border border-border text-small hover:border-primary hover:text-primary transition-colors"
              >
                {s.ticker}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={customTicker}
              onChange={(e) => setCustomTicker(e.target.value)}
              placeholder="티커 (예: PLTR)"
              className="flex-1 bg-card border border-border rounded-md px-3 py-2 text-small focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="종목명 (예: 팔란티어)"
              className="flex-1 bg-card border border-border rounded-md px-3 py-2 text-small focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={handleCustomAdd}
              className="px-3 py-2 bg-primary text-primary-foreground rounded-md text-small font-medium"
            >
              추가
            </button>
          </div>
        </div>
      )}

      {holdings.length > 0 ? (
        <div className="space-y-2">
          {holdings.map((h) => (
            <div
              key={h.id}
              className="flex items-center justify-between p-3 bg-muted rounded-md"
            >
              <div>
                <p className="text-small font-semibold text-foreground">
                  {h.ticker}
                </p>
                <p className="text-xs text-muted-foreground">{h.company_name_kr}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  ✍️ {h.sentence_count}문장
                </span>
                <button
                  onClick={() => onRemove(h.id)}
                  className="text-xs text-destructive hover:underline"
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-small text-muted-foreground text-center py-4">
          아직 종목이 없습니다. 위에서 추가해보세요!
        </p>
      )}
    </div>
  );
};
