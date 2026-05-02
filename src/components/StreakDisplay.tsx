interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
}

export const StreakDisplay = ({ currentStreak, longestStreak }: StreakDisplayProps) => {
  // PX: 헤더는 정체성 보조. 큰 숫자가 CTA보다 시선을 빼앗지 않게 컴팩트 칩 형태로.
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60" aria-label={`현재 ${currentStreak}일 연속, 최장 ${longestStreak}일`}>
      <span className={`text-base leading-none ${currentStreak > 0 ? "animate-streak-pulse" : "opacity-60"}`}>🔥</span>
      <span className="text-small font-bold text-foreground tabular-nums leading-none">{currentStreak}</span>
      {longestStreak > 0 && (
        <span className="text-xs text-muted-foreground tabular-nums leading-none">/ {longestStreak}</span>
      )}
    </div>
  );
};
