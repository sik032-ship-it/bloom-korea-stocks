// 동적 난이도 조정 — 사용자 정답률 + 스트릭 기반
// 듀오링고식: 잘하면 점진적으로 어려워지고, 못하면 자신감 회복하도록 쉬워짐
//
// 저장 위치: localStorage (DB 컬럼 추가 없이 빠르게 PX 검증)
// - ppuri.recentResults: 최근 30개 결과 [{correct: boolean, ts: number}]
// - daily-level boost는 매일 계산해서 적용

const STORAGE_KEY = "ppuri.recentResults";
const MAX_HISTORY = 30; // 최근 30문제로 정답률 산정

export interface QuizResult {
  correct: boolean;
  ts: number;
}

export function recordQuizResult(correct: boolean): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const history: QuizResult[] = raw ? JSON.parse(raw) : [];
    history.push({ correct, ts: Date.now() });
    // 최근 30개만 유지
    const trimmed = history.slice(-MAX_HISTORY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // localStorage 비활성/용량 초과 시 무시
  }
}

export function getRecentAccuracy(minSamples: number = 5): number | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const history: QuizResult[] = JSON.parse(raw);
    if (history.length < minSamples) return null;
    const correct = history.filter((r) => r.correct).length;
    return correct / history.length;
  } catch {
    return null;
  }
}

/**
 * 정답률 + 현재 스트릭 → 레벨 보정값(boost)
 *
 * 정답률 기반 (충분한 샘플이 쌓였을 때):
 *   ≥ 90%: +2 (매우 잘함, 더 어렵게)
 *   ≥ 75%: +1 (잘함, 살짝 어렵게)
 *   ≥ 50%: 0 (적정 난이도 유지)
 *   < 50%: -1 (어려움 — 자신감 회복)
 *   < 30%: -2 (좌절 위험 — 쉬운 것부터 다시)
 *
 * 스트릭 보너스: 7일 이상 +1, 30일 이상 +1 (최대 +2)
 *
 * 결과: -2 ~ +4 범위
 */
export function getDifficultyBoost(currentStreak: number = 0): number {
  let boost = 0;
  const accuracy = getRecentAccuracy(5);

  if (accuracy !== null) {
    if (accuracy >= 0.9) boost += 2;
    else if (accuracy >= 0.75) boost += 1;
    else if (accuracy < 0.3) boost -= 2;
    else if (accuracy < 0.5) boost -= 1;
  }

  // 꾸준함 보상 — 매일 쌓는 사용자에게 더 깊은 훈련 제공
  if (currentStreak >= 30) boost += 2;
  else if (currentStreak >= 7) boost += 1;

  // 안전 범위
  return Math.max(-2, Math.min(4, boost));
}

/**
 * 사용자에게 보여줄 난이도 라벨 (PX: 자신의 성장을 체감)
 */
export function getDifficultyLabel(boost: number): { label: string; color: string } {
  if (boost >= 3) return { label: "마스터 모드 🔥", color: "#D97706" };
  if (boost >= 1) return { label: "성장 모드 ⚡", color: "#10B981" };
  if (boost <= -1) return { label: "회복 모드 🌱", color: "#3B82F6" };
  return { label: "오늘의 훈련", color: "#58CC02" };
}
