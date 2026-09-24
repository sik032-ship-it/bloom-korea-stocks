import { useMemo, useState } from "react";
import { Sparkles, Target } from "lucide-react";
import type { WeaknessProfile } from "@/lib/weaknessCoach";
import { categoryLabels, toneClasses } from "@/data/quizQuestions";
import { countQuestions } from "@/data/quizQuestions";
import { CategoryIcon } from "@/components/CategoryIcon";
import type { Difficulty, QuizCategory } from "@/data/quizTypes";

const DIFFS: { id: Difficulty | null; label: string; desc: string }[] = [
  { id: null, label: "추천", desc: "내 수준에 맞게" },
  { id: "beginner", label: "입문", desc: "처음이라면" },
  { id: "intermediate", label: "중급", desc: "기본은 알아요" },
  { id: "advanced", label: "심화", desc: "깊게 생각하기" },
];

const TONE_GROUPS: { tone: "growth" | "wisdom" | "caution" | "truth"; title: string }[] = [
  { tone: "growth", title: "좋은 기업 · 머무르기" },
  { tone: "wisdom", title: "철학 · 판단" },
  { tone: "caution", title: "위기 · 심리" },
  { tone: "truth", title: "현금 · 실전" },
];

interface Props {
  count: number;
  onStart: (choice: { category: QuizCategory | null; difficulty: Difficulty | null; coach?: boolean }) => void;
  coach?: WeaknessProfile | null;
}

export function QuizPicker({ count, onStart, coach }: Props) {
  const [category, setCategory] = useState<QuizCategory | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);

  const available = useMemo(() => countQuestions(category, difficulty), [category, difficulty]);
  const cats = Object.entries(categoryLabels) as [QuizCategory, (typeof categoryLabels)[QuizCategory]][];

  return (
    <div className="flex-1 flex flex-col animate-slide-up pb-28">
      <h2 className="text-[22px] font-extrabold text-foreground mt-2 leading-snug">오늘은 어떤 문제를 풀까요?</h2>
      <p className="text-small text-muted-foreground mt-1">주제와 난이도를 고르면 {count}문제를 골라드려요.</p>

      {coach?.ready && (coach.weakest.length > 0 || coach.reviewKeys.length > 0) && (
        <button
          onClick={() => onStart({ category: null, difficulty: null, coach: true })}
          className="mt-5 w-full flex items-center gap-3 rounded-2xl border-2 border-primary bg-primary/10 p-4 text-left press-effect"
        >
          <span className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0">
            <Target className="w-5 h-5" />
          </span>
          <span className="min-w-0">
            <span className="block text-body font-extrabold text-foreground">내 약점 집중 코칭</span>
            <span className="block text-xs text-muted-foreground mt-0.5 truncate">
              {coach.weakest.length > 0 ? coach.weakest.map((w) => categoryLabels[w.category].name).join(" · ") : "오답 다시 풀기"}
              {coach.reviewKeys.length > 0 ? ` + 오답 ${coach.reviewKeys.length}개` : ""}
            </span>
          </span>
        </button>
      )}

      <p className="text-small font-bold text-foreground mt-6 mb-2">난이도</p>
      <div className="grid grid-cols-4 gap-2">
        {DIFFS.map((d) => {
          const on = difficulty === d.id;
          return (
            <button
              key={d.label}
              onClick={() => setDifficulty(d.id)}
              aria-pressed={on}
              className={`rounded-xl border-2 py-2.5 px-1 text-center transition-all press-effect ${
                on ? "border-primary bg-primary/10" : "border-border bg-card"
              }`}
            >
              <p className={`text-small font-bold ${on ? "text-primary" : "text-foreground"}`}>{d.label}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{d.desc}</p>
            </button>
          );
        })}
      </div>

      <p className="text-small font-bold text-foreground mt-6 mb-2">주제</p>
      <button
        onClick={() => setCategory(null)}
        aria-pressed={category === null}
        className={`w-full flex items-center gap-3 rounded-xl border-2 p-3 mb-4 text-left press-effect ${
          category === null ? "border-primary bg-primary/10" : "border-border bg-card"
        }`}
      >
        <Sparkles className="w-5 h-5 text-primary" />
        <div>
          <p className="text-small font-bold text-foreground">골고루 섞기</p>
          <p className="text-xs text-muted-foreground">여러 주제를 한 번에 연습해요</p>
        </div>
      </button>

      {TONE_GROUPS.map((g) => (
        <div key={g.tone} className="mb-4">
          <p className="text-xs font-bold text-muted-foreground mb-2">{g.title}</p>
          <div className="grid grid-cols-2 gap-2">
            {cats.filter(([, c]) => c.tone === g.tone).map(([id, c]) => {
              const on = category === id;
              const t = toneClasses[c.tone];
              const n = countQuestions(id, difficulty);
              return (
                <button
                  key={id}
                  onClick={() => setCategory(id)}
                  disabled={n === 0}
                  aria-pressed={on}
                  className={`flex items-center gap-2 rounded-xl border-2 p-3 text-left press-effect disabled:opacity-40 ${
                    on ? `${t.bg} border-current ${t.fg}` : "border-border bg-card"
                  }`}
                >
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${t.bg} ${t.fg}`}>
                    <CategoryIcon category={id} size={16} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-small font-bold text-foreground truncate">{c.name}</span>
                    <span className="block text-[11px] text-muted-foreground">{n}문제</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border p-4 z-20">
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => onStart({ category, difficulty })}
            disabled={available === 0}
            className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-body press-effect disabled:opacity-40"
          >
            {available === 0 ? "이 조합엔 문제가 없어요" : `${Math.min(count, available)}문제 시작하기`}
          </button>
        </div>
      </div>
    </div>
  );
}
