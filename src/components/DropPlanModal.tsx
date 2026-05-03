// Drop Plan — 보유 종목별 -15/-25/-40% 사전 행동 명문화
// 핵심: 바닥을 예측하지 말고, "구간"에 도달하면 무엇을 할지 미리 적어둔다.
// 위기 때 PPURI는 이 계획을 다시 보여줘서 감정 결정을 막아준다.
// 저장은 localStorage (UI 단계 — 추후 DB 이전 가능).

import React, { useEffect, useState } from "react";
import { toast } from "sonner";

export interface DropPlan {
  drop15: string; // -15% 시 행동
  drop25: string; // -25% 시 행동
  drop40: string; // -40% 시 행동
  thesis: string; // 매도 트리거 (사업 본질이 깨지는 조건)
  updatedAt: string;
}

const STORAGE_KEY = (holdingId: string) => `ppuri:dropPlan:${holdingId}`;

export function getDropPlan(holdingId: string): DropPlan | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(holdingId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function hasDropPlan(holdingId: string): boolean {
  const p = getDropPlan(holdingId);
  return !!p && (!!p.drop15 || !!p.drop25 || !!p.drop40);
}

interface Props {
  holdingId: string;
  ticker: string;
  companyName: string;
  onClose: () => void;
}

const PRESETS_15 = [
  "남겨둔 현금의 1/3을 분할매수한다",
  "매수 보류 — 사업 본질만 다시 점검",
  "월 적립금의 50%를 추가 투입",
];
const PRESETS_25 = [
  "남겨둔 현금의 1/3을 추가 매수",
  "포지션의 50%만큼 평단을 낮추는 매수",
  "감정이 끓는다 — 24시간 결정 보류",
];
const PRESETS_40 = [
  "마지막 1/3 현금을 전부 투입한다",
  "사업 본질이 깨졌는지 마지막 점검 후 보유 유지",
  "분할매수를 끝내고 시간이 지나길 기다린다",
];

export function DropPlanModal({ holdingId, ticker, companyName, onClose }: Props) {
  const [plan, setPlan] = useState<DropPlan>({
    drop15: "",
    drop25: "",
    drop40: "",
    thesis: "",
    updatedAt: "",
  });

  useEffect(() => {
    const existing = getDropPlan(holdingId);
    if (existing) setPlan(existing);
  }, [holdingId]);

  const save = () => {
    if (!plan.drop15 && !plan.drop25 && !plan.drop40) {
      toast.error("최소 한 구간이라도 적어주세요");
      return;
    }
    const next = { ...plan, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY(holdingId), JSON.stringify(next));
    toast.success("계획 저장 완료 — 위기 때 다시 보여드릴게요");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 backdrop-blur-sm">
      <div className="bg-card rounded-t-2xl sm:rounded-2xl p-5 w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs text-primary font-bold mb-1">📐 분할매수 플레이북</p>
            <h2 className="text-title text-foreground">
              {ticker} · {companyName}
            </h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground text-2xl leading-none px-2">×</button>
        </div>

        {/* 철학 안내 */}
        <div className="mb-5 p-3 rounded-xl bg-accent/40 border border-border">
          <p className="text-xs text-foreground leading-relaxed">
            🎯 <strong>바닥은 신만 알아요.</strong> 우리는 구간만 정할 수 있어요.
            <br />
            미리 정해두면, 위기 때 감정이 아닌 계획으로 행동할 수 있어요.
          </p>
        </div>

        {/* -15% */}
        <PlanField
          label="-15% 떨어지면"
          color="text-[#F59E0B]"
          value={plan.drop15}
          onChange={(v) => setPlan({ ...plan, drop15: v })}
          presets={PRESETS_15}
          placeholder="예: 남겨둔 현금의 1/3을 분할매수한다"
        />
        {/* -25% */}
        <PlanField
          label="-25% 떨어지면"
          color="text-[#F97316]"
          value={plan.drop25}
          onChange={(v) => setPlan({ ...plan, drop25: v })}
          presets={PRESETS_25}
          placeholder="예: 추가 1/3 분할매수, 뉴스는 보지 않는다"
        />
        {/* -40% */}
        <PlanField
          label="-40% 떨어지면"
          color="text-destructive"
          value={plan.drop40}
          onChange={(v) => setPlan({ ...plan, drop40: v })}
          presets={PRESETS_40}
          placeholder="예: 마지막 1/3 투입, 그 후엔 그냥 시간을 보낸다"
        />

        {/* 매도 트리거 */}
        <div className="mb-5">
          <label className="block text-small font-bold text-foreground mb-1.5">
            🚨 단, 이때는 매도한다
          </label>
          <p className="text-xs text-muted-foreground mb-2">
            가격이 아니라 사업의 본질이 무너지는 조건만 적어요.
          </p>
          <textarea
            value={plan.thesis}
            onChange={(e) => setPlan({ ...plan, thesis: e.target.value })}
            placeholder="예: 매출이 2년 연속 감소 + 핵심 사업의 해자가 무너졌을 때"
            rows={2}
            className="w-full p-3 rounded-xl bg-input border border-border text-small focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>

        <button
          onClick={save}
          className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-body press-effect"
        >
          내 계획 저장하기
        </button>
        <p className="text-[11px] text-muted-foreground text-center mt-2">
          위기가 오면 PPURI가 이 계획을 다시 보여드릴게요
        </p>
      </div>
    </div>
  );
}

function PlanField({
  label,
  color,
  value,
  onChange,
  presets,
  placeholder,
}: {
  label: string;
  color: string;
  value: string;
  onChange: (v: string) => void;
  presets: string[];
  placeholder: string;
}) {
  return (
    <div className="mb-4">
      <label className={`block text-small font-bold mb-1.5 ${color}`}>{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className="w-full p-3 rounded-xl bg-input border border-border text-small focus:outline-none focus:ring-2 focus:ring-ring resize-none mb-1.5"
      />
      <div className="flex flex-wrap gap-1.5">
        {presets.map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className="text-[11px] px-2 py-1 rounded-full bg-muted text-muted-foreground hover:bg-accent transition-colors"
          >
            {p.length > 22 ? p.slice(0, 22) + "…" : p}
          </button>
        ))}
      </div>
    </div>
  );
}
