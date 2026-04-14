import React, { useState, useEffect } from "react";
import Confetti from "react-confetti";
import { getLevelForCount } from "@/utils/levelSystem";
import { PpuriButton } from "@/components/PpuriButton";

interface LevelUpModalProps {
  oldLevel: number;
  newLevel: number;
  onClose: () => void;
}

export const LevelUpModal = ({ oldLevel, newLevel, onClose }: LevelUpModalProps) => {
  const [showConfetti, setShowConfetti] = useState(true);
  const oldInfo = getLevelForCount(oldLevel);
  const newInfo = getLevelForCount(newLevel);

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 8000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm">
      {showConfetti && <Confetti recycle={false} numberOfPieces={400} />}
      <div className="bg-card rounded-lg p-8 mx-6 max-w-sm w-full text-center shadow-card-hover animate-bounce-in">
        <p className="text-6xl mb-4">{newInfo.emoji}</p>
        <h2 className="text-display text-foreground mb-2">축하합니다!</h2>
        <p className="text-title text-muted-foreground mb-4">
          {oldInfo.emoji} → {newInfo.emoji}
        </p>
        <p className="text-body text-primary font-bold mb-6">
          {newInfo.name} 레벨에 도달했어요!
        </p>
        <PpuriButton fullWidth onClick={onClose}>
          계속하기
        </PpuriButton>
      </div>
    </div>
  );
};
