import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Mascot } from "@/components/Mascot";
import { SpeechBubble } from "@/components/SpeechBubble";
import { allQuestions, categoryLabels, type OXQuestion } from "@/data/quizQuestions";

// 온보딩용: 초보자 친화적인 OX 문제만 풀에서 랜덤 선택
function pickRandomPreviewQuestion(): OXQuestion {
  const oxBeginner = allQuestions.filter(
    (q): q is OXQuestion => q.format === "ox" && q.difficulty === "beginner"
  );
  const pool = oxBeginner.length > 0
    ? oxBeginner
    : allQuestions.filter((q): q is OXQuestion => q.format === "ox");
  return pool[Math.floor(Math.random() * pool.length)];
}

const POPULAR_STOCKS = [
  { ticker: "AAPL", name: "애플", emoji: "🍎" },
  { ticker: "TSLA", name: "테슬라", emoji: "🚗" },
  { ticker: "NVDA", name: "엔비디아", emoji: "🎮" },
  { ticker: "MSFT", name: "마이크로소프트", emoji: "💻" },
  { ticker: "GOOGL", name: "구글", emoji: "🔍" },
  { ticker: "AMZN", name: "아마존", emoji: "📦" },
  { ticker: "META", name: "메타", emoji: "👓" },
  { ticker: "AMD", name: "AMD", emoji: "⚡" },
  { ticker: "NFLX", name: "넷플릭스", emoji: "🎬" },
  { ticker: "DIS", name: "디즈니", emoji: "🏰" },
  { ticker: "COST", name: "코스트코", emoji: "🛒" },
  { ticker: "JPM", name: "JP모건", emoji: "🏦" },
  { ticker: "V", name: "비자", emoji: "💳" },
  { ticker: "MA", name: "마스터카드", emoji: "💳" },
  { ticker: "PLTR", name: "팔란티어", emoji: "🔮" },
  { ticker: "COIN", name: "코인베이스", emoji: "🪙" },
  { ticker: "CRM", name: "세일즈포스", emoji: "☁️" },
  { ticker: "UBER", name: "우버", emoji: "🚕" },
  { ticker: "BA", name: "보잉", emoji: "✈️" },
  { ticker: "KO", name: "코카콜라", emoji: "🥤" },
];

const INVESTMENT_GOALS = [
  { label: "노후 준비", emoji: "🏖️", desc: "은퇴 후를 위한 장기 투자" },
  { label: "자산 증식", emoji: "📈", desc: "복리로 자산을 불리고 싶어요" },
  { label: "경제적 자유", emoji: "🦅", desc: "월급 외 수입원을 만들고 싶어요" },
  { label: "재미와 학습", emoji: "📚", desc: "투자를 배우면서 즐기고 싶어요" },
];

const EXPERIENCE_LEVELS = [
  { label: "완전 초보", icon: "📊", bars: 1, desc: "주식이 뭔지 막 알게 됐어요" },
  { label: "조금 해봤어요", icon: "📊", bars: 2, desc: "몇 종목 사봤지만 아직 불안해요" },
  { label: "1년 이상 투자 중", icon: "📊", bars: 3, desc: "나름 경험이 있어요" },
  { label: "베테랑 투자자", icon: "📊", bars: 4, desc: "원칙이 있고 흔들리지 않아요" },
];

const DAILY_GOALS = [
  { label: "하루 1문장", right: "가볍게", desc: "1분이면 끝!" },
  { label: "하루 3문장", right: "보통", desc: "조금 더 깊이 생각해요" },
  { label: "하루 5문장", right: "열심히", desc: "투자 체질 만들기!" },
];

