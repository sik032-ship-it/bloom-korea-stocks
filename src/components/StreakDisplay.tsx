interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
}

export const StreakDisplay = ({ currentStreak, longestStreak }: StreakDisplayProps) => {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <span className={`text-2xl ${currentStreak > 0 ? "animate-streak-pulse" : ""}`}>
          🔥
        </span>
        <div>
          <p className="text-title text-foreground">{currentStreak}</p>
          <p className="text-xs text-muted-foreground">연속 기록</p>
        </div>
      </div>
      <div className="w-px h-8 bg-border" />
      <div>
        <p className="text-title text-foreground">{longestStreak}</p>
        <p className="text-xs text-muted-foreground">최장 기록</p>
      </div>
    </div>
  );
};
