import { describe, expect, it } from "vitest";
import { allQuestions, getChosenQuizSet } from "@/data/quizQuestions";
import { philosophyBeginnerQuestions, philosophyIntermediateQuestions } from "@/data/quizPacks/philosophyFoundation";

const textOf = (question: (typeof allQuestions)[number]) =>
  question.format === "ox" ? question.statement : question.format === "multiple_choice" ? question.question : question.sentence;

describe("PPURI philosophy quiz guardrails", () => {
  const beginner = allQuestions.filter((question) => question.difficulty === "beginner");
  const intermediate = allQuestions.filter((question) => question.difficulty === "intermediate");
  const advanced = allQuestions.filter((question) => question.difficulty === "advanced");

  it("uses only the fully replaced foundation pools for beginner and intermediate", () => {
    expect(beginner).toEqual(philosophyBeginnerQuestions);
    expect(intermediate).toEqual(philosophyIntermediateQuestions);
    expect(beginner).toHaveLength(39);
    expect(intermediate).toHaveLength(39);
  });

  it.each(["beginner", "intermediate"] as const)("covers every training category at %s level", (difficulty) => {
    const levelQuestions = allQuestions.filter((question) => question.difficulty === difficulty);
    const counts = new Map<string, number>();
    levelQuestions.forEach((question) => counts.set(question.category, (counts.get(question.category) ?? 0) + 1));
    expect(counts.size).toBe(13);
    counts.forEach((count) => expect(count).toBe(3));
    expect(new Set(levelQuestions.map((question) => question.format))).toEqual(new Set(["ox", "multiple_choice", "fill_blank"]));
  });

  it("keeps advanced questions focused on practical long-term judgment", () => {
    const forbidden = /LTCM|MDD|상관관계|스태그플레이션|FOMC|점도표|수익률곡선|버핏 지표|재귀성|안티프래질|PCE|CDO|RSP/;
    expect(advanced.length).toBeGreaterThanOrEqual(20);
    advanced.forEach((question) => expect(textOf(question)).not.toMatch(forbidden));
  });

  it("removes jargon and macro trivia from every playable difficulty", () => {
    const forbidden = /ROIC|FCF|PER|value trap|가치 함정|CDO|CPI|PCE|FOMC|S&P|환율|금리|닷컴버블|금융위기|시스코|안티프래질|MDD|상관관계/i;
    allQuestions.forEach((question) => expect(textOf(question)).not.toMatch(forbidden));
  });

  it.each(["beginner", "intermediate", "advanced"] as const)("builds a balanced mixed set at %s level", (difficulty) => {
    localStorage.clear();
    const set = getChosenQuizSet(5, { category: null, difficulty }, `philosophy-${difficulty}`);
    expect(new Set(set.map((question) => question.category)).size).toBeGreaterThanOrEqual(4);
  });

  it("builds a balanced advanced set from distinct training tracks", () => {
    localStorage.clear();
    const set = getChosenQuizSet(5, { category: null, difficulty: "advanced" }, "philosophy-test-user");
    const categoryGroups = set.map((question) => question.category);
    expect(new Set(categoryGroups).size).toBeGreaterThanOrEqual(4);
  });
});