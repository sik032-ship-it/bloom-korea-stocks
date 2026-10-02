import { describe, expect, it } from "vitest";
import { allQuestions, getChosenQuizSet } from "@/data/quizQuestions";

const textOf = (question: (typeof allQuestions)[number]) =>
  question.format === "ox" ? question.statement : question.format === "multiple_choice" ? question.question : question.sentence;

describe("PPURI philosophy quiz guardrails", () => {
  const advanced = allQuestions.filter((question) => question.difficulty === "advanced");

  it("keeps advanced questions focused on practical long-term judgment", () => {
    const forbidden = /LTCM|MDD|상관관계|스태그플레이션|FOMC|점도표|수익률곡선|버핏 지표|재귀성|안티프래질|PCE|CDO|RSP/;
    expect(advanced.length).toBeGreaterThanOrEqual(20);
    advanced.forEach((question) => expect(textOf(question)).not.toMatch(forbidden));
  });

  it("builds a balanced advanced set from distinct training tracks", () => {
    localStorage.clear();
    const set = getChosenQuizSet(5, { category: null, difficulty: "advanced" }, "philosophy-test-user");
    const categoryGroups = set.map((question) => question.category);
    expect(new Set(categoryGroups).size).toBeGreaterThanOrEqual(4);
  });
});