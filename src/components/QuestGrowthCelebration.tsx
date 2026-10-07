import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Mascot } from "@/components/Mascot";
import { getLevelForCount, getProgressToNextLevel } from "@/utils/levelSystem";
import { didTreeGrow, getTreeProgress, getTreeStage } from "@/utils/treeGrowth";

interface QuestGrowthCelebrationProps {
  oldCount: number;
  newCount: number;
  onDone: () => void;
}

type Phase = "level" | "seed" | "grown";

export function QuestGrowthCelebration({ oldCount, newCount, onDone }: QuestGrowthCelebrationProps) {
  const [phase, setPhase] = useState<Phase>("level");
  const [progress, setProgress] = useState(() => getTreeProgress(oldCount));
  const oldLevel = getLevelForCount(oldCount);
  const newLevel = getLevelForCount(newCount);
  const levelUp = newLevel.level > oldLevel.level;
  const oldTree = getTreeStage(oldCount);
  const newTree = getTreeStage(newCount);
  const treeGrew = didTreeGrow(oldCount, newCount);
  const targetProgress = getTreeProgress(newCount);
  const lvProg = getProgressToNextLevel(newCount);
  const [lvWidth, setLvWidth] = useState(() => getProgressToNextLevel(oldCount).percent);
  const width = typeof window !== "undefined" ? window.innerWidth : 390;
  const height = typeof window !== "undefined" ? window.innerHeight : 844;

  useEffect(() => {
    const t = setTimeout(() => setLvWidth(levelUp ? 0 : lvProg.percent), 500);
    const t2 = setTimeout(() => setLvWidth(lvProg.percent), 1100);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, [levelUp, lvProg.percent]);

  useEffect(() => {
    const t1 = window.setTimeout(() => setPhase("seed"), 1700);
    const t2 = window.setTimeout(() => setPhase("grown"), 2500);
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); };
  }, []);

  useEffect(() => {
    if (phase !== "grown") return;
    // 성장한 단계는 0%부터, 같은 단계는 기존 진행도에서 이어서 채움
    if (treeGrew) setProgress(0);
    const t = window.setTimeout(() => setProgress(targetProgress), 120);
    return () => window.clearTimeout(t);
  }, [phase, treeGrew, targetProgress]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-foreground/45 backdrop-blur-sm animate-fade-in sm:items-center sm:px-5"
      role="dialog"
      aria-modal="true"
      aria-label="퀘스트 완주 성장 결과"
    >
      <Confetti width={width} height={height} recycle={false} numberOfPieces={width < 480 ? 160 : 300} gravity={0.25} />
      <section className="growth-sheet w-full max-w-lg overflow-hidden rounded-t-3xl border border-primary/20 bg-card shadow-card-hover sm:max-w-sm sm:rounded-2xl">
        <div className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-primary-foreground/60 sm:hidden" aria-hidden />
        <div className="bg-primary px-5 pb-4 pt-3 text-center text-primary-foreground">
          <p className="text-xs font-extrabold opacity-90">오늘의 숲길 완주</p>
          <h2 className="mt-1 text-[22px] font-extrabold leading-tight break-keep">도토리와 성장 1칸 획득!</h2>
        </div>

        <div className="px-6 pt-6 text-center" style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}>
          {/* 단계 표시 */}
          <div className="mb-4 flex justify-center gap-1.5" aria-hidden>
            {(["level", "seed", "grown"] as Phase[]).map((p, i) => (
              <span
                key={p}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  ["level", "seed", "grown"].indexOf(phase) >= i ? "w-6 bg-primary" : "w-1.5 bg-muted"
                }`}
              />
            ))}
          </div>

          {phase === "level" ? (
            <div key="level" className="animate-scale-pop min-h-[300px]">
              <div className="mb-3 flex justify-center gap-2 text-tone-caution-fg" aria-hidden>
                <Sparkles className="animate-twinkle" /><Sparkles className="animate-twinkle [animation-delay:200ms]" /><Sparkles className="animate-twinkle [animation-delay:400ms]" />
              </div>
              <Mascot level={newLevel.level} size="xl" className="animate-reward-jump" />
              <p className="mt-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-extrabold text-primary" data-testid="growth-level">
                {levelUp ? `Lv.${oldLevel.level} → Lv.${newLevel.level}` : `Lv.${newLevel.level} ${newLevel.name}`}
              </p>
              <p className="mt-2 text-xl font-extrabold leading-snug text-foreground break-keep">
                {levelUp ? `${newLevel.name} 레벨 달성!` : `${newLevel.name} 레벨이 더 단단해졌어요`}
              </p>
              <div className="mx-auto mt-4 max-w-xs">
                <div className="h-2.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${lvWidth}%` }} /></div>
                <p className="mt-2 text-sm text-muted-foreground break-keep">
                  {lvProg.next === lvProg.current ? "최고 레벨이에요" : `다음 레벨까지 퀘스트 완주 ${lvProg.next - lvProg.current}번`}
                </p>
              </div>
            </div>
          ) : (
            <div key="tree" className="min-h-[300px]">
              <div className="relative mx-auto h-44 w-44">
                <span className="growth-glow absolute inset-4 rounded-full bg-primary/20 blur-2xl" aria-hidden />
                {phase === "seed" ? (
                  <img src={oldTree.img} alt={`${oldTree.name}`} className="growth-shake relative h-full w-full object-contain" />
                ) : (
                  <>
                    <img
                      src={newTree.img}
                      alt={`${newTree.name}로 자란 나무`}
                      className={`relative h-full w-full object-contain ${treeGrew ? "animate-tree-grow" : "animate-tree-breathe"}`}
                    />
                    <span className="animate-pop-in absolute right-1 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-button [animation-delay:600ms]">
                      <Check className="h-5 w-5" strokeWidth={3} />
                    </span>
                  </>
                )}
              </div>
              <p className="mt-2 text-xl font-extrabold leading-snug text-foreground break-keep" aria-live="polite">
                {phase === "seed"
                  ? "나무가 자라는 중..."
                  : treeGrew ? `${oldTree.name}에서 ${newTree.name}로 성장!` : `${newTree.name}가 한 뼘 자랐어요`}
              </p>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary progress-shine transition-[width] duration-1000 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-muted-foreground break-keep">
                {newTree.next === null ? "울창한 숲을 완성했어요" : `다음 성장까지 퀘스트 완주 ${newTree.next - newCount}번`}
              </p>
              <Button
                type="button"
                size="lg"
                onClick={onDone}
                disabled={phase !== "grown"}
                className="press-effect mt-5 h-14 w-full rounded-xl text-base font-extrabold shadow-button transition-opacity"
              >
                자란 나무 보러 가기 <ArrowRight />
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
