import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Mascot } from "@/components/Mascot";
import { getDailyQuizSet, type QuizQuestion } from "@/data/quizQuestions";

const QUIZ_COUNT = 5;

function OXQuiz({ statement, onAnswer }: { statement: string; onAnswer: (v: boolean) => void }) {
  const [selected, setSelected] = useState<boolean | null>(null);
  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-slide-up">
      <h2 className="text-title font-bold text-foreground text-center mb-8 px-4">
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

function MultipleChoice({ question, options, onAnswer }: { question: string; options: string[]; onAnswer: (i: number) => void }) {
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

function FillBlank({ sentence, hints, onAnswer }: { sentence: string; hints?: string[]; onAnswer: (v: string) => void }) {
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const parts = sentence.split("___");
  const handleSubmit = () => { if (!input.trim()) return; setSubmitted(true); onAnswer(input.trim()); };
  return (
    <div className="flex-1 flex flex-col animate-slide-up">
      <h2 className="text-title font-bold text-foreground text-center mt-4 mb-8">빈칸에 들어갈 단어를 입력하세요</h2>
      <div className="bg-card border-2 border-border rounded-2xl p-6 mx-2 mb-6">
        <p className="text-body text-foreground leading-loose text-center">
          {parts[0]}
          <span className="inline-block min-w-[80px] border-b-2 border-primary mx-1 text-center">
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

export default function PracticePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [lastExplanation, setLastExplanation] = useState("");
  const [completed, setCompleted] = useState(false);
  const [userLevel, setUserLevel] = useState(1);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase.from("profiles").select("current_level").eq("id", user.id).single();
      const lvl = data?.current_level || 1;
      setUserLevel(lvl);
      setQuestions(getDailyQuizSet(QUIZ_COUNT, lvl));
    };
    load();
  }, [user]);

  const handleAnswer = useCallback((userAnswer: boolean | number | string) => {
    const q = questions[index];
    if (!q) return;
    let correct = false;
    if (q.format === "ox") correct = userAnswer === q.answer;
    else if (q.format === "multiple_choice") correct = userAnswer === q.correctIndex;
    else if (q.format === "fill_blank") {
      const input = String(userAnswer).trim().toLowerCase();
      correct = input === q.answer.toLowerCase() || (q.hints?.map(h => h.toLowerCase()) || []).includes(input);
    }
    setLastCorrect(correct);
    setLastExplanation(q.explanation);
    if (correct) { setCorrectCount(p => p + 1); const ns = streak + 1; setStreak(ns); setBestStreak(p => Math.max(p, ns)); } else { setStreak(0); }
    setShowFeedback(true);
  }, [questions, index, streak]);

  const handleContinue = () => {
    setShowFeedback(false);
    if (index + 1 < QUIZ_COUNT) setIndex(index + 1);
    else setCompleted(true);
  };

  const restart = () => {
    setQuestions(getDailyQuizSet(QUIZ_COUNT, userLevel));
    setIndex(0); setCorrectCount(0); setStreak(0); setBestStreak(0);
    setCompleted(false); setShowFeedback(false);
  };

  if (questions.length === 0) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Mascot mood="default" size="lg" className="animate-bounce" /></div>;
  }

  if (completed) {
    const accuracy = Math.round((correctCount / QUIZ_COUNT) * 100);
    return (
      <div className="min-h-screen bg-background flex flex-col items-center px-6 pt-8 pb-6">
        <Mascot mood="celebrate" size="xl" className="mb-3" />
        <h1 className="text-display text-foreground mb-1">연습 완료! 📚</h1>
        <p className="text-small text-muted-foreground mb-6">복습은 실력을 단단하게 해줘요</p>
        <div className="w-full max-w-sm grid grid-cols-2 gap-3 mb-6">
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{accuracy}%</p>
            <p className="text-xs text-muted-foreground mt-1">정답률</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{bestStreak}</p>
            <p className="text-xs text-muted-foreground mt-1">최고 연속</p>
          </div>
        </div>
        <div className="w-full max-w-sm space-y-3">
          <button onClick={restart} className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold shadow-sm">🔄 한 번 더 연습하기</button>
          <button onClick={() => navigate("/")} className="w-full py-4 rounded-xl border-2 border-border text-foreground font-medium">홈으로</button>
        </div>
      </div>
    );
  }

  const q = questions[index];
  const percent = ((index + 1) / QUIZ_COUNT) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center gap-3 px-4 py-3">
        <button onClick={() => navigate("/")} className="text-muted-foreground text-xl">✕</button>
        <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-accent-foreground/60 rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
        </div>
        <span className="text-xs font-bold text-muted-foreground">연습</span>
      </div>

      <div className="flex-1 flex flex-col px-4 max-w-lg mx-auto w-full">
        {q.format === "ox" && <OXQuiz key={index} statement={(q as any).statement} onAnswer={handleAnswer} />}
        {q.format === "multiple_choice" && <MultipleChoice key={index} question={(q as any).question} options={(q as any).options} onAnswer={handleAnswer} />}
        {q.format === "fill_blank" && <FillBlank key={index} sentence={(q as any).sentence} hints={(q as any).hints} onAnswer={handleAnswer} />}
      </div>

      {showFeedback && (
        <div className={`fixed bottom-0 left-0 right-0 z-50 p-5 animate-slide-up ${lastCorrect ? "bg-primary/10 border-t-2 border-primary" : "bg-destructive/10 border-t-2 border-destructive"}`}>
          <div className="max-w-lg mx-auto flex items-start gap-3">
            <Mascot mood={lastCorrect ? "celebrate" : "wave"} size="sm" />
            <div className="flex-1 min-w-0">
              <p className={`text-body font-bold ${lastCorrect ? "text-primary" : "text-destructive"}`}>{lastCorrect ? "정답! 🎉" : "아쉬워요! 💪"}</p>
              <p className="text-small text-foreground/80 mt-1">{lastExplanation}</p>
            </div>
            <button onClick={handleContinue} className={`shrink-0 px-6 py-3 rounded-xl font-bold text-small ${lastCorrect ? "bg-primary text-primary-foreground" : "bg-destructive text-destructive-foreground"}`}>계속</button>
          </div>
        </div>
      )}
    </div>
  );
}
