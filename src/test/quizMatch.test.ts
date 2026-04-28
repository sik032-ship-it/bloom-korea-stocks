import { describe, it, expect } from "vitest";
import { isAnswerCorrect, normalizeAnswer } from "@/utils/quizMatch";

describe("normalizeAnswer", () => {
  it("strips whitespace and lowercases", () => {
    expect(normalizeAnswer("  Hello  ")).toBe("hello");
  });
  it("removes inner whitespace and punctuation", () => {
    expect(normalizeAnswer("리스크 관리")).toBe(normalizeAnswer("리스크관리"));
    expect(normalizeAnswer("안전-마진")).toBe(normalizeAnswer("안전 마진"));
  });
  it("strips trailing Korean particles", () => {
    expect(normalizeAnswer("시간이")).toBe(normalizeAnswer("시간"));
    expect(normalizeAnswer("돈을")).toBe(normalizeAnswer("돈"));
    expect(normalizeAnswer("리스크가")).toBe(normalizeAnswer("리스크"));
  });
});

describe("isAnswerCorrect (short answers)", () => {
  it("matches exact short Korean answer", () => {
    expect(isAnswerCorrect("시간", "시간", ["시간", "기간"])).toBe(true);
  });
  it("accepts trailing particles", () => {
    expect(isAnswerCorrect("시간이", "시간")).toBe(true);
    expect(isAnswerCorrect("  돈을 ", "돈")).toBe(true);
  });
  it("accepts hint synonyms", () => {
    expect(isAnswerCorrect("기간", "시간", ["시간", "기간"])).toBe(true);
  });
  it("rejects unrelated input", () => {
    expect(isAnswerCorrect("주식", "시간", ["시간"])).toBe(false);
  });
  it("rejects empty input", () => {
    expect(isAnswerCorrect("   ", "시간")).toBe(false);
  });
});

describe("isAnswerCorrect (long / multi-word answers)", () => {
  it("matches multi-word with or without spaces", () => {
    expect(isAnswerCorrect("리스크 관리", "리스크 관리", ["위험 관리"])).toBe(true);
    expect(isAnswerCorrect("리스크관리", "리스크 관리")).toBe(true);
    expect(isAnswerCorrect(" 리스크-관리 ", "리스크 관리")).toBe(true);
  });
  it("matches '안전 마진' variants", () => {
    expect(isAnswerCorrect("안전마진", "안전 마진", ["안전마진"])).toBe(true);
    expect(isAnswerCorrect("안전 마진!", "안전 마진")).toBe(true);
  });
  it("matches sentence answers via hints", () => {
    expect(isAnswerCorrect("많이 벌고", "많이 버느냐", ["많이 버느냐", "많이 벌고"])).toBe(true);
  });
});
