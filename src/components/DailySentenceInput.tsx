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
// 최근 제출 — 새로고침/탭 이동 후에도 5초 안이면 되돌리기 토스트 복원
const PENDING_UNDO_KEY = "ppuri:daily-sentence-pending-undo";
const UNDO_WINDOW_MS = 5000;

type DraftMap = Record<string, string>;
type PendingUndo = { ticker: string; text: string; submittedAt: number };

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

const readPendingUndo = (): PendingUndo | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PENDING_UNDO_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingUndo;
    if (!parsed?.ticker || typeof parsed.submittedAt !== "number") return null;
    if (Date.now() - parsed.submittedAt > UNDO_WINDOW_MS) {
      window.localStorage.removeItem(PENDING_UNDO_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

const writePendingUndo = (undo: PendingUndo | null) => {
  try {
    if (!undo) {
      window.localStorage.removeItem(PENDING_UNDO_KEY);
    } else {
      window.localStorage.setItem(PENDING_UNDO_KEY, JSON.stringify(undo));
    }
  } catch {
    /* ignore */
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


  // 되돌리기 — 제출 후 5초 안에 초안으로 복원 (새로고침/탭 이동 후에도 동일하게 동작)
  const restorePendingUndo = (undo: PendingUndo) => {
    setSelectedTicker(undo.ticker);
    setSentence(undo.text);
    const next = { ...readDrafts(), [undo.ticker]: undo.text };
    writeDrafts(next);
    setDrafts(next);
    writePendingUndo(null);
    textareaRef.current?.focus({ preventScroll: true });
  };

  const showUndoToast = (undo: PendingUndo) => {
    const remaining = Math.max(0, UNDO_WINDOW_MS - (Date.now() - undo.submittedAt));
    if (remaining <= 0) return;
    toast.success("🌱 문장을 심었어요!", {
      description: undo.text.length > 40 ? `${undo.text.slice(0, 40)}…` : undo.text,
      duration: remaining,
      action: {
        label: "되돌리기",
        onClick: () => restorePendingUndo(undo),
      },
      onDismiss: () => writePendingUndo(null),
      onAutoClose: () => writePendingUndo(null),
    });
  };

  // 최초 mount: autoFocus + 새로고침 직후 남아있는 되돌리기 창 복원
  useEffect(() => {
    if (autoFocus && !disabled && holdings.length > 0) {
      textareaRef.current?.focus({ preventScroll: true });
    }
    const pending = readPendingUndo();
    if (pending) showUndoToast(pending);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 다른 탭에서 draft 가 바뀌면 인디케이터를 동기화
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === DRAFT_KEY) setDrafts(readDrafts());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // 종목을 바꾸면 해당 종목의 드래프트로 복원 + localStorage 기준으로 인디케이터 재동기화
  useEffect(() => {
    if (!selectedTicker) return;
    const fresh = readDrafts();
    setDrafts(fresh);
    setSentence(fresh[selectedTicker] ?? "");
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
    const next = { ...readDrafts() };
    delete next[ticker];
    writeDrafts(next);
    setDrafts(next);
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    const submittedTicker = selectedTicker;
    const submittedText = sentence.trim();
    onSubmit(submittedTicker, submittedText);
    clearDraft(submittedTicker);
    setSentence("");
    setSavedAt(null);
    setSaveStatus('idle');

    const undo: PendingUndo = {
      ticker: submittedTicker,
      text: submittedText,
      submittedAt: Date.now(),
    };
    writePendingUndo(undo);
    showUndoToast(undo);
  };


  // 종목을 바꿔 고르면 자연스럽게 입력으로 포커스 이동 — 한 손 흐름 유지
  // 이때 아직 디바운스 안 된 현재 문장을 즉시 flush 해 인디케이터가 정확히 반영되게 함
  const handleSelectTicker = (ticker: string) => {
    if (ticker === selectedTicker) return;
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    const next = { ...readDrafts() };
    if (selectedTicker) {
      if (sentence.trim().length === 0) {
        delete next[selectedTicker];
      } else {
        next[selectedTicker] = sentence;
      }
      writeDrafts(next);
    }
    setDrafts(next);
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
            {holdings.map((h) => {
              const hasDraft =
                h.ticker !== selectedTicker && !!drafts[h.ticker]?.trim();
              return (
                <button
                  key={h.ticker}
                  onClick={() => handleSelectTicker(h.ticker)}
                  aria-label={hasDraft ? `${h.ticker} — 작성 중인 문장 있음` : h.ticker}
                  className={`relative px-3 py-1.5 rounded-md text-small font-medium transition-all ${
                    selectedTicker === h.ticker
                      ? "bg-primary text-primary-foreground shadow-button"
                      : "bg-muted text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {h.ticker}
                  {hasDraft && (
                    <span
                      className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-card"
                      title="작성 중인 문장이 있어요"
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
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
