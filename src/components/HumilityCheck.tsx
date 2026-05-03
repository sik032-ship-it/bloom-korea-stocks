// Humility Check — 능력의 원(Circle of Competence) 자가 진단
// "이 회사가 무엇을 해서 돈을 버는지 한 문장으로 설명할 수 있는가?"
// 못 쓰면 부드럽게 능력의 원 밖이라고 알려줌. 매수/매도 권유 없음. 자각이 핵심.

import React, { useEffect, useState } from "react";
import { toast } from "sonner";

interface HumilityCheckData {
  oneSentence: string;       // 사업 한 문장 설명
  whyOwn: string;             // 내가 보유하는 진짜 이유
  customerProof: string;      // 내가 직접 쓰는/보는 증거 (린치식)
  updatedAt: string;
}

const STORAGE_KEY = (holdingId: string) => `ppuri:humility:${holdingId}`;

export function getHumilityCheck(holdingId: string): HumilityCheckData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(holdingId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

interface Props {
  holdingId: string;
  ticker: string;
  companyName: string;
  onClose: () => void;
}

export function HumilityCheckModal({ holdingId, ticker, companyName, onClose }: Props) {
  const [data, setData] = useState<HumilityCheckData>({
    oneSentence: "",
    whyOwn: "",
    customerProof: "",
    updatedAt: "",
  });

  useEffect(() => {
    const existing = getHumilityCheck(holdingId);
    if (existing) setData(existing);
  }, [holdingId]);

  const oneSentenceLen = data.oneSentence.trim().length;
  const isInCircle = oneSentenceLen >= 15 && data.whyOwn.trim().length >= 10;

  const save = () => {
    if (oneSentenceLen < 5) {
      toast.error("한 문장이라도 적어보세요 — 안 적어지면 그게 답이에요");
      return;
    }
    const next = { ...data, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY(holdingId), JSON.stringify(next));
    toast.success("자가 진단 저장됨");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 backdrop-blur-sm">
      <div className="bg-card rounded-t-2xl sm:rounded-2xl p-5 w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-[10px] text-tone-wisdom-fg font-bold tracking-wider uppercase mb-1">겸손 체크 · 능력의 원</p>
            <h2 className="text-title text-foreground">{ticker} · {companyName}</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground text-2xl leading-none px-2">×</button>
        </div>

        <div className="mb-5 p-3 rounded-xl bg-tone-wisdom-bg border border-tone-wisdom-fg/15">
          <p className="text-xs text-foreground leading-relaxed">
            <em>"내가 모르는 회사에는 투자하지 않는다."</em> — 워렌 버핏
            <br />
            <em>"크레용으로 그릴 수 없으면 사지 마라."</em> — 피터 린치
          </p>
        </div>

        {/* Q1 */}
        <div className="mb-4">
          <label className="block text-small font-bold text-foreground mb-1.5">
            Q1. 이 회사는 무엇을 해서 돈을 버나요? <span className="text-muted-foreground font-normal">(한 문장)</span>
          </label>
          <textarea
            value={data.oneSentence}
            onChange={(e) => setData({ ...data, oneSentence: e.target.value })}
            placeholder="초등학생에게 설명한다는 마음으로…"
            rows={2}
            className="w-full p-3 rounded-xl bg-input border border-border text-small focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
          <p className="text-[11px] text-muted-foreground mt-1 tabular-nums">
            {oneSentenceLen}자 {oneSentenceLen >= 15 ? "✓" : "(15자 이상 권장)"}
          </p>
        </div>

        {/* Q2 */}
        <div className="mb-4">
          <label className="block text-small font-bold text-foreground mb-1.5">
            Q2. 내가 이 회사를 보유하는 진짜 이유는?
          </label>
          <textarea
            value={data.whyOwn}
            onChange={(e) => setData({ ...data, whyOwn: e.target.value })}
            placeholder="가격이 아니라 본질에 대한 답이어야 해요"
            rows={2}
            className="w-full p-3 rounded-xl bg-input border border-border text-small focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>

        {/* Q3 */}
        <div className="mb-5">
          <label className="block text-small font-bold text-foreground mb-1.5">
            Q3. 일상에서 이 회사를 직접 보는 증거가 있나요? <span className="text-muted-foreground font-normal">(린치식)</span>
          </label>
          <textarea
            value={data.customerProof}
            onChange={(e) => setData({ ...data, customerProof: e.target.value })}
            placeholder="예: 매일 아이폰을 쓴다 / 코스트코에 매주 간다"
            rows={2}
            className="w-full p-3 rounded-xl bg-input border border-border text-small focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>

        {/* 진단 결과 */}
        {oneSentenceLen >= 5 && (
          <div
            className={`mb-4 p-3 rounded-xl border-2 ${
              isInCircle
                ? "bg-primary/8 border-primary/30"
                : "bg-[#F59E0B]/8 border-[#F59E0B]/30"
            }`}
          >
            {isInCircle ? (
              <>
                <p className="text-small font-bold text-primary mb-1">✓ 능력의 원 안</p>
                <p className="text-xs text-foreground leading-relaxed">
                  설명할 수 있다는 건 이해하고 있다는 거예요. 위기에도 흔들리지 않을 가능성이 훨씬 높아요.
                </p>
              </>
            ) : (
              <>
                <p className="text-small font-bold text-[#D97706] mb-1">⚠️ 더 공부가 필요할 수 있어요</p>
                <p className="text-xs text-foreground leading-relaxed">
                  매도하라는 게 아니에요. 다만 -40% 위기 때 \"왜 가지고 있더라?\"가 떠오르지 않으면 패닉 매도로 이어져요.
                  지금 천천히 공부하면 위기가 기회로 보일 거예요.
                </p>
              </>
            )}
          </div>
        )}

        <button
          onClick={save}
          className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-body press-effect"
        >
          저장하고 돌아가기
        </button>
      </div>
    </div>
  );
}
