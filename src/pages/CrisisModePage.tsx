import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Mascot } from "@/components/Mascot";
import { PpuriButton } from "@/components/PpuriButton";
import type { MascotMood } from "@/components/Mascot";

interface CrisisScenario {
  id: string;
  title: string;
  emoji: string;
  description: string;
  historicalContext: string;
  steps: CrisisStep[];
}

interface CrisisStep {
  situation: string;
  emotion: string;
  options: { text: string; score: number; feedback: string }[];
}

const scenarios: CrisisScenario[] = [
  {
    id: "crash-30",
    title: "시장 대폭락 -30%",
    emoji: "📉",
    description: "S&P 500이 한 달 만에 30% 폭락했습니다.\n뉴스는 '역대 최악의 하락'을 연일 보도하고 있어요.",
    historicalContext: "2020년 3월 코로나 폭락 때 실제 일어난 일이에요. S&P 500은 33일 만에 34% 떨어졌지만, 5개월 만에 완전 회복했어요.",
    steps: [
      {
        situation: "포트폴리오가 -30%입니다. 뉴스에서는 '더 떨어질 수 있다'고 합니다. 가족과 친구들이 '다 팔아'라고 말합니다.",
        emotion: "😰 공포, 불안, 압박감",
        options: [
          { text: "미리 세운 투자 원칙을 다시 읽어본다", score: 3, feedback: "훌륭해요! 감정이 극에 달할 때 원칙으로 돌아가는 것이 프로 투자자의 습관이에요. 2020년 3월에 원칙을 지킨 사람은 5개월 만에 원금을 회복했어요." },
          { text: "전부 매도하고 현금화한다", score: 0, feedback: "2020년 코로나 폭락 때 바닥에서 판 투자자는 이후 100% 상승을 놓쳤어요. 패닉 매도는 거의 항상 최악의 선택이에요." },
          { text: "레버리지로 더 매수한다", score: 1, feedback: "용기는 좋지만, 바닥을 모르는 상황에서 레버리지는 매우 위험해요. 적립식 분할 매수가 더 현명해요." },
          { text: "뉴스를 끄고 한 달간 확인하지 않는다", score: 2, feedback: "나쁘지 않아요! '아무것도 안 하는 것'이 패닉 매도보다 훨씬 나은 결과를 가져와요. 다만 포트폴리오 점검은 필요해요." },
        ],
      },
      {
        situation: "3주가 지났습니다. 시장은 10% 반등했지만, 전문가들은 '데드캣 바운스(일시적 반등)'라고 경고합니다.",
        emotion: "🤔 혼란, 불확실성",
        options: [
          { text: "기업의 기본 가치가 변했는지 하나씩 분석한다", score: 3, feedback: "최고의 선택! 버핏은 2020년에 항공 산업의 구조적 변화를 인식하고 항공주만 팔았어요. 선택적 판단이 핵심이에요." },
          { text: "이전에 팔았다면 지금이라도 다시 산다", score: 1, feedback: "타이밍을 맞추려는 시도는 위험해요. 처음부터 팔지 않는 것이 더 나은 전략이었어요." },
          { text: "전문가 의견을 따라 추가 매도한다", score: 0, feedback: "전문가도 바닥을 맞추지 못해요. 2020년 3월에 '더 떨어진다'고 한 전문가들의 대부분이 틀렸어요." },
          { text: "적립식으로 조금씩 추가 매수한다", score: 2, feedback: "좋은 접근이에요! DCA(달러 코스트 에버리징)는 바닥을 맞출 필요 없이 평균 매수 단가를 낮춰줘요." },
        ],
      },
      {
        situation: "6개월 후, 시장이 완전히 회복했습니다. 당신의 포트폴리오는 원래대로 돌아왔어요.",
        emotion: "😮 안도, 놀라움",
        options: [
          { text: "이번 경험을 기록하고 위기 대응 매뉴얼을 만든다", score: 3, feedback: "완벽해요! 위기를 겪은 후 기록하는 투자자는 다음 위기에서 더 강해져요. 레이 달리오도 모든 실수를 기록했어요." },
          { text: "다행이다, 빨리 잊어버리자", score: 0, feedback: "위기를 잊으면 같은 실수를 반복해요. 다음 위기는 반드시 올 거예요. 준비가 차이를 만들어요." },
          { text: "다음엔 더 공격적으로 투자해야겠다", score: 1, feedback: "성공 경험이 과잉 확신으로 이어지면 위험해요. 겸손함을 유지하세요." },
          { text: "위기 대비 현금 비중을 늘려둔다", score: 2, feedback: "좋은 생각이에요! 현금은 위기 때 '기회를 잡을 수 있는 무기'가 돼요. 적정 비중을 유지하세요." },
        ],
      },
    ],
  },
  {
    id: "fomo-bubble",
    title: "FOMO 버블 상황",
    emoji: "🎈",
    description: "특정 섹터(AI/밈주식)가 6개월 만에 300% 올랐습니다.\n모든 사람이 이 주식 이야기만 하고 있어요.",
    historicalContext: "2021년 밈주식(GME, AMC) 열풍과 유사해요. GameStop은 2주 만에 1,500% 올랐지만, 이후 90% 이상 하락했어요.",
    steps: [
      {
        situation: "동료, 친구, SNS 모두 'OO 주식'으로 몇 배를 벌었다고 자랑합니다. 당신만 이 기회를 놓치고 있는 것 같아요.",
        emotion: "😤 FOMO, 조급함, 소외감",
        options: [
          { text: "내 투자 원칙에 맞는지 냉정하게 분석한다", score: 3, feedback: "훌륭해요! FOMO는 가장 비싼 감정이에요. 2021년 밈주식에 뛰어든 대부분의 개인 투자자는 결국 손실을 봤어요." },
          { text: "소액이라도 빨리 산다", score: 1, feedback: "소액이라 괜찮다는 생각은 위험해요. 이것이 'Foot in the door' 효과 — 점점 더 많은 돈을 넣게 돼요." },
          { text: "전 재산의 50%를 투자한다", score: 0, feedback: "극도로 위험해요! 2021년 GME에 전 재산을 넣은 투자자들 대부분이 90% 이상 손실을 봤어요." },
          { text: "SNS와 뉴스를 끊고 내 포트폴리오에 집중한다", score: 2, feedback: "좋은 방법이에요! 워런 버핏: '소음을 줄이면 신호가 들려요.' 남의 수익은 당신의 투자와 무관해요." },
        ],
      },
      {
        situation: "결국 그 주식을 샀는데, 다음 주에 40% 폭락했습니다. SNS에서는 '기회'라고 하는 사람과 '끝났다'는 사람이 반반이에요.",
        emotion: "😱 후회, 공포, 혼란",
        options: [
          { text: "왜 이 주식을 샀는지 이유를 다시 점검한다", score: 3, feedback: "핵심 질문이에요! 이유가 FOMO였다면 매도가 맞고, 기업 가치를 분석하고 샀다면 유지할 수 있어요." },
          { text: "물타기로 더 산다", score: 0, feedback: "FOMO로 산 주식에 물타기는 최악이에요. 잘못된 결정을 더 크게 만드는 것뿐이에요." },
          { text: "손실을 인정하고 매도한다", score: 2, feedback: "FOMO로 샀다면 빨리 인정하고 나오는 것도 용기예요. 손실을 끌어안는 것보다 나을 수 있어요." },
          { text: "포럼과 SNS에서 다른 사람 의견을 더 찾아본다", score: 1, feedback: "SNS 의견은 대부분 편향돼 있어요. 자신만의 분석 기준을 갖는 것이 중요해요." },
        ],
      },
    ],
  },
  {
    id: "recession",
    title: "경기 침체 공포",
    emoji: "🌊",
    description: "연준이 금리를 급격히 올리고 있습니다.\n경제 전문가 70%가 '침체가 온다'고 예측합니다.",
    historicalContext: "2022년 연준 급격한 금리 인상기와 유사해요. 나스닥은 33% 하락했지만, 2023년에 44% 반등했어요.",
    steps: [
      {
        situation: "금리가 계속 오르고, 기술주가 매일 떨어지고 있어요. '현금이 왕'이라는 말이 나오고 있습니다.",
        emotion: "😟 불안, 무력감",
        options: [
          { text: "포트폴리오의 자산 배분을 점검하고 필요시 리밸런싱한다", score: 3, feedback: "최고의 대응이에요! 레이 달리오: '경제 환경이 바뀌면 자산 배분도 조정해야 한다.' 리밸런싱은 리스크 관리의 핵심이에요." },
          { text: "모든 주식을 팔고 현금으로 전환한다", score: 0, feedback: "2022년에 전부 팔고 나간 투자자는 2023년 44% 반등을 놓쳤어요. 올인/올아웃은 거의 항상 실패해요." },
          { text: "금리에 영향 적은 방어주로 전부 교체한다", score: 1, feedback: "일부 방어주 편입은 좋지만 '전부 교체'는 과잉 반응이에요. 환경은 또 바뀔 수 있어요." },
          { text: "아무것도 바꾸지 않고 적립식 투자를 계속한다", score: 2, feedback: "좋은 접근이에요! 침체기에 적립식 투자를 계속하면 낮은 가격에 더 많은 주식을 살 수 있어요." },
        ],
      },
    ],
  },
];

