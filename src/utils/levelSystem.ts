export type LevelInfo = {
  level: number;
  name: string;
  emoji: string;
  threshold: number;
};

const LEVELS: LevelInfo[] = [
  { level: 1, name: "씨앗", emoji: "🌱", threshold: 0 },
  { level: 2, name: "새싹", emoji: "🌿", threshold: 10 },
  { level: 3, name: "줄기", emoji: "🌳", threshold: 30 },
  { level: 4, name: "가지", emoji: "🌲", threshold: 60 },
  { level: 5, name: "나무", emoji: "🏔", threshold: 100 },
  { level: 6, name: "숲", emoji: "🌍", threshold: 180 },
];

export function getLevelForCount(totalSentences: number): LevelInfo {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalSentences >= LEVELS[i].threshold) return LEVELS[i];
  }
  return LEVELS[0];
}

export function getProgressToNextLevel(totalSentences: number): {
  current: number;
  next: number;
  percent: number;
} {
  const currentLevel = getLevelForCount(totalSentences);
  const nextIdx = LEVELS.findIndex((l) => l.level === currentLevel.level) + 1;

  if (nextIdx >= LEVELS.length) {
    return { current: totalSentences, next: totalSentences, percent: 100 };
  }

  const nextLevel = LEVELS[nextIdx];
  const progress = totalSentences - currentLevel.threshold;
  const needed = nextLevel.threshold - currentLevel.threshold;
  return {
    current: progress,
    next: needed,
    percent: Math.min((progress / needed) * 100, 100),
  };
}

export function isLevelUp(oldCount: number, newCount: number): boolean {
  return getLevelForCount(oldCount).level < getLevelForCount(newCount).level;
}

export { LEVELS };
