import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { selectQuestion, selectNewQuestion } from "@/services/questionEngine";
import { HoldingsContext } from "@/components/HoldingsContext";
import { BehavioralNudge } from "@/components/BehavioralNudge";
import { Mascot } from "@/components/Mascot";
import { SpeechBubble } from "@/components/SpeechBubble";
import { QuestionBadge } from "@/components/QuestionBadge";
import { LevelUpModal } from "@/components/LevelUpModal";
import { RewardPeakSequence } from "@/components/RewardPeakSequence";
import { WarmupPrompt, getTodayWarmup, type WarmupQuestion } from "@/components/WarmupPrompt";
import { getLevelForCount, isLevelUp } from "@/utils/levelSystem";
import { getDailyQuizSet, personalizeQuiz, type QuizQuestion } from "@/data/quizQuestions";
import {
  getCorrectMessage,
  getWrongMessage,
  getLessonMotivation,
  getCompletionInsight,
  getLoadingMessage,
  getQuizWhyItMatters,
} from "@/utils/mascotDialogue";
import { categoryLabels, toneClasses } from "@/data/quizQuestions";
import { isAnswerCorrect } from "@/utils/quizMatch";
import { CategoryIcon } from "@/components/CategoryIcon";
import {
  recordQuizResult,
  getDifficultyBoost,
  getDifficultyLabel,
} from "@/utils/difficultyAdaptation";
import Confetti from "react-confetti";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Database } from "@/integrations/supabase/types";
import type { QuestionType } from "@/styles/colors";

type Holding = Database["public"]["Tables"]["holdings"]["Row"];

const DEFAULT_QUIZ_COUNT = 5;
// daily_goal(문장 목표 1/3/5)에 맞춰 퀴즈 수 동적 조정
// 듀오링고식 "매일 조금씩 쌓는" 복리 효과 강화 — 5문제를 기본으로
function quizCountForGoal(goal: number): number {
  if (goal >= 5) return 7; // 진심 모드 — 더 깊은 훈련
  if (goal >= 3) return 5; // 표준 — 6개 카테고리 거의 다 노출
  return 3;                // 가벼운 시작 — 그래도 매일 3문제
}

function LessonProgressBar({ current, total, streak, onClose }: { current: number; total: number; streak: number; onClose: () => void }) {
  const percent = (current / total) * 100;
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <button
        onClick={onClose}
        aria-label="레슨 닫기"
        className="text-muted-foreground text-xl hover:text-foreground transition-colors"
      >
        ✕
      </button>
      <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden relative">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
      {streak > 0 && (
        <span className="text-xs font-bold text-primary">{streak}번 연속 정답 🔥</span>
      )}
    </div>
  );
}

// ===== O/X Quiz Component =====
function OXQuiz({ statement, onAnswer }: { statement: string; onAnswer: (correct: boolean) => void }) {
  const [selected, setSelected] = useState<boolean | null>(null);
  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-slide-up">
      <h2 className="text-title font-bold text-foreground text-center mb-6 px-4">
        다음 문장이 맞으면 O, 틀리면 X를 누르세요
      </h2>
      <div className="bg-card border-2 border-border rounded-2xl p-6 mb-10 mx-4 max-w-md">
        <p className="text-body text-foreground text-center leading-relaxed">{statement}</p>
      </div>
      <div className="flex gap-6">
        <button onClick={() => { setSelected(true); onAnswer(true); }} disabled={selected !== null}
          className={`w-28 h-28 rounded-2xl border-4 text-4xl font-black transition-all ${selected === true ? "border-primary bg-primary/10 text-primary scale-110" : "border-border hover:border-primary/50 text-foreground hover:scale-105"} disabled:cursor-default`}>⭕</button>
        <button onClick={() => { setSelected(false); onAnswer(false); }} disabled={selected !== null}
          className={`w-28 h-28 rounded-2xl border-4 text-4xl font-black transition-all ${selected === false ? "border-destructive bg-destructive/10 text-destructive scale-110" : "border-border hover:border-destructive/50 text-foreground hover:scale-105"} disabled:cursor-default`}>❌</button>
      </div>
    </div>
  );
}