interface HoldingItem {
  ticker: string;
  company_name_kr: string;
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  const percent = (current / total) * 100;
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <button className="text-muted-foreground hover:text-foreground text-xl">←</button>
      <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function BarIndicator({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5 items-end h-5">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`w-1.5 rounded-sm ${i <= level ? "bg-ppuri-blue" : "bg-muted"}`}
          style={{ height: `${8 + i * 3}px` }}
        />
      ))}
    </div>
  );
}

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [investGoal, setInvestGoal] = useState("");
  const [experience, setExperience] = useState("");
  const [dailyGoal, setDailyGoal] = useState("");
  const [holdings, setHoldings] = useState<HoldingItem[]>([]);
  const [customTicker, setCustomTicker] = useState("");
  const [customName, setCustomName] = useState("");
  const [previewAnswer, setPreviewAnswer] = useState<boolean | null>(null);
  // 매번 랜덤 OX 문제 — 컴포넌트 마운트 시 한번만 결정 (재가입/재방문 시 신선)
  const previewQuestion = useMemo(() => pickRandomPreviewQuestion(), []);
  const isCorrect = previewAnswer !== null && previewAnswer === previewQuestion.answer;
  const previewCategory = categoryLabels[previewQuestion.category];
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const totalSteps = 7; // 0:WHY, 1:goal, 2:exp, 3:daily, 4:holdings, 5:preview, 6:done

  const addHolding = (ticker: string, name: string) => {
    if (holdings.length >= 10 || holdings.find((h) => h.ticker === ticker)) return;
    setHoldings([...holdings, { ticker, company_name_kr: name }]);
  };

  const removeHolding = (ticker: string) => {
    setHoldings(holdings.filter((h) => h.ticker !== ticker));
  };

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const holdingsData = holdings.map((h) => ({
        user_id: user.id,
        ticker: h.ticker,
        company_name_kr: h.company_name_kr,
      }));
      if (holdingsData.length > 0) {
        await supabase.from("holdings").insert(holdingsData);
      }
      const displayName = user.user_metadata?.display_name;
      // 일일 목표 라벨 → 숫자 (1/3/5)
      const dailyGoalNum = dailyGoal.includes("5") ? 5 : dailyGoal.includes("3") ? 3 : 1;
      const profileUpdate: Record<string, unknown> = {
        experience_level: experience || null,
        investment_goal: investGoal || null,
        daily_goal: dailyGoalNum,
        onboarded_at: new Date().toISOString(),
      };
      if (displayName) profileUpdate.display_name = displayName;
      await supabase.from("profiles").update(profileUpdate).eq("id", user.id);
      navigate("/");
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ProgressBar current={step + 1} total={totalSteps} />

      <div className="flex-1 flex flex-col px-6 max-w-lg mx-auto w-full">
        {/* STEP 0: WHY — 왜 매일 써야 하나요? */}
        {step === 0 && (
          <div className="flex-1 flex flex-col animate-slide-up">
            <div className="flex items-start gap-3 mb-6 mt-4">
              <Mascot mood="wave" size="lg" />
              <SpeechBubble className="mt-2">
                <p className="text-body font-bold text-foreground">
                  왜 매일 1분이 필요할까요?
                </p>
              </SpeechBubble>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl border-2 border-border bg-accent/30">
                <p className="text-2xl mb-2">🧠</p>
                <p className="text-small font-bold text-foreground mb-1">
                  투자는 정보가 아니라 사고방식입니다
                </p>
                <p className="text-xs text-muted-foreground">
                  같은 뉴스를 봐도 어떻게 생각하느냐에 따라 결과가 달라져요.
                </p>
              </div>

              <div className="p-4 rounded-xl border-2 border-border bg-accent/30">
                <p className="text-2xl mb-2">💪</p>
                <p className="text-small font-bold text-foreground mb-1">
                  매일 1분의 기록이 위기 때 당신을 구합니다
                </p>
                <p className="text-xs text-muted-foreground">
                  하락장에서 흔들리지 않는 사람은 평소에 자기 생각을 정리한 사람이에요.
                </p>
              </div>

              <div className="p-4 rounded-xl border-2 border-primary/30 bg-primary/5">
                <p className="text-2xl mb-2">🌱</p>
                <p className="text-small font-bold text-foreground mb-1">
                  매일 1분 = 5년 후 수익률의 차이
                </p>
                <p className="text-xs text-muted-foreground">
                  뿌리(PPURI)는 당신이 자신의 투자 원칙을 만들도록 돕습니다.
                </p>
              </div>
            </div>

            <div className="mt-auto pb-6">
              <button
                onClick={() => setStep(1)}
                className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-body shadow-sm hover:opacity-90 transition-all"
              >
                좋아요, 시작할게요 🌰
              </button>
            </div>
          </div>
        )}

        {/* STEP 1: Investment Goal */}
        {step === 1 && (
          <div className="flex-1 flex flex-col animate-slide-up">
            <div className="flex items-start gap-3 mb-8 mt-4">
              <Mascot mood="wave" size="lg" />
              <SpeechBubble className="mt-2">
                <p className="text-body font-medium text-foreground">
                  미국 주식을 투자하는 이유가 무엇인가요?
                </p>
              </SpeechBubble>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {INVESTMENT_GOALS.map((goal) => (
                <button
                  key={goal.label}
                  onClick={() => setInvestGoal(goal.label)}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                    investGoal === goal.label
                      ? "border-primary bg-accent shadow-sm"
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <span className="text-2xl">{goal.emoji}</span>
                  <span className="text-small font-medium text-foreground">{goal.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-auto pb-6">
              <button
                disabled={!investGoal}
                onClick={() => setStep(2)}
                className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-body shadow-sm hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                계속하기
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Experience Level */}
        {step === 2 && (
          <div className="flex-1 flex flex-col animate-slide-up">
            <div className="flex items-start gap-3 mb-8 mt-4">
              <Mascot mood="thinking" size="lg" />
              <SpeechBubble className="mt-2">
                <p className="text-body font-medium text-foreground">
                  미국 주식 투자 경험이 어느 정도인가요?
                </p>
              </SpeechBubble>
            </div>

            <div className="space-y-3">
              {EXPERIENCE_LEVELS.map((level) => (
                <button
                  key={level.label}
                  onClick={() => setExperience(level.label)}
                  className={`flex items-center gap-4 w-full p-4 rounded-xl border-2 transition-all text-left ${
                    experience === level.label
                      ? "border-primary bg-accent shadow-sm"
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <BarIndicator level={level.bars} />
                  <div>
                    <p className="text-body font-medium text-foreground">{level.label}</p>
                    <p className="text-xs text-muted-foreground">{level.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-auto pb-6">
              <button
                disabled={!experience}
                onClick={() => setStep(3)}
                className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-body shadow-sm hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                계속하기
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Daily Goal */}
        {step === 3 && (
          <div className="flex-1 flex flex-col animate-slide-up">
            <div className="flex items-start gap-3 mb-8 mt-4">
              <Mascot mood="default" size="lg" />
              <SpeechBubble className="mt-2">
                <p className="text-body font-medium text-foreground">
                  일일 학습 목표가 무엇인가요?
                </p>
              </SpeechBubble>
            </div>

            <div className="space-y-3">
              {DAILY_GOALS.map((goal) => (
                <button
                  key={goal.label}
                  onClick={() => setDailyGoal(goal.label)}
                  className={`flex items-center justify-between w-full p-5 rounded-xl border-2 transition-all ${
                    dailyGoal === goal.label
                      ? "border-primary bg-accent shadow-sm"
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <span className="text-body font-bold text-foreground">{goal.label}</span>
                  <span className="text-small text-muted-foreground">{goal.right}</span>
                </button>
              ))}
            </div>

            <div className="mt-auto pb-6">
              <button
                disabled={!dailyGoal}
                onClick={() => setStep(4)}
                className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-body shadow-sm hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                계속하기
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Add Holdings (선택사항) */}
        {step === 4 && (
          <div className="flex-1 flex flex-col animate-slide-up">
            <div className="flex items-start gap-3 mb-4 mt-4">
              <Mascot mood="default" size="lg" />
              <SpeechBubble className="mt-2">
                <p className="text-body font-medium text-foreground">
                  보유 중인 미국 주식이 있나요?
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  나중에 추가해도 괜찮아요. 지금은 건너뛰어도 OK!
                </p>
              </SpeechBubble>
            </div>

            {/* 선택사항 안내 배지 */}
            <div className="mb-3 px-3 py-2 rounded-lg bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground text-center">
                💡 <strong className="text-foreground">선택사항</strong> · 종목 없이도 모든 기능을 사용할 수 있어요
              </p>
            </div>

            {/* Added holdings */}
            {holdings.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {holdings.map((h) => (
                  <span
                    key={h.ticker}
                    className="inline-flex items-center gap-1 px-3 py-2 bg-primary/10 text-primary rounded-full text-small font-semibold border border-primary/20"
                  >
                    {h.ticker}
                    <button
                      onClick={() => removeHolding(h.ticker)}
                      className="ml-1 text-primary/60 hover:text-destructive"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Stock grid */}
            <div className="grid grid-cols-2 gap-2 mb-4 max-h-[280px] overflow-y-auto">
              {POPULAR_STOCKS.filter((s) => !holdings.find((h) => h.ticker === s.ticker)).map((s) => (
                <button
                  key={s.ticker}
                  onClick={() => addHolding(s.ticker, s.name)}
                  className="flex items-center gap-3 p-3 rounded-xl border-2 border-border hover:border-primary/40 transition-all text-left"
                >
                  <span className="text-xl">{s.emoji}</span>
                  <div>
                    <p className="text-small font-bold text-foreground">{s.ticker}</p>
                    <p className="text-xs text-muted-foreground">{s.name}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Custom input */}
            <div className="flex gap-2 mb-4">
              <input
                value={customTicker}
                onChange={(e) => setCustomTicker(e.target.value.toUpperCase())}
                placeholder="티커"
                className="flex-1 h-11 px-3 rounded-xl bg-input border-2 border-border text-small focus:outline-none focus:border-primary"
              />
              <input
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="종목명"
                className="flex-1 h-11 px-3 rounded-xl bg-input border-2 border-border text-small focus:outline-none focus:border-primary"
              />
              <button
                onClick={() => {
                  if (customTicker && customName) {
                    addHolding(customTicker, customName);
                    setCustomTicker("");
                    setCustomName("");
                  }
                }}
                className="px-4 h-11 rounded-xl bg-muted text-foreground font-medium text-small hover:bg-accent transition-colors"
              >
                추가
              </button>
            </div>

            <div className="mt-auto pb-6 flex gap-3">
              <button
                onClick={() => setStep(5)}
                className="flex-1 py-4 rounded-xl border-2 border-border text-foreground font-medium hover:bg-accent transition-colors"
              >
                {holdings.length === 0 ? "건너뛰기" : "나중에"}
              </button>
              <button
                onClick={() => setStep(5)}
                className="flex-[2] py-4 rounded-xl bg-primary text-primary-foreground font-bold shadow-sm hover:opacity-90 transition-all"
              >
                계속하기
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: 첫 레슨 미리보기 (랜덤 OX 1문제) */}
        {step === 5 && (
          <div className="flex-1 flex flex-col animate-slide-up">
            <div className="flex items-start gap-3 mb-6 mt-4">
              <Mascot mood={previewAnswer === null ? "thinking" : isCorrect ? "celebrate" : "default"} size="lg" />
              <SpeechBubble className="mt-2">
                <p className="text-body font-bold text-foreground">
                  {previewAnswer === null
                    ? "한 문제만 같이 풀어볼까요? 🌰"
                    : isCorrect
                    ? "정답이에요! 정말 잘했어요 ✨"
                    : "괜찮아요, 이게 핵심이에요!"}
                </p>
              </SpeechBubble>
            </div>

            <div className="bg-accent/30 border-2 border-border rounded-2xl p-5 mb-4">
              <p className="text-xs text-muted-foreground mb-2">📝 OX 퀴즈 · {previewCategory.name}</p>
              <p className="text-body font-bold text-foreground leading-relaxed">
                "{previewQuestion.statement}"
              </p>
            </div>

            {previewAnswer === null ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPreviewAnswer(true)}
                  className="py-6 rounded-xl border-2 border-border hover:border-primary/40 hover:bg-accent transition-all text-3xl font-bold press-effect"
                >
                  ⭕<br /><span className="text-small">맞다</span>
                </button>
                <button
                  onClick={() => setPreviewAnswer(false)}
                  className="py-6 rounded-xl border-2 border-border hover:border-primary/40 hover:bg-accent transition-all text-3xl font-bold press-effect"
                >
                  ❌<br /><span className="text-small">아니다</span>
                </button>
              </div>
            ) : (
              <div className={`p-4 rounded-xl border-2 ${isCorrect ? "border-primary bg-primary/5" : "border-orange-300 bg-orange-50"} mb-4`}>
                <p className="text-small font-bold text-foreground mb-2">
                  💡 정답: {previewQuestion.answer ? "⭕ 맞다" : "❌ 아니다"}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {previewQuestion.explanation}
                </p>
                {previewQuestion.insight && (
                  <p className="text-xs text-foreground/80 leading-relaxed mt-2 pt-2 border-t border-border/50">
                    🌱 <strong>{previewQuestion.insight}</strong>
                  </p>
                )}
              </div>
            )}

            {previewAnswer !== null && (
              <div className="mt-auto pb-6">
                <button
                  onClick={() => setStep(6)}
                  className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-body shadow-sm hover:opacity-90 transition-all animate-fade-in"
                >
                  계속하기 →
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 6: Ready! */}
        {step === 6 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-bounce-in">
            <Mascot mood="celebrate" size="xl" className="mb-4" />

            <h1 className="text-display text-foreground mb-2">준비 완료!</h1>
            <p className="text-body text-muted-foreground mb-6">
              이제 매일 도토리를 모으며<br />투자 체질을 길러봐요! 🌰
            </p>

            {holdings.length > 0 && (
              <div className="w-full space-y-2 mb-6 max-w-sm">
                {holdings.map((h) => (
                  <div
                    key={h.ticker}
                    className="flex items-center gap-3 p-3 bg-accent rounded-xl border border-border"
                  >
                    <span className="text-small font-bold text-primary">{h.ticker}</span>
                    <span className="text-small text-muted-foreground">{h.company_name_kr}</span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleFinish}
              disabled={saving}
              className="w-full max-w-sm py-4 rounded-xl bg-primary text-primary-foreground font-bold text-body shadow-sm hover:opacity-90 transition-all disabled:opacity-50"
            >
              {saving ? "저장 중..." : "🌱 시작하기"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
