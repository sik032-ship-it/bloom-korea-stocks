import { Mascot } from "@/components/Mascot";

const LEVELS = [
  { name: "씨앗", label: "Seed", min: 0 },
  { name: "새싹", label: "Sprout", min: 10 },
  { name: "줄기", label: "Stem", min: 30 },
  { name: "가지", label: "Branch", min: 70 },
  { name: "나무", label: "Tree", min: 150 },
  { name: "숲", label: "Forest", min: 300 },
];

export function getLevelInfo(totalSentences: number) {
  let current = LEVELS[0];
  let next = LEVELS[1];
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalSentences >= LEVELS[i].min) {
      current = LEVELS[i];
      next = LEVELS[i + 1] || null;
      break;
    }
  }
  const progress = next
    ? ((totalSentences - current.min) / (next.min - current.min)) * 100
    : 100;
  return { current, next, progress: Math.min(progress, 100), levelIndex: LEVELS.indexOf(current) };
}

interface LevelBadgeProps {
  totalSentences: number;
}

export const LevelBadge = ({ totalSentences }: LevelBadgeProps) => {
  const { current, next, progress, levelIndex } = getLevelInfo(totalSentences);

  return (
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center overflow-hidden animate-bounce-in">
        <Mascot level={levelIndex + 1} size="sm" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-small font-semibold text-foreground">
          {current.name} <span className="text-muted-foreground">Lv.{levelIndex + 1}</span>
        </p>
        <div className="h-2 bg-muted rounded-full overflow-hidden mt-1">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        {next && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {next.name}까지 {next.min - totalSentences}문장
          </p>
        )}
      </div>
    </div>
  );
};
