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
import { categoryLabels } from "@/data/quizQuestions";
import { isAnswerCorrect } from "@/utils/quizMatch";
import { CategoryIcon } from "@/components/CategoryIcon";
import Confetti from "react-confetti";
import type { Database } from "@/integrations/supabase/types";
import type { QuestionType } from "@/styles/colors";

type Holding = Database["public"]["Tables"]["holdings"]["Row"];

const QUIZ_COUNT = 3;
const TOTAL_STEPS = QUIZ_COUNT + 1;

function LessonProgressBar({ current, total, streak, onClose }: { current: number; total: number; streak: number; onClose: () => void }) {
  const percent = (current / total) * 100;
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <button onClick={onClose} className="text-muted-foreground text-xl hover:text-foreground transition-colors">✕</button>
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
function FillBlank({ sentence, hints, onAnswer }: { sentence: string; hints?: string[]; onAnswer: (value: string) => void }) {
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const parts = sentence.split("___");
  const handleSubmit = () => { if (!input.trim()) return; setSubmitted(true); onAnswer(input.trim()); };

  // 입력값 길이에 따라 빈칸 너비 자동 조정 (한글은 약 1em/글자)
  const blankWidth = `${Math.max(4, Math.min(input.length + 2, 14))}ch`;

  return (
    <div className="flex-1 flex flex-col animate-slide-up">
      <h2 className="text-title font-bold text-foreground text-center mt-4 mb-8">빈칸에 들어갈 단어를 입력하세요</h2>
      <div className="bg-card border-2 border-border rounded-2xl p-5 mx-2 mb-6">
        <p className="text-body text-foreground leading-loose text-center break-keep">
          {parts[0]}
          <span
            className="inline-block border-b-2 border-primary mx-1 text-center align-baseline"
            style={{ width: blankWidth, minWidth: "4ch", maxWidth: "100%" }}
          >
            {submitted ? <span className="text-primary font-bold">{input}</span> : <input value={input} onChange={(e) => setInput(e.target.value)} className="bg-transparent text-center text-primary font-bold outline-none w-full" placeholder="..." autoFocus />}
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
}

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
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [userLevel, setUserLevel] = useState(1);
  const [totalSentences, setTotalSentences] = useState(0);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("last_sentence_date, total_sentences, current_level, current_streak")
        .eq("id", user.id)
        .single();

      const today = new Date().toISOString().split("T")[0];
      setAlreadyDone(profile?.last_sentence_date === today);

      const lvl = profile?.current_level || 1;
      setUserLevel(lvl);
      setCurrentStreak(profile?.current_streak || 0);
      setTotalSentences(profile?.total_sentences || 0);
      const baseQuiz = getDailyQuizSet(QUIZ_COUNT, lvl);
      // Will personalize after holdings load
      setQuizQuestions(baseQuiz);

      const { data: h } = await supabase
        .from("holdings").select("*").eq("user_id", user.id).eq("is_active", true).is("deleted_at", null);

      if (h && h.length > 0) {
        setHoldings(h);
        // Personalize quiz with holdings
        const holdingNames = h.map(holding => holding.company_name_kr);
        setQuizQuestions(prev => prev.map(q => personalizeQuiz(q, holdingNames)));
        
        const question = await selectQuestion(h);
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

  const currentStep = inSentenceStep ? QUIZ_COUNT + 1 : currentQuizIndex + 1;

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
    if (currentQuizIndex + 1 < QUIZ_COUNT) {
      setCurrentQuizIndex(currentQuizIndex + 1);
    } else {
      if (holdings.length > 0) setInSentenceStep(true);
      else handleComplete();
    }
  };

  const handleComplete = async () => {
    if (!user) return;
    if (!selectedHolding) {
      setCompleted(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 8000);
      return;
    }

    setSaving(true);
    await supabase.from("sentences").insert({
      user_id: user.id, holding_id: selectedHolding.id,
      question_type: questionType, question_text: questionText, answer_text: answer,
    });
    await supabase.from("holdings").update({ sentence_count: selectedHolding.sentence_count + 1 }).eq("id", selectedHolding.id);

    if (!alreadyDone) {
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
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
        await supabase.from("profiles").update({
          total_sentences: total, current_streak: newStreak, longest_streak: newLongest,
          last_sentence_date: today, current_level: newLevel.level,
        }).eq("id", user.id);
      }
    }

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
    const accuracy = QUIZ_COUNT > 0 ? Math.round((correctCount / QUIZ_COUNT) * 100) : 0;
    const isRepeat = alreadyDone;
    const xpEarned = isRepeat
      ? Math.round((correctCount * 10 + (answer.length >= 10 ? 15 : 0)) * 0.3)
      : correctCount * 10 + (answer.length >= 10 ? 15 : 0);

    const insight = getCompletionInsight(accuracy, isRepeat);

    return (
      <div className="min-h-screen bg-background flex flex-col items-center px-6 pt-8 pb-6">
        {showConfetti && <Confetti recycle={false} numberOfPieces={400} />}
        {showLevelUp && <LevelUpModal oldLevel={oldTotal} newLevel={newTotal} onClose={() => setShowLevelUp(false)} />}

        <Mascot mood="celebrate" size="xl" className="mb-3" />
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
            <span className="text-xs font-bold text-foreground">{correctCount}/{QUIZ_COUNT}</span>
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

        <button onClick={() => navigate("/")} className="w-full max-w-sm py-4 rounded-xl bg-primary text-primary-foreground font-bold shadow-sm hover:opacity-90 transition-all">
          홈으로 돌아가기
        </button>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-background flex flex-col">
      {showConfetti && <Confetti recycle={false} numberOfPieces={300} />}
      <LessonProgressBar current={currentStep} total={TOTAL_STEPS} streak={quizStreak} onClose={() => navigate("/")} />

      <div className="flex-1 flex flex-col px-4 max-w-lg mx-auto w-full relative">
        {/* Motivation message before quiz starts */}
        {!inSentenceStep && currentQuizIndex === 0 && !showFeedback && (
          <div className="bg-accent/30 rounded-xl px-4 py-3 mb-2 flex items-center gap-2 animate-fade-in">
            <span className="text-sm">💡</span>
            <p className="text-xs text-muted-foreground">{getLessonMotivation(totalSentences, currentStreak)}</p>
          </div>
        )}

        {/* Quiz Phase */}
        {!inSentenceStep && quizQuestions[currentQuizIndex] && (
          <>
            {/* Category badge */}
            {!showFeedback && (() => {
              const q = quizQuestions[currentQuizIndex];
              const cat = categoryLabels[q.category];
              return cat ? (
                <div className="flex items-center justify-center gap-2 mb-2 animate-fade-in">
                  <CategoryIcon category={q.category} size={13} color={cat.color} />
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: cat.color + "15", color: cat.color }}>{cat.name}</span>
                  <span className="text-[10px] text-muted-foreground">| {getQuizWhyItMatters(q.category)}</span>
                </div>
              ) : null;
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

        {/* Sentence Writing Phase */}
        {inSentenceStep && selectedHolding && (
          <div className="flex-1 flex flex-col animate-slide-up">
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