type Phase = "intro" | "playing" | "result";

export default function CrisisModePage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("intro");
  const [selectedScenario, setSelectedScenario] = useState<CrisisScenario | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [totalScore, setTotalScore] = useState(0);
  const [maxScore, setMaxScore] = useState(0);
  const [stepScores, setStepScores] = useState<number[]>([]);

  const startScenario = (scenario: CrisisScenario) => {
    setSelectedScenario(scenario);
    setPhase("playing");
    setStepIndex(0);
    setSelectedOption(null);
    setTotalScore(0);
    setMaxScore(scenario.steps.length * 3);
    setStepScores([]);
  };

  const handleSelect = useCallback((optIndex: number) => {
    if (selectedOption !== null || !selectedScenario) return;
    setSelectedOption(optIndex);
    const score = selectedScenario.steps[stepIndex].options[optIndex].score;
    setTotalScore(prev => prev + score);
    setStepScores(prev => [...prev, score]);
  }, [selectedOption, selectedScenario, stepIndex]);

  const handleNext = () => {
    if (!selectedScenario) return;
    if (stepIndex + 1 < selectedScenario.steps.length) {
      setStepIndex(stepIndex + 1);
      setSelectedOption(null);
    } else {
      setPhase("result");
    }
  };

  const getMood = (): MascotMood => {
    if (phase === "result") {
      const pct = (totalScore / maxScore) * 100;
      return pct >= 70 ? "celebrate" : pct >= 40 ? "thinking" : "wave";
    }
    if (selectedOption !== null) {
      const score = selectedScenario!.steps[stepIndex].options[selectedOption].score;
      return score >= 3 ? "celebrate" : score >= 2 ? "default" : "wave";
    }
    return "thinking";
  };

  // ===== INTRO =====
  if (phase === "intro") {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-xl text-muted-foreground">←</button>
            <h1 className="text-title font-bold text-foreground">🛡️ 위기 시뮬레이션</h1>
          </div>
        </header>

        <main className="max-w-lg mx-auto px-4 py-6">
          <div className="text-center mb-6 animate-fade-in">
            <Mascot mood="thinking" size="lg" className="mx-auto mb-3" />
            <h2 className="text-lg font-bold text-foreground mb-2">실전 위기, 미리 연습해요</h2>
            <p className="text-small text-muted-foreground leading-relaxed">
              실제 역사 속 투자 위기를 시뮬레이션해요.
              <br />감정을 다스리고 올바른 판단을 연습하세요.
            </p>
          </div>

          <div className="space-y-3">
            {scenarios.map((s, i) => (
              <button
                key={s.id}
                onClick={() => startScenario(s)}
                className="w-full bg-card border-2 border-border rounded-2xl p-5 text-left hover:border-primary/50 transition-all press-effect animate-slide-up"
                style={{ animationDelay: `${i * 100}ms`, animationFillMode: "both" }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{s.emoji}</span>
                  <h3 className="text-body font-bold text-foreground">{s.title}</h3>
                </div>
                <p className="text-small text-muted-foreground whitespace-pre-line">{s.description}</p>
              </button>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // ===== RESULT =====
  if (phase === "result" && selectedScenario) {
    const pct = Math.round((totalScore / maxScore) * 100);
    const grade = pct >= 80 ? { label: "위기 대응 마스터", emoji: "🏆", msg: "당신은 어떤 폭풍이 와도 살아남을 투자자예요!" }
      : pct >= 60 ? { label: "침착한 투자자", emoji: "💪", msg: "좋은 판단이 많았어요. 조금만 더 연습하면 완벽해요!" }
      : pct >= 40 ? { label: "성장 중인 투자자", emoji: "🌱", msg: "감정에 흔들린 순간이 있었지만, 배움이 있었어요!" }
      : { label: "감정적 투자자", emoji: "😰", msg: "괜찮아요! 여기서 연습하는 것 자체가 대단한 거예요!" };

    return (
      <div className="min-h-screen bg-background flex flex-col items-center px-6 pt-8 pb-6 animate-fade-in">
        <Mascot mood={getMood()} size="xl" className="mb-3" />
        <p className="text-4xl mb-2">{grade.emoji}</p>
        <h1 className="text-display text-foreground mb-1">{grade.label}</h1>
        <p className="text-small text-muted-foreground mb-6 text-center">{grade.msg}</p>

        <div className="w-full max-w-sm bg-primary/10 border border-primary/20 rounded-2xl p-5 mb-4 text-center">
          <p className="text-small text-primary font-medium mb-1">위기 대응 점수</p>
          <p className="text-4xl font-black text-primary">{pct}점</p>
          <p className="text-xs text-primary/70 mt-1">{totalScore}/{maxScore}점</p>
        </div>

        {/* Step breakdown */}
        <div className="w-full max-w-sm bg-card border border-border rounded-xl p-4 mb-4">
          <p className="text-small font-semibold text-foreground mb-3">단계별 결과</p>
          <div className="space-y-2">
            {stepScores.map((score, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-16">상황 {i + 1}</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${(score / 3) * 100}%` }} />
                </div>
                <span className="text-xs font-bold text-foreground">{score}/3</span>
              </div>
            ))}
          </div>
        </div>

        {/* Historical insight */}
        <div className="w-full max-w-sm bg-accent/50 border border-border rounded-xl p-4 mb-6 flex items-start gap-3">
          <Mascot mood="thinking" size="sm" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-primary mb-1">📖 역사적 교훈</p>
            <p className="text-small text-foreground">{selectedScenario.historicalContext}</p>
          </div>
        </div>

        <div className="w-full max-w-sm space-y-3">
          <PpuriButton fullWidth onClick={() => { setPhase("intro"); setSelectedScenario(null); }}>
            🔄 다른 시나리오 도전하기
          </PpuriButton>
          <PpuriButton variant="secondary" fullWidth onClick={() => navigate("/")}>
            홈으로
          </PpuriButton>
        </div>
      </div>
    );
  }

  // ===== PLAYING =====
  if (!selectedScenario) return null;
  const step = selectedScenario.steps[stepIndex];
  const progress = ((stepIndex + 1) / selectedScenario.steps.length) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress */}
      <div className="flex items-center gap-3 px-4 py-3">
        <button onClick={() => setPhase("intro")} className="text-muted-foreground text-xl">✕</button>
        <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-xs font-bold text-muted-foreground">{stepIndex + 1}/{selectedScenario.steps.length}</span>
      </div>

      <div className="flex-1 flex flex-col px-4 max-w-lg mx-auto w-full">
        {/* Situation */}
        <div className="bg-card border-2 border-border rounded-2xl p-5 mb-4 animate-slide-up">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">{selectedScenario.emoji}</span>
            <p className="text-xs font-semibold text-primary">상황 {stepIndex + 1}</p>
          </div>
          <p className="text-body text-foreground leading-relaxed mb-3">{step.situation}</p>
          <p className="text-small text-muted-foreground italic">{step.emotion}</p>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-4">
          {step.options.map((opt, i) => {
            const isSelected = selectedOption === i;
            const showResult = selectedOption !== null;
            const scoreColor = showResult
              ? opt.score >= 3 ? "border-primary bg-primary/5"
                : opt.score >= 2 ? "border-yellow-500 bg-yellow-50"
                : "border-destructive/50 bg-destructive/5"
              : "";

            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={selectedOption !== null}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  isSelected ? scoreColor + " scale-[1.02]"
                    : showResult ? "border-border opacity-50"
                    : "border-border hover:border-primary/30"
                } disabled:cursor-default`}
              >
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-small font-bold text-muted-foreground shrink-0 mt-0.5">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-body text-foreground">{opt.text}</span>
                </div>
                {showResult && isSelected && (
                  <div className="mt-3 pl-10">
                    <div className="flex items-center gap-1 mb-1">
                      {[1, 2, 3].map(s => (
                        <span key={s} className={`text-sm ${s <= opt.score ? "opacity-100" : "opacity-20"}`}>⭐</span>
                      ))}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {selectedOption !== null && (
          <div className="bg-accent/50 border border-border rounded-xl p-4 mb-4 flex items-start gap-3 animate-fade-in">
            <Mascot mood={getMood()} size="sm" />
            <div className="flex-1">
              <p className="text-small text-foreground leading-relaxed">
                {step.options[selectedOption].feedback}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Continue button */}
      {selectedOption !== null && (
        <div className="px-4 pb-6 max-w-lg mx-auto w-full animate-slide-up">
          <PpuriButton fullWidth onClick={handleNext}>
            {stepIndex + 1 < selectedScenario.steps.length ? "다음 상황 →" : "결과 보기"}
          </PpuriButton>
        </div>
      )}
    </div>
  );
}
