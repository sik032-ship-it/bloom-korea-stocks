import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { PpuriButton } from "@/components/PpuriButton";
import { PpuriCard } from "@/components/PpuriCard";
import { QuestionBadge } from "@/components/QuestionBadge";
import { getLevelInfo } from "@/components/LevelBadge";
import Confetti from "react-confetti";
import type { Database } from "@/integrations/supabase/types";

type Holding = Database["public"]["Tables"]["holdings"]["Row"];
type QuestionTemplate = Database["public"]["Tables"]["question_templates"]["Row"];
type QuestionType = Database["public"]["Enums"]["question_type"];

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`w-2.5 h-2.5 rounded-full transition-colors ${
            i < current ? "bg-primary" : "bg-muted"
          }`}
        />
      ))}
    </div>
  );
}

function pickQuestionType(): QuestionType {
  const r = Math.random();
  if (r < 0.8) return "daily";
  const situational: QuestionType[] = ["earnings", "drop", "surge", "fomo"];
  return situational[Math.floor(Math.random() * situational.length)];
}

export default function DailyLessonPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [selectedHolding, setSelectedHolding] = useState<Holding | null>(null);
  const [questionType, setQuestionType] = useState<QuestionType>("daily");
  const [questionText, setQuestionText] = useState("");
  const [placeholderText, setPlaceholderText] = useState("");
  const [answer, setAnswer] = useState("");
  const [saving, setSaving] = useState(false);
  const [newTotal, setNewTotal] = useState(0);
  const [levelUp, setLevelUp] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      // Check if already done today
      const { data: profile } = await supabase
        .from("profiles")
        .select("last_sentence_date, total_sentences")
        .eq("id", user.id)
        .single();

      const today = new Date().toISOString().split("T")[0];
      if (profile?.last_sentence_date === today) {
        setAlreadyDone(true);
        setLoading(false);
        return;
      }

      // Fetch holdings
      const { data: h } = await supabase
        .from("holdings")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true);

      if (h && h.length > 0) {
        setHoldings(h);
        const random = h[Math.floor(Math.random() * h.length)];
        setSelectedHolding(random);
        const qt = pickQuestionType();
        setQuestionType(qt);
        await loadQuestion(qt, random.company_name_kr);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const loadQuestion = async (type: QuestionType, companyName: string) => {
    const { data: templates } = await supabase
      .from("question_templates")
      .select("*")
      .eq("type", type)
      .eq("is_active", true);

    if (templates && templates.length > 0) {
      const t = templates[Math.floor(Math.random() * templates.length)];
      setQuestionText(t.template_text.replace(/\{종목명\}/g, companyName));
      setPlaceholderText(t.placeholder_text || "");
    } else {
      setQuestionText(`${companyName}에 대해 오늘 한 문장을 써보세요.`);
    }
  };

  const pickDifferentHolding = async () => {
    if (holdings.length <= 1) return;
    const others = holdings.filter((h) => h.id !== selectedHolding?.id);
    const next = others[Math.floor(Math.random() * others.length)];
    setSelectedHolding(next);
    const qt = pickQuestionType();
    setQuestionType(qt);
    await loadQuestion(qt, next.company_name_kr);
  };

  const handleSubmit = async () => {
    if (!user || !selectedHolding || answer.length < 10) return;
    setSaving(true);

    // Insert sentence
    await supabase.from("sentences").insert({
      user_id: user.id,
      holding_id: selectedHolding.id,
      question_type: questionType,
      question_text: questionText,
      answer_text: answer,
    });

    // Update holding sentence count
    await supabase
      .from("holdings")
      .update({ sentence_count: selectedHolding.sentence_count + 1 })
      .eq("id", selectedHolding.id);

    // Update profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profile) {
      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      const wasYesterday = profile.last_sentence_date === yesterday;
      const newStreak = wasYesterday ? profile.current_streak + 1 : 1;
      const newLongest = Math.max(profile.longest_streak, newStreak);
      const total = profile.total_sentences + 1;

      const oldLevel = getLevelInfo(profile.total_sentences);
      const newLevel = getLevelInfo(total);
      if (newLevel.levelIndex > oldLevel.levelIndex) {
        setLevelUp(true);
      }

      await supabase
        .from("profiles")
        .update({
          total_sentences: total,
          current_streak: newStreak,
          longest_streak: newLongest,
          last_sentence_date: today,
          current_level: newLevel.levelIndex + 1,
        })
        .eq("id", user.id);

      setNewTotal(total);
    }

    setShowConfetti(true);
    setSaving(false);
    setStep(3);

    setTimeout(() => setShowConfetti(false), 8000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-12 w-12 bg-muted rounded-full animate-pulse" />
      </div>
    );
  }

  if (alreadyDone) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <span className="text-5xl mb-4">✅</span>
        <h1 className="text-display text-foreground mb-2">오늘은 이미 작성했어요</h1>
        <p className="text-body text-muted-foreground mb-6">내일 다시 만나요!</p>
        <PpuriButton onClick={() => navigate("/")}>홈으로</PpuriButton>
      </div>
    );
  }

  if (holdings.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <span className="text-5xl mb-4">📊</span>
        <h1 className="text-title text-foreground mb-2">종목을 먼저 추가하세요</h1>
        <p className="text-body text-muted-foreground mb-6">
          보유 종목이 있어야 문장을 쓸 수 있어요
        </p>
        <PpuriButton onClick={() => navigate("/")}>홈으로</PpuriButton>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {showConfetti && <Confetti recycle={false} numberOfPieces={300} />}
      <ProgressDots current={step} total={3} />

      <div className="flex-1 flex flex-col px-6 max-w-lg mx-auto w-full">
        {step === 1 && selectedHolding && (
          <div className="flex-1 flex flex-col items-center justify-center animate-slide-up">
            <h1 className="text-display text-foreground mb-6">오늘의 한 문장</h1>

            <PpuriCard className="w-full text-center mb-4">
              <p className="text-3xl font-bold text-foreground mb-1">
                {selectedHolding.ticker}
              </p>
              <p className="text-body text-muted-foreground">
                {selectedHolding.company_name_kr}
              </p>
              <div className="mt-3">
                <QuestionBadge type={questionType} />
              </div>
            </PpuriCard>

            <div className="w-full flex gap-3">
              <PpuriButton variant="ghost" onClick={pickDifferentHolding}>
                다른 종목
              </PpuriButton>
              <PpuriButton fullWidth onClick={() => setStep(2)}>
                이 문장 쓰기
              </PpuriButton>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex-1 flex flex-col animate-slide-up">
            <h1 className="text-title text-foreground mt-4 mb-2">
              당신의 생각을 나눠주세요
            </h1>
            <PpuriCard className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <QuestionBadge type={questionType} />
                <span className="text-small font-medium text-foreground">
                  {selectedHolding?.ticker}
                </span>
              </div>
              <p className="text-body text-foreground">{questionText}</p>
            </PpuriCard>

            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={placeholderText || "여기에 입력하세요... 최소 10자 이상"}
              maxLength={500}
              className="w-full h-32 bg-input border border-border rounded-md p-4 text-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
            <div className="flex justify-between mt-1 mb-4">
              <p className={`text-xs ${answer.length < 10 ? "text-destructive" : "text-muted-foreground"}`}>
                최소 10자
              </p>
              <p className="text-xs text-muted-foreground">{answer.length}/500</p>
            </div>

            <div className="mt-auto pb-6 flex gap-3">
              <PpuriButton variant="ghost" onClick={() => setStep(1)}>
                이전
              </PpuriButton>
              <PpuriButton
                fullWidth
                disabled={answer.length < 10 || saving}
                onClick={handleSubmit}
              >
                {saving ? "저장 중..." : "완료"}
              </PpuriButton>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-bounce-in">
            {levelUp ? (
              <>
                <span className="text-7xl mb-4">🎊</span>
                <h1 className="text-display text-foreground mb-2">축하합니다!</h1>
                <p className="text-title text-primary mb-6">새로운 레벨에 도달했어요!</p>
              </>
            ) : (
              <>
                <span className="text-7xl mb-4">🌱</span>
                <h1 className="text-display text-foreground mb-2">멋져요!</h1>
              </>
            )}
            <p className="text-body text-muted-foreground mb-2">
              +1 문장이 뿌리에 쌓였어요
            </p>
            <p className="text-title text-primary font-bold mb-8">
              총 {newTotal}문장
            </p>
            <PpuriButton fullWidth onClick={() => navigate("/")}>
              홈으로
            </PpuriButton>
          </div>
        )}
      </div>
    </div>
  );
}