// ===== Multiple Choice Component =====
function MultipleChoice({ question, options, onAnswer }: { question: string; options: string[]; onAnswer: (index: number) => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <div className="flex-1 flex flex-col animate-slide-up">
      <h2 className="text-title font-bold text-foreground text-center mt-4 mb-8 px-2">{question}</h2>
      <div className="space-y-3 px-2">
        {options.map((opt, i) => (
          <button key={i} onClick={() => { setSelected(i); onAnswer(i); }} disabled={selected !== null}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${selected === i ? "border-primary bg-accent shadow-sm scale-[1.02]" : "border-border hover:border-muted-foreground/30"} disabled:cursor-default`}>
            <span className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-small font-bold text-muted-foreground shrink-0">{i + 1}</span>
            <span className="text-body text-foreground">{opt}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ===== Fill in the Blank Component =====
const FillBlank = React.forwardRef<HTMLDivElement, { sentence: string; hints?: string[]; onAnswer: (value: string) => void }>(function FillBlank({ sentence, hints, onAnswer }, ref) {
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const parts = sentence.split("___");
  const handleSubmit = () => { if (!input.trim()) return; setSubmitted(true); onAnswer(input.trim()); };

  // 입력값 길이에 따라 빈칸 너비 자동 조정 (한글은 약 1em/글자)
  const blankWidth = `${Math.max(4, Math.min(input.length + 2, 12))}ch`;

  return (
    <div ref={ref} className="flex-1 flex flex-col animate-slide-up min-w-0">
      <h2 className="text-title font-bold text-foreground text-center mt-4 mb-6 px-2 break-keep">빈칸에 들어갈 단어를 입력하세요</h2>
      <div className="bg-card border-2 border-border rounded-2xl p-4 sm:p-5 mx-2 mb-6 overflow-hidden">
        <p className="text-base sm:text-body text-foreground leading-loose text-center break-keep [overflow-wrap:anywhere]">
          {parts[0]}
          <span
            className="inline-block border-b-2 border-primary mx-1 text-center align-baseline max-w-full"
            style={{ width: blankWidth, minWidth: "4ch" }}
          >
            {submitted ? (
              <span className="text-primary font-bold break-keep">{input}</span>
            ) : (
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="bg-transparent text-center text-primary font-bold outline-none w-full max-w-full"
                placeholder="..."
                autoFocus
                inputMode="text"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
            )}
          </span>
          {parts[1]}
        </p>
      </div>
      {hints && !submitted && <p className="text-xs text-muted-foreground text-center mb-4">힌트: {hints.join(", ")}</p>}
      {!submitted && (
        <div className="px-2 mt-auto pb-6">
          <button disabled={!input.trim()} onClick={handleSubmit} className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold shadow-sm hover:opacity-90 transition-all disabled:opacity-40">확인하기</button>
        </div>
      )}
    </div>
  );
});

// ===== Feedback Banner with soul =====
function FeedbackBanner({ correct, explanation, streakCount, insight, onContinue }: { correct: boolean; explanation: string; streakCount: number; insight?: string | null; onContinue: () => void }) {
  const message = correct ? getCorrectMessage(streakCount) : getWrongMessage();

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 p-5 animate-slide-up ${correct ? "bg-primary/10 border-t-2 border-primary" : "bg-destructive/10 border-t-2 border-destructive"}`}>
      <div className="max-w-lg mx-auto flex items-start gap-3">
        <div className="shrink-0">
          <Mascot mood={correct ? "celebrate" : "wave"} size="sm" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-body font-bold ${correct ? "text-primary" : "text-destructive"}`}>
            {message}
          </p>
          <p className="text-small text-foreground/80 mt-1">{explanation}</p>
          {/* Show insight if available */}
          {insight && (
            <p className="text-xs text-primary/80 mt-2 italic">💡 {insight}</p>
          )}
        </div>
        <button
          onClick={onContinue}
          className={`shrink-0 px-6 py-3 rounded-xl font-bold text-small ${correct ? "bg-primary text-primary-foreground" : "bg-destructive text-destructive-foreground"}`}
        >
          계속하기
        </button>
      </div>
    </div>
  );
}

// ===== Main Component =====
export default function DailyLessonPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizStreak, setQuizStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [lastExplanation, setLastExplanation] = useState("");
  const [currentInsight, setCurrentInsight] = useState<string | null>(null);

  const [inSentenceStep, setInSentenceStep] = useState(false);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [selectedHolding, setSelectedHolding] = useState<Holding | null>(null);
  const [questionType, setQuestionType] = useState<QuestionType>("daily");
  const [questionText, setQuestionText] = useState("");
  const [placeholderText, setPlaceholderText] = useState("");
  const [answer, setAnswer] = useState("");
  const [saving, setSaving] = useState(false);

  const [completed, setCompleted] = useState(false);
  const [newTotal, setNewTotal] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [oldTotal, setOldTotal] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showRewardPeak, setShowRewardPeak] = useState(false);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [userLevel, setUserLevel] = useState(1);
  const [totalSentences, setTotalSentences] = useState(0);
  const [quizCount, setQuizCount] = useState(DEFAULT_QUIZ_COUNT);
  const [experienceLevel, setExperienceLevel] = useState<string | null>(null);

  // PX Layer 2 — 3단 루틴
  // phase: "warmup" → "quiz" → "sentence"
  const [phase, setPhase] = useState<"warmup" | "quiz" | "sentence">("warmup");
  const [warmupQuestion] = useState<WarmupQuestion>(() => getTodayWarmup());
  const [difficultyBoost, setDifficultyBoost] = useState(0);

  // 🛟 진행 손실 방지: 답을 하나라도 한 시점부터 닫기 시 확인
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const hasProgress =
    phase !== "warmup" ||
    currentQuizIndex > 0 ||
    correctCount > 0 ||
    answer.trim().length > 0;

  const requestClose = () => {
    if (completed || !hasProgress) {
      navigate("/");
      return;
    }
    setShowCloseConfirm(true);
  };

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("last_sentence_date, total_sentences, current_level, current_streak, daily_goal, experience_level")
        .eq("id", user.id)
        .single();

      const today = new Date().toISOString().split("T")[0];
      setAlreadyDone(profile?.last_sentence_date === today);

      const lvl = profile?.current_level || 1;
      const exp = profile?.experience_level ?? null;
      const goal = profile?.daily_goal ?? 1;
      const qc = quizCountForGoal(goal);
      const streak = profile?.current_streak || 0;
      // 동적 난이도: 정답률 + 스트릭 → boost
      const boost = getDifficultyBoost(streak);
      setDifficultyBoost(boost);
      setUserLevel(lvl);
      setExperienceLevel(exp);
      setQuizCount(qc);
      setCurrentStreak(streak);
      setTotalSentences(profile?.total_sentences || 0);
      // 효과적 레벨 = 실제 레벨 + boost (베테랑 보정은 getDailyQuizSet 내부에서 처리)
      const baseQuiz = getDailyQuizSet(qc, lvl + boost, exp, user.id);
      // Will personalize after holdings load
      setQuizQuestions(baseQuiz);

      const { data: h } = await supabase
        .from("holdings").select("*").eq("user_id", user.id).eq("is_active", true).is("deleted_at", null);

      if (h && h.length > 0) {
        setHoldings(h);
        // Personalize quiz with holdings
        const holdingNames = h.map(holding => holding.company_name_kr);
        setQuizQuestions(prev => prev.map(q => personalizeQuiz(q, holdingNames)));
        
        const question = await selectQuestion(h, { userId: user.id });
        if (question) {
          setSelectedHolding(question.holding);
          setQuestionType(question.type as QuestionType);
          setQuestionText(question.questionText);
          setPlaceholderText(question.placeholderText);
        }
      }
      setLoading(false);
    };
    load();
  }, [user]);

  // Auto-complete when no holdings and sentence step reached
  useEffect(() => {
    if (holdings.length === 0 && inSentenceStep && !completed) {
      handleComplete();
    }
  }, [inSentenceStep, holdings.length, completed]);

  // 진행도: 워밍업(1) + 본질퀴즈(quizCount) + 원칙재확인(1)
  const totalSteps = 1 + quizCount + 1;
  const currentStep =
    phase === "warmup" ? 1
      : phase === "sentence" ? 1 + quizCount + 1
      : 1 + currentQuizIndex + 1;

  const handleWarmupComplete = useCallback((correct: boolean) => {
    // 워밍업 결과도 적응형 난이도에 반영
    recordQuizResult(correct);
    setPhase("quiz");
  }, []);

  const handleQuizAnswer = useCallback(
    (userAnswer: boolean | number | string) => {
      const q = quizQuestions[currentQuizIndex];
      if (!q) return;
      let correct = false;
      if (q.format === "ox") correct = userAnswer === q.answer;
      else if (q.format === "multiple_choice") correct = userAnswer === q.correctIndex;
      else if (q.format === "fill_blank") {
        correct = isAnswerCorrect(String(userAnswer), q.answer, q.hints);
      }
      // 동적 난이도 학습 — 다음 세션에 반영
      recordQuizResult(correct);
      setLastCorrect(correct);
      setLastExplanation(q.explanation);
      setCurrentInsight((q as any).insight || null);
      if (correct) {
        setCorrectCount(prev => prev + 1);
        const ns = quizStreak + 1;
        setQuizStreak(ns);
        setBestStreak(prev => Math.max(prev, ns));
      } else {
        setQuizStreak(0);
      }
      setShowFeedback(true);
    },
    [quizQuestions, currentQuizIndex, quizStreak]
  );

  const handleContinue = () => {
    setShowFeedback(false);
    if (currentQuizIndex + 1 < quizCount) {
      setCurrentQuizIndex(currentQuizIndex + 1);
    } else {
      if (holdings.length > 0) {
        setInSentenceStep(true);
        setPhase("sentence");
      } else handleComplete();
    }
  };

  const persistLesson = async (): Promise<void> => {
    if (!user || !selectedHolding) return;

    const { error: insertErr } = await supabase.from("sentences").insert({
      user_id: user.id,
      holding_id: selectedHolding.id,
      question_type: questionType,
      question_text: questionText,
      answer_text: answer,
    });
    if (insertErr) throw insertErr;

    const { error: holdingErr } = await supabase
      .from("holdings")
      .update({ sentence_count: selectedHolding.sentence_count + 1 })
      .eq("id", selectedHolding.id);
    if (holdingErr) throw holdingErr;

    if (!alreadyDone) {
      const { data: profile, error: profileErr } = await supabase
        .from("profiles").select("*").eq("id", user.id).single();
      if (profileErr) throw profileErr;
      if (profile) {
        const today = new Date().toISOString().split("T")[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
        const wasYesterday = profile.last_sentence_date === yesterday;
        const newStreak = wasYesterday ? profile.current_streak + 1 : 1;
        const newLongest = Math.max(profile.longest_streak, newStreak);
        const total = profile.total_sentences + 1;
        setOldTotal(profile.total_sentences);
        setNewTotal(total);
        if (isLevelUp(profile.total_sentences, total)) setShowLevelUp(true);
        const newLevel = getLevelForCount(total);
        const { error: updErr } = await supabase.from("profiles").update({
          total_sentences: total, current_streak: newStreak, longest_streak: newLongest,
          last_sentence_date: today, current_level: newLevel.level,
        }).eq("id", user.id);
        if (updErr) throw updErr;
      }
    }
  };

  const handleComplete = async () => {
    if (!user) return;
    if (!selectedHolding) {
      setShowRewardPeak(true);
      setCompleted(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 8000);
      return;
    }

    setSaving(true);
    try {
      await persistLesson();
    } catch (err) {
      // 🛟 저장 실패 안전망: silent failure 금지 — 사용자에게 알리고 재시도 가능하게
      console.error("[lesson] save failed", err);
      setSaving(false);
      toast({
        variant: "destructive",
        title: "저장에 실패했어요",
        description: "네트워크를 확인하고 다시 시도해 주세요. 작성한 문장은 그대로 남아있어요.",
      });
      return;
    }

    // PX: 감정 피크 → 결과 화면 순서로 노출
    setShowRewardPeak(true);
    setShowConfetti(true);
    setSaving(false);
    setCompleted(true);
    setTimeout(() => setShowConfetti(false), 8000);
  };

  const pickDifferent = async () => {
    const question = await selectNewQuestion(holdings, selectedHolding?.id);
    if (question) {
      setSelectedHolding(question.holding);
      setQuestionType(question.type as QuestionType);
      setQuestionText(question.questionText);
      setPlaceholderText(question.placeholderText);
    }
  };

  // Loading with soul
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <Mascot mood="default" size="lg" className="animate-float" />
        <p className="text-small text-muted-foreground animate-fade-in">{getLoadingMessage()}</p>
        <div className="w-48 h-2 rounded-full skeleton-shimmer mt-2" />
      </div>
    );
  }

  // Completion screen with insight
  if (completed) {
    const accuracy = quizCount > 0 ? Math.round((correctCount / quizCount) * 100) : 0;
    const isRepeat = alreadyDone;
    const xpEarned = isRepeat
      ? Math.round((correctCount * 10 + (answer.length >= 10 ? 15 : 0)) * 0.3)
      : correctCount * 10 + (answer.length >= 10 ? 15 : 0);

    const insight = getCompletionInsight(accuracy, isRepeat);

    return (
      <div className="min-h-screen bg-background flex flex-col items-center px-6 pt-8 pb-6">
        {showRewardPeak && (
          <RewardPeakSequence
            message={isRepeat ? "복습으로 더 단단해졌어요" : "오늘의 한 걸음을 심었어요"}
            subMessage={isRepeat ? "반복은 실력의 뿌리예요 🌱" : "내일도 함께 도토리를 모아봐요 🌰"}
            onDone={() => setShowRewardPeak(false)}
          />
        )}
        {showConfetti && <Confetti recycle={false} numberOfPieces={400} />}
        {showLevelUp && <LevelUpModal oldLevel={oldTotal} newLevel={newTotal} onClose={() => setShowLevelUp(false)} />}

        <Mascot mood="celebrate" size="xl" className="mb-3 animate-float" />
        <h1 className="text-display text-foreground mb-1">{isRepeat ? "복습 완료! 📚" : "레슨 완료! 🌟"}</h1>
        <p className="text-small text-muted-foreground mb-6">
          {isRepeat ? "복습은 실력을 단단하게 해줘요" : "오늘도 한 걸음 성장했어요"}
        </p>

        {/* XP Card */}
        <div className="w-full max-w-sm bg-primary/10 border border-primary/20 rounded-2xl p-5 mb-4 text-center">
          <p className="text-small text-primary font-medium mb-1">획득 XP</p>
          <p className="text-4xl font-black text-primary">+{xpEarned}</p>
        </div>

        {/* Stats Grid */}
        <div className="w-full max-w-sm grid grid-cols-3 gap-3 mb-4">
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{accuracy}%</p>
            <p className="text-xs text-muted-foreground mt-1">정답률</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{bestStreak}</p>
            <p className="text-xs text-muted-foreground mt-1">최고 연속</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{currentStreak > 0 ? currentStreak : 1}</p>
            <p className="text-xs text-muted-foreground mt-1">🔥 연속일</p>
          </div>
        </div>

        {/* 💡 Insight Card */}
        <div className="w-full max-w-sm bg-accent/50 border border-border rounded-xl p-4 mb-4 flex items-start gap-3">
          <Mascot mood="thinking" size="sm" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-primary mb-1">💡 투자 인사이트</p>
            <p className="text-small text-foreground">{insight}</p>
          </div>
        </div>

        {/* Quiz breakdown */}
        <div className="w-full max-w-sm bg-card border border-border rounded-xl p-4 mb-6">
          <p className="text-small font-semibold text-foreground mb-3">퀴즈 결과</p>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${accuracy}%` }} />
            </div>
            <span className="text-xs font-bold text-foreground">{correctCount}/{quizCount}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {accuracy === 100 ? "완벽해요! 투자 지식이 탄탄하네요 💪"
              : accuracy >= 67 ? "잘했어요! 조금만 더 공부하면 완벽해요 📚"
              : "괜찮아요! 틀린 문제가 오히려 더 기억에 남아요 🌱"}
          </p>
        </div>

        {newTotal > 0 && (
          <p className="text-small text-muted-foreground mb-4">
            총 <span className="font-bold text-primary">{newTotal}</span>문장 — 매일 쌓이는 복리 지식 🌱
          </p>
        )}

        {/* Behavioral Bias Detection & Nudge */}
        {user && holdings.length > 0 && (
          <BehavioralNudge userId={user.id} holdings={holdings} triggerAfterLesson={true} />
        )}

        {/* PX: 다음 행동을 자연스럽게 — 내일에 대한 기대 + 즉시 실행 가능한 CTA */}
        <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-4 mb-3 flex items-center gap-3">
          <span className="text-2xl">🌙</span>
          <div className="flex-1">
            <p className="text-small font-semibold text-foreground">내일도 같은 시간에 만나요</p>
            <p className="text-xs text-muted-foreground">하루 3분, 도토리가 모여 숲이 됩니다</p>
          </div>
        </div>

        <button
          onClick={() => navigate("/")}
          className="w-full max-w-sm py-4 rounded-2xl bg-primary text-primary-foreground font-bold shadow-button hover:opacity-95 transition-all press-effect animate-cta-breathe"
        >
          🏠 홈에서 성장 보기
        </button>
        <button
          onClick={() => navigate("/holdings")}
          className="w-full max-w-sm py-3 mt-2 rounded-xl text-muted-foreground font-medium text-small hover:text-foreground transition-colors"
        >
          내 종목 둘러보기 →
        </button>
      </div>
    );
  }


  // 난이도 라벨 (3단 루틴 상단에 노출)
  const difficultyMeta = getDifficultyLabel(difficultyBoost);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {showConfetti && <Confetti recycle={false} numberOfPieces={300} />}
      <LessonProgressBar current={currentStep} total={totalSteps} streak={quizStreak} onClose={requestClose} />

      <AlertDialog open={showCloseConfirm} onOpenChange={setShowCloseConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>레슨을 그만둘까요?</AlertDialogTitle>
            <AlertDialogDescription>
              지금 나가면 오늘의 진행이 저장되지 않아요. 한 문장만 더 심으면 도토리가 모여요 🌰
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>계속하기</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowCloseConfirm(false);
                navigate("/");
              }}
            >
              나가기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


      {/* Phase 0 — 워밍업 (30초): 본질 퀴즈 전 가벼운 위기 시나리오로 멘탈 시동 */}
      {phase === "warmup" && (
        <div className="flex-1 flex flex-col">
          <div className="px-4 max-w-lg mx-auto w-full">
            <div className="flex items-center justify-center gap-2 mt-1">
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: difficultyMeta.color + "20", color: difficultyMeta.color }}
              >
                {difficultyMeta.label}
              </span>
            </div>
          </div>
          <WarmupPrompt question={warmupQuestion} onComplete={handleWarmupComplete} />
        </div>
      )}

      <div className="flex-1 flex flex-col px-4 max-w-lg mx-auto w-full relative">
        {/* Motivation message before quiz starts */}
        {phase === "quiz" && !inSentenceStep && currentQuizIndex === 0 && !showFeedback && (
          <div className="bg-accent/30 rounded-xl px-4 py-3 mb-2 flex items-center gap-2 animate-fade-in">
            <span className="text-sm">💡</span>
            <p className="text-xs text-muted-foreground">{getLessonMotivation(totalSentences, currentStreak)}</p>
          </div>
        )}

        {/* Quiz Phase */}
        {phase === "quiz" && !inSentenceStep && quizQuestions[currentQuizIndex] && (
          <>
            {/* Phase 1 라벨 — 본질 퀴즈 */}
            {!showFeedback && currentQuizIndex === 0 && (
              <div className="flex items-center justify-center gap-2 mt-1 mb-2 animate-fade-in">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#3B82F6]/15 text-[#3B82F6]">
                  📚 본질 퀴즈 ({quizCount}문제)
                </span>
              </div>
            )}
            {/* Category badge — 4톤 시맨틱 (hardcoded color 제거) */}
            {!showFeedback && (() => {
              const q = quizQuestions[currentQuizIndex];
              const cat = categoryLabels[q.category];
              if (!cat) return null;
              const t = toneClasses[cat.tone];
              return (
                <div className="flex items-center justify-center gap-2 mb-2 animate-fade-in">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${t.bg} ${t.fg}`}>
                    <CategoryIcon category={q.category} size={12} />
                    {cat.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground">| {getQuizWhyItMatters(q.category)}</span>
                </div>
              );
            })()}

            {quizQuestions[currentQuizIndex].format === "ox" && (
              <OXQuiz key={currentQuizIndex} statement={(quizQuestions[currentQuizIndex] as any).statement} onAnswer={(val) => handleQuizAnswer(val)} />
            )}
            {quizQuestions[currentQuizIndex].format === "multiple_choice" && (
              <MultipleChoice key={currentQuizIndex} question={(quizQuestions[currentQuizIndex] as any).question} options={(quizQuestions[currentQuizIndex] as any).options} onAnswer={(val) => handleQuizAnswer(val)} />
            )}
            {quizQuestions[currentQuizIndex].format === "fill_blank" && (
              <FillBlank key={currentQuizIndex} sentence={(quizQuestions[currentQuizIndex] as any).sentence} hints={(quizQuestions[currentQuizIndex] as any).hints} onAnswer={(val) => handleQuizAnswer(val)} />
            )}
          </>
        )}

        {/* Phase 2 — 본인 원칙 재확인 (Sentence Writing) */}
        {inSentenceStep && selectedHolding && (
          <div className="flex-1 flex flex-col animate-slide-up">
            {/* 원칙 재확인 라벨 — 3단 루틴의 마지막 단계 */}
            <div className="flex items-center justify-center gap-2 mt-1 mb-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary/15 text-primary">
                🌱 본인 원칙 재확인
              </span>
            </div>
            {/* Holdings Context - real-time personalization */}
            {user && holdings.length > 0 && (
              <HoldingsContext userId={user.id} holdings={holdings} currentHolding={selectedHolding} />
            )}
            <div className="flex items-start gap-3 mt-2 mb-4">
              <Mascot mood="thinking" size="md" />
              <SpeechBubble className="mt-1">
                <div className="flex items-center gap-2 mb-1">
                  <QuestionBadge type={questionType} />
                  <span className="text-small font-semibold text-foreground">{selectedHolding.ticker}</span>
                </div>
                <p className="text-body text-foreground">{questionText}</p>
              </SpeechBubble>
            </div>

            <button onClick={pickDifferent} className="text-xs text-primary font-medium mb-3 self-start hover:underline">
              🔄 다른 질문 받기
            </button>

            <textarea
              value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder={placeholderText}
              maxLength={500}
              className="w-full h-32 bg-card border-2 border-border rounded-xl p-4 text-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none"
            />
            <div className="flex justify-between mt-1 mb-4">
              <p className={`text-xs ${answer.length < 10 ? "text-destructive" : "text-muted-foreground"}`}>최소 10자</p>
              <p className="text-xs text-muted-foreground">{answer.length}/500</p>
            </div>

            <div className="mt-auto pb-6">
              <button disabled={answer.length < 10 || saving} onClick={handleComplete}
                className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold shadow-sm hover:opacity-90 transition-all disabled:opacity-40">
                {saving ? "저장 중..." : "✍️ 문장 심기"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Feedback Banner with soul */}
      {showFeedback && (
        <FeedbackBanner
          correct={lastCorrect}
          explanation={lastExplanation}
          streakCount={quizStreak}
          insight={currentInsight}
          onContinue={handleContinue}
        />
      )}
    </div>
  );
}
