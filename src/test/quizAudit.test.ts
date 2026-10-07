import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { allQuestions, getDailyQuizSet, questionKey, registerWeeklyQuestions, type QuizQuestion } from "@/data/quizQuestions";

const TRACKS: Record<string, string[]> = {
  기업이해: ["big4_basics", "brand_moat", "us_market"],
  돈이해: ["cash_flow", "risk"],
  오래머무르기: ["where_not_when", "strategy"],
  위기행동: ["crisis", "no_bottom_fishing"],
  거장지혜: ["legend_wisdom", "humility"],
  유혹거절: ["psychology", "judgment"],
};
const trackOf = (c: string) => Object.entries(TRACKS).find(([, cs]) => cs.includes(c))?.[0] ?? "기타";
const body = (q: QuizQuestion) => (q.format === "ox" ? q.statement : q.format === "multiple_choice" ? q.question : q.sentence);

function simulate(level: number, exp: string | null, days: number, count: number) {
  const served: string[][] = [];
  for (let d = 0; d < days; d++) {
    vi.setSystemTime(new Date(2026, 9, 5 + d, 12));
    served.push(getDailyQuizSet(count, level, exp, "sim-user").map(questionKey));
  }
  return served;
}

describe("퀴즈 UX 종합 점검", () => {
  beforeEach(() => { localStorage.clear(); vi.useFakeTimers(); });
  afterEach(() => vi.useRealTimers());

  const profiles: [string, number, string | null][] = [
    ["초보", 1, "완전 초보"], ["중수", 2, "조금 해봤어요"], ["고수", 3, "베테랑 투자자"],
  ];

  for (const [name, lvl, exp] of profiles) {
    for (const count of [3, 5, 7]) {
      it(`[중복] ${name} ${count}문제×14일 중복 0`, () => {
        const served = simulate(lvl, exp, 14, count);
        const flat = served.flat();
        const dup = flat.length - new Set(flat).size;
        served.forEach((s) => expect(new Set(s).size).toBe(s.length));
        console.log(`[중복] ${name} ${count}문제/일: 14일 ${flat.length}문항, 중복 ${dup}`);
        expect(dup).toBe(0);
      });
    }
  }

  it("[중복] 같은 날 재진입은 동일 세트", () => {
    vi.setSystemTime(new Date(2026, 9, 5, 9));
    const a = getDailyQuizSet(5, 1, "완전 초보", "u").map(questionKey);
    vi.setSystemTime(new Date(2026, 9, 5, 21));
    expect(getDailyQuizSet(5, 1, "완전 초보", "u").map(questionKey)).toEqual(a);
  });

  it("[중복] DB 이력(extraRecent)이 로컬 기록 없이도 제외된다", () => {
    vi.setSystemTime(new Date(2026, 9, 5, 12));
    const first = getDailyQuizSet(5, 1, "완전 초보", "u").map(questionKey);
    localStorage.clear();
    vi.setSystemTime(new Date(2026, 9, 6, 12));
    const next = getDailyQuizSet(5, 1, "완전 초보", "u", new Set(first)).map(questionKey);
    expect(next.filter((k) => first.includes(k))).toEqual([]);
  });

  it("[배분] 레벨별 난이도·트랙 비율", () => {
    for (const [name, lvl, exp] of profiles) {
      vi.setSystemTime(new Date(2026, 9, 5));
      localStorage.clear();
      const byKey = new Map(allQuestions.map((q) => [questionKey(q), q]));
      const qs = simulate(lvl, exp, 14, 5).flat().map((k) => byKey.get(k)!);
      const diff: Record<string, number> = {}; const track: Record<string, number> = {};
      qs.forEach((q) => { diff[q.difficulty] = (diff[q.difficulty] ?? 0) + 1; track[trackOf(q.category)] = (track[trackOf(q.category)] ?? 0) + 1; });
      console.log(`[배분] ${name}`, JSON.stringify(diff), JSON.stringify(track));
      const max = Math.max(...Object.values(track));
      expect(max / qs.length).toBeLessThan(0.4);
      expect(Object.keys(track).length).toBeGreaterThanOrEqual(5);
    }
  });

  it("[풀] 총 개수·카테고리·난이도 분포", () => {
    const cat: Record<string, number> = {}; const diff: Record<string, number> = {};
    allQuestions.forEach((q) => { cat[q.category] = (cat[q.category] ?? 0) + 1; diff[q.difficulty] = (diff[q.difficulty] ?? 0) + 1; });
    console.log(`[풀] 총 ${allQuestions.length}`, JSON.stringify(diff), JSON.stringify(cat));
    expect(new Set(allQuestions.map(questionKey)).size).toBe(allQuestions.length);
  });

  it("[정확도] 정답 구조 검증", () => {
    const bad: string[] = [];
    allQuestions.forEach((q) => {
      if (q.format === "multiple_choice" && (q.correctIndex < 0 || q.correctIndex >= q.options.length || new Set(q.options).size !== q.options.length)) bad.push(body(q));
      if (q.format === "fill_blank" && (!q.sentence.includes("___") || !q.answer?.trim())) bad.push(body(q));
      if (q.format === "ox" && typeof q.answer !== "boolean") bad.push(body(q));
      if (!q.explanation || q.explanation.length < 10) bad.push(body(q));
    });
    expect(bad).toEqual([]);
  });

  it("[법무] 확정적·권유 어조는 정답이 '틀림'인 문항 밖에 없다", () => {
    const risky = /무조건|반드시 (사|매수)|사야 한다|수익(을)? 보장|확실히 오른|100% 수익|원금 보장|지금 사세요/;
    const hits = allQuestions.filter((q) => {
      const text = `${body(q)} ${q.explanation} ${q.insight ?? ""} ${q.format === "multiple_choice" ? q.options[q.correctIndex] : ""}`;
      if (!risky.test(text)) return false;
      if (q.format === "ox" && q.answer === false && !risky.test(`${q.explanation} ${q.insight ?? ""}`)) return false;
      if (q.format === "multiple_choice" && !risky.test(`${q.question} ${q.options[q.correctIndex]} ${q.explanation} ${q.insight ?? ""}`)) return false;
      return true;
    });
    console.log("[법무] 플래그:", hits.map(body));
    expect(hits).toEqual([]);
  });

  it("[오탈자] 중복 공백·반복 조사·깨진 문자 없음", () => {
    const typo = /  |\.\.(?!\.)|을을|를를|이이다|\uFFFD|undefined|null/;
    const hits = allQuestions.filter((q) => typo.test(`${body(q)} ${q.explanation} ${q.insight ?? ""}`)).map(body);
    console.log("[오탈자] 플래그:", hits);
    expect(hits).toEqual([]);
  });

  it("[주간] 주간 문항이 하루 1개씩 레벨 난이도로 섞이고 중복 없음", () => {
    const cats = ["crisis", "psychology", "cash_flow", "humility", "brand_moat", "strategy"];
    registerWeeklyQuestions(cats.map((c, i) => ({ category: c, statement: `주간 테스트 문항 ${i}: 좋은 기업은 흔들려도 오래 보유한다`, answer: true, explanation: "주간 검수 문항 해설입니다.", insight: null })));
    for (const [name, lvl, exp] of profiles) {
      localStorage.clear();
      const days: QuizQuestion[][] = [];
      for (let d = 0; d < 7; d++) { vi.setSystemTime(new Date(2026, 9, 5 + d, 12)); days.push(getDailyQuizSet(5, lvl, exp, "w-" + name)); }
      const weeklyPerDay = days.map((s) => s.filter((q) => q.format === "ox" && q.statement.startsWith("주간 테스트")));
      const diffs = weeklyPerDay.flat().map((q) => q.difficulty);
      console.log(`[주간] ${name}: 일별 주간문항 수 ${weeklyPerDay.map((w) => w.length).join(",")} / 난이도 ${[...new Set(diffs)]}`);
      weeklyPerDay.slice(0, 6).forEach((w) => expect(w.length).toBe(1));
      const flat = days.flat().map(questionKey);
      expect(new Set(flat).size).toBe(flat.length);
    }
    registerWeeklyQuestions([]);
  });

  it("[퀘스트맵] 홈과 레슨이 주간 문항 포함 동일 세트를 계산한다(기기 캐시 없이도)", () => {
    registerWeeklyQuestions([{ category: "cash_flow", statement: "주간 테스트 동등성 문항", answer: false, explanation: "주간 검수 문항 해설입니다.", insight: null }]);
    vi.setSystemTime(new Date(2026, 9, 7, 13));
    const recent = new Set<string>();
    const lesson = getDailyQuizSet(3, 3, "완전 초보", "u-eq", recent).map(questionKey);
    localStorage.clear();
    const home = getDailyQuizSet(3, 3, "완전 초보", "u-eq", recent).map(questionKey);
    expect(home).toEqual(lesson);
    expect(lesson.some((k) => k.includes("주간 테스트 동등성"))).toBe(true);
    registerWeeklyQuestions([]);
  });
});
