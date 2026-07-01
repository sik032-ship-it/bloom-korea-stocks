import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";


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

// 작성 중 문장 임시 보관용 — 종목별로 분리해 페이지를 떠나도 복원
const DRAFT_KEY = "ppuri:daily-sentence-draft";
type DraftMap = Record<string, string>;

const readDrafts = (): DraftMap => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as DraftMap) : {};
  } catch {
    return {};
  }
};

const writeDrafts = (drafts: DraftMap): boolean => {
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts));
    return true;
  } catch {
    // quota/permission 문제는 무시 — 사용자 입력은 화면에 그대로 남음
    return false;
  }
};

export const DailySentenceInput = ({
  holdings,
  onSubmit,
  disabled,
  autoFocus = false,
}: DailySentenceInputProps) => {
  const [selectedTicker, setSelectedTicker] = useState(holdings[0]?.ticker || "");
  const [drafts, setDrafts] = useState<DraftMap>(() => readDrafts());
  const [sentence, setSentence] = useState(() => {
    const first = holdings[0]?.ticker;
    return first ? readDrafts()[first] ?? "" : "";
  });
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'failed'>('idle');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimerRef = useRef<number | null>(null);


  // 최초 mount 시 autoFocus 프롭이 true일 때만 focus — 스크롤 점프 방지
  useEffect(() => {
    if (autoFocus && !disabled && holdings.length > 0) {
      textareaRef.current?.focus({ preventScroll: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 종목을 바꾸면 해당 종목의 드래프트로 복원
  useEffect(() => {
    if (!selectedTicker) return;
    setSentence(readDrafts()[selectedTicker] ?? "");
    setSavedAt(null);
    setSaveStatus('idle');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTicker]);

  // 디바운스 자동 저장 — 입력이 멈춘 뒤 ~600ms 지나면 localStorage 에 저장
  useEffect(() => {
    if (!selectedTicker) return;
    if (sentence.trim().length > 0) {
      setSaveStatus('saving');
    } else {
      setSaveStatus('idle');
    }
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      const next = { ...readDrafts() };
      if (sentence.trim().length === 0) {
        delete next[selectedTicker];
      } else {
        next[selectedTicker] = sentence;
      }
      const ok = writeDrafts(next);
      setDrafts(next);
      if (ok) {
        setSaveStatus('saved');
        setSavedAt(Date.now());
      } else {
        setSaveStatus('failed');
      }
    }, 600);
    return () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    };
  }, [sentence, selectedTicker]);


  // 탭 닫기/이동 직전, 디바운스가 아직 안 끝났어도 즉시 보관
  useEffect(() => {
    const flush = () => {
      if (!selectedTicker) return;
      const drafts = readDrafts();
      if (sentence.trim().length === 0) {
        delete drafts[selectedTicker];
      } else {
        drafts[selectedTicker] = sentence;
      }
      writeDrafts(drafts);
    };
    window.addEventListener("beforeunload", flush);
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("beforeunload", flush);
      window.removeEventListener("pagehide", flush);
    };
  }, [sentence, selectedTicker]);

  const canSubmit = !!sentence.trim() && !!selectedTicker && !disabled;

  const clearDraft = (ticker: string) => {
    const drafts = readDrafts();
    delete drafts[ticker];
    writeDrafts(drafts);
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit(selectedTicker, sentence.trim());
    clearDraft(selectedTicker);
    setSentence("");
    setSavedAt(null);
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
            <span className="flex items-center gap-2">
              <span>
                빠른 저장: <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted font-mono text-[10px]">{shortcutLabel}</kbd>
              </span>
              <span className="flex items-center gap-1.5" aria-live="polite">
                {saveStatus === 'saving' && (
                  <>
                    <span className="inline-block w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <span>저장 중...</span>
                  </>
                )}
                {saveStatus === 'saved' && savedAt && (
                  <>
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-primary/80">
                      {new Date(savedAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })} 저장됨
                    </span>
                  </>
                )}
                {saveStatus === 'failed' && (
                  <>
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-red-500">저장 실패</span>
                  </>
                )}
              </span>
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
