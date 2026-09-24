// 개인 맞춤 약점 코칭 — 오래 쓸수록 정확해지는 "나만의 약점 지도"
// 복제 앱은 코드를 베낄 수 있어도, 사용자가 쌓은 풀이 기록은 가져갈 수 없다.
import { supabase } from "@/integrations/supabase/client";
import { allQuestions, questionKey, categoryLabels } from "@/data/quizQuestions";
import type { QuizCategory, QuizQuestion } from "@/data/quizTypes";
import { dailySeed, seededRandom, seededShuffle, todayKey } from "@/utils/dailySeed";

export interface CoachAttempt {
  question_key: string;
  category: string | null;
  is_correct: boolean;
  day: string;
}

export interface CategoryStat {
  category: QuizCategory;
  attempts: number;
  correct: number;
  accuracy: number; // 0~1, 베이지안 보정(표본 적을 때 과장 방지)
  recentAccuracy: number | null; // 최근 7일
  prevAccuracy: number | null; // 그 이전
}

export interface WeaknessProfile {
  totalAttempts: number;
  weakest: CategoryStat[]; // 최대 3개
  strongest: CategoryStat | null;
  reviewKeys: string[]; // 마지막 풀이가 오답 & 오늘 이전 → 복습 대상
  masteredKeys: number; // 틀렸다가 다시 맞힌 문항 수
  stats: CategoryStat[];
  ready: boolean; // 코칭에 충분한 데이터(5문제 이상)
}

const byKey = new Map<string, QuizQuestion>(allQuestions.map((q) => [questionKey(q), q]));
const PRIOR = 2; // 표본이 적을 때 60%로 끌어당김
const PRIOR_ACC = 0.6;

export async function fetchCoachAttempts(userId: string): Promise<CoachAttempt[]> {
  const since = new Date(Date.now() - 120 * 86400000).toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("quiz_attempts")
    .select("question_key, category, is_correct, day, created_at")
    .eq("user_id", userId)
    .gte("day", since)
    .order("created_at", { ascending: true })
    .limit(2000);
  if (error) return [];
  return (data ?? []) as CoachAttempt[];
}

export function buildWeaknessProfile(attempts: CoachAttempt[]): WeaknessProfile {
  const today = todayKey();
  const weekAgo = todayKey(new Date(Date.now() - 7 * 86400000));
  const agg = new Map<string, { a: number; c: number; ra: number; rc: number; pa: number; pc: number }>();
  const last = new Map<string, { ok: boolean; day: string; everWrong: boolean }>();

  for (const r of attempts) {
    if (r.category && r.category in categoryLabels) {
      const s = agg.get(r.category) ?? { a: 0, c: 0, ra: 0, rc: 0, pa: 0, pc: 0 };
      s.a++; if (r.is_correct) s.c++;
      if (r.day >= weekAgo) { s.ra++; if (r.is_correct) s.rc++; } else { s.pa++; if (r.is_correct) s.pc++; }
      agg.set(r.category, s);
    }
    const prev = last.get(r.question_key);
    last.set(r.question_key, { ok: r.is_correct, day: r.day, everWrong: (prev?.everWrong ?? false) || !r.is_correct });
  }

  const stats: CategoryStat[] = [...agg.entries()].map(([cat, s]) => ({
    category: cat as QuizCategory,
    attempts: s.a,
    correct: s.c,
    accuracy: (s.c + PRIOR * PRIOR_ACC) / (s.a + PRIOR),
    recentAccuracy: s.ra ? s.rc / s.ra : null,
    prevAccuracy: s.pa ? s.pc / s.pa : null,
  }));

  const eligible = stats.filter((s) => s.attempts >= 2).sort((a, b) => a.accuracy - b.accuracy);
  const weakest = eligible.filter((s) => s.accuracy < 0.8).slice(0, 3);
  const strongest = [...eligible].sort((a, b) => b.accuracy - a.accuracy)[0] ?? null;

  const reviewKeys: string[] = [];
  let masteredKeys = 0;
  last.forEach((v, k) => {
    if (!v.ok && v.day < today && byKey.has(k)) reviewKeys.push(k);
    if (v.ok && v.everWrong) masteredKeys++;
  });

  return {
    totalAttempts: attempts.length,
    weakest,
    strongest: strongest && strongest.accuracy >= 0.7 ? strongest : null,
    reviewKeys,
    masteredKeys,
    stats,
    ready: attempts.length >= 5,
  };
}

/** 약점 집중 세트: 오답 재출제(최대 40%) + 약한 주제 새 문제 + 부족하면 전체 보충 */
export function getCoachQuizSet(count: number, profile: WeaknessProfile, userId?: string | null, recent?: Set<string>): QuizQuestion[] {
  const rand = seededRandom(dailySeed(userId) ^ 0x5eed);
  const picked: QuizQuestion[] = [];
  const used = new Set<string>();
  const add = (q: QuizQuestion) => { const k = questionKey(q); if (!used.has(k)) { used.add(k); picked.push(q); } };

  const reviewQs = seededShuffle(profile.reviewKeys.map((k) => byKey.get(k)!).filter(Boolean), rand);
  reviewQs.slice(0, Math.max(1, Math.round(count * 0.4))).forEach(add);

  const weakCats = new Set(profile.weakest.map((w) => w.category));
  const weakPool = seededShuffle(allQuestions.filter((q) => weakCats.has(q.category)), rand);
  const fresh = weakPool.filter((q) => !recent?.has(questionKey(q)));
  for (const q of [...fresh, ...weakPool]) { if (picked.length >= count) break; add(q); }

  if (picked.length < count) {
    for (const q of seededShuffle(allQuestions, rand)) { if (picked.length >= count) break; add(q); }
  }
  return seededShuffle(picked.slice(0, count), rand);
}

export function coachLine(p: WeaknessProfile): string {
  if (!p.ready) return `${5 - p.totalAttempts > 0 ? 5 - p.totalAttempts : 1}문제만 더 풀면 나만의 약점 지도가 열려요.`;
  const w = p.weakest[0];
  if (!w) return "지금은 뚜렷한 약점이 없어요. 이 감각을 10년 동안 지켜가요.";
  const name = categoryLabels[w.category].name;
  if (w.recentAccuracy !== null && w.prevAccuracy !== null && w.recentAccuracy > w.prevAccuracy + 0.1)
    return `'${name}'이 좋아지고 있어요. 조금만 더 다지면 내 무기가 돼요.`;
  return `'${name}'에서 자주 흔들려요. 버핏도 모르는 걸 인정하는 데서 시작했어요.`;
}
