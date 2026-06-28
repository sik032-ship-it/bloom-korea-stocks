import { useEffect, useRef, useState } from "react";

interface DailySentenceInputProps {
  holdings: { ticker: string; company_name_kr: string }[];
  onSubmit: (ticker: string, sentence: string) => void;
  disabled?: boolean;
  /** Auto-focus the textarea on mount. Default false to avoid scroll jumps on Home. */
  autoFocus?: boolean;
}

// Mac에서는 ⌘+Enter, 그 외에는 Ctrl+Enter
const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/.test(navigator.platform);
const shortcutLabel = isMac ? "⌘ + Enter" : "Ctrl + Enter";

export const DailySentenceInput = ({
  holdings,
  onSubmit,
  disabled,
  autoFocus = false,
}: DailySentenceInputProps) => {
  const [selectedTicker, setSelectedTicker] = useState(holdings[0]?.ticker || "");
  const [sentence, setSentence] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 최초 mount 시 autoFocus 프롭이 true일 때만 focus — 스크롤 점프 방지
  useEffect(() => {
    if (autoFocus && !disabled && holdings.length > 0) {
      textareaRef.current?.focus({ preventScroll: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canSubmit = !!sentence.trim() && !!selectedTicker && !disabled;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit(selectedTicker, sentence.trim());
    setSentence("");
  };

  // 종목을 바꿔 고르면 자연스럽게 입력으로 포커스 이동 — 한 손 흐름 유지
  const handleSelectTicker = (ticker: string) => {
    setSelectedTicker(ticker);
    textareaRef.current?.focus({ preventScroll: true });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Cmd/Ctrl + Enter 로 저장 — 줄바꿈은 그냥 Enter 로 유지
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const selectedHolding = holdings.find((h) => h.ticker === selectedTicker);

  return (
    <div className="bg-card rounded-lg border border-border p-5 shadow-card animate-slide-up">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">✍️</span>
        <h2 className="text-title text-foreground">오늘의 한 문장</h2>
      </div>
      <p className="text-small text-muted-foreground mb-4">
        보유 종목에 대해 한 문장을 써보세요. 작은 습관이 투자 체질을 바꿉니다.
      </p>

      {holdings.length > 0 ? (
        <>
          <div className="flex gap-2 mb-3 flex-wrap">
            {holdings.map((h) => (
              <button
                key={h.ticker}
                onClick={() => handleSelectTicker(h.ticker)}
                className={`px-3 py-1.5 rounded-md text-small font-medium transition-all ${
                  selectedTicker === h.ticker
                    ? "bg-primary text-primary-foreground shadow-button"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                {h.ticker}
              </button>
            ))}
          </div>

          {selectedHolding && (
            <p className="text-xs text-muted-foreground mb-2">
              {selectedHolding.company_name_kr} ({selectedHolding.ticker})
            </p>
          )}

          <textarea
            ref={textareaRef}
            value={sentence}
            onChange={(e) => setSentence(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`${selectedTicker}에 대해 오늘 느낀 한 문장을 적어보세요...`}
            className="w-full bg-input border border-border rounded-md p-3 text-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none h-24"
            disabled={disabled}
            aria-label="오늘의 한 문장 입력"
          />

          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              빠른 저장: <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted font-mono text-[10px]">{shortcutLabel}</kbd>
            </span>
            <span className="tabular-nums">{sentence.length}자</span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="mt-3 w-full py-3 rounded-md bg-primary text-primary-foreground font-semibold text-body shadow-button hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {disabled ? "✅ 오늘의 문장 완료!" : "🌱 문장 심기"}
          </button>
        </>
      ) : (
        <div className="text-center py-6">
          <p className="text-3xl mb-2">📊</p>
          <p className="text-small text-muted-foreground">
            먼저 보유 종목을 추가해주세요
          </p>
        </div>
      )}
    </div>
  );
};
