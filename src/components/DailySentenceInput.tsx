import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  DRAFT_KEY,
  PENDING_UNDO_KEY,
  UNDO_WINDOW_MS,
  readDrafts,
  writeDrafts,
  readPendingUndo,
  writePendingUndo,
  parsePendingUndoRaw,
  parseDraftsRaw,
  type DraftMap,
  type PendingUndo,
} from "@/utils/dailyDraftStorage";


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

// 탭마다 고유 id — 여러 탭이 동시에 submit/undo 할 때 자기 이벤트를 구분
const TAB_ID =
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `tab-${Math.random().toString(36).slice(2)}-${Date.now()}`;

const undoKey = (u: PendingUndo | null) =>
  u ? `${u.origin}:${u.submittedAt}:${u.ticker}` : "";

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


  const undoToastIdRef = useRef<string | number | null>(null);
  const currentUndoRef = useRef<PendingUndo | null>(null);

  const dismissUndoToast = () => {
    if (undoToastIdRef.current !== null) {
      toast.dismiss(undoToastIdRef.current);
      undoToastIdRef.current = null;
    }
    currentUndoRef.current = null;
  };

  // 되돌리기 — 제출 후 5초 안에 초안으로 복원 (새로고침/탭 이동 후에도 동일하게 동작)
  const restorePendingUndo = (undo: PendingUndo) => {
    setSelectedTicker(undo.ticker);
    setSentence(undo.text);
    const next = { ...readDrafts(), [undo.ticker]: undo.text };
    writeDrafts(next);
    setDrafts(next);
    writePendingUndo(null); // 다른 탭도 storage 이벤트로 자기 토스트를 정리
    dismissUndoToast();
    textareaRef.current?.focus({ preventScroll: true });
  };

  const showUndoToast = (undo: PendingUndo) => {
    const remaining = Math.max(0, UNDO_WINDOW_MS - (Date.now() - undo.submittedAt));
    if (remaining <= 0) return;
    // 이미 같은 undo 를 보여주고 있으면 재표시 생략
    if (undoKey(currentUndoRef.current) === undoKey(undo)) return;
    dismissUndoToast();
    currentUndoRef.current = undo;
    undoToastIdRef.current = toast.success("🌱 문장을 심었어요!", {
      description: undo.text.length > 40 ? `${undo.text.slice(0, 40)}…` : undo.text,
      duration: remaining,
      action: {
        label: "되돌리기",
        onClick: () => restorePendingUndo(undo),
      },
      onDismiss: () => {
        // 자기 origin 의 토스트가 닫힐 때만 pending 을 지움 — 다른 탭 것을 덮어쓰지 않게
        if (undoKey(currentUndoRef.current) === undoKey(undo) && undo.origin === TAB_ID) {
          writePendingUndo(null);
        }
        if (undoKey(currentUndoRef.current) === undoKey(undo)) {
          currentUndoRef.current = null;
          undoToastIdRef.current = null;
        }
      },
      onAutoClose: () => {
        if (undoKey(currentUndoRef.current) === undoKey(undo) && undo.origin === TAB_ID) {
          writePendingUndo(null);
        }
        if (undoKey(currentUndoRef.current) === undoKey(undo)) {
          currentUndoRef.current = null;
          undoToastIdRef.current = null;
        }
      },
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

  // 다른 탭에서 draft / pending-undo 가 바뀌면 UI 동기화 (충돌 규칙 포함)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === DRAFT_KEY) {
        const fresh = readDrafts();
        setDrafts(fresh);
        // 현재 선택된 종목의 draft 가 원격에서 바뀐 경우:
        //   - 로컬 textarea 가 비어 있으면 원격 값을 채택 (사용자 방해 없음)
        //   - 이미 입력 중이면 로컬 유지 → 다음 flush 로 자연스러운 last-write-wins
        if (selectedTicker && sentence.trim().length === 0) {
          const remote = fresh[selectedTicker] ?? "";
          if (remote !== sentence) setSentence(remote);
        }
      } else if (e.key === PENDING_UNDO_KEY) {
        if (!e.newValue) {
          // 다른 탭에서 undo 눌렀거나 만료 → 여기 토스트도 즉시 정리
          dismissUndoToast();
        } else {
          try {
            const remote = JSON.parse(e.newValue) as PendingUndo;
            // 다른 탭에서 새 submit 발생 → 최신이 이김. 내 예전 토스트만 조용히 닫음
            if (remote.origin !== TAB_ID) {
              dismissUndoToast();
              // 원격 undo 는 그 탭이 소유 — 여기서 새로 띄우진 않음 (스팸 방지)
            }
          } catch {
            /* ignore */
          }
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [selectedTicker, sentence]);

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
      origin: TAB_ID,
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
