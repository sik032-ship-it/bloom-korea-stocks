import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Mascot } from "@/components/Mascot";
import { getLevelForCount } from "@/utils/levelSystem";
import { didTreeGrow, getTreeProgress, getTreeStage } from "@/utils/treeGrowth";

interface QuestGrowthCelebrationProps {
  oldCount: number;
  newCount: number;
  onDone: () => void;
}

export function QuestGrowthCelebration({ oldCount, newCount, onDone }: QuestGrowthCelebrationProps) {
  const [view, setView] = useState<"level" | "tree">("level");
  const oldLevel = getLevelForCount(oldCount);
  const newLevel = getLevelForCount(newCount);
  const levelUp = newLevel.level > oldLevel.level;
  const oldTree = getTreeStage(oldCount);
  const newTree = getTreeStage(newCount);
  const treeGrew = didTreeGrow(oldCount, newCount);
  const treeProgress = getTreeProgress(newCount);

  useEffect(() => {
    const timer = window.setTimeout(() => setView("tree"), 1500);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-foreground/40 px-5 backdrop-blur-sm">
      <Confetti recycle={false} numberOfPieces={320} />
      <section className="w-full max-w-sm overflow-hidden rounded-2xl border border-primary/20 bg-card shadow-card-hover" aria-label="퀘스트 완주 성장 결과">
        <div className="bg-primary px-5 py-4 text-center text-primary-foreground">
          <p className="text-xs font-extrabold opacity-90">오늘의 숲길 완주</p>
          <h2 className="mt-1 text-[24px] font-extrabold">도토리와 성장 1칸 획득!</h2>
        </div>

        <div className="p-6 text-center">
          {view === "level" ? (
            <div className="animate-scale-pop">
              <div className="mb-3 flex justify-center gap-2 text-tone-caution-fg" aria-hidden>
                <Sparkles /><Sparkles /><Sparkles />
              </div>
              <Mascot level={newLevel.level} size="xl" className="animate-reward-jump" />
              <p className="mt-3 text-xl font-extrabold text-foreground">
                {levelUp ? `${newLevel.name} 레벨 달성!` : `${newLevel.name} 레벨이 더 단단해졌어요`}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">모든 스테이지를 끝내 성장 경험치가 쌓였어요.</p>
            </div>
          ) : (
            <div className="animate-fade-in">
              <div className="relative mx-auto h-48 w-48">
                <img
                  src={newTree.img}
                  alt={`${newTree.name}로 자란 나무`}
                  className={`h-full w-full object-contain ${treeGrew ? "animate-tree-grow" : "animate-tree-breathe"}`}
                />
                <span className="absolute right-1 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-button">
                  <Check className="h-5 w-5" strokeWidth={3} />
                </span>
              </div>
              <p className="text-xl font-extrabold text-foreground">
                {treeGrew ? `${oldTree.name}에서 ${newTree.name}로 성장!` : `${newTree.name}가 한 뼘 자랐어요`}
              </p>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary progress-shine transition-all duration-700" style={{ width: `${treeProgress}%` }} />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {newTree.next === null ? "울창한 숲을 완성했어요" : `다음 성장까지 ${newTree.next - newCount}번 남았어요`}
              </p>
              <Button type="button" size="lg" onClick={onDone} className="press-effect mt-5 h-14 w-full rounded-xl text-base font-extrabold shadow-button">
                자란 나무 보러 가기 <ArrowRight />
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}