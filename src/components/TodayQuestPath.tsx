import { Check, LockKeyhole, Play, Sparkles, Star, Trophy } from "lucide-react";
import { Mascot } from "@/components/Mascot";
import acornImg from "@/assets/acorn.png";

interface TodayQuestPathProps {
  completed: number;
  total: number;
  done: boolean;
  userLevel: number;
  onStart: () => void;
}

const questNames = [
  "좋은 기업 찾기",
  "고객과 해자 보기",
  "현금의 힘 알기",
  "흔들림 이겨내기",
  "오래 머무르기",
  "유혹 지나치기",
  "거장처럼 판단하기",
];

export function TodayQuestPath({ completed, total, done, userLevel, onStart }: TodayQuestPathProps) {
  const safeTotal = Math.max(1, total);
  const solved = done ? safeTotal : Math.min(completed, safeTotal);
  const activeIndex = done ? -1 : Math.min(solved, safeTotal - 1);
  const progress = Math.round((solved / safeTotal) * 100);

  return (
    <section id="today-cta" aria-labelledby="quest-title" className="overflow-hidden rounded-2xl border border-primary/20 bg-card shadow-card">
      <div className="bg-primary px-5 py-4 text-primary-foreground">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-extrabold opacity-90">오늘의 챕터 · {solved}/{safeTotal}</p>
            <h2 id="quest-title" className="mt-1 text-[22px] font-extrabold leading-tight">좋은 기업과 오래 동행하기</h2>
          </div>
          <div className="shrink-0 rounded-xl bg-primary-foreground/15 px-3 py-2 text-center">
            <p className="text-[18px] font-extrabold tabular-nums leading-none">{progress}%</p>
            <p className="mt-1 text-[10px] font-bold opacity-90">오늘 훈련</p>
          </div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-primary-foreground/25">
          <div className="h-full rounded-full bg-primary-foreground transition-all duration-700" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="quest-map relative px-6 pb-8 pt-12">
        <svg className="pointer-events-none absolute inset-x-0 top-8 h-[calc(100%-5rem)] w-full" viewBox="0 0 320 520" preserveAspectRatio="none" aria-hidden>
          <path className="quest-path-shadow" d="M160 30 C245 78 240 135 160 178 C80 221 80 282 160 325 C240 368 235 430 160 486" />
          <path className="quest-path-dots" d="M160 30 C245 78 240 135 160 178 C80 221 80 282 160 325 C240 368 235 430 160 486" />
        </svg>

        <div className="relative z-[1] flex flex-col gap-8">
          {Array.from({ length: safeTotal }, (_, index) => {
            const isComplete = index < solved;
            const isActive = index === activeIndex;
            const isLocked = !isComplete && !isActive;
            const side = index % 4 === 1 ? "translate-x-12" : index % 4 === 3 ? "-translate-x-12" : "";
            return (
              <div key={index} className={`relative flex min-h-16 justify-center ${side}`}>
                {isActive && (
                  <div className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg border-2 border-border bg-card px-3 py-1 text-xs font-extrabold text-primary shadow-card">
                    {solved === 0 ? "시작" : "이어서 도전"}
                    <span className="absolute -bottom-1.5 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-border bg-card" />
                  </div>
                )}

                <button
                  type="button"
                  onClick={isActive ? onStart : undefined}
                  disabled={!isActive}
                  aria-label={`${index + 1}단계 ${questNames[index] ?? "투자 원칙"}${isLocked ? " 잠김" : isComplete ? " 완료" : " 시작"}`}
                  className={`quest-node relative flex h-16 w-16 items-center justify-center rounded-full border-4 transition-transform ${
                    isActive
                      ? "quest-node-active border-primary/20 bg-primary text-primary-foreground hover:scale-105"
                      : isComplete
                        ? "quest-node-complete border-primary/15 bg-accent text-primary"
                        : "border-muted bg-muted text-muted-foreground"
                  }`}
                >
                  {isComplete ? <Check className="h-7 w-7" strokeWidth={3} /> : isActive ? <Star className="h-8 w-8 fill-current" /> : <LockKeyhole className="h-6 w-6" />}
                </button>

                <div className={`absolute top-4 w-28 ${index % 2 === 0 ? "left-[calc(50%+46px)] text-left" : "right-[calc(50%+46px)] text-right"}`}>
                  <p className={`text-xs font-extrabold ${isLocked ? "text-muted-foreground" : "text-foreground"}`}>퀘스트 {index + 1}</p>
                  <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{questNames[index] ?? "투자 원칙"}</p>
                </div>

                {isActive && (
                  <div className={`absolute top-8 ${index % 2 === 0 ? "right-1" : "left-1"} animate-float`} aria-hidden>
                    <Mascot level={userLevel} size="sm" />
                  </div>
                )}
              </div>
            );
          })}

          <div className="relative mt-1 flex min-h-20 justify-center">
            <div className={`quest-chest flex h-20 w-24 items-center justify-center rounded-xl border-4 ${done ? "border-ppuri-amber/30 bg-tone-caution-bg" : "border-muted bg-muted"}`}>
              {done ? <img src={acornImg} alt="오늘의 도토리 보상" className="h-12 w-12 object-contain animate-scale-pop" /> : <Trophy className="h-9 w-9 text-muted-foreground" />}
            </div>
            <div className="absolute left-[calc(50%+62px)] top-4 w-28 text-left">
              <p className={`text-xs font-extrabold ${done ? "text-tone-caution-fg" : "text-muted-foreground"}`}>{done ? "보상 획득!" : "도토리 상자"}</p>
              <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">모든 퀘스트를 마치면 열려요</p>
            </div>
          </div>
        </div>

        {!done && (
          <button type="button" onClick={onStart} className="press-effect mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-small font-extrabold text-primary-foreground shadow-button">
            <Play className="h-4 w-4 fill-current" />
            {solved > 0 ? `${solved + 1}번째 퀘스트 이어하기` : "첫 퀘스트 시작하기"}
          </button>
        )}
        {done && (
          <div className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-accent py-3 text-small font-extrabold text-accent-foreground">
            <Sparkles className="h-4 w-4" /> 오늘의 퀘스트 완료
          </div>
        )}
      </div>
    </section>
  );
}