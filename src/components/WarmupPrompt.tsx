// PX Layer 2 — 워밍업 (30초)
// 매일 본질 퀴즈 들어가기 전, 가벼운 위기 시나리오 OX로 멘탈 워밍업
// 목표: "오늘도 흔들리지 않을 마음 근육을 쓴다"는 감각 + 마찰 최소화

import React, { useState } from "react";
import { Mascot } from "./Mascot";

export interface WarmupQuestion {
  scenario: string;       // 짧은 위기 상황
  question: string;       // "당신이라면?"
  options: string[];      // 보통 2~3개
  bestIndex: number;      // 가장 좋은 선택
  insight: string;        // 왜 그것이 좋은지
}

// 매일 다른 워밍업이 노출되도록 — 날짜 기반 인덱스
const WARMUP_POOL: WarmupQuestion[] = [
  {
    scenario: "보유 종목이 하룻밤 사이 -15% 빠졌어요. 출근길 알림으로 봤습니다.",
    question: "지금 가장 먼저 할 일은?",
    options: ["그대로 출근하고 점심 때 차분히 본다", "당장 매도 버튼을 누른다", "투자 단톡방에 의견을 물어본다"],
    bestIndex: 0,
    insight: "감정이 끓는 순간엔 결정하지 않는다. 시간은 당신의 편이에요.",
  },
  {
    scenario: "유명 애널리스트가 당신이 보유한 우량주의 목표가를 30% 낮췄습니다.",
    question: "어떻게 반응할까요?",
    options: ["내가 산 이유가 깨졌는지만 다시 확인한다", "애널리스트 말대로 즉시 매도한다", "다른 애널리스트 의견을 더 찾아본다"],
    bestIndex: 0,
    insight: "애널리스트 목표가는 단기 의견일 뿐. 내 매수 논거가 무너졌는지가 유일한 기준이에요.",
  },
  {
    scenario: "친구가 어제 -50% 종목으로 3일 만에 +80% 수익을 냈다고 자랑합니다.",
    question: "당신의 마음은?",
    options: ["축하해주고 내 원칙대로 간다", "나도 그 종목을 따라 산다", "내 종목이 답답하게 느껴진다"],
    bestIndex: 0,
    insight: "남이 번 돈은 당신이 잃은 돈이 아니에요. FOMO가 없는 것이 가장 강력한 무기예요.",
  },
  {
    scenario: "연준 의장이 매파 발언을 했고, 시장이 -3% 급락 중입니다.",
    question: "당신의 행동은?",
    options: ["미리 정한 분할매수 계획대로 일부 추가 매수한다", "더 떨어질까 봐 보유분도 매도한다", "레버리지로 풀매수한다"],
    bestIndex: 0,
    insight: "위기 전에 세운 계획만이 위기 중에 작동해요. 즉흥적 결정은 거의 항상 손실로 끝나요.",
  },
  {
    scenario: "2년 공부해서 산 우량주가 -40% 하락. 부정적 뉴스가 매일 쏟아져요.",
    question: "당신은?",
    options: ["사업 본질이 변했는지만 점검하고 보유 유지", "고통을 끝내려 손절한다", "뉴스를 더 많이 본다"],
    bestIndex: 0,
    insight: "역사상 우량주의 -40%는 거의 기회였어요. 팔아버린 사람은 3배 오르는 걸 뉴스로만 봐야 했어요.",
  },
  {
    scenario: "보유 종목이 6개월째 시장 평균보다 10% 언더퍼폼 중입니다.",
    question: "어떻게 판단할까요?",
    options: ["원래 투자 논거가 여전히 유효한지 점검", "최근 잘 오른 종목으로 전부 갈아탄다", "감으로 더 기다린다"],
    bestIndex: 0,
    insight: "최근 성과를 쫓으면 항상 늦게 들어가 비싸게 사게 돼요. 인내심이 곧 알파예요.",
  },
  {
    scenario: "SNS에서 모두가 한 종목을 사라고 외치고 있어요.",
    question: "당신의 첫 반응은?",
    options: ["내 원칙과 능력의 원에 맞는지 먼저 점검", "늦기 전에 따라 산다", "추천 글에 좋아요를 누른다"],
    bestIndex: 0,
    insight: "모두가 좋다고 외칠 때는 이미 가격에 반영돼 있어요. 군중의 결론은 신호가 아니라 노이즈예요.",
  },
];

export function getTodayWarmup(): WarmupQuestion {
  // 날짜 기반 안정 인덱스 — 같은 날엔 같은 워밍업
  const today = new Date();
  const dayKey = today.getFullYear() * 1000 + today.getMonth() * 50 + today.getDate();
  return WARMUP_POOL[dayKey % WARMUP_POOL.length];
}

interface WarmupPromptProps {
  question: WarmupQuestion;
  onComplete: (correct: boolean) => void;
}

export function WarmupPrompt({ question, onComplete }: WarmupPromptProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const correct = idx === question.bestIndex;
    setShowResult(true);
    // 1.6초 후 다음 단계로 — 마찰 최소화
    setTimeout(() => onComplete(correct), 1600);
  };

  return (
    <div className="flex-1 flex flex-col px-4 py-6 max-w-lg mx-auto w-full animate-fade-in">
      {/* 헤더: 워밍업 라벨 */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#F59E0B]/15 text-[#F59E0B]">
          ☀️ 30초 워밍업
        </span>
      </div>

      {/* 마스코트 + 시나리오 */}
      <div className="flex items-start gap-3 mb-5">
        <Mascot mood="thinking" size="md" />
        <div className="flex-1 bg-card border-2 border-border rounded-2xl p-4">
          <p className="text-small text-muted-foreground mb-1.5">상황</p>
          <p className="text-body text-foreground leading-relaxed">{question.scenario}</p>
        </div>
      </div>

      {/* 질문 */}
      <h2 className="text-title font-bold text-foreground text-center mb-5 px-2">
        {question.question}
      </h2>

      {/* 선택지 */}
      <div className="space-y-2.5">
        {question.options.map((opt, i) => {
          const isSelected = selected === i;
          const isBest = i === question.bestIndex;
          const showCorrectness = showResult;
          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={selected !== null}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3
                ${
                  showCorrectness && isBest
                    ? "border-primary bg-primary/10"
                    : showCorrectness && isSelected && !isBest
                    ? "border-destructive bg-destructive/10"
                    : isSelected
                    ? "border-primary bg-accent"
                    : "border-border hover:border-muted-foreground/30"
                } disabled:cursor-default`}
            >
              <span className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-small font-bold text-muted-foreground shrink-0">
                {i + 1}
              </span>
              <span className="text-small text-foreground">{opt}</span>
              {showCorrectness && isBest && <span className="ml-auto text-primary text-lg">✓</span>}
            </button>
          );
        })}
      </div>

      {/* 정답 후 인사이트 */}
      {showResult && (
        <div className="mt-5 px-4 py-3 bg-accent/50 border border-border rounded-xl animate-slide-up">
          <p className="text-xs font-semibold text-primary mb-1">💡 멘탈 코어</p>
          <p className="text-small text-foreground leading-relaxed">{question.insight}</p>
        </div>
      )}
    </div>
  );
}
