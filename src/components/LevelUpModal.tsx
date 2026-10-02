import React, { useState, useEffect } from "react";
import Confetti from "react-confetti";
import { Sparkles } from "lucide-react";
import { getLevelForCount } from "@/utils/levelSystem";
import { Mascot } from "@/components/Mascot";
import { PpuriButton } from "@/components/PpuriButton";
import { didTreeGrow, getTreeStage } from "@/utils/treeGrowth";

interface LevelUpModalProps {
  oldLevel: number;
  newLevel: number;
  onClose: () => void;
}

export const LevelUpModal = ({ oldLevel, newLevel, onClose }: LevelUpModalProps) => {
  const [showConfetti, setShowConfetti] = useState(true);
  const [phase, setPhase] = useState<"old" | "transition" | "new">("old");
  const oldInfo = getLevelForCount(oldLevel);
  const newInfo = getLevelForCount(newLevel);
  const treeGrew = didTreeGrow(oldLevel, newLevel);
  const oldTree = getTreeStage(oldLevel);
  const newTree = getTreeStage(newLevel);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("transition"), 800);
    const t2 = setTimeout(() => setPhase("new"), 1600);
    const t3 = setTimeout(() => setShowConfetti(false), 10000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm">
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}
      <div className="bg-card rounded-2xl p-8 mx-6 max-w-sm w-full text-center shadow-card-hover animate-bounce-in">
        {/* Stars decoration */}
        <div className="flex justify-center gap-2 mb-2">
          {[...Array(3)].map((_, i) => (
            <Sparkles key={i} size={22} className="text-tone-caution-fg animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
          ))}
        </div>

        <h2 className="text-display text-foreground mb-4">{treeGrew ? "나무가 자랐어요!" : "레벨 업!"}</h2>

        {/* Mascot evolution */}
        <div className="flex items-center justify-center gap-4 mb-6 min-h-[140px]">
          {/* Old mascot */}
          <div className={`flex flex-col items-center transition-all duration-700 ${
            phase === "old" ? "opacity-100 scale-100" : "opacity-30 scale-75"
          }`}>
            {treeGrew ? (
              <img src={oldTree.img} alt={`${oldTree.name} 이전 모습`} className="w-28 h-28 object-contain" />
            ) : (
              <Mascot level={oldInfo.level} size="lg" />
            )}
            <span className="text-xs text-muted-foreground mt-1 font-medium">{treeGrew ? oldTree.name : oldInfo.name}</span>
          </div>

          {/* Arrow */}
          <div className={`text-2xl transition-all duration-500 ${
            phase === "transition" ? "scale-150 text-primary" : "text-muted-foreground"
          }`}>
            →
          </div>

          {/* New mascot */}
          <div className={`flex flex-col items-center transition-all duration-700 ${
            phase === "new" ? "opacity-100 scale-110" : phase === "transition" ? "opacity-60 scale-90" : "opacity-20 scale-75"
          }`}>
            {treeGrew ? (
              <img src={newTree.img} alt={`${newTree.name} 새 모습`} className={phase === "new" ? "w-28 h-28 object-contain animate-tree-grow" : "w-28 h-28 object-contain"} />
            ) : (
              <Mascot level={newInfo.level} size="lg" />
            )}
            <span className="text-xs text-primary mt-1 font-bold">{treeGrew ? newTree.name : newInfo.name}</span>
          </div>
        </div>

        {/* Glow ring around new level */}
        {phase === "new" && (
          <div className="animate-fade-in">
            <p className="text-body text-primary font-bold mb-1">
              {treeGrew ? `${newTree.name}로 성장!` : `${newInfo.name} 레벨 달성!`}
            </p>
            <p className="text-small text-muted-foreground mb-6">
              {treeGrew ? "심은 문장들이 모여 뿌리와 가지가 자랐어요." : "꾸준한 투자 공부가 결실을 맺고 있어요!"}
            </p>
          </div>
        )}

        <PpuriButton fullWidth onClick={onClose}>
          계속하기
        </PpuriButton>
      </div>
    </div>
  );
};
